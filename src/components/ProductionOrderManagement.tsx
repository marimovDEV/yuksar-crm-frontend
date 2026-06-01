import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Settings, 
  MoreVertical,
  Factory,
  Package,
  ArrowRight,
  TrendingUp,
  Box,
  User as UserIcon,
  X,
  Target,
  ShoppingCart,
  Layers,
  Activity as ActivityIcon,
  Users,
  BarChart3,
  ClipboardList,
  LayoutGrid,
  List,
  History,
  Beaker,
  Trash2,
  AlertTriangle,
  Zap,
  Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductionOrder, ProductionOrderStage, User, QualityCheck } from '../types';
import { uiStore, authStore } from '../lib/store';
import api from '../lib/api';
import { useI18n } from '../i18n';

// ═══════════════════════════════════════════════════
// SUB-COMPONENT: PRODUCTION ORDER DETAIL DRAWER
// ═══════════════════════════════════════════════════

interface DetailDrawerProps {
  order: ProductionOrder;
  onClose: () => void;
  onUpdate: () => void;
}

function ProductionOrderDetailDrawer({ order, onClose, onUpdate }: DetailDrawerProps) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'timeline' | 'qc' | 'materials' | 'waste'>('timeline');

  return (
    <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-2xl bg-white shadow-2xl border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{order.order_number}</h2>
              <p className="text-xs text-slate-500 font-medium">{order.product_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
          {[
            { id: 'timeline', label: t("Xronologiya"), icon: History },
            { id: 'qc', label: t("Sifat nazorati"), icon: Beaker },
            { id: 'materials', label: t("Materiallar sarfi"), icon: Layers },
            { id: 'waste', label: t("Brak ko'rsatkichlari"), icon: Trash2 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <motion.div 
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {order.action_logs?.map((log, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t(log.stage)} - {t(log.action)}</h4>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(log.timestamp).toLocaleString(locale)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{log.notes || t("Tizim tomonidan qayd etildi")}</p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                      <UserIcon className="w-3 h-3 text-amber-500" />
                      {log.user}
                    </div>
                  </div>
                ))}
                {(!order.action_logs || order.action_logs.length === 0) && (
                  <div className="text-center py-20">
                    <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t("Hali hech qanday harakat qayd etilmagan")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'qc' && (
            <motion.div 
              key="qc"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
               {order.quality_checks?.map((qc, i) => (
                 <div key={i} className={`p-6 rounded-[24px] border ${qc.status === 'PASSED' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${qc.status === 'PASSED' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {qc.status === 'PASSED' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-900">{t(qc.status_display)}</div>
                            <div className="text-[10px] font-medium text-slate-500">{new Date(qc.created_at).toLocaleString(locale)}</div>
                         </div>
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t("Inspektor")}: {qc.inspector_name}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">{qc.notes || t("Izohsiz")}</p>
                    {qc.waste_weight > 0 && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 bg-rose-100/50 px-3 py-2 rounded-xl w-fit">
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("Brak miqdori")}: {qc.waste_weight} kg
                      </div>
                    )}
                 </div>
               ))}
               {(!order.quality_checks || order.quality_checks.length === 0) && (
                  <div className="text-center py-20">
                    <Beaker className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t("Sifat nazorati hali o'tkazilmagan")}</p>
                  </div>
                )}
            </motion.div>
          )}

          {activeTab === 'materials' && (
             <motion.div 
               key="materials"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-4"
             >
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t("Retsept bo'yicha sarf")}</h4>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <Box className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold">EPS Granula (G-102)</span>
                         </div>
                         <div className="text-xs font-black text-slate-900">120 kg</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold">Elektr energiya</span>
                         </div>
                         <div className="text-xs font-black text-slate-900">45 kWh</div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'waste' && (
            <motion.div 
              key="waste"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-rose-50/50 rounded-[24px] border border-rose-100">
                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{t("Jami Brak")}</div>
                    <div className="text-2xl font-black text-rose-600">
                      {order.stages.reduce((acc, s) => acc + (s.waste_amount || 0), 0).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="p-6 bg-amber-50/50 rounded-[24px] border border-amber-100">
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">{t("Sifat darajasi")}</div>
                    <div className="text-2xl font-black text-amber-600">98.4%</div>
                  </div>
               </div>

               <div className="space-y-3">
                  {order.stages.filter(s => s.waste_amount > 0).map((stage, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                       <div>
                          <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{t(stage.stage_type)}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{t("Operator")}: {stage.current_operator_name || t("Noma'lum")}</div>
                       </div>
                       <div className="text-sm font-black text-rose-600">{stage.waste_amount} kg</div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <div className="p-8 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Hozirgi holat")}: {t(order.status_display)}</span>
        </div>
        <button onClick={() => alert("Bu funksiya tez kunda ishga tushadi")}  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
          {t("Hisobot yuklash")}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT: PRODUCTION ORDER MANAGEMENT
// ═══════════════════════════════════════════════════

export default function ProductionOrderManagement() {
  const { locale, t } = useI18n();
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [kpiSummary, setKpiSummary] = useState<any>(null);
  const [operators, setOperators] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed' | 'all'>('active');
  
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProductionOrderStage | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [manualTask, setManualTask] = useState({
    product: '',
    quantity: 100,
    priority: 'MEDIUM' as const,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [products, setProducts] = useState<any[]>([]);

  const fetchKPIs = async () => {
    try {
      const res = await api.get('production/orders/kpi_summary/');
      setKpiSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch KPIs", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, operatorsRes, productsRes] = await Promise.all([
        api.get('production/orders/'),
        api.get('users/?role=Ishlab chiqarish operatori'),
        api.get('materials/')
      ]);
      setProductionOrders(ordersRes.data);
      setOperators(operatorsRes.data);
      setProducts(productsRes.data);
      fetchKPIs();
    } catch (err) {
      console.error("Failed to fetch production data", err);
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const user = authStore.user;
    setIsMaster(['Bosh Admin', 'Admin', 'Ishlab chiqarish ustasi', 'SUPERADMIN', 'ADMIN'].includes(user?.role || ''));
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('production/orders/', manualTask);
      uiStore.showNotification(t("Yangi naryad yaratildi"), "success");
      fetchData();
      setIsManualModalOpen(false);
    } catch (err) {
      uiStore.showNotification(t("Naryad yaratishda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOperator = async (userId: number) => {
    if (!selectedOrder || !selectedStage) return;
    try {
      await api.post(`production/orders/${selectedOrder.id}/assign-task/`, {
        stage_id: selectedStage.id,
        operator_id: userId
      });
      uiStore.showNotification(t("Operator biriktirildi"), "success");
      fetchData();
      setIsAssignModalOpen(false);
    } catch (err) {
      uiStore.showNotification(t("Biriktirishda xatolik"), "error");
    }
  };

  const handleAdvanceStage = async (order: ProductionOrder, stageId: number) => {
    const stage = order.stages.find(s => s.id === stageId);
    if (!stage) return;

    const prevStage = order.stages.find(s => s.sequence === stage.sequence - 1);
    if (prevStage && prevStage.status !== 'COMPLETED') {
      uiStore.showNotification(t("Avvalgi bosqich yakunlanmagan!"), "error");
      return;
    }

    const val = prompt(`${t(stage.stage_type)} ${t("uchun yakuniy miqdor")}:`, order.quantity.toString());
    if (val === null) return;
    const actual_quantity = parseFloat(val);
    
    const waste = prompt(t("Chiqindi (brak) miqdori (kg):"), "0");
    const waste_amount = parseFloat(waste || "0");

    try {
      await api.post(`production/orders/${order.id}/transition/`, {
        stage_id: stageId,
        actual_quantity,
        waste_amount
      });
      uiStore.showNotification(t("Bosqich yangilandi"), "success");
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("O'tishda xatolik"), "error");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose-500 text-white shadow-rose-200';
      case 'HIGH': return 'bg-orange-500 text-white shadow-orange-200';
      case 'MEDIUM': return 'bg-blue-500 text-white shadow-blue-200';
      case 'LOW': return 'bg-slate-500 text-white shadow-slate-200';
      default: return 'bg-slate-500 text-white shadow-slate-200';
    }
  };

  const filteredOrders = productionOrders.filter(po => {
    if (
      po.product_name.toUpperCase().includes('TEST-') || 
      po.order_number.toUpperCase().includes('TEST-') ||
      po.product_name.toUpperCase().includes('TEST_STAGE') ||
      po.product_name.toUpperCase().includes('TEST STAGE')
    ) {
      return false;
    }
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = po.order_number.toLowerCase().includes(searchStr) || 
                         po.product_name.toLowerCase().includes(searchStr);
    if (!matchesSearch) return false;
    
    if (activeTab === 'active') return po.status === 'IN_PROGRESS' || po.status === 'QC_PENDING' || po.status === 'DELAYED';
    if (activeTab === 'pending') return po.status === 'PENDING' || po.status === 'PLANNED';
    if (activeTab === 'completed') return po.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <Factory className="w-6 h-6 text-blue-600" />
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("Ishlab Chiqarish Boshqaruvi")}</h1>
          </div>
          <p className="text-slate-500 font-medium">{t("Ishlab chiqarishni boshqarish markazi (MES)")}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <List className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setViewMode('kanban')}
               className={`p-2.5 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <LayoutGrid className="w-5 h-5" />
             </button>
          </div>
          
          {isMaster && (
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t("Yangi Naryad")}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("Aktiv Partiyalar"), value: filteredOrders.length, icon: ActivityIcon, color: 'blue' },
          { label: t("Kechikayotgan Buyurtmalar"), value: productionOrders.filter(o => o.status === 'DELAYED').length, icon: AlertTriangle, color: 'rose' },
          { label: t("Bugungi Ishlab Chiqarish"), value: kpiSummary?.waste_metrics?.total_produced?.toFixed(0) || 0, icon: TrendingUp, color: 'emerald' },
          { label: t("Brak Foizi"), value: `${kpiSummary?.waste_metrics?.avg_waste_pct?.toFixed(1)}%`, icon: Trash2, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-all shadow-lg shadow-${stat.color}-100`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <BarChart3 className="w-4 h-4 text-slate-200" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
            {[
              { id: 'active', name: t("Active"), icon: ActivityIcon },
              { id: 'pending', name: t("Pending"), icon: Clock },
              { id: 'completed', name: t("Completed"), icon: CheckCircle2 },
              { id: 'all', name: t("All"), icon: Layers },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                  ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-lg shadow-blue-100 ring-1 ring-blue-50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all" />
            <input 
              type="text" 
              placeholder={t("Naryad yoki mahsulot nomi...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold transition-all"
            />
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {filteredOrders.length === 0 ? (
                   <div className="text-center py-40">
                      <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                      <h3 className="text-xl font-black text-slate-900 mb-2">{t("Ma'lumot topilmadi")}</h3>
                      <p className="text-slate-400 font-medium">{t("Tanlangan filtrlar bo'yicha hech qanday naryad mavjud emas")}</p>
                   </div>
                ) : (
                  filteredOrders.map(po => {
                    const producedVolume = ((po.progress / 100) * po.quantity).toFixed(1);
                    const activeStage = po.stages.find(s => s.status === 'ACTIVE');
                    const activeStageName = activeStage ? t(activeStage.stage_type) : t("status.completed");

                    return (
                      <div key={po.id} className="bg-slate-50/50 rounded-[32px] border border-slate-100 p-8 hover:bg-white hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => { setSelectedOrder(po); setIsDetailDrawerOpen(true); }}>
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
                          <div className="flex items-start gap-6 min-w-[300px]">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${po.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-white text-slate-400 group-hover:bg-blue-600 group-hover:text-white shadow-slate-100'}`}>
                              <Package className="w-7 h-7" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-black text-slate-900">{po.product_name}</h4>
                                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase shadow-sm ${getPriorityColor(po.priority)}`}>{t(po.priority)}</div>
                                {po.status === 'DELAYED' && <div className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-rose-100 text-rose-600 border border-rose-200 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{t("Kechikmoqda")}</div>}
                              </div>
                              <div className="flex flex-wrap items-center gap-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3 text-blue-500" />{t("ID")}: {po.order_number}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserIcon className="w-3 h-3 text-amber-500" />{t("Mas'ul")}: {po.responsible_name || t("Tayinlanmagan")}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3 text-rose-500" />{t("Due")}: {po.deadline ? new Date(po.deadline).toLocaleDateString(locale) : t("Noma'lum")}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ActivityIcon className="w-3 h-3 text-emerald-500" />{t("Joriy Bosqich")}: <span className="text-slate-800 font-extrabold">{activeStageName}</span></p>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400 whitespace-nowrap">{t("Ish jarayoni")}</span>
                              <span className="text-blue-600 font-extrabold whitespace-nowrap">{producedVolume} m³ / {po.quantity} m³ ({Math.round(po.progress)}%)</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-6 relative">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${po.progress}%` }} className={`h-full absolute left-0 top-0 transition-all duration-1000 ${po.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                            </div>

                            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                              {[...po.stages].sort((a, b) => a.sequence - b.sequence).map((stage) => (
                                <div key={stage.id} className={`relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer group/stage ${stage.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 opacity-60' : stage.status === 'ACTIVE' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : stage.status === 'FAILED' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`} onClick={() => { if (isMaster) { setSelectedOrder(po); setSelectedStage(stage); setIsAssignModalOpen(true); } }}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${stage.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : stage.status === 'ACTIVE' ? 'bg-blue-600 text-white scale-110 shadow-lg' : stage.status === 'FAILED' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {stage.status === 'FAILED' ? <AlertTriangle className="w-4 h-4" /> : <Settings className={`w-4 h-4 ${stage.status === 'ACTIVE' ? 'animate-spin-slow' : ''}`} />}
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-center leading-tight">{t(`stage.short.${stage.stage_type}`)}</span>
                                  {stage.current_operator_name && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm"><UserIcon className="w-2.5 h-2.5" /></div>}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                             {po.stages.find(s => s.status === 'ACTIVE') && (
                               <button onClick={() => handleAdvanceStage(po, po.stages.find(s => s.status === 'ACTIVE')!.id)} className="px-6 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                                 {t("Keyingi bosqich")}
                                 <ArrowRight className="w-4 h-4" />
                               </button>
                             )}
                             <button onClick={() => { setSelectedOrder(po); setIsDetailDrawerOpen(true); }} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">{t("Batafsil")}</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div key="kanban" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex gap-6 overflow-x-auto pb-6">
                 {['BUNKER', 'ZAMES', 'FORMOVKA', 'DRYING', 'CNC', 'DEKOR', 'BLOK'].map(stageType => (
                   <div key={stageType} className="min-w-[320px] bg-slate-50/50 rounded-[32px] p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" />{t(stageType)}</h3>
                         <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400">{filteredOrders.filter(o => o.stages.find(s => s.stage_type === stageType && s.status === 'ACTIVE')).length}</span>
                      </div>
                      <div className="space-y-4">
                         {filteredOrders.filter(o => o.stages.find(s => s.stage_type === stageType && s.status === 'ACTIVE')).map(o => (
                             <div key={o.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => { setSelectedOrder(o); setIsDetailDrawerOpen(true); }}>
                                <div className="flex items-center justify-between mb-3">
                                   <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getPriorityColor(o.priority)}`}>{t(o.priority)}</div>
                                   <span className="text-[10px] font-black text-slate-300">#{o.order_number}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{o.product_name}</h4>
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center"><UserIcon className="w-3.5 h-3.5 text-slate-400" /></div>
                                      <span className="text-[10px] font-bold text-slate-500">{o.stages.find(s => s.stage_type === stageType)?.current_operator_name || t("Tayinlanmagan")}</span>
                                   </div>
                                   <div className="text-[10px] font-black text-blue-600">{o.progress.toFixed(0)}%</div>
                                </div>
                             </div>
                           ))
                         }
                         {filteredOrders.filter(o => o.stages.find(s => s.stage_type === stageType && s.status === 'ACTIVE')).length === 0 && (
                            <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center"><Hammer className="w-8 h-8 text-slate-200 mb-2" /><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t("Aktiv ishlar yo'q")}</p></div>
                         )}
                      </div>
                   </div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isDetailDrawerOpen && selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailDrawerOpen(false)} className="fixed inset-0 z-[65] bg-slate-900/40 backdrop-blur-sm" />
            <ProductionOrderDetailDrawer order={selectedOrder} onClose={() => setIsDetailDrawerOpen(false)} onUpdate={fetchData} />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Factory className="text-white w-6 h-6" /></div>
                  <div><h3 className="text-xl font-black text-slate-900 tracking-tight">{t("Yangi Ishlab Chiqarish Naryadi")}</h3><p className="text-xs text-slate-500 font-medium">{t("Barcha xom ashyo va bosqichlar avtomatik rejalashtiriladi")}</p></div>
                </div>
                <button onClick={() => setIsManualModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateOrder} className="p-8 space-y-6">
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">{t("Mahsulot nomi")}</label>
                   <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm" value={manualTask.product} onChange={e => setManualTask({...manualTask, product: e.target.value})}><option value="">{t("Tanlang...")}</option>{products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">{t("Miqdor")}</label><input type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm" value={manualTask.quantity} onChange={e => setManualTask({...manualTask, quantity: Number(e.target.value)})}/></div>
                  <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">{t("Muddat")}</label><input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm" value={manualTask.deadline} onChange={e => setManualTask({...manualTask, deadline: e.target.value})}/></div>
                </div>
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">{t("Muhimlik Darajasi")}</label><div className="flex gap-2">{(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (<button key={p} type="button" onClick={() => setManualTask({...manualTask, priority: p})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${manualTask.priority === p ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{t(p)}</button>))}</div></div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsManualModalOpen(false)} className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50">{t("Bekor qilish")}</button><button type="submit" disabled={loading} className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-xl active:scale-95 disabled:opacity-50">{t("Naryadni ochish")}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssignModalOpen && selectedStage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg"><Users className="text-white w-6 h-6" /></div>
                  <div><h3 className="text-xl font-black text-slate-900 tracking-tight">{t("Mas'ul Biriktirish")}</h3><p className="text-xs text-slate-500 font-medium">{t(selectedStage.stage_type_display)} {t("bosqichi uchun")}</p></div>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 max-h-[400px] overflow-y-auto space-y-3">
                {operators.length === 0 ? (<div className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t("Operatorlar topilmadi")}</div>) : (operators.map(op => (<button key={op.id} onClick={() => handleAssignOperator(Number(op.id))} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all group"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all"><UserIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" /></div><div className="text-left"><div className="text-sm font-black text-slate-900">{op.name || op.username}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(op.role)}</div></div></div><Plus className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all" /></button>)))}
              </div>
              <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end"><button onClick={() => setIsAssignModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all">{t("Yopish")}</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
