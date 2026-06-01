import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory, Scissors, Brush, Package, Truck,
  AlertTriangle, AlertOctagon, Info, RefreshCw,
  Activity, Thermometer, Droplets, Gauge, Box,
  Zap, TrendingUp, ChevronRight, X, ArrowRight,
  Flame, BarChart3, ShieldCheck, Warehouse, Layers,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useI18n } from '../i18n';

/* ═══════════════════════════════════════════════════════════════
   LIVE FACTORY — DIREKTOR NAZORAT MARKAZI
   Industrial Dashboard: KPI Strip + Factory Flow + Alerts + Charts
   ═══════════════════════════════════════════════════════════════ */

interface FlowStage {
  id: string;
  name: string;
  name_ru: string;
  active: number;
  waiting: number;
  problem: number;
}

interface LiveAlert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  text_uz: string;
  text_ru: string;
  target?: string;
}

/* ── FLOW STAGE ICONS ── */
const STAGE_ICONS: Record<string, React.ElementType> = {
  'raw_material': Warehouse,
  'zames': Thermometer,
  'bunker': Box,
  'formovka': Layers,
  'cooling': Droplets,
  'qc': ShieldCheck,
  'cnc': Scissors,
  'finishing': Brush,
  'drying': Flame,
  'warehouse': Package,
  'delivery': Truck,
};

const STAGE_COLORS: string[] = [
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-yellow-50 text-yellow-700 border-yellow-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-sky-50 text-sky-700 border-sky-200',
];

export default function DirectorControlCenter({ onAction }: { onAction: (id: string) => void }) {
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const now = new Date();
  const dateStr = now.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
    hour: '2-digit', minute: '2-digit',
  });
  const isDay = now.getHours() >= 8 && now.getHours() < 20;
  const shiftLabel = isDay ? t('Kunlik 08:00 – 20:00') : t('Tungi 20:00 – 08:00');

  /* ── DATA FETCH ── */
  const fetchData = async () => {
    try {
      const res = await api.get('dashboard/summary/');
      setData(res.data);
    } catch { /* fallback to demo */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── DEMO FACTORY FLOW ── */
  const DEMO_FLOW: FlowStage[] = useMemo(() => [
    { id: 'raw_material', name: 'Xom Ashyo', name_ru: 'Сырьё', active: 3, waiting: 1, problem: 0 },
    { id: 'zames', name: 'Zames', name_ru: 'Замес', active: 2, waiting: 4, problem: 0 },
    { id: 'bunker', name: 'Bunker', name_ru: 'Бункер', active: 6, waiting: 2, problem: 0 },
    { id: 'formovka', name: 'Formovka', name_ru: 'Формовка', active: 4, waiting: 3, problem: 1 },
    { id: 'cooling', name: 'Sovutish', name_ru: 'Охлаждение', active: 8, waiting: 0, problem: 0 },
    { id: 'qc', name: 'Sifat Nazorati', name_ru: 'Контроль качества', active: 2, waiting: 5, problem: 0 },
    { id: 'cnc', name: 'CNC', name_ru: 'ЧПУ Резка', active: 3, waiting: 2, problem: 1 },
    { id: 'finishing', name: 'Pardozlash', name_ru: 'Отделка', active: 2, waiting: 1, problem: 0 },
    { id: 'drying', name: 'Quritish', name_ru: 'Сушка', active: 5, waiting: 3, problem: 0 },
    { id: 'warehouse', name: 'Ombor', name_ru: 'Склад', active: 12, waiting: 0, problem: 0 },
    { id: 'delivery', name: 'Yetkazish', name_ru: 'Доставка', active: 4, waiting: 2, problem: 0 },
  ], []);

  const factoryFlow: FlowStage[] = data?.factory_flow || DEMO_FLOW;

  /* ── DEMO ALERTS ── */
  const DEMO_ALERTS: LiveAlert[] = useMemo(() => [
    { id: 1, level: 'critical', text_uz: 'Siro: 30L qoldi (min 50L)', text_ru: 'Сиро: осталось 30Л (мин 50Л)', target: 'purchase-orders' },
    { id: 2, level: 'warning', text_uz: "CNC-2: 45 daqiqa to'xtagan", text_ru: 'CNC-2: простой 45 минут', target: 'production' },
    { id: 3, level: 'warning', text_uz: "Qarz muddati: Samarqand QB — 7 kun o'tdi", text_ru: 'Срок долга: Самарканд QB — 7 дней просрочки', target: 'debtors' },
    { id: 4, level: 'info', text_uz: "Bunker №3 yetilish vaqti tugadi", text_ru: 'Бункер №3 — созревание завершено', target: 'production' },
    { id: 5, level: 'critical', text_uz: "Formovka: harorat 95°C dan oshdi", text_ru: 'Формовка: температура выше 95°C', target: 'production' },
    { id: 6, level: 'info', text_uz: "Ombor SK-4: 85% band", text_ru: 'Склад СК-4: 85% занято', target: 'warehouse' },
  ], []);

  const liveAlerts: LiveAlert[] = data?.live_alerts || DEMO_ALERTS;
  const visibleAlerts = liveAlerts.filter(a => !dismissedAlerts.has(a.id));

  const dismissAlert = (id: number) => {
    setDismissedAlerts(prev => new Set(prev).add(id));
  };

  const ALERT_STYLES = {
    critical: { bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertOctagon, iconColor: 'text-rose-600', dot: 'bg-rose-500' },
    warning:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', dot: 'bg-amber-500' },
    info:     { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: Info,          iconColor: 'text-blue-600',  dot: 'bg-blue-500'  },
  };

  /* ── KPI DATA ── */
  const todayCount = data?.production_status?.today_count || 0;
  const cuttingCount = data?.production_status?.cutting_count || 0;
  const dryingCount = data?.production_status?.drying_count || 32;
  const deliveryCount = data?.delivery_status?.active_count || 6;
  const defectRate = data?.production_status?.defect_rate || 2.1;
  const todayProfit = data?.finance_status?.today_revenue || '18,450,000';

  const kpiCards = [
    {
      icon: Factory,
      label: t('Ishlab chiqarildi'),
      value: `${todayCount}`,
      unit: t('ta blok'),
      color: 'bg-blue-50 text-blue-700',
      iconBg: 'bg-blue-100',
    },
    {
      icon: Scissors,
      label: t('CNC da'),
      value: `${cuttingCount}`,
      unit: t('ta'),
      color: 'bg-indigo-50 text-indigo-700',
      iconBg: 'bg-indigo-100',
    },
    {
      icon: Flame,
      label: t('Quritishda'),
      value: `${dryingCount}`,
      unit: t('ta'),
      color: 'bg-orange-50 text-orange-700',
      iconBg: 'bg-orange-100',
    },
    {
      icon: Truck,
      label: t('Logistikada'),
      value: `${deliveryCount}`,
      unit: t('ta'),
      color: 'bg-sky-50 text-sky-700',
      iconBg: 'bg-sky-100',
    },
    {
      icon: AlertTriangle,
      label: t('Brak'),
      value: `${defectRate}`,
      unit: '%',
      color: defectRate > 3 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
      iconBg: defectRate > 3 ? 'bg-rose-100' : 'bg-emerald-100',
    },
    {
      icon: TrendingUp,
      label: t('Bugungi foyda'),
      value: typeof todayProfit === 'number' ? todayProfit.toLocaleString() : todayProfit,
      unit: 'UZS',
      color: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-100',
    },
  ];

  /* ── CHARTS DATA ── */
  const hourlyProduction = data?.hourly_production || [
    { hour: '08', val: 12 }, { hour: '09', val: 18 }, { hour: '10', val: 22 },
    { hour: '11', val: 15 }, { hour: '12', val: 8 }, { hour: '13', val: 20 },
    { hour: '14', val: 24 }, { hour: '15', val: 19 },
  ];
  const maxHourly = Math.max(...hourlyProduction.map((h: any) => h.val), 1);

  const resourceCharts = [
    { label: t('Gaz sarfi'), value: data?.gas_usage || 72, max: 100, unit: '%', color: 'bg-amber-500' },
    { label: t('Elektr sarfi'), value: data?.electricity_usage || 65, max: 100, unit: '%', color: 'bg-blue-500' },
    { label: t('Brak tendensiyasi'), value: defectRate, max: 10, unit: '%', color: defectRate > 3 ? 'bg-rose-500' : 'bg-emerald-500' },
    { label: t('Ombor band'), value: data?.warehouse_occupancy || 78, max: 100, unit: '%', color: 'bg-teal-500' },
  ];

  /* ── LOADING ── */
  if (loading && !data) return (
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
            {dateStr} &nbsp;|&nbsp; {t('Smena')}: {shiftLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t('Tizim barqaror ishlamoqda')}</span>
          </div>
          <span className="text-sm font-black text-slate-400 tabular-nums">{timeStr}</span>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t('Yangilash')}
          </button>
        </div>
      </div>

      {/* ═══ SECTION 1: KPI STRIP ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${kpi.color} rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-70 leading-tight">{kpi.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black leading-none">{kpi.value}</span>
              <span className="text-xs font-bold opacity-60">{kpi.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ SECTION 2 + 3: FACTORY FLOW + ALERTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── FACTORY FLOW (2/3 width) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              {t('Ishlab Chiqarish Zanjiri')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">
                {factoryFlow.length} {t('bosqich')}
              </span>
            </div>
          </div>

          <div className="p-5">
            {/* Flow Grid - 2 rows: 6 top, 5 bottom */}
            <div className="space-y-3">
              {/* Row 1: stages 1-6 */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {factoryFlow.slice(0, 6).map((stage, idx) => {
                  const Icon = STAGE_ICONS[stage.id] || Box;
                  const colorClass = STAGE_COLORS[idx % STAGE_COLORS.length];
                  const hasProblem = stage.problem > 0;
                  return (
                    <React.Fragment key={stage.id}>
                      {idx > 0 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" />
                      )}
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onAction(stage.id === 'raw_material' ? 'warehouse' : stage.id === 'delivery' ? 'logistics' : stage.id === 'qc' ? 'quality' : stage.id === 'warehouse' ? 'warehouse' : 'production')}
                        className={`flex-1 min-w-[120px] rounded-xl border p-3 text-left transition-all hover:shadow-md ${hasProblem ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200' : colorClass}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wide leading-tight truncate">
                            {language === 'ru' ? stage.name_ru : stage.name}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">{t('Faol')}</span>
                            <span className="text-sm font-black text-emerald-700">{stage.active}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-amber-600 uppercase">{t('Kutmoqda')}</span>
                            <span className="text-sm font-black text-amber-700">{stage.waiting}</span>
                          </div>
                          {stage.problem > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-rose-600 uppercase">{t('Muammo')}</span>
                              <span className="text-sm font-black text-rose-700 animate-pulse">{stage.problem}</span>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Connector arrows down */}
              <div className="flex justify-center">
                <div className="flex items-center gap-1 text-slate-300">
                  <div className="w-px h-3 bg-slate-300" />
                  <ArrowRight className="w-4 h-4 rotate-90" />
                  <div className="w-px h-3 bg-slate-300" />
                </div>
              </div>

              {/* Row 2: stages 7-11 */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {factoryFlow.slice(6).map((stage, idx) => {
                  const Icon = STAGE_ICONS[stage.id] || Box;
                  const colorClass = STAGE_COLORS[(idx + 6) % STAGE_COLORS.length];
                  const hasProblem = stage.problem > 0;
                  return (
                    <React.Fragment key={stage.id}>
                      {idx > 0 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" />
                      )}
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onAction(stage.id === 'raw_material' ? 'warehouse' : stage.id === 'delivery' ? 'logistics' : stage.id === 'qc' ? 'quality' : stage.id === 'warehouse' ? 'warehouse' : 'production')}
                        className={`flex-1 min-w-[120px] rounded-xl border p-3 text-left transition-all hover:shadow-md ${hasProblem ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200' : colorClass}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wide leading-tight truncate">
                            {language === 'ru' ? stage.name_ru : stage.name}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">{t('Faol')}</span>
                            <span className="text-sm font-black text-emerald-700">{stage.active}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-amber-600 uppercase">{t('Kutmoqda')}</span>
                            <span className="text-sm font-black text-amber-700">{stage.waiting}</span>
                          </div>
                          {stage.problem > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-rose-600 uppercase">{t('Muammo')}</span>
                              <span className="text-sm font-black text-rose-700 animate-pulse">{stage.problem}</span>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Flow summary */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-slate-500">{t('Faol')}: {factoryFlow.reduce((s, f) => s + f.active, 0)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span className="text-slate-500">{t('Kutmoqda')}: {factoryFlow.reduce((s, f) => s + f.waiting, 0)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span className="text-slate-500">{t('Muammo')}: {factoryFlow.reduce((s, f) => s + f.problem, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LIVE ALERTS (1/3 width) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t('Ogohlantirish')}
            </h3>
            <span className="text-[10px] font-black text-slate-400">{visibleAlerts.length} {t('ta')}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[400px]">
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
                const alertText = language === 'ru' ? alert.text_ru : alert.text_uz;
                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10, height: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}
                  >
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <div className={`w-2 h-2 ${s.dot} rounded-full animate-pulse`} />
                      <AIcon className={`w-4 h-4 ${s.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{alertText}</p>
                      {alert.target && (
                        <button
                          onClick={() => onAction(alert.target!)}
                          className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline mt-1 flex items-center gap-0.5"
                        >
                          {t('Batafsil')} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 4: CHARTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Hourly Production Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              {t('Soatlik ishlab chiqarish')}
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{t('Bugun')}</span>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-2 h-32">
              {hourlyProduction.map((h: any, i: number) => {
                const pct = (h.val / maxHourly) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-slate-600">{h.val}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="w-full bg-blue-500 rounded-t-md min-h-[4px]"
                      style={{ maxHeight: '100%' }}
                    />
                    <span className="text-[9px] font-bold text-slate-400">{h.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resource Usage Charts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-500" />
              {t('Resurs sarfi')}
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{t('Jonli monitoring')}</span>
          </div>
          <div className="p-5 space-y-4">
            {resourceCharts.map((chart) => {
              const pct = Math.min(Math.round((chart.value / chart.max) * 100), 100);
              return (
                <div key={chart.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{chart.label}</span>
                    <span className="text-sm font-black text-slate-900">{chart.value}{chart.unit}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${chart.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
