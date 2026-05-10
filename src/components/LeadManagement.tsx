import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone, Plus, X, User as UserIcon, TrendingUp, Search,
  ChevronDown, Globe, MessageSquare, Megaphone, DollarSign,
  Calendar, ArrowRight, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { User } from '../types';

interface LeadManagementProps {
  user: User;
}

type LeadStatus = 'NEW' | 'CALLED' | 'OFFER_SENT' | 'WON' | 'LOST';

const COLUMNS: { id: LeadStatus; label: string; color: string; bg: string; dot: string; border: string }[] = [
  { id: 'NEW', label: 'Yangi', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500', border: 'border-blue-100' },
  { id: 'CALLED', label: "Qo'ng'iroq", color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-100' },
  { id: 'OFFER_SENT', label: 'Taklif', color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-500', border: 'border-indigo-100' },
  { id: 'WON', label: 'Yutildi', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-100' },
  { id: 'LOST', label: "Yo'qotildi", color: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500', border: 'border-rose-100' },
];

const SOURCES = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'WEBSITE', label: 'Veb-sayt' },
  { value: 'CALL', label: "Qo'ng'iroq" },
  { value: 'REFERRAL', label: 'Tavsiya' },
];

const sourceColors: Record<string, string> = {
  WEBSITE: 'bg-blue-50 text-blue-600 border-blue-100',
  CALL: 'bg-amber-50 text-amber-600 border-amber-100',
  REFERRAL: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const sourceIcons: Record<string, React.ReactNode> = {
  WEBSITE: <Globe className="w-3 h-3" />,
  CALL: <Phone className="w-3 h-3" />,
  REFERRAL: <MessageSquare className="w-3 h-3" />,
};

function daysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Bugun';
  if (diff === 1) return '1 kun oldin';
  return `${diff} kun oldin`;
}

export default function LeadManagement({ user }: LeadManagementProps) {
  const { t } = useI18n();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movingLead, setMovingLead] = useState<number | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', source: 'WEBSITE', note: '', manager_name: 'Jamshid Karimov', amount_expected: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('leads/');
      setLeads(res.data || []);
    } catch {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('leads/', { ...form, status: 'NEW', amount_expected: Number(form.amount_expected) || 0 });
      uiStore.showNotification(t("Lead qo'shildi"), 'success');
      setIsModalOpen(false);
      setForm({ name: '', phone: '', source: 'WEBSITE', note: '', manager_name: 'Jamshid Karimov', amount_expected: '' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const handleMove = async (leadId: number, newStatus: LeadStatus) => {
    try {
      await api.patch(`leads/${leadId}/`, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      uiStore.showNotification(t('Lead holati yangilandi'), 'success');
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    } finally {
      setMovingLead(null);
    }
  };

  const visibleLeads = (leads || []).filter(l => {
    const matchSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    const matchSearch = !searchTerm ||
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm);
    return matchSource && matchSearch;
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'NEW').length;
  const wonLeads = leads.filter(l => l.status === 'WON').length;
  const conversion = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';
  const wonRevenue = leads.filter(l => l.status === 'WON').reduce((s: number, l: any) => s + (l.amount_expected || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
              <TrendingUp className="w-8 h-8" />
            </div>
            {t('Leadlar & CRM')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Mijoz funnel boshqaruvi')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('Yangi Lead')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('Jami Leadlar'), value: totalLeads, icon: UserIcon, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: t('Yangi'), value: newLeads, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: t('Konversiya'), value: `${conversion}%`, icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: t('Yutilgan daromad'), value: `${(wonRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, bg: 'bg-indigo-50', color: 'text-indigo-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`font-black text-lg ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('Ism yoki telefon...')}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-300 transition-all font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
          {SOURCES.map(s => (
            <button
              key={s.value}
              onClick={() => setSourceFilter(s.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                sourceFilter === s.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t(s.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[32px]" />)}
        </div>
      )}

      {/* Kanban Board */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map(col => {
            const colLeads = visibleLeads.filter(l => l.status === col.id);
            return (
              <div key={col.id} className="space-y-3">
                <div className={`px-4 py-3 rounded-2xl border ${col.border} ${col.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${col.color}`}>{t(col.label)}</span>
                  </div>
                  <span className={`text-xs font-black ${col.color} bg-white/70 px-2 py-0.5 rounded-full`}>{colLeads.length}</span>
                </div>

                <div className="space-y-3 min-h-[80px]">
                  {(colLeads || []).map(lead => (
                    <motion.div
                      key={lead.id}
                      layout
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm">
                          {lead.name?.charAt(0)}
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border flex items-center gap-1 ${sourceColors[lead.source] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {sourceIcons[lead.source]}
                          {lead.source === 'WEBSITE' ? 'Web' : lead.source === 'CALL' ? "Call" : 'Ref'}
                        </span>
                      </div>
                      <p className="font-black text-slate-900 text-sm mb-1 leading-tight">{lead.name}</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                      {lead.amount_expected > 0 && (
                        <p className="text-[10px] font-black text-blue-600 mb-1">
                          {lead.amount_expected.toLocaleString('ru-RU')} UZS
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <span className="text-[9px] font-bold text-slate-400">{daysAgo(lead.created_at)}</span>
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setMovingLead(movingLead === lead.id ? null : lead.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 rounded-xl text-[9px] font-black text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                          >
                            {t("Ko'chirish")} <ChevronDown className="w-3 h-3" />
                          </button>
                          <AnimatePresence>
                            {movingLead === lead.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 bottom-full mb-2 z-20 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden min-w-[160px]"
                              >
                                {COLUMNS.filter(c => c.id !== col.id).map(target => (
                                  <button
                                    key={target.id}
                                    onClick={() => handleMove(lead.id, target.id)}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 ${target.color}`}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${target.dot}`} />
                                    {target.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-200 font-black uppercase tracking-widest text-[9px]">{t('Yozuvlar yo\'q')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Panel */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[70] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white h-full w-full max-w-md shadow-2xl border-l border-slate-100 flex flex-col overflow-y-auto"
            >
              {/* Panel Header */}
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
                <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-black text-white">{selectedLead.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight leading-none mb-2">{selectedLead.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${sourceColors[selectedLead.source] || 'bg-white/10 text-white border-white/20'}`}>
                        {selectedLead.source}
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${COLUMNS.find(c => c.id === selectedLead.status)?.bg || ''} ${COLUMNS.find(c => c.id === selectedLead.status)?.color || ''} ${COLUMNS.find(c => c.id === selectedLead.status)?.border || ''}`}>
                        {t(COLUMNS.find(c => c.id === selectedLead.status)?.label || selectedLead.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Body */}
              <div className="p-8 space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('Telefon'), value: selectedLead.phone },
                    { label: t('Menejer'), value: selectedLead.manager_name },
                    { label: t('Kutilgan summa'), value: selectedLead.amount_expected ? selectedLead.amount_expected.toLocaleString('ru-RU') + ' UZS' : '—' },
                    { label: t('Yaratilgan'), value: t(daysAgo(selectedLead.created_at)) },
                  ].map((row, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{row.label}</p>
                      <p className="text-sm font-black text-slate-900 truncate">{row.value || '—'}</p>
                    </div>
                  ))}
                </div>

                {selectedLead.note && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t('Izoh')}</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedLead.note}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("Holat o'zgartirish")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COLUMNS.filter(c => c.id !== selectedLead.status).map(col => (
                      <button
                        key={col.id}
                        onClick={() => handleMove(selectedLead.id, col.id)}
                        className={`p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:shadow-sm ${col.bg} ${col.color} ${col.border}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                        {t(col.label)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Call / Contact actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 hover:bg-blue-100 transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t("Qo'ng'iroq")}</span>
                  </a>
                  <button
                    onClick={() => handleMove(selectedLead.id, 'WON')}
                    className="flex items-center justify-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 hover:bg-emerald-100 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('Yutildi')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Lead Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl"><UserIcon className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black text-slate-900">{t('Yangi Lead')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5">
                {[
                  { label: t('Ism'), key: 'name', placeholder: 'Bobur Toshmatov' },
                  { label: t('Telefon'), key: 'phone', placeholder: '+998901234567' },
                  { label: t('Menejer ismi'), key: 'manager_name', placeholder: 'Jamshid Karimov' },
                  { label: t('Kutilgan summa (UZS)'), key: 'amount_expected', placeholder: '5000000', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      required={field.key !== 'amount_expected'}
                      type={field.type || 'text'}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-blue-500 transition-all font-bold text-sm"
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Manba')}</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-blue-500 transition-all font-bold text-sm appearance-none" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                    <option value="WEBSITE">{t('Veb-sayt')}</option>
                    <option value="CALL">{t("Qo'ng'iroq")}</option>
                    <option value="REFERRAL">{t('Tavsiya')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Izoh')}</label>
                  <textarea
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:border-blue-500 transition-all font-bold text-sm min-h-[80px]"
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    placeholder={t('Lead haqida qisqacha ma\'lumot...')}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">{t("Qo'shish")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
