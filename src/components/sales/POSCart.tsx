import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  Wallet,
  ArrowRight
} from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n';

interface POSCartProps {
  cart: { product: Product, quantity: number }[];
  onUpdateQuantity: (productId: string | number, delta: number) => void;
  onRemove: (productId: string | number) => void;
  onCheckout: () => void;
  subtotal: number;
  previewMode: boolean;
}

export default function POSCart({ cart, onUpdateQuantity, onRemove, onCheckout, subtotal, previewMode }: POSCartProps) {
  const { t } = useI18n();

  if (previewMode) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-20 text-center space-y-8 bg-white rounded-[48px]">
        <div className="w-32 h-32 bg-emerald-50 rounded-[48px] flex items-center justify-center">
          <ShoppingCart className="w-14 h-14 text-emerald-500" />
        </div>
        <div className="max-w-md">
          <h3 className="text-2xl font-black text-slate-900 mb-4">{t('Mijoz Rejimi Faol')}</h3>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {t("Savat va narxlar faqat sotuvchi uchun ko'rinadi. Showroom rejimida mijozga mahsulotlarni bemalol ko'rsatishingiz mumkin.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-10">
      {/* Items List - Left Side (Operational Workspace) */}
      <div className="flex-[2] bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6" />
             </div>
             <div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t('Savatdagi Mahsulotlar')}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} {t('turdagi mahsulot')}</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.product.id} 
                className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-premium transition-all group flex items-center gap-10"
              >
                 {/* Product Visual */}
                 <div className="w-24 h-24 bg-slate-50 rounded-[28px] overflow-hidden shrink-0 border border-slate-100">
                    <img 
                      src={item.product.images?.[0] || `https://placehold.jp/24/3b82f6/ffffff/200x200.png?text=${item.product.name}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                 </div>

                 {/* Product Info */}
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.product.sku || 'CAT-001'}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 truncate mb-1">{item.product.name}</h4>
                    <p className="text-sm font-bold text-slate-400">{item.product.product_class || 'A-Class'}</p>
                 </div>

                 {/* Quantity Controls */}
                 <div className="flex items-center bg-slate-100 rounded-3xl p-1.5 border border-slate-200">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-10 h-10 flex items-center justify-center bg-white text-slate-600 rounded-2xl hover:text-rose-500 shadow-sm transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-lg font-black text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white text-slate-600 rounded-2xl hover:text-blue-600 shadow-sm transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                 </div>

                 {/* Pricing */}
                 <div className="text-right min-w-[150px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Jami')}</p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">
                      {((item.product.price || 0) * item.quantity).toLocaleString()} <span className="text-[10px] text-slate-300 uppercase font-bold ml-1">UZS</span>
                    </p>
                 </div>

                 {/* Actions */}
                 <button 
                   onClick={() => onRemove(item.product.id)}
                   className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 opacity-50">
                <ShoppingCart className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">{t('Savat bo\'sh')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary - Right Side */}
      <div className="w-full md:w-96 flex flex-col gap-6">
         <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium p-10 space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('To\'lov Tafsiloti')}</h3>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <span>{t('Oraliq Summa')}</span>
                  <span className="text-slate-900">{subtotal.toLocaleString()} UZS</span>
               </div>
               <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <span>{t('Chegirma')}</span>
                  <span className="text-rose-500">0 UZS</span>
               </div>
               <div className="pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Jami To\'lov')}</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                    {subtotal.toLocaleString()} <span className="text-xs text-slate-300 tracking-normal ml-1">UZS</span>
                  </h3>
               </div>
            </div>

            <button 
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {t('To\'lovga o\'tish')}
              <ArrowRight className="w-5 h-5" />
            </button>
         </div>

         {/* Extra Info / Tips */}
         <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
               </div>
               <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">{t('Tezkor To\'lov')}</h4>
            </div>
            <p className="text-[11px] font-medium text-emerald-800 leading-relaxed">
               {t("Xaridni yakunlash uchun to'lov usulini tanlang va kvitansiyani chop eting.")}
            </p>
         </div>
      </div>
    </div>
  );
}
