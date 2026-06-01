import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  CheckCircle2, 
  ChevronRight, 
  Package, 
  Truck, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  Info,
  ChevronLeft,
  LayoutGrid,
  FileText,
  Building2,
  TrendingUp
} from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n';

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  previewMode: boolean;
}

export default function ProductDetailDrawer({ product, onClose, onAddToCart, previewMode }: ProductDetailDrawerProps) {
  const { t, locale } = useI18n();
  const [activeImage, setActiveImage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!product) return null;

  const mockImages = [
    `https://placehold.jp/48/3b82f6/ffffff/800x600.png?text=${encodeURIComponent(product.name)}`,
    `https://placehold.jp/48/6366f1/ffffff/800x600.png?text=Side+View`,
    `https://placehold.jp/48/10b981/ffffff/800x600.png?text=Texture+Close-up`,
    `https://placehold.jp/48/f59e0b/ffffff/800x600.png?text=Installation`
  ];

  const images = product.images?.length ? product.images : mockImages;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{product.name}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.sku || 'N/A'}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Showroom Visual Gallery */}
            <div className="p-10 space-y-8">
              <div className="relative aspect-[4/3] rounded-[48px] overflow-hidden bg-slate-100 border border-slate-100 shadow-premium group">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={images[activeImage]} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                   <div className="flex gap-3">
                      {product.qc_certified && (
                        <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400/20">
                           <ShieldCheck className="w-5 h-5" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{t('Certified Quality')}</span>
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur-xl text-slate-900 px-4 py-2 rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                         {product.pattern_type || 'Classic'}
                      </div>
                   </div>
                   <button onClick={() => setIsExpanded(true)} className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-2xl">
                      <Maximize2 className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Enhanced Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar px-2">
                {images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-28 aspect-square rounded-[24px] overflow-hidden flex-none border-4 transition-all ${
                      activeImage === i ? 'border-blue-500 scale-95 shadow-premium' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Deep Dive */}
            <div className="px-10 pb-16 space-y-16">
              {/* Core Specs - Visual Grid */}
              <div className="grid grid-cols-3 gap-6">
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-3 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <LayoutGrid className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Zichlik')}</p>
                       <p className="text-sm font-black text-slate-900">{product.density || '20kg/m³'}</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-3 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <Maximize2 className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('O\'lcham')}</p>
                       <p className="text-sm font-black text-slate-900">{product.dimensions || '1000x500mm'}</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-3 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Klass')}</p>
                       <p className="text-sm font-black text-slate-900">{product.product_class || 'A-Class'}</p>
                    </div>
                 </div>
              </div>

              {/* Product Narrative */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{t('Mahsulot Haqida')}</h4>
                </div>
                <p className="text-xl font-medium text-slate-700 leading-relaxed tracking-tight">
                  {product.description || t("Penoplast dekorativ panellari fasad tizimlarida hamda interyer dizaynida keng qo'llaniladi. Yuqori issiqlik izolyatsiyasi va suv o'tkazmaslik xususiyatlariga ega.")}
                </p>
              </div>

              {/* Project Gallery - REAL WORLD SAMPLES */}
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{t('Obyektlarda ishlatilishi')}</h4>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{t('Real samples')}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="relative aspect-square rounded-[40px] overflow-hidden group">
                       <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                       <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all" />
                       <div className="absolute bottom-6 left-6 text-white">
                          <p className="text-[8px] font-black uppercase tracking-widest">Toshkent Siti</p>
                          <p className="text-[10px] font-bold">Fasad Dekor</p>
                       </div>
                    </div>
                    <div className="relative aspect-square rounded-[40px] overflow-hidden group">
                       <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                       <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all" />
                       <div className="absolute bottom-6 left-6 text-white">
                          <p className="text-[8px] font-black uppercase tracking-widest">Yunusobod</p>
                          <p className="text-[10px] font-bold">Villa Project</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Stock Analytics - Hide in Client Mode */}
              {!previewMode && (
                <div className="p-10 bg-slate-900 rounded-[48px] text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('Hozirgi zaxira')}</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black tracking-tighter">{product.stock_quantity || 124}</span>
                      <span className="text-sm font-black text-slate-400 uppercase">{product.unit}</span>
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center border border-white/10">
                    <TrendingUp className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-slate-100 bg-white shadow-2xl">
             <div className="flex items-center justify-between gap-10">
                {!previewMode && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Mijoz uchun narx')}</p>
                    <p className="text-3xl font-black text-slate-900">
                      {product.price?.toLocaleString()} <span className="text-xs text-slate-300 uppercase tracking-[0.2em]">UZS</span>
                    </p>
                  </div>
                )}
                
                <div className="flex-1 flex gap-4">
                   <button 
                     onClick={onClose}
                     className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                   >
                     {t('Yopish')}
                   </button>
                   {!previewMode && (
                     <button 
                       onClick={() => { onAddToCart(product); onClose(); }}
                       className="flex-[2] py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                        <ShoppingCart className="w-4 h-4" />
                        {t('Savatga qo\'shish')}
                     </button>
                   )}
                </div>
             </div>
          </div>
        </motion.div>

        {/* Fullscreen Image Modal */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-2xl flex items-center justify-center"
            >
              <button onClick={() => setIsExpanded(false)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-all"><X className="w-10 h-10" /></button>
              <img src={images[activeImage]} className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
