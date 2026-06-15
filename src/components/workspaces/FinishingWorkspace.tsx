import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brush, Play, Pause, CheckCircle2, Clock, Package,
  AlertTriangle, LayoutDashboard, ListChecks, RefreshCw, Send, X, Plus, TrendingUp
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface FinishingWorkspaceProps {
  user: any;
}

type FTab = 'DASHBOARD' | 'TASKS' | 'QC_RETURNS' | 'HANDOVER';

export default function FinishingWorkspace({ user }: FinishingWorkspaceProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<FTab>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [qcReturns, setQcReturns] = useState<any[]>([]);
  const [activeTimer, setActiveTimer] = useState<number>(0);

  // Handover form
  const [handoverForm, setHandoverForm] = useState({ job_id: '', qty_completed: '', notes: '' });

  const activeJob = jobs.find(j => j.status === 'IN_PROGRESS');
  const pendingJobs = jobs.filter(j => j.status === 'PENDING' || j.status === 'ASSIGNED');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  const today = new Date().toDateString();
  const todayCompleted = completedJobs.filter(j => new Date(j.updated_at || j.created_at).toDateString() === today);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, qcRes] = await Promise.all([
        api.get('finishing/jobs/').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/?status=QC_FAILED').catch(() => ({ data: [] })),
      ]);
      setJobs(jobsRes.data?.results || jobsRes.data || []);
      setQcReturns(qcRes.data?.results || qcRes.data || []);
    } catch (err) {
      console.error("Finishing fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeJob?.started_at) {
      interval = setInterval(() => {
        const started = new Date(activeJob.started_at).getTime();
        setActiveTimer(Math.floor((Date.now() - started) / 1000));
      }, 1000);
    } else {
      setActiveTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  const fmt = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleAction = async (id: number, action: 'start' | 'pause' | 'complete') => {
    try {
      await api.post(`finishing/jobs/${id}/${action}/`);
      uiStore.showNotification(
        action === 'start' ? t('Ish boshlandi') :
        action === 'pause' ? t("Ish to'xtatildi") :
        t('Ish yakunlandi'), 'success'
      );
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const handleHandover = async () => {
    if (!handoverForm.job_id || !handoverForm.qty_completed) {
      uiStore.showNotification(t('Barcha maydonlarni to\'ldiring'), 'error');
      return;
    }
    try {
      await api.post(`finishing/jobs/${handoverForm.job_id}/complete/`, {
        qty_completed: Number(handoverForm.qty_completed),
        notes: handoverForm.notes
      });
      uiStore.showNotification(t('Mahsulot tayyor mahsulot omboriga topshirildi'), 'success');
      setHandoverForm({ job_id: '', qty_completed: '', notes: '' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Topshirishda xatolik'), 'error');
    }
  };

  const tabs: { id: FTab; label: string; icon: any }[] = [
    { id: 'DASHBOARD',   label: t('Dashboard'),        icon: LayoutDashboard },
    { id: 'TASKS',       label: t('Vazifalar'),         icon: ListChecks },
    { id: 'QC_RETURNS',  label: t('QC Qaytarilgan'),    icon: RefreshCw },
    { id: 'HANDOVER',    label: t('Topshirish'),        icon: Send },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-violet-700 to-purple-800 text-white p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-[20px] flex items-center justify-center shadow-lg border border-white/20">
            <Brush className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{t('Pardozlash Sexi')}</h1>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{user?.name || user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          {activeJob && (
            <div className="flex items-center gap-2 bg-white/15 border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t('ISHLAMOQDA')}
            </div>
          )}
          <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-[8px] font-black text-white/50 uppercase">{t('Bugun yakunlangan')}</p>
            <p className="text-2xl font-black">{todayCompleted.length}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-[8px] font-black text-white/50 uppercase">{t('Navbatda')}</p>
            <p className="text-2xl font-black">{pendingJobs.length}</p>
          </div>
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
            {tab.id === 'QC_RETURNS' && qcReturns.length > 0 && (
              <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{qcReturns.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── DASHBOARD ─── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('Aktiv vazifa'), value: activeJob ? '1' : '—', icon: Play, color: 'violet', sub: activeJob?.product_name || t("Yo'q") },
              { label: t('Navbatdagi'), value: pendingJobs.length, icon: Clock, color: 'amber', sub: t('Kutmoqda') },
              { label: t('Bugun yakunlangan'), value: todayCompleted.length, icon: CheckCircle2, color: 'emerald', sub: t('Tayyor') },
              { label: t('QC qaytarilgan'), value: qcReturns.length, icon: AlertTriangle, color: 'rose', sub: t('Tuzatish kerak') },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm">
                <div className={`w-10 h-10 bg-${kpi.color}-50 rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1 truncate">{kpi.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Active job panel */}
          {activeJob ? (
            <div className="bg-gradient-to-br from-violet-700 to-purple-800 rounded-[40px] p-8 text-white shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="px-3 py-1 bg-white/20 text-white/90 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-wider">{t('Aktiv Jarayon')}</span>
                  <h3 className="text-2xl font-black mt-2">{activeJob.product_name || activeJob.description || t('Pardozlash ishi')}</h3>
                  <p className="text-[10px] text-white/50 font-bold mt-1">{t('Buyurtma')}: #{activeJob.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/40 uppercase mb-1">{t('Sarflangan vaqt')}</p>
                  <p className="font-black text-3xl font-mono">{fmt(activeTimer)}</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mb-6">
                <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${Math.min(100, (activeTimer / 3600) * 100)}%` }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAction(activeJob.id, 'pause')} className="flex-1 py-3.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Pause className="w-4 h-4" /> {t("To'xtatish")}
                </button>
                <button onClick={() => { setActiveTab('HANDOVER'); setHandoverForm({ job_id: String(activeJob.id), qty_completed: '', notes: '' }); }} className="flex-[2] py-3.5 bg-white text-violet-700 hover:bg-white/90 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  <CheckCircle2 className="w-4 h-4" /> {t('Yakunlash & Topshirish')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brush className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">{t("Faol vazifa yo'q")}</h3>
              <p className="text-sm text-slate-400 font-bold mb-6">{t("Navbatdagi vazifalardan birini boshlang")}</p>
              <button onClick={() => setActiveTab('TASKS')} className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                {t("Vazifalar ro'yxati")}
              </button>
            </div>
          )}

          {/* Recent completed */}
          {todayCompleted.length > 0 && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">{t('Bugun Yakunlangan Ishlar')}</h3>
              <div className="space-y-2">
                {todayCompleted.slice(0, 5).map(j => (
                  <div key={j.id} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{j.product_name || j.description || `#${j.id}`}</p>
                        <p className="text-[10px] font-bold text-slate-400">{j.qty_completed || j.quantity} {t('dona')}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{t('Tayyor')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TASKS TAB ─── */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4">
          {/* Active job controls */}
          {activeJob && (
            <div className="bg-violet-50 border border-violet-100 rounded-[32px] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-violet-600 uppercase">{t('Aktiv Jarayon')}</p>
                    <p className="font-black text-slate-900">{activeJob.product_name || activeJob.description}</p>
                  </div>
                </div>
                <p className="font-black text-2xl font-mono text-violet-700">{fmt(activeTimer)}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAction(activeJob.id, 'pause')} className="flex-1 py-3 bg-white border border-violet-200 text-violet-700 rounded-2xl font-black text-[10px] uppercase hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
                  <Pause className="w-4 h-4" /> {t("To'xtatish")}
                </button>
                <button onClick={() => { setActiveTab('HANDOVER'); setHandoverForm({ job_id: String(activeJob.id), qty_completed: '', notes: '' }); }} className="flex-[2] py-3 bg-violet-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-violet-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <CheckCircle2 className="w-4 h-4" /> {t('Yakunlash')}
                </button>
              </div>
            </div>
          )}

          {/* Pending tasks */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Vazifalar Navbati')}</h3>
              <span className="px-3 py-1 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500">{pendingJobs.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{job.product_name || job.description || `Vazifa #${job.id}`}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{job.quantity} {t('dona')} · {t('Buyurtma')}: #{job.order_id || job.id}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAction(job.id, 'start')} disabled={!!activeJob} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl font-black text-[10px] uppercase transition-all active:scale-95">
                    <Play className="w-3.5 h-3.5 fill-current" /> {t('Boshlash')}
                  </button>
                </div>
              ))}
              {pendingJobs.length === 0 && !activeJob && (
                <div className="py-16 text-center text-slate-300 text-sm italic">{t("Barcha vazifalar bajarilgan")}</div>
              )}
            </div>
          </div>

          {/* Today's completed */}
          {todayCompleted.length > 0 && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Bugun Yakunlangan')}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {todayCompleted.map(job => (
                  <div key={job.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{job.product_name || job.description}</p>
                        <p className="text-[10px] font-bold text-slate-400">{job.qty_completed || job.quantity} {t('dona')}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">{t('Tayyor')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── QC RETURNS TAB ─── */}
      {activeTab === 'QC_RETURNS' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-100 rounded-[28px] p-5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm font-bold text-rose-700">{t('Bu mahsulotlar QC tomonidan tuzatish uchun qaytarilgan. Tuzatgandan so\'ng qayta QC tekshiruvidan o\'tkaziladi.')}</p>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('QC Tomonidan Qaytarilgan')}</h3>
              <span className="px-3 py-1 bg-rose-100 rounded-xl text-[10px] font-black text-rose-600">{qcReturns.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {qcReturns.map(item => (
                <div key={item.id} className="px-6 py-5 flex items-center justify-between hover:bg-rose-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{item.block_id || `Blok #${item.id}`}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.classification_display || 'QC Failed'} · {item.qc_notes || t('Tuzatish kerak')}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await api.post(`production/finished-blocks/${item.id}/transition/`, { status: 'REWORK' }).catch(() => null);
                        uiStore.showNotification(t('Tuzatishga olingan'), 'success');
                        fetchData();
                      } catch { /* ignore */ }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t('Tuzatishga Olish')}
                  </button>
                </div>
              ))}
              {qcReturns.length === 0 && (
                <div className="py-16 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-bold">{t("QC tomonidan qaytarilgan mahsulot yo'q")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── HANDOVER TAB ─── */}
      {activeTab === 'HANDOVER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Tayyor Mahsulot Topshirish')}</h3>
                <p className="text-[10px] font-bold text-slate-400">{t('Tayyor mahsulot omboriga topshirish')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Vazifani tanlang')}</label>
                <select
                  value={handoverForm.job_id}
                  onChange={e => setHandoverForm({ ...handoverForm, job_id: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-400 font-bold text-sm"
                >
                  <option value="">{t('Vazifani tanlang')}</option>
                  {[...(activeJob ? [activeJob] : []), ...completedJobs].map(j => (
                    <option key={j.id} value={j.id}>#{j.id} — {j.product_name || j.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Tayyor soni (dona)')}</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={handoverForm.qty_completed}
                  onChange={e => setHandoverForm({ ...handoverForm, qty_completed: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-400 font-black text-2xl text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Izoh (ixtiyoriy)')}</label>
                <textarea
                  placeholder={t('Mahsulot holati, qo\'shimcha ma\'lumotlar...')}
                  value={handoverForm.notes}
                  onChange={e => setHandoverForm({ ...handoverForm, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-400 font-bold text-sm resize-none h-20"
                />
              </div>
              <button
                onClick={handleHandover}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-violet-500/20"
              >
                <Send className="w-4 h-4 inline mr-2" />
                {t('Omborga Topshirish')}
              </button>
            </div>
          </div>

          {/* Recent handovers info */}
          <div className="space-y-4">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">{t("Bugungi Topshirishlar")}</h4>
              <div className="space-y-3">
                {todayCompleted.length > 0 ? todayCompleted.map(j => (
                  <div key={j.id} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{j.product_name || `#${j.id}`}</p>
                      <p className="text-[10px] font-bold text-slate-400">{j.qty_completed || j.quantity} {t('dona')}</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{t('Topshirildi')}</span>
                  </div>
                )) : (
                  <p className="text-slate-300 text-xs italic text-center py-6">{t("Bugun hali topshirilmagan")}</p>
                )}
              </div>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-[28px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <h4 className="font-black text-violet-800 text-[10px] uppercase tracking-widest">{t('Jami statistika')}</h4>
              </div>
              {[
                { label: t('Jami yakunlangan'), value: completedJobs.length },
                { label: t('Bugun yakunlangan'), value: todayCompleted.length },
                { label: t('Navbatda'), value: pendingJobs.length },
              ].map((s, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-violet-100">
                  <span className="text-xs font-bold text-violet-700">{s.label}</span>
                  <span className="font-black text-violet-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
