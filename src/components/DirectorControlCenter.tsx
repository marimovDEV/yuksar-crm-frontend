import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Cpu,
  Factory, FileText, Gauge, Thermometer, Timer, TrendingUp,
  Users, Zap, Box, Clock, Shield, Boxes, Power, Wrench,
  AlertCircle, X, Bell, ArrowRight, TrendingDown, Info,
  Wind, Flame, RefreshCw, Eye, Target, Package, ChevronRight,
  Layers, CheckCheck, XCircle, BarChart2, MonitorDot,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { User } from '../types';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
type StageStatus = 'active' | 'warning' | 'error' | 'offline';
type AlertSeverity = 'critical' | 'warning' | 'info';

interface ProcessStage {
  id: string; label: string; icon: React.ElementType;
  status: StageStatus; temp: number; pressure: number;
  density: number; efficiency: number; volume: number;
  operator: string; runtime: string;
}
interface DirectorEquipment {
  id: string; name: string; status: StageStatus;
  efficiency: number; runtime: string; temperature: number;
  nextMaintenance: string; powerKW: number;
}
interface LiveAlert {
  id: string; severity: AlertSeverity; time: string;
  equipment: string; description: string; action: string;
  acknowledged: boolean; stage: string;
}
interface DirectorControlCenterProps { user: User; activeTab: string; }

// ─────────────────────────────────────────────────────────
// STATUS HELPERS
// ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<StageStatus, string> = {
  active:  'border-emerald-500 shadow-emerald-500/20',
  warning: 'border-amber-500 shadow-amber-500/20',
  error:   'border-red-500 shadow-red-500/20',
  offline: 'border-slate-600 shadow-none',
};
const STATUS_DOT: Record<StageStatus, string> = {
  active:  'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
  offline: 'bg-slate-500',
};
const STATUS_TEXT: Record<StageStatus, string> = {
  active: 'Aktiv', warning: 'Ogohlantirish', error: 'Xato', offline: 'Oflayn',
};
const SEVERITY_STYLES: Record<AlertSeverity, { border: string; bg: string; icon: string; badge: string }> = {
  critical: { border: 'border-red-500/50',  bg: 'bg-red-950/40',   icon: 'text-red-400',   badge: 'bg-red-500/20 text-red-300' },
  warning:  { border: 'border-amber-500/50', bg: 'bg-amber-950/40', icon: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  info:     { border: 'border-blue-500/50',  bg: 'bg-blue-950/40',  icon: 'text-blue-400',  badge: 'bg-blue-500/20 text-blue-300' },
};
const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  critical: 'Kritik', warning: 'Ogohlantirish', info: 'Ma\'lumot',
};

// ─────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────
const INITIAL_STAGES: ProcessStage[] = [
  { id: 'raw',   label: "Xomashyo Ombori",      icon: Boxes,   status: 'active',  temp: 22, pressure: 1.01, density: 0,    efficiency: 94, volume: 2400,  operator: 'A. Karimov',  runtime: '7:42' },
  { id: 'foam',  label: "Ko'pirtirish",           icon: Wind,    status: 'active',  temp: 96, pressure: 2.8,  density: 14.2, efficiency: 89, volume: 1850,  operator: 'B. Toshmatov',runtime: '7:42' },
  { id: 'dry',   label: "Quritish",               icon: Flame,   status: 'warning', temp: 68, pressure: 1.5,  density: 13.8, efficiency: 76, volume: 1750,  operator: 'C. Yusupov',  runtime: '7:42' },
  { id: 'block', label: "Blok Shakllantirish",    icon: Box,     status: 'active',  temp: 92, pressure: 3.2,  density: 15.1, efficiency: 92, volume: 1600,  operator: 'D. Nazarov',  runtime: '7:42' },
  { id: 'cut',   label: "Kesish",                 icon: Layers,  status: 'active',  temp: 24, pressure: 1.0,  density: 15.1, efficiency: 97, volume: 1580,  operator: 'E. Rahimov',  runtime: '7:42' },
  { id: 'qc',    label: "QC Tekshiruv",           icon: Shield,  status: 'active',  temp: 23, pressure: 1.0,  density: 15.0, efficiency: 99, volume: 1560,  operator: 'F. Mirzayev', runtime: '7:42' },
  { id: 'pack',  label: "Qadoqlash",              icon: Package, status: 'active',  temp: 22, pressure: 1.0,  density: 15.0, efficiency: 95, volume: 1540,  operator: 'G. Ismoilov', runtime: '7:42' },
  { id: 'wh',    label: "Tayyor Ombor",           icon: Boxes,   status: 'active',  temp: 20, pressure: 1.0,  density: 0,    efficiency: 100,volume: 14200, operator: 'H. Qodirov',  runtime: '7:42' },
];
const INITIAL_EQUIPMENT: DirectorEquipment[] = [
  { id: 'comp1', name: 'Gaz Kompressori',    status: 'active',  efficiency: 94, runtime: '1842h', temperature: 78, nextMaintenance: '12 kun', powerKW: 45 },
  { id: 'cut1',  name: 'Kesish Liniyasi',    status: 'active',  efficiency: 97, runtime: '963h',  temperature: 42, nextMaintenance: '28 kun', powerKW: 22 },
  { id: 'dry1',  name: 'Quritish Kamerasi',  status: 'warning', efficiency: 76, runtime: '2104h', temperature: 68, nextMaintenance: '3 kun',  powerKW: 60 },
  { id: 'press1',name: 'Blok Press',         status: 'active',  efficiency: 92, runtime: '1241h', temperature: 55, nextMaintenance: '21 kun', powerKW: 75 },
  { id: 'pack1', name: 'Qadoqlash Liniyasi', status: 'active',  efficiency: 95, runtime: '784h',  temperature: 38, nextMaintenance: '45 kun', powerKW: 18 },
  { id: 'vac1',  name: 'Vakuum Tizimi',      status: 'error',   efficiency: 31, runtime: '3211h', temperature: 92, nextMaintenance: 'ZUDLIK', powerKW: 35 },
];
const INITIAL_ALERTS: LiveAlert[] = [
  { id: 'a1', severity: 'critical', time: '09:14', equipment: 'Vakuum Tizimi',    description: "Harorat haddan tashqari yuqori — 92°C",   action: "Texnikni chaqiring",      acknowledged: false, stage: "Ko'pirtirish"  },
  { id: 'a2', severity: 'warning',  time: '09:08', equipment: 'Quritish Kamerasi',description: "Samaradorlik past — 76%",                  action: "Parametrlarni tekshiring", acknowledged: false, stage: 'Quritish'      },
  { id: 'a3', severity: 'warning',  time: '08:52', equipment: 'EPS Xomashyo',     description: "Zaxira kamaymoqda — 18%",                  action: "Buyurtma bering",          acknowledged: true,  stage: 'Xomashyo'      },
  { id: 'a4', severity: 'info',     time: '08:31', equipment: 'QC Skaneri',       description: "Smena hisoboti tayyor",                    action: "Hisobotni ko'ring",        acknowledged: true,  stage: 'QC Tekshiruv'  },
  { id: 'a5', severity: 'warning',  time: '08:15', equipment: 'Gaz Tizimi',       description: "Bosim anomaliyasi aniqlandi",               action: "Monitoring kuchaytirildi", acknowledged: true,  stage: "Ko'pirtirish"  },
  { id: 'a6', severity: 'info',     time: '07:58', equipment: 'Kesish Liniyasi',  description: "Profilaktik texnik xizmat eslatmasi",      action: "Jadval tuzing",            acknowledged: true,  stage: 'Kesish'        },
];
function genTimeSeries(base: number, len = 20, variance = 8) {
  return Array.from({ length: len }, (_, i) => ({
    t: `${String(8 + Math.floor(i / 4)).padStart(2,'0')}:${String((i % 4) * 15).padStart(2,'0')}`,
    v: Math.max(0, base + (Math.random() - 0.5) * variance * 2),
  }));
}
const TEMP_SERIES   = genTimeSeries(88, 20, 6);
const PRESS_SERIES  = genTimeSeries(2.8, 20, 0.4);
const PROD_SERIES   = genTimeSeries(1800, 20, 120);
const ENERGY_SERIES = genTimeSeries(220, 20, 30);
const QC_SERIES     = genTimeSeries(96, 20, 3);
const QC_PIE = [
  { name: 'A Sinf',  value: 68, color: '#10b981' },
  { name: 'B Sinf',  value: 22, color: '#3b82f6' },
  { name: 'C Sinf',  value: 7,  color: '#f59e0b' },
  { name: 'Brak',    value: 3,  color: '#ef4444' },
];
const ENERGY_PIE = [
  { name: "Ko'pirtirish", value: 32, color: '#6366f1' },
  { name: 'Quritish',     value: 28, color: '#f59e0b' },
  { name: 'Blok Press',   value: 24, color: '#10b981' },
  { name: 'Boshqalar',    value: 16, color: '#64748b' },
];
const SHIFT_OPERATORS = [
  { name: 'A. Karimov',   role: "Ko'pirtirish operatori", output: 1850, plan: 2000, efficiency: 93 },
  { name: 'B. Toshmatov', role: 'Blok press operatori',   output: 1600, plan: 1700, efficiency: 94 },
  { name: 'C. Yusupov',   role: 'Kesish operatori',       output: 1580, plan: 1600, efficiency: 99 },
  { name: 'D. Nazarov',   role: 'Qadoqlash operatori',    output: 1540, plan: 1600, efficiency: 96 },
  { name: 'E. Rahimov',   role: 'QC inspektori',          output: 1560, plan: 1600, efficiency: 98 },
];
const BLOCK_TRACE = [
  { id: 'BLK-2026-000128', batch: 'BTH-042', smena: '1-smena', operator: 'B. Toshmatov', machine: 'Blok Press', qc: 'A Sinf', density: 15.2, status: 'OK' },
  { id: 'BLK-2026-000127', batch: 'BTH-042', smena: '1-smena', operator: 'B. Toshmatov', machine: 'Blok Press', qc: 'A Sinf', density: 15.0, status: 'OK' },
  { id: 'BLK-2026-000126', batch: 'BTH-042', smena: '1-smena', operator: 'B. Toshmatov', machine: 'Blok Press', qc: 'B Sinf', density: 14.6, status: 'OK' },
  { id: 'BLK-2026-000125', batch: 'BTH-041', smena: '1-smena', operator: 'B. Toshmatov', machine: 'Blok Press', qc: 'Brak',   density: 13.1, status: 'RAD ETILDI' },
  { id: 'BLK-2026-000124', batch: 'BTH-041', smena: '1-smena', operator: 'B. Toshmatov', machine: 'Blok Press', qc: 'A Sinf', density: 15.3, status: 'OK' },
];

// ─────────────────────────────────────────────────────────
// REUSABLE MINI-COMPONENTS
// ─────────────────────────────────────────────────────────
function LiveDot({ status }: { status: StageStatus }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === 'active' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${STATUS_DOT[status]}`} />
    </span>
  );
}

function KPICard({ icon: Icon, label, value, unit, trend, color, sub }:
  { icon: React.ElementType; label: string; value: string|number; unit: string; trend: number; color: string; sub?: string }) {
  const positive = trend >= 0;
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className={`relative overflow-hidden rounded-2xl border bg-slate-900/80 backdrop-blur-sm p-4 shadow-lg ${color}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-xl bg-white/5`}><Icon className="w-4 h-4 text-white/60" /></div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {positive ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="mt-1">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}<span className="text-sm font-medium text-slate-400 ml-1">{unit}</span></p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function AlertCard({ alert, onAck }: { alert: LiveAlert; onAck: (id: string) => void }) {
  const s = SEVERITY_STYLES[alert.severity];
  const Icon = alert.severity === 'critical' ? AlertCircle : alert.severity === 'warning' ? AlertTriangle : Info;
  return (
    <motion.div layout initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
      className={`border ${s.border} ${s.bg} rounded-xl p-3 mb-2`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.icon}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.badge}`}>{SEVERITY_LABEL[alert.severity]}</span>
            <span className="text-[10px] text-slate-500">{alert.time}</span>
            <span className="text-[10px] text-slate-400 truncate">{alert.equipment}</span>
          </div>
          <p className="text-xs text-slate-300 mb-1">{alert.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 italic">{alert.action}</span>
            {!alert.acknowledged && (
              <button onClick={() => onAck(alert.id)}
                className="text-[10px] px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded transition-colors">
                OK
              </button>
            )}
            {alert.acknowledged && <CheckCheck className="w-3 h-3 text-emerald-500" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EquipCard({ eq }: { eq: DirectorEquipment }) {
  const effColor = eq.efficiency >= 90 ? 'text-emerald-400' : eq.efficiency >= 70 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className={`border ${STATUS_COLORS[eq.status]} bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LiveDot status={eq.status} />
          <span className="text-sm font-bold text-white">{eq.name}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          eq.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
          eq.status === 'warning' ? 'bg-amber-500/15 text-amber-400' :
          eq.status === 'error' ? 'bg-red-500/15 text-red-400' : 'bg-slate-500/15 text-slate-400'
        }`}>{STATUS_TEXT[eq.status]}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-slate-500">Samaradorlik</p>
          <p className={`font-black text-base ${effColor}`}>{eq.efficiency}%</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-slate-500">Harorat</p>
          <p className={`font-black text-base ${eq.temperature > 80 ? 'text-red-400' : eq.temperature > 60 ? 'text-amber-400' : 'text-white'}`}>{eq.temperature}°C</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-slate-500">Ish vaqti</p>
          <p className="font-bold text-white">{eq.runtime}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-slate-500">Keyingi TA</p>
          <p className={`font-bold ${eq.nextMaintenance === 'ZUDLIK' ? 'text-red-400 animate-pulse' : 'text-white'}`}>{eq.nextMaintenance}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400"/>{eq.powerKW} kVt</span>
        <span className="flex items-center gap-1"><Wrench className="w-3 h-3"/>Texnik xizmat: {eq.nextMaintenance}</span>
      </div>
    </div>
  );
}

const DARK_TOOLTIP_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid #334155', borderRadius: 10, fontSize: 11, color: '#cbd5e1' },
  labelStyle: { color: '#94a3b8' },
};

// ─────────────────────────────────────────────────────────
// PROCESS FLOW STAGE CARD
// ─────────────────────────────────────────────────────────
function StageCard({ stage }: { stage: ProcessStage }) {
  const Icon = stage.icon;
  return (
    <div className={`shrink-0 w-44 border ${STATUS_COLORS[stage.status]} bg-slate-900/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg transition-all hover:scale-[1.02] cursor-default`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <LiveDot status={stage.status} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            stage.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
            stage.status === 'warning' ? 'bg-amber-500/15 text-amber-400' :
            stage.status === 'error'   ? 'bg-red-500/15 text-red-400' : 'bg-slate-500/15 text-slate-400'
          }`}>{STATUS_TEXT[stage.status]}</span>
        </div>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <p className="text-xs font-bold text-white mb-2 leading-tight">{stage.label}</p>
      <div className="space-y-1 text-[10px]">
        {stage.temp > 0 && <div className="flex justify-between text-slate-400"><span className="flex items-center gap-1"><Thermometer className="w-2.5 h-2.5"/>Harorat</span><span className="text-white font-semibold">{stage.temp}°C</span></div>}
        {stage.pressure > 0 && stage.pressure !== 1.0 && <div className="flex justify-between text-slate-400"><span className="flex items-center gap-1"><Gauge className="w-2.5 h-2.5"/>Bosim</span><span className="text-white font-semibold">{stage.pressure} bar</span></div>}
        {stage.density > 0 && <div className="flex justify-between text-slate-400"><span>Zichlik</span><span className="text-white font-semibold">{stage.density} kg/m³</span></div>}
        <div className="flex justify-between text-slate-400"><span>Hajm</span><span className="text-white font-semibold">{stage.volume.toLocaleString()} kg</span></div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-slate-500">Samaradorlik</span>
          <span className={`font-bold ${stage.efficiency >= 90 ? 'text-emerald-400' : stage.efficiency >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{stage.efficiency}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${stage.efficiency >= 90 ? 'bg-emerald-500' : stage.efficiency >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${stage.efficiency}%` }} />
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-slate-500 truncate">👤 {stage.operator}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FLOW ARROW
// ─────────────────────────────────────────────────────────
function FlowArrow({ active }: { active: boolean }) {
  return (
    <div className="shrink-0 flex items-center px-1">
      <div className={`flex items-center gap-0.5 ${active ? 'text-emerald-500' : 'text-slate-600'}`}>
        <div className={`w-6 h-0.5 ${active ? 'bg-emerald-500' : 'bg-slate-600'} relative overflow-hidden`}>
          {active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-[flow_1.5s_linear_infinite]" />}
        </div>
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIVE CLOCK
// ─────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  const days: Record<number, string> = { 0:'Yakshanba',1:'Dushanba',2:'Seshanba',3:'Chorshanba',4:'Payshanba',5:'Juma',6:'Shanba' };
  return (
    <div className="text-right">
      <div className="text-2xl font-black text-white font-mono tracking-widest">
        {pad(now.getHours())}:{pad(now.getMinutes())}:<span className="text-slate-400 text-lg">{pad(now.getSeconds())}</span>
      </div>
      <div className="text-[11px] text-slate-400">{days[now.getDay()]}, {now.getDate()}.{pad(now.getMonth()+1)}.{now.getFullYear()}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function DirectorControlCenter({ user, activeTab }: DirectorControlCenterProps) {
  const { t } = useI18n();
  const [stages, setStages] = useState<ProcessStage[]>(INITIAL_STAGES);
  const [equipment, setEquipment] = useState<DirectorEquipment[]>(INITIAL_EQUIPMENT);
  const [alerts, setAlerts] = useState<LiveAlert[]>(INITIAL_ALERTS);
  const [tempData, setTempData]   = useState(TEMP_SERIES);
  const [prodData, setProdData]   = useState(PROD_SERIES);
  const [energyData, setEnergyData] = useState(ENERGY_SERIES);
  const [qcData, setQcData]       = useState(QC_SERIES);
  const [alertFilter, setAlertFilter] = useState<AlertSeverity|'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filterBlock, setFilterBlock] = useState('');

  // Simulated live updates
  useEffect(() => {
    const iv = setInterval(() => {
      setStages(prev => prev.map(s => ({
        ...s,
        temp: s.status !== 'offline' ? +(s.temp + (Math.random()-0.5)*1.5).toFixed(1) : s.temp,
        efficiency: s.status !== 'offline' ? Math.max(30, Math.min(100, s.efficiency + (Math.random()-0.48)*1.2)) : s.efficiency,
      })));
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      setProdData(prev => [...prev.slice(1), { t: timeStr, v: Math.max(1400, 1800 + (Math.random()-0.5)*200) }]);
      setEnergyData(prev => [...prev.slice(1), { t: timeStr, v: Math.max(160, 220 + (Math.random()-0.5)*50) }]);
      setTempData(prev => [...prev.slice(1), { t: timeStr, v: Math.max(70, 88 + (Math.random()-0.5)*12) }]);
      setQcData(prev => [...prev.slice(1), { t: timeStr, v: Math.max(88, 96 + (Math.random()-0.5)*5) }]);
      setLastRefresh(new Date());
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const unackCount = alerts.filter(a => !a.acknowledged).length;
  const activeLines = stages.filter(s => s.status === 'active').length;
  const avgEfficiency = Math.round(stages.reduce((sum, s) => sum + s.efficiency, 0) / stages.length);
  const errorCount = stages.filter(s => s.status === 'error').length;
  const warningCount = stages.filter(s => s.status === 'warning').length;

  // ── HEADER ────────────────────────────────────────────
  const renderHeader = () => (
    <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MonitorDot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest">{t('PENAPLAS ERP')}</p>
              <p className="text-sm font-black text-white">{t('Direktor Nazorat Markazi')}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 ml-4">
            {/* Aktiv smena */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-3 py-1.5 border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-white">1-Smena</span>
              <span className="text-[10px] text-slate-400">07:00-15:00</span>
            </div>
            {/* Operatorlar */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-3 py-1.5 border border-slate-700/50">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{SHIFT_OPERATORS.length}</span>
              <span className="text-[10px] text-slate-400">{t('operator')}</span>
            </div>
            {/* Aktiv liniyalar */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-3 py-1.5 border border-slate-700/50">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-white">{activeLines}/{stages.length}</span>
              <span className="text-[10px] text-slate-400">{t('liniya')}</span>
            </div>
            {/* Alerts */}
            {unackCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-950/60 rounded-lg px-3 py-1.5 border border-red-500/40 animate-pulse">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-bold text-red-300">{unackCount}</span>
                <span className="text-[10px] text-red-400">{t('ogohlantirish')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500">
            <RefreshCw className="w-3 h-3" />
            <span>{String(lastRefresh.getHours()).padStart(2,'0')}:{String(lastRefresh.getMinutes()).padStart(2,'0')}:{String(lastRefresh.getSeconds()).padStart(2,'0')}</span>
          </div>
          <LiveClock />
        </div>
      </div>
    </div>
  );

  // ── KPI CARDS ─────────────────────────────────────────
  const renderKPIs = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
      <KPICard icon={Target}      label={t('Reja bajarilishi')}   value={`${avgEfficiency}`}   unit="%" trend={+2.1}  color="border-indigo-500/40 shadow-indigo-500/10"  />
      <KPICard icon={Factory}     label={t("Bugungi ishlab ch.")} value="14 850"               unit="kg" trend={+5.3}  color="border-blue-500/40 shadow-blue-500/10"      />
      <KPICard icon={Package}     label={t('Tayyor mahsulot')}    value="12 200"               unit="kg" trend={+3.8}  color="border-emerald-500/40 shadow-emerald-500/10"/>
      <KPICard icon={Shield}      label={t('QC moslik')}          value="96.8"                 unit="%" trend={+0.4}  color="border-teal-500/40 shadow-teal-500/10"      />
      <KPICard icon={XCircle}     label={t('Brak foizi')}         value="3.2"                  unit="%" trend={-1.1}  color="border-rose-500/40 shadow-rose-500/10"      sub="14 ta blok"/>
      <KPICard icon={Timer}       label={t("To'xtash vaqti")}     value="42"                   unit="min" trend={-8.3} color="border-amber-500/40 shadow-amber-500/10"   />
      <KPICard icon={Zap}         label={t('Energiya sarfi')}     value="218"                  unit="kVt" trend={-2.6} color="border-violet-500/40 shadow-violet-500/10" />
      <KPICard icon={Cpu}         label={t('Aktiv uskunalar')}    value={`${equipment.filter(e=>e.status==='active').length}`} unit={`/${equipment.length}`} trend={0} color="border-cyan-500/40 shadow-cyan-500/10" />
    </div>
  );

  // ── PROCESS FLOW ──────────────────────────────────────
  const renderProcessFlow = () => (
    <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">{t('Jonli Ishlab Chiqarish Jarayoni')}</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {(['active','warning','error','offline'] as StageStatus[]).map(s => (
            <span key={s} className="flex items-center gap-1 text-slate-400">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`}/>
              {STATUS_TEXT[s]}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center overflow-x-auto pb-2 gap-0">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <StageCard stage={stage} />
            {i < stages.length - 1 && <FlowArrow active={stage.status === 'active' && stages[i+1].status !== 'offline'} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // ── OVERVIEW (director-control) ───────────────────────
  const renderOverview = () => (
    <div>
      {renderKPIs()}
      {renderProcessFlow()}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live production chart */}
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400"/>{t("Ishlab chiqarish (bugun, kg)")}
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{t('Jonli')}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={prodData}>
              <defs><linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }} />
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={45}/>
              <Tooltip {...DARK_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#gProd)" strokeWidth={2} dot={false} name={t('Ishlab chiqarish')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Alerts panel */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400"/>{t('Ogohlantirishlar')}
            </h3>
            {unackCount > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unackCount}</span>}
          </div>
          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
            <AnimatePresence>
              {alerts.slice(0, 5).map(a => <AlertCard key={a.id} alert={a} onAck={acknowledgeAlert}/>)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PRODUCTION MONITORING (director-production) ───────
  const renderProduction = () => (
    <div className="space-y-4">
      {renderKPIs()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400"/>{t("Ishlab chiqarish tendensiyasi")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={prodData}>
              <defs><linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={45}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#gP2)" strokeWidth={2} dot={false} name={t('Ishlab chiqarish')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-400"/>{t("Harorat monitoringi (Ko'pirtirish, °C)")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={40} domain={[70,110]}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Line type="monotone" dataKey="v" stroke="#f97316" strokeWidth={2} dot={false} name={t('Harorat')}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400"/>{t('Smenalar bo\'yicha OEE')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: t('1-smena'), oee: 87, plan: 90 },
              { name: t('2-smena'), oee: 82, plan: 90 },
              { name: t('3-smena'), oee: 79, plan: 90 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" tick={{ fill:'#475569', fontSize:10 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={35} domain={[0,100]}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Bar dataKey="oee"  fill="#10b981" radius={[4,4,0,0]} name="OEE"/>
              <Bar dataKey="plan" fill="#334155" radius={[4,4,0,0]} name={t('Reja')}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400"/>{t("Bosqich bo'yicha samaradorlik")}</h3>
          <div className="space-y-2">
            {stages.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-28 truncate">{s.label}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${s.efficiency>=90?'bg-emerald-500':s.efficiency>=75?'bg-amber-500':'bg-red-500'}`}
                    style={{ width:`${s.efficiency}%` }}/>
                </div>
                <span className={`text-[10px] font-bold w-8 text-right ${s.efficiency>=90?'text-emerald-400':s.efficiency>=75?'text-amber-400':'text-red-400'}`}>{Math.round(s.efficiency)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── LIVE PROCESS (director-live) ──────────────────────
  const renderLiveProcess = () => (
    <div className="space-y-4">
      {renderProcessFlow()}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.slice(0, 4).map(s => (
          <div key={s.id} className={`border ${STATUS_COLORS[s.status]} bg-slate-950/60 rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <LiveDot status={s.status}/>
              <span className="text-xs font-bold text-white">{s.label}</span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={tempData.map((d,i) => ({ t:d.t, v: s.temp + (Math.random()-0.5)*5 * i/20 }))}>
                <Line type="monotone" dataKey="v" stroke={s.status==='active'?'#10b981':s.status==='warning'?'#f59e0b':'#ef4444'} strokeWidth={1.5} dot={false}/>
                <Tooltip {...DARK_TOOLTIP_STYLE} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-1 mt-1 text-[10px]">
              <div className="text-center"><p className="text-slate-500">°C</p><p className="text-white font-bold">{s.temp.toFixed(1)}</p></div>
              <div className="text-center"><p className="text-slate-500">bar</p><p className="text-white font-bold">{s.pressure}</p></div>
              <div className="text-center"><p className="text-slate-500">%</p><p className={`font-bold ${s.efficiency>=90?'text-emerald-400':s.efficiency>=75?'text-amber-400':'text-red-400'}`}>{Math.round(s.efficiency)}</p></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.slice(4).map(s => (
          <div key={s.id} className={`border ${STATUS_COLORS[s.status]} bg-slate-950/60 rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <LiveDot status={s.status}/>
              <span className="text-xs font-bold text-white">{s.label}</span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={prodData.map(d => ({ t:d.t, v: s.volume + (Math.random()-0.5)*100 }))}>
                <Line type="monotone" dataKey="v" stroke={s.status==='active'?'#3b82f6':'#f59e0b'} strokeWidth={1.5} dot={false}/>
                <Tooltip {...DARK_TOOLTIP_STYLE}/>
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-1 text-[10px]">
              <div className="text-center"><p className="text-slate-500">{t('Hajm, kg')}</p><p className="text-white font-bold">{s.volume.toLocaleString()}</p></div>
              <div className="text-center"><p className="text-slate-500">%</p><p className={`font-bold ${s.efficiency>=90?'text-emerald-400':'text-amber-400'}`}>{Math.round(s.efficiency)}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── QC MONITORING (director-qc) ───────────────────────
  const renderQC = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('O\'tgan bloklar'), value: '1 512', color: 'border-emerald-500/40', icon: CheckCheck, iconColor: 'text-emerald-400' },
          { label: t('Rad etilgan'), value: '48', color: 'border-red-500/40', icon: XCircle, iconColor: 'text-red-400' },
          { label: t('QC foizi'), value: '96.9%', color: 'border-blue-500/40', icon: Shield, iconColor: 'text-blue-400' },
          { label: t('Zichlik o\'rt.'), value: '15.1 kg/m³', color: 'border-violet-500/40', icon: Gauge, iconColor: 'text-violet-400' },
        ].map(card => (
          <div key={card.label} className={`border ${card.color} bg-slate-950/60 backdrop-blur-sm rounded-2xl p-4`}>
            <card.icon className={`w-5 h-5 ${card.iconColor} mb-2`}/>
            <p className="text-[11px] text-slate-400">{card.label}</p>
            <p className="text-2xl font-black text-white">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t('QC Taqsimoti')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={QC_PIE} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name} ${value}%`} labelLine={false}>
                {QC_PIE.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
              </Pie>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {QC_PIE.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }}/>
                <span className="text-slate-400">{item.name}: <span className="text-white font-bold">{item.value}%</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400"/>{t('QC tendensiyasi (%)')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={qcData}>
              <defs><linearGradient id="gQC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={35} domain={[85,100]}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#gQC)" strokeWidth={2} dot={false} name="QC %"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Block traceability */}
      <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400"/>{t('Blok Kuzatuvi')}
          </h3>
          <input value={filterBlock} onChange={e => setFilterBlock(e.target.value)}
            placeholder={t('Blok ID qidiring...')}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-48"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Blok ID','Batch','Smena','Operator','Mashina','QC','Zichlik','Holat'].map(h => (
                  <th key={h} className="text-left text-slate-500 font-semibold pb-2 pr-4">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOCK_TRACE.filter(b => !filterBlock || b.id.toLowerCase().includes(filterBlock.toLowerCase())).map(b => (
                <tr key={b.id} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 pr-4 font-mono text-indigo-400 font-bold">{b.id}</td>
                  <td className="py-2 pr-4 text-slate-300">{b.batch}</td>
                  <td className="py-2 pr-4 text-slate-300">{b.smena}</td>
                  <td className="py-2 pr-4 text-slate-300">{b.operator}</td>
                  <td className="py-2 pr-4 text-slate-300">{b.machine}</td>
                  <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded-full font-semibold ${b.qc==='A Sinf'?'bg-emerald-500/15 text-emerald-400':b.qc==='B Sinf'?'bg-blue-500/15 text-blue-400':b.qc==='C Sinf'?'bg-amber-500/15 text-amber-400':'bg-red-500/15 text-red-400'}`}>{b.qc}</span></td>
                  <td className="py-2 pr-4 text-slate-300">{b.density}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full font-bold ${b.status==='OK'?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── EQUIPMENT STATUS (director-equipment) ─────────────
  const renderEquipment = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {[
          { label: t('Jami uskunalar'), value: equipment.length, icon: Cpu, color: 'text-blue-400' },
          { label: t('Aktiv'), value: equipment.filter(e=>e.status==='active').length, icon: Power, color: 'text-emerald-400' },
          { label: t('Ogohlantirish'), value: equipment.filter(e=>e.status==='warning').length, icon: AlertTriangle, color: 'text-amber-400' },
          { label: t('Xato'), value: equipment.filter(e=>e.status==='error').length, icon: AlertCircle, color: 'text-red-400' },
        ].map(c => (
          <div key={c.label} className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3">
            <c.icon className={`w-6 h-6 ${c.color}`}/>
            <div><p className="text-[11px] text-slate-400">{c.label}</p><p className="text-2xl font-black text-white">{c.value}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {equipment.map(eq => <EquipCard key={eq.id} eq={eq} />)}
      </div>
    </div>
  );

  // ── ENERGY MONITORING (director-energy) ──────────────
  const renderEnergy = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('Bugungi sarfi'), value: '2 184', unit: 'kVt·soat', icon: Zap, color: 'text-amber-400', borderColor: 'border-amber-500/40' },
          { label: t("Gaz sarfi"), value: '148', unit: 'm³', icon: Flame, color: 'text-orange-400', borderColor: 'border-orange-500/40' },
          { label: t('Quvvat cho\'qqisi'), value: '285', unit: 'kVt', icon: Activity, color: 'text-red-400', borderColor: 'border-red-500/40' },
          { label: t('Energiya samaradorligi'), value: '91.4', unit: '%', icon: TrendingUp, color: 'text-emerald-400', borderColor: 'border-emerald-500/40' },
        ].map(c => (
          <div key={c.label} className={`border ${c.borderColor} bg-slate-950/60 rounded-2xl p-4`}>
            <c.icon className={`w-5 h-5 ${c.color} mb-2`}/>
            <p className="text-[11px] text-slate-400">{c.label}</p>
            <p className="text-2xl font-black text-white">{c.value} <span className="text-sm font-medium text-slate-400">{c.unit}</span></p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400"/>{t("Elektr sarfi (kVt·soat)")}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={energyData}>
              <defs><linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="t" tick={{ fill:'#475569', fontSize:9 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={45}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="url(#gE)" strokeWidth={2} dot={false} name={t('Sarfi')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Uskuna bo'yicha sarfi")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ENERGY_PIE} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {ENERGY_PIE.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {ENERGY_PIE.map(item => (
              <div key={item.name} className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }}/>{item.name}
                </span>
                <span className="text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── SHIFT MONITORING (director-shift) ─────────────────
  const renderShift = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-indigo-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-white"/></div>
            <div><p className="text-xs text-slate-400">{t('Joriy smena')}</p><p className="text-lg font-black text-white">1-Smena &middot; 07:00–15:00</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('Operatorlar'), value: SHIFT_OPERATORS.length, icon: Users },
              { label: t("O'tgan vaqt"), value: '2:18', icon: Timer },
              { label: t('Smena KPI'), value: '94%', icon: Target },
            ].map(c => (
              <div key={c.label} className="bg-white/5 rounded-xl p-3 text-center">
                <c.icon className="w-4 h-4 text-slate-400 mx-auto mb-1"/>
                <p className="text-xl font-black text-white">{c.value}</p>
                <p className="text-[10px] text-slate-500">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Smena unumdorligi (%)")}</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={SHIFT_OPERATORS.map(o => ({ name: o.name.split(' ')[0], eff: o.efficiency }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" tick={{ fill:'#475569', fontSize:9 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={30} domain={[80,100]}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Bar dataKey="eff" fill="#6366f1" radius={[4,4,0,0]} name={t('Samaradorlik')}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400"/>{t('Operator unumdorligi')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-800">
                {[t('Ism'),t('Lavozim'),t('Bajarildi'),t('Reja'),t('Samaradorlik')].map(h => (
                  <th key={h} className="text-left text-slate-500 font-semibold pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFT_OPERATORS.map(op => (
                <tr key={op.name} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-white">{op.name}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{op.role}</td>
                  <td className="py-2.5 pr-4 text-slate-300">{op.output.toLocaleString()} kg</td>
                  <td className="py-2.5 pr-4 text-slate-300">{op.plan.toLocaleString()} kg</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width:`${op.efficiency}%` }}/>
                      </div>
                      <span className={`font-bold ${op.efficiency>=95?'text-emerald-400':op.efficiency>=85?'text-blue-400':'text-amber-400'}`}>{op.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── ALERTS (director-alerts) ──────────────────────────
  const renderAlerts = () => {
    const filtered = alertFilter === 'all' ? alerts : alerts.filter(a => a.severity === alertFilter);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {(['critical','warning','info'] as AlertSeverity[]).map(sev => {
            const count = alerts.filter(a => a.severity === sev).length;
            const s = SEVERITY_STYLES[sev];
            return (
              <button key={sev} onClick={() => setAlertFilter(alertFilter === sev ? 'all' : sev)}
                className={`border ${s.border} ${s.bg} rounded-2xl p-4 text-left transition-all ${alertFilter===sev?'ring-1 ring-white/20':''}`}>
                <p className={`text-2xl font-black ${s.icon}`}>{count}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{SEVERITY_LABEL[sev]} {t('ogohlantirishlar')}</p>
              </button>
            );
          })}
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">{t('Barcha ogohlantirishlar')}</h3>
            <button onClick={() => setAlertFilter('all')} className="text-[10px] text-slate-400 hover:text-white transition-colors">{t('Barchasini ko\'rish')}</button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filtered.map(a => <AlertCard key={a.id} alert={a} onAck={acknowledgeAlert}/>)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  // ── STATS (director-stats) ────────────────────────────
  const renderStats = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400"/>{t("Kunlik ishlab chiqarish (so'nggi 7 kun, t)")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { d:t('Du'), v:14.2 }, { d:t('Se'), v:15.8 }, { d:t('Ch'), v:13.9 },
              { d:t('Pa'), v:16.1 }, { d:t('Ju'), v:15.4 }, { d:t('Sh'), v:11.2 }, { d:t('Ya'), v:0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="d" tick={{ fill:'#475569', fontSize:10 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={35}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Bar dataKey="v" fill="#3b82f6" radius={[4,4,0,0]} name={t('Ishlab chiqarish')}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400"/>{t('Oylik reja bajarilishi (%)')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[
              { m:t('Yan'), v:88 }, { m:t('Fev'), v:91 }, { m:t('Mar'), v:87 },
              { m:t('Apr'), v:94 }, { m:t('May'), v:93 },
            ]}>
              <defs><linearGradient id="gStats" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="m" tick={{ fill:'#475569', fontSize:10 }}/>
              <YAxis tick={{ fill:'#475569', fontSize:9 }} width={35} domain={[80,100]}/>
              <Tooltip {...DARK_TOOLTIP_STYLE}/>
              <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#gStats)" strokeWidth={2} dot name={t('Reja')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Material sarfi (t, oylik)")}</h3>
          <div className="space-y-3">
            {[
              { name: 'EPS granulalar', used: 42.8, total: 50, color: '#6366f1' },
              { name: 'CO₂ gazi',       used: 12.1, total: 15, color: '#f59e0b' },
              { name: 'Qoplama plyonka', used: 8.4, total: 12, color: '#10b981' },
            ].map(m => (
              <div key={m.name}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400">{m.name}</span>
                  <span className="text-white font-bold">{m.used}/{m.total} t</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width:`${(m.used/m.total)*100}%`, background: m.color }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">{t("Hisobot ko'rsatkichlari")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'OEE', value: '84.2%', sub: t('Umumiy samaradorlik') },
              { label: t("To'xtash"),    value: '2.4h',   sub: t("Bugungi to'xtashlar") },
              { label: t('Brak tezligi'), value: '3.2%',  sub: t('Sifat ko\'rsatkichi') },
              { label: t('Rejadan ortiq'), value: '+5.3%', sub: t('Ishlab chiqarish ortiqcha') },
              { label: t('Energiya'), value: '91.4%', sub: t('Samaradorlik') },
              { label: t('Bajarilgan'), value: '94%',  sub: t('Reja bajarilishi') },
            ].map(k => (
              <div key={k.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-[11px] text-slate-400">{k.label}</p>
                <p className="text-xl font-black text-white">{k.value}</p>
                <p className="text-[10px] text-slate-500">{k.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── REPORTS (director-reports) ────────────────────────
  const renderReports = () => (
    <div className="space-y-4">
      <div className="bg-slate-950/60 border border-indigo-500/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400"/>{t("Hisobot yaratish")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: t('Smena hisoboti'),           icon: Clock,        color: 'border-blue-500/40 hover:border-blue-500',    desc: t("Joriy smena to'liq ma'lumoti") },
            { title: t('Kunlik ishlab chiqarish'),   icon: Factory,      color: 'border-emerald-500/40 hover:border-emerald-500', desc: t("Bugungi barcha metrikalar") },
            { title: t('QC hisoboti'),              icon: Shield,        color: 'border-teal-500/40 hover:border-teal-500',    desc: t("Sifat nazorati natijalari") },
            { title: t('Energiya hisoboti'),        icon: Zap,           color: 'border-amber-500/40 hover:border-amber-500',  desc: t("Energiya sarfi tahlili") },
            { title: t('Uskuna hisoboti'),          icon: Wrench,        color: 'border-violet-500/40 hover:border-violet-500',desc: t("Texnik holat hisoboti") },
            { title: t('Haftalik xulosa'),          icon: BarChart3,     color: 'border-rose-500/40 hover:border-rose-500',    desc: t("7 kunlik umumiy hisobot") },
          ].map(r => (
            <button key={r.title} className={`border ${r.color} bg-slate-900/60 rounded-xl p-4 text-left transition-all group`}>
              <r.icon className="w-5 h-5 text-slate-400 group-hover:text-white mb-2 transition-colors"/>
              <p className="text-xs font-bold text-white">{r.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">
                <ArrowRight className="w-3 h-3"/>{t("Hisobotni yaratish")}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400"/>{t("So'nggi hisobotlar")}
        </h3>
        <div className="space-y-2">
          {[
            { name: t('Smena hisoboti — 1-smena'), date: t('Bugun 07:05'), size: '124 KB', type: 'PDF' },
            { name: t('Kunlik ishlab chiqarish'), date: t('Kecha 15:00'), size: '89 KB', type: 'Excel' },
            { name: t('Haftalik QC xulosa'), date: t('Dushanba 08:00'), size: '256 KB', type: 'PDF' },
            { name: t('Uskuna holati hisoboti'), date: t('Juma 18:00'), size: '78 KB', type: 'Excel' },
          ].map(r => (
            <div key={r.name} className="flex items-center justify-between py-2.5 border-b border-slate-800/40 hover:bg-slate-800/20 rounded-lg px-2 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500"/>
                <div>
                  <p className="text-xs font-semibold text-white">{r.name}</p>
                  <p className="text-[10px] text-slate-500">{r.date} · {r.size}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.type==='PDF'?'bg-red-500/15 text-red-400':'bg-emerald-500/15 text-emerald-400'}`}>{r.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── SECTION ROUTING ───────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'director-control':  return renderOverview();
      case 'director-production': return renderProduction();
      case 'director-live':     return renderLiveProcess();
      case 'director-qc':       return renderQC();
      case 'director-equipment':return renderEquipment();
      case 'director-energy':   return renderEnergy();
      case 'director-shift':    return renderShift();
      case 'director-alerts':   return renderAlerts();
      case 'director-stats':    return renderStats();
      case 'director-reports':  return renderReports();
      default:                  return renderOverview();
    }
  };

  // ── SECTION TITLE ─────────────────────────────────────
  const SECTION_TITLES: Record<string, string> = {
    'director-control':   t('Direktor Real-Time Nazorat Markazi'),
    'director-production':t('Ishlab Chiqarish Monitoring'),
    'director-live':      t('Jonli Jarayon'),
    'director-qc':        t('QC Monitoring'),
    'director-equipment': t('Uskunalar Holati'),
    'director-energy':    t('Energiya Monitoring'),
    'director-shift':     t('Smena Monitoring'),
    'director-alerts':    t('Ogohlantirishlar'),
    'director-stats':     t('Ishlab Chiqarish Statistikasi'),
    'director-reports':   t('Hisobotlar'),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {renderHeader()}
      <div className="px-4 pb-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-black text-white">{SECTION_TITLES[activeTab] || t('Direktor Paneli')}</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {errorCount > 0 && <span className="text-red-400 font-semibold mr-2">⚠ {errorCount} {t('xato')}</span>}
              {warningCount > 0 && <span className="text-amber-400 font-semibold mr-2">⚡ {warningCount} {t('ogohlantirish')}</span>}
              {t('Jonli yangilanish')} · {String(lastRefresh.getHours()).padStart(2,'0')}:{String(lastRefresh.getMinutes()).padStart(2,'0')}:{String(lastRefresh.getSeconds()).padStart(2,'0')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-300 bg-red-950/60 border border-red-500/40 px-3 py-1.5 rounded-lg animate-pulse">
                <AlertCircle className="w-3.5 h-3.5"/>{t('Tezkor aralashuv talab etiladi')}
              </span>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
