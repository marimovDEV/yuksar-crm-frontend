import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  Eye, 
  User as UserIcon,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Wallet,
  DollarSign,
  CreditCard,
  Building2,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  Package,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';
import { Product, User, Client } from '../../types';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n';
import ProductCatalog from './ProductCatalog';
import ProductDetailDrawer from './ProductDetailDrawer';
import POSCart from './POSCart';
import POSCheckoutModal from './POSCheckoutModal';

export default function POS({ user }: { user: User }) {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutView, setIsCheckoutView] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, clientsRes] = await Promise.all([
        api.get('products/'),
        api.get('clients/')
      ]);
      
      // Enhance products with mock data for visual catalog
      const enhancedProducts = (productsRes.data.results || productsRes.data).map((p: Product) => ({
        ...p,
        images: [
           `https://images.unsplash.com/photo-1582035661448-9366487d559c?w=800&q=80`,
           `https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80`
        ],
        pattern_type: ['Classic', 'Modern', 'Premium'][Math.floor(Math.random() * 3)],
        dimensions: "1000x500mm",
        density: "15-20kg/m³",
        product_class: ['A_CLASS', 'B_CLASS', 'C_CLASS'][Math.floor(Math.random() * 3)],
        stock_quantity: Math.floor(Math.random() * 500),
        suitable_objects: ['Uy', 'Fasad', 'Dekor', 'Shift'].slice(0, Math.floor(Math.random() * 3) + 1),
        qc_certified: Math.random() > 0.3,
        description: "Yuqori zichlikdagi dekorativ penoplast paneli. Showroom uslubida sotish uchun ideal."
      }));

      setProducts(enhancedProducts);
      setClients(clientsRes.data.results || clientsRes.data);
    } catch (err) {
      console.error("Failed to fetch POS data", err);
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    uiStore.showNotification(t("Savatga qo'shildi"), "success");
  };

  const updateQuantity = (productId: string | number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string | number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  return (
    <div className="relative h-[calc(100vh-120px)] overflow-hidden">
      <AnimatePresence mode="wait">
        {!isCheckoutView ? (
          <motion.div 
            key="catalog"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex flex-col h-full transition-all duration-700 ${previewMode ? 'p-0' : ''}`}
          >
            {/* Catalog Area */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden transition-all duration-700 ${previewMode ? 'rounded-none border-none' : ''}`}>
              <div className={`p-10 border-b border-slate-50 flex items-center justify-between transition-all duration-700 ${previewMode ? 'bg-slate-900 text-white' : 'bg-slate-50/30'}`}>
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-2xl transition-all duration-700 ${previewMode ? 'bg-white text-slate-900' : 'bg-blue-600 text-white'}`}>
                      {previewMode ? <Sparkles className="w-7 h-7" /> : <LayoutGrid className="w-7 h-7" />}
                   </div>
                   <div>
                      <h2 className={`text-2xl font-black tracking-tight ${previewMode ? 'text-white' : 'text-slate-900'}`}>
                         {previewMode ? t('Premium Showroom') : t('Mahsulot Katalogi')}
                      </h2>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${previewMode ? 'bg-emerald-400 animate-pulse' : 'bg-blue-500'}`} />
                         <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${previewMode ? 'text-slate-400' : 'text-slate-400'}`}>
                            {previewMode ? t('Live Exhibition Mode') : t('Industrial Sales Ecosystem')}
                         </p>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setPreviewMode(!previewMode)}
                     className={`group flex items-center gap-3 px-8 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
                       previewMode 
                         ? 'bg-white text-slate-900 shadow-2xl shadow-white/10' 
                         : 'bg-slate-900 text-white shadow-2xl shadow-slate-200'
                     }`}
                   >
                      <Eye className={`w-4 h-4 transition-transform group-hover:scale-125 ${previewMode ? 'text-emerald-500' : ''}`} />
                      {previewMode ? t('Sotuvchi Rejimi') : t('Mijozga Ko\'rsatish')}
                   </button>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto p-12 custom-scrollbar transition-all duration-700 ${previewMode ? 'bg-slate-50/50' : ''}`}>
                <ProductCatalog 
                  products={products}
                  onAddToCart={addToCart}
                  onViewDetail={setSelectedProduct}
                  previewMode={previewMode}
                />
              </div>
            </div>

            {/* Floating Cart Button */}
            {!previewMode && cart.length > 0 && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100]"
              >
                <button 
                  onClick={() => setIsCheckoutView(true)}
                  className="flex items-center gap-4 px-10 py-6 bg-blue-600 text-white rounded-[32px] shadow-premium hover:bg-blue-700 hover:scale-105 transition-all group active:scale-95"
                >
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute -top-3 -right-3 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-blue-600 group-hover:border-blue-700">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 leading-none mb-1">{t('Savatga o\'tish')}</p>
                    <p className="text-sm font-black leading-none">{subtotal.toLocaleString()} <span className="text-[10px] uppercase opacity-60">UZS</span></p>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full bg-slate-50 rounded-[48px] overflow-hidden border border-slate-200"
          >
             <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setIsCheckoutView(false)}
                  className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                   <ChevronRight className="w-4 h-4 rotate-180" />
                   {t('Katalogga qaytish')}
                </button>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                   </div>
                   <h2 className="text-lg font-black text-slate-900 tracking-tight">{t('Buyurtmani rasmiylashtirish')}</h2>
                </div>
                <div />
             </div>

             <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                   <POSCart 
                      cart={cart}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      onCheckout={() => setIsCheckoutOpen(true)}
                      subtotal={subtotal}
                      previewMode={false}
                   />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        previewMode={previewMode}
      />

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <POSCheckoutModal 
            cart={cart}
            clients={clients}
            total={subtotal}
            onClose={() => setIsCheckoutOpen(false)}
            onComplete={() => {
              setCart([]);
              setIsCheckoutOpen(false);
              setIsCheckoutView(false);
              fetchData(); // Refresh stock
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
