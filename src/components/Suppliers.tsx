import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  User as UserIcon,
  X,
  PlusCircle,
  MoreVertical,
  Activity,
  Star,
  MapPin,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Package,
  Layers,
  ArrowUpRight,
  ShoppingBag
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Supplier, PurchaseOrder } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Suppliers() {
  const { t, locale } = useI18n();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ 
    name: '', 
    contact_info: '',
    inn: '',
    manager_name: '',
    address: '',
    material_type: '',
    contract_number: '',
    contract_expiry: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('suppliers/');
      setSuppliers(res.data.results || res.data);
    } catch (err) {
      uiStore.showNotification("Ta'minotchilarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    setLoading(true);
    try {
      if (isEditing && selectedSupplier) {
        await api.put(`suppliers/${selectedSupplier.id}/`, newSupplier);
        uiStore.showNotification("Ta'minotchi muvaffaqiyatli tahrirlandi", "success");
      } else {
        await api.post('suppliers/', newSupplier);
        uiStore.showNotification("Ta'minotchi muvaffaqiyatli qo'shildi", "success");
      }
      setIsModalOpen(false);
      setNewSupplier({ 
        name: '', 
        contact_info: '',
        inn: '',
        manager_name: '',
        address: '',
        material_type: '',
        contract_number: '',
        contract_expiry: ''
      });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      uiStore.showNotification("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditing(true);
    setNewSupplier({
      name: supplier.name || '',
      contact_info: supplier.contact_info || '',
      inn: supplier.inn || '',
      manager_name: supplier.manager_name || '',
      address: supplier.address || '',
      material_type: supplier.material_type || '',
      contract_number: supplier.contract_number || '',
      contract_expiry: supplier.contract_expiry || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatan ham bu ta'minotchini o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`suppliers/${id}/`);
      uiStore.showNotification("Ta'minotchi muvaffaqiyatli o'chirildi", "success");
      fetchData();
    } catch (err) {
      uiStore.showNotification("Ta'minotchini o'chirishda xatolik yuz berdi", "error");
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.inn || '').includes(searchTerm) ||
    (s.material_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: t('Jami Ta\'minotchilar'), value: suppliers.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('Aktiv Shartnomalar'), value: suppliers.filter(s => s.status === 'ACTIVE').length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('Umumiy Qarzdorlik'), value: suppliers.reduce((acc, s) => acc + Number(s.total_debt), 0).toLocaleString() + ' UZS', icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: t('O\'rtacha Reyting'), value: (suppliers.reduce((acc, s) => acc + Number(s.rating), 0) / (suppliers.length || 1)).toFixed(1), icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
               <Building2 className="w-10 h-10" />
            </div>
            {t('Ta\'minot & Xarid')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Zavod xom-ashyo ta\'minoti va kontragentlar boshqaruvi')}</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => {
               setIsEditing(false);
               setNewSupplier({
                 name: '', contact_info: '', inn: '', manager_name: '', address: '', material_type: '', contract_number: '', contract_expiry: ''
               });
               setIsModalOpen(true);
             }}
             className="bg-blue-600 text-white px-8 py-4 rounded-[22px] font-black flex items-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all group"
          >
             <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
             <span>{t('Yangi Ta\'minotchi')}</span>
          </button>
        </div>
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

      {/* Main Table Container */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20">
           <div className="relative group w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-all" />
              <input 
                type="text" 
                placeholder={t('Nomi, INN yoki material turi bo\'yicha...')} 
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                 <Activity className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kompaniya')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Material Turi')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Reyting')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Qarz (UZS)')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Status')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amallar')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSuppliers.map(s => (
                <tr 
                  key={s.id} 
                  onClick={() => { setSelectedSupplier(s); setIsDetailOpen(true); }}
                  className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center text-slate-900 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {s.name?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">{s.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">INN: {s.inn || '—'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{s.material_type || t('Boshqa')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-1.5">
                       <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                       <span className="text-sm font-black text-slate-900">{s.rating}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 text-sm">
                    {Number(s.total_debt).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-center">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                       s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                     }`}>
                        {t(s.status)}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); startEdit(s); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                       <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                       <ChevronRight className="w-5 h-5 text-slate-300 ml-2" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && !loading && (
                 <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                             <Search className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className="text-slate-300 font-black uppercase tracking-widest italic">{t('Ta\'minotchilar topilmadi')}</p>
                       </div>
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
         {isDetailOpen && selectedSupplier && (
            <SupplierDetailDrawer 
              supplier={selectedSupplier} 
              onClose={() => setIsDetailOpen(false)} 
              t={t}
              locale={locale}
            />
         )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 30 }}
               className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
               <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                       <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{t('Yangi Ta\'minotchi')}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kontragentni ro\'yxatga olish')}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <form onSubmit={handleCreate} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kompaniya Nomi')}</label>
                       <input 
                         required
                         type="text" 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-blue-500 transition-all font-bold text-sm"
                         value={newSupplier.name}
                         onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                         placeholder="Global Chemicals LLC"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('INN / STIR')}</label>
                       <input 
                         type="text" 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-blue-500 transition-all font-bold text-sm"
                         value={newSupplier.inn}
                         onChange={e => setNewSupplier({...newSupplier, inn: e.target.value})}
                         placeholder="123456789"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mas\'ul Menajer')}</label>
                       <input 
                         type="text" 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-blue-500 transition-all font-bold text-sm"
                         value={newSupplier.manager_name}
                         onChange={e => setNewSupplier({...newSupplier, manager_name: e.target.value})}
                         placeholder="Azizov Alisher"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Material Turi')}</label>
                       <select 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-blue-500 transition-all font-bold text-sm appearance-none"
                         value={newSupplier.material_type}
                         onChange={e => setNewSupplier({...newSupplier, material_type: e.target.value})}
                       >
                         <option value="">{t('Tanlang...')}</option>
                         <option value="Granula">Granula</option>
                         <option value="Gaz">Gaz</option>
                         <option value="Kimyo">Kimyo</option>
                         <option value="Qadoqlash">Qadoqlash</option>
                         <option value="Ehtiyot Qismlar">Ehtiyot Qismlar</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kontakt Ma\'lumotlari')}</label>
                     <textarea 
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:border-blue-500 transition-all font-bold text-sm min-h-[100px]"
                       value={newSupplier.contact_info}
                       onChange={e => setNewSupplier({...newSupplier, contact_info: e.target.value})}
                       placeholder="+998 90 123 45 67, info@example.com"
                     />
                  </div>

                  <div className="flex gap-6 pt-6">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 border border-slate-200 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                     <button type="submit" disabled={loading} className="flex-2 px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50">
                        {loading ? t('Yaratilmoqda...') : t('Ta\'minotchini Qo\'shish')}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupplierDetailDrawer({ supplier, onClose, t, locale }: { supplier: Supplier, onClose: () => void, t: any, locale: string }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'analytics' | 'docs'>('profile');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    // Fetch orders for this supplier
    api.get(`procurement/orders/?supplier=${supplier.id}`).then(res => setOrders(res.data.results || res.data));
  }, [supplier.id]);

  const mockChartData = [
    { name: 'Jan', price: 12000 },
    { name: 'Feb', price: 11800 },
    { name: 'Mar', price: 12500 },
    { name: 'Apr', price: 12200 },
    { name: 'May', price: 12100 },
    { name: 'Jun', price: 12600 },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         onClick={onClose}
         className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
       />
       <motion.div 
         initial={{ x: '100%' }}
         animate={{ x: 0 }}
         exit={{ x: '100%' }}
         transition={{ type: 'spring', damping: 25, stiffness: 200 }}
         className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
       >
          {/* Header */}
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-100">
                   {supplier.name?.charAt(0)}
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{supplier.name}</h2>
                   <div className="flex items-center gap-4 mt-1">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-full tracking-widest">{supplier.material_type || t('Ta\'minotchi')}</span>
                      <div className="flex items-center gap-1">
                         <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                         <span className="text-xs font-black text-slate-900">{supplier.rating}</span>
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 shadow-sm">
                <X className="w-6 h-6" />
             </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-50 px-10 bg-white">
             {[
               { id: 'profile', name: t('Profil'), icon: UserIcon },
               { id: 'orders', name: t('Orderlar'), icon: ShoppingBag },
               { id: 'analytics', name: t('Analitika'), icon: TrendingUp },
               { id: 'docs', name: t('Hujjatlar'), icon: FileText },
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-6 border-b-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                   activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                 }`}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.name}
               </button>
             ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
             {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-3 h-3" /> {t('Manzil')}</p>
                         <p className="text-sm font-black text-slate-900 leading-relaxed">{supplier.address || t('Kiritilmagan')}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Phone className="w-3 h-3" /> {t('Kontakt')}</p>
                         <p className="text-sm font-black text-slate-900 leading-relaxed">{supplier.contact_info}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-4">
                      <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('Menajer')}</p>
                         <p className="text-sm font-black text-slate-900">{supplier.manager_name || '—'}</p>
                      </div>
                      <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('Shartnoma')}</p>
                         <p className="text-sm font-black text-slate-900">{supplier.contract_number || '—'}</p>
                      </div>
                      <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('INN')}</p>
                         <p className="text-sm font-black text-slate-900">{supplier.inn || '—'}</p>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'orders' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                   {orders.map(order => (
                      <div key={order.id} className="p-6 bg-white border border-slate-100 rounded-[32px] hover:border-blue-200 transition-all group shadow-sm">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-slate-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <FileText className="w-5 h-5" />
                                </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900">#{order.po_number}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.created_at).toLocaleDateString(locale)}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-slate-900">{Number(order.total_amount).toLocaleString()} UZS</p>
                               <span className={`text-[8px] font-black uppercase tracking-widest ${
                                 order.status === 'RECEIVED' ? 'text-emerald-500' : 'text-amber-500'
                               }`}>{t(order.status)}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                   {orders.length === 0 && (
                      <div className="py-20 text-center">
                         <ShoppingBag className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                         <p className="text-slate-300 font-black uppercase tracking-widest italic">{t('Hali buyurtmalar mavjud emas')}</p>
                      </div>
                   )}
                </div>
             )}

             {activeTab === 'analytics' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                      <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" /> {t('Narx Dinamikasi (Oxirgi 6 oy)')}</h4>
                      <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                               <defs>
                                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                               <YAxis hide />
                               <Tooltip 
                                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900}}
                                  labelStyle={{color: '#94a3b8'}}
                               />
                               <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100">
                         <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">{t('Muvaffaqiyatli Yetkazish')}</p>
                         <p className="text-2xl font-black text-emerald-900">98.4%</p>
                      </div>
                      <div className="p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                         <p className="text-[10px] font-black text-rose-600 uppercase mb-1">{t('Brak Ko\'rsatkichi')}</p>
                         <p className="text-2xl font-black text-rose-900">0.2%</p>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-10 border-t border-slate-50 bg-slate-50/20 flex gap-4">
             <button onClick={() => alert("Bu funksiya tez kunda ishga tushadi")}  className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-black transition-all">
                <ShoppingBag className="w-5 h-5" />
                {t('Yangi Buyurtma')}
             </button>
             <button onClick={() => alert("Bu funksiya tez kunda ishga tushadi")}  className="p-5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all">
                <Edit3 className="w-6 h-6" />
             </button>
          </div>
       </motion.div>
    </div>
  );
}
