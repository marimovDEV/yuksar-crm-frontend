import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Package, 
  Clock,
  Factory,
  Cpu,
  ShoppingCart,
  Truck,
  Database,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Plus,
  Layers,
  History,
  Trash2
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';

const AreaTrendChart = lazy(() => import('./charts/AreaTrendChart'));

interface DashboardProps {
  user: any;
  onAction?: (tabId: string) => void;
}

export default function Dashboard({ user, onAction }: DashboardProps) {
  const { locale, t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<any>({ intake: '0 kg', production: '0 dona', waste: '0 kg', sales_count: 0 });
  const [productionLines, setProductionLines] = useState<any[]>([]);
  const [factoryOverview, setFactoryOverview] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('dashboard/summary/', { params: { period: 'day' } });
      const data = res.data;

      setTodayStats(data.todayStats || { intake: '0 kg', production: '0 dona', waste: '0 kg', sales_count: 0 });
      setDynamicChartData(data.chartData || []);
      setProductionLines(data.production_lines || []);
      setRecentActivities(data.recentActivities || []);
      setFactoryOverview(data.factory_overview || null);
      setOrderStatus(data.order_status || null);
    } catch (err) {
      console.error("Failed to fetch operational data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartFallback = <div className="h-[300px] animate-pulse rounded-[40px] bg-slate-100" />;

  if (loading && !factoryOverview) return chartFallback;

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      
      {/* 🟢 OPERATSION HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
               <Activity className="w-8 h-8" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Operatsion Markaz')}</h2>
               <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">{t('Bugungi Ishlab Chiqarish va Nazorat')}</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => onAction?.('production')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
               {t('Sexga O\'tish')}
            </button>
         </div>
      </div>

      {/* 📊 BUGUNGI KPI (OPERATSION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bugungi Kirim', val: todayStats.intake, color: 'blue', icon: Database },
          { label: 'Tayyor Bloklar', val: todayStats.production, color: 'indigo', icon: Factory },
          { label: 'Sotuvlar', val: todayStats.sales_count, color: 'emerald', icon: ShoppingCart },
          { label: 'Chiqindi (Brak)', val: todayStats.waste, color: 'rose', icon: Trash2 },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium group hover:shadow-2xl transition-all"
          >
             <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6`}>
                <item.icon className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t(item.label)}</p>
             <h4 className="text-2xl font-black text-slate-900 tracking-tight">{item.val}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ISHLAB CHIQARISH LINIYALARI (LIVE) */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-7 h-7" />
                 </div>
                 {t('Liniyalar Holati')}
              </h3>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Monitoring</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productionLines.map((line: any) => (
                 <div key={line.id} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${line.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                          <Activity className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 mb-1">{line.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(line.status)}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-lg font-black text-slate-900">{line.efficiency}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Efficiency</span>
                    </div>
                 </div>
              ))}
           </div>

           <div className="mt-10 p-8 bg-indigo-900 rounded-[40px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <h4 className="text-lg font-black mb-1">{t('Bugungi Reja Bajarilishi')}</h4>
                    <p className="text-xs text-indigo-200 font-medium">{t('Zavod umumiy samaradorligi kutilganidan 4% yuqori')}</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="text-center">
                       <p className="text-3xl font-black text-white">{todayStats.target_pct || '94%'}</p>
                       <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Bajarildi</p>
                    </div>
                    <div className="w-16 h-16 relative">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="6" 
                                  strokeDasharray={176} strokeDashoffset={176 - (176 * 94) / 100} strokeLinecap="round" />
                       </svg>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* BUGUNGI HARAKATLAR (REAL-TIME FEED) */}
        <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center">
                    <History className="w-7 h-7" />
                 </div>
                 {t('So\'nggi Faollik')}
              </h3>
           </div>
           
           <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[500px]">
              {recentActivities.map((log: any, i: number) => (
                 <div key={log.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          <Activity className="w-5 h-5" />
                       </div>
                       {i !== recentActivities.length - 1 && <div className="w-px h-full bg-slate-100 my-1" />}
                    </div>
                    <div className="pb-6">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-slate-900">@{log.user}</span>
                          <span className="text-[9px] font-bold text-slate-400">{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{t(log.action)}</p>
                    </div>
                 </div>
              ))}
           </div>
           
           <button onClick={() => onAction?.('activity')} className="w-full py-4 mt-6 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
              {t('Barcha Harakatlar')}
           </button>
        </div>

        {/* BUYURTMALAR VA LOGISTIKA */}
        <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                 <Truck className="w-7 h-7" />
              </div>
              {t('Logistika & Yetkazish')}
           </h3>
           <div className="space-y-6">
              {[
                 { label: 'Tayyorlashda', val: orderStatus?.active, color: 'blue' },
                 { label: 'Yetkazilmoqda', val: orderStatus?.in_production, color: 'indigo' },
                 { label: 'Yakunlandi', val: orderStatus?.delivered, color: 'emerald' },
                 { label: 'Kechikmoqda', val: orderStatus?.delayed, color: 'rose' },
              ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t(item.label)}</span>
                    <span className={`text-xl font-black text-${item.color}-600`}>{item.val}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* OMBOX ZAXIRASI */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <Database className="w-7 h-7" />
                 </div>
                 {t('Ombor Zaxirasi')}
              </h3>
              <button onClick={() => onAction?.('warehouse')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">
                 {t('Batafsil')}
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-xl relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mb-12 blur-xl" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('SKU Mavjud')}</p>
                 <h4 className="text-3xl font-black">{todayStats.sku_count || '124'}</h4>
                 <div className="mt-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Optimized</span>
                 </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kritik Zaxira')}</span>
                       <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-2xl font-black text-rose-600">{todayStats.low_stock || '3'}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{t('Zudlik bilan to\'ldirish shart')}</p>
                 </div>
                 <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Yangi Kirim')}</span>
                       <Plus className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-emerald-600">{todayStats.intake}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{t('Oxirgi 24 soat ichida')}</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
      
    </div>
  );
}
