import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  CreditCard, 
  Building2, 
  Tag, 
  MessageSquare,
  Calendar,
  Paperclip,
  User,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Cashbox, ExpenseCategory, User as UserType } from '../../types';
import { useI18n } from '../../i18n';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cashboxes: Cashbox[];
  categories: ExpenseCategory[];
  customers: any[];
  user: UserType;
}

export default function TransactionDrawer({ 
  isOpen, 
  onClose, 
  onSuccess, 
  cashboxes, 
  categories, 
  customers,
  user 
}: TransactionDrawerProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  
  const [formData, setFormData] = useState({
    cashbox: '',
    amount: '',
    department: 'OTHER',
    category: '',
    customer: '',
    source_order: '',
    source_purchase: '',
    description: '',
    due_date: '',
    status: 'APPROVED',
  });
  const [attachment, setAttachment] = useState<File | null>(null);


  const [orders, setOrders] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch orders and purchases for linking
      const fetchSources = async () => {
        try {
          const [ordersRes, purchasesRes] = await Promise.all([
            api.get('sales/orders/'),
            api.get('warehouse/purchase-orders/')
          ]);
          setOrders(ordersRes.data.results || ordersRes.data);
          setPurchases(purchasesRes.data.results || purchasesRes.data);
        } catch (err) {
          console.error("Failed to fetch sources", err);
        }
      };
      fetchSources();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      data.append('type', type);
      if (attachment) data.append('attachment', attachment);

      await api.post('finance/transactions/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      uiStore.showNotification(t("Muvaffaqiyatli saqlandi"), "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      uiStore.showNotification(t(err.response?.data?.detail || "Xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[90] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${type === 'INCOME' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                   {type === 'INCOME' ? <TrendingUp className="w-7 h-7 text-white" /> : <TrendingDown className="w-7 h-7 text-white" />}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Moliya Amali')}</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('Yangi operatsiya kiritish')}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
               {/* Type Selector */}
               <div className="flex bg-slate-100 p-1.5 rounded-[24px] gap-1">
                  <button 
                    type="button" 
                    onClick={() => setType('INCOME')}
                    className={`flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t('Kirim')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType('EXPENSE')}
                    className={`flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    {t('Chiqim')}
                  </button>
               </div>

               <div className="space-y-6">
                  {/* Amount Section */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Operatsiya Summasi')}</label>
                    <div className="relative group">
                       <Banknote className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-500 transition-all" />
                       <input 
                         required
                         type="number"
                         placeholder="0.00"
                         value={formData.amount}
                         onChange={(e) => setFormData({...formData, amount: e.target.value})}
                         className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-2xl font-black text-slate-900 placeholder:text-slate-200 shadow-inner"
                       />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase tracking-widest text-xs">UZS</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kassa / Hisob')}</label>
                        <div className="relative">
                           <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                           <select 
                             required
                             value={formData.cashbox}
                             onChange={(e) => setFormData({...formData, cashbox: e.target.value})}
                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                           >
                             <option value="">{t('Tanlang...')}</option>
                             {cashboxes.map(cb => (
                               <option key={cb.id} value={cb.id}>{cb.name} ({cb.balance.toLocaleString()} UZS)</option>
                             ))}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Bo\'lim')}</label>
                        <div className="relative">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                           <select 
                             value={formData.department}
                             onChange={(e) => setFormData({...formData, department: e.target.value})}
                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                           >
                             <option value="ADMIN">{t('Ma\'muriyat')}</option>
                             <option value="PRODUCTION">{t('Ishlab chiqarish')}</option>
                             <option value="LOGISTICS">{t('Logistika')}</option>
                             <option value="SALES">{t('Sotuv')}</option>
                             <option value="OTHER">{t('Boshqa')}</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kategoriya (Tree Selector)')}</label>
                     <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                        >
                          <option value="">{t('Kategoriyani tanlang')}</option>
                          {categories.filter(c => !c.parent).map(cat => (
                            <optgroup key={cat.id} label={cat.name}>
                               <option value={cat.id}>{cat.name}</option>
                               {cat.children?.map((child: any) => (
                                 <option key={child.id} value={child.id}>&nbsp;&nbsp;{child.name}</option>
                               ))}
                            </optgroup>
                          ))}
                        </select>
                     </div>
                  </div>

                  <div className="h-px bg-slate-100 my-8" />

                  {/* Sources & Linking */}
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('Manba va Integratsiya')}</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mijoz / Hamkor')}</label>
                           <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <select 
                                value={formData.customer}
                                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                              >
                                <option value="">{t('Ixtiyoriy...')}</option>
                                {customers.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Bog\'langan Buyurtma')}</label>
                           <div className="relative">
                              <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <select 
                                value={formData.source_order}
                                onChange={(e) => setFormData({...formData, source_order: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                              >
                                <option value="">{t('Ixtiyoriy...')}</option>
                                {orders.map(o => (
                                  <option key={o.id} value={o.id}>{o.order_number || o.id} - {o.customer_name}</option>
                                ))}
                              </select>
                           </div>
                        </div>
                     </div>

                     {type === 'EXPENSE' && (
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Ta\'minot Buyurtmasi (Procurement)')}</label>
                           <div className="relative">
                              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <select 
                                value={formData.source_purchase}
                                onChange={(e) => setFormData({...formData, source_purchase: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                              >
                                <option value="">{t('Ixtiyoriy...')}</option>
                                {purchases.map(p => (
                                  <option key={p.id} value={p.id}>{p.purchase_number || p.id} - {p.supplier_name}</option>
                                ))}
                              </select>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Sana / Reja')}</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                           <input 
                             type="datetime-local"
                             value={formData.due_date}
                             onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 shadow-sm"
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Status')}</label>
                        <div className="relative">
                           <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                           <select 
                             value={formData.status}
                             onChange={(e) => setFormData({...formData, status: e.target.value})}
                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 appearance-none shadow-sm"
                           >
                              <option value="APPROVED">{t('Tasdiqlangan (Final)')}</option>
                              <option value="PENDING">{t('Kutilmoqda (Plan)')}</option>
                              <option value="DRAFT">{t('Qoralama')}</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Tavsif')}</label>
                     <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                        <textarea 
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-900 shadow-sm"
                          placeholder={t('Operatsiya bo\'yicha izoh qoldiring...')}
                        />
                     </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                     <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                     <div>
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">{t('Eslatma')}</h4>
                        <p className="text-[11px] font-medium text-blue-800 leading-relaxed">
                           {t("10 million so'mdan yuqori chiqim operatsiyalari avtomatik ravishda 'Kutilmoqda' statusiga o'tadi va ma'muriyat tasdig'ini talab qiladi.")}
                        </p>
                     </div>
                  </div>
               </div>
            </form>

            {/* Footer */}
            <div className="p-8 border-t border-slate-50 bg-white space-y-4">
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all">
                     <Paperclip className="w-4 h-4 text-slate-400" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {attachment ? attachment.name : t('Hujjat biriktirish')}
                     </span>
                     <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                     />
                  </label>
                  {attachment && (
                      <button 
                        type="button" 
                        onClick={() => setAttachment(null)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                          <X className="w-4 h-4" />
                      </button>
                  )}
               </div>

               <button 
                 onClick={handleSubmit}
                 disabled={loading}
                 className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 {loading ? t('Saqlanmoqda...') : t('Operatsiyani Tasdiqlash')}
                 {!loading && <CheckCircle2 className="w-4 h-4" />}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
