import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag, Plus, X, Search, Edit3, Check, Package, BarChart2,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';

const TIERS = ['RETAIL', 'WHOLESALE', 'DEALER', 'VIP', 'PROMO'] as const;
type Tier = typeof TIERS[number];

const tierMeta: Record<Tier, { label: string; color: string; bg: string; border: string }> = {
  RETAIL:    { label: 'Retail',     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  WHOLESALE: { label: 'Wholesale',  color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  DEALER:    { label: 'Dealer',     color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
  VIP:       { label: 'VIP',        color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
  PROMO:     { label: 'Promo',      color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-100' },
};

const tierLabels: Record<string, string> = {
  RETAIL: 'Retail', WHOLESALE: 'Wholesale', DEALER: 'Dealer', VIP: 'VIP', PROMO: 'Promo',
};

export default function DynamicPricing() {
  const { t } = useI18n();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: '',
    tier: 'RETAIL',
    segment: '',
    price: '',
    discount_pct: '0',
    valid_until: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('pricing/rules/');
      setRules(res.data || []);
    } catch {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build unique products list
  const productMap = new Map<number, { id: number; name: string; sku?: string }>(
    (rules || []).map(r => [r.product_id as number, { id: r.product_id as number, name: r.product_name as string }])
  );
  const products = Array.from(productMap.values()).filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProduct = selectedProductId
    ? products.find(p => p.id === selectedProductId)
    : products[0];

  const productRules = (rules || []).filter(r => r.product_id === activeProduct?.id);

  // For bar chart: max price among product rules
  const maxPrice = productRules.reduce((m, r) => Math.max(m, r.price || 0), 0);

  const handleSavePrice = async (ruleId: number) => {
    try {
      await api.patch(`pricing/rules/${ruleId}/`, {
        price: Number(editPrice),
        discount_pct: Number(editDiscount),
      });
      setRules(prev => prev.map(r =>
        r.id === ruleId ? { ...r, price: Number(editPrice), discount_pct: Number(editDiscount) } : r
      ));
      uiStore.showNotification(t('Narx yangilandi'), 'success');
      setEditingId(null);
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('pricing/rules/', {
        ...form,
        product_id: Number(form.product_id),
        price: Number(form.price),
        discount_pct: Number(form.discount_pct),
        valid_until: form.valid_until || null,
      });
      uiStore.showNotification(t("Narx qoidasi qo'shildi"), 'success');
      setIsModalOpen(false);
      setForm({ product_id: '', tier: 'RETAIL', segment: '', price: '', discount_pct: '0', valid_until: '' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100">
              <Tag className="w-8 h-8" />
            </div>
            {t('Narx Siyosati')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Dinamik narxlash va chegirma qoidalari')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t("Yangi Narx Qoidasi")}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          <div className="h-64 bg-slate-100 rounded-[32px]" />
          <div className="md:col-span-3 h-64 bg-slate-100 rounded-[32px]" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left: Products List */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('Mahsulot qidirish...')}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-amber-400 transition-all text-sm font-bold shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {(products || []).map(product => {
                const isActive = activeProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-amber-50 border-amber-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-amber-100 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-black leading-tight ${isActive ? 'text-amber-700' : 'text-slate-700'}`}>
                      {product.name}
                    </span>
                  </button>
                );
              })}
              {products.length === 0 && (
                <p className="text-center text-slate-300 font-black uppercase tracking-widest text-[9px] py-8">{t('Topilmadi')}</p>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:col-span-3 space-y-6">
            {activeProduct ? (
              <>
                {/* Product Header */}
                <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Mahsulot')}</p>
                    <h3 className="text-xl font-black text-slate-900">{activeProduct.name}</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                    {productRules.length} {t('qoida')}
                  </span>
                </div>

                {/* Tier Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {TIERS.map(tier => {
                    const rule = productRules.find(r => r.tier === tier);
                    const meta = tierMeta[tier];
                    const isEditing = editingId === rule?.id;
                    if (!rule) return null;

                    return (
                      <div
                        key={tier}
                        className={`p-6 rounded-[32px] border bg-white shadow-sm hover:shadow-md transition-all ${meta.border}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${meta.bg} ${meta.color} ${meta.border}`}>
                            {meta.label}
                          </span>
                          {rule.discount_pct > 0 && (
                            <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black">
                              -{rule.discount_pct}%
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rule.segment}</p>

                        {isEditing ? (
                          <div className="space-y-2 mt-2">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Narx</p>
                              <input
                                type="number"
                                className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl outline-none focus:border-amber-500 text-sm font-black"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Chegirma %</p>
                              <input
                                type="number"
                                className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl outline-none focus:border-amber-500 text-sm font-black"
                                value={editDiscount}
                                onChange={e => setEditDiscount(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleSavePrice(rule.id)}
                                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Saqlash
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="py-2 px-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={`text-2xl font-black mt-2 mb-1 ${meta.color}`}>
                              {(rule.price || 0).toLocaleString('ru-RU')}
                              <span className="text-xs font-bold text-slate-400 ml-1">UZS</span>
                            </p>
                            {rule.valid_until && (
                              <p className="text-[9px] font-bold text-slate-400 mb-3">{rule.valid_until} gacha</p>
                            )}
                            <button
                              onClick={() => {
                                setEditingId(rule.id);
                                setEditPrice(String(rule.price));
                                setEditDiscount(String(rule.discount_pct));
                              }}
                              className={`w-full mt-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${meta.bg} ${meta.color} border ${meta.border} hover:opacity-80`}
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bar Chart Comparison */}
                {productRules.length > 0 && maxPrice > 0 && (
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <BarChart2 className="w-3.5 h-3.5" /> Narx taqqoslama
                    </h4>
                    <div className="space-y-3">
                      {(productRules || []).map(rule => {
                        const pct = maxPrice > 0 ? Math.round((rule.price / maxPrice) * 100) : 0;
                        const meta = tierMeta[rule.tier as Tier] || tierMeta.RETAIL;
                        return (
                          <div key={rule.id} className="flex items-center gap-4">
                            <span className={`w-20 shrink-0 text-[10px] font-black uppercase tracking-widest ${meta.color}`}>
                              {meta.label}
                            </span>
                            <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                              <div
                                className={`h-full rounded-full transition-all ${meta.bg.replace('bg-', 'bg-').replace('-50', '-400')} flex items-center`}
                                style={{ width: `${pct}%`, background: undefined }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: '100%',
                                    background: {
                                      RETAIL: '#3b82f6',
                                      WHOLESALE: '#6366f1',
                                      DEALER: '#10b981',
                                      VIP: '#f59e0b',
                                      PROMO: '#f43f5e',
                                    }[rule.tier] || '#94a3b8',
                                    opacity: 0.7,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="w-28 shrink-0 text-right text-xs font-black text-slate-700">
                              {(rule.price || 0).toLocaleString('ru-RU')} UZS
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[40px] border border-slate-100 flex items-center justify-center py-40">
                <div className="text-center">
                  <Tag className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">{t('Mahsulot tanlang')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Rule Modal */}
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
                  <div className="p-3 bg-amber-500 text-white rounded-2xl"><Tag className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black text-slate-900">{t('Yangi Narx Qoidasi')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mahsulot ID')}</label>
                  <input
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-amber-400 transition-all font-bold text-sm"
                    value={form.product_id}
                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Tur')}</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-amber-400 transition-all font-bold text-sm appearance-none"
                    value={form.tier}
                    onChange={e => setForm({ ...form, tier: e.target.value })}
                  >
                    {TIERS.map(k => <option key={k} value={k}>{tierLabels[k]}</option>)}
                  </select>
                </div>
                {[
                  { label: t('Segment'), key: 'segment', placeholder: t('Oddiy mijozlar') },
                  { label: t('Narx (UZS)'), key: 'price', placeholder: '45000', type: 'number' },
                  { label: t('Chegirma %'), key: 'discount_pct', placeholder: '0', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      required={field.key !== 'discount_pct'}
                      type={field.type || 'text'}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-amber-400 transition-all font-bold text-sm"
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Amal muddati (ixtiyoriy)')}</label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-amber-400 transition-all font-bold text-sm"
                    value={form.valid_until}
                    onChange={e => setForm({ ...form, valid_until: e.target.value })}
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
