import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, X, CheckCircle2, FileText, Search, Users, Clock,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { User } from '../types';

interface PayrollProps {
  user: User;
}

const MONTHS = [
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-04', label: 'Aprel 2026' },
  { value: '2026-03', label: 'Mart 2026' },
];

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'PAID', label: "To'langan" },
  { value: 'PENDING', label: 'Kutilmoqda' },
];

const statusColors: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  PARTIAL: 'bg-blue-50 text-blue-600 border-blue-100',
};

const statusLabels: Record<string, string> = {
  PAID: "To'langan",
  PENDING: 'Kutilmoqda',
  PARTIAL: 'Qisman',
};

export default function Payroll({ user }: PayrollProps) {
  const { t } = useI18n();
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmPay, setConfirmPay] = useState<any | null>(null);
  const [confirmPayAll, setConfirmPayAll] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('payroll/');
      setPayroll(res.data || []);
    } catch {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async () => {
    if (!confirmPay) return;
    setPaying(true);
    try {
      await api.post(`payroll/${confirmPay.id}/pay/`, {});
      setPayroll(prev => prev.map(p => p.id === confirmPay.id ? { ...p, status: 'PAID' } : p));
      uiStore.showNotification(t(`${confirmPay.name} ga maosh to'landi`), 'success');
      setConfirmPay(null);
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    } finally {
      setPaying(false);
    }
  };

  const handlePayAll = async () => {
    setPaying(true);
    try {
      const pendingRows = monthData.filter(p => p.status !== 'PAID');
      setPayroll(prev => prev.map(p =>
        pendingRows.find(r => r.id === p.id) ? { ...p, status: 'PAID' } : p
      ));
      uiStore.showNotification(t(`${pendingRows.length} ta xodimga maosh to'landi`), 'success');
      setConfirmPayAll(false);
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    } finally {
      setPaying(false);
    }
  };

  const monthData = payroll.filter(p => p.month === selectedMonth);
  const filteredData = monthData
    .filter(p => statusFilter === 'ALL' || p.status === statusFilter)
    .filter(p => !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalFund = monthData.reduce((s, p) => s + (p.total || 0), 0);
  const paid = monthData.filter(p => p.status === 'PAID').reduce((s, p) => s + (p.total || 0), 0);
  const pending = monthData.filter(p => p.status !== 'PAID').reduce((s, p) => s + (p.total || 0), 0);
  const pendingCount = monthData.filter(p => p.status !== 'PAID').length;

  const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU') + ' UZS';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-100">
              <Wallet className="w-8 h-8" />
            </div>
            {t('Ish Haqi')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Oylik maosh va bonus boshqaruvi')}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Month pills */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
            {MONTHS.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedMonth === m.value ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t(m.label)}
              </button>
            ))}
          </div>

          {pendingCount > 0 && (
            <button
              onClick={() => setConfirmPayAll(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('Hammasini To\'la')} ({pendingCount})
            </button>
          )}
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-3 font-black text-[11px] uppercase tracking-widest text-slate-600 hover:border-violet-200 hover:text-violet-600 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            {t('Hisobot')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t('Jami Maosh Fondi'),
            value: fmt(totalFund),
            icon: Wallet,
            bg: 'bg-slate-900',
            textColor: 'text-white',
            labelColor: 'text-slate-400',
            iconBg: 'bg-white/10',
            iconColor: 'text-white',
          },
          {
            label: t("To'langan"),
            value: fmt(paid),
            icon: CheckCircle2,
            bg: 'bg-white',
            textColor: 'text-emerald-600',
            labelColor: 'text-slate-400',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
          },
          {
            label: t('Kutilmoqda'),
            value: fmt(pending),
            icon: Clock,
            bg: 'bg-white',
            textColor: 'text-amber-600',
            labelColor: 'text-slate-400',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
          },
          {
            label: t('Xodimlar soni'),
            value: t(`${monthData.length} ta xodim`),
            icon: Users,
            bg: 'bg-white',
            textColor: 'text-violet-600',
            labelColor: 'text-slate-400',
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-500',
          },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 ${stat.bg}`}>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${stat.labelColor}`}>{stat.label}</p>
              <p className={`font-black text-sm mt-0.5 ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('Xodim qidirish...')}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-violet-300 transition-all font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Status filter pills */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === f.value ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-[24px]" />)}
        </div>
      )}

      {/* Payroll Table */}
      {!loading && (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  {[t('Xodim'), t('Lavozim'), t('Asosiy maosh'), t('Bonus'), t('Ushlama'), t('Jami'), t('Holat'), t('Amal')].map(h => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(filteredData || []).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center font-black text-sm group-hover:bg-violet-600 group-hover:text-white transition-all">
                          {p.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-black text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{p.position}</td>
                    <td className="px-6 py-5 text-sm font-black text-slate-700">{(p.base_salary || 0).toLocaleString('ru-RU')} UZS</td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-black ${(p.bonus || 0) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {(p.bonus || 0) > 0 ? `+${(p.bonus).toLocaleString('ru-RU')}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-black ${(p.deduction || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {(p.deduction || 0) > 0 ? `-${(p.deduction).toLocaleString('ru-RU')}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-black text-slate-900">{(p.total || 0).toLocaleString('ru-RU')} UZS</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${statusColors[p.status] || statusColors.PENDING}`}>
                        {t(statusLabels[p.status] || p.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {p.status !== 'PAID' ? (
                        <button
                          onClick={() => setConfirmPay(p)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 rounded-xl text-[10px] font-black text-violet-600 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("To'lash")}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("To'langan")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                      {t("Ma'lumot topilmadi")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Single Pay Modal */}
      <AnimatePresence>
        {confirmPay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{t("Maosh to'lash")}</h3>
                <p className="text-slate-500 font-bold mb-1">{confirmPay.name}</p>
                <p className="text-3xl font-black text-violet-600 mb-2">{(confirmPay.total || 0).toLocaleString('ru-RU')} UZS</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                  {t(MONTHS.find(m => m.value === selectedMonth)?.label || '')}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setConfirmPay(null)}
                    className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {t('Bekor qilish')}
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all disabled:opacity-50"
                  >
                    {paying ? t("To'lanmoqda...") : t("Tasdiqlash")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Pay All Modal */}
      <AnimatePresence>
        {confirmPayAll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{t("Barchasiga to'lash")}</h3>
                <p className="text-slate-500 font-bold mb-1">{t(`${pendingCount} ta xodim`)}</p>
                <p className="text-3xl font-black text-slate-900 mb-2">{pending.toLocaleString('ru-RU')} UZS</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                  {t(MONTHS.find(m => m.value === selectedMonth)?.label || '')}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setConfirmPayAll(false)}
                    className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {t('Bekor qilish')}
                  </button>
                  <button
                    onClick={handlePayAll}
                    disabled={paying}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50"
                  >
                    {paying ? t("To'lanmoqda...") : t("Hammasini tasdiqlash")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monthly Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{t('Oylik Hisobot')}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{MONTHS.find(m => m.value === selectedMonth)?.label}</p>
                  </div>
                </div>
                <button onClick={() => setIsReportOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-3">
                {[
                  { label: t('Jami xodimlar'), value: t(`${monthData.length} ta xodim`) },
                  { label: t("To'langan xodimlar"), value: t(`${monthData.filter(p => p.status === 'PAID').length} ta xodim`) },
                  { label: t('Kutilmoqda'), value: t(`${pendingCount} ta xodim`) },
                  { label: t('Jami Asosiy Maosh'), value: monthData.reduce((s, p) => s + (p.base_salary || 0), 0).toLocaleString('ru-RU') + ' UZS' },
                  { label: t('Jami Bonuslar'), value: '+' + monthData.reduce((s, p) => s + (p.bonus || 0), 0).toLocaleString('ru-RU') + ' UZS' },
                  { label: t('Jami Ushlamalar'), value: '-' + monthData.reduce((s, p) => s + (p.deduction || 0), 0).toLocaleString('ru-RU') + ' UZS' },
                  { label: t('Umumiy Maosh Fondi'), value: totalFund.toLocaleString('ru-RU') + ' UZS', bold: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                    <span className={`font-black text-slate-900 ${row.bold ? 'text-lg text-violet-600' : 'text-sm'}`}>{row.value}</span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const rows = [
                      [t('Xodim'), t('Lavozim'), t('Asosiy maosh'), t('Bonus'), t('Ushlamalar'), t('Jami'), t('Status')],
                      ...monthData.map(p => [
                        p.name || '',
                        p.position || '',
                        String(p.base_salary || 0),
                        String(p.bonus || 0),
                        String(p.deduction || 0),
                        String(p.total || 0),
                        t(statusLabels[p.status] || p.status),
                      ]),
                    ];
                    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `maosh-${selectedMonth}.csv`; a.click();
                    URL.revokeObjectURL(url);
                    uiStore.showNotification(t('Hisobot yuklandi'), 'success');
                    setIsReportOpen(false);
                  }}
                  className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  {t('PDF Yuklab Olish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
