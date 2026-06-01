import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Database, Settings, ShieldAlert, Cpu, Activity, 
  Clock, Gauge, Thermometer, Layers, Play, AlertTriangle, 
  CheckCircle, ArrowRight, TrendingUp, DollarSign, X, HelpCircle
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';

interface SCADADashboardProps {
  user: any;
}

export default function SCADADashboard({ user }: SCADADashboardProps) {
  const { t } = useI18n();
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [historianData, setHistorianData] = useState<any[]>([]);
  const [historianLoading, setHistorianLoading] = useState(false);

  const fetchLiveTelemetry = async () => {
    try {
      const response = await api.get('telemetry/tags/live/');
      setLiveData(response.data);
    } catch (err) {
      console.error("Failed to fetch live telemetry tags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistorian = async (tagKey: string) => {
    setHistorianLoading(true);
    try {
      const response = await api.get('telemetry/history/', {
        params: { tag_key: tagKey, limit: 12 }
      });
      setHistorianData(response.data.results || response.data || []);
    } catch (err) {
      console.error("Failed to fetch telemetry history:", err);
    } finally {
      setHistorianLoading(false);
    }
  };

  const handleMachineClick = (machineKey: string) => {
    setSelectedMachine(machineKey);
    // Fetch appropriate historian tag based on selection
    const tagMap: Record<string, string> = {
      'PV-1': 'pv1_steam_pressure',
      'BF-12': 'bf12_steam_pressure',
      'BUNKERS': 'bunker_humidity_1'
    };
    if (tagMap[machineKey]) {
      fetchHistorian(tagMap[machineKey]);
    }
  };

  // Helper to render pure SVG premium time-series charts
  const renderSVGChart = (data: any[]) => {
    if (data.length < 2) return <p className="text-slate-400 text-xs py-10 text-center">{t('Yetarli ma’lumotlar mavjud emas')}</p>;
    
    // Sort chronological (oldest first)
    const sorted = [...data].reverse();
    const values = sorted.map(d => d.value);
    const maxVal = Math.max(...values, 1.0);
    const minVal = Math.min(...values, 0.0);
    const range = maxVal - minVal || 1.0;

    const width = 450;
    const height = 150;
    const padding = 20;

    const points = sorted.map((d, index) => {
      const x = padding + (index * (width - padding * 2) / (sorted.length - 1));
      const y = height - padding - ((d.value - minVal) * (height - padding * 2) / range);
      return { x, y, val: d.value, time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    });

    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="w-full bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Grids */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#chart-gradient)" opacity="0.15" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx={p.x} cy={p.y} r="8" fill="#6366f1" opacity="0" className="hover:opacity-20 transition-opacity" />
              {/* Tooltip on hover */}
              <title>{`${p.val} - ${p.time}`}</title>
            </g>
          ))}

          {/* Labels */}
          <text x={padding - 5} y={padding + 4} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">{maxVal.toFixed(2)}</text>
          <text x={padding - 5} y={height - padding + 4} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">{minVal.toFixed(2)}</text>

          {/* Definitions */}
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-500 mt-2 px-4 tracking-widest">
          <span>{points[0].time}</span>
          <span>{points[Math.floor(points.length / 2)].time}</span>
          <span>{points[points.length - 1].time}</span>
        </div>
      </div>
    );
  };

  // Helper variables to fetch current sensor readings
  const getTagValue = (key: string, fallback: number = 0) => liveData[key]?.value ?? fallback;
  const getTagUnit = (key: string, fallback: string = '') => liveData[key]?.unit ?? fallback;

  const pv1_press = getTagValue('pv1_steam_pressure');
  const pv1_temp = getTagValue('pv1_chamber_temp');
  const pv1_load = getTagValue('pv1_raw_load');

  const bf12_press = getTagValue('bf12_steam_pressure');
  const bf12_temp = getTagValue('bf12_chamber_temp');
  const bf12_vac = getTagValue('bf12_vacuum_pressure');

  const bh1 = getTagValue('bunker_humidity_1', 35);
  const bh2 = getTagValue('bunker_humidity_2', 40);
  const bh3 = getTagValue('bunker_humidity_3', 38);
  const bh4 = getTagValue('bunker_humidity_4', 32);

  // Status checks based on pressure readings
  const isPV1Active = pv1_press > 0.1;
  const isBF12Active = bf12_press > 0.1;

  // Alarms
  const isPV1Alarm = pv1_press > 0.75;
  const isBF12Alarm = bf12_temp > 123.0;

  return (
    <div className="space-y-6 pb-24">
      {/* 🔴 HEADER & ASU STATUS */}
      <div className="bg-slate-950 text-white p-8 rounded-[40px] border border-slate-900 shadow-2xl relative overflow-hidden">
        {/* Decorative background radar wave */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-4 border-indigo-500/5 animate-pulse" />
        <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border-2 border-indigo-500/10 animate-ping duration-[3000ms]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radio className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight">{t('Operatsion SCADA Xaritasi')}</h2>
                <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                  {t('Live Telemetry')}
                </span>
              </div>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-wider">{t('EPS Zavodi Texnologik Parametrlari va Sensorlar Nazorati')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl text-center">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('PLC Ulanish Holati')}</span>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                <span className="text-xs font-black uppercase text-emerald-400">Modbus TCP</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl text-center">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Zavod OEE ko\'rsatkichi')}</span>
              <span className="text-lg font-black text-white">94.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 SCADA ANIMATED FACTORY FLOW PIPELINE */}
      <div className="bg-slate-950 border border-slate-900 p-8 rounded-[48px] shadow-2xl relative overflow-hidden min-h-[500px]">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-8 relative z-10 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          {t('Texnologik Oqim Sxemasi')}
        </h3>

        {/* The SCADA Map Wrapper */}
        <div className="relative z-10 w-full overflow-x-auto py-10 scrollbar-hide">
          <div className="min-w-[1000px] flex items-center justify-between px-6 relative">
            
            {/* Animated SVG Pipelines background connecting machines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '1000px' }}>
              {/* Pipe 1: Raw to Prefoamer */}
              <path d="M 90 120 L 190 120" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              <path d="M 90 120 L 190 120" stroke="#818cf8" strokeWidth="2" strokeDasharray="6 12" fill="none" className="animate-pipe-particles" />

              {/* Pipe 2: Prefoamer to Bunkers */}
              <path d="M 290 120 L 390 120" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              <path d="M 290 120 L 390 120" stroke={isPV1Active ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray="6 12" fill="none" className={isPV1Active ? "animate-pipe-particles" : ""} />

              {/* Pipe 3: Bunkers to Block molding */}
              <path d="M 520 120 L 620 120" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              <path d="M 520 120 L 620 120" stroke="#10b981" strokeWidth="2" strokeDasharray="6 12" fill="none" className="animate-pipe-particles" />

              {/* Pipe 4: Molding to CNC */}
              <path d="M 720 120 L 820 120" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              <path d="M 720 120 L 820 120" stroke={isBF12Active ? '#eab308' : '#475569'} strokeWidth="2" strokeDasharray="6 12" fill="none" className={isBF12Active ? "animate-pipe-particles" : ""} />
            </svg>

            {/* Stage 1: Raw Granule Silo */}
            <div className="flex flex-col items-center gap-3 relative z-10 w-24">
              <div className="w-20 h-24 bg-slate-900 border-2 border-slate-800 rounded-t-3xl rounded-b-[24px] shadow-2xl flex flex-col justify-end p-2 relative overflow-hidden group hover:border-slate-700 transition-all">
                {/* Granule level fill */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-600 to-slate-500 h-[65%] rounded-b-[20px] transition-all duration-1000" />
                <div className="relative z-10 text-center">
                  <Database className="w-6 h-6 text-indigo-300 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider block">Raw Granules</span>
                  <span className="text-[10px] font-black text-indigo-200">1,240 kg</span>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">1. Xomashyo</span>
            </div>

            {/* Stage 2: PV-1 Prefoamer Machine (Clickable) */}
            <div className="flex flex-col items-center gap-3 relative z-10 w-32">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => handleMachineClick('PV-1')}
                className={`w-28 h-32 bg-slate-900 border-2 rounded-[32px] shadow-2xl p-3 flex flex-col justify-between relative cursor-pointer transition-all ${
                  isPV1Alarm ? 'border-rose-500 shadow-rose-900/10' :
                  isPV1Active ? 'border-emerald-500 shadow-emerald-900/10' : 'border-slate-800'
                }`}
              >
                {/* Status Indicator Dot */}
                <div className="absolute -top-1.5 -right-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                    isPV1Alarm ? 'bg-rose-500 animate-ping' :
                    isPV1Active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                  }`} />
                </div>

                <div className="text-center">
                  <Cpu className={`w-7 h-7 mx-auto mb-1 ${isPV1Active ? 'text-emerald-400 rotate-animation' : 'text-slate-500'}`} />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider block">Prefoamer PV-1</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isPV1Active ? t('KOPIKLASH') : t('KUTILMOQDA')}</span>
                </div>

                <div className="space-y-1 bg-slate-950/80 p-2 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className="text-slate-400">P (bar)</span>
                    <span className={isPV1Alarm ? 'text-rose-500 animate-pulse' : 'text-indigo-300'}>{pv1_press.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className="text-slate-400">T (°C)</span>
                    <span className="text-indigo-300">{pv1_temp.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className="text-slate-400">M (kg)</span>
                    <span className="text-indigo-300">{pv1_load.toFixed(1)}</span>
                  </div>
                </div>
              </motion.div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">2. Ko'piklatish</span>
            </div>

            {/* Stage 3: Aging Bunkers (Silos - Clickable) */}
            <div className="flex flex-col items-center gap-3 relative z-10 w-44">
              <div 
                onClick={() => handleMachineClick('BUNKERS')}
                className="w-40 bg-slate-900 border border-slate-800 rounded-[32px] p-3 shadow-2xl grid grid-cols-4 gap-1.5 cursor-pointer hover:border-slate-700 transition-all"
              >
                {[
                  { id: 1, val: bh1 },
                  { id: 2, val: bh2 },
                  { id: 3, val: bh3 },
                  { id: 4, val: bh4 },
                ].map((sil) => (
                  <div key={sil.id} className="bg-slate-950 border border-white/5 rounded-2xl p-1 text-center flex flex-col justify-between min-h-[70px] relative overflow-hidden group">
                    {/* Humidity level visual fill */}
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500/5 transition-all" style={{ height: `${sil.val}%` }} />
                    <span className="text-[8px] font-black text-slate-500 block mb-1">#0{sil.id}</span>
                    <Layers className="w-3.5 h-3.5 text-blue-400 mx-auto opacity-70 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-blue-300 relative z-10">{Math.round(sil.val)}%</span>
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">3. Silos (Aging Bunkers)</span>
            </div>

            {/* Stage 4: BF-12 Block Molding Machine (Clickable) */}
            <div className="flex flex-col items-center gap-3 relative z-10 w-32">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => handleMachineClick('BF-12')}
                className={`w-28 h-32 bg-slate-900 border-2 rounded-[32px] shadow-2xl p-3 flex flex-col justify-between relative cursor-pointer transition-all ${
                  isBF12Alarm ? 'border-rose-500 shadow-rose-900/10' :
                  isBF12Active ? 'border-emerald-500 shadow-emerald-900/10' : 'border-slate-800'
                }`}
              >
                {/* Status Indicator Dot */}
                <div className="absolute -top-1.5 -right-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                    isBF12Alarm ? 'bg-rose-500 animate-ping' :
                    isBF12Active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                  }`} />
                </div>

                <div className="text-center">
                  <Gauge className={`w-7 h-7 mx-auto mb-1 ${isBF12Active ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider block">Molder BF-12</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isBF12Active ? t('PRESSLASH') : t('KUTILMOQDA')}</span>
                </div>

                <div className="space-y-1 bg-slate-950/80 p-2 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className="text-slate-400">P (bar)</span>
                    <span className="text-indigo-300">{bf12_press.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className="text-slate-400">T (°C)</span>
                    <span className={isBF12Alarm ? 'text-rose-500 animate-pulse' : 'text-indigo-300'}>{bf12_temp.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className="text-slate-400">Vac (bar)</span>
                    <span className="text-indigo-300">{bf12_vac.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">4. Blok Formovka</span>
            </div>

            {/* Stage 5: Finished Block Passport */}
            <div className="flex flex-col items-center gap-3 relative z-10 w-24">
              <div className="w-20 h-24 bg-slate-900 border border-slate-800 rounded-[24px] shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider block">Digital Twin</span>
                  <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">A-Class (Premium)</span>
                </div>
                <div className="bg-slate-950 p-1 text-[7px] font-bold text-center border border-white/5 rounded-lg text-slate-400">
                  Lot #421
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">5. Raqamli Pasport</span>
            </div>

          </div>
        </div>
      </div>

      {/* 📊 SENSOR TELEMETRY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Prefoamer Telemetry */}
        <div className="bg-slate-950 border border-slate-900 p-6 rounded-[36px] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t("PV-1 Datchiklari")}</h4>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Ko'piklatish Parametrlari")}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Bug' bosimi")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{pv1_press.toFixed(3)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{getTagUnit('pv1_steam_pressure')}</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Kamera harorati")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{pv1_temp.toFixed(1)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{getTagUnit('pv1_chamber_temp')}</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Xomashyo yuklanishi")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{pv1_load.toFixed(1)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{getTagUnit('pv1_raw_load')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Molding Telemetry */}
        <div className="bg-slate-950 border border-slate-900 p-6 rounded-[36px] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t("BF-12 Datchiklari")}</h4>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Formovka Parametrlari")}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Bug' bosimi")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{bf12_press.toFixed(3)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{getTagUnit('bf12_steam_pressure')}</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Kamera harorati")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{bf12_temp.toFixed(1)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{getTagUnit('bf12_chamber_temp')}</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Vakuum bosimi")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{bf12_vac.toFixed(3)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{getTagUnit('bf12_vacuum_pressure')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost & Yield Intelligence */}
        <div className="bg-slate-950 border border-slate-900 p-6 rounded-[36px] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t("Zavod Iqtisodiyoti")}</h4>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Energiya va Sebestoimlik")}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Gaz sarfi (Taxminiy)")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">412.5</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">m³</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Elektr energiyasi")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">1,820</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">kWh</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Blok o'rtacha tannarxi")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-400">224,500</span>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">UZS</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 🟢 MACHINE DETAIL DRAWER (DIGITAL TWIN WINDOW) */}
      <AnimatePresence>
        {selectedMachine && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-slate-950 border-l border-slate-900 h-screen flex flex-col justify-between p-6 shadow-2xl relative"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-5 mb-8">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
                    <div>
                      <h3 className="text-lg font-black text-white">{selectedMachine === 'PV-1' ? "Predvspenivatel PV-1" : selectedMachine === 'BF-12' ? "Blok-forma BF-12" : "Silos Aging Bunkers"}</h3>
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t('Telemetriya va Ish tarixi')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedMachine(null)}
                    className="p-2 hover:bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("Sensor Tarixi (Historian Log)")}</h4>
                    {historianLoading ? (
                      <div className="h-[150px] bg-slate-900/40 rounded-3xl border border-slate-900 animate-pulse flex items-center justify-center">
                        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                      </div>
                    ) : (
                      renderSVGChart(historianData)
                    )}
                  </div>

                  <div className="bg-slate-900 p-5 rounded-[28px] border border-slate-800/80">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("Faoliyat holati")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t("Uskuna statusi")}</span>
                        <span className="text-xs font-black uppercase text-emerald-400">{t("ISHCHI HOLATDA")}</span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t("OEE samaradorligi")}</span>
                        <span className="text-xs font-black text-white">96.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMachine(null)}
                className="w-full py-4.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {t("Oynani yopish")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
