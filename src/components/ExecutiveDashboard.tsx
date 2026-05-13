import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Activity, 
  TrendingUp, 
  ArrowUpRight,
  ShieldAlert,
  Factory,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  MonitorDot,
  Gauge,
  Thermometer,
  Wind,
  Box,
  Truck,
  Layers,
  Settings2,
  Maximize2,
  Clock
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';

const AreaTrendChart = lazy(() => import('./charts/AreaTrendChart'));

interface ExecutiveDashboardProps {
  onAction: (tabId: string) => void;
}

/* ─── Factory Digital Twin Components ─── */

function EquipmentNode({ 
  id, name, status, value, unit, icon: Icon, cx, cy, onClick 
}: { 
  id: string; name: string; status: 'active'|'warning'|'error'|'offline'; 
  value: string; unit: string; icon: any; cx: number; cy: number; onClick: () => void 
}) {
  const { t } = useI18n();
  const colors = {
    active: 'text-emerald-400 stroke-emerald-500/50 fill-emerald-500/10',
    warning: 'text-amber-400 stroke-amber-500/50 fill-amber-500/10',
    error: 'text-rose-400 stroke-rose-500/50 fill-rose-500/10',
    offline: 'text-slate-500 stroke-slate-500/30 fill-slate-500/5'
  };

  return (
    <motion.g 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      {/* Glow Effect */}
      <circle cx={cx} cy={cy} r="60" className={`${colors[status]} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
      
      {/* Machine Body */}
      <rect x={cx - 50} y={cy - 40} width="100" height="80" rx="20" className={`${colors[status]} stroke-2 transition-colors duration-500`} />
      <rect x={cx - 42} y={cy - 32} width="84" height="64" rx="14" className="fill-slate-900/40" />

      {/* Status Light */}
      <circle cx={cx + 35} cy={cy - 25} r="4" className={status === 'active' ? 'fill-emerald-500 animate-pulse' : status === 'warning' ? 'fill-amber-500 animate-bounce' : 'fill-rose-500'} />
      
      {/* Icon */}
      <foreignObject x={cx - 15} y={cy - 25} width="30" height="30">
        <Icon className={`w-full h-full ${colors[status].split(' ')[0]}`} />
      </foreignObject>

      {/* Label & Value */}
      <text x={cx} y={cy + 58} textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">{t(name)}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" className="text-sm font-black fill-white tracking-tighter">
        {value} <tspan className="text-[10px] fill-slate-500">{unit}</tspan>
      </text>

      {/* Interactive Tooltip / Detail Hint */}
      <motion.circle 
        cx={cx + 35} cy={cy + 25} r="8" 
        className="fill-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <text x={cx + 35} y={cy + 28} textAnchor="middle" className="text-[8px] font-black fill-white pointer-events-none opacity-0 group-hover:opacity-100">+</text>
    </motion.g>
  );
}

function FlowPath({ d, active }: { d: string; active: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" strokeLinecap="round" />
      <path d={d} fill="none" stroke="rgba(79, 70, 229, 0.1)" strokeWidth="6" strokeLinecap="round" />
      {active && (
        <path d={d} fill="none" stroke="url(#flowGradient)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray="10, 20" className="animate-flow-dash" />
      )}
    </g>
  );
}

export default function ExecutiveDashboard({ onAction }: ExecutiveDashboardProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('dashboard/summary/', { params: { period: 'month' } });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch factory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s for Digital Twin feel
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
       <motion.div 
         animate={{ rotate: 360 }} 
         transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
         className="w-20 h-20 border-b-4 border-r-4 border-indigo-500 rounded-full" 
       />
       <h2 className="text-xl font-black text-indigo-400 uppercase tracking-[0.4em]">{t('Synchronizing Factory Data...')}</h2>
    </div>
  );

  return (
    <div className="fixed inset-0 top-[64px] bg-[#060e1e] overflow-hidden flex flex-col">
      
      {/* 🏙 SCADA TOP OVERLAY (HUD) */}
      <div className="absolute top-8 left-8 right-8 z-20 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 bg-emerald-500 rounded-sm animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{t('Yuksar Digital Twin v1.0')}</h1>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] pl-7 opacity-70">Industrial MES Interface</p>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
           <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[32px] flex items-center gap-10">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('Oylik Tushum')}</p>
                <p className="text-xl font-black text-white tracking-tighter">{(data.finance_status?.revenue || 0).toLocaleString()} UZS</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('Zavod Holati')}</p>
                <p className="text-xl font-black text-emerald-400 tracking-tighter">{data.heuristics?.business_health?.score || 85}%</p>
              </div>
           </div>
           <button onClick={() => fetchData()} className="w-16 h-16 bg-indigo-600/20 border border-indigo-600/30 rounded-2xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all backdrop-blur-md shadow-2xl">
              <Zap className="w-8 h-8" />
           </button>
        </div>
      </div>

      {/* 🏭 MAIN FACTORY MAP (THE HEART) */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 1600 900" className="w-full h-full object-contain filter drop-shadow-2xl">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
            <style>{`
              @keyframes flow { to { stroke-dashoffset: -30; } }
              .animate-flow-dash { animation: flow 1s linear infinite; }
            `}</style>
          </defs>

          {/* BACKGROUND GRID */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* FLOW PATHS */}
          <FlowPath d="M 200 300 H 400" active={true} /> {/* Silo -> Expander */}
          <FlowPath d="M 400 300 V 150 H 600" active={true} /> {/* Expander -> Aging */}
          <FlowPath d="M 600 150 V 450 H 800" active={true} /> {/* Aging -> Press */}
          <FlowPath d="M 800 450 H 1100" active={true} /> {/* Press -> Cutting */}
          <FlowPath d="M 1100 450 V 650 H 1300" active={true} /> {/* Cutting -> QC */}
          <FlowPath d="M 1300 650 H 1450" active={true} /> {/* QC -> Warehouse */}

          {/* EQUIPMENT NODES */}
          <EquipmentNode id="warehouse" name="Xomashyo Silo" status="active" value="12.4" unit="t" icon={Database} cx={200} cy={300} onClick={() => onAction('warehouse')} />
          <EquipmentNode id="production" name="Ko'pirtirish" status="active" value="842" unit="kg/h" icon={Wind} cx={400} cy={300} onClick={() => onAction('production')} />
          <EquipmentNode id="production-aging" name="Quritish (Aging)" status="active" value="24" unit="blok" icon={Clock} cx={600} cy={150} onClick={() => onAction('production')} />
          <EquipmentNode id="production-press" name="Press (Formovka)" status="active" value="4.2" unit="bar" icon={Layers} cx={800} cy={450} onClick={() => onAction('production')} />
          <EquipmentNode id="cnc" name="Kesish (CNC)" status="active" value="12" unit="m/min" icon={Cpu} cx={1100} cy={450} onClick={() => onAction('production')} />
          <EquipmentNode id="qc" name="Sifat Nazorati" status="warning" value="2.1" unit="%" icon={CheckCircle2} cx={1300} cy={650} onClick={() => onAction('qc')} />
          <EquipmentNode id="warehouse-ready" name="Tayyor Ombor" status="active" value="320" unit="blok" icon={Box} cx={1500} cy={650} onClick={() => onAction('warehouse')} />
        </svg>

        {/* 📟 SIDEBAR HUD (KPI LIST) */}
        <div className="absolute top-40 right-8 w-80 space-y-4">
           <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[40px] shadow-2xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                {t('System Diagnostics')}
                <Settings2 className="w-3 h-3" />
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Real-time Tushum', val: (data.finance_status?.revenue || 0).toLocaleString(), icon: DollarSign, color: 'text-emerald-400' },
                   { label: 'Aktiv Ishlar', val: '14', icon: Activity, color: 'text-indigo-400' },
                   { label: 'Brak Foizi', val: '2.1%', icon: AlertTriangle, color: 'text-rose-400' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-default">
                      <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">{t(item.label)}</p>
                        <p className="text-sm font-black text-white tracking-tight">{item.val}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-indigo-600 p-6 rounded-[40px] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                 <h4 className="text-xs font-black text-white/70 uppercase tracking-widest mb-2">{t('AI Insights')}</h4>
                 <p className="text-xs font-bold text-white leading-relaxed italic line-clamp-3">
                   "{t(data.heuristics?.ai_recommendation || "Production efficiency increased by 14%. Potential to optimize logistics routes for tomorrow.")}"
                 </p>
                 <button className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-indigo-100 tracking-widest hover:translate-x-1 transition-transform">
                    {t('Detail')} <ChevronRight className="w-3 h-3" />
                 </button>
              </div>
           </div>
        </div>

        {/* 🚨 LIVE ALERT FEED (BOTTOM OVERLAY) */}
        <div className="absolute bottom-8 left-8 max-w-md">
           <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-rose-600/30">
                {t('Live Alerts')}
              </div>
              <span className="text-[10px] font-bold text-slate-500">{t('Real-time feed active')}</span>
           </div>
           <div className="space-y-2">
              {data.heuristics?.strategic_metrics?.slice(0, 2).map((alert: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-slate-900/80 backdrop-blur-md border-l-4 border-l-rose-500 p-4 rounded-r-2xl border-y border-r border-white/5 flex items-center gap-4 group hover:bg-slate-800 transition-colors cursor-pointer"
                >
                   <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <ShieldAlert className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[11px] font-black text-white leading-tight mb-1">{t(alert.content)}</p>
                      <p className="text-[9px] font-bold text-slate-500 line-clamp-1">{t(alert.recommendation)}</p>
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                </motion.div>
              ))}
           </div>
        </div>
      </div>

      {/* 🗺 BOTTOM GLOBAL NAVIGATION (MINI) */}
      <div className="h-20 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-20">
         {[
           { id: 'dashboard', icon: MonitorDot, label: 'Control Center' },
           { id: 'production', icon: Factory, label: 'MES Center' },
           { id: 'warehouse', icon: Database, label: 'SCM Center' },
           { id: 'sales', icon: ShoppingCart, label: 'Sales CRM' },
           { id: 'finance', icon: DollarSign, label: 'Finance' },
         ].map((item) => (
           <button 
             key={item.id}
             onClick={() => onAction(item.id)}
             className="flex items-center gap-3 px-6 py-2.5 rounded-2xl hover:bg-white/5 transition-all group"
           >
              <item.icon className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <span className="text-[10px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest transition-colors">{t(item.label)}</span>
           </button>
         ))}
      </div>

    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ShoppingCart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
