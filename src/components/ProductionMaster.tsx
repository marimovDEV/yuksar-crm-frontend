import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Users, 
  Layers, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Settings, 
  MoreVertical,
  Plus,
  ArrowRight,
  Filter,
  Search,
  LayoutDashboard,
  ClipboardList,
  Activity,
  UserPlus,
  XCircle
} from 'lucide-react';
import api from '../lib/api';
import { uiStore } from '../lib/store';
import { ProductionOrder, ProductionPlan, User, ProductionOrderStage, Recipe, QualityCheck } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ShieldCheck, FileText, Info } from 'lucide-react';
import { useI18n } from '../i18n';

export default function ProductionMaster({ user }: { user: User }) {
  const { t } = useI18n();
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [activeOrders, setActiveOrders] = useState<ProductionOrder[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PLANNING' | 'ASSIGNMENT'>('OVERVIEW');
  const [kpi, setKpi] = useState<any>(null);

  // Assignment states
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // New States for Expansion
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isQCModalOpen, setIsQCModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [qcLogs, setQCLogs] = useState<QualityCheck[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, ordersRes, usersRes, kpiRes] = await Promise.all([
        api.get('production/plans/'),
        api.get('production/orders/'),
        api.get('users/'),
        api.get('production/orders/kpi_summary/')
      ]);
      setPlans(plansRes.data);
      setActiveOrders(ordersRes.data.filter((o: any) => o.status !== 'COMPLETED'));
      setOperators(usersRes.data.filter((u: any) => {
        const roleName = u.effective_role || u.role_display || u.role;
        return ['Ishlab chiqarish ustasi', 'CNC operatori', 'Pardozlovchi'].includes(roleName);
      }));
      setKpi(kpiRes.data);
    } catch (err) {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignTask = async (operatorId: number) => {
    if (!selectedStage) return;
    try {
      await api.post(`production/orders/${selectedStage.orderId}/assign-task/`, {
        stage_id: selectedStage.id,
        operator_id: operatorId
      });
      uiStore.showNotification(t("Topshiriq biriktirildi"), "success");
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Xatolik yuz berdi"), "error");
    }
  };

  const fetchRecipe = async (order: ProductionOrder) => {
    try {
       const res = await api.get(`production/recipes/${order.product}/`);
       setSelectedRecipe(res.data);
       setIsRecipeModalOpen(true);
    } catch (err) {
       uiStore.showNotification(t("Retsept ma'lumotlari topilmadi"), "error");
    }
  };

  const fetchQC = async (orderId: string | number) => {
     try {
        const res = await api.get(`production/quality-checks/?order=${orderId}`);
        setQCLogs(res.data);
        setIsQCModalOpen(true);
     } catch (err) {
        uiStore.showNotification(t("QC ma'lumotlari yuklanmadi"), "error");
     }
  };

  const getStageColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-500';
      case 'ACTIVE': return 'bg-blue-500 animate-pulse';
      case 'PAUSED': return 'bg-amber-500';
      default: return 'bg-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center shadow-2xl shadow-slate-200">
            <Layers className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('Ishlab Chiqarish Ustasi')}</h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              {t('Boshqaruv va Rejalashtirish Markazi')}
            </p>
          </div>
        </div>

        <nav className="flex bg-slate-100 p-1.5 rounded-[24px] border border-slate-200">
           {[
             { id: 'OVERVIEW', label: t('Monitor'), icon: LayoutDashboard },
             { id: 'PLANNING', label: t('Rejalar'), icon: ClipboardList },
             { id: 'ASSIGNMENT', label: t('Topshiriqlar'), icon: Users },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-6 py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}
        </nav>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Zap className="w-6 h-6" /></div>
                <span className="text-[10px] font-black text-emerald-500">{t("+12% o'tgan haftaga nisbatan")}</span>
             </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Jarayondagi Buyurtmalar')}</p>
            <h3 className="text-3xl font-black text-slate-900">{activeOrders.length}</h3>
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><AlertTriangle className="w-6 h-6" /></div>
               <span className="text-[10px] font-black text-rose-500">{t('Nazorat kutilmoqda')}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Brak Ko\'rsatkichi')}</p>
            <h3 className="text-3xl font-black text-slate-900">{kpi?.waste_metrics?.avg_waste_pct?.toFixed(1) || '0.0'}%</h3>
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
                <span className="text-[10px] font-black text-emerald-500">{t('Bugun')}</span>
             </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Tayyor Mahsulot')}</p>
            <h3 className="text-3xl font-black text-slate-900">{kpi?.waste_metrics?.total_produced || 0} m³</h3>
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Clock className="w-6 h-6" /></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('O\'rtacha Vaqt (Stage)')}</p>
            <h3 className="text-3xl font-black text-slate-900">42m</h3>
         </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-8">{t('Flor Xaritasi (Real-time Flow)')}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                   {['BUNKER', 'ZAMES', 'FORMOVKA', 'DRYING', 'CNC', 'DEKOR', 'BLOK'].map((stage) => (
                      <div key={stage} className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10">
                         <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">{t(stage)}</p>
                         <div className="space-y-3">
                           {activeOrders.flatMap(o => o.stages?.filter(s => s.stage_type === stage && s.status === 'ACTIVE') || []).map((s, idx) => (
                             <div key={idx} className="bg-white/10 p-3 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/20 transition-all border border-white/5">
                               <span className="text-[10px] font-bold text-white/80">#{activeOrders.find(o => o.stages?.find(x => x.id === s.id))?.order_number.split('-')[1]}</span>
                               <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                             </div>
                           ))}
                           {activeOrders.filter(o => o.stages?.some(s => s.stage_type === stage && s.status === 'ACTIVE')).length === 0 && (
                             <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                                <Clock className="w-4 h-4 text-white/10 mb-2" />
                                <span className="text-[8px] font-black text-white/20 uppercase">{t('Bo\'sh')}</span>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48" />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[44px] border border-slate-100 p-10 shadow-sm">
                 <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                    <Zap className="w-6 h-6 text-amber-500" />
                    {t('Shoshilinch Buyurtmalar')}
                 </h4>
                 <div className="space-y-4">
                    {activeOrders.filter(o => o.priority === 'URGENT').map((order) => (
                      <div key={order.id} className="flex items-center justify-between bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm">
                         <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{t('SHOSHILINCH BUYURTMA')}</p>
                            <h5 className="font-black text-slate-800">{order.product_name}</h5>
                            <p className="text-xs font-bold text-slate-400">{order.quantity} {t('dona')}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{t('Progress')}</p>
                            <div className="flex items-center gap-4">
                               <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${order.progress}%` }} />
                               </div>
                               <span className="text-sm font-black text-slate-900">{order.progress.toFixed(0)}%</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-[44px] border border-slate-100 p-10 shadow-sm">
                 <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                    <Users className="w-6 h-6 text-blue-500" />
                    {t('Operatorlar Holati')}
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                    {operators.map((op) => (
                      <div key={op.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                            <UserIcon className="w-6 h-6 text-slate-400" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800">{op.username}</p>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t(op.role_display)}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'ASSIGNMENT' && (
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Buyurtma')}</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Bosqich')}</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Holati')}</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mas\'ul')}</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeOrders.map((order) => (
                  order.stages?.map((stage) => (
                     <tr key={stage.id} className="hover:bg-slate-50/30 transition-all group">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                             <div>
                                <p className="font-black text-slate-900">{order.order_number}</p>
                                <p className="text-[10px] font-bold text-slate-400">{order.product_name}</p>
                             </div>
                             <button onClick={() => fetchRecipe(order)} className="p-2 text-slate-300 hover:text-blue-600"><Info className="w-4 h-4" /></button>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 ${getStageColor(stage.status)} rounded-lg flex items-center justify-center text-white`}>
                                {stage.sequence + 1}
                             </div>
                             <span className="font-black text-slate-700 text-sm uppercase tracking-widest">{t(stage.stage_type_display)}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                               stage.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                               stage.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                               'bg-slate-50 text-slate-400 border-slate-100'
                             }`}>
                               {t(stage.status_display)}
                             </span>
                             {stage.status === 'COMPLETED' && (
                                <button onClick={() => fetchQC(order.id)} className="text-emerald-500 hover:text-emerald-700"><ShieldCheck className="w-4 h-4" /></button>
                             )}
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          {stage.current_operator_name ? (
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><UserPlus className="w-4 h-4" /></div>
                               <span className="font-bold text-slate-700">{stage.current_operator_name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{t('Biriktirilmagan')}</span>
                          )}
                       </td>
                       <td className="px-10 py-8 text-right">
                          {stage.status !== 'COMPLETED' && (
                            <button 
                              onClick={() => { setSelectedStage({ ...stage, orderId: order.id }); setIsAssignModalOpen(true); }}
                              className="p-4 bg-slate-900 text-white rounded-[20px] shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100"
                            >
                               <UserPlus className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{t('Biriktirish')}</span>
                            </button>
                          )}
                       </td>
                     </tr>
                  ))
                ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white w-full max-w-xl rounded-[48px] overflow-hidden shadow-2xl"
             >
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900">{t('Operator Biriktirish')}</h3>
                      <p className="text-slate-400 font-medium">Stage: {t(selectedStage?.stage_type_display)}</p>
                   </div>
                   <button onClick={() => setIsAssignModalOpen(false)} className="p-4 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all">
                      <XCircle className="w-6 h-6" />
                   </button>
                </div>
                
                <div className="p-10 grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
                   {operators.map((op) => (
                      <button
                         key={op.id}
                         onClick={() => handleAssignTask(op.id as number)}
                         className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-blue-600 hover:text-white group transition-all"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-transparent text-slate-400 group-hover:text-blue-600 shadow-sm transition-all">
                               <Users className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                               <p className="font-black group-hover:text-white transition-all">{op.username}</p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60 transition-all">{t(op.role_display)}</p>
                            </div>
                         </div>
                         <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipe Modal */}
      <AnimatePresence>
         {isRecipeModalOpen && selectedRecipe && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl">
                  <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                     <div>
                        <h3 className="text-2xl font-black">{selectedRecipe.name}</h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{t('Mahsulot Retsepti / BOM')}</p>
                     </div>
                     <button onClick={() => setIsRecipeModalOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><XCircle className="w-6 h-6" /></button>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="grid grid-cols-1 gap-4">
                        {selectedRecipe.items.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                              <span className="font-black text-slate-700">{item.material_name}</span>
                              <span className="text-blue-600 font-black">{item.quantity} kg</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* QC Modal */}
      <AnimatePresence>
         {isQCModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl">
                  <div className="p-10 bg-emerald-600 text-white flex items-center justify-between">
                     <h3 className="text-2xl font-black">{t('Sifat Nazorati (QC)')}</h3>
                     <button onClick={() => setIsQCModalOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><XCircle className="w-6 h-6" /></button>
                  </div>
                  <div className="p-10">
                     {qcLogs.length > 0 ? (
                        <div className="space-y-4">
                           {qcLogs.map((log, i) => (
                              <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                 <div className="flex justify-between items-center mb-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${log.status === 'PASSED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                       {t(log.status_display)}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                                 </div>
                                 <p className="text-sm font-medium text-slate-700">{log.notes}</p>
                                 <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                    <span>Inspektor: {log.inspector_name}</span>
                                    <span>Brak: {log.waste_weight} kg</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-20">
                           <ShieldCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                           <p className="text-slate-400 font-black uppercase tracking-widest">{t('Ma\'lumotlar mavjud emas')}</p>
                        </div>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

const UserIcon = ({ className }: { className?: string }) => <Users className={className} />;
const X = ({ className }: { className?: string }) => <XCircle className={className} />;
