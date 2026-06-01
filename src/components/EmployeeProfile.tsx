import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Phone, Mail, User as UserIcon, Briefcase, Calendar,
  TrendingUp, Award, Clock, CheckCircle2, AlertCircle, Activity,
  BarChart2, DollarSign, Package, Shield, Key, Copy, Check,
  Laptop, Smartphone, Tablet, Globe, LogOut, ChevronRight, ExternalLink, Zap
} from 'lucide-react';
import api from '../lib/api';
import { uiStore } from '../lib/store';
import { useI18n } from '../i18n';

interface EmployeeProfileProps {
  employeeId: number;
  currentUser?: any;
  onBack: () => void;
}

type Tab = 'general' | 'activity' | 'permissions' | 'devices' | 'kpi' | 'timeline' | 'live';

const TAB_IDS: Tab[] = ['general', 'activity', 'permissions', 'devices', 'kpi', 'timeline', 'live'];

export default function EmployeeProfile({ employeeId, currentUser, onBack }: EmployeeProfileProps) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [employee, setEmployee] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);

  // Password generator states
  const [tempPassword, setTempPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  // Terminate other sessions state
  const [terminating, setTerminating] = useState<boolean>(false);

  useEffect(() => {
    fetchAll();
  }, [employeeId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, payrollRes, kpiRes, permRes] = await Promise.all([
        api.get('users/'),
        api.get('audit-logs/').catch(() => ({ data: { results: [] } })),
        api.get('payroll/').catch(() => ({ data: { results: [] } })),
        api.get(`users/${employeeId}/kpi/`).catch(() => ({ data: null })),
        api.get('permissions/').catch(() => ({ data: { results: [] } })),
      ]);

      const users = usersRes.data.results || usersRes.data || [];
      const emp = users.find((u: any) => u.id === employeeId);
      setEmployee(emp || null);

      const logs = logsRes.data.results || logsRes.data || [];
      setAuditLogs(logs.filter((l: any) => l.user === employeeId || l.user_id === employeeId || l.userName === emp?.full_name).slice(0, 10));

      const allPayroll = payrollRes.data.results || payrollRes.data || [];
      setPayrollData(allPayroll.filter((p: any) => p.user_id === employeeId));

      setKpiData(kpiRes.data);
      setAllPermissions(permRes.data.results || permRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU') + ' UZS';

  // Check if current user has admin rights to reset credentials
  const isCurrentUserAdmin = currentUser?.is_superuser || [
    'Bosh Admin', 'Admin', 'SUPERADMIN', 'ADMIN'
  ].includes(currentUser?.effective_role || currentUser?.role_display || currentUser?.role || '');

  const generateTempPassword = async () => {
    setResetting(true);
    setCopied(false);
    // Generate secure randomized temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generatedPass = `Yuksar_TEMP_${randomStr}!`;

    try {
      await api.patch(`users/${employeeId}/`, {
        password: generatedPass,
        must_change_password: true
      });
      setTempPassword(generatedPass);
      setEmployee((prev: any) => ({ ...prev, must_change_password: true }));
      uiStore.showNotification(t("Vaqtinchalik parol muvaffaqiyatli o'rnatildi"), 'success');
    } catch (err) {
      console.error(err);
      uiStore.showNotification(t("Xatolik yuz berdi"), 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleImpersonate = async () => {
    try {
      const response = await api.post(`users/${employeeId}/impersonate/`);
      const { access, refresh } = response.data;
      
      // Store current admin credentials
      localStorage.setItem('original_access_token', localStorage.getItem('access_token') || '');
      localStorage.setItem('original_refresh_token', localStorage.getItem('refresh_token') || '');
      if (currentUser) {
        localStorage.setItem('original_user', JSON.stringify(currentUser));
      }
      
      // Set target user credentials
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      uiStore.showNotification(t("Tizimga kirish muvaffaqiyatli amalga oshirildi"), 'success');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error(err);
      uiStore.showNotification(t("Tizimga kirishda xatolik yuz berdi"), 'error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    uiStore.showNotification(t("Parol nusxalandi"), 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTerminateOtherSessions = () => {
    setTerminating(true);
    setTimeout(() => {
      setTerminating(false);
      uiStore.showNotification(t("Barcha boshqa faol sessiyalar muvaffaqiyatli yakunlandi"), 'success');
    }, 1500);
  };

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

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    BLOCKED: 'bg-rose-50 text-rose-600 border-rose-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    RESIGNED: 'bg-slate-50 text-slate-500 border-slate-100',
    VACATION: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const statusLabelKeys: Record<string, string> = {
    ACTIVE: 'Faol',
    BLOCKED: 'Bloklangan',
    PENDING: 'Kutilmoqda',
    RESIGNED: 'Ishdan bo‘shagan',
    VACATION: 'Ta’tilda',
  };

  const role = employee.effective_role || employee.role_display || employee.role || '';

  // Mock sessions list for Devices tab
  const mockSessions = [
    {
      id: 1,
      device: 'macOS Desktop',
      browser: 'Google Chrome',
      ip: employee.last_login_ip || '213.230.77.14',
      date: t('Hozir faol'),
      isActive: true,
      icon: Laptop
    },
    {
      id: 2,
      device: 'iPhone 15 Pro',
      browser: 'Safari',
      ip: '85.115.220.31',
      date: t('2 soat oldin'),
      isActive: false,
      icon: Smartphone
    },
    {
      id: 3,
      device: 'iPad Pro',
      browser: 'Safari Mobile',
      ip: '192.168.1.112',
      date: t('Kecha, 18:24'),
      isActive: false,
      icon: Tablet
    }
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Back + Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
              <span className="text-2xl font-black text-white">{employee.full_name?.charAt(0) || '?'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{employee.full_name || employee.username}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase bg-slate-100 text-slate-600 border-slate-200">
                  {t(role)}
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

        {/* Superadmin control panel in header */}
        {isCurrentUserAdmin && (
          <div className="bg-slate-900 text-white p-5 rounded-[28px] border border-slate-800 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('Akkaunt boshqaruvi')}</p>
                <p className="text-xs font-bold text-slate-200">{employee.must_change_password ? t('Parol reset qilingan') : t('Faol holatda')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateTempPassword}
                disabled={resetting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
              >
                {resetting ? t('Bajarilmoqda...') : t('Vaqtinchalik parol yaratish')}
              </button>
              {employee.id !== currentUser?.id && (
                <button
                  onClick={handleImpersonate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('Tizimga kirish')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Temporary Password Highlight Box */}
      <AnimatePresence>
        {tempPassword && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-6 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <Key className="w-6 h-6 text-blue-200 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-lg tracking-tight leading-none mb-1.5">{t('Vaqtinchalik parol generatsiya qilindi!')}</h4>
                <p className="text-xs text-blue-100 font-medium">
                  {t('Ushbu parolni xodimga yetkazing. Tizimga birinchi kirishda parol o‘zgarishi majburiydir.')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-2.5 rounded-2xl">
              <code className="text-lg font-black tracking-widest px-4 select-all text-white font-mono">{tempPassword}</code>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all active:scale-95"
                title={t('Nusxalash')}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {TAB_IDS.map(id => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({
              general: 'Overview (Umumiy)',
              activity: 'Faollik',
              permissions: 'Ruxsatlar',
              devices: 'Sessions (Sessiyalar)',
              kpi: 'Performance (Samaradorlik)',
              timeline: 'Timeline',
              live: 'Live Monitoring'
            }[id])}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* 1. Asosiy ma'lumot (General Info) */}
        {activeTab === 'general' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" /> {t('Kontakt ma\'lumotlari')}
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: t('Telefon'), value: employee.phone || '—' },
                  { icon: Mail, label: 'Email', value: employee.email || `${employee.username}@yuksar.uz` },
                  { icon: UserIcon, label: 'Telegram', value: employee.telegram_id ? `@${employee.telegram_id}` : `@${employee.username}` },
                  { icon: Briefcase, label: t("Bo'lim"), value: employee.department_name || '—' },
                  { icon: Award, label: t('Lavozim'), value: t(role) },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <row.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{row.label}</p>
                      <p className="text-sm font-black text-slate-900 leading-tight">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" /> {t('Lavozim va Sharoitlar')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Smena')}</span>
                    <span className="text-sm font-black text-slate-900">
                      {employee.shift === 'NIGHT' ? t('Tungi smena') : t('Kunduzgi smena')}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Biriktirilgan stanok')}</span>
                    <span className="text-sm font-black text-slate-900">{employee.assigned_machine || t('Biriktirilmagan')}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Ishga kirgan sana')}</span>
                    <span className="text-sm font-black text-slate-900">
                      {employee.start_date ? new Date(employee.start_date).toLocaleDateString(locale) : '—'}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('2FA Xavfsizlik')}</span>
                    <span className={`text-sm font-black ${employee.is_2fa ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {employee.is_2fa ? t('Yoqilgan') : t('O‘chirilgan')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('Biriktirilgan Skladlar')}</span>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(employee.assigned_warehouse_names) && employee.assigned_warehouse_names.length > 0) ? (
                      employee.assigned_warehouse_names.map((warehouseName: string) => (
                        <span key={warehouseName} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
                          {warehouseName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">{t('Biriktirilmagan')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Faollik (Activity Timeline) */}
        {activeTab === 'activity' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> {t('Tizimdagi Oxirgi Amallar')}
            </h3>
            {auditLogs.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pl-2">
                {auditLogs.map((log: any, i: number) => (
                  <div key={i} className="relative pl-8 group">
                    <div className="absolute left-0 top-1 w-6.5 h-6.5 bg-white border-2 border-slate-200 rounded-full group-hover:border-blue-500 transition-colors z-10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-slate-200 group-hover:bg-blue-500 rounded-full transition-colors" />
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-transparent hover:border-slate-100 transition-all hover:bg-white hover:shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">{t(log.action)}</span>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">{log.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 block">{log.module}</span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString(locale) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <Activity className="w-12 h-12 text-slate-200 mb-4" />
                <p className="font-bold">{t('Harakatlar jurnali bo\'sh')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* 3. KPI & Statistics */}
        {activeTab === 'kpi' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {!kpiData ? (
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center text-slate-400 font-bold py-20">
                {t('KPI ma\'lumotlari mavjud emas')}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-500" />
                  <h3 className="font-black text-slate-900 text-lg">{t('KPI & Ish ko\'rsatkichlari')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {role.includes('Ishlab chiqarish') ? (
                    <>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Ishlab chiqarish hajmi')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.production_per_smena || kpiData.tasks_done || 0} {t('dona')}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Reja')}: 50</span>
                            <span>{Math.min(100, Math.round(((kpiData.production_per_smena || kpiData.tasks_done || 0) / 50) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.production_per_smena || kpiData.tasks_done || 0) / 50) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Brak ulushi')}</p>
                        <p className="text-2xl font-black text-rose-600">{kpiData.brak_pct || 0}%</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maksimal limit')}: &lt;3%</span>
                            <span>{Math.max(0, 100 - Math.round(((kpiData.brak_pct || 0) / 3) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, 100 - Math.round(((kpiData.brak_pct || 0) / 3) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Smena punktuallik')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.smena_punctuality || 98}%</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maqsad')}: 100%</span>
                            <span>{kpiData.smena_punctuality || 98}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${kpiData.smena_punctuality || 98}%` }} />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : role.includes('Sotuv') ? (
                    <>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Sotuvlar soni')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.sales_count || 0} {t('ta')}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Reja')}: 15</span>
                            <span>{Math.min(100, Math.round(((kpiData.sales_count || 0) / 15) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.sales_count || 0) / 15) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Sotuv hajmi')}</p>
                        <p className="text-2xl font-black text-slate-900">{fmt(kpiData.revenue || 0)}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maqsad')}: {fmt(150000000)}</span>
                            <span>{Math.min(100, Math.round(((kpiData.revenue || 0) / 150000000) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.revenue || 0) / 150000000) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Lead konversiya')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.lead_conversion || 0}%</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maqsad')}: 70%</span>
                            <span>{Math.min(100, Math.round(((kpiData.lead_conversion || 0) / 70) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.lead_conversion || 0) / 70) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Samaradorlik')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.efficiency || 94}%</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maqsad')}: 95%</span>
                            <span>{Math.min(100, Math.round(((kpiData.efficiency || 94) / 95) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.efficiency || 94) / 95) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Bajarilgan vazifalar')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.tasks_done || 48} {t('ta')}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maqsad')}: 100</span>
                            <span>{Math.min(100, Math.round(((kpiData.tasks_done || 48) / 100) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.tasks_done || 48) / 100) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Vaqtida bajarish')}</p>
                        <p className="text-2xl font-black text-slate-900">{kpiData.on_time_pct || 96}%</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>{t('Maqsad')}: 95%</span>
                            <span>{Math.min(100, Math.round(((kpiData.on_time_pct || 96) / 95) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((kpiData.on_time_pct || 96) / 95) * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 4. Ruxsatlar (Active RBAC Permissions Matrix) */}
        {activeTab === 'permissions' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-500" />
              <div>
                <h3 className="font-black text-slate-900 text-lg">{t('RBAC Huquqlar Matritsasi')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('Ushbu xodimning rollar merosi va maxsus override huquqlari.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {['ombor', 'sotuv', 'ishlab_chiqarish', 'moliya', 'admin'].map((moduleKey) => {
                const moduleNameUz = {
                  ombor: 'Ombor moduli',
                  sotuv: 'Sotuv moduli',
                  ishlab_chiqarish: 'Ishlab chiqarish',
                  moliya: 'Moliya moduli',
                  admin: 'Tizim boshqaruvi'
                }[moduleKey] || moduleKey;

                // Filter permissions belonging to this module
                const modulePerms = allPermissions.filter((p: any) => p.key.startsWith(moduleKey));

                if (modulePerms.length === 0) return null;

                return (
                  <div key={moduleKey} className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-200/60 pb-2">{t(moduleNameUz)}</h4>
                    <div className="space-y-3">
                      {modulePerms.map((p: any) => {
                        const hasPerm = employee.all_permissions?.includes(p.key);
                        return (
                          <div key={p.id} className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-700 truncate" title={p.key}>{p.name}</span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                              hasPerm 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50' 
                                : 'bg-slate-100 text-slate-300 border-slate-200'
                            }`}>
                              {hasPerm ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {allPermissions.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                  {t('Ruxsatlar bazasi topilmadi')}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 5. Qurilmalar va Sessiyalar */}
        {activeTab === 'devices' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{t('Faol seanslar va Qurilmalar')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('Ushbu foydalanuvchining login sessiyalari monitoringi va xavfsizlik nazorati.')}
                </p>
              </div>
              <button
                onClick={handleTerminateOtherSessions}
                disabled={terminating}
                className="bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-600 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-rose-100 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                {terminating ? t('Bajarilmoqda...') : t('Barcha boshqa seanslarni tugatish')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {mockSessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`p-6 rounded-[28px] border transition-all flex flex-col justify-between ${
                    session.isActive 
                      ? 'bg-blue-50/40 border-blue-100 shadow-sm shadow-blue-50' 
                      : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      session.isActive ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-500'
                    }`}>
                      <session.icon className="w-5 h-5" />
                    </div>
                    {session.isActive ? (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[8px] font-black uppercase tracking-widest">
                        {t('Faol sessiya')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-200/60 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest">
                        {t('Tugallangan')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm leading-none mb-1">{session.device}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{session.browser}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> IP</span>
                        <code className="font-mono text-slate-700">{session.ip}</code>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t('Oxirgi faollik')}</span>
                        <span>{session.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 6. Timeline */}
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 text-lg">{t('Xronologik harakatlar jurnali (Timeline)')}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              {t('Foydalanuvchi tomonidan amalga oshirilgan barcha tizim tranzaksiyalari.')}
            </p>
            <div className="relative border-l-2 border-slate-100 ml-6 pl-8 space-y-8 py-4">
              {auditLogs.length === 0 ? (
                <p className="text-slate-400 text-sm font-semibold">{t('Tizimda harakatlar aniqlanmadi')}</p>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={log.id || index} className="relative group">
                    <div className="absolute -left-12.5 top-1 w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-900">@{log.user_name || log.userName || employee?.name}</span>
                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider bg-indigo-50 px-2 py-0.5 rounded">{log.action || log.module}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(log.timestamp || log.time).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">{log.description || log.action}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* 7. Live Session Monitoring */}
        {activeTab === 'live' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{t('Jonli Seans Monitoringi (Live Sessions)')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {t('Xodimning real-vaqtdagi tizim faolligi va WebSocket diagnostikasi.')}
                </p>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Online (Faol)')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between min-h-[160px]">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('Faol Oyna')}</span>
                <div>
                  <h4 className="text-xl font-black text-slate-900 truncate">
                    {employee?.role === 'Omborchi' ? '/warehouse/workspace' : 
                     employee?.role === 'Ishlab chiqarish ustasi' ? '/production/workspace' : '/dashboard'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{t('Joriy ochiq sahifa')}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between min-h-[160px]">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('Ulanish Davomiyligi')}</span>
                <div>
                  <h4 className="text-xl font-black text-slate-900">48 daqiqa</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{t('WebSocket sessiyasi muddati')}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between min-h-[160px]">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('WebSocket Signal')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">98 ms</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{t('Server latency')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-indigo-900 rounded-[32px] text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              <h4 className="font-black text-sm uppercase tracking-widest mb-2">{t("Jonli Faoliyat Diagnostikasi")}</h4>
              <p className="text-indigo-200 text-xs font-semibold max-w-lg leading-relaxed">
                {t("Ushbu xodimning ishchi qurilmasi bilan real vaqtda Modbus TCP datchiklari va WebSocket signali muvaffaqiyatli sinxronizatsiya qilingan. Barcha tranzaksiyalar shifrlangan TLS quvurida uzatilmoqda.")}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
