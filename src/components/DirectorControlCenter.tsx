import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Package, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  MonitorDot, 
  Plus,
  Pause,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Activity,
  Archive,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useI18n } from '../i18n';

/* ─── MINI COMPONENTS ─── */

const StatCard = ({ icon: Icon, title, value, subtitle, footer, color, progress }: any) => (
  <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-xl transition-all group">
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tight">{title}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{value}</span>
            {subtitle && <span className="text-sm font-bold text-slate-400">{subtitle}</span>}
          </div>
        </div>
      </div>

      {progress !== undefined && (
        <div className="space-y-3 mb-6">
           <div className="flex justify-between items-end">
              <div className="flex gap-1">
                 <div className="w-1.5 h-3 bg-slate-100 rounded-full" />
                 <div className="w-1.5 h-5 bg-slate-100 rounded-full" />
                 <div className="w-1.5 h-4 bg-slate-100 rounded-full" />
              </div>
              <span className="text-xs font-black text-slate-900">{progress}%</span>
           </div>
           <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full ${color === 'rose' ? 'bg-rose-400' : 'bg-emerald-400'}`}
              />
           </div>
        </div>
      )}
    </div>

    {footer && (
      <button className="flex items-center justify-between w-full p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
        <span className="text-[10px] font-black uppercase tracking-widest ml-2">{footer}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    )}
  </div>
);

const PulseCard = ({ type, title, value, subValue, output, density, trend, color }: any) => (
  <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-50 space-y-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {type === 'sales' ? <TrendingUp className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-xs font-black text-slate-900">{title}</p>
        <p className="text-xl font-black text-slate-900">{value} <span className="text-xs font-bold text-slate-400">mln sum</span></p>
      </div>
    </div>

    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
       <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className={`h-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
    </div>

    {output !== undefined && (
      <div className="space-y-4 pt-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Vyxod:</span>
          <span className="text-slate-900 font-black">{output} blokov</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Plotnost:</span>
          <span className="text-slate-900 font-black">{density}</span>
        </div>
        
        <div className="flex gap-3 pt-2">
           <button className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              <Pause className="w-3 h-3 fill-current" /> Pauza
           </button>
           <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              Zavershit
           </button>
        </div>
      </div>
    )}
  </div>
);

export default function DirectorControlCenter({ onAction }: { onAction: (id: string) => void }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await api.get('dashboard/summary/');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 pb-32 bg-[#F8FAFC] min-h-screen space-y-10">
      
      {/* 🏙 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Direktor Boshqaruv Paneli')}</h1>
           <p className="text-slate-500 font-medium text-xs mt-1">{t('Zavodning real vaqtdagi operatsion ko\'rinishi')}</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={fetchData}
             className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
           >
              {t('Yangilash')}
           </button>
        </div>
      </div>

      {/* ─── TOP KPI GRID (IMAGE DESIGN) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={Factory} 
          title={t("Ishlab chiqarish")} 
          value={data?.production_status?.today_count || "0"} 
          subtitle="blok" 
          footer="Probili segodnya" 
          color="blue" 
        />
        <StatCard 
          icon={Package} 
          title={t("Skladlar")} 
          value="921" 
          subtitle="mln sum" 
          footer="Vsego v materialax" 
          color="emerald" 
        />
        <StatCard 
          icon={Truck} 
          title={t("Otgruzki")} 
          value="4" 
          subtitle="raboty | 7t" 
          progress={60}
          color="emerald" 
        />
        <StatCard 
          icon={ShoppingCart} 
          title={t("Zakupki")} 
          value={data?.finance_status?.purchases || "145"} 
          subtitle="mln sum" 
          progress={60}
          color="rose" 
        />
      </div>

      {/* ─── BIZNES PULS (IMAGE DESIGN) ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <MonitorDot className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">{t('Biznes-puls')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <PulseCard type="sales" title="Prodaji" value="5,3" color="blue" />
           <PulseCard type="prod" title="Proizvodstvo" value="18,5" color="emerald" />
           
           <PulseCard 
             type="sales" 
             title="Prodaji" 
             value="5,3" 
             color="blue" 
             output={8} 
             density={18} 
           />
           <PulseCard 
             type="prod" 
             title="Proizvodstvo" 
             value="18,5" 
             color="emerald" 
             output={10} 
             density={25}
             trend="-5,5%" 
           />
        </div>
      </div>

      {/* 🚨 RECENT ALERTS & TRENDS (MERGED FROM OLD) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* FINANCE CHART */}
         <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{t('Moliyaviy Dinamika')}</h3>
            </div>
            <div className="h-[300px] min-h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%" minHeight={250} debounce={50}>
                  <AreaChart data={[
                    { day: 'Mon', val: 42 }, { day: 'Tue', val: 38 }, { day: 'Wed', val: 55 },
                    { day: 'Thu', val: 48 }, { day: 'Fri', val: 72 }, { day: 'Sat', val: 65 },
                    { day: 'Sun', val: 58 }
                  ]}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'black' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* CRITICAL ALERTS */}
         <div className="bg-slate-900 p-8 rounded-[48px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-white/5 opacity-10">
               <AlertTriangle className="w-48 h-48" />
            </div>
            <div className="relative z-10">
               <h3 className="text-sm font-black text-white uppercase tracking-wider mb-8 flex items-center gap-2">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                 {t('Muhim Bildirishnomalar')}
               </h3>
               <div className="space-y-4">
                  {data?.heuristics?.strategic_metrics?.slice(0, 3).map((alert: any, i: number) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-5 group hover:bg-white/10 transition-colors cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <p className="text-xs font-black text-white leading-tight mb-1">{t(alert.content)}</p>
                          <p className="text-[10px] font-medium text-slate-400">{t(alert.recommendation)}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* 🚀 QUICK ACCESS BAR (OLD) */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap items-center justify-around gap-6">
         {[
           { id: 'production', label: t('Ishlab Chiqarish'), icon: Factory },
           { id: 'warehouse', label: t('Ombor'), icon: Archive },
           { id: 'sales', label: t('Savdo CRM'), icon: ShoppingCart },
           { id: 'finance', label: t('Moliya'), icon: DollarSign },
           { id: 'logistics', label: t('Logistika'), icon: Truck }
         ].map((nav) => (
           <button 
             key={nav.id}
             onClick={() => onAction(nav.id)}
             className="flex items-center gap-3 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all group"
           >
              <nav.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest">{nav.label}</span>
           </button>
         ))}
      </div>

      {/* ─── FLOATING ACTION ─── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-8 z-50">
        <button className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all">
          <Plus className="w-5 h-5" />
          {t('Sozdat Partiyu')}
        </button>
      </div>

    </div>
  );
}
