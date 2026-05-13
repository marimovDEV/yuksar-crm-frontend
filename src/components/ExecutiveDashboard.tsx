import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Activity, 
  TrendingUp, 
  ShieldAlert,
  Zap,
  ArrowRight,
  MonitorDot,
  Settings2,
  ChevronRight,
  ShoppingCart,
  Database,
  Factory,
  CheckCircle2,
  AlertTriangle,
  History,
  Box,
  Truck,
  RotateCcw
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';

/* ─── INDUSTRIAL SCADA OBJECTS (COMPLEX SVGS) ─── */

const SiloObject = ({ x, y, level, status }: any) => (
  <g transform={`translate(${x},${y})`} className="group/silo cursor-pointer">
    <defs>
      <linearGradient id="siloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    {/* Legs */}
    <rect x="-35" y="80" width="8" height="30" fill="#0f172a" />
    <rect x="27" y="80" width="8" height="30" fill="#0f172a" />
    {/* Body */}
    <path d="M -40 0 L 40 0 L 40 80 L 0 100 L -40 80 Z" fill="url(#siloGrad)" stroke="#475569" strokeWidth="2" />
    {/* Level Indicator */}
    <rect x="-30" y={80 - (80 * level / 100)} width="60" height={80 * level / 100} fill="#3b82f6" opacity="0.3" className="transition-all duration-1000" />
    <rect x="-30" y="0" width="60" height="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    {/* Top Cap */}
    <path d="M -40 0 Q 0 -20 40 0" fill="#334155" stroke="#475569" strokeWidth="2" />
    
    <text y="130" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-widest">Silo A-1</text>
    <text y="50" textAnchor="middle" className="fill-white text-xs font-black">{level}%</text>
  </g>
);

const ExpanderObject = ({ x, y, active }: any) => (
  <g transform={`translate(${x},${y})`} className="group/expander cursor-pointer">
    {/* Machine Base */}
    <rect x="-50" y="40" width="100" height="40" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    {/* Main Chamber */}
    <circle r="45" fill="#334155" stroke="#475569" strokeWidth="2" />
    <circle r="35" fill="#0f172a" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    
    {/* Spinning Impeller */}
    <motion.g
      animate={active ? { rotate: 360 } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
       <rect x="-2" y="-30" width="4" height="60" fill="#475569" rx="2" />
       <rect x="-30" y="-2" width="60" height="4" fill="#475569" rx="2" />
    </motion.g>

    {/* Steam / Heat Glow */}
    {active && (
      <motion.circle
        r="40"
        fill="radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="fill-rose-500/10 pointer-events-none"
      />
    )}

    <text y="100" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-widest">Expander</text>
  </g>
);

const PressObject = ({ x, y, active }: any) => (
  <g transform={`translate(${x},${y})`} className="group/press cursor-pointer">
    {/* Vertical Frame */}
    <rect x="-60" y="-20" width="10" height="120" fill="#1e293b" />
    <rect x="50" y="-20" width="10" height="120" fill="#1e293b" />
    <rect x="-60" y="-30" width="120" height="15" fill="#334155" />
    <rect x="-60" y="100" width="120" height="15" fill="#334155" />

    {/* Moving Piston */}
    <motion.rect
      x="-45"
      width="90"
      height="20"
      fill="#475569"
      animate={active ? { y: [0, 75, 0] } : { y: 0 }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      stroke="#64748b"
      strokeWidth="2"
    />

    <text y="135" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-widest">Block Press</text>
  </g>
);

const CNCObject = ({ x, y, active }: any) => (
  <g transform={`translate(${x},${y})`} className="group/cnc cursor-pointer">
    {/* Conveyor Bed */}
    <rect x="-100" y="40" width="200" height="20" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    
    {/* CNC Bridge */}
    <rect x="-10" y="-40" width="20" height="80" fill="#334155" stroke="#475569" strokeWidth="2" />
    
    {/* Cutting Tool */}
    <motion.g
      animate={active ? { x: [-80, 80, -80] } : {}}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    >
       <rect x="-5" y="10" width="10" height="40" fill="#3b82f6" rx="2" />
       <motion.circle 
         r="3" cx="0" cy="50" 
         fill="#fbbf24" 
         animate={active ? { opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] } : { opacity: 0 }}
         transition={{ duration: 0.1, repeat: Infinity }}
       />
    </motion.g>

    <text y="85" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-widest">CNC Cutting</text>
  </g>
);

const PipeFlow = ({ d, active, color = "#3b82f6" }: any) => (
  <g>
    <path d={d} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeLinecap="round" />
    <path d={d} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" strokeLinecap="round" />
    {active && (
      <path 
        d={d} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeDasharray="4, 20" 
        strokeLinecap="round"
        className="animate-flow-dash" 
      />
    )}
  </g>
);

/* ─── MAIN COMPONENT ─── */

export default function ExecutiveDashboard({ onAction }: { onAction: (id: string) => void }) {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('dashboard/summary/');
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return (
    <div className="h-screen bg-[#05080f] flex items-center justify-center">
       <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fixed inset-0 top-[64px] bg-[#05080f] overflow-hidden">
       {/* Industrial Ambient Grid */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

       {/* 🏙 HUD OVERLAYS */}
       <div className="absolute top-10 left-10 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 bg-indigo-500 rounded-sm shadow-[0_0_20px_rgba(79,70,229,0.8)]" />
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t('Yuksar Digital Twin')}</h1>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] pl-7 opacity-60">Master Control Center v2.0</p>
       </div>

       {/* 📊 GLOBAL STATS (TOP RIGHT) */}
       <div className="absolute top-10 right-10 z-20 flex items-center gap-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-[40px] flex items-center gap-12 shadow-2xl">
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Oylik Tushum')}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{(data?.finance_status?.revenue || 0).toLocaleString()} <span className="text-xs text-slate-500">UZS</span></p>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Sifat Indeksi')}</p>
                <p className="text-2xl font-black text-emerald-400 tracking-tighter">98.4%</p>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Energy Load')}</p>
                <p className="text-2xl font-black text-amber-400 tracking-tighter">42.8 <span className="text-xs text-slate-500">kW</span></p>
             </div>
          </div>
       </div>

       {/* 🏭 THE FACTORY WORLD (SCADA SVG) */}
       <div className="w-full h-full p-20 flex items-center justify-center">
          <svg viewBox="0 0 1600 900" className="w-full h-full max-w-[1400px] overflow-visible">
             <defs>
                <style>{`
                  @keyframes flow { to { stroke-dashoffset: -24; } }
                  .animate-flow-dash { animation: flow 0.8s linear infinite; }
                `}</style>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
             </defs>

             {/* Animated Pipelines */}
             <PipeFlow d="M 150 450 H 450" active={true} />
             <PipeFlow d="M 450 450 V 250 H 750" active={true} color="#fbbf24" />
             <PipeFlow d="M 750 250 V 450 H 1050" active={true} color="#10b981" />
             <PipeFlow d="M 1050 450 H 1350" active={true} color="#3b82f6" />

             {/* Industrial Objects */}
             <g onClick={() => onAction('warehouse')}>
                <SiloObject x={150} y={400} level={68} />
             </g>
             
             <g onClick={() => onAction('production')}>
                <ExpanderObject x={450} y={450} active={true} />
             </g>

             <g onClick={() => onAction('production')}>
                <motion.g 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transform="translate(750, 200)"
                >
                   <rect x="-80" y="-40" width="160" height="120" rx="20" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                   <text y="100" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-widest">Aging Racks</text>
                   {/* Mini pulsing blocks inside */}
                   {[-40, 0, 40].map((bx, bi) => (
                     <motion.rect 
                       key={bi} x={bx-15} y="10" width="30" height="30" rx="4" fill="#334155" 
                       animate={{ fill: ["#334155", "#475569", "#334155"] }}
                       transition={{ duration: 2, delay: bi * 0.5, repeat: Infinity }}
                     />
                   ))}
                </motion.g>
             </g>

             <g onClick={() => onAction('production')}>
                <PressObject x={1050} y={420} active={true} />
             </g>

             <g onClick={() => onAction('production')}>
                <CNCObject x={1350} y={450} active={true} />
             </g>

             {/* Connection Nodes HUDs */}
             <foreignObject x={400} y={560} width="100" height="60">
                <div className="bg-slate-900/60 border border-white/5 p-2 rounded-xl text-center">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Temp</p>
                   <p className="text-xs font-black text-white">72.4°C</p>
                </div>
             </foreignObject>
             <foreignObject x={1000} y={560} width="100" height="60">
                <div className="bg-slate-900/60 border border-white/5 p-2 rounded-xl text-center">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Pressure</p>
                   <p className="text-xs font-black text-white">4.2 bar</p>
                </div>
             </foreignObject>
          </svg>
       </div>

       {/* 📟 OPERATIONAL FEED (BOTTOM LEFT) */}
       <div className="absolute bottom-10 left-10 w-96 space-y-4">
          <div className="flex items-center gap-3 mb-4">
             <div className="px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-rose-600/30">
               Live Alerts
             </div>
             <span className="text-[10px] font-bold text-slate-500">System Monitoring Active</span>
          </div>
          <div className="space-y-2">
             {[
               { icon: AlertTriangle, text: "B-23 Batch: Density mismatch detected", type: "error" },
               { icon: Activity, text: "Silo A-1 level dropped below 15%", type: "warning" }
             ].map((alert, i) => (
               <motion.div 
                 key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                 className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-slate-800"
               >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.type === 'error' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                     <alert.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-white/90 leading-tight flex-1">{alert.text}</p>
                  <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
               </motion.div>
             ))}
          </div>
       </div>

       {/* 🗺 BOTTOM NAVIGATION */}
       <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-20">
          {[
            { id: 'dashboard', icon: MonitorDot, label: 'Control Center' },
            { id: 'production', icon: Factory, label: 'MES Center' },
            { id: 'warehouse', icon: Database, label: 'Warehouse' },
            { id: 'sales', icon: ShoppingCart, label: 'Sales' },
            { id: 'finance', icon: DollarSign, label: 'Finance' },
          ].map((item) => (
            <button 
              key={item.id} onClick={() => onAction(item.id)}
              className="flex items-center gap-3 px-6 py-2.5 rounded-2xl hover:bg-white/5 transition-all group"
            >
               <item.icon className={`w-5 h-5 ${item.id === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'} group-hover:text-white transition-colors`} />
               <span className={`text-[10px] font-black ${item.id === 'dashboard' ? 'text-white' : 'text-slate-600'} group-hover:text-white uppercase tracking-widest`}>{item.label}</span>
            </button>
          ))}
       </div>
    </div>
  );
}
