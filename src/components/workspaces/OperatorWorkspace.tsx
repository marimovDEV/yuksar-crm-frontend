import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Layers, Package, Box, Wind, FileText,
  Play, Pause, CheckCircle2, Plus, X, RefreshCw, Clock,
  AlertTriangle, Thermometer, Gauge, TrendingUp, Users
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface OperatorWorkspaceProps {
  user: any;
}

type OTab = 'DASHBOARD' | 'PREFOAMER' | 'BUNKERS' | 'MOLDING' | 'DRYING' | 'ORDERS' | 'SCADA';

export default function OperatorWorkspace({ user }: OperatorWorkspaceProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<OTab>('DASHBOARD');

  // Real data states
  const [zamesList, setZamesList] = useState<any[]>([]);
  const [bunkers, setBunkers] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [drying, setDrying] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Create Zames form
  const [showZamesForm, setShowZamesForm] = useState(false);
  const [zamesForm, setZamesForm] = useState({
    recipe_id: '',
    planned_weight: 1000,
    shift: 'DAY',
    notes: ''
  });

  // Formovka (molding) form
  const [showFormovkaModal, setShowFormovkaModal] = useState(false);
  const [selectedBunker, setSelectedBunker] = useState<any>(null);
  const [formovkaData, setFormovkaData] = useState({
    block_count: 12,
    length: 1000,
    width: 1000,
    height: 1000,
    shift: 'DAY'
  });

  // Finish zames form
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedZames, setSelectedZames] = useState<any>(null);
  const [outputWeight, setOutputWeight] = useState('');

  const today = new Date().toDateString();

  const fetchAll = useCallback(async () => {
    try {
      const [zRes, bRes, blRes, dRes, oRes, rRes] = await Promise.all([
        api.get('production/zames/?ordering=-created_at').catch(() => ({ data: [] })),
        api.get('production/bunkers/').catch(() => ({ data: [] })),
        api.get('production/blocks/?ordering=-date').catch(() => ({ data: [] })),
        api.get('production/drying/?ordering=-start_time').catch(() => ({ data: [] })),
        api.get('production/orders/?ordering=-created_at').catch(() => ({ data: [] })),
        api.get('production/recipes/').catch(() => ({ data: [] })),
      ]);
      setZamesList(Array.isArray(zRes.data?.results || zRes.data) ? zRes.data?.results || zRes.data : []);
      setBunkers(Array.isArray(bRes.data?.results || bRes.data) ? bRes.data?.results || bRes.data : []);
      setBlocks(Array.isArray(blRes.data?.results || blRes.data) ? blRes.data?.results || blRes.data : []);
      setDrying(Array.isArray(dRes.data?.results || dRes.data) ? dRes.data?.results || dRes.data : []);
      setOrders(Array.isArray(oRes.data?.results || oRes.data) ? oRes.data?.results || oRes.data : []);
      setRecipes(Array.isArray(rRes.data?.results || rRes.data) ? rRes.data?.results || rRes.data : []);
    } catch (err) {
      console.error("OperatorWorkspace fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await api.get('telemetry/tags/live/');
      setLiveData(res.data || {});
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchTelemetry();
    const prod = setInterval(fetchAll, 30000);
    const telem = setInterval(fetchTelemetry, 5000);
    return () => { clearInterval(prod); clearInterval(telem); };
  }, [fetchAll, fetchTelemetry]);

  // Derived stats
  const activeZames = zamesList.filter(z => z.status === 'IN_PROGRESS');
  const pendingZames = zamesList.filter(z => z.status === 'PENDING' || z.status === 'CREATED');
  const todayBlocks = blocks.filter(b => new Date(b.date).toDateString() === today);
  const occupiedBunkers = bunkers.filter(b => b.is_occupied);
  const activeDrying = drying.filter(d => d.status === 'DRYING');
  const pendingOrders = orders.filter(o => ['PENDING', 'IN_PROGRESS'].includes(o.status));

  // Actions
  const handleZamesStart = async (id: number) => {
    try {
      await api.post(`production/zames/${id}/start/`);
      uiStore.showNotification(t('Zames boshlandi'), 'success');
      fetchAll();
    } catch (e: any) {
      uiStore.showNotification(e?.response?.data?.error || t('Xatolik'), 'error');
    }
  };

  const handleZamesFinish = async () => {
    if (!selectedZames || !outputWeight) {
      uiStore.showNotification(t("Chiqish og'irligini kiriting"), 'error');
      return;
    }
    try {
      await api.post(`production/zames/${selectedZames.id}/finish/`, { output_weight: Number(outputWeight) });
      uiStore.showNotification(t('Zames yakunlandi'), 'success');
      setShowFinishModal(false);
      setOutputWeight('');
      fetchAll();
    } catch (e: any) {
      uiStore.showNotification(e?.response?.data?.error || t('Xatolik'), 'error');
    }
  };

  const handleCreateZames = async () => {
    if (!zamesForm.recipe_id || zamesForm.planned_weight <= 0) {
      uiStore.showNotification(t("Retsept va reja og'irligini kiriting"), 'error');
      return;
    }
    try {
      await api.post('production/zames/', {
        recipe: Number(zamesForm.recipe_id),
        planned_weight: zamesForm.planned_weight,
        shift: zamesForm.shift,
        notes: zamesForm.notes
      });
      uiStore.showNotification(t('Yangi Zames yaratildi'), 'success');
      setShowZamesForm(false);
      setZamesForm({ recipe_id: '', planned_weight: 1000, shift: 'DAY', notes: '' });
      fetchAll();
    } catch (e: any) {
      uiStore.showNotification(e?.response?.data?.error || t('Xatolik'), 'error');
    }
  };

  const handleFormovka = async () => {
    if (!selectedBunker) return;
    try {
      await api.post(`production/bunkers/${selectedBunker.id}/formovka/`, formovkaData);
      uiStore.showNotification(t('Formovka yakunlandi. Blok yaratildi.'), 'success');
      setShowFormovkaModal(false);
      fetchAll();
    } catch (e: any) {
      uiStore.showNotification(e?.response?.data?.error || t('Xatolik'), 'error');
    }
  };

  const handleBunkerRelease = async (id: number) => {
    try {
      await api.post(`production/bunkers/${id}/force-release/`);
      uiStore.showNotification(t("Bunker bo'shatildi"), 'success');
      fetchAll();
    } catch (e: any) {
      uiStore.showNotification(e?.response?.data?.error || t('Xatolik'), 'error');
    }
  };

  const tabs: { id: OTab; label: string; icon: any; badge?: number }[] = [
    { id: 'DASHBOARD',  label: t('Dashboard'),      icon: LayoutDashboard },
    { id: 'PREFOAMER',  label: t('Predvspenivatel'), icon: Layers, badge: activeZames.length },
    { id: 'BUNKERS',    label: t('Bunkerlar'),       icon: Package, badge: occupiedBunkers.length },
    { id: 'MOLDING',    label: t('Formovka'),        icon: Box },
    { id: 'DRYING',     label: t('Quritish'),        icon: Wind, badge: activeDrying.length },
    { id: 'ORDERS',     label: t('Buyurtmalar'),     icon: FileText, badge: pendingOrders.length },
    { id: 'SCADA',      label: t('SCADA'),           icon: Gauge },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{t('Ishlab Chiqarish Paneli')}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.name || user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          {[
            { label: t('Aktiv zames'), value: activeZames.length, color: 'indigo' },
            { label: t('Band bunker'), value: `${occupiedBunkers.length}/${bunkers.length}`, color: 'amber' },
            { label: t('Bugun blok'), value: todayBlocks.length, color: 'emerald' },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-center">
              <p className="text-[8px] font-black text-white/40 uppercase">{s.label}</p>
              <p className="text-xl font-black text-white">{s.value}</p>
            </div>
          ))}
          <button onClick={() => { setActiveTab('PREFOAMER'); setShowZamesForm(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
            <Plus className="w-4 h-4" /> {t('Yangi Zames')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 relative ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full ml-1">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── DASHBOARD ─── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('Aktiv Zameslar'), value: activeZames.length, icon: Layers, color: 'indigo', action: () => setActiveTab('PREFOAMER') },
              { label: t('Band Bunkerlar'), value: `${occupiedBunkers.length} / ${bunkers.length}`, icon: Package, color: 'amber', action: () => setActiveTab('BUNKERS') },
              { label: t('Bugungi Bloklar'), value: todayBlocks.reduce((s, b) => s + (b.block_count || 0), 0), icon: Box, color: 'emerald', action: () => setActiveTab('MOLDING') },
              { label: t('Qurishda'), value: activeDrying.length, icon: Wind, color: 'cyan', action: () => setActiveTab('DRYING') },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={kpi.action} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
                <div className={`w-10 h-10 bg-${kpi.color}-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Active Zames list */}
          {activeZames.length > 0 && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Aktiv Zameslar')}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {activeZames.map(z => (
                  <div key={z.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900">{z.zames_number || `#${z.id}`}</p>
                      <p className="text-[10px] font-bold text-slate-400">{z.recipe_name} · {z.planned_weight} kg</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase">{t('Jarayonda')}</span>
                      <button onClick={() => { setSelectedZames(z); setShowFinishModal(true); }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[9px] uppercase transition-all">
                        {t('Yakunlash')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bunker status grid */}
          {bunkers.length > 0 && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">{t('Bunkerlar Holati')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {bunkers.map(b => (
                  <div key={b.id} className={`rounded-2xl p-4 text-center border ${b.is_occupied ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="text-[10px] font-black text-slate-500 uppercase">{b.name || `#${b.id}`}</p>
                    <p className={`text-xs font-black mt-1 ${b.is_occupied ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {b.is_occupied ? t('Band') : t("Bo'sh")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending orders */}
          {pendingOrders.length > 0 && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t('Bajarilishi kerak buyurtmalar')}</h3>
                <button onClick={() => setActiveTab('ORDERS')} className="text-[10px] font-black text-indigo-600 hover:underline uppercase">{t("Barchasi")} →</button>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900">{o.order_number || `BO-${o.id}`}</p>
                      <p className="text-[10px] font-bold text-slate-400">{o.product_name} · {o.quantity} {t('dona')}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${o.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                      {t(o.status_display || o.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PREFOAMER (PREDVSPENIVATEL) ─── */}
      {activeTab === 'PREFOAMER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">{t('Predvspenivatel — Zameslar')}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{zamesList.length} {t('ta zames')} · {activeZames.length} {t('ta aktiv')}</p>
            </div>
            <button onClick={() => setShowZamesForm(true)} className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase transition-all">
              <Plus className="w-4 h-4" /> {t('Yangi Zames')}
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  {[t('Zames'), t('Retsept'), t("Og'irlik (kg)"), t('Smena'), t('Status'), t('Amallar')].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {zamesList.map(z => (
                  <tr key={z.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-black text-slate-900">{z.zames_number || `#${z.id}`}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{z.recipe_name || z.recipe?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{z.planned_weight} → {z.output_weight || '…'}</td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {t(z.shift === 'DAY' ? 'Kungi' : z.shift === 'NIGHT' ? 'Tungi' : z.shift || 'Kungi')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        z.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700' :
                        z.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{t(z.status_display || z.status || 'PENDING')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(z.status === 'PENDING' || z.status === 'CREATED') && (
                          <button onClick={() => handleZamesStart(z.id)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[9px] uppercase transition-all flex items-center gap-1">
                            <Play className="w-3 h-3 fill-current" /> {t('Boshlash')}
                          </button>
                        )}
                        {z.status === 'IN_PROGRESS' && (
                          <button onClick={() => { setSelectedZames(z); setShowFinishModal(true); }} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[9px] uppercase transition-all flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {t('Yakunlash')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {zamesList.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-300 text-sm italic">{t("Hali zames yo'q. Yangi zames yarating.")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── BUNKERS ─── */}
      {activeTab === 'BUNKERS' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">{t('Bunkerlar Boshqaruvi')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bunkers.map(b => (
              <div key={b.id} className={`bg-white rounded-[32px] border shadow-sm p-6 space-y-4 ${b.is_occupied ? 'border-amber-200' : 'border-emerald-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900">{b.name || `Bunker #${b.id}`}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{b.material_type || '—'}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${b.is_occupied ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {b.is_occupied ? t('Band') : t("Bo'sh")}
                  </span>
                </div>
                {b.is_occupied && (
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-600">{t("Yetilish vaqti")}</span>
                      <span className="font-black text-slate-900">{b.aging_hours || '—'} {t('soat')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-600">{t("Zames")}</span>
                      <span className="font-black text-slate-900">{b.current_zames_number || '—'}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {b.is_occupied && (
                    <>
                      <button onClick={() => { setSelectedBunker(b); setShowFormovkaModal(true); }}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[9px] uppercase transition-all">
                        {t('Formovkaga Yuborish')}
                      </button>
                      <button onClick={() => handleBunkerRelease(b.id)}
                        className="px-4 py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-2xl font-black text-[9px] uppercase transition-all">
                        {t("Bo'shatish")}
                      </button>
                    </>
                  )}
                  {!b.is_occupied && (
                    <div className="flex-1 py-3 bg-slate-50 text-center text-[9px] font-black text-slate-300 uppercase rounded-2xl">{t("Bunker bo'sh")}</div>
                  )}
                </div>
              </div>
            ))}
            {bunkers.length === 0 && (
              <div className="col-span-3 py-20 text-center text-slate-300 text-sm italic">{t("Bunkerlar topilmadi")}</div>
            )}
          </div>
        </div>
      )}

      {/* ─── MOLDING (FORMOVKA) ─── */}
      {activeTab === 'MOLDING' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">{t('Formovka — Blok Ishlab Chiqarish')}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{todayBlocks.length} {t('ta blok bugun')}</p>
            </div>
          </div>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  {[t('Sana'), t('Forma'), t('Zames'), t('Blok soni'), t("O'lchamlar"), t('Zichlik'), t('Status')].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {blocks.slice(0, 50).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{b.form_number || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{b.zames_number || '—'}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{b.block_count}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{b.length}×{b.width}×{b.height}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{b.density} kg/m³</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        b.status === 'COMPLETED' || b.status === 'READY' ? 'bg-emerald-50 text-emerald-700' :
                        b.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{t(b.status_display || b.status)}</span>
                    </td>
                  </tr>
                ))}
                {blocks.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-300 text-sm italic">{t("Bloklar topilmadi")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── DRYING ─── */}
      {activeTab === 'DRYING' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">{t('Quritish Nazorati')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drying.map(d => (
              <div key={d.id} className={`bg-white rounded-[32px] border shadow-sm p-6 ${d.status === 'DRYING' ? 'border-amber-200' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-black text-slate-900">{d.block_number || `Quritish #${d.id}`}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{t('Boshlanish')}: {new Date(d.start_time).toLocaleString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${d.status === 'DRYING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {t(d.status_display || d.status)}
                  </span>
                </div>
                {d.status === 'DRYING' && d.start_time && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t("Quritish vaqti")}</p>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, ((Date.now() - new Date(d.start_time).getTime()) / (48 * 3600000)) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">{t("Tavsiya: 48 soat")}</p>
                  </div>
                )}
              </div>
            ))}
            {drying.length === 0 && (
              <div className="col-span-2 py-16 text-center">
                <Wind className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-300 text-sm italic">{t("Hozirda quritilayotgan blok yo'q")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ORDERS ─── */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">{t('Ishlab Chiqarish Buyurtmalari')}</h2>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  {[t('Buyurtma'), t('Mahsulot'), t('Soni'), t('Muddat'), t('Status'), t('Bajaruvchi')].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-black text-slate-900">{o.order_number || `BO-${o.id}`}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{o.product_name || o.recipe_name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{o.quantity} {t('dona')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        o.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{t(o.status_display || o.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{o.assigned_to_name || '—'}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-300 text-sm italic">{t("Buyurtmalar topilmadi")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── SCADA LIVE ─── */}
      {activeTab === 'SCADA' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">{t('SCADA — Real Vaqt Monitoringi')}</h2>
            <button onClick={fetchTelemetry} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase">
              <RefreshCw className="w-3.5 h-3.5" /> {t('Yangilash')}
            </button>
          </div>
          <div className="bg-slate-950 rounded-[40px] p-8 border border-slate-800 shadow-2xl">
            <h3 className="font-black text-slate-100 text-sm uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">{t('Joriy Texnologik Parametrlar')}</h3>
            {Object.keys(liveData).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(liveData).filter(([k]) => !['active_prefoamers', 'active_molders'].includes(k)).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{(val?.name || key).replace(/_/g, ' ')}</p>
                    <p className="text-xl font-black text-slate-100">
                      {typeof val === 'object' ? (val?.value ?? '—') : val}
                      <span className="text-[10px] text-slate-500 ml-1">{val?.unit || ''}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gauge className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">{t("PLC ulanmagan yoki ma'lumot yo'q")}</p>
                <p className="text-slate-600 text-xs mt-2">{t("Telemetry serverga ulanishni tekshiring")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Modals ─── */}

      {/* Create Zames Modal */}
      <AnimatePresence>
        {showZamesForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowZamesForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{t('Yangi Zames Yaratish')}</h3>
                <button onClick={() => setShowZamesForm(false)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Retsept')}</label>
                  <select value={zamesForm.recipe_id} onChange={e => setZamesForm({ ...zamesForm, recipe_id: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm">
                    <option value="">{t('Retseptni tanlang')}</option>
                    {recipes.map(r => <option key={r.id} value={r.id}>{r.name} (zichlik: {r.density} kg/m³)</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t("Reja og'irligi (kg)")}</label>
                  <input type="number" value={zamesForm.planned_weight} onChange={e => setZamesForm({ ...zamesForm, planned_weight: Number(e.target.value) })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-black text-2xl text-center" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Smena')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: 'DAY', l: t('Kungi') }, { v: 'NIGHT', l: t('Tungi') }].map(s => (
                      <button key={s.v} type="button" onClick={() => setZamesForm({ ...zamesForm, shift: s.v })} className={`py-3 rounded-xl font-black text-[10px] border-2 transition-all ${zamesForm.shift === s.v ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>{s.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Izoh (ixtiyoriy)')}</label>
                  <textarea value={zamesForm.notes} onChange={e => setZamesForm({ ...zamesForm, notes: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm resize-none h-16" />
                </div>
                <button onClick={handleCreateZames} className="w-full bg-slate-900 text-white py-4 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl transition-all">
                  {t('Zames Yaratish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finish Zames Modal */}
      <AnimatePresence>
        {showFinishModal && selectedZames && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFinishModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{t('Zamesi Yakunlash')}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{selectedZames.zames_number}</p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t("Haqiqiy chiqish og'irligi (kg)")}</label>
                  <input type="number" value={outputWeight} onChange={e => setOutputWeight(e.target.value)} placeholder={String(selectedZames.planned_weight)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-black text-2xl text-center" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowFinishModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">{t('Bekor')}</button>
                <button onClick={handleZamesFinish} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">{t('Yakunlash')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Formovka Modal */}
      <AnimatePresence>
        {showFormovkaModal && selectedBunker && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormovkaModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{t('Formovka')} — {selectedBunker.name}</h3>
                <button onClick={() => setShowFormovkaModal(false)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Blok soni')}</label>
                  <input type="number" value={formovkaData.block_count} onChange={e => setFormovkaData({ ...formovkaData, block_count: Number(e.target.value) })} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-black text-2xl text-center" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['length', t('Uzunlik (mm)')], ['width', t('Kenglik (mm)')], ['height', t('Balandlik (mm)')]].map(([k, l]) => (
                    <div key={k}>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{l}</label>
                      <input type="number" value={(formovkaData as any)[k]} onChange={e => setFormovkaData({ ...formovkaData, [k]: Number(e.target.value) })} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-black text-center text-sm" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">{t('Smena')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: 'DAY', l: t('Kungi') }, { v: 'NIGHT', l: t('Tungi') }].map(s => (
                      <button key={s.v} type="button" onClick={() => setFormovkaData({ ...formovkaData, shift: s.v })} className={`py-3 rounded-xl font-black text-[10px] border-2 transition-all ${formovkaData.shift === s.v ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>{s.l}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleFormovka} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[22px] font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
                  {t('Formovkani Yakunlash & Blok Yaratish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
