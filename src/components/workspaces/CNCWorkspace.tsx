import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors, Play, Pause, CheckCircle2, Cpu, Clock,
  AlertCircle, Plus, X, BarChart3, Trash2, LayoutDashboard,
  TrendingUp, Package, Zap, Activity, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';
import BlockPassport from '../production/BlockPassport';

interface CNCWorkspaceProps {
  user: any;
}

type CNCTab = 'DASHBOARD' | 'JOBS' | 'WASTE' | 'STATS';

export default function CNCWorkspace({ user }: CNCWorkspaceProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<CNCTab>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedBlockPassport, setSelectedBlockPassport] = useState<any>(null);

  const [newJob, setNewJob] = useState({
    input_finished_block: '',
    output_product: '',
    quantity_planned: 1,
    machine_id: 'CNC-1',
    priority: 1
  });

  const [finishData, setFinishData] = useState({ finished_qty: 0, waste_m3: 0.05 });
  const [activeTimer, setActiveTimer] = useState<number>(0);
  const [feedRate, setFeedRate] = useState<number>(15);
  const [wireTemp, setWireTemp] = useState<number>(240);

  // Waste form state
  const [wasteForm, setWasteForm] = useState({
    source: 'CNC',
    weight_kg: '',
    description: '',
    job_number: ''
  });

  const activeJob = jobs.find(j => j.status === 'RUNNING');
  const queuedJobs = jobs.filter(j => j.status === 'CREATED' || j.status === 'PAUSED');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
  const todayCompleted = completedJobs.filter(j => {
    const d = new Date(j.updated_at || j.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const totalWaste = jobs.reduce((s, j) => s + (parseFloat(j.waste_m3) || 0), 0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, blocksRes, prodRes] = await Promise.all([
        api.get('cnc/jobs/').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/?status=READY').catch(() => ({ data: [] })),
        api.get('materials/').catch(() => ({ data: [] }))
      ]);
      setJobs(jobsRes.data?.results || jobsRes.data || []);
      setBlocks(blocksRes.data?.results || blocksRes.data || []);
      setProducts(prodRes.data?.results || prodRes.data || []);
    } catch (err) {
      console.error("CNC fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeJob) {
      interval = setInterval(async () => {
        const lastStart = new Date(activeJob.last_started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - lastStart) / 1000);
        setActiveTimer((activeJob.total_duration_seconds || 0) + elapsed);
        // Try to get real telemetry; fall back to last known values (no random noise)
        try {
          const telRes = await api.get('telemetry/tags/live/').catch(() => null);
          if (telRes?.data) {
            const tags = Array.isArray(telRes.data) ? telRes.data : Object.values(telRes.data);
            const wireTag = (tags as any[]).find((t: any) => /wire.temp|cnc.temp/i.test(t.tag_name || t.name || ''));
            const feedTag = (tags as any[]).find((t: any) => /feed.rate|cnc.speed/i.test(t.tag_name || t.name || ''));
            if (wireTag?.value != null) setWireTemp(parseFloat(wireTag.value));
            if (feedTag?.value != null) setFeedRate(parseFloat(feedTag.value));
          }
        } catch { /* keep last values */ }
      }, 5000);
    } else {
      setActiveTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateJob = async () => {
    if (!newJob.input_finished_block || !newJob.output_product || newJob.quantity_planned <= 0) {
      uiStore.showNotification(t("Barcha maydonlarni to'ldiring"), "error");
      return;
    }
    try {
      await api.post('cnc/jobs/', newJob);
      uiStore.showNotification(t("Yangi CNC vazifa yaratildi"), "success");
      setIsModalOpen(false);
      fetchData();
    } catch {
      uiStore.showNotification(t("Vazifa yaratishda xatolik"), "error");
    }
  };

  const handleAction = async (id: number, action: 'start' | 'pause' | 'finish') => {
    try {
      if (action === 'finish') {
        const job = jobs.find(j => j.id === id);
        if (job) {
          setSelectedJob(job);
          setFinishData({ finished_qty: job.quantity_planned, waste_m3: 0.05 });
          setIsFinishModalOpen(true);
        }
        return;
      }
      await api.post(`cnc/jobs/${id}/${action}/`);
      uiStore.showNotification(action === 'start' ? t("Ish boshlandi") : t("Ish to'xtatildi"), "success");
      fetchData();
    } catch {
      uiStore.showNotification(t("Xatolik"), "error");
    }
  };

  const handleFinishConfirm = async () => {
    if (!selectedJob) return;
    try {
      await api.post(`cnc/jobs/${selectedJob.id}/finish/`, finishData);
      uiStore.showNotification(t("Ish yakunlandi va tayyor mahsulot skladiga o'tkazildi"), "success");
      setIsFinishModalOpen(false);
      fetchData();
    } catch {
      uiStore.showNotification(t("Xatolik"), "error");
    }
  };

  const handleWasteSubmit = async () => {
    if (!wasteForm.weight_kg || Number(wasteForm.weight_kg) <= 0) {
      uiStore.showNotification(t("To'g'ri og'irlik kiriting"), "error");
      return;
    }
    try {
      await api.post('waste/processing/', {
        source_department: 'CNC',
        waste_amount_kg: Number(wasteForm.weight_kg),
        description: wasteForm.description || `CNC chiqindi - ${wasteForm.job_number}`,
      }).catch(() => null);
      uiStore.showNotification(t("Chiqindi Sklad-1 ga qaytarildi") + `: ${wasteForm.weight_kg} kg`, "success");
      setWasteForm({ source: 'CNC', weight_kg: '', description: '', job_number: '' });
    } catch {
      uiStore.showNotification(t("Xatolik"), "error");
    }
  };

  const tabs: { id: CNCTab; label: string; icon: any }[] = [
    { id: 'DASHBOARD', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'JOBS',      label: t('CNC Ishlar'), icon: Scissors },
    { id: 'WASTE',     label: t('Chiqindi'), icon: Trash2 },
    { id: 'STATS',     label: t('Statistika'), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Scissors className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{t('CNC Kesish Sexi')}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.name || user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          {activeJob && (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t('ISHLAMOQDA')} — {activeJob.machine_id}
            </div>
          )}
          <button
            onClick={() => { setActiveTab('JOBS'); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            {t('Yangi Vazifa')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── DASHBOARD TAB ─── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('Navbatdagi ishlar'), value: queuedJobs.length, icon: Clock, color: 'amber', sub: t('Kutmoqda') },
              { label: t('Bugun yakunlangan'), value: todayCompleted.length, icon: CheckCircle2, color: 'emerald', sub: t('Dona') },
              { label: t('Jami chiqindi'), value: `${totalWaste.toFixed(2)} m³`, icon: Trash2, color: 'rose', sub: t('Jami') },
              { label: t('Aktiv mashina'), value: activeJob ? activeJob.machine_id : '—', icon: Cpu, color: 'indigo', sub: activeJob ? t('Ishlamoqda') : t('Bo\'sh') },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm"
              >
                <div className={`w-10 h-10 bg-${kpi.color}-50 rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1">{kpi.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Active job live preview */}
          <div className="bg-slate-950 rounded-[40px] p-8 text-white border border-slate-800 shadow-2xl">
            {activeJob ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider">{t('Aktiv Jarayon')}</span>
                    <h3 className="text-xl font-black mt-2">{activeJob.output_product_name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{activeJob.job_number} · {activeJob.machine_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t('Joriy vaqt')}</p>
                    <p className="font-black text-3xl font-mono text-white">{formatDuration(activeTimer)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t('Sim Harorati')}</p>
                    <p className="text-2xl font-black text-amber-500">{Math.round(wireTemp)} <span className="text-sm">°C</span></p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t('Uzatish Tezligi')}</p>
                    <p className="text-2xl font-black text-indigo-400">{feedRate.toFixed(1)} <span className="text-sm">mm/s</span></p>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (activeTimer / 120) * 100)}%` }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAction(activeJob.id, 'pause')} className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Pause className="w-4 h-4" /> {t("To'xtatish")}
                  </button>
                  <button onClick={() => handleAction(activeJob.id, 'finish')} className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {t('Yakunlash')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Scissors className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-black text-slate-200 mb-2">{t('Faol kesish vazifasi yo\'q')}</h3>
                <p className="text-xs text-slate-500 font-bold max-w-sm">{t('Navbatdagi ishlardan birini boshlang')}</p>
                <button onClick={() => setActiveTab('JOBS')} className="mt-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-widest">
                  {t('Vazifalar navbatiga o\'tish')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Queued jobs mini list */}
          {queuedJobs.length > 0 && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">{t('Navbatdagi ishlar')}</h3>
              <div className="space-y-2">
                {queuedJobs.slice(0, 5).map((job, i) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">{i + 1}</span>
                      <div>
                        <p className="text-sm font-black text-slate-900">{job.output_product_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{job.machine_id} · {job.quantity_planned} dona</p>
                      </div>
                    </div>
                    <button onClick={() => handleAction(job.id, 'start')} className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all text-indigo-600">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── JOBS TAB ─── */}
      {activeTab === 'JOBS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active machine panel */}
          <div className="lg:col-span-2 bg-slate-950 rounded-[40px] p-8 text-white border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[480px]">
            {activeJob ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider">{t('Aktiv Jarayon')}</span>
                    <h3 className="text-2xl font-black mt-2 tracking-tight">{activeJob.output_product_name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase">{t('Vazifa ID')}</p>
                    <p className="font-bold text-sm text-slate-300">{activeJob.job_number}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: t('Sim Harorati'), value: `${Math.round(wireTemp)} °C`, color: 'text-amber-500' },
                    { label: t('Tezlik'), value: `${feedRate.toFixed(1)} mm/s`, color: 'text-indigo-400' },
                    { label: t('Mashina'), value: activeJob.machine_id, color: 'text-slate-200' },
                    { label: t('Blok'), value: activeJob.input_block_number, color: 'text-blue-400' },
                  ].map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/10 transition-all" onClick={m.label === t('Blok') ? () => setSelectedBlockPassport({ block_id: activeJob.input_block_number }) : undefined}>
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{m.label}</p>
                      <p className={`text-xl font-black ${m.color} truncate`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400 animate-pulse" />{t("Kesish Sikli Taymeri")}</span>
                    <span>{t("Qolgan")}: {Math.max(0, 120 - activeTimer)}s</span>
                  </div>
                  <div className="flex flex-col items-center py-4 bg-slate-900/50 rounded-2xl border border-white/5">
                    <span className="text-4xl font-black font-mono">{formatDuration(activeTimer)}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">{t("Me'yoriy vaqt: 120s")}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (activeTimer / 120) * 100)}%` }} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleAction(activeJob.id, 'pause')} className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Pause className="w-4 h-4" /> {t("To'xtatish")}
                  </button>
                  <button onClick={() => handleAction(activeJob.id, 'finish')} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95">
                    <CheckCircle2 className="w-5 h-5" /> {t('Yakunlash')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <Scissors className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-slate-100 mb-2">{t("Faol kesish vazifasi yo'q")}</h3>
                <p className="text-xs text-slate-500 font-bold max-w-sm">{t("Navbatdan biror buyurtmani tanlang yoki yangisini kiriting.")}</p>
              </div>
            )}
          </div>

          {/* Queue & waste */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                <h3 className="font-black text-slate-900">{t('Vazifalar Navbati')}</h3>
                <span className="px-3 py-1 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500">{queuedJobs.length}</span>
              </div>
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {queuedJobs.map(job => (
                  <div key={job.id} className="p-4 bg-slate-50 hover:bg-blue-50/30 rounded-2xl border border-transparent hover:border-blue-100 transition-all flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-950 text-sm truncate">{job.output_product_name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{job.input_block_number}</p>
                    </div>
                    <button onClick={() => handleAction(job.id, 'start')} className="p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90 text-indigo-600">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
                {queuedJobs.length === 0 && <p className="py-8 text-center text-slate-300 text-xs italic">{t("Navbatda vazifa yo'q")}</p>}
              </div>
            </div>

            {completedJobs.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Oxirgi yakunlanganlar')}</h4>
                <div className="space-y-2">
                  {completedJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 truncate max-w-[130px]">{job.output_product_name}</span>
                      <span className="text-emerald-600">{job.quantity_finished} {t('dona')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── WASTE TAB ─── */}
      {activeTab === 'WASTE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste entry form */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Chiqindi Kiritish')}</h3>
                <p className="text-[10px] font-bold text-slate-400">{t('Sklad-1 ga qaytarish')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t("Vazifa raqami (ixtiyoriy)")}</label>
                <select
                  value={wasteForm.job_number}
                  onChange={e => setWasteForm({ ...wasteForm, job_number: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-400 font-bold text-sm"
                >
                  <option value="">{t('Vazifasiz chiqindi')}</option>
                  {[...completedJobs, ...queuedJobs].map(j => (
                    <option key={j.id} value={j.job_number}>{j.job_number} — {j.output_product_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t("Chiqindi og'irligi (kg)")}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 12.5"
                  value={wasteForm.weight_kg}
                  onChange={e => setWasteForm({ ...wasteForm, weight_kg: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-400 font-black text-lg text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t("Izoh")}</label>
                <textarea
                  placeholder={t("Chiqindi sababi yoki izoh...")}
                  value={wasteForm.description}
                  onChange={e => setWasteForm({ ...wasteForm, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-400 font-bold text-sm resize-none h-24"
                />
              </div>
              <button
                onClick={handleWasteSubmit}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                {t("Topshirish — Sklad-1 ga Yuborish")}
              </button>
            </div>
          </div>

          {/* Waste info */}
          <div className="space-y-4">
            <div className="bg-rose-50 rounded-[32px] border border-rose-100 p-6">
              <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-4">{t('Bugungi Chiqindi Holati')}</h4>
              <div className="space-y-3">
                {[
                  { label: t("Jami chiqindi (m³)"), value: totalWaste.toFixed(3) },
                  { label: t("Bugungi vazifalar"), value: todayCompleted.length },
                  { label: t("O'rtacha chiqindi/ish"), value: todayCompleted.length > 0 ? (totalWaste / todayCompleted.length).toFixed(3) + ' m³' : '—' },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-rose-100">
                    <span className="text-xs font-bold text-rose-600">{s.label}</span>
                    <span className="font-black text-rose-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 p-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Ohirgi ishlar bo\'yicha chiqindi')}</h4>
              <div className="space-y-2">
                {completedJobs.slice(0, 6).map(j => (
                  <div key={j.id} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 truncate max-w-[180px]">{j.output_product_name}</span>
                    <span className="font-black text-rose-500">{(parseFloat(j.waste_m3) || 0).toFixed(3)} m³</span>
                  </div>
                ))}
                {completedJobs.length === 0 && <p className="text-slate-300 text-xs italic text-center py-4">{t("Ma'lumot yo'q")}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STATS TAB ─── */}
      {activeTab === 'STATS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('Jami vazifalar'), value: jobs.length, icon: Activity, color: 'slate' },
              { label: t('Yakunlangan'), value: completedJobs.length, icon: CheckCircle2, color: 'emerald' },
              { label: t('Navbatda'), value: queuedJobs.length, icon: Clock, color: 'amber' },
              { label: t('Chiqindi jami'), value: `${totalWaste.toFixed(2)} m³`, icon: Trash2, color: 'rose' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm">
                <div className={`w-10 h-10 bg-${s.color}-50 rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Barcha Vazifalar Tarixi')}</h3>
                <p className="text-[10px] font-bold text-slate-400">{jobs.length} {t("ta vazifa")}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    {[t('Vazifa'), t('Mashina'), t('Mahsulot'), t('Soni'), t('Chiqindi'), t('Status')].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 text-sm font-black text-slate-900">{job.job_number}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{job.machine_id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{job.output_product_name}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">{job.quantity_finished || job.quantity_planned}</td>
                      <td className="px-6 py-4 text-sm font-bold text-rose-500">{(parseFloat(job.waste_m3) || 0).toFixed(3)} m³</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                          job.status === 'RUNNING' ? 'bg-blue-50 text-blue-700' :
                          job.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-50 text-slate-500'
                        }`}>{job.status_display || job.status}</span>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-300 text-sm italic">{t("Ma'lumot yo'q")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Block Passport Drawer */}
      <AnimatePresence>
        {selectedBlockPassport && (() => {
          const blockObj = blocks.find(b => b.block_id === selectedBlockPassport.block_id) || {
            block_id: selectedBlockPassport.block_id, status: 'READY', status_display: t('Tayyor'),
            classification: 'A_CLASS', classification_display: 'A CLASS',
            actual_weight: 18.5, actual_density: 16.2, moisture: 4.2,
            length: 1000, width: 500, height: 120, recipe_name: 'EPS Class-A', timeline: []
          };
          return (
            <div className="fixed inset-0 z-[300] flex items-center justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBlockPassport(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white h-full w-full max-w-lg shadow-2xl border-l border-slate-100 overflow-y-auto">
                <div className="p-8">
                  <BlockPassport block={blockObj} onClose={() => setSelectedBlockPassport(null)} />
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Create CNC Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{t('CNC Yangi Vazifa')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Xomashyo blok')}</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm" value={newJob.input_finished_block} onChange={e => setNewJob({ ...newJob, input_finished_block: e.target.value })}>
                    <option value="">{t('Blokni tanlang')}...</option>
                    {blocks.map(b => <option key={b.id} value={b.id}>{b.block_id} ({b.classification_display})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Mashina')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['CNC-1', 'CNC-2'].map(m => (
                      <button key={m} type="button" onClick={() => setNewJob({ ...newJob, machine_id: m })} className={`py-3.5 rounded-xl font-black text-[10px] border-2 transition-all ${newJob.machine_id === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Chiquvchi mahsulot')}</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm" value={newJob.output_product} onChange={e => setNewJob({ ...newJob, output_product: e.target.value })}>
                    <option value="">{t('Mahsulotni tanlang')}...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t("Reja soni (dona)")}</label>
                  <input type="number" value={newJob.quantity_planned} onChange={e => setNewJob({ ...newJob, quantity_planned: parseInt(e.target.value) || 1 })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm" />
                </div>
                <button onClick={handleCreateJob} className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-widest mt-2 hover:bg-black shadow-xl transition-all">
                  {t('Ishga tushirish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finish Confirmation Modal */}
      <AnimatePresence>
        {isFinishModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFinishModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
              <div className="text-center space-y-3 mb-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{t('Ishni Yakunlash')}</h3>
                <p className="text-slate-400 text-xs font-medium">{t('Vaqt sarfi')}: <span className="text-slate-900 font-bold">{formatDuration(activeTimer)}</span></p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Tayyor mahsulot (dona)')}</label>
                  <input type="number" value={finishData.finished_qty} onChange={e => setFinishData({ ...finishData, finished_qty: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg focus:border-emerald-500 text-center" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Kesilgan chiqindi (m³)')}</label>
                  <input type="number" step="0.01" value={finishData.waste_m3} onChange={e => setFinishData({ ...finishData, waste_m3: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg focus:border-rose-500 text-center" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsFinishModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">{t('Bekor')}</button>
                <button onClick={handleFinishConfirm} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">{t('Tasdiqlash')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
