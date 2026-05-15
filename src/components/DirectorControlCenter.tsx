import React, { useState, useEffect } from 'react';
import {
  Factory, Scissors, Brush, Package, ShoppingCart, Truck,
  AlertTriangle, AlertOctagon, Info, ChevronRight, RefreshCw,
  TrendingUp, TrendingDown, Wallet, Clock, CheckCircle2,
  Users, ArrowRight, Activity, Zap, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useI18n } from '../i18n';

/* ═══════════════════════════════════════════════════════════════
   DIREKTOR MONITORING CENTER — TZ §15
   2 Qatlamli Arxitektura:
     Qatlam 1: Overview (6 karta + alertlar + buyurtmalar + moliya)
     Qatlam 2: Har karta → tegishli modul sahifasi (onAction)
   ═══════════════════════════════════════════════════════════════ */

interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  text: string;
  action: string;
  target: string;
}

interface ActiveOrder {
  id: string;
  customer: string;
  amount: string;
  stage: string;
  stageIcon: string;
  eta: string;
  warning?: boolean;
  overdue?: boolean;
}

const DEMO_ALERTS: Alert[] = [
  { id: 1, level: 'critical', text: 'Siro: 30L qoldi (min 50L)', action: 'PO yaratish', target: 'purchase-orders' },
  { id: 2, level: 'warning', text: 'CNC-2: 45 daqiqa to\'xtagan', action: 'Ko\'rish', target: 'production' },
  { id: 3, level: 'warning', text: 'Qarz muddati: Samarqand QB — 7 kun o\'tdi', action: 'Ko\'rish', target: 'debtors' },
];

const DEMO_ORDERS: ActiveOrder[] = [
  { id: 'INV-456', customer: 'Abdullayev QK', amount: '4.5M', stage: 'Yo\'lda', stageIcon: '🚗', eta: '16:30' },
  { id: 'INV-457', customer: 'Samarqand QB', amount: '12.8M', stage: 'CNC', stageIcon: '✂️', eta: 'Bugun!', warning: true },
  { id: 'INV-458', customer: 'Premium Build', amount: '7.2M', stage: 'Quritish', stageIcon: '⏱', eta: 'Ertaga' },
  { id: 'INV-459', customer: 'Yunusobod Co.', amount: '3.1M', stage: 'Tayyor', stageIcon: '📦', eta: 'Bugun' },
  { id: 'INV-460', customer: 'Fergana Insaat', amount: '8.9M', stage: 'Finishing', stageIcon: '🎨', eta: 'Ertaga', warning: true },
];

const ALERT_STYLES = {
  critical: { bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertOctagon, iconColor: 'text-rose-600', dot: 'bg-rose-500' },
  warning:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', dot: 'bg-amber-500' },
  info:     { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: Info,          iconColor: 'text-blue-600',  dot: 'bg-blue-500'  },
};

export default function DirectorControlCenter({ onAction }: { onAction: (id: string) => void }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);

  const now = new Date();
  const dateStr = now.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  const isDay = now.getHours() >= 8 && now.getHours() < 20;
  const shiftLabel = isDay ? 'Kunlik 08:00 – 20:00' : 'Tungi 20:00 – 08:00';

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

  const dismissAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));

  /* ── 6 ETAP KARTALARI (TZ §15.5) ── */
  const etapCards = [
    {
      id: 'production', icon: Factory, label: t('Ishlab Chiqarish'), color: 'blue',
      stats: [
        { key: 'Bugun', val: `${data?.production_status?.today_count || 82} m³` },
        { key: t('Target'), val: '140 m³' },
      ],
      progress: Math.round(((data?.production_status?.today_count || 82) / 140) * 100),
      badges: [
        { text: 'ST-1 ●', color: 'text-emerald-600' },
        { text: 'ST-2 ●', color: 'text-emerald-600' },
        { text: `Brak: ${data?.production_status?.defect_rate || '2.3'}%`, color: 'text-slate-500' },
      ],
    },
    {
      id: 'production', icon: Scissors, label: t('CNC Sexi'), color: 'indigo',
      stats: [
        { key: 'Bugun', val: '72 dona' },
        { key: 'Chiqindi', val: '17.2%' },
      ],
      progress: 65,
      badges: [
        { text: 'CNC-1: ● 70%', color: 'text-emerald-600' },
        { text: t('CNC-2: ⚠ OFF'), color: 'text-amber-600' },
      ],
    },
    {
      id: 'production', icon: Brush, label: t('Finishing'), color: 'violet',
      stats: [
        { key: 'Tayyor', val: '42 dona' },
        { key: 'Armirlash', val: '12/20 🔄' },
      ],
      progress: 60,
      badges: [
        { text: 'Quritish: 2 ta (⏱ 4s qol)', color: 'text-amber-600' },
      ],
    },
    {
      id: 'warehouse', icon: Package, label: t('Ombor'), color: 'emerald',
      stats: [
        { key: 'SK-2', val: '240 blok' },
        { key: 'SK-4', val: '340 dona' },
      ],
      progress: 78,
      badges: [
        { text: 'EPS: ✅', color: 'text-emerald-600' },
        { text: 'Siro: ⚠ KAM', color: 'text-amber-600' },
      ],
    },
    {
      id: 'sales', icon: ShoppingCart, label: t('Sotuv'), color: 'sky',
      stats: [
        { key: 'Bugun', val: `${data?.finance_status?.today_revenue || '8,450,000'} UZS` },
        { key: 'Buyurtmalar', val: '6 ta' },
      ],
      progress: 72,
      badges: [
        { text: `Qarzlar: ${data?.finance_status?.total_debt || '87M'} (12 mijoz)`, color: 'text-rose-500' },
      ],
    },
    {
      id: 'logistics', icon: Truck, label: t('Logistika'), color: 'amber',
      stats: [
        { key: 'Bugun', val: '7 yetkazish' },
        { key: 'Yetkazildi', val: '3 ✅' },
      ],
      progress: 43,
      badges: [
        { text: 'Yo\'lda: 2', color: 'text-blue-600' },
        { text: 'Ergashev ● Qodirov ●', color: 'text-emerald-600' },
      ],
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; progressBg: string }> = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    progressBg: 'bg-blue-500'    },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100',  progressBg: 'bg-indigo-500'  },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100',  progressBg: 'bg-violet-500'  },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', progressBg: 'bg-emerald-500' },
    sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-100',     progressBg: 'bg-sky-500'     },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   progressBg: 'bg-amber-500'   },
  };

  if (loading && !data) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-16">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('PENAPLAS Direktor Paneli')}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{dateStr} &nbsp;|&nbsp; {t('Smena')}: {shiftLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-400">{timeStr}</span>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t('Yangilash')}
          </button>
        </div>
      </div>

      {/* ═══ OGOHLANTIRISHLAR (TZ §15.4) — faqat muammo bo'lganda ═══ */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {alerts.map((alert) => {
              const s = ALERT_STYLES[alert.level];
              const AIcon = s.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${s.bg} ${s.border}`}
                >
                  <div className={`w-2 h-2 ${s.dot} rounded-full animate-pulse shrink-0`} />
                  <AIcon className={`w-5 h-5 ${s.iconColor} shrink-0`} />
                  <span className="text-sm font-bold text-slate-800 flex-1">{alert.text}</span>
                  <button
                    onClick={() => onAction(alert.target)}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    {alert.action} <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => dismissAlert(alert.id)} className="text-slate-300 hover:text-slate-500 text-lg leading-none">&times;</button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 6 TA ETAP KARTA (TZ §15.5) ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {etapCards.map((card) => {
          const c = colorMap[card.color];
          return (
            <motion.button
              key={card.label}
              onClick={() => onAction(card.id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${c.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                {/* Icon + Title + Arrow */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${c.bg} ${c.text} rounded-xl flex items-center justify-center`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{card.label}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {card.stats.map((s) => (
                    <div key={s.key}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.key}</p>
                      <p className="text-lg font-black text-slate-900 leading-tight">{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Progress')}</span>
                    <span className="text-[10px] font-black text-slate-600">{card.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${c.progressBg} rounded-full`}
                    />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {card.badges.map((b, i) => (
                    <span key={i} className={`text-[10px] font-bold ${b.color}`}>{b.text}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ═══ AKTIV BUYURTMALAR (TZ §15.6) + MOLIYA (TZ §15.3) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AKTIV BUYURTMALAR */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> {t('Aktiv Buyurtmalar')}
            </h3>
            <button onClick={() => onAction('sales')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
              {t('Barchasi')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Buyurtma</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mijoz</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Summa</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Joriy etap</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {DEMO_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => onAction('sales')}>
                    <td className="px-6 py-3">
                      <span className="text-sm font-black text-blue-600 group-hover:underline">{order.id}</span>
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-slate-700">{order.customer}</td>
                    <td className="px-6 py-3 text-sm font-black text-slate-900 text-right">{order.amount}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide ${
                        order.warning ? 'bg-amber-50 text-amber-700' : order.overdue ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {order.stageIcon} {order.stage} {order.warning && '⚠'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-xs font-bold text-slate-500">{order.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOLIYA UMUMIY */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" /> {t('Moliya Umumiy')}
          </h3>
          {[
            { label: t('Bugun kirim'), val: data?.finance_status?.today_revenue || '12,450,000', unit: 'UZS', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: t('Bugun chiqim'), val: data?.finance_status?.today_expenses || '4,200,000', unit: 'UZS', icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: t('Bu oy foyda'), val: data?.finance_status?.monthly_profit || '84,500,000', unit: 'UZS', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: t('Kassa qoldig\'i'), val: data?.finance_status?.cash_balance || '145,200,000', unit: 'UZS', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50">
              <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-black text-slate-900 truncate">{item.val} <span className="text-[10px] text-slate-400 font-bold">{item.unit}</span></p>
              </div>
            </div>
          ))}
          <button
            onClick={() => onAction('finance')}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {t('Batafsil')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══ TASDIQLASH MARKAZI (TZ §15.10) ═══ */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-amber-500" /> {t('Tasdiqlash Kutmoqda')}
        </h3>
        <div className="space-y-3">
          {[
            { id: 'PO-00089', desc: 'Siro 200L — 14,500,000 UZS', from: 'Kimyoland', by: 'Ergashev B.' },
            { id: 'TRN-00456', desc: 'Asbob ta\'miri — 8,200,000 UZS', from: '', by: 'Yusupov B.' },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900">{item.id}: {item.desc}</p>
                <p className="text-[10px] text-slate-500 font-bold">{item.from ? `Yetkazuvchi: ${item.from} | ` : ''}So'ragan: {item.by}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('Tasdiqlash')}
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">
                  {t('Rad')}
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
