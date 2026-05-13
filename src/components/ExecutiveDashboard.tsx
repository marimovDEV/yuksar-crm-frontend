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
  Scale
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';

const AreaTrendChart = lazy(() => import('./charts/AreaTrendChart'));

interface ExecutiveDashboardProps {
  onAction?: (tabId: string) => void;
}

export default function ExecutiveDashboard({ onAction }: ExecutiveDashboardProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [strategicKpis, setStrategicKpis] = useState<any[]>([]);
  const [heuristics, setHeuristics] = useState<any>(null);
  const [financeStatus, setFinanceStatus] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('dashboard/summary/', { params: { period: 'month' } });
      const data = res.data;

      setStrategicKpis(data.strategicKpis || []);
      setHeuristics(data.heuristics || null);
      setFinanceStatus(data.finance_status || null);
      setPendingApprovals(data.pending_approvals || []);
      setRealTimeStatus(data.real_time_status || null);
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
    if (name.includes('UZS') || name.includes('Tushum') || name.includes('Foyda') || name.includes('Qiymati') || name.includes('Daromad')) {
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
      if (isNaN(n)) return String(v);
      return n.toLocaleString('ru-RU') + ' UZS';
    }
    return String(v);
  };

  const chartFallback = <div className="h-[300px] animate-pulse rounded-[40px] bg-slate-100" />;

  if (loading && !heuristics) return chartFallback;

  return (
    <div className="space-y-8 animate-slide-up pb-20 relative">
      
      {/* 🏛 STRATEGIK HEADER (KORXONA SALOMATLIGI) */}
      <div className="bg-slate-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                     <circle cx="64" cy="64" r="58" fill="none" stroke="#4f46e5" strokeWidth="12" 
                             strokeDasharray={364} strokeDashoffset={364 - (364 * (heuristics?.business_health?.score || 0)) / 100} 
                             strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <span className="absolute text-3xl font-black">{heuristics?.business_health?.score || 0}%</span>
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">{t('Korxona Strategik Holati')}</h2>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full pulse-slow" />
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{t(heuristics?.business_health?.status || 'Stable Growth')}</span>
                     </div>
                     <span className="text-slate-700">|</span>
                     <p className="text-xs text-slate-400 font-bold">{t('Barcha bo\'limlar muvaffaqiyatli integratsiya qilingan')}</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-[32px] text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Yillik Daromad')}</p>
                  <p className="text-2xl font-black text-white">12.4B UZS</p>
               </div>
               <button onClick={() => fetchData()} className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20">
                  <Zap className="w-7 h-7" />
               </button>
            </div>
         </div>
      </div>

      {/* 💰 MOLIYAVIY KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Oylik Tushum', val: financeStatus?.revenue, trend: '+12.4%', color: 'emerald', icon: TrendingUp },
          { label: 'Sof Foyda', val: financeStatus?.profit, trend: '+8.2%', color: 'indigo', icon: DollarSign },
          { label: 'Cashflow', val: financeStatus?.cashflow, trend: 'Stable', color: 'blue', icon: Activity },
          { label: 'Debitorlik', val: financeStatus?.receivables, trend: '-2.1%', color: 'rose', icon: Scale },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium group relative overflow-hidden"
          >
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className={`w-14 h-14 rounded-[20px] bg-${kpi.color}-500/10 flex items-center justify-center text-${kpi.color}-600 shadow-sm border border-${kpi.color}-500/5`}>
                      <kpi.icon className="w-7 h-7" />
                   </div>
                   <div className={`text-[11px] font-black ${kpi.trend.startsWith('+') ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'} px-3 py-1.5 rounded-xl border border-current opacity-70`}>
                      {kpi.trend}
                   </div>
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{t(kpi.label)}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{fmtValue(kpi.val, 'UZS')}</h4>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 🎯 SAVDO VA BOZOR TAHLILI */}
         <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium overflow-hidden relative">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                     <BarChart3 className="w-7 h-7" />
                  </div>
                  {t('Strategik Savdo Trendi')}
               </h3>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                     <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                     {t('Haqiqiy')}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                     <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                     {t('Prognoz')}
                  </div>
               </div>
            </div>
            
            <div className="h-[350px] w-full">
               <Suspense fallback={chartFallback}>
                  <AreaTrendChart period="month" />
               </Suspense>
            </div>
         </div>

         {/* 🛡 TASDIQLASHLAR VA NAZORAT */}
         <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                     <CheckCircle2 className="w-7 h-7" />
                  </div>
                  {t('Direktor Tasdiqlari')}
               </h3>
               <span className="bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-full font-black">
                  {pendingApprovals.length}
               </span>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[450px]">
               {pendingApprovals.map((app: any) => (
                  <div key={app.id} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 group hover:border-emerald-300 hover:bg-white hover:shadow-xl transition-all duration-300">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(app.module)}</span>
                        <div className={`w-2 h-2 rounded-full ${app.priority === 'HIGH' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                     </div>
                     <h4 className="text-sm font-black text-slate-900 mb-2 leading-tight">{app.title}</h4>
                     <p className="text-[11px] text-slate-500 mb-6 font-medium leading-relaxed">{app.description}</p>
                     <div className="flex items-center gap-3">
                        <button className="flex-1 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all">
                           {t('Tasdiqlash')}
                        </button>
                        <button className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* ⚠️ STRATEGIK RISKLAR */}
         <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
               </div>
               {t('Strategik Risklar')}
            </h3>
            <div className="space-y-4">
               {heuristics?.strategic_metrics?.map((risk: any, i: number) => (
                  <div key={i} className={`p-6 rounded-[32px] border ${risk.priority === 'CRITICAL' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                     <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className={`w-4 h-4 ${risk.priority === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'}`} />
                        <h4 className={`text-sm font-black ${risk.priority === 'CRITICAL' ? 'text-rose-900' : 'text-amber-900'}`}>{t(risk.content)}</h4>
                     </div>
                     <p className={`text-[11px] font-medium leading-relaxed italic ${risk.priority === 'CRITICAL' ? 'text-rose-600/70' : 'text-amber-600/70'}`}>
                        "{t(risk.recommendation)}"
                     </p>
                  </div>
               ))}
            </div>
         </div>

         {/* 🤖 AI STRATEGIK INSIGHTS */}
         <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 rounded-[64px] text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
               <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center shrink-0 border border-white/20">
                  <Zap className="w-12 h-12 text-white animate-pulse" />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{t('Sun\'iy Intellekt Tahlili')}</h3>
                  <p className="text-lg font-medium text-indigo-100/90 leading-relaxed italic mb-8">
                     "{t(heuristics?.ai_recommendation || "Korxonaning oylik samaradorligi o'tgan yilga nisbatan 14% ga oshdi. Logistika xarajatlarini optimallashtirish imkoniyati mavjud.")}"
                  </p>
                  <div className="flex items-center gap-6">
                     <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                        {t('To\'liq Hisobot')}
                     </button>
                     <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:translate-x-2 transition-transform">
                        {t('Batafsil')}
                        <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

      </div>
      
    </div>
  );
}
