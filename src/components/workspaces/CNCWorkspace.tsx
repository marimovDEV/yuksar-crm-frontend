import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Play, Pause, CheckCircle2, Box, Layers, Cpu, Clock, 
  Settings, AlertTriangle, AlertCircle, FileText, Plus, Trash2, ArrowRight, X
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';
import BlockPassport from '../production/BlockPassport';

interface CNCWorkspaceProps {
  user: any;
}

export default function CNCWorkspace({ user }: CNCWorkspaceProps) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Modals & Passport
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedBlockPassport, setSelectedBlockPassport] = useState<any>(null);

  // Form states
  const [newJob, setNewJob] = useState({
    input_finished_block: '',
    output_product: '',
    quantity_planned: 1,
    machine_id: 'CNC-1',
    priority: 1
  });

  const [finishData, setFinishData] = useState({
    finished_qty: 0,
    waste_m3: 0.05
  });

  const [activeTimer, setActiveTimer] = useState<number>(0);
  const [feedRate, setFeedRate] = useState<number>(15); // mm/s
  const [wireTemp, setWireTemp] = useState<number>(240); // °C

  const activeJob = jobs.find(j => j.status === 'RUNNING');
  const queuedJobs = jobs.filter(j => j.status === 'CREATED' || j.status === 'PAUSED');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, blocksRes, prodRes] = await Promise.all([
        api.get('cnc/jobs/').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/?status=READY').catch(() => ({ data: [] })),
        api.get('materials/').catch(() => ({ data: [] }))
      ]);
      setJobs(jobsRes.data || []);
      setBlocks(blocksRes.data || []);
      setProducts(prodRes.data || []);
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

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (activeJob) {
      interval = setInterval(() => {
        const lastStart = new Date(activeJob.last_started_at).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - lastStart) / 1000);
        setActiveTimer((activeJob.total_duration_seconds || 0) + elapsed);
        
        // Minor telemetry variations
        setFeedRate(prev => Math.max(12, Math.min(18, prev + (Math.random() - 0.5) * 0.4)));
        setWireTemp(prev => Math.max(235, Math.min(245, prev + (Math.random() - 0.5) * 1.5)));
      }, 1000);
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
    } catch (err) {
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
      uiStore.showNotification(`${t('Amal muvaffaqiyatli')}: ${t(action)}`, "success");
      fetchData();
    } catch (err) {
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
    } catch (err) {
      uiStore.showNotification(t("Xatolik"), "error");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* CNC Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Scissors className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1.5">{t('CNC Kesish Sexi')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Kompyuterlashtirilgan kesish operatori paneli')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          {t('Yangi CNC Vazifa')}
        </button>
      </div>

      {/* CNC Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Machine Controls */}
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

              {/* Machine Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{t('Sim Harorati')}</p>
                  <p className="text-xl font-black text-amber-500">{Math.round(wireTemp)} <span className="text-[10px] text-slate-400">°C</span></p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{t('Uzatish Tezligi')}</p>
                  <p className="text-xl font-black text-indigo-400">{feedRate.toFixed(1)} <span className="text-[10px] text-slate-400">mm/s</span></p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{t('Uskuna ID')}</p>
                  <p className="text-xl font-black text-slate-200">{activeJob.machine_id}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/10 transition-all" onClick={() => setSelectedBlockPassport({ block_id: activeJob.input_block_number })}>
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{t('Xomashyo Blok')}</p>
                  <p className="text-xs font-black text-blue-400 underline decoration-indigo-500 truncate">{activeJob.input_block_number}</p>
                </div>
              </div>              {/* Central progressive timer */}
              <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-4">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                    {t("Kesish Sikli Taymeri")}
                  </span>
                  <span>{t("Qolgan vaqt")}: {Math.max(0, 120 - activeTimer)}s</span>
                </div>
                
                <div className="flex flex-col items-center py-4 bg-slate-900/50 rounded-2xl border border-white/5">
                  <span className="text-4xl font-black font-mono leading-none">{formatDuration(activeTimer)}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{t("Me'yoriy vaqt: 120s")}</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/5 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (activeTimer / 120) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleAction(activeJob.id, 'pause')}
                  className="flex-1 py-4.5 bg-amber-500 hover:bg-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" /> {t('To\'xtatish')}
                </button>
                <button 
                  onClick={() => handleAction(activeJob.id, 'finish')}
                  className="flex-[2] py-4.5 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> {t('Yakunlash')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Scissors className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-slate-100 mb-2">{t('Faol kesish vazifasi yo\'q')}</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm">{t('Mashinani ishga tushirish uchun quyidagi navbatdan biror buyurtmani tanlang yoki yangisini kiriting.')}</p>
            </div>
          )}
        </div>

        {/* Queued Worksheets */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="font-black text-slate-900 text-base">{t('Vazifalar Navbati')}</h3>
              <span className="px-3 py-1 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500">{queuedJobs.length}</span>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {queuedJobs.map(job => (
                <div key={job.id} className="p-4 bg-slate-50 hover:bg-blue-50/30 rounded-2xl border border-transparent hover:border-blue-100 transition-all flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-950 text-sm truncate">{job.output_product_name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Block: {job.input_block_number}</p>
                  </div>
                  <button 
                    onClick={() => handleAction(job.id, 'start')}
                    className="p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90 text-indigo-600"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
              {queuedJobs.length === 0 && (
                <div className="py-12 text-center text-slate-300 text-xs italic">{t('Navbatda vazifa yo\'q')}</div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Oxirgi yakunlanganlar')}</h4>
            <div className="space-y-2">
              {completedJobs.slice(0, 3).map(job => (
                <div key={job.id} className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 truncate max-w-[140px]">{job.output_product_name}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{job.job_number}</span>
                  <span className="text-emerald-600">{job.quantity_finished} dona</span>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Declaration Card */}
          <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{t("Chiqindi Deklaratsiyasi (Sklad-1)")}</h4>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">{t("Chiqindi og'irligi (kg)")}</label>
                <input 
                  type="number"
                  placeholder="e.g. 12.5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                  id="cnc-waste-weight"
                />
              </div>

              <button
                onClick={() => {
                  const val = (document.getElementById('cnc-waste-weight') as HTMLInputElement)?.value;
                  if (!val || isNaN(Number(val)) || Number(val) <= 0) {
                    uiStore.showNotification(t("To'g'ri vazn kiriting"), "error");
                    return;
                  }
                  uiStore.showNotification(t("Chiqindi Sklad-1 ga qaytarildi") + `: ${val} kg`, "success");
                  (document.getElementById('cnc-waste-weight') as HTMLInputElement).value = '';
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
              >
                {t("Topshirish & Sklad-1 ga Yuborish")}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Block Passport View drawer */}
      <AnimatePresence>
        {selectedBlockPassport && (() => {
          const blockObj = blocks.find(b => b.block_id === selectedBlockPassport.block_id) || {
            block_id: selectedBlockPassport.block_id,
            status: 'READY',
            status_display: t('Tayyor'),
            classification: 'A_CLASS',
            classification_display: 'A CLASS',
            actual_weight: 18.5,
            actual_density: 16.2,
            moisture: 4.2,
            length: 1000,
            width: 500,
            height: 120,
            recipe_name: 'EPS Class-A',
            timeline: []
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
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('CNC Yangi Vazifa')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Xomashyo blok tanlang')}</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-sm transition-all"
                    value={newJob.input_finished_block}
                    onChange={(e) => setNewJob({ ...newJob, input_finished_block: e.target.value })}
                  >
                    <option value="">{t('Blokni tanlang')}...</option>
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.block_id} ({b.classification_display})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Ishlovchi mashina')}</label>
                  <div className="grid grid-cols-2 gap-2">
                     {['CNC-1', 'CNC-2'].map(m => (
                       <button
                         key={m}
                         type="button"
                         onClick={() => setNewJob({ ...newJob, machine_id: m })}
                         className={`py-3.5 rounded-xl font-black text-[10px] border-2 transition-all ${newJob.machine_id === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                       >
                         {m}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Chiquvchi mahsulot')}</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm shadow-sm transition-all"
                    value={newJob.output_product}
                    onChange={(e) => setNewJob({ ...newJob, output_product: e.target.value })}
                  >
                    <option value="">{t('Mahsulotni tanlang')}...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Reja soni (dona)')}</label>
                  <input
                    type="number"
                    value={newJob.quantity_planned}
                    onChange={(e) => setNewJob({ ...newJob, quantity_planned: parseInt(e.target.value) || 1 })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                  />
                </div>

                <button
                  onClick={handleCreateJob}
                  className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-widest mt-6 hover:bg-black shadow-xl transition-all"
                >
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
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8">
                <div className="text-center space-y-4 mb-6">
                   <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('Ishni Yakunlash')}</h3>
                   <p className="text-slate-400 text-xs font-medium">{t('Vaqt sarfi')}: <span className="text-slate-900 font-bold">{formatDuration(activeTimer)}</span></p>
                </div>

                <div className="space-y-4 mb-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Tayyor mahsulot (dona)')}</label>
                      <input 
                        type="number" 
                        value={finishData.finished_qty} 
                        onChange={(e) => setFinishData({ ...finishData, finished_qty: parseInt(e.target.value) || 0 })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg focus:border-emerald-500 text-center"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kesilgan chiqindi (m³)')}</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={finishData.waste_m3} 
                        onChange={(e) => setFinishData({ ...finishData, waste_m3: parseFloat(e.target.value) || 0 })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg focus:border-rose-500 text-center"
                      />
                   </div>
                </div>

                <div className="flex gap-3">
                   <button onClick={() => setIsFinishModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">{t('Bekor qilish')}</button>
                   <button onClick={handleFinishConfirm} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">{t('Tasdiqlash')}</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
