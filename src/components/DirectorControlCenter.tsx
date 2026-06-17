import React, { useState, useEffect, useCallback } from 'react';
import {
  Factory, Scissors, Brush, Package, Truck,
  AlertTriangle, AlertOctagon, Info, RefreshCw,
  Activity, Thermometer, Droplets, Gauge, Box,
  Zap, TrendingUp, ChevronRight, X, ArrowRight,
  Flame, BarChart3, ShieldCheck, Warehouse, Layers,
  Clock, Database, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useI18n } from '../i18n';

/* ═══════════════════════════════════════════════════════════════
   DIRECTOR LIVE FACTORY — Real API wired, no DEMO fallbacks
   ═══════════════════════════════════════════════════════════════ */

interface FlowStage {
  id: string;
  name: string;
  active: number;
  waiting: number;
  problem: number;
  icon: React.ElementType;
  color: string;
  navTarget: string;
}

interface LiveAlert {
  id: string | number;
  level: 'critical' | 'warning' | 'info';
  text: string;
  target?: string;
}

export default function DirectorControlCenter({ onAction }: { onAction: (id: string) => void }) {
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string | number>>(new Set());

  // Raw API data
  const [zames, setZames] = useState<any[]>([]);
  const [bunkers, setBunkers] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [drying, setDrying] = useState<any[]>([]);
  const [cncJobs, setCncJobs] = useState<any[]>([]);
  const [finishingJobs, setFinishingJobs] = useState<any[]>([]);
  const [finishedBlocks, setFinishedBlocks] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [stocks, setStocks] = useState<any[]>([]);

  const now = new Date();
  const locale = language === 'ru' ? 'ru-RU' : 'uz-UZ';
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const isDay = now.getHours() >= 8 && now.getHours() < 20;

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [
        zamesRes, bunkersRes, blocksRes, dryingRes,
        cncRes, finishingRes, finishedRes, deliveriesRes,
        alertsRes, telRes, financeRes, stocksRes,
      ] = await Promise.all([
        api.get('production/zames/').catch(() => ({ data: [] })),
        api.get('production/bunkers/').catch(() => ({ data: [] })),
        api.get('production/blocks/').catch(() => ({ data: [] })),
        api.get('production/drying/').catch(() => ({ data: [] })),
        api.get('cnc/jobs/').catch(() => ({ data: [] })),
        api.get('finishing/jobs/').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/').catch(() => ({ data: [] })),
        api.get('sales/deliveries/').catch(() => ({ data: [] })),
        api.get('alerts/alerts/?is_read=false&page_size=20').catch(() => ({ data: [] })),
        api.get('telemetry/tags/live/').catch(() => ({ data: [] })),
        api.get('finance/analytics/').catch(() => ({ data: null })),
        api.get('stocks/').catch(() => ({ data: [] })),
      ]);

      setZames(zamesRes.data.results || zamesRes.data || []);
      setBunkers(bunkersRes.data.results || bunkersRes.data || []);
      setBlocks(blocksRes.data.results || blocksRes.data || []);
      setDrying(dryingRes.data.results || dryingRes.data || []);
      setCncJobs(cncRes.data.results || cncRes.data || []);
      setFinishingJobs(finishingRes.data.results || finishingRes.data || []);
      setFinishedBlocks(finishedRes.data.results || finishedRes.data || []);
      setDeliveries(deliveriesRes.data.results || deliveriesRes.data || []);
      setAlerts(alertsRes.data.results || alertsRes.data || []);
      setTelemetry(telRes.data.results || telRes.data || []);
      setFinance(financeRes.data);
      setStocks(stocksRes.data.results || stocksRes.data || []);
    } catch (err) {
      console.error('DirectorControlCenter fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Compute Factory Flow from real data ──
  const activeZames = zames.filter(z => z.status === 'IN_PROGRESS').length;
  const waitingZames = zames.filter(z => z.status === 'PENDING' || z.status === 'CREATED').length;

  const activeBunkers = bunkers.filter(b => b.status === 'FILLING' || b.status === 'READY').length;
  const waitingBunkers = bunkers.filter(b => b.status === 'EMPTY').length;

  const activeBlocks = blocks.filter(b => b.status === 'IN_PROGRESS' || b.status === 'FORMING').length;
  const waitingBlocks = blocks.filter(b => b.status === 'PENDING').length;

  const activeDrying = drying.filter(d => d.status === 'IN_PROGRESS' || d.status === 'DRYING').length;
  const waitingDrying = drying.filter(d => d.status === 'PENDING').length;

  const allFB = finishedBlocks;
  const qcPending = allFB.filter(b => b.status === 'QC_PENDING').length;
  const qcFailed = allFB.filter(b => b.status === 'RECYCLE').length;

  const activeCNC = cncJobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'RUNNING').length;
  const waitingCNC = cncJobs.filter(j => j.status === 'PENDING' || j.status === 'QUEUED').length;
  const problemCNC = cncJobs.filter(j => j.status === 'PAUSED' || j.status === 'ERROR').length;

  const activeFinishing = finishingJobs.filter(j => j.status === 'IN_PROGRESS').length;
  const waitingFinishing = finishingJobs.filter(j => j.status === 'PENDING').length;

  const readyBlocks = allFB.filter(b => b.status === 'READY' || b.status === 'APPROVED').length;

  const activeDeliveries = deliveries.filter(d => d.status === 'SENT' || d.status === 'IN_TRANSIT').length;
  const waitingDeliveries = deliveries.filter(d => d.status === 'PENDING').length;

  // Critical stock items
  const criticalStocks = stocks.filter((s: any) => {
    const qty = s.quantity || s.remaining_quantity || 0;
    return qty < 500; // Less than 500 kg threshold
  });

  // Total today's blocks (produced today)
  const todayISO = new Date().toISOString().split('T')[0];
  const todayBlocks = allFB.filter(b => b.created_at?.startsWith(todayISO) || b.produced_date?.startsWith(todayISO)).length;

  // Brak %
  const totalAll = allFB.length;
  const brakCount = allFB.filter(b => b.status === 'RECYCLE' || b.status === 'REJECTED').length;
  const brakPct = totalAll > 0 ? parseFloat(((brakCount / totalAll) * 100).toFixed(1)) : 0;

  // Finance
  const todayRevenue = finance?.today_revenue || finance?.revenue_today || 0;
  const monthRevenue = finance?.month_revenue || finance?.revenue_month || 0;

  // Telemetry — find key tags
  const getTelTag = (names: string[]) => {
    if (!Array.isArray(telemetry)) return null;
    return telemetry.find((t: any) => names.some(n => (t.tag_name || t.name || '').toLowerCase().includes(n.toLowerCase())));
  };
  const tempTag = getTelTag(['chamber_temp', 'temperature', 'steam_temp']);
  const pressTag = getTelTag(['steam_pressure', 'pressure', 'boiler_pressure']);
  const tempVal = tempTag ? (tempTag.value ?? tempTag.current_value ?? '—') : '—';
  const pressVal = pressTag ? (pressTag.value ?? pressTag.current_value ?? '—') : '—';

  // ── Factory Flow stages ──
  const factoryFlow: FlowStage[] = [
    { id: 'raw_material', name: t('Xom Ashyo (Ombor)'), active: stocks.length, waiting: criticalStocks.length, problem: criticalStocks.length > 0 ? 1 : 0, icon: Warehouse, color: 'bg-slate-50 border-slate-200 text-slate-700', navTarget: 'warehouse-workspace' },
    { id: 'zames', name: t('Predvspenivatel (Zamas)'), active: activeZames, waiting: waitingZames, problem: 0, icon: Thermometer, color: 'bg-amber-50 border-amber-200 text-amber-800', navTarget: 'operator-workspace' },
    { id: 'bunker', name: t('Bunker (Matuiratsiya)'), active: activeBunkers, waiting: waitingBunkers, problem: 0, icon: Database, color: 'bg-orange-50 border-orange-200 text-orange-800', navTarget: 'operator-workspace' },
    { id: 'formovka', name: t('Formovka (Blok hosil)'), active: activeBlocks, waiting: waitingBlocks, problem: 0, icon: Box, color: 'bg-yellow-50 border-yellow-200 text-yellow-800', navTarget: 'operator-workspace' },
    { id: 'drying', name: t('Quritish'), active: activeDrying, waiting: waitingDrying, problem: 0, icon: Flame, color: 'bg-red-50 border-red-200 text-red-800', navTarget: 'operator-workspace' },
    { id: 'qc', name: t('Sifat Nazorati (QC)'), active: qcPending, waiting: 0, problem: qcFailed, icon: ShieldCheck, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', navTarget: 'qc-workspace' },
    { id: 'cnc', name: t('CNC Kesish'), active: activeCNC, waiting: waitingCNC, problem: problemCNC, icon: Scissors, color: 'bg-indigo-50 border-indigo-200 text-indigo-800', navTarget: 'cnc-workspace' },
    { id: 'finishing', name: t('Pardozlash'), active: activeFinishing, waiting: waitingFinishing, problem: 0, icon: Brush, color: 'bg-violet-50 border-violet-200 text-violet-800', navTarget: 'finishing' },
    { id: 'warehouse_out', name: t('Tayyor Mahsulot Ombor'), active: readyBlocks, waiting: 0, problem: 0, icon: Package, color: 'bg-teal-50 border-teal-200 text-teal-800', navTarget: 'warehouse-workspace' },
    { id: 'delivery', name: t('Yetkazib berish'), active: activeDeliveries, waiting: waitingDeliveries, problem: 0, icon: Truck, color: 'bg-sky-50 border-sky-200 text-sky-800', navTarget: 'logistics-workspace' },
  ];

  // ── Live Alerts (from real alerts API + derived critical events) ──
  const derivedAlerts: LiveAlert[] = [];
  if (criticalStocks.length > 0) {
    derivedAlerts.push({ id: 'crit-stock', level: 'critical', text: `${criticalStocks.length} ${t('ta xomashyo kritik darajada kam (< 500 kg)')}`, target: 'warehouse-workspace' });
  }
  if (problemCNC > 0) {
    derivedAlerts.push({ id: 'cnc-problem', level: 'warning', text: `CNC: ${problemCNC} ${t("ta stanok to'xtagan yoki xatolik")}`, target: 'cnc-workspace' });
  }
  if (qcFailed > 0) {
    derivedAlerts.push({ id: 'qc-failed', level: 'warning', text: `${qcFailed} ${t("ta blok QC dan o'tmadi — tekshirish kerak")}`, target: 'qc-workspace' });
  }
  if (brakPct > 5) {
    derivedAlerts.push({ id: 'brak-high', level: 'critical', text: `${t('Brak darajasi yuqori:')} ${brakPct}% (${t('limit 5%')})`, target: 'qc-workspace' });
  }

  // Real alerts from API
  const apiAlerts: LiveAlert[] = alerts.map((a: any) => ({
    id: a.id,
    level: (a.severity === 'CRITICAL' || a.level === 'critical') ? 'critical' as const :
           (a.severity === 'WARNING' || a.level === 'warning') ? 'warning' as const : 'info' as const,
    text: t(a.message || a.title || a.text_uz || a.description || 'Ogohlantirish'),
    target: a.target_module || undefined,
  }));

  const allAlerts = [...derivedAlerts, ...apiAlerts];
  const visibleAlerts = allAlerts.filter(a => !dismissedAlerts.has(a.id));

  // KPI cards
  const kpiCards = [
    { icon: Factory, label: "Bugun ishlab chiqarildi", value: todayBlocks, unit: t('blok'), color: 'bg-blue-50 text-blue-800', iconBg: 'bg-blue-100' },
    { icon: CheckCircle2, label: "Tayyor (omborda)", value: readyBlocks, unit: t('blok'), color: 'bg-emerald-50 text-emerald-800', iconBg: 'bg-emerald-100' },
    { icon: Scissors, label: "CNC da faol", value: activeCNC, unit: t('ish'), color: 'bg-indigo-50 text-indigo-800', iconBg: 'bg-indigo-100' },
    { icon: Truck, label: "Yetkazishda", value: activeDeliveries, unit: t('yetkazma'), color: 'bg-sky-50 text-sky-800', iconBg: 'bg-sky-100' },
    { icon: AlertTriangle, label: "Brak darajasi", value: brakPct, unit: '%', color: brakPct > 5 ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-700', iconBg: brakPct > 5 ? 'bg-rose-100' : 'bg-slate-100' },
    { icon: TrendingUp, label: "Bugungi daromad", value: todayRevenue ? Math.round(todayRevenue / 1000000) : '—', unit: todayRevenue ? t('M UZS') : '', color: 'bg-amber-50 text-amber-800', iconBg: 'bg-amber-100' },
  ];

  const ALERT_STYLES = {
    critical: { bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertOctagon, iconColor: 'text-rose-600', dot: 'bg-rose-500' },
    warning:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', dot: 'bg-amber-500' },
    info:     { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: Info,          iconColor: 'text-blue-600',  dot: 'bg-blue-500'  },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-16 bg-slate-50 min-h-screen -m-4 p-4 sm:-m-6 sm:p-6">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('Direktor Paneli')}</h1>
              <p className="text-xs text-slate-500 font-medium">{t('Zavod Holati')} — {t('Jonli monitoring')}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2 ml-[52px]">
            {dateStr} &nbsp;|&nbsp; {t('Smena')}: {isDay ? '08:00 – 20:00' : '20:00 – 08:00'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tempVal !== '—' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl">
              <Thermometer className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-[11px] font-black text-orange-700">{tempVal}°C</span>
            </div>
          )}
          {pressVal !== '—' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-black text-blue-700">{pressVal} bar</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t('Jonli')}</span>
          </div>
          <span className="text-sm font-black text-slate-400 tabular-nums">{timeStr}</span>
          <button onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {t('Yangilash')}
          </button>
        </div>
      </div>

      {/* ═══ KPI STRIP ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`${kpi.color} rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-70 leading-tight">{t(kpi.label)}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black leading-none">{kpi.value}</span>
              <span className="text-xs font-bold opacity-60">{kpi.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ LIVE FACTORY FLOW + ALERTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Factory Flow (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              {t('Ishlab Chiqarish Zanjiri')} — {factoryFlow.length} {t('bosqich')}
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />{t('Faol')}: {factoryFlow.reduce((s,f) => s+f.active, 0)}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />{t('Kutmoqda')}: {factoryFlow.reduce((s,f) => s+f.waiting, 0)}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full inline-block" />{t('Muammo')}: {factoryFlow.reduce((s,f) => s+f.problem, 0)}</span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {/* Row 1: stages 0-4 */}
            {[factoryFlow.slice(0, 5), factoryFlow.slice(5)].map((row, rowIdx) => (
              <div key={rowIdx}>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {row.map((stage, idx) => {
                    const Icon = stage.icon;
                    const hasProblem = stage.problem > 0;
                    return (
                      <React.Fragment key={stage.id}>
                        {idx > 0 && <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" />}
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onAction(stage.navTarget)}
                          className={`flex-1 min-w-[130px] rounded-xl border p-3 text-left transition-all hover:shadow-md ${hasProblem ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300 animate-pulse' : stage.color}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-[9px] font-black uppercase tracking-wide leading-tight">{stage.name}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div>
                              <p className="text-[8px] font-bold text-emerald-600 uppercase">{t('Faol')}</p>
                              <p className="text-base font-black text-emerald-700">{stage.active}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-amber-600 uppercase">{t('Kutish')}</p>
                              <p className="text-base font-black text-amber-700">{stage.waiting}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-rose-600 uppercase">{t('Muammo')}</p>
                              <p className={`text-base font-black text-rose-700 ${stage.problem > 0 ? 'animate-pulse' : ''}`}>{stage.problem}</p>
                            </div>
                          </div>
                        </motion.button>
                      </React.Fragment>
                    );
                  })}
                </div>
                {rowIdx === 0 && (
                  <div className="flex justify-start pl-2 py-1">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-3 bg-slate-300" />
                      <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
                      <div className="w-px h-3 bg-slate-300" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts (1/3) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t('Ogohlantirishlar')}
            </h3>
            <span className="text-[10px] font-black text-slate-400">{visibleAlerts.length} {t('ta')}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[440px]">
            <AnimatePresence>
              {visibleAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <ShieldCheck className="w-8 h-8 mb-2 text-emerald-400" />
                  <span className="text-xs font-bold">{t('Hamma narsa joyida!')}</span>
                </div>
              )}
              {visibleAlerts.map((alert) => {
                const s = ALERT_STYLES[alert.level];
                const AIcon = s.icon;
                return (
                  <motion.div key={alert.id} layout
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10, height: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <div className={`w-2 h-2 ${s.dot} rounded-full animate-pulse`} />
                      <AIcon className={`w-4 h-4 ${s.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{alert.text}</p>
                      {alert.target && (
                        <button onClick={() => onAction(alert.target!)}
                          className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline mt-1 flex items-center gap-0.5">
                          {t('Batafsil')} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <button onClick={() => setDismissedAlerts(prev => new Set(prev).add(alert.id))}
                      className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══ ANALYTICS BOTTOM ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Production bottleneck analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-500" /> {t('Bosqich yuklanishi')}
          </h3>
          <div className="space-y-3">
            {factoryFlow.map(stage => {
              const total = stage.active + stage.waiting + stage.problem;
              const pct = Math.min(total * 10, 100); // rough visual
              return (
                <div key={stage.id}>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span className="truncate">{stage.name}</span>
                    <span className="shrink-0 ml-2">{total} {t('ta')}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${stage.problem > 0 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QC & Quality snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t("Sifat Ko'rsatkichlari")}
          </h3>
          <div className="space-y-4">
            {[
              { label: t('Tayyor bloklar'), value: readyBlocks, total: totalAll, color: 'bg-emerald-500' },
              { label: t('QC kutmoqda'), value: qcPending, total: totalAll, color: 'bg-amber-400' },
              { label: t('QC rad etilgan'), value: qcFailed + brakCount, total: totalAll, color: 'bg-rose-500' },
            ].map(({ label, value, total: tot, color }) => {
              const pct = tot > 0 ? Math.round((value / tot) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>{label}</span>
                    <span className="font-black">{value} {t('ta')} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">{t('Umumiy brak %')}</span>
                <span className={`text-lg font-black ${brakPct > 5 ? 'text-rose-600' : 'text-emerald-600'}`}>{brakPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Finance snapshot */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-5">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> {t("Moliyaviy Ko'rsatkich")}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('Bugungi daromad')}</p>
              <p className="text-2xl font-black text-emerald-400">
                {todayRevenue ? `${Math.round(todayRevenue / 1000000).toLocaleString()} M` : '—'} <span className="text-sm text-slate-400">UZS</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('Oylik daromad')}</p>
              <p className="text-xl font-black text-slate-200">
                {monthRevenue ? `${Math.round(monthRevenue / 1000000).toLocaleString()} M` : '—'} <span className="text-sm text-slate-400">UZS</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('Yetkazishlar')}</p>
                <p className="text-lg font-black text-sky-400">{activeDeliveries}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('Kritik stok')}</p>
                <p className={`text-lg font-black ${criticalStocks.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{criticalStocks.length}</p>
              </div>
            </div>
          </div>
          <button onClick={() => onAction('profit-analytics')}
            className="w-full mt-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
            {t("To'liq moliyaviy hisobot")} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
