import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Truck, 
  AlertTriangle, 
  ChevronRight, 
  ArrowUpRight, 
  Users, 
  Factory,
  CheckCircle2,
  Clock,
  ArrowRight,
  MonitorDot,
  Layers,
  Archive,
  ShoppingCart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { motion } from 'motion/react';

/* ─── MINI COMPONENTS ─── */

const KPICard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend} <ArrowUpRight className="w-3 h-3" />
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
  </div>
);

const ActivityPanel = ({ title, subtitle, icon: Icon, children, onAction, color = "blue" }: any) => (
  <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
    <div className="p-8 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{title}</h3>
          <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
        </div>
      </div>
      <button 
        onClick={onAction}
        className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
    <div className="flex-1 px-8 pb-8">
      {children}
    </div>
  </div>
);

/* ─── MAIN DASHBOARD ─── */

export default function ExecutiveDashboard({ onAction }: { onAction: (id: string) => void }) {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Prevent requests if not authenticated to avoid 401 errors in console
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
    const interval = setInterval(fetchData, 30000); // 30s update
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
      
      {/* 🏙 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Direktor Boshqaruv Paneli')}</h1>
           <p className="text-slate-500 font-medium text-xs mt-1">{t('Zavodning real vaqtdagi operatsion ko\'rinishi')}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Live Monitoring')}</span>
           </div>
           <button 
             onClick={fetchData}
             className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
           >
              {t('Yangilash')}
           </button>
        </div>
      </div>

      {/* 📊 TOP KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard 
          title={t('Bugungi Ishlab Chiqarish')} 
          value={`${data?.production_status?.today_count || 0} blok`} 
          trend="+12%" 
          icon={Factory} 
          color="blue" 
        />
        <KPICard 
          title={t('Sotuvlar (Bugun)')} 
          value={`${data?.sales_status?.today_sales || 0} mln`} 
          trend="+5%" 
          icon={TrendingUp} 
          color="emerald" 
        />
        <KPICard 
          title={t('Tushum')} 
          value={`${(data?.finance_status?.revenue || 0).toLocaleString()} UZS`} 
          icon={DollarSign} 
          color="indigo" 
        />
        <KPICard 
          title={t('Brak Mahsulot')} 
          value={`${data?.heuristics?.strategic_metrics?.find((m: any) => m.id === 'defect_rate')?.score || 2.1}%`} 
          trend="-0.5%" 
          icon={AlertTriangle} 
          color="rose" 
        />
        <KPICard 
          title={t('Aktiv Buyurtmalar')} 
          value={String(data?.production_status?.active_orders_count || 0)} 
          icon={Package} 
          color="amber" 
        />
      </div>

      {/* 🚀 MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🏭 PRODUCTION LIVE */}
        <ActivityPanel 
          title={t('Ishlab Chiqarish')} 
          subtitle={t('Hozirgi aktiv liniyalar')} 
          icon={Activity}
          color="blue"
          onAction={() => onAction('production')}
        >
          <div className="space-y-6">
             {[
               { id: 1, name: "Kesish Liniyasi #1", batch: "B-221", operator: "Aliyev S.", progress: 82, status: "RUNNING" },
               { id: 2, name: "Press Liniyasi #2", batch: "B-219", operator: "Rasulov J.", progress: 45, status: "RUNNING" },
               { id: 3, name: "Ko'pirtirish", batch: "E-104", operator: "Nodirov K.", progress: 100, status: "IDLE" }
             ].map((line) => (
               <div key={line.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-black text-slate-800">{line.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">Batch: {line.batch} • {line.operator}</p>
                     </div>
                     <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${line.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {t(line.status)}
                     </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${line.progress}%` }}
                       className={`h-full ${line.progress === 100 ? 'bg-indigo-500' : 'bg-blue-500'}`}
                     />
                  </div>
               </div>
             ))}
          </div>
        </ActivityPanel>

        {/* 📦 WAREHOUSE & STOCK */}
        <ActivityPanel 
          title={t('Ombor & Stok')} 
          subtitle={t('Materiallar va tayyor mahsulot')} 
          icon={Archive}
          color="indigo"
          onAction={() => onAction('warehouse')}
        >
          <div className="space-y-6">
             <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Xomashyo Qoldig\'i')}</p>
                <div className="space-y-4">
                   {[
                     { name: 'EPS Granula', qty: '12.4', unit: 't', color: 'blue' },
                     { name: 'Polimer Qatlam', qty: '840', unit: 'm²', color: 'indigo' }
                   ].map(m => (
                     <div key={m.name} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{m.name}</span>
                        <span className="text-xs font-black text-slate-900">{m.qty} <span className="text-[10px] text-slate-400">{m.unit}</span></span>
                     </div>
                   ))}
                </div>
             </div>
             
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Bugungi Harakatlar')}</p>
                <div className="space-y-3">
                   {[
                     { type: 'RECEIPT', text: '500kg Granula qabul qilindi', time: '10:14' },
                     { type: 'ISSUE', text: '320 blok jo\'natildi', time: '09:45' }
                   ].map((h, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${h.type === 'RECEIPT' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <p className="text-[11px] font-medium text-slate-600 flex-1">{h.text}</p>
                        <span className="text-[10px] font-bold text-slate-400">{h.time}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </ActivityPanel>

        {/* 🚚 LOGISTICS & SALES */}
        <ActivityPanel 
          title={t('Logistika & Savdo')} 
          subtitle={t('Yuklash va yetkazib berish')} 
          icon={Truck}
          color="emerald"
          onAction={() => onAction('logistics')}
        >
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t('Yuklanmoqda')}</p>
                   <p className="text-2xl font-black text-emerald-700">2 <span className="text-xs">ta</span></p>
                </div>
                <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                   <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{t('Yo\'lda')}</p>
                   <p className="text-2xl font-black text-blue-700">5 <span className="text-xs">ta</span></p>
                </div>
             </div>

             <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('So\'nggi sotuvlar')}</h4>
                {[
                  { client: 'Stroy Invest LLC', amount: '12.5 mln', time: '12 daq oldin' },
                  { client: 'Akfa Build', amount: '4.2 mln', time: '45 daq oldin' }
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                     <div>
                        <p className="text-xs font-black text-slate-800">{s.client}</p>
                        <p className="text-[9px] font-bold text-slate-400">{s.time}</p>
                     </div>
                     <p className="text-sm font-black text-slate-900">{s.amount}</p>
                  </div>
                ))}
             </div>
          </div>
        </ActivityPanel>

      </div>

      {/* 🚨 RECENT ALERTS & TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* FINANCE CHART (SUBTLE) */}
         <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{t('Moliyaviy Dinamika')}</h3>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer">7 kun</span>
                  <span className="px-3 py-1 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer">30 kun</span>
               </div>
            </div>
            <div className="h-[240px] min-h-[240px] w-full">
               <ResponsiveContainer width="100%" height="100%" minHeight={200} debounce={50}>
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
                       <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white" />
                    </div>
                  ))}
               </div>
            </div>
         </div>

      </div>

      {/* 🚀 QUICK ACCESS BAR */}
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

    </div>
  );
}
