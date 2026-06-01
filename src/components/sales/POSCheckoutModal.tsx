import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Wallet, 
  CreditCard, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  FileText
} from 'lucide-react';
import { Product, Client } from '../../types';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';

interface POSCheckoutModalProps {
  cart: { product: Product, quantity: number }[];
  clients: Client[];
  total: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function POSCheckoutModal({ cart, clients, total, onClose, onComplete }: POSCheckoutModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    paymentMethod: 'CASH',
    discount: 0,
    notes: '',
    warehouseId: '4' // Default to finished goods warehouse
  });

  const handleCheckout = async () => {
    if (!formData.customerId) {
      uiStore.showNotification(t("Mijozni tanlang"), "error");
      return;
    }

    try {
      setLoading(true);
      await api.post('sales/invoices/create-invoice/', {
        warehouse_id: parseInt(formData.warehouseId),
        customer_id: parseInt(formData.customerId),
        items: cart.map(item => ({
          product_id: parseInt(item.product.id as string),
          quantity: item.quantity,
          price: item.product.price
        })),
        payment_method: formData.paymentMethod,
        discount_amount: formData.discount,
        notes: formData.notes
      });

      uiStore.showNotification(t("Buyurtma muvaffaqiyatli yaratildi"), "success");
      onComplete();
    } catch (err: any) {
      console.error("Checkout failed", err);
      uiStore.showNotification(err.response?.data?.error || t("Xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'CASH', name: t('Naqd'), icon: DollarSign, color: 'emerald' },
    { id: 'CARD', name: t('Karta'), icon: CreditCard, color: 'blue' },
    { id: 'BANK', name: t('Perezich'), icon: Building2, color: 'indigo' },
    { id: 'DEBT', name: t('Qarz'), icon: Wallet, color: 'rose' },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Form */}
        <div className="flex-1 p-10 md:p-14 space-y-10">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('To\'lov & Tasdiqlash')}</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Finalizing Order')}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-3 text-slate-300 hover:text-rose-500 transition-all">
                <X className="w-8 h-8" />
             </button>
          </div>

          <div className="space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mijozni tanlang')}</label>
                <div className="relative">
                   <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <select 
                     className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-blue-500 font-bold transition-all appearance-none"
                     value={formData.customerId}
                     onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                   >
                      <option value="">{t('Mijozni tanlang')}...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('To\'lov usuli')}</label>
                <div className="grid grid-cols-2 gap-4">
                   {paymentMethods.map((m) => (
                     <button 
                       key={m.id}
                       onClick={() => setFormData({...formData, paymentMethod: m.id})}
                       className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all ${
                         formData.paymentMethod === m.id 
                           ? `bg-${m.color}-50 border-${m.color}-500 text-${m.color}-600` 
                           : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                       }`}
                     >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          formData.paymentMethod === m.id ? `bg-${m.color}-600 text-white` : 'bg-slate-50 text-slate-400'
                        }`}>
                           <m.icon className="w-5 h-5" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest">{m.name}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Chegirma')}</label>
                   <input 
                     type="number" 
                     className="w-full px-7 py-5 bg-slate-50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-rose-500 font-black text-rose-600"
                     value={formData.discount}
                     onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Izoh')}</label>
                   <input 
                     type="text" 
                     className="w-full px-7 py-5 bg-slate-50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-blue-500 font-bold"
                     placeholder="..."
                     value={formData.notes}
                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="w-full md:w-96 bg-slate-50 p-10 md:p-14 flex flex-col border-l border-slate-100">
           <div className="flex-1 space-y-6 overflow-y-auto mb-10 pr-2 custom-scrollbar">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Xarid Tafsiloti')}</h3>
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.quantity} x {item.product.price?.toLocaleString()} UZS</p>
                   </div>
                   <p className="text-xs font-black text-slate-900 whitespace-nowrap">
                     {((item.product.price || 0) * item.quantity).toLocaleString()}
                   </p>
                </div>
              ))}
           </div>

           <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="space-y-1 text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Jami To\'lov')}</p>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                   {(total - formData.discount).toLocaleString()} <span className="text-xs text-slate-300">UZS</span>
                 </h3>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => window.print()} className="p-5 bg-white border border-slate-200 text-slate-400 rounded-3xl hover:text-blue-600 transition-all">
                    <Printer className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={handleCheckout}
                   disabled={loading}
                   className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                 >
                    {loading ? t('Yuklanmoqda...') : t('Tasdiqlash')}
                    <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
