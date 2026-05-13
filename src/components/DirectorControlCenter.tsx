import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  AlertTriangle, BarChart3, CheckCircle2, Cpu, Factory,
  FileText, Gauge, Thermometer, Timer, TrendingUp, Users,
  Zap, Box, Clock, Shield, Boxes, Wrench, AlertCircle,
  X, Bell, ArrowRight, TrendingDown, Info, Wind, Flame,
  RefreshCw, Target, Package, ChevronRight, Layers, MonitorDot,
  CheckCheck, XCircle, BarChart2, Power, Eye,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { User } from '../types';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
type StageStatus = 'active' | 'warning' | 'error' | 'offline';
type AlertSeverity = 'critical' | 'warning' | 'info';

interface ProcessStage {
  id: string; label: string; sub: string;
  status: StageStatus; icon: string;
}
interface DirectorEquipment {
  id: string; name: string; status: StageStatus;
  efficiency: number; temperature: number; powerKW: number;
}
interface LiveAlert {
  id: string; severity: AlertSeverity; time: string;
  equipment: string; description: string; acknowledged: boolean;
}
interface DirectorControlCenterProps { user: User; activeTab: string; }

// ─────────────────────────────────────────────────────────
// COLORS & HELPERS
// ─────────────────────────────────────────────────────────
const S_BORDER: Record<StageStatus, string> = {
  active:  'border-emerald-500/60',
  warning: 'border-amber-500/60',
  error:   'border-red-500/60',
  offline: 'border-slate-600/60',
};
const S_GLOW: Record<StageStatus, string> = {
  active:  'shadow-emerald-500/20',
  warning: 'shadow-amber-500/20',
  error:   'shadow-red-500/20',
  offline: 'shadow-none',
};
const S_DOT: Record<StageStatus, string> = {
  active:  'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
  offline: 'bg-slate-500',
};
const S_BADGE: Record<StageStatus, string> = {
  active:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error:   'bg-red-500/15 text-red-400 border-red-500/30',
  offline: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};
const S_LABEL: Record<StageStatus, string> = {
  active: "Ishlayapti", warning: "Ogohlantirish", error: "To'xtagan", offline: "Oflayn",
};
const SEV_STYLE: Record<AlertSeverity, { left: string; icon: string; bg: string; dot: string }> = {
  critical: { left:'border-l-red-500',   icon:'text-red-400',   bg:'hover:bg-red-950/20',  dot:'bg-red-500' },
  warning:  { left:'border-l-amber-500', icon:'text-amber-400', bg:'hover:bg-amber-950/20',dot:'bg-amber-500' },
  info:     { left:'border-l-blue-500',  icon:'text-blue-400',  bg:'hover:bg-blue-950/20', dot:'bg-blue-500' },
};

// ─────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────
const STAGES_DATA: ProcessStage[] = [
  { id:'raw',   label:"Xomashyo silosi",          sub:'85%',         status:'active',  icon:'silo'   },
  { id:'foam',  label:"Ko'pirtirgich",             sub:'72°C',        status:'active',  icon:'reactor'},
  { id:'block', label:"Blok shakllantirish",       sub:'Ishlayapti',  status:'active',  icon:'block'  },
  { id:'dry',   label:"Qattiqlashtrish kamerasi",  sub:'18°C',        status:'warning', icon:'chamber'},
  { id:'cut',   label:"Kesish liniyasi",           sub:'Ishlayapti',  status:'active',  icon:'cut'    },
  { id:'pack',  label:"Qadoqlash",                 sub:'Ishlayapti',  status:'active',  icon:'pack'   },
  { id:'wh',    label:"Tayyor mahsulot ombori",    sub:'102 m³',      status:'active',  icon:'wh'     },
];
const EQUIP_DATA: DirectorEquipment[] = [
  { id:'p101', name:"P-101 Ko'pirtirgich nasosi",    status:'active',  efficiency:85,  temperature:72,  powerKW:45 },
  { id:'e101', name:"E-101 Isitish tizimi",          status:'active',  efficiency:92,  temperature:68,  powerKW:60 },
  { id:'t101', name:"T-101 Qattiqlashtrish kamerasi",status:'active',  efficiency:100, temperature:18,  powerKW:30 },
  { id:'c101', name:"C-101 Kesish liniyasi",         status:'active',  efficiency:78,  temperature:32,  powerKW:22 },
  { id:'p202', name:"P-202 Gaz kompressori",         status:'warning', efficiency:65,  temperature:81,  powerKW:35 },
  { id:'v101', name:"V-101 Vakuum tizimi",           status:'error',   efficiency:0,   temperature:94,  powerKW:0  },
];
const ALERTS_DATA: LiveAlert[] = [
  { id:'a1', severity:'critical', time:'10:21:15', equipment:'Bosim me\'yoridan past (P-101)', description:"Ruxsat etilgan qiymatdan 0.3 bar past", acknowledged:false },
  { id:'a2', severity:'warning',  time:'10:18:42', equipment:"Harorat yuqori (E-101)",         description:"O'rnatilgan qiymatdan 5°C yuqori",     acknowledged:false },
  { id:'a3', severity:'warning',  time:'10:16:07', equipment:"Xomashyo zaxirasi kam",          description:"EPS granulasi zaxirasi 2 kunlik qoldi", acknowledged:false },
  { id:'a4', severity:'info',     time:'10:10:33', equipment:"Reja o'zgarishi",                description:"2-x kesish liniyasi reja yangilandi",  acknowledged:true  },
  { id:'a5', severity:'warning',  time:'10:05:11', equipment:"Sifat ogohlantirishi (QC)",      description:"3-blok zichlik me'yoridan past",        acknowledged:true  },
];

function genSeries(base: number, len = 30, v = 10) {
  return Array.from({ length: len }, (_, i) => {
    const h = 9 + Math.floor(i / 4);
    const m = (i % 4) * 15;
    return { t: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, b: +(base * 0.15 + (Math.random()-0.4)*v*0.08).toFixed(2), temp: +(base + (Math.random()-0.4)*v).toFixed(1), dens: +(14.8 + (Math.random()-0.5)*1.2).toFixed(2) };
  });
}
const CHART_DATA = genSeries(72, 30, 12);

const QC_PIE = [
  { name:'A Sinf', value:68, color:'#10b981' },
  { name:'B Sinf', value:22, color:'#3b82f6' },
  { name:'C Sinf', value:7,  color:'#f59e0b' },
  { name:'Brak',   value:3,  color:'#ef4444' },
];
const ENERGY_PIE = [
  { name:"Ko'pirtirish", value:32, color:'#6366f1' },
  { name:'Isitish',      value:28, color:'#f59e0b' },
  { name:'Blok Press',   value:24, color:'#10b981' },
  { name:'Boshqalar',    value:16, color:'#64748b' },
];
const SHIFT_OPS = [
  { name:'A. Karimov',   role:"Ko'pirtirish operatori", out:1850, plan:2000, eff:93 },
  { name:'B. Toshmatov', role:'Blok press operatori',   out:1600, plan:1700, eff:94 },
  { name:'C. Yusupov',   role:'Kesish operatori',       out:1580, plan:1600, eff:99 },
  { name:'D. Nazarov',   role:'Qadoqlash operatori',    out:1540, plan:1600, eff:96 },
  { name:'E. Rahimov',   role:'QC inspektori',          out:1560, plan:1600, eff:98 },
];
const BLOCK_TRACE = [
  { id:'BLK-2026-000128', batch:'BTH-042', smena:'1-smena', op:'B. Toshmatov', machine:'Blok Press', qc:'A Sinf', density:15.2, ok:true },
  { id:'BLK-2026-000127', batch:'BTH-042', smena:'1-smena', op:'B. Toshmatov', machine:'Blok Press', qc:'A Sinf', density:15.0, ok:true },
  { id:'BLK-2026-000126', batch:'BTH-042', smena:'1-smena', op:'B. Toshmatov', machine:'Blok Press', qc:'B Sinf', density:14.6, ok:true },
  { id:'BLK-2026-000125', batch:'BTH-041', smena:'1-smena', op:'B. Toshmatov', machine:'Blok Press', qc:'Brak',   density:13.1, ok:false },
  { id:'BLK-2026-000124', batch:'BTH-041', smena:'1-smena', op:'B. Toshmatov', machine:'Blok Press', qc:'A Sinf', density:15.3, ok:true },
];

const DARK_TIP = {
  contentStyle:{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:8, fontSize:11, color:'#94a3b8' },
  labelStyle:{ color:'#64748b' },
};

// ─────────────────────────────────────────────────────────
// INDUSTRIAL EQUIPMENT ICONS (SVG)
// ─────────────────────────────────────────────────────────
function EquipIcon({ type, active }: { type: string; active: boolean }) {
  const col = active ? '#10b981' : '#64748b';
  const stroke = active ? '#10b981' : '#475569';
  const s = { width:56, height:56 };
  if (type === 'silo') return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <polygon points="28,4 44,16 44,48 12,48 12,16" stroke={stroke} strokeWidth="1.5" fill={active?"#10b98115":"#47456910"}/>
      <rect x="20" y="48" width="16" height="4" rx="1" stroke={stroke} strokeWidth="1.5" fill="none"/>
      <line x1="20" y1="24" x2="36" y2="24" stroke={col} strokeWidth="1" opacity="0.5"/>
      <line x1="18" y1="32" x2="38" y2="32" stroke={col} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
  if (type === 'reactor') return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <ellipse cx="28" cy="28" rx="18" ry="20" stroke={stroke} strokeWidth="1.5" fill={active?"#10b98115":"#47456910"}/>
      <line x1="28" y1="10" x2="28" y2="46" stroke={col} strokeWidth="1.5"/>
      <line x1="28" y1="22" x2="38" y2="28" stroke={col} strokeWidth="1.2"/>
      <line x1="28" y1="28" x2="18" y2="34" stroke={col} strokeWidth="1.2"/>
      <circle cx="28" cy="28" r="3" fill={col}/>
    </svg>
  );
  if (type === 'block') return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <rect x="10" y="14" width="36" height="28" rx="2" stroke={stroke} strokeWidth="1.5" fill={active?"#10b98115":"#47456910"}/>
      <line x1="10" y1="28" x2="46" y2="28" stroke={col} strokeWidth="1" opacity="0.5"/>
      <line x1="28" y1="14" x2="28" y2="42" stroke={col} strokeWidth="1" opacity="0.5"/>
      <rect x="22" y="20" width="12" height="16" rx="1" stroke={col} strokeWidth="1" fill="none"/>
    </svg>
  );
  if (type === 'chamber') return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <rect x="8" y="12" width="40" height="32" rx="3" stroke={stroke} strokeWidth="1.5" fill={active?"#f59e0b15":"#47456910"}/>
      <path d="M14 22 Q20 18 26 22 Q32 26 38 22 Q44 18 48 22" stroke="#f59e0b" strokeWidth="1.2" fill="none"/>
      <path d="M14 30 Q20 26 26 30 Q32 34 38 30 Q44 26 48 30" stroke="#f59e0b" strokeWidth="1.2" fill="none"/>
      <circle cx="14" cy="44" r="3" stroke={stroke} strokeWidth="1.2" fill="none"/>
      <circle cx="42" cy="44" r="3" stroke={stroke} strokeWidth="1.2" fill="none"/>
    </svg>
  );
  if (type === 'cut') return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <rect x="8" y="16" width="40" height="24" rx="2" stroke={stroke} strokeWidth="1.5" fill={active?"#10b98115":"#47456910"}/>
      <line x1="16" y1="16" x2="16" y2="40" stroke={col} strokeWidth="1.2"/>
      <line x1="24" y1="16" x2="24" y2="40" stroke={col} strokeWidth="1.2"/>
      <line x1="32" y1="16" x2="32" y2="40" stroke={col} strokeWidth="1.2"/>
      <line x1="40" y1="16" x2="40" y2="40" stroke={col} strokeWidth="1.2"/>
      <path d="M8 48 L12 44 L44 44 L48 48" stroke={stroke} strokeWidth="1.2" fill="none"/>
    </svg>
  );
  if (type === 'pack') return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <rect x="12" y="18" width="32" height="26" rx="2" stroke={stroke} strokeWidth="1.5" fill={active?"#10b98115":"#47456910"}/>
      <line x1="12" y1="28" x2="44" y2="28" stroke={col} strokeWidth="1.2"/>
      <line x1="28" y1="18" x2="28" y2="44" stroke={col} strokeWidth="1.2"/>
      <path d="M12 18 L28 12 L44 18" stroke={stroke} strokeWidth="1.2" fill="none"/>
    </svg>
  );
  // warehouse
  return (
    <svg {...s} viewBox="0 0 56 56" fill="none">
      <path d="M4 28 L28 10 L52 28" stroke={stroke} strokeWidth="1.5" fill="none"/>
      <rect x="6" y="28" width="44" height="18" rx="1" stroke={stroke} strokeWidth="1.5" fill={active?"#10b98115":"#47456910"}/>
      <rect x="22" y="34" width="12" height="12" rx="1" stroke={col} strokeWidth="1.2" fill="none"/>
      <rect x="12" y="32" width="6" height="6" rx="1" stroke={col} strokeWidth="1" fill="none" opacity="0.6"/>
      <rect x="38" y="32" width="6" height="6" rx="1" stroke={col} strokeWidth="1" fill="none" opacity="0.6"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// ANIMATED FLOW ARROW
// ─────────────────────────────────────────────────────────
function FlowArrow({ active, label }: { active: boolean; label?: string }) {
  return (
    <div className="flex flex-col items-center shrink-0 px-1">
      {label && (
        <div className="text-[9px] text-amber-400 text-center mb-1 font-semibold leading-tight max-w-[60px] text-center">{label}</div>
      )}
      <div className="flex items-center">
        <div className="relative w-8 h-0.5 overflow-hidden">
          <div className={`absolute inset-0 ${active ? 'bg-emerald-800' : 'bg-slate-700'}`}/>
          {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[flow_1.8s_linear_infinite]" style={{ backgroundSize:'200% 100%' }}/>
          )}
        </div>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M2 2 L8 5 L2 8Z" fill={active ? '#10b981' : '#475569'}/>
        </svg>
      </div>
      {!label && <div className="h-4"/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIVE DOT
// ─────────────────────────────────────────────────────────
function LiveDot({ status }: { status: StageStatus }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {status === 'active' && <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-50"/>}
      <span className={`relative h-2 w-2 rounded-full ${S_DOT[status]}`}/>
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// LIVE CLOCK COMPONENT
// ─────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const p = (n: number) => String(n).padStart(2,'0');
  return (
    <div className="text-right leading-tight">
      <div className="text-xl font-black text-white font-mono tracking-widest">
        {p(now.getHours())}:{p(now.getMinutes())}:<span className="text-slate-400">{p(now.getSeconds())}</span>
      </div>
      <div className="text-[11px] text-slate-400">{now.getDate()}.{p(now.getMonth()+1)}.{now.getFullYear()}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PROCESS STAGE CARD
// ─────────────────────────────────────────────────────────
function StageCard({ stage }: { stage: ProcessStage }) {
  return (
    <div className={`shrink-0 w-[104px] border ${S_BORDER[stage.status]} shadow-lg ${S_GLOW[stage.status]} bg-[#0d1424] rounded-xl p-2.5 flex flex-col items-center gap-1.5 transition-all`}>
      <EquipIcon type={stage.icon} active={stage.status === 'active'}/>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${S_BADGE[stage.status]}`}>
        {S_LABEL[stage.status]}
      </span>
      <p className="text-[10px] font-semibold text-slate-300 text-center leading-tight">{stage.label}</p>
      <p className={`text-sm font-black ${stage.status==='warning'?'text-amber-400':stage.status==='error'?'text-red-400':'text-emerald-400'}`}>{stage.sub}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SHARED SECTION HEADER
// ─────────────────────────────────────────────────────────
function SHeader({ title, action, icon: Icon }: { title: string; action?: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400"/>{title}
      </h3>
      {action && <button className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">{action}</button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function DirectorControlCenter({ user, activeTab }: DirectorControlCenterProps) {
  const { t } = useI18n();
  const [stages, setStages] = useState<ProcessStage[]>(STAGES_DATA);
  const [alerts, setAlerts] = useState<LiveAlert[]>(ALERTS_DATA);
  const [chartData, setChartData] = useState(CHART_DATA);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filterBlock, setFilterBlock] = useState('');
  const [alertFilter, setAlertFilter] = useState<AlertSeverity|'all'>('all');

  // Simulated live updates
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      setChartData(prev => [...prev.slice(1), {
        t,
        b:   +(4.0 + (Math.random()-0.4)*0.6).toFixed(2),
        temp:+(70 + (Math.random()-0.4)*8).toFixed(1),
        dens:+(14.8 + (Math.random()-0.5)*1.2).toFixed(2),
      }]);
      setLastRefresh(new Date());
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  const ackAlert = (id: string) => setAlerts(p => p.map(a => a.id===id ? {...a, acknowledged:true} : a));
  const unack = alerts.filter(a => !a.acknowledged).length;

  // ── KPI CARDS ─────────────────────────────────────────
  const kpis = [
    { label:t('Ishlab chiqarish rejasi'), value:'85%',          sub:t('Bajarilish darajasi'),  icon:'📊', color:'border-indigo-500/30 bg-indigo-500/5' },
    { label:t('Bugungi ishlab chiqarish'),value:'128 / 150 m³', sub:t('Reja / Fakt'),          icon:'🏭', color:'border-emerald-500/30 bg-emerald-500/5' },
    { label:t('Tayyor mahsulot'),          value:'102 m³',       sub:t('Omborda mavjud'),       icon:'📦', color:'border-blue-500/30 bg-blue-500/5' },
    { label:t('Sifat ko\'rsatkichi (QC)'), value:'96.4%',        sub:t('Mos kelish darajasi'),  icon:'✅', color:'border-violet-500/30 bg-violet-500/5' },
    { label:t('Uskuna to\'xtash vaqti'),   value:"1 soat 24 min",sub:t('Bugun'),                icon:'⚠️', color:'border-rose-500/30 bg-rose-500/5' },
  ];

  // ── OVERVIEW ──────────────────────────────────────────
  const renderOverview = () => (
    <div className="min-h-screen bg-[#060d1b] text-white flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/70 bg-[#08101e]/80 backdrop-blur-md">
        <div>
          <h1 className="text-base font-black text-white">{t('Direktor paneli')}</h1>
          <p className="text-[11px] text-slate-500">{t("Ishlab chiqarishni real vaqt rejimida nazorat qilish")}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Alert bell */}
          <button className="relative">
            <Bell className="w-5 h-5 text-slate-400"/>
            {unack > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">{unack}</span>}
          </button>
          <LiveClock/>
          {/* User */}
          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-black text-white">
              {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2) || 'D'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{user?.name || 'Direktor'}</p>
              <p className="text-[10px] text-slate-500">{t('Direktor')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {kpis.map(k => (
            <div key={k.label} className={`border ${k.color} rounded-xl p-3 flex items-center gap-3`}>
              <span className="text-2xl">{k.icon}</span>
              <div>
                <p className="text-[10px] text-slate-400 leading-tight">{k.label}</p>
                <p className="text-base font-black text-white leading-tight">{k.value}</p>
                <p className="text-[10px] text-slate-500">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3">
          {/* LEFT: process flow + chart */}
          <div className="space-y-3">
            {/* PROCESS FLOW */}
            <div className="border border-slate-800/70 bg-[#0d1424]/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                  {t("Ishlab chiqarish jarayoni (real vaqt rejimi)")}
                  <span className="text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{t('Jonli')}</span>
                </h3>
              </div>
              {/* Flow */}
              <div className="flex items-end overflow-x-auto pb-2 gap-0">
                {stages.map((s, i) => (
                  <React.Fragment key={s.id}>
                    <StageCard stage={s}/>
                    {i < stages.length - 1 && (
                      <FlowArrow
                        active={s.status==='active' && stages[i+1].status!=='offline'}
                        label={i===1 ? `Gaz kompressori\n4.2 bar` : undefined}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/50">
                {([['active',"Ishlayapti"],['warning','Kutish'],['error',"Ogohlantirish"],['offline',"To'xtagan"]] as [StageStatus,string][]).map(([s,l]) => (
                  <span key={s} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${S_DOT[s]}`}/>{l}
                  </span>
                ))}
              </div>
            </div>

            {/* CHART */}
            <div className="border border-slate-800/70 bg-[#0d1424]/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{t("Asosiy ko'rsatkichlar grafigi")}</h3>
                <select className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none">
                  <option>{t('1 soat')}</option>
                  <option>{t('4 soat')}</option>
                  <option>{t('8 soat')}</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                  <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }} interval={4}/>
                  <YAxis yAxisId="left"  tick={{ fill:'#475569', fontSize:9 }} width={35}/>
                  <YAxis yAxisId="right" orientation="right" tick={{ fill:'#475569', fontSize:9 }} width={35}/>
                  <Tooltip {...DARK_TIP}/>
                  <Line yAxisId="left"  type="monotone" dataKey="b"    stroke="#3b82f6" strokeWidth={1.5} dot={false} name={t('Bosim P-101 (bar)')}/>
                  <Line yAxisId="left"  type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={1.5} dot={false} name={t('Harorat E-101 (°C)')}/>
                  <Line yAxisId="right" type="monotone" dataKey="dens" stroke="#a855f7" strokeWidth={1.5} dot={false} name={t('Zichlik T-101 (kg/m³)')}/>
                </LineChart>
              </ResponsiveContainer>
              {/* Current values */}
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/50">
                {[
                  { label:t('Bosim (P-101)'), value:`${chartData[chartData.length-1]?.b ?? 4.2} bar`, color:'text-blue-400' },
                  { label:t('Harorat (E-101)'), value:`${chartData[chartData.length-1]?.temp ?? 72.5} °C`, color:'text-emerald-400' },
                  { label:t('Zichlik (T-101)'), value:`${chartData[chartData.length-1]?.dens ?? 15.2} kg/m³`, color:'text-purple-400' },
                ].map(v => (
                  <div key={v.label} className="text-center">
                    <p className="text-[10px] text-slate-500">{v.label}</p>
                    <p className={`text-lg font-black ${v.color}`}>{v.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: alerts + equipment */}
          <div className="space-y-3">
            {/* ALERTS */}
            <div className="border border-slate-800/70 bg-[#0d1424]/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {unack > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>}
                  {t('Aktiv ogohlantirishlar')}
                </h3>
                <button className="text-[11px] text-indigo-400">{t('Barchasi')}</button>
              </div>
              <div className="space-y-0 max-h-[240px] overflow-y-auto">
                <AnimatePresence>
                  {alerts.map(a => {
                    const s = SEV_STYLE[a.severity];
                    const Icon = a.severity==='critical' ? AlertCircle : a.severity==='warning' ? AlertTriangle : Info;
                    return (
                      <motion.div key={a.id} layout initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className={`border-l-2 ${s.left} pl-3 py-2 ${s.bg} transition-colors`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-1.5">
                            <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.icon}`}/>
                            <div>
                              <p className="text-[11px] font-semibold text-white leading-tight">{a.equipment}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{a.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            <span className="text-[9px] text-slate-500">{a.time}</span>
                            {!a.acknowledged
                              ? <button onClick={() => ackAlert(a.id)} className="text-[9px] text-slate-400 hover:text-white">OK</button>
                              : <CheckCheck className="w-3 h-3 text-emerald-500"/>
                            }
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* EQUIPMENT STATUS */}
            <div className="border border-slate-800/70 bg-[#0d1424]/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{t('Uskunalar holati')}</h3>
                <button className="text-[11px] text-indigo-400">{t('Barchasi')}</button>
              </div>
              <div className="space-y-2">
                {EQUIP_DATA.map(eq => (
                  <div key={eq.id} className="flex items-center gap-2">
                    <LiveDot status={eq.status}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-300 truncate">{eq.name}</p>
                        <div className="flex items-center gap-2 shrink-0 ml-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${S_BADGE[eq.status]}`}>{S_LABEL[eq.status]}</span>
                          <span className={`text-[11px] font-black ${eq.efficiency>=80?'text-emerald-400':eq.efficiency>=50?'text-amber-400':'text-red-400'}`}>{eq.efficiency}%</span>
                          <button className="text-slate-600 hover:text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <circle cx="6" cy="2" r="1.2"/><circle cx="6" cy="6" r="1.2"/><circle cx="6" cy="10" r="1.2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500">{eq.status==='error'?`Holat: ${S_LABEL[eq.status]}`:`${eq.status==='warning'?'Bosim':'Harorat'}: ${eq.temperature} °C`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-slate-800/70 bg-[#08101e]/80 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
          {t('Server bilan bog\'lanish')}: <span className="text-emerald-400">{t('Ulangan')}</span>
        </div>
        <span>{t('Smena')}: {t('Kunduzgi')} (08:00 – 20:00)</span>
        <span>{t('Tizim versiyasi')}: 1.2.0</span>
      </div>
    </div>
  );

  // ── PRODUCTION MONITORING ─────────────────────────────
  const renderProduction = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l:t('OEE'), v:'84.2%', c:'text-emerald-400', border:'border-emerald-500/30' },
          { l:t("Bugungi ishlab chiqarish"), v:'14 850 kg', c:'text-blue-400', border:'border-blue-500/30' },
          { l:t("To'xtash vaqti"), v:'42 min', c:'text-amber-400', border:'border-amber-500/30' },
          { l:t('Reja bajarilishi'), v:'94%', c:'text-violet-400', border:'border-violet-500/30' },
        ].map(k => (
          <div key={k.l} className={`border ${k.border} bg-[#0d1424] rounded-xl p-4`}>
            <p className="text-[11px] text-slate-400">{k.l}</p>
            <p className={`text-2xl font-black ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Ishlab chiqarish tendensiyasi (kg)")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData.map(d => ({ t: d.t, v: 1700 + d.temp * 2 }))}>
              <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }} interval={4}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={50}/>
              <Tooltip {...DARK_TIP}/>
              <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#gP)" strokeWidth={2} dot={false} name={t('Ishlab chiqarish')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Bosqich bo'yicha samaradorlik")}</h3>
          <div className="space-y-3">
            {STAGES_DATA.map(s => {
              const eff = s.status==='active' ? 80 + Math.round(Math.random()*20) : s.status==='warning' ? 60 + Math.round(Math.random()*15) : 0;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400">{s.label}</span>
                    <span className={`font-bold ${eff>=80?'text-emerald-400':eff>=60?'text-amber-400':'text-red-400'}`}>{eff}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${eff>=80?'bg-emerald-500':eff>=60?'bg-amber-500':'bg-red-500'}`} style={{ width:`${eff}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ── LIVE PROCESS ──────────────────────────────────────
  const renderLive = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="border border-slate-800/70 bg-[#0d1424]/80 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          {t("To'liq ishlab chiqarish oqimi — Real vaqt")}
        </h3>
        <div className="flex items-end overflow-x-auto pb-3 gap-0">
          {stages.map((s, i) => (
            <React.Fragment key={s.id}>
              <StageCard stage={s}/>
              {i < stages.length - 1 && <FlowArrow active={s.status==='active'} label={i===1?`Gaz kompressori\n4.2 bar`:undefined}/>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES_DATA.map(s => (
          <div key={s.id} className={`border ${S_BORDER[s.status]} bg-[#0d1424] rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <LiveDot status={s.status}/>
              <span className="text-xs font-bold text-white">{s.label}</span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={chartData.map(d => ({ t:d.t, v: d.temp + (Math.random()-0.5)*5 }))}>
                <Line type="monotone" dataKey="v" stroke={s.status==='active'?'#10b981':s.status==='warning'?'#f59e0b':'#ef4444'} strokeWidth={1.5} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <p className={`text-lg font-black ${s.status==='active'?'text-emerald-400':s.status==='warning'?'text-amber-400':'text-red-400'}`}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── QC MONITORING ─────────────────────────────────────
  const renderQC = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l:t("O'tgan bloklar"), v:'1 512', c:'text-emerald-400', b:'border-emerald-500/30' },
          { l:t('Rad etilgan'), v:'48', c:'text-red-400', b:'border-red-500/30' },
          { l:t('QC foizi'), v:'96.9%', c:'text-blue-400', b:'border-blue-500/30' },
          { l:t("Zichlik o'rt."), v:'15.1 kg/m³', c:'text-violet-400', b:'border-violet-500/30' },
        ].map(k => (
          <div key={k.l} className={`border ${k.b} bg-[#0d1424] rounded-xl p-4`}>
            <p className="text-[11px] text-slate-400">{k.l}</p>
            <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t('QC Taqsimoti')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={QC_PIE} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                {QC_PIE.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip {...DARK_TIP}/>
            </PieChart>
          </ResponsiveContainer>
          {QC_PIE.map(q => (
            <div key={q.name} className="flex items-center justify-between text-[10px] mt-1">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full" style={{ background:q.color }}/>{q.name}</span>
              <span className="font-bold text-white">{q.value}%</span>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t('Blok Kuzatuvi')}</h3>
          <input value={filterBlock} onChange={e=>setFilterBlock(e.target.value)}
            placeholder={t('Blok ID qidiring...')}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-500 w-full mb-3 focus:outline-none focus:border-indigo-500"/>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead><tr className="border-b border-slate-800">
                {['Blok ID','Batch','Smena','Operator','QC','Zichlik','Holat'].map(h => (
                  <th key={h} className="text-left text-slate-500 pb-2 pr-3">{t(h)}</th>
                ))}
              </tr></thead>
              <tbody>
                {BLOCK_TRACE.filter(b=>!filterBlock||b.id.toLowerCase().includes(filterBlock.toLowerCase())).map(b => (
                  <tr key={b.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    <td className="py-2 pr-3 font-mono text-indigo-400 font-bold">{b.id}</td>
                    <td className="py-2 pr-3 text-slate-300">{b.batch}</td>
                    <td className="py-2 pr-3 text-slate-300">{b.smena}</td>
                    <td className="py-2 pr-3 text-slate-300">{b.op}</td>
                    <td className="py-2 pr-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${b.qc==='A Sinf'?'bg-emerald-500/15 text-emerald-400':b.qc==='B Sinf'?'bg-blue-500/15 text-blue-400':b.qc==='C Sinf'?'bg-amber-500/15 text-amber-400':'bg-red-500/15 text-red-400'}`}>{b.qc}</span></td>
                    <td className="py-2 pr-3 text-slate-300">{b.density}</td>
                    <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${b.ok?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{b.ok?'OK':'RAD'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ── EQUIPMENT ─────────────────────────────────────────
  const renderEquipment = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l:t('Jami'), v:EQUIP_DATA.length, c:'text-blue-400', b:'border-blue-500/30' },
          { l:t('Aktiv'), v:EQUIP_DATA.filter(e=>e.status==='active').length, c:'text-emerald-400', b:'border-emerald-500/30' },
          { l:t('Ogohlantirish'), v:EQUIP_DATA.filter(e=>e.status==='warning').length, c:'text-amber-400', b:'border-amber-500/30' },
          { l:t("To'xtagan"), v:EQUIP_DATA.filter(e=>e.status==='error').length, c:'text-red-400', b:'border-red-500/30' },
        ].map(k => (
          <div key={k.l} className={`border ${k.b} bg-[#0d1424] rounded-xl p-4`}>
            <p className="text-[11px] text-slate-400">{k.l}</p>
            <p className={`text-3xl font-black ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {EQUIP_DATA.map(eq => (
          <div key={eq.id} className={`border ${S_BORDER[eq.status]} bg-[#0d1424] rounded-xl p-4 shadow-lg ${S_GLOW[eq.status]}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><LiveDot status={eq.status}/><span className="text-sm font-bold text-white">{eq.name}</span></div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${S_BADGE[eq.status]}`}>{S_LABEL[eq.status]}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/5 rounded-lg p-2"><p className="text-slate-500">{t('Samaradorlik')}</p><p className={`text-xl font-black ${eq.efficiency>=80?'text-emerald-400':eq.efficiency>=50?'text-amber-400':'text-red-400'}`}>{eq.efficiency}%</p></div>
              <div className="bg-white/5 rounded-lg p-2"><p className="text-slate-500">{t('Harorat')}</p><p className={`text-xl font-black ${eq.temperature>85?'text-red-400':eq.temperature>65?'text-amber-400':'text-white'}`}>{eq.temperature}°C</p></div>
              <div className="bg-white/5 rounded-lg p-2 col-span-2"><p className="text-slate-500">{t('Quvvat')}</p><p className="text-white font-bold">{eq.powerKW} kVt</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ENERGY ────────────────────────────────────────────
  const renderEnergy = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l:t('Bugungi elektr sarfi'), v:'2 184 kVt·soat', c:'text-amber-400', b:'border-amber-500/30' },
          { l:t("Gaz sarfi"),           v:'148 m³',          c:'text-orange-400', b:'border-orange-500/30' },
          { l:t("Quvvat cho'qqisi"),    v:'285 kVt',         c:'text-red-400',    b:'border-red-500/30' },
          { l:t('Energiya samaradorligi'), v:'91.4%',        c:'text-emerald-400',b:'border-emerald-500/30' },
        ].map(k => (
          <div key={k.l} className={`border ${k.b} bg-[#0d1424] rounded-xl p-4`}>
            <p className="text-[11px] text-slate-400">{k.l}</p>
            <p className={`text-lg font-black ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Elektr sarfi (kVt·soat)")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData.map(d => ({ t:d.t, v: 180 + d.temp * 0.7 }))}>
              <defs><linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }} interval={4}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={45}/>
              <Tooltip {...DARK_TIP}/>
              <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="url(#gE)" strokeWidth={2} dot={false} name={t('Sarfi')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Uskuna bo'yicha sarfi")}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart><Pie data={ENERGY_PIE} cx="50%" cy="50%" outerRadius={65} dataKey="value">{ENERGY_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip {...DARK_TIP}/></PieChart>
          </ResponsiveContainer>
          {ENERGY_PIE.map(e => (
            <div key={e.name} className="flex justify-between text-[10px] mt-1">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full" style={{ background:e.color }}/>{e.name}</span>
              <span className="font-bold text-white">{e.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── SHIFT ─────────────────────────────────────────────
  const renderShift = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-indigo-500/30 bg-[#0d1424] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-white"/></div>
            <div><p className="text-xs text-slate-400">{t('Joriy smena')}</p><p className="text-lg font-black text-white">{t('Kunduzgi')} · 08:00–20:00</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l:t('Operatorlar'), v:SHIFT_OPS.length, icon:'👷' },
              { l:t("O'tgan vaqt"), v:'4:18', icon:'⏱' },
              { l:t('Smena KPI'), v:'94%', icon:'🎯' },
            ].map(c => (
              <div key={c.l} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xl">{c.icon}</p>
                <p className="text-xl font-black text-white">{c.v}</p>
                <p className="text-[10px] text-slate-500">{c.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Operator unumdorligi")}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SHIFT_OPS.map(o=>({ name:o.name.split(' ')[0], eff:o.eff }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" tick={{ fill:'#475569', fontSize:9 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={30} domain={[85,100]}/>
              <Tooltip {...DARK_TIP}/>
              <Bar dataKey="eff" fill="#6366f1" radius={[4,4,0,0]} name={t('Samaradorlik')}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">{t("Operator jadvali")}</h3>
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-slate-800">{[t('Ism'),t('Lavozim'),t('Bajarildi'),t('Reja'),t('Samaradorlik')].map(h=><th key={h} className="text-left text-slate-500 pb-2 pr-4">{h}</th>)}</tr></thead>
          <tbody>
            {SHIFT_OPS.map(op=>(
              <tr key={op.name} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                <td className="py-2.5 pr-4 font-semibold text-white">{op.name}</td>
                <td className="py-2.5 pr-4 text-slate-400">{op.role}</td>
                <td className="py-2.5 pr-4 text-slate-300">{op.out.toLocaleString()} kg</td>
                <td className="py-2.5 pr-4 text-slate-300">{op.plan.toLocaleString()} kg</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width:`${op.eff}%` }}/></div>
                    <span className={`font-bold ${op.eff>=95?'text-emerald-400':'text-blue-400'}`}>{op.eff}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── ALERTS ────────────────────────────────────────────
  const renderAlerts = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(['critical','warning','info'] as AlertSeverity[]).map(sev => {
          const s = SEV_STYLE[sev];
          const count = alerts.filter(a=>a.severity===sev).length;
          return (
            <button key={sev} onClick={()=>setAlertFilter(alertFilter===sev?'all':sev)}
              className={`border-l-2 ${s.left} bg-[#0d1424] border border-slate-800/70 rounded-xl p-4 text-left transition-all ${alertFilter===sev?'ring-1 ring-white/20':''}`}>
              <p className={`text-3xl font-black ${s.icon}`}>{count}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{sev === 'critical' ? t('Kritik') : sev === 'warning' ? t('Ogohlantirish') : t("Ma'lumot")}</p>
            </button>
          );
        })}
      </div>
      <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-4">{t('Barcha ogohlantirishlar')}</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {(alertFilter==='all' ? alerts : alerts.filter(a=>a.severity===alertFilter)).map(a => {
              const s = SEV_STYLE[a.severity];
              const Icon = a.severity==='critical' ? AlertCircle : a.severity==='warning' ? AlertTriangle : Info;
              return (
                <motion.div key={a.id} layout initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className={`border-l-2 ${s.left} pl-4 py-3 border border-slate-800/40 rounded-r-xl ${s.bg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 mt-0.5 ${s.icon}`}/>
                      <div>
                        <p className="text-xs font-semibold text-white">{a.equipment}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{a.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="text-[10px] text-slate-500">{a.time}</span>
                      {!a.acknowledged
                        ? <button onClick={()=>ackAlert(a.id)} className="text-[10px] px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded transition-colors">OK</button>
                        : <CheckCheck className="w-4 h-4 text-emerald-500"/>
                      }
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  // ── STATS ─────────────────────────────────────────────
  const renderStats = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Kunlik ishlab chiqarish (so'nggi 7 kun, tonna)")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{d:t('Du'),v:14.2},{d:t('Se'),v:15.8},{d:t('Ch'),v:13.9},{d:t('Pa'),v:16.1},{d:t('Ju'),v:15.4},{d:t('Sh'),v:11.2},{d:t('Ya'),v:0}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="d" tick={{ fill:'#475569', fontSize:10 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={35}/>
              <Tooltip {...DARK_TIP}/>
              <Bar dataKey="v" fill="#3b82f6" radius={[4,4,0,0]} name={t('Ishlab chiqarish')}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Oylik reja bajarilishi (%)")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[{m:t('Yan'),v:88},{m:t('Fev'),v:91},{m:t('Mar'),v:87},{m:t('Apr'),v:94},{m:t('May'),v:93}]}>
              <defs><linearGradient id="gSt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="m" tick={{ fill:'#475569', fontSize:10 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={35} domain={[80,100]}/>
              <Tooltip {...DARK_TIP}/>
              <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#gSt)" strokeWidth={2} dot name={t('Reja')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { l:'OEE', v:'84.2%' }, { l:t("To'xtash"), v:'2.4 soat' }, { l:t('Brak'), v:'3.2%' },
          { l:t('Ortiqcha'), v:'+5.3%' }, { l:t('Energiya samaradorligi'), v:'91.4%' }, { l:t('Reja bajarilishi'), v:'94%' },
        ].map(k=>(
          <div key={k.l} className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500">{k.l}</p>
            <p className="text-xl font-black text-white">{k.v}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── REPORTS ───────────────────────────────────────────
  const renderReports = () => (
    <div className="min-h-screen bg-[#060d1b] text-white p-4 space-y-4">
      <div className="border border-indigo-500/30 bg-[#0d1424] rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">{t("Hisobot yaratish")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title:t('Smena hisoboti'), icon:'📋', desc:t("Joriy smena to'liq ma'lumoti") },
            { title:t('Kunlik ishlab chiqarish'), icon:'🏭', desc:t("Bugungi barcha metrikalar") },
            { title:t('QC hisoboti'), icon:'✅', desc:t("Sifat nazorati natijalari") },
            { title:t('Energiya hisoboti'), icon:'⚡', desc:t("Energiya sarfi tahlili") },
            { title:t('Uskuna hisoboti'), icon:'🔧', desc:t("Texnik holat hisoboti") },
            { title:t('Haftalik xulosa'), icon:'📊', desc:t("7 kunlik umumiy hisobot") },
          ].map(r=>(
            <button key={r.title} className="border border-slate-700/60 hover:border-slate-600 bg-[#0a1220] rounded-xl p-4 text-left transition-all group">
              <span className="text-2xl">{r.icon}</span>
              <p className="text-xs font-bold text-white mt-2">{r.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-[10px] text-indigo-400 group-hover:text-indigo-300">
                <ArrowRight className="w-3 h-3"/>{t("Yaratish")}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="border border-slate-800/70 bg-[#0d1424] rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">{t("So'nggi hisobotlar")}</h3>
        {[
          { name:t('Smena hisoboti — 1-smena'), date:t('Bugun 07:05'), type:'PDF' },
          { name:t('Kunlik ishlab chiqarish'), date:t('Kecha 15:00'), type:'Excel' },
          { name:t('Haftalik QC xulosa'), date:t('Dushanba 08:00'), type:'PDF' },
          { name:t('Uskuna holati hisoboti'), date:t('Juma 18:00'), type:'Excel' },
        ].map(r=>(
          <div key={r.name} className="flex items-center justify-between py-2.5 border-b border-slate-800/40 hover:bg-slate-800/20 px-2 rounded-lg cursor-pointer">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500"/>
              <div><p className="text-xs font-semibold text-white">{r.name}</p><p className="text-[10px] text-slate-500">{r.date}</p></div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.type==='PDF'?'bg-red-500/15 text-red-400':'bg-emerald-500/15 text-emerald-400'}`}>{r.type}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ROUTER ────────────────────────────────────────────
  switch (activeTab) {
    case 'director-control':   return renderOverview();
    case 'director-production':return renderProduction();
    case 'director-live':      return renderLive();
    case 'director-qc':        return renderQC();
    case 'director-equipment': return renderEquipment();
    case 'director-energy':    return renderEnergy();
    case 'director-shift':     return renderShift();
    case 'director-alerts':    return renderAlerts();
    case 'director-stats':     return renderStats();
    case 'director-reports':   return renderReports();
    default:                   return renderOverview();
  }
}
