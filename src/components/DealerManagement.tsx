import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Plus, X, MapPin, Phone, TrendingUp, AlertCircle,
  CheckCircle2, Search, CreditCard, ShoppingCart, ChevronDown,
  ArrowRight, FileText,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { User } from '../types';

interface DealerManagementProps {
  user: User;
}

const categoryColors: Record<string, string> = {
  A: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  B: 'bg-blue-50 text-blue-600 border-blue-100',
  C: 'bg-amber-50 text-amber-600 border-amber-100',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  INACTIVE: 'bg-rose-50 text-rose-600 border-rose-100',
};

const REGIONS = ['Barchasi', 'Samarqand', 'Namangan', 'Buxoro', "Farg'ona", 'Toshkent'];
const CATEGORIES = ['Barchasi', 'A', 'B', 'C'];

const methodColors: Record<string, string> = {
  BANK: 'bg-blue-50 text-blue-600',
  CASH: 'bg-emerald-50 text-emerald-600',
  CARD: 'bg-violet-50 text-violet-600',
};

export default function DealerManagement({ user }: DealerManagementProps) {
  const { t } = useI18n();
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState<any | null>(null);
  const [dealerPayments, setDealerPayments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ product: 'Penoplast Blok 20kg/m³', quantity: '', amount: '' });
  const [orderSaving, setOrderSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('Barchasi');
  const [categoryFilter, setCategoryFilter] = useState('Barchasi');
  const [form, setForm] = useState({
    name: '', region: '', category: 'B', credit_limit: '', phone: '', stir: '', address: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('dealers/');
      setDealers(res.data || []);
    } catch {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelectDealer = async (dealer: any) => {
    setSelectedDealer(dealer);
    try {
      const res = await api.get(`dealers/${dealer.id}/payments/`);
      setDealerPayments(res.data || []);
    } catch {
      setDealerPayments([]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('dealers/', { ...form, credit_limit: Number(form.credit_limit) });
      uiStore.showNotification(t("Diler qo'shildi"), 'success');
      setIsModalOpen(false);
      setForm({ name: '', region: '', category: 'B', credit_limit: '', phone: '', stir: '', address: '' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.quantity || !orderForm.amount) {
      uiStore.showNotification(t('Miqdor va summani kiriting'), 'error');
      return;
    }
    setOrderSaving(true);
    try {
      await api.post(`dealers/${selectedDealer.id}/orders/`, {
        product: orderForm.product,
        quantity: Number(orderForm.quantity),
        amount: Number(orderForm.amount),
      });
      setDealers(prev => prev.map(d =>
        d.id === selectedDealer.id
          ? { ...d, last_order: new Date().toISOString(), debt: (d.debt || 0) + Number(orderForm.amount) }
          : d
      ));
      setSelectedDealer((prev: any) => prev ? { ...prev, last_order: new Date().toISOString(), debt: (prev.debt || 0) + Number(orderForm.amount) } : prev);
      uiStore.showNotification(t('Buyurtma yaratildi'), 'success');
      setIsOrderOpen(false);
      setOrderForm({ product: 'Penoplast Blok 20kg/m³', quantity: '', amount: '' });
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    } finally {
      setOrderSaving(false);
    }
  };

  const filteredDealers = (dealers || []).filter(d => {
    const matchRegion = regionFilter === 'Barchasi' || d.region === regionFilter;
    const matchCategory = categoryFilter === 'Barchasi' || d.category === categoryFilter;
    const matchSearch = !searchTerm ||
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.region?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRegion && matchCategory && matchSearch;
  });

  const totalDebt = dealers.reduce((s, d) => s + (d.debt || 0), 0);
  const activeCount = dealers.filter(d => d.status === 'ACTIVE').length;
  const catACount = dealers.filter(d => d.category === 'A').length;

  const debtPct = (dealer: any) => {
    if (!dealer.credit_limit) return 0;
    return Math.min(100, Math.round((dealer.debt / dealer.credit_limit) * 100));
  };

  const debtBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-rose-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100">
              <Building2 className="w-8 h-8" />
            </div>
            {t('Dilerlar')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Diler portfolio va KPI boshqaruvi')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('Yangi Diler')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('Jami Dilerlar'), value: dealers.length, icon: Building2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: t('A-kategoriya'), value: catACount, icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: t('Faol'), value: activeCount, icon: CheckCircle2, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: t('Jami Qarz'), value: `${(totalDebt / 1000000).toFixed(1)}M UZS`, icon: CreditCard, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`font-black text-lg mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('Diler yoki hudud qidirish...')}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-300 transition-all font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-300 transition-all font-bold text-sm shadow-sm appearance-none pr-10"
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
        >
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                categoryFilter === c ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {c === 'Barchasi' ? 'Barchasi' : `Kat-${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-[24px]" />)}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  {[t('Dealer nomi'), t('Hudud'), t('Kategoriya'), t('Kredit / Qarz'), t("So'ngi buyurtma"), t('Status'), ''].map(h => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(filteredDealers || []).map(d => {
                  const pct = debtPct(d);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                      onClick={() => handleSelectDealer(d)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            {d.name?.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-900 block">{d.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">{d.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {d.region}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${categoryColors[d.category] || categoryColors.C}`}>
                          {d.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${debtBarColor(pct)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-[9px] font-black ${pct >= 80 ? 'text-rose-600' : 'text-slate-500'}`}>
                              {(d.debt || 0).toLocaleString('ru-RU')} UZS
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">{pct}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-400">
                        {d.last_order ? new Date(d.last_order).toLocaleDateString('ru-RU') : '—'}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${statusColors[d.status] || statusColors.INACTIVE}`}>
                          {t(d.status === 'ACTIVE' ? 'Faol' : 'Nofaol')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
                      </td>
                    </tr>
                  );
                })}
                {filteredDealers.length === 0 && (
                  <tr><td colSpan={7} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">{t('Dilerlar topilmadi')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dealer Detail Side Panel */}
      <AnimatePresence>
        {selectedDealer && (
          <div className="fixed inset-0 z-[70] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDealer(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white h-full w-full max-w-md shadow-2xl border-l border-slate-100 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
                <button onClick={() => setSelectedDealer(null)} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-[22px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{selectedDealer.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight leading-none mb-2">{selectedDealer.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${categoryColors[selectedDealer.category] || categoryColors.C}`}>
                        {t('Kategoriya')} {selectedDealer.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${statusColors[selectedDealer.status] || statusColors.INACTIVE}`}>
                        {selectedDealer.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6 flex-1">
                {/* Contact Info */}
                <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Kontakt')}</p>
                  {[
                    { icon: Phone, label: t('Telefon'), value: selectedDealer.phone },
                    { icon: MapPin, label: t('Manzil'), value: selectedDealer.address },
                    { icon: FileText, label: 'STIR', value: selectedDealer.stir },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                        <row.icon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
                        <p className="text-sm font-black text-slate-900">{row.value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credit vs Debt */}
                <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kredit limiti vs Qarz')}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-black text-slate-900">{(selectedDealer.debt || 0).toLocaleString('ru-RU')} UZS</span>
                      <span className="font-bold text-slate-400">/ {(selectedDealer.credit_limit || 0).toLocaleString('ru-RU')} UZS</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${debtBarColor(debtPct(selectedDealer))}`}
                        style={{ width: `${debtPct(selectedDealer)}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[10px] font-black ${debtPct(selectedDealer) >= 80 ? 'text-rose-600' : debtPct(selectedDealer) >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {debtPct(selectedDealer)}% {t('ishlatilgan')}
                      </span>
                      {debtPct(selectedDealer) >= 80 && (
                        <span className="text-[10px] font-black text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {t('Yuqori risk')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Monthly KPI */}
                <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Oylik KPI')}</p>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase">{t('Maqsad')}: {(selectedDealer.monthly_target || 0).toLocaleString('ru-RU')} UZS</span>
                    <span className="text-xs font-black text-slate-700">
                      {Math.round(((selectedDealer.monthly_actual || 0) / (selectedDealer.monthly_target || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${(selectedDealer.monthly_actual || 0) >= (selectedDealer.monthly_target || 1) ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, Math.round(((selectedDealer.monthly_actual || 0) / (selectedDealer.monthly_target || 1)) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">
                    {t('Haqiqiy')}: {(selectedDealer.monthly_actual || 0).toLocaleString('ru-RU')} UZS
                  </p>
                </div>

                {/* Payment History */}
                {dealerPayments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("To'lov tarixi")}</p>
                    {(dealerPayments || []).slice(0, 3).map((pay: any) => (
                      <div key={pay.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${methodColors[pay.method] || 'bg-slate-50 text-slate-500'}`}>
                            {pay.method}
                          </span>
                          <div>
                            <p className="text-xs font-black text-slate-900">{pay.amount.toLocaleString('ru-RU')} UZS</p>
                            {pay.note && <p className="text-[10px] font-bold text-slate-400">{pay.note}</p>}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(pay.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contract Status */}
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900">{t('Faol Shartnoma')}</p>
                    <p className="text-[10px] font-bold text-slate-500">{t('Kategoriya')} {selectedDealer.category} · {selectedDealer.region}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button onClick={() => setIsContractOpen(true)} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 transition-all active:scale-95 text-slate-600">
                    <FileText className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t('Shartnoma')}</span>
                  </button>
                  <button
                    onClick={() => setIsOrderOpen(true)}
                    className="flex flex-col items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 text-emerald-600"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t('Buyurtma')}</span>
                  </button>
                  <a
                    href={`tel:${selectedDealer.phone}`}
                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all active:scale-95 text-blue-600"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t("Qo'ng'iroq")}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <AnimatePresence>
        {isOrderOpen && selectedDealer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl"><ShoppingCart className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{t('Yangi Buyurtma')}</h3>
                    <p className="text-xs font-bold text-slate-400">{selectedDealer.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsOrderOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateOrder} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mahsulot')}</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-emerald-500 transition-all font-bold text-sm appearance-none"
                    value={orderForm.product}
                    onChange={e => setOrderForm({ ...orderForm, product: e.target.value })}
                  >
                    <option>Penoplast Blok 20kg/m³</option>
                    <option>Penoplast Blok 25kg/m³</option>
                    <option>Penoplast Blok 35kg/m³</option>
                    <option>Penoplast Plita 50mm</option>
                    <option>Penoplast Plita 100mm</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Miqdor')} (m³)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-emerald-500 transition-all font-bold text-sm"
                    value={orderForm.quantity}
                    onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Summa')} (UZS)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-emerald-500 transition-all font-bold text-sm"
                    value={orderForm.amount}
                    onChange={e => setOrderForm({ ...orderForm, amount: e.target.value })}
                    placeholder="5000000"
                  />
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-amber-700">
                    {t('Joriy qarz')}: {(selectedDealer.debt || 0).toLocaleString('ru-RU')} UZS · {t('Kredit limiti')}: {(selectedDealer.credit_limit || 0).toLocaleString('ru-RU')} UZS
                  </p>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setIsOrderOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                  <button type="submit" disabled={orderSaving} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-60">
                    {orderSaving ? '...' : t('Yaratish')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <AnimatePresence>
        {isContractOpen && selectedDealer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{t('Shartnoma')}</h3>
                    <p className="text-xs font-bold text-slate-400">{selectedDealer.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsContractOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-5">
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[28px] flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-slate-900">{t('Faol Shartnoma')}</p>
                    <p className="text-xs font-bold text-slate-500">№ D-{String(selectedDealer.id).padStart(4, '0')}-2025</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: t('Diler'), value: selectedDealer.name },
                    { label: t('Hudud'), value: selectedDealer.region },
                    { label: 'STIR', value: selectedDealer.stir || '—' },
                    { label: t('Telefon'), value: selectedDealer.phone },
                    { label: t('Manzil'), value: selectedDealer.address || '—' },
                    { label: t('Kategoriya'), value: selectedDealer.category },
                    { label: t('Kredit limiti'), value: `${(selectedDealer.credit_limit || 0).toLocaleString('ru-RU')} UZS` },
                    { label: t('Imzolangan sana'), value: '01.01.2025' },
                    { label: t('Amal qilish muddati'), value: '31.12.2025' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                      <span className="text-sm font-black text-slate-900">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setIsContractOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Yopish')}</button>
                  <button
                    onClick={() => { window.print(); uiStore.showNotification(t('Shartnoma chop etilmoqda'), 'info'); }}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                  >
                    {t('Chop etish')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Dealer Modal */}
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
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl"><Building2 className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black text-slate-900">{t('Yangi Diler')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                {[
                  { label: t('Dealer nomi'), key: 'name', placeholder: 'Samarqand Qurilish Savdosi' },
                  { label: t('Hudud'), key: 'region', placeholder: 'Samarqand' },
                  { label: t('Telefon'), key: 'phone', placeholder: '+998662221133' },
                  { label: 'STIR', key: 'stir', placeholder: '123456789' },
                  { label: t('Manzil'), key: 'address', placeholder: "Samarqand, Mirzo Ulugbek ko'ch. 12" },
                  { label: t('Kredit limiti (UZS)'), key: 'credit_limit', placeholder: '50000000', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      required
                      type={field.type || 'text'}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-emerald-500 transition-all font-bold text-sm"
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Kategoriya')}</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-emerald-500 transition-all font-bold text-sm appearance-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="A">{t('A — Premium')}</option>
                    <option value="B">{t('B — Standart')}</option>
                    <option value="C">{t('C — Minimal')}</option>
                  </select>
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
