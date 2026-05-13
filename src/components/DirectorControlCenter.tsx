import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  AlertTriangle, Bell, CheckCircle2, Info, Zap, ChevronRight,
  Thermometer, Download, Clock, Users, Activity, Package,
  Gauge, Power, Cpu, TrendingUp, TrendingDown,
} from 'lucide-react';
import { User } from '../types';

interface Props { user: User; activeTab: string; }
type Status = 'active' | 'warning' | 'error' | 'offline';
type AlertSev = 'critical' | 'warning' | 'info';

const SC: Record<Status, string> = {
  active: '#10b981', warning: '#f59e0b', error: '#ef4444', offline: '#475569',
};

/* ─── shared helpers ─────────────────────────────── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const iv = setInterval(() => setT(new Date()), 1000); return () => clearInterval(iv); }, []);
  return <span className="tabular-nums font-mono text-slate-300 text-sm tracking-widest">{t.toLocaleTimeString('uz-UZ', { hour12: false })}</span>;
}

function PulseDot({ status }: { status: Status }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {status === 'active' && <span className="animate-ping absolute h-full w-full rounded-full opacity-50" style={{ backgroundColor: SC[status] }}/>}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: SC[status] }}/>
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const labels = { active: 'Ishlamoqda', warning: 'Ogohlantirish', error: "Xato", offline: 'Oflayn' };
  const cls = {
    active:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    error:   'bg-red-500/10 text-red-400 border-red-500/30',
    offline: 'bg-slate-500/10 text-slate-400 border-slate-600/30',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold ${cls[status]}`}>{labels[status]}</span>;
}

/* ─── top bar (shared across all tabs) ──────────── */
const TAB_LABELS: Record<string, string> = {
  'director-control':    'Nazorat Markazi',
  'director-production': 'Ishlab Chiqarish Monitoring',
  'director-live':       'Jonli Jarayon',
  'director-qc':         'QC Monitoring',
  'director-equipment':  'Uskunalar Holati',
  'director-energy':     'Energiya Monitoring',
  'director-shift':      'Smena Monitoring',
  'director-alerts':     "Ogohlantirishlar",
  'director-stats':      'Statistika',
  'director-reports':    'Hisobotlar',
};

function TopBar({ user, activeTab, unread }: { user: User; activeTab: string; unread: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 border-b border-slate-800/70 shrink-0">
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-50"/>
        <span className="relative rounded-full h-2.5 w-2.5 bg-emerald-400"/>
      </span>
      <span className="text-sm font-semibold text-slate-100 tracking-wide">{TAB_LABELS[activeTab] ?? 'Direktor Paneli'}</span>
      <div className="flex-1"/>
      <LiveClock/>
      <div className="relative">
        <Bell className="w-4 h-4 text-slate-400"/>
        {unread > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">{unread}</span>}
      </div>
      <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">{user.username[0].toUpperCase()}</div>
        <span className="text-xs text-slate-400">{user.username}</span>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center gap-4 px-4 py-1.5 border-t border-slate-800/60 text-[10px] text-slate-600 shrink-0 bg-[#07101c]">
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>Server: Ulangan</span>
      <span>Smena: Kunduzgi (08:00–20:00)</span>
      <span className="ml-auto">v1.2.0</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SVG EQUIPMENT SHAPES
══════════════════════════════════════════════════════ */
function SiloSVG({ cx, cy, c, level }: { cx: number; cy: number; c: string; level: number }) {
  const bh = 66, bw = 48, fillH = Math.max(2, (bh - 4) * (level / 100));
  return (
    <g>
      <rect x={cx-bw/2} y={cy-bh/2} width={bw} height={bh} rx="3" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <rect x={cx-bw/2+2} y={cy+bh/2-2-fillH} width={bw-4} height={fillH} fill={c} opacity="0.22"/>
      <line x1={cx-bw/2+3} x2={cx+bw/2-3} y1={cy+bh/2-2-fillH} y2={cy+bh/2-2-fillH} stroke={c} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7"/>
      <path d={`M ${cx-bw/2} ${cy+bh/2} L ${cx-8} ${cy+bh/2+20} L ${cx+8} ${cy+bh/2+20} L ${cx+bw/2} ${cy+bh/2}Z`} fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <line x1={cx} x2={cx} y1={cy+bh/2+20} y2={cy+bh/2+28} stroke={c} strokeWidth="2.5"/>
    </g>
  );
}
function ExpanderSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="28" ry="44" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <ellipse cx={cx} cy={cy-44} rx="28" ry="8" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <line x1={cx} y1={cy-46} x2={cx} y2={cy+38} stroke={c} strokeWidth="0.9" opacity="0.4"/>
      {[-15, 0, 15].map(dy => <line key={dy} x1={cx-18} y1={cy+dy} x2={cx+18} y2={cy+dy} stroke={c} strokeWidth="1.5" opacity="0.6"/>)}
      <line x1={cx} y1={cy-52} x2={cx} y2={cy-64} stroke="#475569" strokeWidth="2"/>
      <path d={`M ${cx-5} ${cy-62} Q ${cx} ${cy-72} ${cx+5} ${cy-62}`} fill="none" stroke="#475569" strokeWidth="1" opacity="0.5"/>
    </g>
  );
}
function ChamberSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx-38} y={cy-44} width={76} height={88} rx="4" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {[0,1,2,3].map(row=>[0,1,2].map(col=>(
        <rect key={`${row}-${col}`} x={cx-30+col*21} y={cy-36+row*21} width="17" height="17" rx="2" fill={c} opacity="0.09" stroke={c} strokeWidth="0.5" strokeOpacity="0.3"/>
      )))}
      <line x1={cx+38} y1={cy-16} x2={cx+46} y2={cy-16} stroke="#475569" strokeWidth="1.5"/>
      <circle cx={cx+49} cy={cy-16} r="4" fill="#060e1e" stroke="#475569" strokeWidth="1.2"/>
    </g>
  );
}
function PressSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx-32} y={cy-50} width={64} height={100} rx="3" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <rect x={cx-26} y={cy-42} width={52} height={9} rx="2" fill={c} opacity="0.4"/>
      <rect x={cx-7} y={cy-33} width={14} height={40} rx="2" fill={c} opacity="0.18"/>
      <polygon points={`${cx-6},${cy+5} ${cx+6},${cy+5} ${cx},${cy+16}`} fill={c} opacity="0.55"/>
      <rect x={cx-26} y={cy+17} width={52} height={9} rx="2" fill={c} opacity="0.4"/>
    </g>
  );
}
function CutterSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx-32} y={cy-42} width={64} height={84} rx="3" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <rect x={cx-26} y={cy-35} width={52} height={7} rx="1" fill={c} opacity="0.55"/>
      {[-16,-2,12,26].map(dy=><line key={dy} x1={cx-24} y1={cy+dy} x2={cx+24} y2={cy+dy} stroke={c} strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/>)}
    </g>
  );
}
function PackerSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx-30} y={cy-42} width={60} height={84} rx="3" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <rect x={cx-18} y={cy-18} width={36} height={30} rx="2" fill={c} opacity="0.16" stroke={c} strokeWidth="0.9"/>
      <line x1={cx-18} y1={cy-4} x2={cx+18} y2={cy-4} stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <line x1={cx} y1={cy-18} x2={cx} y2={cy+12} stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <rect x={cx-18} y={cy+14} width={36} height={4} rx="1" fill={c} opacity="0.4"/>
    </g>
  );
}
function WarehouseSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx-42} y={cy-24} width={84} height={58} rx="3" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <path d={`M ${cx-48} ${cy-24} L ${cx} ${cy-54} L ${cx+48} ${cy-24}Z`} fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <rect x={cx-13} y={cy+4} width={26} height={30} rx="2" fill={c} opacity="0.15" stroke={c} strokeWidth="0.9"/>
      {[-24,14].map(dx=>(
        <g key={dx}>
          <rect x={cx+dx-9} y={cy-14} width={18} height={11} rx="1" fill={c} opacity="0.2" stroke={c} strokeWidth="0.5"/>
          <rect x={cx+dx-9} y={cy-1} width={18} height={4} rx="1" fill={c} opacity="0.18"/>
        </g>
      ))}
    </g>
  );
}

function AnimPipe({ x1, x2, y, active, label }: { x1:number;x2:number;y:number;active:boolean;label?:string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#e2e8f0" strokeWidth="8"/>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={active ? '#d1fae5' : '#e2e8f0'} strokeWidth="5"/>
      {active && <line x1={x1} y1={y} x2={x2} y2={y} stroke="#10b981" strokeWidth="2" strokeDasharray="8 5" style={{ animation:'pipflow 1.4s linear infinite' }} opacity="0.85"/>}
      <polygon points={`${x2-7},${y-4} ${x2},${y} ${x2-7},${y+4}`} fill={active ? '#10b981' : '#94a3b8'} opacity="0.85"/>
      {label && <text x={(x1+x2)/2} y={y-9} textAnchor="middle" fill="#f59e0b" fontSize="8.5" fontFamily="monospace" fontWeight="bold">{label}</text>}
    </g>
  );
}
function SBadge({ cx,cy,val,unit,color }: { cx:number;cy:number;val:string;unit:string;color:string }) {
  return (
    <g>
      <rect x={cx-22} y={cy-9} width={44} height={18} rx="3" fill="#060e1e" stroke={color} strokeWidth="0.8" opacity="0.95"/>
      <text x={cx} y={cy+4.5} textAnchor="middle" fill={color} fontSize="9.5" fontFamily="monospace" fontWeight="bold">{val}{unit}</text>
    </g>
  );
}
function EqLabel({ cx,y,name,status }: { cx:number;y:number;name:string;status:Status }) {
  return (
    <g>
      <rect x={cx-34} y={y} width={68} height={15} rx="2.5" fill="#060e1e" stroke={SC[status]} strokeWidth="0.7" opacity="0.9"/>
      <text x={cx} y={y+10.5} textAnchor="middle" fill={SC[status]} fontSize="8.5" fontFamily="monospace" fontWeight="600">{name}</text>
    </g>
  );
}

/* ── Factory P&ID ────────────────────────────────── */
type StageInfo = { label:string;status:Status;level?:number;temp?:number;pressure?:number };
const BASE_STAGES: StageInfo[] = [
  { label:'SILO-1',    status:'active',  level:78 },
  { label:"KO'PIRT.",  status:'active',  temp:82, pressure:4.2 },
  { label:'QATTIQLASHTIR',status:'warning',temp:18 },
  { label:'BLOK PRESS',status:'active',  pressure:12.5 },
  { label:'KESISH',    status:'active' },
  { label:'QADOQLASH', status:'active' },
  { label:'OMBOR',     status:'active',  level:62 },
];
const SX = [65, 170, 282, 392, 494, 594, 700];
const PY = 150;

function FactoryPID({ tick }: { tick: number }) {
  const pipes: Array<[number,number,string|undefined]> = [
    [SX[0]+24, SX[1]-28, undefined],
    [SX[1]+28, SX[2]-38, `${(4.2+Math.sin(tick*0.3)*0.05).toFixed(1)} bar`],
    [SX[2]+38, SX[3]-32, undefined],
    [SX[3]+32, SX[4]-32, undefined],
    [SX[4]+32, SX[5]-30, undefined],
    [SX[5]+30, SX[6]-42, undefined],
  ];
  return (
    <svg viewBox="0 0 780 278" className="w-full h-full" style={{ fontFamily:'monospace' }}>
      <defs><style>{`
        @keyframes pipflow{from{stroke-dashoffset:26}to{stroke-dashoffset:0}}
        @keyframes wblink{0%,100%{opacity:1}50%{opacity:0.2}}
      `}</style></defs>
      {Array.from({length:18}).map((_,i)=><line key={`v${i}`} x1={i*44} y1={0} x2={i*44} y2={278} stroke="#e2e8f0" strokeWidth="0.4"/>)}
      {Array.from({length:7}).map((_,i)=><line key={`h${i}`} x1={0} y1={i*44} x2={780} y2={i*44} stroke="#e2e8f0" strokeWidth="0.4"/>)}
      {pipes.map(([x1,x2,lbl],i)=>(
        <AnimPipe key={i} x1={x1} x2={x2} y={PY+28} active={BASE_STAGES[i].status!=='offline'} label={lbl}/>
      ))}
      {BASE_STAGES.map((s,i)=>{
        const cx=SX[i],cy=PY,c=SC[s.status];
        const tv=s.temp!=null?String(Math.round(s.temp+Math.sin(tick*0.5+i)*1.2)):null;
        const pv=s.pressure!=null?(s.pressure+Math.sin(tick*0.38+i)*0.04).toFixed(1):null;
        return (
          <g key={i}>
            {i===0&&<SiloSVG cx={cx} cy={cy} c={c} level={s.level!}/>}
            {i===1&&<ExpanderSVG cx={cx} cy={cy} c={c}/>}
            {i===2&&<ChamberSVG cx={cx} cy={cy} c={c}/>}
            {i===3&&<PressSVG cx={cx} cy={cy} c={c}/>}
            {i===4&&<CutterSVG cx={cx} cy={cy} c={c}/>}
            {i===5&&<PackerSVG cx={cx} cy={cy} c={c}/>}
            {i===6&&<WarehouseSVG cx={cx} cy={cy} c={c}/>}
            {tv&&<SBadge cx={cx+(i===1?42:46)} cy={cy-26} val={tv} unit="°C" color="#f59e0b"/>}
            {pv&&<SBadge cx={cx+(i===1?42:46)} cy={cy-6} val={pv} unit=" b" color="#3b82f6"/>}
            {s.level!=null&&<SBadge cx={cx} cy={i===0?cy-48:cy-38} val={String(s.level)} unit="%" color={c}/>}
            {s.status==='warning'&&<circle cx={cx+(i===2?38:32)} cy={cy-48} r="5" fill="#f59e0b" style={{animation:'wblink 0.85s ease infinite'}}/>}
            <EqLabel cx={cx} y={PY+84} name={s.label} status={s.status}/>
          </g>
        );
      })}
      <text x="8" y="16" fill="#94a3b8" fontSize="9" fontWeight="700" letterSpacing="1">TEXNOLOGIK JARAYON</text>
      <circle cx={148} cy={12} r="3.5" fill="#10b981" style={{animation:'wblink 1.8s ease infinite'}}/>
      <text x={155} y={16} fill="#10b981" fontSize="9" fontWeight="700">JONLI</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════ */
const ALERTS_DATA = [
  { id:'a1', sev:'critical' as AlertSev, time:'10:21:15', equip:'P-101 Kompressor',      msg:"Bosim ruxsat chegarasidan 0.3 bar past",      ack:false },
  { id:'a2', sev:'warning'  as AlertSev, time:'10:18:42', equip:'E-101 Isitgich',         msg:"Harorat o'rnatilgandan 5°C yuqori",            ack:false },
  { id:'a3', sev:'warning'  as AlertSev, time:'10:16:07', equip:'SILO-1',                 msg:"EPS granulasi zaxirasi: 2 kunlik qoldi",        ack:false },
  { id:'a4', sev:'info'     as AlertSev, time:'10:10:33', equip:'Kesish liniyasi',         msg:"2-liya reja yangilandi",                        ack:true  },
  { id:'a5', sev:'warning'  as AlertSev, time:'10:05:11', equip:'QC stantsiyasi',          msg:"3-blok zichlik me'yoridan past",                ack:true  },
  { id:'a6', sev:'info'     as AlertSev, time:'09:55:02', equip:'Qadoqlash',               msg:"Qadoqlash materiallar tugash arafasida",         ack:true  },
  { id:'a7', sev:'critical' as AlertSev, time:'09:30:44', equip:'V-101 Vakuum',            msg:"Vakuum tizimi to'liq ishlamayapti",             ack:false },
];

const SEV: Record<AlertSev,{left:string;icon:string;bg:string;iconEl:React.ReactNode}> = {
  critical:{left:'border-l-red-500',   icon:'text-red-400',   bg:'bg-red-950/20',   iconEl:<AlertTriangle className="w-3.5 h-3.5"/>},
  warning: {left:'border-l-amber-500', icon:'text-amber-400', bg:'bg-amber-950/20', iconEl:<AlertTriangle className="w-3.5 h-3.5"/>},
  info:    {left:'border-l-blue-500',  icon:'text-blue-400',  bg:'bg-blue-950/20',  iconEl:<Info className="w-3.5 h-3.5"/>},
};

const EQUIP_LIST = [
  { id:'p101', name:"P-101 Ko'pirtirgich",  status:'active'  as Status, eff:85, val:'4.2 bar', temp:72,  maint:'2025-07-15' },
  { id:'e101', name:'E-101 Isitish tizimi', status:'active'  as Status, eff:92, val:'68°C',    temp:68,  maint:'2025-08-01' },
  { id:'t101', name:'T-101 Qattiqlash',     status:'warning' as Status, eff:74, val:'18°C',    temp:18,  maint:'2025-06-20' },
  { id:'c101', name:'C-101 Kesish linyasi', status:'active'  as Status, eff:78, val:'–',       temp:32,  maint:'2025-09-10' },
  { id:'p202', name:'P-202 Kompressor',     status:'warning' as Status, eff:65, val:'3.1 bar', temp:81,  maint:'2025-06-05' },
  { id:'v101', name:'V-101 Vakuum tizimi',  status:'error'   as Status, eff:0,  val:'0 bar',   temp:94,  maint:'—' },
];

const KPI_MAIN = [
  { label:"Ishlab chiqarish rejasi", value:'85%',      sub:'128/150 m³',     color:'#10b981', icon:<TrendingUp className="w-4 h-4"/> },
  { label:"Aktiv uskunalar",         value:'24/28',    sub:'4 ta oflayn',    color:'#3b82f6', icon:<Cpu className="w-4 h-4"/> },
  { label:"Sifat ko'rsatkichi",      value:'96.4%',    sub:'68% A-sinf',     color:'#10b981', icon:<CheckCircle2 className="w-4 h-4"/> },
  { label:"Ogohlantirishlar",        value:'5',        sub:'2 ta kritik',    color:'#f59e0b', icon:<AlertTriangle className="w-4 h-4"/> },
  { label:"Energiya sarfi",          value:'142 kWh',  sub:"-8% o'tgan sm.", color:'#6366f1', icon:<Zap className="w-4 h-4"/> },
];

function genHours(base:number,v=8,n=24) {
  return Array.from({length:n},(_,i)=>{
    const h=8+Math.floor(i/2),m=(i%2)*30;
    return { t:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, v:+(base+(Math.random()-0.45)*v).toFixed(1) };
  });
}
function genDays(base:number,v=15) {
  const days=["Dush","Sesh","Chor","Pay","Juma","Shan","Yak"];
  return days.map(d=>({ d, plan:base, fact:Math.round(base*(0.75+Math.random()*0.3)) }));
}

const CHART_TEMP  = genHours(72,10);
const CHART_BAR   = genHours(4.2,0.4);
const CHART_OUT   = genHours(5.2,1.4);
const CHART_PROD  = genDays(150,20);
const CHART_GAS   = genDays(320,40);
const CHART_ELEC  = genDays(420,50);

const QC_PIE = [
  { name:'A Sinf', value:68, color:'#10b981' },
  { name:'B Sinf', value:22, color:'#3b82f6' },
  { name:'C Sinf', value:7,  color:'#f59e0b' },
  { name:'Brak',   value:3,  color:'#ef4444' },
];

const SHIFT_WORKERS = [
  { name:'A. Karimov',   role:"Ko'pirtirish operatori", out:1850, plan:2000, eff:93, status:'active' as Status },
  { name:'B. Toshmatov', role:'Blok press operatori',   out:1600, plan:1700, eff:94, status:'active' as Status },
  { name:'C. Yusupov',   role:'Kesish operatori',       out:1580, plan:1600, eff:99, status:'active' as Status },
  { name:'D. Nazarov',   role:'Qadoqlash operatori',    out:1540, plan:1600, eff:96, status:'active' as Status },
  { name:'E. Rahimov',   role:'QC inspektori',          out:1560, plan:1600, eff:98, status:'active' as Status },
  { name:'F. Xolmatov',  role:'Yordamchi',              out:1200, plan:1600, eff:75, status:'warning' as Status },
];

const REPORTS_LIST = [
  { name:"Kunlik ishlab chiqarish hisoboti",  date:"2025-05-13", size:"48 KB",  type:"PDF" },
  { name:"Haftalik QC xisoboti",              date:"2025-05-12", size:"112 KB", type:"XLSX" },
  { name:"Uskunalar texnik xizmati jadval",   date:"2025-05-10", size:"64 KB",  type:"PDF" },
  { name:"Energiya sarfi tahlili (may)",      date:"2025-05-08", size:"88 KB",  type:"XLSX" },
  { name:"Smena unumdorligi hisoboti",        date:"2025-05-07", size:"32 KB",  type:"PDF" },
  { name:"Xomashyo sarfi va qoldiq balans",   date:"2025-05-05", size:"56 KB",  type:"XLSX" },
];

const TOOLTIP_STYLE = { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:6, fontSize:10, color:'#334155' };
const LABEL_STYLE   = { color:'#64748b' };

/* ══════════════════════════════════════════════════════
   TAB COMPONENTS
══════════════════════════════════════════════════════ */

/* ── Control Center (main P&ID tab) ─────────────── */
function ControlCenterTab({ tick, chartData }: { tick:number; chartData: typeof CHART_TEMP }) {
  return (
    <div className="flex flex-1 gap-2 px-3 pb-2 min-h-0">
      <div className="flex flex-col flex-1 gap-2 min-w-0">
        <div className="bg-white border border-slate-200/60 rounded-xl flex-1 min-h-0 overflow-hidden p-2">
          <FactoryPID tick={tick}/>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-xl shrink-0 p-3" style={{height:156}}>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Real-vaqt sensorlar</span>
            <div className="flex items-center gap-3 ml-auto">
              {[['#f59e0b','Harorat °C'],['#3b82f6','Bosim bar'],['#10b981','Chiqim m³/h']].map(([c,l])=>(
                <div key={l} className="flex items-center gap-1">
                  <div className="w-5 h-0.5 rounded" style={{backgroundColor:c}}/>
                  <span className="text-[9px] text-slate-500">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={chartData} margin={{top:2,right:4,bottom:0,left:-28}}>
              <XAxis dataKey="t" tick={{fontSize:8,fill:'#475569'}} interval={4}/>
              <YAxis tick={{fontSize:8,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-72 shrink-0">
        <div className="bg-white border border-slate-200/60 rounded-xl flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/50 shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Joriy ogohlantirishlar</span>
            <span className="text-[9px] text-slate-500">{ALERTS_DATA.filter(a=>!a.ack).length} yangi</span>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {ALERTS_DATA.map(a=>{
              const st=SEV[a.sev];
              return (
                <div key={a.id} className={`border-l-2 ${st.left} ${st.bg} px-3 py-2 border-b border-slate-200/40`}>
                  <div className="flex items-start gap-1.5">
                    <span className={`mt-0.5 shrink-0 ${st.icon}`}>{st.iconEl}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-[10px] font-semibold ${st.icon} truncate`}>{a.equip}</span>
                        <span className="ml-auto text-[9px] text-slate-600 shrink-0">{a.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{a.msg}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-xl shrink-0">
          <div className="px-3 py-2.5 border-b border-slate-200/50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Uskunalar holati</span>
          </div>
          <div className="divide-y divide-slate-200/40">
            {EQUIP_LIST.map(eq=>(
              <div key={eq.id} className="flex items-center gap-2 px-3 py-2">
                <PulseDot status={eq.status}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-slate-700 truncate">{eq.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${eq.eff}%`,backgroundColor:SC[eq.status]}}/>
                    </div>
                    <span className="text-[9px] tabular-nums" style={{color:SC[eq.status]}}>{eq.eff}%</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-500 shrink-0">{eq.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Production tab ──────────────────────────────── */
function ProductionTab() {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-4 gap-2 mb-3 mt-1">
        {[
          {label:"Bugungi chiqim",  value:'128 m³',  sub:'Reja: 150 m³',  color:'#10b981'},
          {label:"Smena foizi",     value:'85.3%',   sub:'+3% kecha',     color:'#10b981'},
          {label:"Brakovka",        value:'3.6%',    sub:'Norma: <5%',    color:'#f59e0b'},
          {label:"Verim",           value:'96.4%',   sub:'A+B sinflar',   color:'#3b82f6'},
        ].map((k,i)=>(
          <div key={i} className="bg-white border border-slate-200/60 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
            <div className="text-xl font-bold tabular-nums" style={{color:k.color}}>{k.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Haftalik ishlab chiqarish (m³)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_PROD} margin={{top:4,right:4,bottom:0,left:-20}}>
              <XAxis dataKey="d" tick={{fontSize:9,fill:'#475569'}}/>
              <YAxis tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Bar dataKey="plan" fill="#cbd5e1" name="Reja" radius={[3,3,0,0]}/>
              <Bar dataKey="fact" fill="#10b981" name="Fakt" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Soatlik harorat trendi (°C)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_TEMP} margin={{top:4,right:4,bottom:0,left:-20}}>
              <XAxis dataKey="t" tick={{fontSize:9,fill:'#475569'}} interval={4}/>
              <YAxis tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Ishlab chiqarish liniyalari holati</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {name:'1-liya (EPS 10)',    out:'48 m³', plan:'50 m³', status:'active' as Status},
              {name:'2-liya (EPS 20)',    out:'42 m³', plan:'50 m³', status:'active' as Status},
              {name:'3-liya (EPS 35)',    out:'38 m³', plan:'50 m³', status:'warning' as Status},
            ].map((l,i)=>(
              <div key={i} className="border border-slate-300/50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <PulseDot status={l.status}/>
                  <span className="text-[11px] font-semibold text-slate-700">{l.name}</span>
                </div>
                <div className="text-lg font-bold tabular-nums" style={{color:SC[l.status]}}>{l.out}</div>
                <div className="text-[10px] text-slate-500">Reja: {l.plan}</div>
                <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${parseInt(l.out)*100/parseInt(l.plan)}%`,backgroundColor:SC[l.status]}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── QC tab ──────────────────────────────────────── */
function QCTab() {
  const tests = [
    {id:'BLK-0512',time:'10:15',dens:'14.8',comp:'85',fire:'B2',cls:'A',pass:true},
    {id:'BLK-0511',time:'09:42',dens:'15.1',comp:'88',fire:'B2',cls:'A',pass:true},
    {id:'BLK-0510',time:'09:10',dens:'13.9',comp:'79',fire:'B2',cls:'B',pass:true},
    {id:'BLK-0509',time:'08:38',dens:'12.8',comp:'71',fire:'C',  cls:'C',pass:false},
    {id:'BLK-0508',time:'08:05',dens:'14.6',comp:'84',fire:'B2',cls:'A',pass:true},
  ];
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col items-center" style={{height:220}}>
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Sinf taqsimoti</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={QC_PIE} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                {QC_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
            {QC_PIE.map(e=>(
              <div key={e.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor:e.color}}/>
                <span className="text-[9px] text-slate-400">{e.name}: {e.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Zichlik trendi (kg/m³)</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={CHART_BAR.map(d=>({...d,v2:+(d.v*3.5).toFixed(1)}))} margin={{top:4,right:4,bottom:0,left:-16}}>
              <XAxis dataKey="t" tick={{fontSize:9,fill:'#475569'}} interval={4}/>
              <YAxis tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} name="Zichlik"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white border border-slate-200/60 rounded-xl p-3">
        <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Oxirgi blok testlari</div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-slate-600 border-b border-slate-200">
              {['Blok ID','Vaqt','Zichlik','Siqilish','Yong`inbardosh','Sinf','Holat'].map(h=>(
                <th key={h} className="text-left py-1.5 px-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests.map(t=>(
              <tr key={t.id} className="border-b border-slate-200/40 hover:bg-slate-100">
                <td className="py-1.5 px-2 font-mono text-slate-700">{t.id}</td>
                <td className="py-1.5 px-2 text-slate-500">{t.time}</td>
                <td className="py-1.5 px-2 tabular-nums text-slate-700">{t.dens}</td>
                <td className="py-1.5 px-2 tabular-nums text-slate-700">{t.comp} kPa</td>
                <td className="py-1.5 px-2 text-slate-700">{t.fire}</td>
                <td className="py-1.5 px-2">
                  <span className={`font-bold ${t.cls==='A'?'text-emerald-400':t.cls==='B'?'text-blue-400':'text-amber-400'}`}>{t.cls}</span>
                </td>
                <td className="py-1.5 px-2">
                  {t.pass
                    ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>O'tdi</span>
                    : <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Brak</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Equipment tab ───────────────────────────────── */
function EquipmentTab() {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
        {[
          {label:'Jami uskunalar', value:'28', color:'#3b82f6'},
          {label:'Aktiv',          value:'24', color:'#10b981'},
          {label:'Ogohlantirish',  value:'2',  color:'#f59e0b'},
          {label:"To'xtagan",      value:'2',  color:'#ef4444'},
          {label:'O\'rtacha samaradorlik', value:'78%', color:'#10b981'},
          {label:'Texnik xizmat kerak', value:'3', color:'#f59e0b'},
        ].map((k,i)=>(
          <div key={i} className="bg-white border border-slate-200/60 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
            <div className="text-2xl font-bold tabular-nums" style={{color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200/60 rounded-xl p-3">
        <div className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Uskunalar ro'yxati</div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-slate-600 border-b border-slate-200">
              {['Uskuna','Holat','Samaradorlik','Harorat','Quvvat','Texnik xizmat'].map(h=>(
                <th key={h} className="text-left py-1.5 px-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EQUIP_LIST.map(eq=>(
              <tr key={eq.id} className="border-b border-slate-200/40 hover:bg-slate-100">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <PulseDot status={eq.status}/>
                    <span className="text-slate-800 font-medium">{eq.name}</span>
                  </div>
                </td>
                <td className="py-2 px-2"><StatusBadge status={eq.status}/></td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${eq.eff}%`,backgroundColor:SC[eq.status]}}/>
                    </div>
                    <span className="tabular-nums" style={{color:SC[eq.status]}}>{eq.eff}%</span>
                  </div>
                </td>
                <td className="py-2 px-2 tabular-nums text-slate-700">{eq.temp}°C</td>
                <td className="py-2 px-2 text-slate-400">{eq.val}</td>
                <td className="py-2 px-2 text-slate-500 font-mono">{eq.maint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Energy tab ──────────────────────────────────── */
function EnergyTab() {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-4 gap-2 mt-1 mb-2">
        {[
          {label:'Bugungi gaz',    value:"1 840 m³", sub:'Reja: 2 000',  color:'#f59e0b'},
          {label:'Bugungi elektr', value:'2 340 kWh', sub:'Reja: 2 500', color:'#6366f1'},
          {label:'Gaz narxi',      value:"1.84 M so'm",sub:'Sm: 1000/m³',color:'#94a3b8'},
          {label:'Elektr narxi',   value:"1.87 M so'm",sub:'Sm: 800/kWh', color:'#94a3b8'},
        ].map((k,i)=>(
          <div key={i} className="bg-white border border-slate-200/60 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
            <div className="text-lg font-bold tabular-nums leading-tight" style={{color:k.color}}>{k.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400"/>Haftalik gaz sarfi (m³)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_GAS} margin={{top:4,right:4,bottom:0,left:-10}}>
              <XAxis dataKey="d" tick={{fontSize:9,fill:'#475569'}}/>
              <YAxis tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Bar dataKey="plan" fill="#cbd5e1" name="Reja" radius={[3,3,0,0]}/>
              <Bar dataKey="fact" fill="#f59e0b" name="Fakt" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Power className="w-3.5 h-3.5 text-indigo-400"/>Haftalik elektr sarfi (kWh)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_ELEC} margin={{top:4,right:4,bottom:0,left:-10}}>
              <XAxis dataKey="d" tick={{fontSize:9,fill:'#475569'}}/>
              <YAxis tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Bar dataKey="plan" fill="#cbd5e1" name="Reja" radius={[3,3,0,0]}/>
              <Bar dataKey="fact" fill="#6366f1" name="Fakt" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Uskunalar bo'yicha elektr sarfi (%)</div>
          <div className="space-y-2">
            {[
              {name:"Ko'pirtirish",  pct:32, color:'#6366f1'},
              {name:'Isitish tizimi',pct:28, color:'#f59e0b'},
              {name:'Blok Press',    pct:24, color:'#10b981'},
              {name:'Kesish',        pct:10, color:'#3b82f6'},
              {name:'Boshqalar',     pct:6,  color:'#475569'},
            ].map(e=>(
              <div key={e.name} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 w-28 shrink-0">{e.name}</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${e.pct}%`,backgroundColor:e.color}}/>
                </div>
                <span className="text-[10px] tabular-nums text-slate-400 w-8 text-right">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shift tab ───────────────────────────────────── */
function ShiftTab() {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-4 gap-2 mt-1 mb-2">
        {[
          {label:'Smena',       value:'Kunduzgi',  sub:'08:00 – 20:00', color:'#3b82f6'},
          {label:'Ishchilar',   value:'18/20',     sub:'2 ta yo\'q',   color:'#10b981'},
          {label:"Umumiy ish unumdorligi", value:'92%', sub:'+4% kecha', color:'#10b981'},
          {label:'Qolgan vaqt', value:'5 s 12 d',  sub:'Smena tugashiga',color:'#f59e0b'},
        ].map((k,i)=>(
          <div key={i} className="bg-white border border-slate-200/60 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
            <div className="text-lg font-bold" style={{color:k.color}}>{k.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200/60 rounded-xl p-3">
        <div className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Smena ishchilari</div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-slate-600 border-b border-slate-200">
              {['Ishchi','Lavozim','Chiqim','Reja','Samaradorlik','Holat'].map(h=>(
                <th key={h} className="text-left py-1.5 px-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_WORKERS.map((w,i)=>(
              <tr key={i} className="border-b border-slate-200/40 hover:bg-slate-100">
                <td className="py-2 px-2 font-medium text-slate-800">{w.name}</td>
                <td className="py-2 px-2 text-slate-500">{w.role}</td>
                <td className="py-2 px-2 tabular-nums text-slate-700">{w.out.toLocaleString()}</td>
                <td className="py-2 px-2 tabular-nums text-slate-500">{w.plan.toLocaleString()}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${w.eff}%`,backgroundColor:SC[w.status]}}/>
                    </div>
                    <span style={{color:SC[w.status]}}>{w.eff}%</span>
                  </div>
                </td>
                <td className="py-2 px-2"><StatusBadge status={w.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Alerts tab ──────────────────────────────────── */
function AlertsTab() {
  const [acked, setAcked] = useState<Set<string>>(new Set(ALERTS_DATA.filter(a=>a.ack).map(a=>a.id)));
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
        {[
          {label:'Kritik',      value:ALERTS_DATA.filter(a=>a.sev==='critical').length, color:'#ef4444'},
          {label:'Ogohlantirish',value:ALERTS_DATA.filter(a=>a.sev==='warning').length, color:'#f59e0b'},
          {label:'Ma\'lumot',   value:ALERTS_DATA.filter(a=>a.sev==='info').length,    color:'#3b82f6'},
        ].map((k,i)=>(
          <div key={i} className="bg-white border border-slate-200/60 rounded-lg px-3 py-2.5 flex items-center gap-3">
            <div className="text-3xl font-bold tabular-nums" style={{color:k.color}}>{k.value}</div>
            <div className="text-[11px] text-slate-400">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden">
        <div className="px-3 py-2.5 border-b border-slate-200/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Barcha ogohlantirishlar
        </div>
        <div className="divide-y divide-slate-200/40">
          {ALERTS_DATA.map(a=>{
            const st=SEV[a.sev];
            const isAcked=acked.has(a.id);
            return (
              <div key={a.id} className={`border-l-2 ${st.left} ${isAcked?'opacity-50':''} px-4 py-3 flex items-start gap-3 hover:bg-slate-100 transition-colors`}>
                <span className={`mt-0.5 ${st.icon}`}>{st.iconEl}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold ${st.icon}`}>{a.equip}</span>
                    <span className="text-[10px] text-slate-600 flex items-center gap-1"><Clock className="w-3 h-3"/>{a.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{a.msg}</p>
                </div>
                {!isAcked && (
                  <button onClick={()=>setAcked(s=>new Set([...s,a.id]))}
                    className="shrink-0 text-[10px] border border-slate-300 text-slate-400 hover:text-slate-800 hover:border-slate-500 px-2.5 py-1 rounded transition-colors">
                    Tasdiqlash
                  </button>
                )}
                {isAcked && <span className="shrink-0 text-[10px] text-slate-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>Tasdiqlandi</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Stats tab ───────────────────────────────────── */
function StatsTab() {
  const monthly = ['Yan','Fev','Mar','Apr','May'].map(m=>({
    m, plan:150*22, fact:Math.round(150*22*(0.78+Math.random()*0.18)),
  }));
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Oylik ishlab chiqarish (m³)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{top:4,right:4,bottom:0,left:-10}}>
              <XAxis dataKey="m" tick={{fontSize:9,fill:'#475569'}}/>
              <YAxis tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Legend wrapperStyle={{fontSize:9,color:'#64748b'}}/>
              <Bar dataKey="plan" fill="#cbd5e1" name="Reja" radius={[3,3,0,0]}/>
              <Bar dataKey="fact" fill="#10b981" name="Fakt" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Sifat trendi (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly.map(m=>({...m,qc:+(95+Math.random()*4).toFixed(1)}))} margin={{top:4,right:4,bottom:0,left:-16}}>
              <XAxis dataKey="m" tick={{fontSize:9,fill:'#475569'}}/>
              <YAxis domain={[90,100]} tick={{fontSize:9,fill:'#475569'}}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE}/>
              <Line type="monotone" dataKey="qc" stroke="#10b981" strokeWidth={2} dot={{r:3,fill:'#10b981'}} name="Sifat"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-white border border-slate-200/60 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Yillik ko'rsatkichlar</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              {label:"Jami ishlab chiqarish", value:"38 420 m³", icon:<Package className="w-4 h-4"/>},
              {label:"Sifat ko'rsatkichi",    value:"95.8%",     icon:<CheckCircle2 className="w-4 h-4"/>},
              {label:"Rej. bajarilishi",      value:"91.2%",     icon:<Activity className="w-4 h-4"/>},
              {label:"Energiya samaradorligi",value:"88.4%",     icon:<Zap className="w-4 h-4"/>},
            ].map((s,i)=>(
              <div key={i} className="border border-slate-300/50 rounded-lg px-3 py-3">
                <div className="text-indigo-400 mb-2">{s.icon}</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reports tab ─────────────────────────────────── */
function ReportsTab() {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
      <div className="bg-white border border-slate-200/60 rounded-xl mt-1 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-slate-200/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Mavjud hisobotlar
        </div>
        <div className="divide-y divide-slate-200/40">
          {REPORTS_LIST.map((r,i)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
                <span className="text-[9px] font-bold text-indigo-400">{r.type}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-slate-800 truncate">{r.name}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3"/>{r.date}
                  <span className="text-slate-700">·</span>
                  {r.size}
                </div>
              </div>
              <button className="shrink-0 flex items-center gap-1.5 text-[10px] border border-slate-300 text-slate-400 hover:text-slate-800 hover:border-slate-500 px-3 py-1.5 rounded transition-colors">
                <Download className="w-3 h-3"/>Yuklab olish
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
function genChart() {
  return Array.from({length:24},(_,i)=>{
    const h=8+Math.floor(i/2),m=(i%2)*30;
    return {t:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,v:+(72+(Math.random()-0.45)*10).toFixed(1)};
  });
}

export default function DirectorControlCenter({ user, activeTab }: Props) {
  const [tick, setTick]   = useState(0);
  const [chartData]       = useState(genChart);
  const unread            = ALERTS_DATA.filter(a => !a.ack).length;

  useEffect(() => {
    const iv = setInterval(() => setTick(p => p + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'director-control':    return <ControlCenterTab tick={tick} chartData={chartData}/>;
      case 'director-production':
      case 'director-live':       return <ProductionTab/>;
      case 'director-qc':         return <QCTab/>;
      case 'director-equipment':  return <EquipmentTab/>;
      case 'director-energy':     return <EnergyTab/>;
      case 'director-shift':      return <ShiftTab/>;
      case 'director-alerts':     return <AlertsTab/>;
      case 'director-stats':      return <StatsTab/>;
      case 'director-reports':    return <ReportsTab/>;
      default:                    return <ControlCenterTab tick={tick} chartData={chartData}/>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden">
      <TopBar user={user} activeTab={activeTab} unread={unread}/>

      {/* KPI row (only on control + production tabs) */}
      {(activeTab === 'director-control' || activeTab === 'director-live') && (
        <div className="grid grid-cols-5 gap-2 px-3 py-2 shrink-0">
          {KPI_MAIN.map((k,i)=>(
            <div key={i} className="bg-white border border-slate-200/60 rounded-lg px-3 py-2 flex items-center gap-2.5">
              <div style={{color:k.color}}>{k.icon}</div>
              <div>
                <div className="text-[10px] text-slate-500 leading-tight">{k.label}</div>
                <div className="text-base font-bold tabular-nums leading-tight" style={{color:k.color}}>{k.value}</div>
                <div className="text-[9px] text-slate-600">{k.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {renderTab()}
      </div>

      <StatusBar/>
    </div>
  );
}
