import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, Bell, CheckCircle2, Info, Zap, Thermometer,
  Activity, ChevronRight,
} from 'lucide-react';
import { User } from '../types';

interface Props { user: User; activeTab: string; }
type Status = 'active' | 'warning' | 'error' | 'offline';
type AlertSev = 'critical' | 'warning' | 'info';

const SC: Record<Status, string> = {
  active: '#10b981', warning: '#f59e0b', error: '#ef4444', offline: '#475569',
};
const SL: Record<Status, string> = {
  active: 'Ishlamoqda', warning: 'Ogohlantirish', error: "Xato", offline: 'Oflayn',
};

/* ── live clock ─────────────────────────────────────── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="tabular-nums font-mono text-slate-200 text-sm tracking-widest">
      {t.toLocaleTimeString('uz-UZ', { hour12: false })}
    </span>
  );
}

/* ── pulsing dot ─────────────────────────────────────── */
function PulseDot({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5';
  return (
    <span className={`relative inline-flex ${sz}`}>
      {status === 'active' && (
        <span className="animate-ping absolute h-full w-full rounded-full opacity-50"
          style={{ backgroundColor: SC[status] }}/>
      )}
      <span className="relative inline-flex rounded-full h-full w-full" style={{ backgroundColor: SC[status] }}/>
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   SVG EQUIPMENT SHAPES (P&ID style)
══════════════════════════════════════════════════════ */
function SiloSVG({ cx, cy, c, level }: { cx: number; cy: number; c: string; level: number }) {
  const bh = 66, bw = 48;
  const fillH = Math.max(2, (bh - 4) * (level / 100));
  return (
    <g>
      {/* body */}
      <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx="3"
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {/* level fill */}
      <rect x={cx - bw / 2 + 2} y={cy + bh / 2 - 2 - fillH}
        width={bw - 4} height={fillH} fill={c} opacity="0.22"/>
      {/* level line */}
      <line x1={cx - bw / 2 + 3} x2={cx + bw / 2 - 3}
        y1={cy + bh / 2 - 2 - fillH} y2={cy + bh / 2 - 2 - fillH}
        stroke={c} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7"/>
      {/* hopper */}
      <path d={`M ${cx - bw / 2} ${cy + bh / 2} L ${cx - 8} ${cy + bh / 2 + 20} L ${cx + 8} ${cy + bh / 2 + 20} L ${cx + bw / 2} ${cy + bh / 2}Z`}
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {/* outlet */}
      <line x1={cx} x2={cx} y1={cy + bh / 2 + 20} y2={cy + bh / 2 + 28}
        stroke={c} strokeWidth="2.5"/>
    </g>
  );
}

function ExpanderSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="28" ry="44" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <ellipse cx={cx} cy={cy - 44} rx="28" ry="8" fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <line x1={cx} y1={cy - 46} x2={cx} y2={cy + 38} stroke={c} strokeWidth="0.9" opacity="0.4"/>
      {[-15, 0, 15].map(dy => (
        <line key={dy} x1={cx - 18} y1={cy + dy} x2={cx + 18} y2={cy + dy}
          stroke={c} strokeWidth="1.5" opacity="0.6"/>
      ))}
      {/* steam outlet */}
      <line x1={cx} y1={cy - 52} x2={cx} y2={cy - 64} stroke="#475569" strokeWidth="2"/>
      <path d={`M ${cx - 5} ${cy - 62} Q ${cx} ${cy - 72} ${cx + 5} ${cy - 62}`}
        fill="none" stroke="#475569" strokeWidth="1" opacity="0.5"/>
    </g>
  );
}

function ChamberSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx - 38} y={cy - 44} width={76} height={88} rx="4"
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {[0, 1, 2, 3].map(row =>
        [0, 1, 2].map(col => (
          <rect key={`${row}-${col}`} x={cx - 30 + col * 21} y={cy - 36 + row * 21}
            width="17" height="17" rx="2"
            fill={c} opacity="0.09" stroke={c} strokeWidth="0.5" strokeOpacity="0.3"/>
        ))
      )}
      {/* temp probe */}
      <line x1={cx + 38} y1={cy - 16} x2={cx + 46} y2={cy - 16} stroke="#475569" strokeWidth="1.5"/>
      <circle cx={cx + 49} cy={cy - 16} r="4" fill="#060e1e" stroke="#475569" strokeWidth="1.2"/>
    </g>
  );
}

function PressSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx - 32} y={cy - 50} width={64} height={100} rx="3"
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {/* top platen */}
      <rect x={cx - 26} y={cy - 42} width={52} height={9} rx="2" fill={c} opacity="0.4"/>
      {/* ram */}
      <rect x={cx - 7} y={cy - 33} width={14} height={40} rx="2" fill={c} opacity="0.18"/>
      <polygon points={`${cx - 6},${cy + 5} ${cx + 6},${cy + 5} ${cx},${cy + 16}`}
        fill={c} opacity="0.55"/>
      {/* bottom platen */}
      <rect x={cx - 26} y={cy + 17} width={52} height={9} rx="2" fill={c} opacity="0.4"/>
    </g>
  );
}

function CutterSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx - 32} y={cy - 42} width={64} height={84} rx="3"
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {/* blade */}
      <rect x={cx - 26} y={cy - 35} width={52} height={7} rx="1" fill={c} opacity="0.55"/>
      {/* cut lines */}
      {[-16, -2, 12, 26].map(dy => (
        <line key={dy} x1={cx - 24} y1={cy + dy} x2={cx + 24} y2={cy + dy}
          stroke={c} strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/>
      ))}
    </g>
  );
}

function PackerSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx - 30} y={cy - 42} width={60} height={84} rx="3"
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <rect x={cx - 18} y={cy - 18} width={36} height={30} rx="2"
        fill={c} opacity="0.16" stroke={c} strokeWidth="0.9"/>
      <line x1={cx - 18} y1={cy - 4} x2={cx + 18} y2={cy - 4} stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 12} stroke={c} strokeWidth="0.8" opacity="0.5"/>
      {/* strapping */}
      <rect x={cx - 18} y={cy + 14} width={36} height={4} rx="1" fill={c} opacity="0.4"/>
    </g>
  );
}

function WarehouseSVG({ cx, cy, c }: { cx: number; cy: number; c: string }) {
  return (
    <g>
      <rect x={cx - 42} y={cy - 24} width={84} height={58} rx="3"
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      <path d={`M ${cx - 48} ${cy - 24} L ${cx} ${cy - 54} L ${cx + 48} ${cy - 24}Z`}
        fill="#060e1e" stroke={c} strokeWidth="1.5"/>
      {/* door */}
      <rect x={cx - 12} y={cy + 4} width={24} height={30} rx="2"
        fill={c} opacity="0.15" stroke={c} strokeWidth="0.9"/>
      {/* stacked product */}
      {[-24, 14].map(dx => (
        <g key={dx}>
          <rect x={cx + dx - 9} y={cy - 14} width={18} height={11} rx="1"
            fill={c} opacity="0.2" stroke={c} strokeWidth="0.5"/>
          <rect x={cx + dx - 9} y={cy - 1} width={18} height={4} rx="1"
            fill={c} opacity="0.18"/>
        </g>
      ))}
    </g>
  );
}

/* ── animated pipe ──────────────────────────────────── */
function AnimPipe({ x1, x2, y, active, label }: {
  x1: number; x2: number; y: number; active: boolean; label?: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#040b18" strokeWidth="8"/>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={active ? '#052516' : '#111e30'} strokeWidth="5"/>
      {active && (
        <line x1={x1} y1={y} x2={x2} y2={y}
          stroke="#10b981" strokeWidth="2" strokeDasharray="8 5"
          style={{ animation: 'pipflow 1.4s linear infinite' }} opacity="0.85"/>
      )}
      <polygon
        points={`${x2 - 7},${y - 4} ${x2},${y} ${x2 - 7},${y + 4}`}
        fill={active ? '#10b981' : '#334155'} opacity="0.85"/>
      {label && (
        <text x={(x1 + x2) / 2} y={y - 9} textAnchor="middle"
          fill="#f59e0b" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
          {label}
        </text>
      )}
    </g>
  );
}

/* ── SVG sensor badge ───────────────────────────────── */
function SBadge({ cx, cy, val, unit, color }: {
  cx: number; cy: number; val: string; unit: string; color: string;
}) {
  return (
    <g>
      <rect x={cx - 22} y={cy - 9} width={44} height={18} rx="3"
        fill="#04091a" stroke={color} strokeWidth="0.8" opacity="0.95"/>
      <text x={cx} y={cy + 4.5} textAnchor="middle"
        fill={color} fontSize="9.5" fontFamily="monospace" fontWeight="bold">
        {val}{unit}
      </text>
    </g>
  );
}

function EqLabel({ cx, y, name, status }: { cx: number; y: number; name: string; status: Status }) {
  return (
    <g>
      <rect x={cx - 34} y={y} width={68} height={15} rx="2.5"
        fill="#07101c" stroke={SC[status]} strokeWidth="0.7" opacity="0.9"/>
      <text x={cx} y={y + 10.5} textAnchor="middle"
        fill={SC[status]} fontSize="8.5" fontFamily="monospace" fontWeight="600">
        {name}
      </text>
    </g>
  );
}

/* ══════════════════════════════════════════════════════
   FACTORY P&ID DIAGRAM
══════════════════════════════════════════════════════ */
type StageInfo = {
  label: string; status: Status;
  level?: number; temp?: number; pressure?: number;
};

const BASE_STAGES: StageInfo[] = [
  { label: 'SILO-1',    status: 'active',  level: 78 },
  { label: "KO'PIRT.",  status: 'active',  temp: 82,  pressure: 4.2 },
  { label: 'QATTIQLASHTIR', status: 'warning', temp: 18 },
  { label: 'BLOK PRESS',status: 'active',  pressure: 12.5 },
  { label: 'KESISH',    status: 'active' },
  { label: 'QADOQLASH', status: 'active' },
  { label: 'OMBOR',     status: 'active',  level: 62 },
];

const SX = [65, 170, 282, 392, 494, 594, 700];
const PY = 150; // pipe Y (mid + offset)

function FactoryPID({ tick }: { tick: number }) {
  const pipes: Array<[number, number, string | undefined]> = [
    [SX[0] + 24, SX[1] - 28, undefined],
    [SX[1] + 28, SX[2] - 38, `${(4.2 + Math.sin(tick * 0.3) * 0.05).toFixed(1)} bar`],
    [SX[2] + 38, SX[3] - 32, undefined],
    [SX[3] + 32, SX[4] - 32, undefined],
    [SX[4] + 32, SX[5] - 30, undefined],
    [SX[5] + 30, SX[6] - 42, undefined],
  ];

  return (
    <svg viewBox="0 0 780 278" className="w-full h-full" style={{ fontFamily: 'monospace' }}>
      <defs>
        <style>{`
          @keyframes pipflow { from { stroke-dashoffset: 26 } to { stroke-dashoffset: 0 } }
          @keyframes wblink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        `}</style>
      </defs>

      {/* background grid */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line key={`vg${i}`} x1={i * 44} y1={0} x2={i * 44} y2={278} stroke="#0b1828" strokeWidth="0.4"/>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`hg${i}`} x1={0} y1={i * 44} x2={780} y2={i * 44} stroke="#0b1828" strokeWidth="0.4"/>
      ))}

      {/* pipes */}
      {pipes.map(([x1, x2, lbl], i) => (
        <AnimPipe key={i} x1={x1} x2={x2} y={PY + 28}
          active={BASE_STAGES[i].status !== 'offline'} label={lbl}/>
      ))}

      {/* equipment + sensors */}
      {BASE_STAGES.map((s, i) => {
        const cx = SX[i], cy = PY;
        const c = SC[s.status];
        const tv = s.temp != null
          ? String(Math.round(s.temp + Math.sin(tick * 0.5 + i) * 1.2))
          : null;
        const pv = s.pressure != null
          ? (s.pressure + Math.sin(tick * 0.38 + i) * 0.04).toFixed(1)
          : null;
        return (
          <g key={i}>
            {i === 0 && <SiloSVG cx={cx} cy={cy} c={c} level={s.level!}/>}
            {i === 1 && <ExpanderSVG cx={cx} cy={cy} c={c}/>}
            {i === 2 && <ChamberSVG cx={cx} cy={cy} c={c}/>}
            {i === 3 && <PressSVG cx={cx} cy={cy} c={c}/>}
            {i === 4 && <CutterSVG cx={cx} cy={cy} c={c}/>}
            {i === 5 && <PackerSVG cx={cx} cy={cy} c={c}/>}
            {i === 6 && <WarehouseSVG cx={cx} cy={cy} c={c}/>}

            {tv && <SBadge cx={cx + (i === 1 ? 42 : 46)} cy={cy - 26} val={tv} unit="°C" color="#f59e0b"/>}
            {pv && <SBadge cx={cx + (i === 1 ? 42 : 46)} cy={cy - 6} val={pv} unit=" b" color="#3b82f6"/>}
            {s.level != null && (
              <SBadge cx={cx} cy={i === 0 ? cy - 48 : cy - 38} val={String(s.level)} unit="%" color={c}/>
            )}
            {s.status === 'warning' && (
              <circle cx={cx + (i === 2 ? 38 : 32)} cy={cy - 48} r="5"
                fill="#f59e0b" style={{ animation: 'wblink 0.85s ease infinite' }}/>
            )}

            <EqLabel cx={cx} y={PY + 84} name={s.label} status={s.status}/>
          </g>
        );
      })}

      {/* header */}
      <text x="8" y="16" fill="#334155" fontSize="9" fontWeight="700" letterSpacing="1">
        TEXNOLOGIK JARAYON
      </text>
      <circle cx={148} cy={12} r="3.5" fill="#10b981" style={{ animation: 'wblink 1.8s ease infinite' }}/>
      <text x={155} y={16} fill="#10b981" fontSize="9" fontWeight="700">JONLI</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════ */
const ALERTS = [
  { id: 'a1', sev: 'critical' as AlertSev, time: '10:21:15', equip: 'P-101 Kompressor',     msg: "Bosim ruxsat chegarasidan 0.3 bar past" },
  { id: 'a2', sev: 'warning'  as AlertSev, time: '10:18:42', equip: 'E-101 Isitgich',        msg: "Harorat o'rnatilgandan 5°C yuqori" },
  { id: 'a3', sev: 'warning'  as AlertSev, time: '10:16:07', equip: 'SILO-1',                msg: "EPS granulasi zaxirasi: 2 kunlik qoldi" },
  { id: 'a4', sev: 'info'     as AlertSev, time: '10:10:33', equip: 'Kesish liniyasi',       msg: "2-liya reja yangilandi" },
  { id: 'a5', sev: 'warning'  as AlertSev, time: '10:05:11', equip: 'QC stantsiyasi',        msg: "3-blok zichlik me'yoridan past" },
];

const SEV_STYLE: Record<AlertSev, { left: string; icon: string; bg: string; dot: string; iconEl: React.ReactNode }> = {
  critical: { left: 'border-l-red-500',   icon: 'text-red-400',   bg: 'bg-red-950/20',   dot: 'bg-red-500',
    iconEl: <AlertTriangle className="w-3.5 h-3.5"/> },
  warning:  { left: 'border-l-amber-500', icon: 'text-amber-400', bg: 'bg-amber-950/20', dot: 'bg-amber-500',
    iconEl: <AlertTriangle className="w-3.5 h-3.5"/> },
  info:     { left: 'border-l-blue-500',  icon: 'text-blue-400',  bg: 'bg-blue-950/20',  dot: 'bg-blue-500',
    iconEl: <Info className="w-3.5 h-3.5"/> },
};

const EQUIP_LIST = [
  { id: 'p101', name: "P-101 Ko'pirtirgich", status: 'active'  as Status, eff: 85,  val: '4.2 bar' },
  { id: 'e101', name: 'E-101 Isitish tizimi', status: 'active'  as Status, eff: 92,  val: '68°C' },
  { id: 't101', name: 'T-101 Qattiqlash kam.', status: 'warning' as Status, eff: 74,  val: '18°C' },
  { id: 'c101', name: 'C-101 Kesish liniyasi', status: 'active'  as Status, eff: 78,  val: '–' },
  { id: 'p202', name: 'P-202 Gaz kompressori', status: 'warning' as Status, eff: 65,  val: '3.1 bar' },
  { id: 'v101', name: 'V-101 Vakuum tizimi',   status: 'error'   as Status, eff: 0,   val: '0 bar' },
];

const KPI = [
  { label: "Ishlab chiqarish rejasi", value: '85%',           sub: '128 / 150 m³',   color: '#10b981' },
  { label: "Aktiv uskunalar",         value: '24 / 28',       sub: '4 ta oflayn',     color: '#3b82f6' },
  { label: "Sifat ko'rsatkichi",      value: '96.4%',         sub: '68% A-sinf',      color: '#10b981' },
  { label: "Ogohlantirishlar",        value: '5',             sub: '1 ta kritik',     color: '#f59e0b' },
  { label: "Energiya sarfi",          value: '142 kWh',       sub: "-8% o'tgan smena",color: '#6366f1' },
];

function genChart() {
  return Array.from({ length: 24 }, (_, i) => {
    const h = 8 + Math.floor(i / 2);
    const m = (i % 2) * 30;
    return {
      t: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      temp: +(72 + (Math.random() - 0.5) * 8).toFixed(1),
      bar: +(4.2 + (Math.random() - 0.5) * 0.4).toFixed(2),
      out: +(5.2 + (Math.random() - 0.5) * 1.4).toFixed(1),
    };
  });
}

/* ══════════════════════════════════════════════════════
   OTHER TABS PLACEHOLDER
══════════════════════════════════════════════════════ */
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
      {title} — tez orada
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function DirectorControlCenter({ user, activeTab }: Props) {
  const [tick, setTick]         = useState(0);
  const [chartData]             = useState(genChart);
  const [unread]                = useState(ALERTS.filter(a => a.sev !== 'info').length);

  useEffect(() => {
    const iv = setInterval(() => setTick(p => p + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  if (activeTab !== 'director-control') {
    const labels: Record<string, string> = {
      'director-production': 'Ishlab Chiqarish Monitoring',
      'director-live':       'Jonli Jarayon',
      'director-qc':         'QC Monitoring',
      'director-equipment':  'Uskunalar Holati',
      'director-energy':     'Energiya Monitoring',
      'director-shift':      'Smena Monitoring',
      'director-alerts':     'Ogohlantirishlar',
      'director-stats':      'Statistika',
      'director-reports':    'Hisobotlar',
    };
    return (
      <div className="flex flex-col h-full bg-[#060d1b] text-slate-400">
        <PlaceholderTab title={labels[activeTab] ?? activeTab}/>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#060d1b] text-slate-200 overflow-hidden">

      {/* ── TOP BAR ────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-slate-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-50"/>
            <span className="relative rounded-full h-2.5 w-2.5 bg-emerald-400"/>
          </span>
          <span className="text-sm font-semibold text-slate-100 tracking-wide">Direktor paneli</span>
        </div>
        <div className="flex-1"/>
        <LiveClock/>
        <div className="relative">
          <Bell className="w-4 h-4 text-slate-400"/>
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <span className="text-xs text-slate-400">{user.username}</span>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-2 px-3 py-2 shrink-0">
        {KPI.map((k, i) => (
          <div key={i} className="bg-[#0d1424] border border-slate-800/60 rounded-lg px-3 py-2.5 flex flex-col gap-0.5">
            <div className="text-[10px] text-slate-500 font-medium truncate">{k.label}</div>
            <div className="text-lg font-bold tabular-nums leading-tight" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN AREA ──────────────────────────────────── */}
      <div className="flex flex-1 gap-2 px-3 pb-2 min-h-0">

        {/* LEFT: factory PID + charts */}
        <div className="flex flex-col flex-1 gap-2 min-w-0">

          {/* FACTORY P&ID */}
          <div className="bg-[#0d1424] border border-slate-800/60 rounded-xl flex-1 min-h-0 overflow-hidden p-2">
            <FactoryPID tick={tick}/>
          </div>

          {/* REALTIME CHART */}
          <div className="bg-[#0d1424] border border-slate-800/60 rounded-xl shrink-0 p-3" style={{ height: 160 }}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Real-vaqt sensorlar</span>
              <div className="flex items-center gap-3 ml-auto">
                {[['#f59e0b','Harorat °C'],['#3b82f6','Bosim bar'],['#10b981','Mahsulot m³/h']].map(([c,l])=>(
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-5 h-0.5 rounded" style={{ backgroundColor: c }}/>
                    <span className="text-[9px] text-slate-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 0, left: -28 }}>
                <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#475569' }} interval={3}/>
                <YAxis tick={{ fontSize: 8, fill: '#475569' }}/>
                <Tooltip
                  contentStyle={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: 6, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#cbd5e1' }}/>
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={1.5} dot={false}/>
                <Line type="monotone" dataKey="bar"  stroke="#3b82f6" strokeWidth={1.5} dot={false}/>
                <Line type="monotone" dataKey="out"  stroke="#10b981" strokeWidth={1.5} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: alerts + equipment */}
        <div className="flex flex-col gap-2 w-72 shrink-0">

          {/* ALERTS */}
          <div className="bg-[#0d1424] border border-slate-800/60 rounded-xl flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/50 shrink-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Joriy ogohlantirishlar</span>
              <span className="text-[9px] text-slate-500">Hammasi <ChevronRight className="inline w-3 h-3"/></span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {ALERTS.map(a => {
                const st = SEV_STYLE[a.sev];
                return (
                  <div key={a.id}
                    className={`border-l-2 ${st.left} ${st.bg} px-3 py-2 border-b border-slate-800/40`}>
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

          {/* EQUIPMENT STATUS */}
          <div className="bg-[#0d1424] border border-slate-800/60 rounded-xl shrink-0">
            <div className="px-3 py-2.5 border-b border-slate-800/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Uskunalar holati</span>
            </div>
            <div className="divide-y divide-slate-800/40">
              {EQUIP_LIST.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 px-3 py-2">
                  <PulseDot status={eq.status}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-slate-300 truncate">{eq.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${eq.eff}%`, backgroundColor: SC[eq.status] }}/>
                      </div>
                      <span className="text-[9px] tabular-nums" style={{ color: SC[eq.status] }}>{eq.eff}%</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 shrink-0">{eq.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ─────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-slate-800/60 text-[10px] text-slate-600 shrink-0 bg-[#07101c]">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
          Server: Ulangan
        </span>
        <span>Smena: Kunduzgi (08:00–20:00)</span>
        <span className="ml-auto">Tizim v1.2.0</span>
      </div>

    </div>
  );
}
