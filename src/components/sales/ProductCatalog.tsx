import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  Eye, 
  ShoppingCart, 
  CheckCircle2, 
  ChevronRight,
  Maximize2,
  Layers,
  Plus,
  Box,
  Tag,
  Info,
  Package,
  TrendingUp,
  X
} from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  previewMode: boolean;
}

export default function ProductCatalog({ products, onAddToCart, onViewDetail, previewMode }: ProductCatalogProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activePattern, setActivePattern] = useState('ALL');

  const filtered = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) || 
      p.sku?.toLowerCase().includes(searchLower) ||
      p.pattern_type?.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower) ||
      p.product_class?.toLowerCase().includes(searchLower);

    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesPattern = activePattern === 'ALL' || p.pattern_type === activePattern;
    return matchesSearch && matchesCategory && matchesPattern;
  });

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const patterns = ['ALL', 'Classic', 'Modern', 'Premium'];

  return (
    <div className="space-y-8">
    <div className="space-y-12">

      {/* Visual Category Filters - Showroom Style */}
      <div className="flex items-center gap-6 overflow-x-auto pb-4 px-2 custom-scrollbar">
        {patterns.map((p) => (
          <button
            key={p}
            onClick={() => setActivePattern(p)}
            className={`group relative flex flex-col items-center gap-3 min-w-[120px] transition-all ${
              activePattern === p ? 'scale-105' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div className={`w-20 h-20 rounded-[28px] overflow-hidden border-4 transition-all shadow-lg ${
              activePattern === p ? 'border-blue-500 ring-4 ring-blue-50' : 'border-white'
            }`}>
              <img 
                src={`https://images.unsplash.com/photo-${p === 'Classic' ? '1600585154340-be6161a56a0c' : p === 'Modern' ? '1613490493576-7fde63acd811' : p === 'Premium' ? '1618221195710-dd6b41faaea6' : '1582035661448-9366487d559c'}?w=200&q=80`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" 
              />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              activePattern === p ? 'text-blue-600' : 'text-slate-400'
            }`}>
              {t(p)}
            </span>
          </button>
        ))}

        <div className="h-20 w-[1px] bg-slate-100 mx-4" />

        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-all" />
          <input 
            type="text" 
            placeholder={t("Mahsulot qidirish...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[28px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-bold shadow-sm"
          />
        </div>
      </div>
      </div>

      {/* Product Grid - Full Width Showroom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((product, idx) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              onViewDetail={onViewDetail}
              previewMode={previewMode}
              idx={idx}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-40 text-center border-4 border-dashed border-slate-50 rounded-[48px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-300 font-black uppercase tracking-widest">{t('Mahsulotlar topilmadi')}</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onViewDetail, previewMode, idx }: { key?: any, product: Product, onAddToCart: (p: Product) => void, onViewDetail: (p: Product) => void, previewMode: boolean, idx: number }) {
  const { t } = useI18n();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-premium hover:-translate-y-4 transition-all group overflow-hidden flex flex-col h-full cursor-pointer relative"
      onClick={() => onViewDetail(product)}
    >
      {/* 75% Image Area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
        <img 
          src={product.images?.[0] || `https://placehold.jp/48/3b82f6/ffffff/800x600.png?text=${encodeURIComponent(product.name)}`} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
        />
        
        {/* Quality Badge Overlay */}
        <div className="absolute top-5 left-5">
          {product.product_class && (
             <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl border text-[8px] font-black uppercase tracking-[0.3em] shadow-xl ${
               product.product_class === 'A_CLASS' ? 'bg-amber-500/90 text-white border-amber-400/30' : 
               product.product_class === 'B_CLASS' ? 'bg-slate-900/90 text-white border-white/10' : 'bg-white/90 text-slate-900 border-white/20'
             }`}>
               {product.product_class.replace('_', ' ')}
             </div>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center gap-4">
           {!previewMode && (
             <button 
               onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
               className="w-16 h-16 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:scale-110 transition-all transform translate-y-10 group-hover:translate-y-0 duration-500 delay-75"
             >
                <Plus className="w-8 h-8" />
             </button>
           )}
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transform translate-y-10 group-hover:translate-y-0 duration-500 delay-150 border border-white/20">
              <Eye className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* 25% Info Area - Extreme Minimalism */}
      <div className="p-8 flex flex-col justify-center flex-1 space-y-2">
         <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{product.sku || 'CAT-001'}</span>
         </div>
         <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">{product.name}</h3>
         
         {!previewMode && (
           <div className="pt-2">
              <p className="text-xl font-black text-slate-900 tracking-tighter">
                {product.price?.toLocaleString()} <span className="text-[10px] text-slate-300 uppercase font-bold tracking-[0.2em] ml-1">UZS</span>
              </p>
           </div>
         )}
      </div>
    </motion.div>
  );
}
