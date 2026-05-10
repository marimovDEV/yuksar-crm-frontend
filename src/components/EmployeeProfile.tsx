import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Phone, Mail, User as UserIcon, Briefcase, Calendar,
  TrendingUp, Award, Clock, CheckCircle2, AlertCircle, Activity,
  BarChart2, DollarSign, Package
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';

interface EmployeeProfileProps {
  employeeId: number;
  onBack: () => void;
}

type Tab = 'general' | 'activity' | 'salary' | 'kpi';

const TAB_IDS: Tab[] = ['general', 'activity', 'salary', 'kpi'];

function generateAttendance(days: number, presentRate: number) {
  const result: { day: number; status: 'present' | 'absent' | 'half' | 'weekend' }[] = [];
  for (let i = days; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) {
      result.push({ day: i, status: 'weekend' });
    } else {
      const r = Math.random();
      if (r < presentRate) result.push({ day: i, status: 'present' });
      else if (r < presentRate + 0.05) result.push({ day: i, status: 'half' });
      else result.push({ day: i, status: 'absent' });
    }
  }
  return result;
}

export default function EmployeeProfile({ employeeId, onBack }: EmployeeProfileProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [employee, setEmployee] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const attendance = generateAttendance(30, 0.92);

  useEffect(() => {
    fetchAll();
  }, [employeeId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, payrollRes, kpiRes] = await Promise.all([
        api.get('users/'),
        api.get('audit-logs/'),
        api.get('payroll/'),
        api.get(`users/${employeeId}/kpi/`).catch(() => ({ data: null })),
      ]);
      const users = usersRes.data.results || usersRes.data || [];
      const emp = users.find((u: any) => u.id === employeeId);
      setEmployee(emp || null);

      const logs = logsRes.data.results || logsRes.data || [];
      setAuditLogs(logs.filter((l: any) => l.user === employeeId || l.user_id === employeeId || l.userName === emp?.full_name).slice(0, 8));

      const allPayroll = payrollRes.data.results || payrollRes.data || [];
      setPayrollData(allPayroll.filter((p: any) => p.user_id === employeeId));

      setKpiData(kpiRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU') + ' UZS';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-10">
        <div className="h-10 w-40 bg-slate-100 rounded-2xl" />
        <div className="h-40 bg-slate-100 rounded-[48px]" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-[32px]" />)}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-black text-[11px] uppercase tracking-widest transition-all">
          <ArrowLeft className="w-4 h-4" /> {t('Ortga')}
        </button>
        <p className="text-slate-400 font-bold">{t('Xodim topilmadi')}</p>
      </div>
    );
  }

  const currentPayroll = payrollData.find(p => p.month === '2026-05') || payrollData[0];
  const daysPresent = attendance.filter(a => a.status === 'present').length;
  const daysExpected = attendance.filter(a => a.status !== 'weekend').length;
  const attendancePct = daysExpected > 0 ? Math.round((daysPresent / daysExpected) * 100) : 0;

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    BLOCKED: 'bg-rose-50 text-rose-600 border-rose-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  const statusLabelKeys: Record<string, string> = {
    ACTIVE: 'Faol',
    BLOCKED: 'Bloklangan',
    PENDING: 'Kutilmoqda',
  };

  const role = employee.effective_role || employee.role_display || employee.role || '';

  function renderKPI() {
    if (!kpiData) {
      return (
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium text-center text-slate-400 font-bold py-20">
          {t('KPI ma\'lumotlari mavjud emas')}
        </div>
      );
    }

    let kpiItems: { label: string; value: string | number; target?: string; pct?: number; color?: string }[] = [];

    if (role.includes('Ishlab chiqarish ustasi')) {
      kpiItems = [
        { label: t('Ishlab chiqarish (dona/smena)'), value: kpiData.production_per_smena || kpiData.tasks_done || 0, target: t('50 dona'), pct: Math.min(100, Math.round(((kpiData.production_per_smena || kpiData.tasks_done || 0) / 50) * 100)), color: 'bg-blue-500' },
        { label: t('Brak foizi'), value: `${kpiData.brak_pct || 0}%`, target: '<3%', pct: Math.max(0, 100 - Math.round(((kpiData.brak_pct || 0) / 3) * 100)), color: 'bg-emerald-500' },
        { label: t('Smena punktuallik'), value: `${kpiData.smena_punctuality || 0}%`, target: '100%', pct: kpiData.smena_punctuality || 0, color: 'bg-indigo-500' },
      ];
    } else if (role.includes('CNC operatori')) {
      kpiItems = [
        { label: t('CNC ishlari'), value: kpiData.cnc_jobs_done || 0, target: '25', pct: Math.min(100, Math.round(((kpiData.cnc_jobs_done || 0) / 25) * 100)), color: 'bg-blue-500' },
        { label: t('Ishlangan soat'), value: `${kpiData.hours_worked || 0} ${t('soat')}`, target: `176 ${t('soat')}`, pct: Math.min(100, Math.round(((kpiData.hours_worked || 0) / 176) * 100)), color: 'bg-indigo-500' },
        { label: t('Chiqindi foizi'), value: `${kpiData.waste_pct || 0}%`, target: '<5%', pct: Math.max(0, 100 - Math.round(((kpiData.waste_pct || 0) / 5) * 100)), color: 'bg-emerald-500' },
      ];
    } else if (role.includes('Sotuv menejeri')) {
      kpiItems = [
        { label: t('Sotuvlar soni'), value: kpiData.sales_count || 0, target: '15', pct: Math.min(100, Math.round(((kpiData.sales_count || 0) / 15) * 100)), color: 'bg-blue-500' },
        { label: t('Tushum (UZS)'), value: fmt(kpiData.revenue || 0), target: fmt(150000000), pct: Math.min(100, Math.round(((kpiData.revenue || 0) / 150000000) * 100)), color: 'bg-indigo-500' },
        { label: t('Lead konversiya'), value: `${kpiData.lead_conversion || 0}%`, target: '70%', pct: Math.min(100, Math.round(((kpiData.lead_conversion || 0) / 70) * 100)), color: 'bg-emerald-500' },
      ];
    } else if (role.includes('Omborchi')) {
      kpiItems = [
        { label: t('Inventar aniqligi'), value: `${kpiData.inventory_accuracy || 0}%`, target: '99%', pct: Math.min(100, Math.round(((kpiData.inventory_accuracy || 0) / 99) * 100)), color: 'bg-emerald-500' },
        { label: t("O'tkazmalar soni"), value: kpiData.transfers || 0, target: '30', pct: Math.min(100, Math.round(((kpiData.transfers || 0) / 30) * 100)), color: 'bg-blue-500' },
        { label: t('Xatolar soni'), value: kpiData.errors || 0, target: '<3', pct: Math.max(0, 100 - Math.round(((kpiData.errors || 0) / 3) * 100)), color: 'bg-rose-500' },
      ];
    } else {
      kpiItems = [
        { label: t('Samaradorlik'), value: `${kpiData.efficiency || kpiData.accuracy || 0}%`, target: '95%', pct: Math.min(100, Math.round(((kpiData.efficiency || kpiData.accuracy || 0) / 95) * 100)), color: 'bg-blue-500' },
        { label: t('Bajarilgan vazifalar'), value: kpiData.tasks_done || kpiData.transactions || kpiData.journal_entries || kpiData.deliveries || 0, target: '100', pct: Math.min(100, Math.round(((kpiData.tasks_done || kpiData.transactions || 0) / 100) * 100)), color: 'bg-indigo-500' },
        { label: t('Vaqtida bajarish'), value: `${kpiData.on_time_pct || 0}%`, target: '95%', pct: Math.min(100, Math.round(((kpiData.on_time_pct || 0) / 95) * 100)), color: 'bg-emerald-500' },
      ];
    }

    return (
      <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-amber-500" />
          <h3 className="font-black text-slate-900 text-lg">KPI — {role}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiItems.map((item, i) => (
            <div key={i} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.value}</p>
              {item.target && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase">{t('Maqsad')}: {item.target}</span>
                    <span className="text-[9px] font-black text-slate-700">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color || 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, item.pct || 0)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const payrollStatusColors: Record<string, string> = {
    PAID: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  const monthLabels: Record<string, string> = {
    '2026-05': 'May 2026',
    '2026-04': 'Aprel 2026',
    '2026-03': 'Mart 2026',
  };

  const dotColors: Record<string, string> = {
    present: 'bg-emerald-500',
    absent: 'bg-rose-400',
    half: 'bg-amber-400',
    weekend: 'bg-slate-200',
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
              <span className="text-2xl font-black text-white">{employee.full_name?.charAt(0) || '?'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{employee.full_name || employee.username}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase bg-slate-100 text-slate-600 border-slate-200">
                  {role}
                </span>
                {employee.department_name && (
                  <span className="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase bg-blue-50 text-blue-600 border-blue-100">
                    {employee.department_name}
                  </span>
                )}
                <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${statusColors[employee.status] || statusColors.PENDING}`}>
                  {t(statusLabelKeys[employee.status] || employee.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t('Oylik maosh'),
            value: currentPayroll ? fmt(currentPayroll.total) : fmt(employee.salary || 0),
            icon: DollarSign,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: t('Bu oy davomat'),
            value: `${attendancePct}%`,
            icon: CheckCircle2,
            color: attendancePct >= 90 ? 'text-emerald-600' : 'text-amber-600',
            bg: attendancePct >= 90 ? 'bg-emerald-50' : 'bg-amber-50',
          },
          {
            label: t('KPI ball'),
            value: kpiData ? `${kpiData.efficiency || kpiData.smena_punctuality || kpiData.inventory_accuracy || kpiData.on_time_pct || 90}%` : '—',
            icon: Award,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: t('Staj'),
            value: t('2 yil'),
            icon: Calendar,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
          },
        ].map((chip, i) => (
          <div key={i} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${chip.bg} rounded-2xl flex items-center justify-center`}>
              <chip.icon className={`w-5 h-5 ${chip.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{chip.label}</p>
              <p className="font-black text-slate-900 text-sm mt-0.5">{chip.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        {TAB_IDS.map(id => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({ general: 'Umumiy', activity: 'Faoliyat', salary: 'Maosh tarixi', kpi: 'KPI' }[id])}
          </button>
        ))}
      </div>

      {/* Umumiy Tab */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Contact */}
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium space-y-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> {t('Kontakt ma\'lumotlari')}
              </h3>
              {[
                { icon: Phone, label: t('Telefon'), value: employee.phone || '—' },
                { icon: Mail, label: 'Email', value: `${employee.username}@yuksar.uz` },
                { icon: UserIcon, label: 'Telegram', value: `@${employee.username}` },
                { icon: Briefcase, label: t("Bo'lim"), value: employee.department_name || '—' },
                { icon: Award, label: t('Lavozim'), value: role },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <row.icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
                    <p className="text-sm font-black text-slate-900">{row.value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${statusColors[employee.status] || statusColors.PENDING}`}>
                  {t(statusLabelKeys[employee.status] || employee.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Work summary + recent logs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5" /> {t('Ish xulosasi')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: t('Umumiy ishlar'), value: `${kpiData?.tasks_done || kpiData?.cnc_jobs_done || kpiData?.deliveries || kpiData?.transactions || 24} ${t('ta')}`, sub: t('bu oy') },
                  { label: t('Bajarilgan'), value: `${kpiData?.efficiency || kpiData?.on_time_pct || 94}%`, sub: t('samaradorlik') },
                  { label: t('Brak foizi'), value: `${kpiData?.brak_pct || kpiData?.waste_pct || 1.5}%`, sub: t('chiqindi') },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-[32px] bg-slate-50/50 border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <p className="text-xl font-black text-slate-900">{item.value}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Actions */}
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> {t('So\'ngi harakatlar')}
              </h3>
              {auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 leading-tight">{log.action || log.description || 'Amal bajarildi'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{log.module || ''} · {log.timestamp ? new Date(log.timestamp).toLocaleDateString('ru-RU') : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-8">
                  {t('Harakatlar topilmadi')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Faoliyat Tab - Attendance Calendar */}
      {activeTab === 'activity' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{t('30 kunlik davomat')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {daysPresent} / {daysExpected} {t('kun')} · {attendancePct}% {t('davomat')}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { label: t('Keldi'), color: 'bg-emerald-500' },
                  { label: t('Kelmadi'), color: 'bg-rose-400' },
                  { label: t('Yarim kun'), color: 'bg-amber-400' },
                  { label: t('Dam olish'), color: 'bg-slate-200' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendance.map((a, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-xl ${dotColors[a.status]} flex items-center justify-center`}
                  title={`${a.day} kun oldin: ${a.status}`}
                >
                  <span className="text-[8px] font-black text-white">{a.day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {[
                { label: t('Ishlagan kunlar'), value: daysPresent },
                { label: t('Kutilgan kunlar'), value: daysExpected },
                { label: t('Ishlagan soatlar'), value: `${daysPresent * 8} ${t('soat')}` },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-[24px] bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="font-black text-slate-900 text-lg">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Maosh tarixi Tab */}
      {activeTab === 'salary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-violet-500" />
                {t('Maosh tarixi')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Oy', 'Asosiy maosh', 'Bonus', 'Ushlama', 'Jami', 'Holat'].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payrollData.length > 0 ? payrollData.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5 font-black text-slate-900">{t(monthLabels[p.month] || p.month)}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-700">{(p.base_salary || 0).toLocaleString('ru-RU')} UZS</td>
                      <td className="px-8 py-5">
                        <span className={`text-sm font-black ${(p.bonus || 0) > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {(p.bonus || 0) > 0 ? `+${(p.bonus).toLocaleString('ru-RU')}` : '—'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-sm font-black ${(p.deduction || 0) > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                          {(p.deduction || 0) > 0 ? `-${(p.deduction).toLocaleString('ru-RU')}` : '—'}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">{(p.total || 0).toLocaleString('ru-RU')} UZS</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${payrollStatusColors[p.status] || payrollStatusColors.PENDING}`}>
                          {t(p.status === 'PAID' ? "To'langan" : 'Kutilmoqda')}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                        {t('Maosh tarixi mavjud emas')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Tab */}
      {activeTab === 'kpi' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {renderKPI()}
        </motion.div>
      )}
    </div>
  );
}
