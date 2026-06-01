import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Play, Power, AlertTriangle, ShieldCheck, Thermometer, 
  Gauge, Clock, Cpu, Award, CheckCircle, ArrowRight, DollarSign, 
  X, RefreshCcw, Send, Settings, BookOpen, Layers
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface OperatorWorkspaceProps {
  user: any;
}

type OTab = 'SCADA' | 'CONTROLS' | 'ALARMS' | 'REPORT';

export default function OperatorWorkspace({ user }: OperatorWorkspaceProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<OTab>('CONTROLS');
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // Machine Cycle Controller States
  const [isMachineRunning, setIsMachineRunning] = useState(false);
  const [cycleTime, setCycleTime] = useState(0);
  const [activeBatchNum, setActiveBatchNum] = useState('LOT-2026-05A');
  const [targetDensity, setTargetDensity] = useState('15.0');
  const [producedBlocksCount, setProducedBlocksCount] = useState(12);

  // Alarm acknowledgment log
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<number[]>([]);

  // Shift Report state
  const [shiftReport, setShiftReport] = useState({
    produced_qty: '',
    scrap_qty: '',
    steam_consumed: '14.5',
    notes: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  // Detailed machine chart modal
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [historianData, setHistorianData] = useState<any[]>([]);
  const [historianLoading, setHistorianLoading] = useState(false);

  // Fetch live telemetry tags
  const fetchLiveTelemetry = async () => {
    try {
      const response = await api.get('telemetry/tags/live/');
      setLiveData(response.data);
    } catch (err) {
      console.error("Telemetry fetch failure in OperatorWorkspace:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorian = async (tagKey: string) => {
    setHistorianLoading(true);
    try {
      const response = await api.get('telemetry/history/', {
        params: { tag_key: tagKey, limit: 10 }
      });
      setHistorianData(response.data.results || response.data || []);
    } catch (err) {
      console.error("Historian failure:", err);
    } finally {
      setHistorianLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Stopwatch for active machine expanding/molding cycle
  useEffect(() => {
    let timer: any;
    if (isMachineRunning) {
      timer = setInterval(() => {
        setCycleTime((prev) => {
          if (prev >= 45) {
            // Cycle auto-completes at 45s
            setIsMachineRunning(false);
            setProducedBlocksCount(p => p + 1);
            uiStore.showNotification(t("Blok formovka tsikli muvaffaqiyatli yakunlandi. Lot ro'yxatga olindi"), 'success');
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setCycleTime(0);
    }
    return () => clearInterval(timer);
  }, [isMachineRunning]);

  const handleStartMachine = () => {
    setIsMachineRunning(true);
    setCycleTime(0);
    uiStore.showNotification(t("Mashina ishga tushirildi. Tsikl boshlandi..."), 'info');
  };

  const handleStopMachine = () => {
    setIsMachineRunning(false);
    setCycleTime(0);
    uiStore.showNotification(t("Mashina to'xtatildi"), 'error');
  };

  // Submit Shift Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftReport.produced_qty || !shiftReport.scrap_qty) {
      uiStore.showNotification(t("Barcha maydonlarni to'ldiring"), 'error');
      return;
    }
    setSubmittingReport(true);
    try {
      // Mock submit report log
      await new Promise(r => setTimeout(r, 1200));
      uiStore.showNotification(t("Smena hisoboti yakuniy qayd etildi va navbatchi muhandisga yuborildi"), 'success');
      setShiftReport({ produced_qty: '', scrap_qty: '', steam_consumed: '14.5', notes: '' });
      setActiveTab('CONTROLS');
    } catch (err) {
      uiStore.showNotification(t("Hisobot jo'natishda xatolik yuz berdi"), 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  // SVG Chart rendering inside Digital Twin drawers
  const renderSVGChart = (data: any[]) => {
    if (data.length < 2) return <p className="text-slate-400 text-xs py-10 text-center">{t('Historian data empty')}</p>;
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
      return { x, y, val: d.value };
    });

    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="w-full bg-slate-950 p-4 rounded-3xl border border-slate-900">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="op-chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />
          <path d={areaD} fill="url(#op-chart-gradient)" />
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          {points.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#6366f1" />
          ))}
        </svg>
      </div>
    );
  };

  const handleMachineClick = (machineKey: string) => {
    setSelectedMachine(machineKey);
    const tagMap: Record<string, string> = {
      'PV-1': 'pv1_steam_pressure',
      'BF-12': 'bf12_steam_pressure',
      'BUNKERS': 'bunker_humidity_1'
    };
    if (tagMap[machineKey]) {
      fetchHistorian(tagMap[machineKey]);
    }
  };

  // Helper values to extract live tags
  const getTagValue = (key: string, fallback: number = 0) => liveData[key]?.value ?? fallback;
  const getTagUnit = (key: string, fallback: string = '') => liveData[key]?.unit ?? fallback;

  const pv1_press = getTagValue('pv1_steam_pressure');
  const pv1_temp = getTagValue('pv1_chamber_temp');
  const pv1_load = getTagValue('pv1_raw_load');

  const bf12_press = getTagValue('bf12_steam_pressure');
  const bf12_temp = getTagValue('bf12_chamber_temp');
  const bf12_vac = getTagValue('bf12_vacuum_pressure');

  const bh1 = getTagValue('bunker_humidity_1', 35);
  const bh2 = getTagValue('bunker_humidity_2', 38);
  const bh3 = getTagValue('bunker_humidity_3', 32);

  const isPV1Alarm = pv1_press > 0.75;
  const isBF12Alarm = bf12_temp > 123.0;

  // Active alarms list count
  const alarmItems = [
    { id: 101, title: 'Steam Pressure high in Expander (PV-1)', desc: `Val: ${pv1_press.toFixed(2)} bar. Nominal max: 0.75 bar`, trigger: isPV1Alarm },
    { id: 102, title: 'Molding Chamber overheating (BF-12)', desc: `Val: ${bf12_temp.toFixed(1)}°C. Nominal max: 123°C`, trigger: isBF12Alarm }
  ].filter(a => a.trigger && !acknowledgedAlarms.includes(a.id));

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] pb-12">
      
      {/* 🚀 LEFT BAR: OPERATIONAL MENU */}
      <div className="w-full lg:w-72 bg-slate-950 border border-slate-900 rounded-[32px] p-6 flex flex-col justify-between shrink-0 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
              ASU-MES Panel
            </h2>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5">{t("Texnologik Uskunalar Terminali")}</p>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'CONTROLS', label: 'Boshqaruv Paneli', icon: Power, color: 'text-indigo-400 bg-indigo-500/10' },
              { id: 'SCADA', label: 'SCADA Oqim Sxemasi', icon: Cpu, color: 'text-emerald-400 bg-emerald-500/10' },
              { id: 'REPORT', label: 'Smena hisoboti', icon: Send, color: 'text-sky-400 bg-sky-500/10' },
              { id: 'ALARMS', label: 'Avariya Alarmlari', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10', count: alarmItems.length },
            ].map((menu) => {
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id as OTab)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <menu.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : menu.color.split(' ')[0]}`} />
                    <span>{t(menu.label)}</span>
                  </div>
                  {menu.count !== undefined && menu.count > 0 && (
                    <span className="w-5 h-5 bg-rose-500 text-white rounded-lg text-[9px] font-black flex items-center justify-center border-2 border-slate-950">
                      {menu.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live System Diagnostics */}
        <div className="mt-8 pt-6 border-t border-slate-900 space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">{t("Tizim Ulanishi")}</span>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Modbus TCP:</span>
              <span className="text-emerald-400 font-extrabold">{t("ONLINE")}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>{t("Bugungi OEE")}:</span>
              <span className="text-white font-extrabold">94.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 RIGHT CONTENT: MAIN SCREEN DISPLAY */}
      <div className="flex-1 bg-slate-950 border border-slate-900 rounded-[32px] p-8 shadow-2xl min-h-[500px] text-white relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex h-full items-center justify-center py-24">
              <div className="flex items-center gap-3 bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <span className="text-sm font-semibold text-slate-400">{t('Uskunaga ulanilmoqda...')}</span>
              </div>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 relative z-10"
            >
              
              {/* ============ 1. CONTROLS (USKUNALAR BOSHQARUVI - HEAVY OPERATOR PANEL) ============ */}
              {activeTab === 'CONTROLS' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{t("Uskuna Boshqaruv Terminali")}</h3>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t("Predvspenivatel va Blok-Formovka faol datchiklari")}</p>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl text-center">
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t("Tayyorlangan Bloklar")}</span>
                        <span className="text-lg font-black text-emerald-400">{producedBlocksCount} {t("dona")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Red Alert Banner for Spikes */}
                  {alarmItems.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-[24px] flex items-center justify-between gap-4 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{t("Kritik Avariya aniqlandi")}</p>
                          <p className="text-sm font-bold text-rose-200/90">{t("Kameradagi bosim yoki harorat me'yordan oshgan!")}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('ALARMS')}
                        className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-rose-600 transition-all"
                      >
                        {t("Avariyani bartaraf etish")}
                      </button>
                    </motion.div>
                  )}

                  {/* Massive physical start stop and stopwatch */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Machine Controller Widget */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 flex flex-col justify-between min-h-[280px]">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t("Tsikl Boshqaruvchi")}</span>
                        <h4 className="text-base font-black uppercase tracking-wider">{t("Molder BF-12")}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-2">
                          {t("Zames partiyasi")}: <span className="font-extrabold text-white">{activeBatchNum}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                          {t("Zichlik rejasi")}: <span className="font-extrabold text-white">{targetDensity} kg/m³</span>
                        </p>
                      </div>

                      {/* Control buttons */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                          onClick={handleStartMachine}
                          disabled={isMachineRunning}
                          className="py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-500/40 shadow-lg shadow-emerald-950/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          {t("START")}
                        </button>
                        <button
                          onClick={handleStopMachine}
                          disabled={!isMachineRunning}
                          className="py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-rose-500/40 shadow-lg shadow-rose-950/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                          <Power className="w-4 h-4" />
                          {t("STOP")}
                        </button>
                      </div>
                    </div>

                    {/* Active Cycle Stopwatch */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 flex flex-col justify-between min-h-[280px] text-center">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t("Tsikl Taymeri")}</span>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider">{t("Faol qoliplash vaqti")}</h4>
                      </div>

                      <div className="my-4">
                        <div className="text-5xl font-black tracking-tight text-white font-mono leading-none">
                          00:{cycleTime < 10 ? `0${cycleTime}` : cycleTime}
                        </div>
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mt-2">{t("Me'yoriy vaqt: 45s")}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(cycleTime / 45) * 100}%` }} />
                      </div>
                    </div>

                    {/* Live SCADA Dials */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 flex flex-col justify-between min-h-[280px]">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t("Termodinamik Datchiklar")}</span>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider">{t("Dinamik Bosim & Vakuum Datchiklari")}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 my-2">
                        {/* Steam Pressure Dial */}
                        <div className="flex flex-col items-center">
                          <svg className="w-24 h-24" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#0f172a" strokeWidth="6" />
                            <circle 
                              cx="50" cy="50" r="38" fill="none" stroke="#818cf8" strokeWidth="6" 
                              strokeDasharray={2 * Math.PI * 38}
                              strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(bf12_press / 1.5, 1))}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                              className="transition-all duration-500"
                            />
                            <text x="50" y="52" textAnchor="middle" fill="#ffffff" className="text-xs font-black" fontSize="11">
                              {bf12_press.toFixed(2)}
                            </text>
                            <text x="50" y="65" textAnchor="middle" fill="#818cf8" className="text-[7px] font-black uppercase tracking-widest" fontSize="6">
                              BAR (STEAM)
                            </text>
                          </svg>
                        </div>

                        {/* Vacuum Pressure Dial */}
                        <div className="flex flex-col items-center">
                          <svg className="w-24 h-24" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#0f172a" strokeWidth="6" />
                            <circle 
                              cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="6" 
                              strokeDasharray={2 * Math.PI * 38}
                              strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(Math.abs(bf12_vac) / 1.0, 1))}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                              className="transition-all duration-500"
                            />
                            <text x="50" y="52" textAnchor="middle" fill="#ffffff" className="text-xs font-black" fontSize="11">
                              {bf12_vac.toFixed(2)}
                            </text>
                            <text x="50" y="65" textAnchor="middle" fill="#10b981" className="text-[7px] font-black uppercase tracking-widest" fontSize="6">
                              BAR (VACUUM)
                            </text>
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">
                        <span>Min: 0.00 / Max: 1.50</span>
                        <span>Min: -1.00 / Max: 0.00</span>
                      </div>
                    </div>

                  </div>

                  {/* 2-Column Row for OEE Gauge and Bunkers Rest time Warnings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    
                    {/* Bunkers resting time warning alerts */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 space-y-4">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t("Bunkery rest time monitor")}</span>
                        <h4 className="text-base font-black uppercase tracking-wider">{t("Zames Silo Dam Olish Vaqti")}</h4>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: 1, type: 'EPS A-Class', time: '2 soat 15 daqiqa', status: 'RESTING', warning: true },
                          { id: 2, type: 'EPS B-Class', time: '5 soat 10 daqiqa', status: 'READY', warning: false },
                          { id: 3, type: 'EPS C-Class', time: '1 soat 05 daqiqa', status: 'RESTING', warning: true }
                        ].map((bunk) => (
                          <div 
                            key={bunk.id} 
                            className={`p-4 rounded-2xl border transition-all ${
                              bunk.warning 
                                ? 'bg-rose-500/5 border-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.05)] animate-pulse' 
                                : 'bg-slate-950 border-white/5 text-slate-300'
                            } flex items-center justify-between`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${bunk.warning ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                                <h5 className="text-xs font-black uppercase tracking-wider">BUNKER #0{bunk.id} • {bunk.type}</h5>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                {t("Saqlash muddati")}: <span className="font-extrabold text-white">{bunk.time}</span>
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                              bunk.warning ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {bunk.warning ? t("Dam olmoqda (<4s)") : t("Tayyor")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shift OEE circular gauge */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-4 text-center sm:text-left">
                        <div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t("Smena OEE Ko'rsatkichi")}</span>
                          <h4 className="text-base font-black uppercase tracking-wider">{t("OEE Shift Target")}</h4>
                        </div>

                        <div className="space-y-2 font-semibold text-xs text-slate-400">
                          <div className="flex justify-between gap-6 border-b border-white/5 pb-1.5">
                            <span>{t("Availability (Ish vaqti)")}:</span>
                            <span className="font-extrabold text-white">97.2%</span>
                          </div>
                          <div className="flex justify-between gap-6 border-b border-white/5 pb-1.5">
                            <span>{t("Performance (Tezlik)")}:</span>
                            <span className="font-extrabold text-white">98.1%</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span>{t("Quality (Sifat)")}:</span>
                            <span className="font-extrabold text-white">99.4%</span>
                          </div>
                        </div>
                      </div>

                      {/* circular gauge */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#0f172a" strokeWidth="8" />
                          <circle 
                            cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="8" 
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - 0.948)}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-1000"
                          />
                          <text x="50" y="52" textAnchor="middle" fill="#ffffff" className="text-base font-black" fontSize="14">
                            94.8%
                          </text>
                          <text x="50" y="65" textAnchor="middle" fill="#10b981" className="text-[7px] font-black uppercase tracking-widest" fontSize="6">
                            Shift OEE
                          </text>
                        </svg>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ============ 2. SCADA (TEXNOLOGIK OQIM SXEMASI) ============ */}
              {activeTab === 'SCADA' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{t("Texnologik Oqim Sxemasi (ASU-SCADA)")}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t("Predvspenivatel, bunkery va block-formovka live quvur liniyalari")}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 p-8 rounded-[48px] shadow-2xl relative overflow-hidden min-h-[460px]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />
                    
                    <div className="relative z-10 w-full overflow-x-auto py-10 scrollbar-hide">
                      <div className="min-w-[900px] flex items-center justify-between px-6 relative">
                        
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '900px' }}>
                          <path d="M 80 120 L 170 120" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
                          <path d="M 80 120 L 170 120" stroke="#818cf8" strokeWidth="2" strokeDasharray="6 12" fill="none" className="animate-pipe-particles" />
                          <path d="M 270 120 L 370 120" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
                          <path d="M 270 120 L 370 120" stroke={pv1_press > 0.1 ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray="6 12" fill="none" className={pv1_press > 0.1 ? "animate-pipe-particles" : ""} />
                          <path d="M 500 120 L 600 120" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
                          <path d="M 500 120 L 600 120" stroke="#10b981" strokeWidth="2" strokeDasharray="6 12" fill="none" className="animate-pipe-particles" />
                        </svg>

                        {/* Silo 1: Granules */}
                        <div className="flex flex-col items-center gap-2 relative z-10 w-24">
                          <div className="w-20 h-24 bg-slate-900 border border-slate-800 rounded-t-3xl rounded-b-[20px] shadow-2xl flex flex-col justify-end p-2 relative overflow-hidden group">
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-700 to-slate-600 h-[70%] rounded-b-[18px]" />
                            <div className="relative z-10 text-center">
                              <Layers className="w-5 h-5 text-indigo-300 mx-auto mb-1" />
                              <span className="text-[7px] font-black text-white uppercase tracking-wider block">Raw Granules</span>
                              <span className="text-[9px] font-black text-indigo-200">1,240 kg</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-500">Xomashyo</span>
                        </div>

                        {/* Prefoamer PV-1 */}
                        <div className="flex flex-col items-center gap-2 relative z-10 w-28">
                          <div 
                            onClick={() => handleMachineClick('PV-1')}
                            className="w-24 h-28 bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-col justify-between relative cursor-pointer hover:border-indigo-500 transition-all"
                          >
                            <div className="text-center">
                              <Cpu className={`w-5 h-5 mx-auto mb-0.5 ${pv1_press > 0.1 ? 'text-emerald-400 rotate-animation' : 'text-slate-500'}`} />
                              <span className="text-[8px] font-black text-white uppercase block">Prefoamer PV-1</span>
                            </div>
                            <div className="space-y-1 bg-slate-950 p-1.5 rounded-lg border border-white/5 text-[8px] font-black uppercase">
                              <div className="flex justify-between text-slate-400">
                                <span>P (bar)</span>
                                <span className="text-indigo-300">{pv1_press.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>T (°C)</span>
                                <span className="text-indigo-300">{pv1_temp.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-500">Ko'piklatish</span>
                        </div>

                        {/* Bunkers */}
                        <div className="flex flex-col items-center gap-2 relative z-10 w-36">
                          <div 
                            onClick={() => handleMachineClick('BUNKERS')}
                            className="w-32 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl grid grid-cols-3 gap-1 cursor-pointer hover:border-indigo-500 transition-all"
                          >
                            {[bh1, bh2, bh3].map((val, idx) => (
                              <div key={idx} className="bg-slate-950 border border-white/5 rounded-lg p-0.5 text-center flex flex-col justify-between min-h-[50px] relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 bg-blue-500/5" style={{ height: `${val}%` }} />
                                <span className="text-[6px] font-black text-slate-500 block">#0{idx+1}</span>
                                <span className="text-[8px] font-black text-blue-300 relative z-10">{Math.round(val)}%</span>
                              </div>
                            ))}
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-500">Bunkery</span>
                        </div>

                        {/* Molder BF-12 */}
                        <div className="flex flex-col items-center gap-2 relative z-10 w-28">
                          <div 
                            onClick={() => handleMachineClick('BF-12')}
                            className="w-24 h-28 bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-col justify-between relative cursor-pointer hover:border-indigo-500 transition-all"
                          >
                            <div className="text-center">
                              <Gauge className="w-5 h-5 mx-auto mb-0.5 text-slate-500" />
                              <span className="text-[8px] font-black text-white uppercase block">Molder BF-12</span>
                            </div>
                            <div className="space-y-1 bg-slate-950 p-1.5 rounded-lg border border-white/5 text-[8px] font-black uppercase">
                              <div className="flex justify-between text-slate-400">
                                <span>P (bar)</span>
                                <span className="text-indigo-300">{bf12_press.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>T (°C)</span>
                                <span className="text-indigo-300">{bf12_temp.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-500">Formovka</span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ 3. REPORT (SMENA HISOBOTI FORM) ============ */}
              {activeTab === 'REPORT' && (
                <div className="space-y-6 animate-in slide-in-from-left duration-500 max-w-2xl">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{t("Smena Hisoboti (MES Registry)")}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t("Smena davomida ishlab chiqarilgan tayyor mahsulotlar va sarfiyotlar hisoboti")}</p>
                  </div>

                  <form onSubmit={handleSubmitReport} className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-[36px] relative overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Ishlab chiqarilgan bloklar (dona)")} *</label>
                        <input
                          required
                          value={shiftReport.produced_qty}
                          onChange={(e) => setShiftReport({ ...shiftReport, produced_qty: e.target.value })}
                          type="number"
                          placeholder="e.g. 14"
                          className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-2xl font-bold text-sm text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Brak mahsulot (dona/blok)")} *</label>
                        <input
                          required
                          value={shiftReport.scrap_qty}
                          onChange={(e) => setShiftReport({ ...shiftReport, scrap_qty: e.target.value })}
                          type="number"
                          placeholder="e.g. 0"
                          className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-2xl font-bold text-sm text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Sarf qilingan gaz / bug' (m³)")}</label>
                        <input
                          value={shiftReport.steam_consumed}
                          onChange={(e) => setShiftReport({ ...shiftReport, steam_consumed: e.target.value })}
                          type="text"
                          className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-2xl font-bold text-sm text-white"
                        />
                      </div>

                      <div className="space-y-2 col-span-1 sm:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Ish jarayonidagi texnik izohlar")}</label>
                        <textarea
                          rows={3}
                          value={shiftReport.notes}
                          onChange={(e) => setShiftReport({ ...shiftReport, notes: e.target.value })}
                          placeholder={t("Mashinalar va texnik holat yuzasidan bildirishnomalar")}
                          className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-2xl font-bold text-sm text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReport}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/30 flex items-center justify-center gap-2"
                    >
                      {submittingReport ? t("Yuborilmoqda...") : t("Hisobotni tasdiqlash va topshirish")}
                    </button>
                  </form>
                </div>
              )}

              {/* ============ 4. ALARMS (AVARIYA LOGS) ============ */}
              {activeTab === 'ALARMS' && (
                <div className="space-y-6 animate-in slide-in-from-top duration-500">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{t("Kritik Avariya Ogohlantirishlari (PLC Alarms)")}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t("Datchiklardan olingan kritik termodinamik ogohlantirishlar ro'yxati")}</p>
                  </div>

                  <div className="space-y-4">
                    {alarmItems.length === 0 ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[32px] text-center text-emerald-400">
                        <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="font-black uppercase tracking-widest text-sm">{t("Avariyalar aniqlanmadi")}</h4>
                        <p className="text-xs text-slate-400 mt-1">{t("Barcha ko'rsatkichlar me'yorda va datchiklar xavfsiz ishlamoqda.")}</p>
                      </div>
                    ) : (
                      alarmItems.map((alarm) => (
                        <div key={alarm.id} className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-950/20">
                              <AlertTriangle className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-rose-400 leading-snug">{alarm.title}</h4>
                              <p className="text-xs text-rose-300 font-bold mt-1">{alarm.desc}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setAcknowledgedAlarms([...acknowledgedAlarms, alarm.id]);
                              uiStore.showNotification(t("Avariya qabul qilindi. Muhandis xabardor etildi"), 'success');
                            }}
                            className="bg-rose-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-rose-500 transition-all shrink-0"
                          >
                            {t("Tasdiqlash (Acknowledge)")}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Machine details / historian chart modal */}
        <AnimatePresence>
          {selectedMachine && (
            <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex justify-end">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full max-w-lg bg-slate-950 border-l border-slate-900 h-screen flex flex-col justify-between p-6 shadow-2xl relative text-white"
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
                          <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                      ) : (
                        renderSVGChart(historianData)
                      )}
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

    </div>
  );
}
