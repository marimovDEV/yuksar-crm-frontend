import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Tag, 
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpenseCategory } from '../../types';
import { useI18n } from '../../i18n';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';

interface CategoryManagerProps {
  categories: ExpenseCategory[];
  onRefresh: () => void;
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<Set<number | string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', parent: null as number | string | null, type: 'EXPENSE' });

  const toggleExpand = (id: number | string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const handleAdd = async () => {
    if (!newCat.name) return;
    try {
      await api.post('finance/categories/', newCat);
      uiStore.showNotification(t("Kategoriya qo'shildi"), "success");
      setIsAdding(false);
      setNewCat({ name: '', parent: null, type: 'EXPENSE' });
      onRefresh();
    } catch (err) {
      uiStore.showNotification(t("Xatolik"), "error");
    }
  };

  const renderCategory = (cat: ExpenseCategory, depth = 0) => {
    const isExpanded = expanded.has(cat.id);
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <div key={cat.id} className="select-none">
        <div 
          className={`flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group ${depth > 0 ? 'ml-8' : ''}`}
        >
          <div className="flex items-center gap-3">
             <div className="flex items-center justify-center w-6 h-6">
                {hasChildren ? (
                   <button onClick={() => toggleExpand(cat.id)}>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                   </button>
                ) : (
                   <div className="w-1 h-1 rounded-full bg-slate-200" />
                )}
             </div>
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                <Tag className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-sm font-black text-slate-900">{cat.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.type === 'INCOME' ? t('Kirim') : t('Xarajat')}</p>
             </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={() => {
                 setNewCat({ ...newCat, parent: cat.id, type: cat.type });
                 setIsAdding(true);
               }}
               className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
             >
                <Plus className="w-4 h-4" />
             </button>
             <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                <Edit3 className="w-4 h-4" />
             </button>
             <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-1 border-l-2 border-slate-50">
             {cat.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       {/* Category Tree */}
       <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                   <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t('Kategoriya Ierarxiyasi')}</h3>
             </div>
             <div className="flex gap-2">
                <button onClick={() => {
                   setNewCat({ name: '', parent: null, type: 'INCOME' });
                   setIsAdding(true);
                }} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all">{t('Kirim +')}</button>
                <button onClick={() => {
                   setNewCat({ name: '', parent: null, type: 'EXPENSE' });
                   setIsAdding(true);
                }} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all">{t('Xarajat +')}</button>
             </div>
          </div>

          <div className="relative mb-6">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder={t('Kategoriyalarni qidirish...')} 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold text-sm"
             />
          </div>

          <div className="space-y-2">
             {categories.filter(c => !c.parent).map(cat => renderCategory(cat))}
             {categories.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-black uppercase tracking-[0.2em]">{t('Kategoriyalar mavjud emas')}</div>
             )}
          </div>
       </div>

       {/* Form / Sidebar */}
       <div className="space-y-6">
          <AnimatePresence>
             {isAdding && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-6"
                >
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Yangi Kategoriya')}</h4>
                      <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('Nomi')}</label>
                         <input 
                           autoFocus
                           value={newCat.name}
                           onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                           className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all mt-2"
                           placeholder={t('Masalan: Xomashyo')}
                         />
                      </div>
                      
                      <div>
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t('Ota Kategoriya')}</label>
                         <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-white/80">{newCat.parent ? categories.find(c => c.id === newCat.parent)?.name : t('Asosiy')}</span>
                            <ArrowRight className="w-4 h-4 text-white/20" />
                         </div>
                      </div>

                      <button 
                        onClick={handleAdd}
                        className="w-full py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                      >
                         {t('Saqlash')}
                      </button>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>

          <div className="bg-blue-600 rounded-[40px] p-10 text-white shadow-premium relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
             <div className="relative z-10 space-y-4">
                <Folder className="w-10 h-10 text-blue-200" />
                <h3 className="text-xl font-black tracking-tight">{t('Analitika chuqurligi')}</h3>
                <p className="text-sm font-medium text-blue-100 leading-relaxed opacity-80">
                   {t("Hierarxiya orqali xarajatlarni 3-darajagacha maydalab tahlil qilish mumkin. Bu sizga eng ko'p mablag' qayerga ketayotganini aniq ko'rsatadi.")}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
