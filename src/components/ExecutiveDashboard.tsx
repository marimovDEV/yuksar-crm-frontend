import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Package, 
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Factory,
  Cpu,
  ShoppingCart,
  Truck,
  Database,
  Layers as LayersIcon,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Plus,
  BarChart3,
  Scale,
  Gauge,
  Radio,
  Timer,
  ChevronRight,
  MonitorDot
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';

const AreaTrendChart = lazy(() => import('./charts/AreaTrendChart'));

interface ExecutiveDashboardProps {
  onAction: (tabId: string) => void;
}

/* ─── Miniature Live Components ─── */

function MiniProductionFlow({ data }: { data: any }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Live Flow')}</span>
        </div>
        <span className="text-xl font-black text-slate-900">842 <span className="text-[10px] text-slate-400">kg/h</span></span>
      </div>
      <div className="h-12 w-full bg-slate-50 rounded-xl flex items-end gap-1 p-1 overflow-hidden">
        {[40, 65, 45, 90, 55, 75, 40, 85, 30, 95, 60, 45, 70, 50, 80].map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.02, duration: 1 }}
            className="flex-1 bg-indigo-500/20 rounded-sm"
          />
        ))}
      </div>
    </div>
  );
}

function MiniWarehouseStatus({ data }: { data: any }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('EPS Granula')}</p>
        <p className="text-sm font-black text-slate-900">12.4 <span className="text-[10px]">t</span></p>
      </div>
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('Tayyor Blok')}</p>
        <p className="text-sm font-black text-slate-900">320 <span className="text-[10px]">ta</span></p>
      </div>
    </div>
  );
}

function MiniQCStats({ data }: { data: any }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 shrink-0">
        <svg className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="#ef4444" strokeWidth="6" 
                  strokeDasharray={150} strokeDashoffset={150 * (1 - 0.021)} 
                  strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-rose-600">2.1%</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('Brak Foizi')}</p>
        <p className="text-xs font-bold text-slate-600 leading-tight">{t('Me\'yordan past')}</p>
      </div>
    </div>
  );
}

export default function ExecutiveDashboard({ onAction }: ExecutiveDashboardProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [strategicKpis, setStrategicKpis] = useState<any[]>([]);
  const [heuristics, setHeuristics] = useState<any>(null);
  const [financeStatus, setFinanceStatus] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await api.get('dashboard/summary/', { params: { period: 'month' } });
      const data = res.data;
      setStrategicKpis(data.strategicKpis || []);
      setHeuristics(data.heuristics || null);
      setFinanceStatus(data.finance_status || null);
      setPendingApprovals(data.pending_approvals || []);
    } catch (err) {
      console.error("Failed to fetch strategic data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fmtValue = (v: any, name: string) => {
    if (name?.includes('UZS') || name?.includes('Tushum') || name?.includes('Foyda') || name?.includes('Qiymati') || name?.includes('Daromad')) {
      const n = typeof v === 'number' ? v : parseFloat(String(v || '0').replace(/[^0-9.]/g, ''));
      if (isNaN(n)) return String(v || '0');
      return n.toLocaleString('ru-RU') + ' UZS';
    }
    return String(v || '0');
  };

  const chartFallback = <div className="h-[300px] animate-pulse rounded-[40px] bg-slate-100" />;

  if (loading && !heuristics) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Master Control Center Yuklanmoqda...')}</p>
    </div>
  );

  const gateways = [
    { 
      id: 'production', 
      name: 'Ishlab Chiqarish', 
      icon: Factory, 
      color: 'indigo', 
      desc: 'Real-vaqt monitoringi va MES boshqaruvi',
      component: <MiniProductionFlow data={null} />
    },
    { 
      id: 'warehouse', 
      name: 'Ombor Tizimi', 
      icon: Database, 
      color: 'blue', 
      desc: 'Xom-ashyo va tayyor mahsulot balansi',
      component: <MiniWarehouseStatus data={null} />
    },
    { 
      id: 'qc', 
      name: 'Sifat Nazorati', 
      icon: CheckCircle2, 
      color: 'rose', 
      desc: 'Brak tahlili va laboratoriya natijalari',
      component: <MiniQCStats data={null} />
    },
    { 
      id: 'finance', 
      name: 'Moliya & Kassa', 
      icon: DollarSign, 
      color: 'emerald', 
      desc: 'Cashflow, P&L va qarzdorlik tahlili',
      component: (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase">{t('Oylik Tushum')}</p>
          <p className="text-xl font-black text-slate-900 tracking-tight">{fmtValue(financeStatus?.revenue, 'UZS')}</p>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up pb-20 relative">
      
      {/* 🏛 MASTER CONTROL HEADER (GLOBAL LIVE OVERVIEW) */}
      <div className="bg-slate-950 text-white p-10 rounded-[64px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
         
         <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-12">
               <div className="flex items-center gap-10">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
                        <circle cx="72" cy="72" r="64" fill="none" stroke="url(#healthGradient)" strokeWidth="14" 
                                strokeDasharray={402} strokeDashoffset={402 - (402 * (heuristics?.business_health?.score || 85)) / 100} 
                                strokeLinecap="round" className="transition-all duration-1000" />
                        <defs>
                          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                     </svg>
                     <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-black tracking-tighter">{heuristics?.business_health?.score || 85}%</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">HEALTH</span>
                     </div>
                  </div>
                  <div>
                     <h1 className="text-4xl font-black tracking-tighter mb-3 leading-none">{t('Master Control Center')}</h1>
                     <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('Live Overview')}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold max-w-xs leading-tight">
                           {t('Zavod barcha tizimlari real-vaqt rejimida nazorat qilinmoqda')}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="px-10 py-6 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">{t('Oylik Tushum')}</p>
                     <p className="text-3xl font-black text-white tracking-tighter">{fmtValue(financeStatus?.revenue, 'UZS')}</p>
                  </div>
                  <button onClick={() => fetchData()} className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-600/40 group">
                     <Zap className="w-9 h-9 group-hover:rotate-12 transition-transform" />
                  </button>
               </div>
            </div>

            {/* AI STRATEGIC SUMMARY (QUICK VIEW) */}
            <div className="bg-white/5 border border-white/10 rounded-[44px] p-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 group hover:bg-white/10 transition-colors">
               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                  <MonitorDot className="w-8 h-8 text-indigo-400" />
               </div>
               <div className="flex-1">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">AI Summary</h3>
                  <p className="text-lg font-medium text-slate-300 italic leading-snug">
                     "{t(heuristics?.ai_recommendation || "Ishlab chiqarish samaradorligi 12% ga oshdi. Sifat nazoratida (QC) barqarorlik kuzatilmoqda.")}"
                  </p>
               </div>
               <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                     {t('Full Audit')}
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* 🚀 MODULE GATEWAYS (THE LIVE INTERFACE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {gateways.map((gate, i) => (
          <motion.button 
            key={gate.id}
            onClick={() => onAction && onAction(gate.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white p-8 rounded-[56px] border border-slate-100 shadow-premium hover:shadow-2xl hover:border-indigo-200 transition-all text-left flex flex-col h-[340px] relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-[24px] bg-${gate.color}-500/10 flex items-center justify-center text-${gate.color}-600 group-hover:bg-${gate.color}-500 group-hover:text-white transition-all duration-500 shadow-sm border border-${gate.color}-500/5`}>
                   <gate.icon className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                   <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
             </div>

             <div className="mb-auto relative z-10">
                <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{t(gate.name)}</h4>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">{t(gate.desc)}</p>
             </div>

             {/* Miniature Live Component Placeholder */}
             <div className="mt-6 pt-6 border-t border-slate-50 relative z-10">
                {gate.component}
             </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 🛡 TASDIQLASHLAR (QUICK ACTIONS) */}
         <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                     <CheckCircle2 className="w-7 h-7" />
                  </div>
                  {t('Tasdiqlar')}
               </h3>
               <span className="bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-full font-black">
                  {pendingApprovals.length}
               </span>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[400px]">
               {pendingApprovals.length > 0 ? pendingApprovals.map((app: any) => (
                  <div key={app.id} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 group hover:border-indigo-300 hover:bg-white hover:shadow-xl transition-all duration-300">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(app.module)}</span>
                        <div className={`w-2 h-2 rounded-full ${app.priority === 'HIGH' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                     </div>
                     <h4 className="text-sm font-black text-slate-900 mb-2 leading-tight">{app.title}</h4>
                     <div className="flex items-center gap-3 mt-4">
                        <button className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all">
                           {t('Ko\'rish')}
                        </button>
                        <button className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               )) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30 italic text-sm">
                     {t('Kutilayotgan tasdiqlar yo\'q')}
                  </div>
               )}
            </div>
         </div>

         {/* ⚠️ RISK & ALERT CENTER (SCADA STYLE) */}
         <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                     <ShieldAlert className="w-7 h-7" />
                  </div>
                  {t('Risk Control & Alerts')}
               </h3>
               <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t('Barchasi')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {heuristics?.strategic_metrics?.map((risk: any, i: number) => (
                  <div key={i} className={`p-6 rounded-[36px] border flex flex-col gap-3 group transition-all cursor-default ${risk.priority === 'CRITICAL' ? 'bg-rose-50/50 border-rose-100 hover:bg-rose-50' : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${risk.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                           <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h4 className={`text-sm font-black ${risk.priority === 'CRITICAL' ? 'text-rose-900' : 'text-amber-900'}`}>{t(risk.content)}</h4>
                     </div>
                     <p className="text-[11px] font-medium text-slate-500 leading-relaxed pl-1">
                        {t(risk.recommendation)}
                     </p>
                  </div>
               ))}
            </div>

            {/* Strategic Trend Preview */}
            <div className="mt-8 p-8 bg-slate-900 rounded-[44px] text-white">
               <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">{t('Oylik Tushum Trendi')}</h4>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" /> {t('Real')}
                     </div>
                     <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <div className="w-2 h-2 bg-slate-700 rounded-full" /> {t('Target')}
                     </div>
                  </div>
               </div>
               <div className="h-[120px] w-full">
                  <Suspense fallback={chartFallback}>
                     <AreaTrendChart period="month" />
                  </Suspense>
               </div>
            </div>
         </div>

      </div>
      
    </div>
  );
}
