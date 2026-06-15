import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2, AlertTriangle, Scale, Ruler, Droplet, TrendingUp,
  Box, Layers, ChevronRight, X, RefreshCw, Package, BarChart3,
  ClipboardList, ShieldCheck, XCircle
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';
import BlockPassport from '../production/BlockPassport';

interface QCWorkspaceProps {
  user: any;
}

type QTab = 'DASHBOARD' | 'FINAL_QC' | 'INCOMING' | 'DEFECTS' | 'STATS';

export default function QCWorkspace({ user }: QCWorkspaceProps) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<QTab>('DASHBOARD');

  // Data
  const [pendingBlocks, setPendingBlocks] = useState<any[]>([]);
  const [approvedBlocks, setApprovedBlocks] = useState<any[]>([]);
  const [rejectedBlocks, setRejectedBlocks] = useState<any[]>([]);
  const [incomingBatches, setIncomingBatches] = useState<any[]>([]);
  const [allBlocks, setAllBlocks] = useState<any[]>([]);

  // QC inspection form
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedBlockPassport, setSelectedBlockPassport] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [qaForm, setQAForm] = useState({
    moisture: 4.5,
    actual_weight: 18.5,
    length: 1000,
    width: 500,
    height: 120,
    actual_density: 16.2,
    classification: 'A_CLASS',
    visual_defects: '',
    defect_list: [] as string[],
  });

  // Incoming batch form
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | null>(null);
  const [batchWarehouse, setBatchWarehouse] = useState('');
  const [batchRejectReason, setBatchRejectReason] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [pendingRes, approvedRes, rejectedRes, batchesRes, warehousesRes] = await Promise.all([
        api.get('production/finished-blocks/?status=QC_PENDING').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/?status=READY').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/?status=QC_FAILED').catch(() => ({ data: [] })),
        api.get('batches/?status=INSPECTION').catch(() => ({ data: [] })),
        api.get('warehouses/').catch(() => ({ data: [] })),
      ]);
      const pending = pendingRes.data.results || pendingRes.data || [];
      const approved = approvedRes.data.results || approvedRes.data || [];
      const rejected = rejectedRes.data.results || rejectedRes.data || [];
      setPendingBlocks(pending);
      setApprovedBlocks(approved);
      setRejectedBlocks(rejected);
      setAllBlocks([...pending, ...approved, ...rejected]);
      setIncomingBatches(batchesRes.data.results || batchesRes.data || []);
      setWarehouses(warehousesRes.data.results || warehousesRes.data || []);
    } catch (err) {
      console.error('QCWorkspace fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-density calculation
  useEffect(() => {
    if (!selectedBlock) return;
    const vol = (qaForm.length * qaForm.width * qaForm.height) / 1e9;
    const density = vol > 0 ? parseFloat((qaForm.actual_weight / vol).toFixed(2)) : 0;
    let grade = qaForm.classification;
    if (density > 0) {
      if (density < 10) grade = 'REJECT';
      else if (density < 13) grade = 'C_CLASS';
      else if (density < 16) grade = 'B_CLASS';
      else grade = 'A_CLASS';
    }
    setQAForm(prev => ({ ...prev, actual_density: density, classification: grade }));
  }, [qaForm.actual_weight, qaForm.length, qaForm.width, qaForm.height, selectedBlock]);

  const handleInspectBlock = (block: any) => {
    setSelectedBlock(block);
    setQAForm({
      moisture: block.moisture || 4.2,
      actual_weight: block.actual_weight || 18.2,
      length: block.length || 1000,
      width: block.width || 500,
      height: block.height || 120,
      actual_density: block.density || 16.0,
      classification: 'A_CLASS',
      visual_defects: '',
      defect_list: [],
    });
  };

  const handleInspectionSubmit = async () => {
    if (!selectedBlock) return;
    setSubmitting(true);
    try {
      await api.post(`production/finished-blocks/${selectedBlock.id}/qc-check/`, qaForm);
      uiStore.showNotification(t('Sifat nazorati muvaffaqiyatli yakunlandi'), 'success');
      setSelectedBlock(null);
      fetchAll(true);
    } catch {
      uiStore.showNotification(t('Tekshiruvni yakunlashda xatolik'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchApprove = async () => {
    if (!selectedBatch || !batchWarehouse) return;
    setBatchSubmitting(true);
    try {
      await api.post(`batches/${selectedBatch.id}/qc_approve/`, { warehouse_id: batchWarehouse });
      uiStore.showNotification(t('Partiya tasdiqlandi va omborga qo\'shildi'), 'success');
      setSelectedBatch(null);
      setBatchAction(null);
      fetchAll(true);
    } catch {
      uiStore.showNotification(t('Tasdiqlashda xatolik'), 'error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleBatchReject = async () => {
    if (!selectedBatch) return;
    setBatchSubmitting(true);
    try {
      await api.post(`batches/${selectedBatch.id}/qc_reject/`, { reason: batchRejectReason });
      uiStore.showNotification(t('Partiya rad etildi'), 'success');
      setSelectedBatch(null);
      setBatchAction(null);
      fetchAll(true);
    } catch {
      uiStore.showNotification(t('Rad etishda xatolik'), 'error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const toggleDefect = (defect: string) => {
    setQAForm(prev => ({
      ...prev,
      defect_list: prev.defect_list.includes(defect)
        ? prev.defect_list.filter(d => d !== defect)
        : [...prev.defect_list, defect]
    }));
  };

  const defectOptions = [
    { key: 'CRACK', name: 'Yoriqlar' },
    { key: 'CORNER', name: 'Burchak sinishi' },
    { key: 'MOISTURE', name: 'Namlik xatoligi' },
    { key: 'DIMENSION', name: 'O\'lchamdagi og\'ish' },
    { key: 'SURFACE', name: 'G\'adir-budurlik' },
    { key: 'DENSITY', name: 'Zichlik xatoligi' },
  ];

  // KPI stats
  const total = allBlocks.length;
  const passRate = total > 0 ? ((approvedBlocks.length / total) * 100).toFixed(1) : '0.0';
  const brakRate = total > 0 ? ((rejectedBlocks.length / total) * 100).toFixed(1) : '0.0';
  const aClass = approvedBlocks.filter(b => b.classification === 'A_CLASS').length;
  const aClassPct = approvedBlocks.length > 0 ? ((aClass / approvedBlocks.length) * 100).toFixed(1) : '0.0';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[22px] flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1.5">{t('Sifat Nazorati Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Kiruvchi QC · Tayyor bloklar · Defektlar · Statistika')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kutmoqda</p>
            <p className="text-2xl font-black text-amber-400">{pendingBlocks.length + incomingBatches.length}</p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">O'tish %</p>
            <p className="text-2xl font-black text-emerald-400">{passRate}%</p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brak %</p>
            <p className={`text-2xl font-black ${parseFloat(brakRate) > 5 ? 'text-rose-400' : 'text-slate-300'}`}>{brakRate}%</p>
          </div>
          <button onClick={() => fetchAll(true)} disabled={refreshing} className="ml-2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto gap-1">
        {([
          ['DASHBOARD', 'Dashboard'],
          ['FINAL_QC', `Tayyor Bloklar (${pendingBlocks.length})`],
          ['INCOMING', `Kiruvchi QC (${incomingBatches.length})`],
          ['DEFECTS', `Defektlar (${rejectedBlocks.length})`],
          ['STATS', 'Statistika'],
        ] as [QTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t(label)}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">

        {/* ── DASHBOARD ── */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tekshiruv navbati', value: pendingBlocks.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: ClipboardList },
                { label: 'Kiruvchi partiyalar', value: incomingBatches.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
                { label: 'Tasdiqlanganlar', value: approvedBlocks.length, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
                { label: 'Rad etilgan', value: rejectedBlocks.length, color: 'text-rose-700', bg: 'bg-rose-50', icon: XCircle },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <div key={label} className={`${bg} rounded-[28px] border border-slate-100 p-6 flex flex-col gap-3`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(label)}</p>
                  <p className={`text-3xl font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Pending block list */}
            {pendingBlocks.length > 0 && (
              <div className="bg-white rounded-[32px] border border-amber-100 p-6">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t('Navbatdagi tekshiruv bloklar')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingBlocks.slice(0, 6).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <div>
                        <p className="font-black text-slate-900 text-sm">#{b.id} {b.block_id || b.lot_number || ''}</p>
                        <p className="text-xs text-slate-400">{b.produced_date ? new Date(b.produced_date).toLocaleDateString(locale) : 'Bugun'}</p>
                      </div>
                      <button
                        onClick={() => { handleInspectBlock(b); setActiveTab('FINAL_QC'); }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all"
                      >
                        Tekshirish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming batch alerts */}
            {incomingBatches.length > 0 && (
              <div className="bg-white rounded-[32px] border border-blue-100 p-6">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  {t('Kiruvchi xomashyo partiyalar (QC kutmoqda)')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {incomingBatches.slice(0, 4).map((batch: any) => (
                    <div key={batch.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div>
                        <p className="font-black text-slate-900 text-sm">{batch.batch_number}</p>
                        <p className="text-xs text-slate-400">{batch.material_name || batch.material} · {batch.quantity_kg} kg</p>
                      </div>
                      <button
                        onClick={() => { setSelectedBatch(batch); setActiveTab('INCOMING'); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all"
                      >
                        Tekshirish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingBlocks.length === 0 && incomingBatches.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-16 text-center">
                <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                <h4 className="font-black text-emerald-800 uppercase tracking-widest text-sm">{t('Barcha tekshiruvlar yakunlangan')}</h4>
                <p className="text-xs text-emerald-600 mt-1">{t('Navbatda tekshirishni kutayotgan blok yoki partiya yo\'q.')}</p>
              </div>
            )}
          </div>
        )}

        {/* ── FINAL_QC (Finished Blocks) ── */}
        {activeTab === 'FINAL_QC' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queue */}
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="font-black text-slate-900 text-lg">{t('Navbatdagi Bloklar')}</h3>
                <span className="px-3.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black animate-pulse">{pendingBlocks.length} {t('kutmoqda')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingBlocks.map((block: any) => (
                  <div
                    key={block.id}
                    onClick={() => handleInspectBlock(block)}
                    className={`p-6 bg-slate-50 hover:bg-emerald-50/20 border-2 rounded-[32px] cursor-pointer transition-all flex items-center justify-between group ${selectedBlock?.id === block.id ? 'border-emerald-400 bg-emerald-50/30' : 'border-transparent hover:border-emerald-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center font-black text-xs text-slate-400">#{block.id}</div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base leading-none mb-1">{block.block_id || block.lot_number || `Blok #${block.id}`}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{block.produced_date ? new Date(block.produced_date).toLocaleDateString(locale) : 'Bugun'}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                ))}
                {pendingBlocks.length === 0 && (
                  <div className="col-span-2 py-20 text-center text-slate-300 flex flex-col items-center gap-3">
                    <Box className="w-10 h-10 opacity-40" />
                    <p>{t('Tekshiruv uchun bloklar yo\'q')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection form */}
            <div className="bg-slate-950 rounded-[40px] text-white p-8 border border-slate-800 shadow-2xl">
              {selectedBlock ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Laboratoriya</span>
                      <h3 className="text-xl font-black mt-1">{selectedBlock.block_id || `Blok #${selectedBlock.id}`}</h3>
                    </div>
                    <button onClick={() => setSelectedBlock(null)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-xl"><X className="w-4 h-4" /></button>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><Scale className="w-3.5 h-3.5 text-blue-400" /> Haqiqiy og'irlik (kg)</label>
                    <input type="number" step="0.1" value={qaForm.actual_weight} onChange={e => setQAForm({ ...qaForm, actual_weight: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><Droplet className="w-3.5 h-3.5 text-blue-400" /> Namlik (%)</label>
                    <input type="number" step="0.1" value={qaForm.moisture} onChange={e => setQAForm({ ...qaForm, moisture: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><Ruler className="w-3.5 h-3.5 text-blue-400" /> O'lchamlar (mm)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" placeholder="L" value={qaForm.length} onChange={e => setQAForm({ ...qaForm, length: parseInt(e.target.value) || 0 })} className="p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-center" />
                      <input type="number" placeholder="W" value={qaForm.width} onChange={e => setQAForm({ ...qaForm, width: parseInt(e.target.value) || 0 })} className="p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-center" />
                      <input type="number" placeholder="H" value={qaForm.height} onChange={e => setQAForm({ ...qaForm, height: parseInt(e.target.value) || 0 })} className="p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-center" />
                    </div>
                  </div>

                  {/* Auto density */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Zichlik (auto)</span>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${
                        qaForm.classification === 'REJECT' ? 'bg-rose-500/20 text-rose-400' :
                        qaForm.classification === 'C_CLASS' ? 'bg-amber-500/20 text-amber-400' :
                        qaForm.classification === 'B_CLASS' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{qaForm.actual_density.toFixed(2)} kg/m³</span>
                    </div>
                    <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-rose-500/30 border-r border-white/5" style={{ width: '33.3%' }} />
                      <div className="h-full bg-amber-500/30 border-r border-white/5" style={{ width: '10%' }} />
                      <div className="h-full bg-blue-500/30 border-r border-white/5" style={{ width: '10%' }} />
                      <div className="h-full bg-emerald-500/30" style={{ width: '46.7%' }} />
                      <div className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] rounded-full transition-all duration-500"
                        style={{ left: `${Math.min(Math.max((qaForm.actual_density / 30) * 100, 2), 97)}%` }} />
                    </div>
                  </div>

                  {/* Grade selection */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Sifat sinfi</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['A_CLASS', 'B_CLASS', 'C_CLASS', 'REJECT'].map(grade => (
                        <button key={grade} type="button" onClick={() => setQAForm({ ...qaForm, classification: grade })}
                          className={`py-3 rounded-xl font-black text-[9px] border-2 transition-all uppercase ${qaForm.classification === grade ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-white/5 text-slate-400 hover:border-white/10'}`}>
                          {grade.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Defect checklist */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nuqsonlar</label>
                    <div className="flex flex-wrap gap-2">
                      {defectOptions.map(opt => (
                        <button key={opt.key} type="button" onClick={() => toggleDefect(opt.key)}
                          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${qaForm.defect_list.includes(opt.key) ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button disabled={submitting} onClick={handleInspectionSubmit}
                    className="w-full bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
                    {submitting ? 'Saqlanmoqda...' : 'Sifat belgisini urish'}
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <Droplet className="w-10 h-10 text-slate-500 mb-4 animate-pulse" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laboratoriya jarayoni</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Chap tarafdan blokni tanlang</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INCOMING (Raw Material Batch QC) ── */}
        {activeTab === 'INCOMING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 p-8 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="font-black text-slate-900 text-lg">Kiruvchi Xomashyo Partiyalar</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">{incomingBatches.length} QC kutmoqda</span>
              </div>
              {incomingBatches.map((batch: any) => (
                <div key={batch.id}
                  onClick={() => setSelectedBatch(batch)}
                  className={`p-5 bg-slate-50 border-2 rounded-2xl cursor-pointer transition-all ${selectedBatch?.id === batch.id ? 'border-blue-400 bg-blue-50/30' : 'border-transparent hover:border-blue-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900">{batch.batch_number}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{batch.material_name || batch.material} · {batch.supplier_name || batch.supplier} · {batch.quantity_kg} kg</p>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </div>
                  {batch.invoice_number && <p className="text-[10px] text-slate-400 mt-1">Faktura: {batch.invoice_number}</p>}
                </div>
              ))}
              {incomingBatches.length === 0 && (
                <div className="py-20 text-center text-slate-300 flex flex-col items-center gap-3">
                  <Package className="w-10 h-10 opacity-40" />
                  <p>Kiruvchi QC navbatida partiya yo'q</p>
                </div>
              )}
            </div>

            {/* Batch action panel */}
            <div className="bg-slate-950 text-white rounded-[40px] border border-slate-800 p-8">
              {selectedBatch ? (
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Kiruvchi QC</span>
                      <h3 className="text-xl font-black mt-1">{selectedBatch.batch_number}</h3>
                      <p className="text-xs text-slate-400">{selectedBatch.material_name} · {selectedBatch.quantity_kg} kg</p>
                    </div>
                    <button onClick={() => { setSelectedBatch(null); setBatchAction(null); }} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-xl"><X className="w-4 h-4" /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Ta'minotchi</p>
                      <p className="font-black text-sm mt-1">{selectedBatch.supplier_name || '—'}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Miqdor</p>
                      <p className="font-black text-sm mt-1">{selectedBatch.quantity_kg} kg</p>
                    </div>
                    {selectedBatch.moisture_percent !== undefined && (
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase">Namlik</p>
                        <p className="font-black text-sm mt-1">{selectedBatch.moisture_percent}%</p>
                      </div>
                    )}
                    {selectedBatch.size_mm && (
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase">Granula o'lchami</p>
                        <p className="font-black text-sm mt-1">{selectedBatch.size_mm} mm</p>
                      </div>
                    )}
                  </div>

                  {/* Action choice */}
                  {!batchAction ? (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button onClick={() => setBatchAction('approve')} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all">
                        ✅ Tasdiqlash
                      </button>
                      <button onClick={() => setBatchAction('reject')} className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all">
                        ❌ Rad etish
                      </button>
                    </div>
                  ) : batchAction === 'approve' ? (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Qaysi omborga?</label>
                      <select value={batchWarehouse} onChange={e => setBatchWarehouse(e.target.value)}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
                        <option value="">Ombor tanlang...</option>
                        {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setBatchAction(null)} className="py-3 bg-white/5 text-slate-400 rounded-xl font-black text-xs uppercase">Orqaga</button>
                        <button disabled={!batchWarehouse || batchSubmitting} onClick={handleBatchApprove}
                          className="py-3 bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all">
                          {batchSubmitting ? '...' : 'Tasdiqlash'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Rad etish sababi</label>
                      <textarea value={batchRejectReason} onChange={e => setBatchRejectReason(e.target.value)}
                        placeholder="Sabab..."
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-rose-500 resize-none h-20" />
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setBatchAction(null)} className="py-3 bg-white/5 text-slate-400 rounded-xl font-black text-xs uppercase">Orqaga</button>
                        <button disabled={batchSubmitting} onClick={handleBatchReject}
                          className="py-3 bg-rose-600 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase hover:bg-rose-700 transition-all">
                          {batchSubmitting ? '...' : 'Rad etish'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <Package className="w-10 h-10 text-slate-500 mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partiyani tanlang</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DEFECTS ── */}
        {activeTab === 'DEFECTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">Rad etilgan bloklar</h3>
              <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-xs font-black">{rejectedBlocks.length} ta</span>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    {['ID', 'Blok', 'Status', 'Sabab', 'Zichlik', 'Passport'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rejectedBlocks.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-all text-xs">
                      <td className="px-5 py-4 font-black text-slate-500">#{b.id}</td>
                      <td className="px-5 py-4 font-black text-slate-900">{b.block_id || b.lot_number || `#${b.id}`}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black">{b.status}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{b.rejection_reason || b.qc_notes || '—'}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{b.density || b.actual_density ? `${b.density || b.actual_density} kg/m³` : '—'}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelectedBlockPassport({ block_id: b.block_id })}
                          className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-black text-indigo-600 hover:bg-indigo-100 transition-all uppercase">
                          Ko'rish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rejectedBlocks.length === 0 && (
                <div className="py-20 text-center text-slate-300">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Rad etilgan bloklar yo'q</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {activeTab === 'STATS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Jami tekshirilgan', value: total, sub: 'barcha bloklar', color: 'text-slate-900' },
                { label: 'O\'tish darajasi', value: `${passRate}%`, sub: 'tasdiqlanganlar', color: 'text-emerald-700' },
                { label: 'Brak darajasi', value: `${brakRate}%`, sub: 'rad etilganlar', color: parseFloat(brakRate) > 5 ? 'text-rose-700' : 'text-slate-700' },
                { label: 'A-Class ulushi', value: `${aClassPct}%`, sub: `${aClass} ta blok`, color: 'text-indigo-700' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-white rounded-[28px] border border-slate-100 p-6 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t(label)}</p>
                  <p className={`text-3xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6">
              <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Holat bo'yicha taqsimot</h3>
              <div className="space-y-3">
                {[
                  { label: 'READY (Tayyor)', count: approvedBlocks.length, color: 'bg-emerald-500' },
                  { label: 'QC_FAILED (Rad etilgan)', count: rejectedBlocks.length, color: 'bg-rose-500' },
                  { label: 'QC_PENDING (Kutmoqda)', count: pendingBlocks.length, color: 'bg-amber-400' },
                ].map(({ label, count, color }) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-40 text-xs font-bold text-slate-500">{label}</span>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-black text-slate-700">{count}</span>
                      <span className="w-10 text-right text-[10px] font-bold text-slate-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grade breakdown */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6">
              <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest flex items-center gap-2"><Layers className="w-4 h-4" /> Sifat sinfi bo'yicha</h3>
              <div className="space-y-3">
                {['A_CLASS', 'B_CLASS', 'C_CLASS', 'REJECT'].map(grade => {
                  const count = approvedBlocks.filter((b: any) => b.classification === grade).length + rejectedBlocks.filter((b: any) => b.classification === grade).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <span className="w-28 text-xs font-bold text-slate-500">{grade.replace('_', ' ')}</span>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${grade === 'A_CLASS' ? 'bg-emerald-500' : grade === 'B_CLASS' ? 'bg-blue-400' : grade === 'C_CLASS' ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-black text-slate-700">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Passport drawer */}
      <AnimatePresence>
        {selectedBlockPassport && (
          <div className="fixed inset-0 z-[300] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBlockPassport(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white h-full w-full max-w-lg shadow-2xl border-l border-slate-100 overflow-y-auto">
              <div className="p-8">
                <BlockPassport
                  block={allBlocks.find(b => b.block_id === selectedBlockPassport.block_id) || { block_id: selectedBlockPassport.block_id }}
                  onClose={() => setSelectedBlockPassport(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
