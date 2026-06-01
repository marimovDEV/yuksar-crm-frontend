import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Search, User as UserIcon, Plus, Trash2, Truck, DollarSign, 
  Clock, CheckCircle2, TrendingUp, Users, Sparkles, Filter, 
  ArrowRight, ArrowLeft, LayoutGrid, Eye, HelpCircle, FileText, ChevronRight, X
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';
import ProductCatalog from '../sales/ProductCatalog';
import ProductDetailDrawer from '../sales/ProductDetailDrawer';

interface SalesWorkspaceProps {
  user: any;
}

type SalesSubTab = 'VORONKA' | 'POS' | 'CLIENTS' | 'LEADS' | 'CALCULATOR';

export default function SalesWorkspace({ user }: SalesWorkspaceProps) {
  const { t, locale } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<SalesSubTab>('VORONKA');
  
  // API Core States
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);

  // Client Filter state
  const [clientSegmentFilter, setClientSegmentFilter] = useState<'ALL' | 'VIP' | 'REGULAR' | 'RISKY'>('ALL');

  // Calculator State
  const [calcInputs, setCalcInputs] = useState({
    density: 20, // kg/m³
    productType: 'BLOCK', // BLOCK, PANEL, FIGURA
    granulaPrice: 15000, // UZS/kg
    siroRatio: 2.0, // %
    siroPrice: 22000, // UZS/liter
    electricityUsage: 0.6, // kWh per unit
    electricityTariff: 1000, // UZS/kWh
    gasUsage: 1.0, // m³ per unit
    gasTariff: 1800, // UZS/m³
    laborRate: 15000, // UZS/hr
    laborTime: 0.2, // hrs per unit
    overheadCost: 3500, // UZS overhead
    marginPercent: 30 // %
  });

  // Order wizard
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerId: '',
    paymentMethod: 'CASH',
    deliveryAddress: '',
    notes: '',
    discount: 0,
    warehouseId: '4' // Tayyor mahsulot sklad
  });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1,
    price: 0
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, clientsRes, productsRes] = await Promise.all([
        api.get('sales/invoices/').catch(() => ({ data: [] })),
        api.get('clients/').catch(() => ({ data: [] })),
        api.get('products/').catch(() => ({ data: [] })),
      ]);
      setInvoices(invRes.data.results || invRes.data || []);
      setClients(clientsRes.data.results || clientsRes.data || []);
      
      const enhancedProducts = (productsRes.data.results || productsRes.data || []).map((p: any) => ({
        ...p,
        images: [
           `https://images.unsplash.com/photo-1582035661448-9366487d559c?w=800&q=80`
        ],
        pattern_type: ['Classic', 'Modern', 'Premium'][Math.floor(Math.random() * 3)],
        dimensions: "1000x500mm",
        density: "15-20kg/m³",
        product_class: ['A_CLASS', 'B_CLASS'][Math.floor(Math.random() * 2)],
        stock_quantity: Math.floor(Math.random() * 500),
        description: "Yuqori zichlikdagi dekorativ penoplast paneli. Fasad va ichki qismlar uchun ideal."
      }));
      setProducts(enhancedProducts);
    } catch (err) {
      console.error("Sales Workspace fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      uiStore.showNotification(t("Savat bo'sh!"), "error");
      return;
    }

    try {
      setLoading(true);
      await api.post('sales/invoices/create-invoice/', {
        warehouse_id: parseInt(formData.warehouseId),
        customer_id: parseInt(formData.customerId),
        items: cartItems.map(item => ({
          product_id: parseInt(item.productId),
          quantity: item.quantity,
          price: item.price
        })),
        payment_method: formData.paymentMethod,
        delivery_address: formData.deliveryAddress,
        notes: formData.notes,
        discount_amount: formData.discount
      });

      uiStore.showNotification(t("Buyurtma muvaffaqiyatli yaratildi"), "success");
      setIsAddingOrder(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      const msg = t(err.response?.data?.error || "Xatolik yuz berdi");
      uiStore.showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (id: number, status: string) => {
    try {
      await api.post(`sales/invoices/${id}/transition-status/`, { status });
      uiStore.showNotification(t("Holat o'zgartirildi") + `: ${t(status)}`, "success");
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Xatolik", "error");
    }
  };

  const handleLeadDragStart = (id: number) => {
    setDraggedLeadId(id);
  };

  const handleLeadDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    // Optimistically update UI
    const updatedClients = clients.map(c => {
      if (c.id === draggedLeadId) {
        return { ...c, lead_status: newStatus };
      }
      return c;
    });
    setClients(updatedClients);

    try {
      await api.patch(`clients/${draggedLeadId}/`, { lead_status: newStatus });
      uiStore.showNotification(t("Lead holati yangilandi"), "success");
      fetchData();
    } catch (err) {
      console.error("Failed to update lead status:", err);
      uiStore.showNotification(t("Lead holatini yangilashda xatolik"), "error");
      fetchData(); // Rollback
    } finally {
      setDraggedLeadId(null);
    }
  };

  const resetForm = () => {
    setStep(1);
    setIsAddingOrder(false);
    setCartItems([]);
    setFormData({
      customerId: '',
      paymentMethod: 'CASH',
      deliveryAddress: '',
      notes: '',
      discount: 0,
      warehouseId: '4'
    });
  };

  const addToCart = () => {
    const product = products.find(p => String(p.id) === currentItem.productId);
    if (!product) return;

    setCartItems([...cartItems, {
      ...currentItem,
      name: product.name,
      total: currentItem.quantity * currentItem.price
    }]);

    setCurrentItem({ productId: '', quantity: 1, price: 0 });
  };

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const filteredInvoices = invoices.filter(inv => {
    return String(inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           String(inv.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.total, 0) - formData.discount;

  const columns = [
    { id: 'NEW', name: t('Yangi'), color: 'blue', icon: Clock },
    { id: 'CONFIRMED', name: t('Tasdiqlangan'), color: 'amber', icon: CheckCircle2 },
    { id: 'IN_PRODUCTION', name: t('Ishlab chiq.'), color: 'orange', icon: TrendingUp },
    { id: 'READY', name: t('Tayyor'), color: 'emerald', icon: CheckCircle2 },
    { id: 'SHIPPED', name: t('Jo\'natilgan'), color: 'indigo', icon: Truck },
    { id: 'DELIVERED', name: t('Yetkazildi'), color: 'teal', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-[22px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShoppingCart className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{t('Sotuv Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('CRM va Buyurtmalar Voronkasi')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddingOrder(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('Yangi Buyurtma')}
          </button>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {(['VORONKA', 'POS', 'CLIENTS', 'LEADS', 'CALCULATOR'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveSubTab(tabKey)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeSubTab === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({
              VORONKA: 'Voronka (Pipeline)',
              POS: 'POS Katalog',
              CLIENTS: 'Mijozlar (CRM)',
              LEADS: 'Leadlar & Aktivlar',
              CALCULATOR: 'Narx Hisoblagich'
            }[tabKey])}
          </button>
        ))}
      </div>

      {/* Main Contents */}
      <div className="min-h-[400px]">
        {/* Pipeline / Voronka */}
        {activeSubTab === 'VORONKA' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Filter className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Savdo Voronkasi')}</h3>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t("Mijoz yoki buyurtma bo'yicha qidirish") + "..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-[18px] outline-none focus:bg-white focus:border-indigo-500 transition-all text-xs font-bold" 
                />
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
              {columns.map(col => {
                const list = filteredInvoices.filter(inv => inv.status === col.id);
                return (
                  <div key={col.id} className="flex-shrink-0 w-80 bg-slate-50/50 p-4 rounded-[32px] border border-slate-100 flex flex-col gap-4 min-h-[500px]">
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-2">
                        <col.icon className={`w-4 h-4 text-${col.color}-500`} />
                        <span className="font-black text-slate-700 text-[10px] uppercase tracking-wider">{col.name}</span>
                      </div>
                      <span className="bg-slate-200/80 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500">{list.length}</span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {list.map(inv => (
                        <div key={inv.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-3 relative group">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{inv.invoice_number}</span>
                            <span className="text-[9px] font-bold text-slate-400">{new Date(inv.date || inv.created_at).toLocaleDateString(locale)}</span>
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{inv.customer_name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t(inv.payment_method_display || inv.payment_method)}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                            <div>
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-wider">{t('Summa')}</p>
                              <p className="font-black text-sm text-slate-900">{inv.total_amount?.toLocaleString()} <span className="text-[9px] text-slate-300">UZS</span></p>
                            </div>
                            
                            <div className="flex gap-1.5">
                              {inv.status === 'NEW' && (
                                <button onClick={() => handleStatusTransition(inv.id, 'CONFIRMED')} className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center hover:bg-amber-600 transition-all shadow-md"><ArrowRight className="w-4 h-4" /></button>
                              )}
                              {inv.status === 'CONFIRMED' && (
                                <button onClick={() => handleStatusTransition(inv.id, 'SHIPPED')} className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md"><Truck className="w-4 h-4" /></button>
                              )}
                              {inv.status === 'SHIPPED' && (
                                <button onClick={() => handleStatusTransition(inv.id, 'COMPLETED')} className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-all shadow-md"><DollarSign className="w-4 h-4" /></button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {list.length === 0 && (
                        <div className="py-20 text-center text-slate-300 text-xs italic">{t('Bo\'sh')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* POS Catalog */}
        {activeSubTab === 'POS' && (
          <ProductCatalog 
            products={products}
            onAddToCart={(p) => {
              setIsAddingOrder(true);
              setStep(2);
              setCurrentItem({ productId: String(p.id), quantity: 1, price: p.price || 0 });
            }}
            onViewDetail={(p) => setSelectedProduct(p)}
            previewMode={false}
          />
        )}

        {/* Clients */}
        {activeSubTab === 'CLIENTS' && (() => {
          const getClientSegment = (c: any): 'VIP' | 'REGULAR' | 'RISKY' => {
            const isRisky = c.balance < 0 && Math.abs(c.balance) > (c.credit_limit * 0.5);
            if (isRisky || (c.balance < 0 && Math.abs(c.balance) > 5000000)) return 'RISKY';
            if (c.segment === 'VIP' || c.credit_limit >= 10000000 || c.customer_type === 'WHOLESALE') return 'VIP';
            return 'REGULAR';
          };

          const vipCount = clients.filter(c => getClientSegment(c) === 'VIP').length;
          const regularCount = clients.filter(c => getClientSegment(c) === 'REGULAR').length;
          const riskyCount = clients.filter(c => getClientSegment(c) === 'RISKY').length;

          const filteredClients = clients.filter(c => {
            if (clientSegmentFilter === 'ALL') return true;
            return getClientSegment(c) === clientSegmentFilter;
          });

          return (
            <div className="space-y-6">
              {/* ABC Analysis Widget Segment Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button 
                  onClick={() => setClientSegmentFilter('ALL')}
                  className={`p-5 rounded-3xl border text-left transition-all ${clientSegmentFilter === 'ALL' ? 'bg-slate-900 text-white border-transparent shadow-lg' : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-300'}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jami Mijozlar</p>
                  <p className="text-2xl font-black mt-2">{clients.length}</p>
                </button>
                <button 
                  onClick={() => setClientSegmentFilter('VIP')}
                  className={`p-5 rounded-3xl border text-left transition-all ${clientSegmentFilter === 'VIP' ? 'bg-indigo-600 text-white border-transparent shadow-lg' : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">A-Segment (VIP)</p>
                    <span className="text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded">Yuqori</span>
                  </div>
                  <p className="text-2xl font-black mt-2">{vipCount}</p>
                </button>
                <button 
                  onClick={() => setClientSegmentFilter('REGULAR')}
                  className={`p-5 rounded-3xl border text-left transition-all ${clientSegmentFilter === 'REGULAR' ? 'bg-emerald-600 text-white border-transparent shadow-lg' : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">B-Segment (Faol)</p>
                    <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded">O'rta</span>
                  </div>
                  <p className="text-2xl font-black mt-2">{regularCount}</p>
                </button>
                <button 
                  onClick={() => setClientSegmentFilter('RISKY')}
                  className={`p-5 rounded-3xl border text-left transition-all ${clientSegmentFilter === 'RISKY' ? 'bg-rose-600 text-white border-transparent shadow-lg font-black' : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">C-Segment (Xavfli)</p>
                    <span className="text-[9px] font-black uppercase bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded animate-pulse">Qarz</span>
                  </div>
                  <p className="text-2xl font-black mt-2">{riskyCount}</p>
                </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Mijozlar Bazasi')}</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black">{filteredClients.length} {t('mijoz')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mijoz')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Telefon')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Balans')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kredit Limiti')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Segment')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Turi')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredClients.map(client => {
                        const segment = getClientSegment(client);
                        return (
                          <tr key={client.id} className="hover:bg-slate-50/40 transition-all font-bold">
                            <td className="px-6 py-4 text-slate-900">{client.name}</td>
                            <td className="px-6 py-4 text-slate-500">{client.phone || '—'}</td>
                            <td className={`px-6 py-4 ${client.balance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {client.balance?.toLocaleString()} UZS
                            </td>
                            <td className="px-6 py-4 text-slate-600">{client.credit_limit?.toLocaleString()} UZS</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                segment === 'VIP' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                segment === 'RISKY' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {segment}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                client.customer_type === 'WHOLESALE' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {t(client.customer_type || 'RETAIL')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Lead Management Board */}
        {activeSubTab === 'LEADS' && (() => {
          const leadStages = [
            { id: 'LEAD', name: t('Yangi Lids'), color: 'blue', textBg: 'bg-blue-50 text-blue-600 border-blue-100' },
            { id: 'NEGOTIATION', name: t('Muzokara'), color: 'amber', textBg: 'bg-amber-50 text-amber-600 border-amber-100' },
            { id: 'WON', name: t('Muvaffaqiyatli'), color: 'emerald', textBg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { id: 'LOST', name: t('Yo\'qotilgan'), color: 'rose', textBg: 'bg-rose-50 text-rose-600 border-rose-100' }
          ];

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Leadlar & Aktivlar')}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">{t('Lidlarni drag-and-drop orqali boshqarish')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {leadStages.map(stage => {
                  const stageLeads = clients.filter(c => (c.lead_status || 'LEAD') === stage.id);
                  return (
                    <div 
                      key={stage.id} 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleLeadDrop(e, stage.id)}
                      className="bg-slate-50/50 p-4 rounded-[32px] border border-slate-100 flex flex-col gap-4 min-h-[500px] transition-all"
                    >
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="font-black text-slate-700 text-[10px] uppercase tracking-wider">{stage.name}</span>
                        <span className="bg-slate-200/80 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500">{stageLeads.length}</span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                        {stageLeads.map(lead => (
                          <div 
                            key={lead.id} 
                            draggable
                            onDragStart={() => handleLeadDragStart(lead.id)}
                            className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group space-y-3"
                          >
                            <div>
                              <h4 className="font-black text-slate-900 text-sm leading-tight">{lead.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">{lead.phone || t('Telefon kiritilmagan')}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('Balans')}</span>
                              <span className={`text-[10px] font-black ${lead.balance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                {lead.balance?.toLocaleString()} UZS
                              </span>
                            </div>
                          </div>
                        ))}
                        {stageLeads.length === 0 && (
                          <div className="py-20 text-center text-slate-300 text-xs italic">{t('Bo\'sh')}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Dynamic Pricing Calculator */}
        {activeSubTab === 'CALCULATOR' && (() => {
          const {
            density,
            granulaPrice,
            siroRatio,
            siroPrice,
            electricityUsage,
            electricityTariff,
            gasUsage,
            gasTariff,
            laborRate,
            laborTime,
            overheadCost,
            marginPercent
          } = calcInputs;

          const materialCost = (density * granulaPrice) + (density * (siroRatio / 100) * siroPrice);
          const energyCost = (electricityUsage * electricityTariff) + (gasUsage * gasTariff);
          const laborCost = laborRate * laborTime;
          const totalCogs = materialCost + energyCost + laborCost + overheadCost;
          const marginAmount = totalCogs * (marginPercent / 100);
          const recommendedPrice = totalCogs + marginAmount;

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Dinamik Narx Hisoblagich')}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">{t('Ishlab chiqarish tannarxi va tavsiya etilgan sotish narxi simulyatori')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Zichlik')} (kg/m³)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={density}
                      onChange={(e) => setCalcInputs({...calcInputs, density: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Granula narxi')} (UZS/kg)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={granulaPrice}
                      onChange={(e) => setCalcInputs({...calcInputs, granulaPrice: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kimyo ulushi')} (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={siroRatio}
                      onChange={(e) => setCalcInputs({...calcInputs, siroRatio: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kimyo narxi')} (UZS/litr)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={siroPrice}
                      onChange={(e) => setCalcInputs({...calcInputs, siroPrice: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Elektr tarifi')} (UZS/kWh)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={electricityTariff}
                      onChange={(e) => setCalcInputs({...calcInputs, electricityTariff: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Elektr sarfi')} (kWh/m³)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={electricityUsage}
                      onChange={(e) => setCalcInputs({...calcInputs, electricityUsage: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Gaz tarifi')} (UZS/m³)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={gasTariff}
                      onChange={(e) => setCalcInputs({...calcInputs, gasTariff: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Gaz sarfi')} (m³/m³)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={gasUsage}
                      onChange={(e) => setCalcInputs({...calcInputs, gasUsage: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Ishchi stavkasi')} (UZS/soat)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={laborRate}
                      onChange={(e) => setCalcInputs({...calcInputs, laborRate: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mehnat vaqti')} (soat/m³)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                      value={laborTime}
                      onChange={(e) => setCalcInputs({...calcInputs, laborTime: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Boshqa qo\'shimcha xarajatlar')} (UZS/m³)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                    value={overheadCost}
                    onChange={(e) => setCalcInputs({...calcInputs, overheadCost: parseFloat(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kutilayotgan Marja (%)')}</label>
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{marginPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    value={marginPercent}
                    onChange={(e) => setCalcInputs({...calcInputs, marginPercent: parseInt(e.target.value) || 5})}
                  />
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <span>5%</span>
                    <span>30%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[36px] text-white shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('Tavsiya etilgan sotish narxi')}</p>
                    <h2 className="text-4xl font-black tracking-tight text-white">
                      {Math.round(recommendedPrice).toLocaleString()} <span className="text-lg text-slate-400 uppercase font-black">UZS/m³</span>
                    </h2>
                  </div>

                  <div className="space-y-4 mt-8 pt-8 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('Jami Tannarx (COGS)')}</span>
                      <span className="text-sm font-black text-white">{Math.round(totalCogs).toLocaleString()} UZS</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('Foyda (Margin)')}</span>
                      <span className="text-sm font-black text-emerald-400">+{Math.round(marginAmount).toLocaleString()} UZS</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                      <p className="text-[10px] font-bold text-slate-300 leading-normal">
                        {t('Ushbu narx joriy xomashyo narxi, energiya sarflari va ishchi kuchi hisobiga dinamik ravishda shakllantirildi.')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t('Xarajatlar tarkibi')}</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <span>{t('Xomashyo')}</span>
                        <span>{Math.round((materialCost / (totalCogs || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(materialCost / (totalCogs || 1) * 100) || 0}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <span>{t('Energiya')}</span>
                        <span>{Math.round((energyCost / (totalCogs || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(energyCost / (totalCogs || 1) * 100) || 0}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <span>{t('Ishchi kuchi')}</span>
                        <span>{Math.round((laborCost / (totalCogs || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(laborCost / (totalCogs || 1) * 100) || 0}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <span>{t('Qo\'shimcha')}</span>
                        <span>{Math.round((overheadCost / (totalCogs || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-50 rounded-full" style={{ width: `${(overheadCost / (totalCogs || 1) * 100) || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => {
          setIsAddingOrder(true);
          setStep(2);
          setCurrentItem({ productId: String(p.id), quantity: 1, price: p.price || 0 });
        }}
        previewMode={false}
      />

      <AnimatePresence>
        {isAddingOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden my-auto border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t('Yangi Buyurtma Ustasi')}</h2>
                    <div className="flex items-center gap-3 mt-1">
                       {[1, 2, 3].map((s) => (
                         <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                       ))}
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('Qadam')} {step} / 3</span>
                    </div>
                  </div>
                </div>
                <button onClick={resetForm} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                {/* Wizard Panel */}
                <div className="lg:col-span-4 border-r border-slate-50 p-6 md:p-8 bg-slate-50/20">
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mijozni tanlang')}</label>
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-sm transition-all"
                            value={formData.customerId}
                            onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                          >
                            <option value="">{t('Mijozni tanlang')}...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('To\'lov usuli')}</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['CASH', 'BANK', 'CARD', 'DEBT'].map((m) => (
                               <button 
                                 key={m}
                                 type="button"
                                 onClick={() => setFormData({...formData, paymentMethod: m})}
                                 className={`p-3.5 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${formData.paymentMethod === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                               >
                                 {m === 'CASH' ? t('Naqd') : m === 'BANK' ? t('Perezich') : m === 'CARD' ? t('Karta') : t('Qarz')}
                               </button>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mahsulot tanlash')}</label>
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-sm transition-all"
                            value={currentItem.productId}
                            onChange={(e) => {
                              const p = products.find(x => String(x.id) === e.target.value);
                              setCurrentItem({...currentItem, productId: e.target.value, price: p?.price || 0});
                            }}
                          >
                            <option value="">{t('Mahsulotni tanlang')}...</option>
                            {products.filter(p => !p.type?.includes('RAW')).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Miqdor')}</label>
                            <input 
                              type="number" 
                              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-sm"
                              value={currentItem.quantity}
                              onChange={(e) => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Narxi')}</label>
                            <input 
                              type="number" 
                              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-sm"
                              value={currentItem.price}
                              onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                       </div>
                       <button 
                        type="button"
                        onClick={addToCart}
                        disabled={!currentItem.productId}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                       >
                         {t('Savatga qo\'shish')}
                       </button>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Chegirma')} (UZS)</label>
                          <input 
                            type="number" 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-rose-500 font-black text-base text-rose-600 shadow-sm"
                            value={formData.discount}
                            onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Izoh')}</label>
                          <textarea 
                            rows={3}
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-xs shadow-sm"
                            placeholder={t("Ixtiyoriy izohlar") + "..."}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          />
                       </div>
                    </motion.div>
                  )}
                </div>

                {/* Cart/Summary Panel */}
                <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between">
                   <div className="flex-1 space-y-3 overflow-y-auto mb-6 pr-2 max-h-[300px] custom-scrollbar">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center font-black text-xs text-slate-400">{idx + 1}</div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 leading-tight mb-1">{item.name}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.quantity} dona x {item.price?.toLocaleString()} UZS</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <p className="text-base font-black text-indigo-600">{item.total?.toLocaleString()} UZS</p>
                              <button onClick={() => removeFromCart(idx)} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      ))}
                      {cartItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300 italic">
                          <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
                          <span>{t('Savat hali bo\'sh')}</span>
                        </div>
                      )}
                   </div>

                   <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Umumiy Summa')}</span>
                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                            {totalCartAmount?.toLocaleString()} <span className="text-xs text-slate-300 uppercase font-bold">UZS</span>
                         </h3>
                         {formData.discount > 0 && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest">{t('Chegirma')}: -{formData.discount?.toLocaleString()}</p>}
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                         {step > 1 && (
                           <button onClick={() => setStep(step - 1)} className="flex-1 md:flex-none py-3.5 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                              <ArrowLeft className="w-4 h-4" />
                              {t('Orqaga')}
                           </button>
                         )}
                         <button 
                           onClick={() => step < 3 ? setStep(step + 1) : handleCreateOrder()}
                           disabled={step === 1 && !formData.customerId}
                           className="flex-1 md:flex-none py-3.5 px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                         >
                            {step === 3 ? t('Tasdiqlash') : t('Keyingi')}
                            <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
