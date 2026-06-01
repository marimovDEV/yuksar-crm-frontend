import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  ShoppingBag, 
  Clock, 
  ChevronRight,
  Filter,
  ArrowDownToLine,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  X,
  PlusCircle,
  Trash2,
  PackageCheck,
  TrendingUp,
  CreditCard,
  Download
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { PurchaseOrder, Supplier, Material } from '../types';

export default function PurchaseOrders() {
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('procurement/orders/');
      setOrders(res.data.results || res.data);
    } catch (err) {
      uiStore.showNotification("Ma'mulotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: number, action: string) => {
    try {
      await api.post(`procurement/orders/${id}/${action}/`);
      uiStore.showNotification(t("Status muvaffaqiyatli yangilandi"), "success");
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Xatolik yuz berdi"), "error");
    }
  };

  const filtered = orders.filter(o => 
    (o.po_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-50 text-slate-400 border-slate-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'APPROVED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ORDERED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'IN_TRANSIT': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'RECEIVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const stats = [
    { label: t('Jami Buyurtmalar'), value: orders.length, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t('Yo\'lda'), value: orders.filter(o => o.status === 'IN_TRANSIT').length, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('Kutilmoqda'), value: orders.filter(o => o.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('Jami Xarajatlar'), value: orders.reduce((acc, o) => acc + Number(o.total_amount), 0).toLocaleString() + ' UZS', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
             <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
               <ShoppingBag className="w-10 h-10" />
             </div>
             {t('Xarid Buyurtmalari')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Materiallar va xom ashyo uchun buyurtmalar nazorati')}</p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all group"
        >
          <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span>{t('Yangi Xarid')}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
           <div className="relative group w-full max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-all" />
              <input 
                type="text" 
                placeholder={t('PO Nomer yoki Ta\'minotchi bo\'yicha...')} 
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[22px] outline-none focus:border-indigo-500 transition-all text-sm font-bold shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <button onClick={() => uiStore.showNotification(t("Filtrlar menyusi ochilmoqda..."), "info")} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                 <Filter className="w-6 h-6" />
              </button>
              <button onClick={() => window.print()} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                 <Download className="w-6 h-6" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Buyurtma #')}</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Ta\'minotchi')}</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Status')}</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Summa')}</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Sana')}</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amallar')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-indigo-50/20 transition-all group cursor-pointer">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-black text-slate-900 tracking-wider">#{o.po_number}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{o.items?.length || 0} {t('pozitsiya')}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-400" />
                       </div>
                       <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{o.supplier_name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(o.status)}`}>
                      {t(`status.${o.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right text-sm font-black text-slate-900">
                    {Number(o.total_amount).toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">{o.currency}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{new Date(o.created_at).toLocaleDateString(locale)}</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(o.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="flex items-center justify-end gap-3">
                        {o.status === 'IN_TRANSIT' && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'receive'); }}
                             className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                           >
                             {t('Qabul qilish')}
                           </button>
                        )}
                        {o.status === 'APPROVED' && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'order'); }}
                             className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                           >
                             {t('Buyurtma berish')}
                           </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); uiStore.showNotification(t("Xarid tafsilotlari tez kunda"), "info"); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all">
                           <ChevronRight className="w-5 h-5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                   <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-slate-200" />
                         </div>
                         <p className="text-slate-300 font-black uppercase tracking-widest italic">{t('Xaridlar topilmadi')}</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Creation Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <PurchaseOrderModal 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={() => { fetchData(); setIsModalOpen(false); }}
              t={t}
            />
         )}
      </AnimatePresence>
    </div>
  );
}

function PurchaseOrderModal({ onClose, onSuccess, t }: { onClose: () => void, onSuccess: () => void, t: any }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [items, setItems] = useState<{ material: number, quantity: number, price: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('suppliers/').then(res => setSuppliers(res.data.results || res.data));
    api.get('materials/').then(res => setMaterials(res.data.results || res.data));
  }, []);

  const addItem = () => {
    setItems([...items, { material: 0, quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0) return;
    
    setLoading(true);
    try {
      const payload = {
        supplier: selectedSupplier,
        notes,
        items: items.map(item => ({
          material: item.material,
          quantity: item.quantity,
          price_per_unit: item.price
        }))
      };
      await api.post('procurement/orders/', payload);
      uiStore.showNotification("Xarid buyurtmasi yaratildi", "success");
      onSuccess();
    } catch (err) {
      uiStore.showNotification("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 30 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: 30 }}
         className="bg-white w-full max-w-4xl rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
       >
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                   <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900">{t('Yangi Xarid Buyurtmasi')}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Materiallar xaridi uchun rasmiy so\'rov')}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
                <X className="w-6 h-6" />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Ta\'minotchini Tanlang')}</label>
                   <select 
                     required
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm appearance-none"
                     value={selectedSupplier}
                     onChange={e => setSelectedSupplier(e.target.value)}
                   >
                     <option value="">{t('Tanlang...')}</option>
                     {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.material_type})</option>)}
                   </select>
                </div>
                <div className="p-6 bg-indigo-50 rounded-[28px] border border-indigo-100 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">{t('Umumiy Summa')}</p>
                      <p className="text-2xl font-black text-indigo-900">{totalAmount.toLocaleString()} <span className="text-xs">UZS</span></p>
                   </div>
                   <CreditCard className="w-8 h-8 text-indigo-200" />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('Materiallar Ro\'yxati')}</h4>
                   <button 
                     type="button" 
                     onClick={addItem}
                     className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-700"
                   >
                     <PlusCircle className="w-4 h-4" />
                     {t('Pozitsiya Qo\'shish')}
                   </button>
                </div>

                <div className="space-y-3">
                   {items.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-12 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-[24px] items-center"
                      >
                         <div className="col-span-5">
                            <select 
                               required
                               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs"
                               value={item.material}
                               onChange={e => updateItem(index, 'material', e.target.value)}
                            >
                               <option value="0">{t('Material tanlang...')}</option>
                               {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                            </select>
                         </div>
                         <div className="col-span-2">
                            <input 
                               type="number" 
                               required
                               placeholder={t('Miqdor')}
                               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs"
                               value={item.quantity}
                               onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                            />
                         </div>
                         <div className="col-span-3">
                            <input 
                               type="number" 
                               required
                               placeholder={t('Narx (1 dona)')}
                               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs"
                               value={item.price}
                               onChange={e => updateItem(index, 'price', Number(e.target.value))}
                            />
                         </div>
                         <div className="col-span-2 flex justify-end">
                            <button 
                               type="button" 
                               onClick={() => removeItem(index)}
                               className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                   ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Izohlar')}</label>
                <textarea 
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:border-indigo-500 transition-all font-bold text-sm min-h-[100px]"
                   value={notes}
                   onChange={e => setNotes(e.target.value)}
                   placeholder={t('Xarid uchun qo\'shimcha talablar...')}
                />
             </div>

             <div className="flex gap-6 pt-6">
                <button type="button" onClick={onClose} className="flex-1 py-5 border border-slate-200 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                <button 
                  type="submit" 
                  disabled={loading || items.length === 0}
                  className="flex-2 px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                   {loading ? t('Yuborilmoqda...') : t('Buyurtmani Yaratish')}
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}
