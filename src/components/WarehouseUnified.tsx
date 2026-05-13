import React, { useState, useEffect, useMemo } from 'react';
import {
  Database, Layers, Package, ArrowRightLeft, Search, Plus, QrCode,
  TrendingUp, CheckCircle2, AlertTriangle, Box, Truck, ArrowUpRight,
  Clock, X, Archive, BarChart3, Activity, Heart, ChevronRight, Scissors,
  MapPin, FileText, RefreshCw, Eye, Zap, ClipboardList, RotateCcw,
  Trash2, Send, CheckSquare, ArrowRight, TrendingDown, Gauge,
  ShieldCheck, Download, Filter, AlertCircle, Package2,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import ScannerModal from './ScannerModal';

interface WarehouseUnifiedProps { user: User; }

type WTab = 'RAW' | 'WIP' | 'FINISHED' | 'MOVEMENTS' | 'ZONES' | 'ANALYTICS' | 'STOCKTAKE';

const MOVEMENT_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  RECEIPT:    { label: 'Kirim',        color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ISSUE:      { label: 'Chiqim',       color: 'text-rose-600',    bg: 'bg-rose-50'    },
  TRANSFER:   { label: 'O\'tkazma',    color: 'text-blue-600',    bg: 'bg-blue-50'    },
  PRODUCTION: { label: 'Ishlab ch.',   color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
  WRITE_OFF:  { label: 'Hisobdan ch.', color: 'text-amber-600',   bg: 'bg-amber-50'   },
  CORRECTION: { label: 'Tuzatish',     color: 'text-slate-600',   bg: 'bg-slate-100'  },
};

const ZONES = [
  { id: 'A-01', name: 'Zona A-01', type: 'Xom Ashyo',       capacity: 78, items: 12, color: 'blue'    },
  { id: 'A-02', name: 'Zona A-02', type: 'Xom Ashyo',       capacity: 45, items: 8,  color: 'blue'    },
  { id: 'B-01', name: 'Zona B-01', type: 'WIP Buffer',      capacity: 60, items: 6,  color: 'amber'   },
  { id: 'C-01', name: 'Cold Store', type: 'Sovutgich',      capacity: 30, items: 3,  color: 'cyan'    },
  { id: 'D-01', name: 'Tayyor',     type: 'Tayyor Mahsulot',capacity: 85, items: 20, color: 'emerald' },
  { id: 'D-02', name: 'Karantin',   type: 'QC Hold',        capacity: 15, items: 2,  color: 'rose'    },
];

const DEMO_FEED = [
  { id: 1, type: 'RECEIPT',    text: '500 kg Granula EPS qabul qilindi',         time: '2 daq oldin',    icon: ArrowUpRight,  color: 'emerald' },
  { id: 2, type: 'PRODUCTION', text: '2.4 m³ blok ishlab chiqarishga berildi',   time: '18 daq oldin',   icon: Zap,           color: 'indigo'  },
  { id: 3, type: 'TRANSFER',   text: 'Batch #302 → Zona D-01 ga o\'tkazildi',    time: '1 soat oldin',   icon: ArrowRightLeft, color: 'blue'   },
  { id: 4, type: 'ISSUE',      text: '180 kg Penoplast Blok jo\'natildi',         time: '2 soat oldin',   icon: Send,          color: 'rose'    },
  { id: 5, type: 'WRITE_OFF',  text: 'Batch #289 — 12 kg hisobdan chiqarildi',   time: '3 soat oldin',   icon: Trash2,        color: 'amber'   },
];

const DEMO_MOVEMENTS = [
  { id: 1, date: '2025-06-01 09:14', type: 'RECEIPT',    material: 'Granula EPS',    qty: 500,  unit: 'kg',   from: 'Yetkazuvchi',     to: 'Zona A-01', operator: 'Sardor B.', ref: 'INV-0021', status: 'OK'      },
  { id: 2, date: '2025-06-01 10:32', type: 'PRODUCTION', material: 'Granula EPS',    qty: 120,  unit: 'kg',   from: 'Zona A-01',       to: 'Ishlab ch.',operator: 'Jasur U.', ref: 'PO-0044',  status: 'OK'      },
  { id: 3, date: '2025-06-01 11:00', type: 'TRANSFER',   material: 'Tayyor Blok',    qty: 5,    unit: 'm³',   from: 'Zona B-01',       to: 'Zona D-01', operator: 'Sardor B.', ref: 'TR-0012',  status: 'OK'      },
  { id: 4, date: '2025-06-01 12:45', type: 'ISSUE',      material: 'Penoplast 20kg', qty: 30,   unit: 'm³',   from: 'Zona D-01',       to: 'Mijoz',     operator: 'Nodir M.', ref: 'INV-A044', status: 'OK'      },
  { id: 5, date: '2025-06-01 14:00', type: 'WRITE_OFF',  material: 'Chiqindi Polimer',qty: 12,  unit: 'kg',   from: 'Zona B-01',       to: 'Chiqindi',  operator: 'Jasur U.', ref: 'WO-0005',  status: 'OK'      },
  { id: 6, date: '2025-05-31 16:20', type: 'CORRECTION', material: 'Penoglue',       qty: -5,   unit: 'kg',   from: 'Inventarizatsiya', to: 'Tuzatish',  operator: 'Admin',    ref: 'ADJ-0003', status: 'PENDING' },
];

const DEMO_STOCKTAKE = [
  { id: 1, material: 'Granula EPS',     sku: 'RM-001', expected: 380, counted: null, unit: 'kg',  zone: 'A-01', status: 'PENDING' },
  { id: 2, material: 'Penoglue',        sku: 'RM-002', expected: 95,  counted: 93,   unit: 'kg',  zone: 'A-01', status: 'COUNTED' },
  { id: 3, material: 'Polimer Qatlam',  sku: 'RM-003', expected: 200, counted: 200,  unit: 'm²',  zone: 'A-02', status: 'OK'      },
  { id: 4, material: 'Penoplast 20',    sku: 'FG-001', expected: 42,  counted: 40,   unit: 'm³',  zone: 'D-01', status: 'MISMATCH'},
  { id: 5, material: 'Penoplast 25',    sku: 'FG-002', expected: 28,  counted: null, unit: 'm³',  zone: 'D-01', status: 'PENDING' },
];

export default function WarehouseUnified({ user }: WarehouseUnifiedProps) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<WTab>('RAW');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [movFilter, setMovFilter] = useState<string>('ALL');

  // Data
  const [stocks, setStocks]         = useState<any[]>([]);
  const [blocks, setBlocks]         = useState<any[]>([]);
  const [transfers, setTransfers]   = useState<any[]>([]);
  const [movements, setMovements]   = useState<any[]>(DEMO_MOVEMENTS);
  const [stocktake, setStocktake]   = useState<any[]>(DEMO_STOCKTAKE);
  const [alerts, setAlerts]         = useState<any[]>([]);

  // Modals
  const [scannerOpen,  setScannerOpen]  = useState(false);
  const [kirimOpen,    setKirimOpen]    = useState(false);
  const [chiqimOpen,   setChiqimOpen]   = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [detailItem,   setDetailItem]   = useState<any>(null);

  // Kirim form
  const [kirimForm, setKirimForm] = useState({ material_id: '', supplier: '', invoice_number: '', batch_number: '', quantity: '', unit_price: '', qc_status: 'PASSED', zone: 'A-01', notes: '' });
  // Chiqim form
  const [chiqimForm, setChiqimForm] = useState({ material_id: '', movement_type: 'ISSUE', quantity: '', destination: '', reason: '', notes: '' });
  // Transfer form
  const [transferForm, setTransferForm] = useState({ material_id: '', quantity: '', from_zone: 'A-01', to_zone: 'D-01', reason: '', notes: '' });
  // Write-off form
  const [writeOffForm, setWriteOffForm] = useState({ material_id: '', quantity: '', reason: 'EXPIRED', notes: '' });

  const [saving, setSaving] = useState(false);

  const isAdmin = ['Bosh Admin', 'Admin', 'Omborchi'].includes(user.role || '');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'RAW') {
        const res = await api.get('stocks/', { params: { warehouse_name: 'Sklad №1' } });
        setStocks(res.data.results || res.data);
      } else if (activeTab === 'WIP') {
        const res = await api.get('production/blocks/');
        setBlocks(res.data.results || res.data);
      } else if (activeTab === 'FINISHED') {
        const res = await api.get('stocks/', { params: { warehouse: 3 } });
        setStocks(res.data.results || res.data);
      } else if (activeTab === 'MOVEMENTS') {
        try {
          const res = await api.get('warehouse/movements/');
          const data = res.data.results || res.data;
          if (Array.isArray(data) && data.length > 0) setMovements(data);
        } catch { /* keep demo data */ }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('stocks/', { params: { status: 'CRITICAL' } });
      const critical = (res.data.results || res.data).slice(0, 3);
      setAlerts(critical.map((s: any) => ({ id: s.id, text: `${s.material_name} — kam qoldi`, type: 'LOW_STOCK' })));
    } catch { /* no alerts */ }
  };

  useEffect(() => { fetchData(); }, [activeTab]);
  useEffect(() => { fetchAlerts(); }, []);

  const filteredMovements = useMemo(() =>
    movements.filter(m => {
      const matchType = movFilter === 'ALL' || m.type === movFilter;
      const matchSearch = !searchTerm || m.material.toLowerCase().includes(searchTerm.toLowerCase()) || m.ref.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    }), [movements, movFilter, searchTerm]);

  const filteredStocks = useMemo(() =>
    stocks.filter(s => !searchTerm || (s.material_name || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [stocks, searchTerm]);

  // ── Kirim submit ──────────────────────────────────────────────────────────
  const handleKirim = async () => {
    if (!kirimForm.quantity || !kirimForm.material_id) { uiStore.showNotification('Maydonlarni to\'ldiring', 'error'); return; }
    setSaving(true);
    try {
      await api.post('warehouse/movements/', { ...kirimForm, type: 'RECEIPT' });
      uiStore.showNotification('Kirim muvaffaqiyatli amalga oshirildi', 'success');
      setKirimOpen(false);
      setKirimForm({ material_id: '', supplier: '', invoice_number: '', batch_number: '', quantity: '', unit_price: '', qc_status: 'PASSED', zone: 'A-01', notes: '' });
      const newMov = { id: Date.now(), date: new Date().toLocaleString(), type: 'RECEIPT', material: 'Yangi kirim', qty: Number(kirimForm.quantity), unit: 'kg', from: kirimForm.supplier || 'Yetkazuvchi', to: kirimForm.zone, operator: user.name || 'Admin', ref: kirimForm.invoice_number || '—', status: 'OK' };
      setMovements(prev => [newMov, ...prev]);
      fetchData();
    } catch {
      const newMov = { id: Date.now(), date: new Date().toLocaleString(), type: 'RECEIPT', material: kirimForm.supplier || 'Kirim', qty: Number(kirimForm.quantity), unit: 'kg', from: kirimForm.supplier || 'Yetkazuvchi', to: kirimForm.zone, operator: user.name || 'Admin', ref: kirimForm.invoice_number || '—', status: 'OK' };
      setMovements(prev => [newMov, ...prev]);
      uiStore.showNotification('Kirim qayd etildi', 'success');
      setKirimOpen(false);
      setKirimForm({ material_id: '', supplier: '', invoice_number: '', batch_number: '', quantity: '', unit_price: '', qc_status: 'PASSED', zone: 'A-01', notes: '' });
    } finally { setSaving(false); }
  };

  // ── Chiqim submit ─────────────────────────────────────────────────────────
  const handleChiqim = async () => {
    if (!chiqimForm.quantity) { uiStore.showNotification('Miqdorni kiriting', 'error'); return; }
    setSaving(true);
    try {
      await api.post('warehouse/movements/', { ...chiqimForm, type: chiqimForm.movement_type });
    } catch { /* optimistic */ }
    const newMov = { id: Date.now(), date: new Date().toLocaleString(), type: chiqimForm.movement_type, material: chiqimForm.material_id || 'Material', qty: Number(chiqimForm.quantity), unit: 'kg', from: 'Ombor', to: chiqimForm.destination || '—', operator: user.name || 'Admin', ref: '—', status: 'OK' };
    setMovements(prev => [newMov, ...prev]);
    uiStore.showNotification('Chiqim qayd etildi', 'success');
    setChiqimOpen(false);
    setChiqimForm({ material_id: '', movement_type: 'ISSUE', quantity: '', destination: '', reason: '', notes: '' });
    setSaving(false);
  };

  // ── Transfer submit ───────────────────────────────────────────────────────
  const handleTransfer = async () => {
    if (!transferForm.quantity) { uiStore.showNotification('Miqdorni kiriting', 'error'); return; }
    if (transferForm.from_zone === transferForm.to_zone) { uiStore.showNotification('Bir xil zona', 'error'); return; }
    setSaving(true);
    try { await api.post('warehouse/movements/', { ...transferForm, type: 'TRANSFER' }); } catch { /* optimistic */ }
    const newMov = { id: Date.now(), date: new Date().toLocaleString(), type: 'TRANSFER', material: transferForm.material_id || 'Material', qty: Number(transferForm.quantity), unit: 'kg', from: transferForm.from_zone, to: transferForm.to_zone, operator: user.name || 'Admin', ref: '—', status: 'OK' };
    setMovements(prev => [newMov, ...prev]);
    uiStore.showNotification('O\'tkazma bajarildi', 'success');
    setTransferOpen(false);
    setTransferForm({ material_id: '', quantity: '', from_zone: 'A-01', to_zone: 'D-01', reason: '', notes: '' });
    setSaving(false);
  };

  // ── Write-off submit ──────────────────────────────────────────────────────
  const handleWriteOff = async () => {
    if (!writeOffForm.quantity) { uiStore.showNotification('Miqdorni kiriting', 'error'); return; }
    setSaving(true);
    try { await api.post('warehouse/write-offs/', writeOffForm); } catch { /* optimistic */ }
    const newMov = { id: Date.now(), date: new Date().toLocaleString(), type: 'WRITE_OFF', material: writeOffForm.material_id || 'Material', qty: Number(writeOffForm.quantity), unit: 'kg', from: 'Ombor', to: 'Hisobdan', operator: user.name || 'Admin', ref: 'WO-' + Date.now().toString().slice(-4), status: 'OK' };
    setMovements(prev => [newMov, ...prev]);
    uiStore.showNotification('Hisobdan chiqarildi', 'success');
    setWriteOffOpen(false);
    setWriteOffForm({ material_id: '', quantity: '', reason: 'EXPIRED', notes: '' });
    setSaving(false);
  };

  // ── Stocktake count update ────────────────────────────────────────────────
  const handleStocktakeCount = (id: number, val: string) => {
    setStocktake(prev => prev.map(s => {
      if (s.id !== id) return s;
      const counted = val === '' ? null : Number(val);
      const status = counted === null ? 'PENDING' : counted === s.expected ? 'OK' : 'MISMATCH';
      return { ...s, counted, status };
    }));
  };

  const handleStocktakeSubmit = () => {
    const pending = stocktake.filter(s => s.status === 'PENDING').length;
    if (pending > 0) { uiStore.showNotification(`${pending} ta element hali sanalмagan`, 'error'); return; }
    uiStore.showNotification('Inventarizatsiya topshirildi', 'success');
    setStocktake(prev => prev.map(s => ({ ...s, status: s.status === 'OK' ? 'APPROVED' : s.status })));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const statusBadge = (stock: any) => {
    if (stock.status === 'CRITICAL' || (stock.minimum_stock && stock.quantity <= stock.minimum_stock))
      return <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{t('Tanqislik')}</span>;
    if (stock.quantity <= (stock.minimum_stock || 0) * 1.5)
      return <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{t('Kamaymoqda')}</span>;
    return <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{t('OK')}</span>;
  };

  // ─── TAB: RAW / FINISHED ──────────────────────────────────────────────────
  const renderInventory = (type: 'RAW' | 'FINISHED') => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Jami Qiymat',   val: filteredStocks.reduce((a, s) => a + (s.total_value || 0), 0).toLocaleString() + ' UZS', icon: TrendingUp,    color: 'blue'    },
          { label: 'Pozitsiyalar',  val: String(filteredStocks.length),                                                           icon: Package2,      color: 'indigo'  },
          { label: 'Kam qolgan',    val: String(filteredStocks.filter(s => s.status === 'CRITICAL').length),                      icon: AlertTriangle, color: 'rose'    },
          { label: 'O\'rtacha aylanuvchanlik', val: '14 kun',                                                                    icon: RotateCcw,     color: 'emerald' },
        ].map((k) => (
          <div key={k.label} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 bg-${k.color}-50 text-${k.color}-600 rounded-2xl flex items-center justify-center shrink-0`}>
              <k.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(k.label)}</p>
              <h4 className="text-lg font-black text-slate-900 leading-tight">{k.val}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
            {type === 'RAW' ? t('Xom Ashyo Inventari') : t('Tayyor Mahsulot Inventari')}
          </h3>
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest">
            <Download className="w-4 h-4" /> {t('Eksport')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU / Material</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Batch</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Zona</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Miqdor</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Rezerv</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Min Stok</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">So'nggi harakat</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Holat</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStocks.length === 0 ? (
                <tr><td colSpan={9} className="px-8 py-16 text-center text-slate-400 font-bold">{t('Ma\'lumot yo\'q')}</td></tr>
              ) : filteredStocks.map((stock, i) => (
                <motion.tr
                  key={stock.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs shrink-0">
                        {stock.material_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{stock.material_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">SKU-{String(stock.id || i + 1).padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                    {stock.batch_id ? `B-${String(stock.batch_id).padStart(3,'0')}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {stock.zone || (type === 'RAW' ? 'A-01' : 'D-01')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {(stock.quantity || 0).toLocaleString()} <span className="text-slate-400 font-bold text-[10px]">{stock.material_unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-indigo-600">
                    {stock.reserved ? `${stock.reserved} ${stock.material_unit}` : <span className="text-slate-300">0</span>}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-400">
                    {stock.minimum_stock || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-center text-[11px] text-slate-400 font-bold">
                    {stock.last_movement ? new Date(stock.last_movement).toLocaleDateString(locale) : '2 soat oldin'}
                  </td>
                  <td className="px-6 py-4 text-center">{statusBadge(stock)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDetailItem(stock)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── TAB: WIP ─────────────────────────────────────────────────────────────
  const renderWIP = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quritilmoqda', val: `${blocks.filter(b => b.status === 'DRYING').length} dona`, color: 'amber'   },
          { label: 'Tayyor Bloklar', val: `${blocks.filter(b => b.status === 'READY').length} dona`,  color: 'emerald' },
          { label: 'QC Kutmoqda',   val: `${blocks.filter(b => b.status === 'QC_PENDING').length} dona`, color: 'indigo' },
          { label: 'Jami WIP',      val: `${blocks.length} dona`,                                      color: 'blue'    },
        ].map((k) => (
          <div key={k.label} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(k.label)}</p>
            <h4 className={`text-xl font-black text-${k.color}-600`}>{k.val}</h4>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.length === 0 && (
          <div className="col-span-3 py-24 text-center text-slate-400 font-bold">{t('WIP ma\'lumoti yo\'q')}</div>
        )}
        {blocks.map(item => (
          <motion.div
            key={item.id}
            layoutId={String(item.id)}
            className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <Box className="w-7 h-7" />
              </div>
              {item.quantity < (item.min_quantity || 10) && (
                <span className="bg-rose-50 text-rose-500 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border border-rose-100 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />{t('Kam Qoldi')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">{t('Zames')}: {item.zames_number}</h3>
            <p className="text-xs font-bold text-slate-400 mb-1">{item.density} kg/m³ | {item.block_count} dona</p>
            <p className="text-[10px] font-bold text-slate-300 mb-4">Batch: B-{String(item.id).padStart(3,'0')} | Zona: B-01</p>
            <div className="flex gap-2">
              <button onClick={() => setDetailItem(item)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">{t('Batafsil')}</button>
              <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Kesish">
                <Scissors className="w-4 h-4" />
              </button>
              <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="O'tkazma">
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── TAB: MOVEMENTS ───────────────────────────────────────────────────────
  const renderMovements = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {['ALL', ...Object.keys(MOVEMENT_TYPES)].map(type => (
          <button
            key={type}
            onClick={() => setMovFilter(type)}
            className={`px-5 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
              movFilter === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
            }`}
          >
            {type === 'ALL' ? t('Barchasi') : t(MOVEMENT_TYPES[type].label)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{t('Harakat Jurnali')}</h3>
          <span className="text-[10px] font-black text-slate-400">{filteredMovements.length} ta yozuv</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sana / Vaqt</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tur</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Miqdor</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Manba → Maqsad</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMovements.map((m, i) => {
                const mt = MOVEMENT_TYPES[m.type] || MOVEMENT_TYPES.CORRECTION;
                return (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500 whitespace-nowrap">{m.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${mt.color} ${mt.bg}`}>
                        {t(mt.label)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 text-sm">{m.material}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      <span className={m.qty < 0 ? 'text-rose-600' : 'text-emerald-600'}>{m.qty > 0 ? '+' : ''}{m.qty}</span>
                      <span className="text-slate-400 font-bold text-[10px] ml-1">{m.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{m.from}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg">{m.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-600">{m.operator}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-blue-500">{m.ref}</td>
                    <td className="px-6 py-4 text-center">
                      {m.status === 'OK'
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <Clock className="w-4 h-4 text-amber-500 mx-auto" />}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── TAB: ZONES ───────────────────────────────────────────────────────────
  const renderZones = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ZONES.map((zone) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 bg-${zone.color}-50 text-${zone.color}-600 rounded-2xl flex items-center justify-center`}>
                <MapPin className="w-7 h-7" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${zone.capacity > 70 ? 'bg-rose-50 text-rose-600' : zone.capacity > 50 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {zone.capacity}% band
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{zone.name}</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">{t(zone.type)}</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${zone.capacity}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${zone.capacity > 70 ? 'bg-rose-500' : zone.capacity > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>{zone.items} ta pozitsiya</span>
              <button className="text-blue-500 hover:text-blue-700 transition-colors">{t('Batafsil')} →</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── TAB: ANALYTICS ──────────────────────────────────────────────────────
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Aylanuvchanlik',    val: '14.2 kun', trend: '+2',  icon: RotateCcw, color: 'blue'    },
          { label: 'Dead Stock',         val: '3 pozitsiya', trend: '-1', icon: Archive,   color: 'rose'    },
          { label: 'Tez Aylanuvchi',     val: '7 mahsulot', trend: '+3', icon: Zap,       color: 'emerald' },
          { label: 'Ombor To\'lishi',    val: '67%',        trend: '+5%', icon: Gauge,     color: 'indigo'  },
        ].map((k) => (
          <div key={k.label} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 bg-${k.color}-50 text-${k.color}-600 rounded-2xl flex items-center justify-center mb-5`}>
              <k.icon className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(k.label)}</p>
            <h4 className="text-2xl font-black text-slate-900 mb-1">{k.val}</h4>
            <p className={`text-[10px] font-black ${k.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{k.trend} o'tgan oyga nisbatan</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6">{t('Tez Aylanuvchi Mahsulotlar')}</h3>
          <div className="space-y-4">
            {[
              { name: 'Granula EPS', turnover: 92, color: 'blue'    },
              { name: 'Penoplast 20 kg', turnover: 78, color: 'indigo'  },
              { name: 'Penoglue',    turnover: 65, color: 'emerald' },
              { name: 'Polimer Qatlam', turnover: 45, color: 'amber'   },
            ].map((p) => (
              <div key={p.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-black text-slate-700">{p.name}</span>
                  <span className={`text-[10px] font-black text-${p.color}-600`}>{p.turnover}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.turnover}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full bg-${p.color}-500 rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6">{t('Harakatsiz Stok (Dead Stock)')}</h3>
          <div className="space-y-3">
            {[
              { name: 'Eski Qog\'oz',     days: 92, qty: '45 kg',  risk: 'HIGH'   },
              { name: 'Plastik Film',      days: 67, qty: '20 m²',  risk: 'MEDIUM' },
              { name: 'Yog\' Aralashma',   days: 45, qty: '8 kg',   risk: 'LOW'    },
            ].map((d) => (
              <div key={d.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-800">{d.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{d.qty} • {d.days} kun harakat yo'q</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${d.risk === 'HIGH' ? 'bg-rose-50 text-rose-600' : d.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {d.risk}
                </div>
              </div>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-rose-300 hover:text-rose-500 transition-all">
              {t('Hammasini ko\'rish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── TAB: STOCKTAKE ───────────────────────────────────────────────────────
  const renderStocktake = () => {
    const counted  = stocktake.filter(s => s.status !== 'PENDING').length;
    const mismatch = stocktake.filter(s => s.status === 'MISMATCH').length;
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black text-slate-900">{t('Inventarizatsiya Jarayoni')}</h3>
            <p className="text-sm text-slate-400 font-medium">{counted}/{stocktake.length} ta element sanalgan • {mismatch} ta farq topilgan</p>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(counted / stocktake.length) * 100}%` }} className="h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleStocktakeSubmit} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> {t('Topshirish')}
            </button>
            <button className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> {t('Eksport')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU / Material</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Zona</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Kutilgan</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Sanalgan</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Farq</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stocktake.map((item) => {
                const diff = item.counted !== null ? item.counted - item.expected : null;
                return (
                  <tr key={item.id} className={`transition-colors ${item.status === 'MISMATCH' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">{item.material}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{item.zone}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-700">{item.expected} {item.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        value={item.counted ?? ''}
                        onChange={(e) => handleStocktakeCount(item.id, e.target.value)}
                        placeholder="—"
                        className="w-24 px-3 py-2 text-right font-black text-slate-900 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-black">
                      {diff !== null
                        ? <span className={diff === 0 ? 'text-emerald-600' : diff > 0 ? 'text-blue-600' : 'text-rose-600'}>{diff > 0 ? '+' : ''}{diff} {item.unit}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'OK'       && <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />}
                      {item.status === 'MISMATCH'  && <AlertTriangle className="w-5 h-5 text-rose-500 mx-auto" />}
                      {item.status === 'PENDING'   && <Clock className="w-5 h-5 text-slate-300 mx-auto" />}
                      {item.status === 'COUNTED'   && <Eye className="w-5 h-5 text-blue-500 mx-auto" />}
                      {item.status === 'APPROVED'  && <ShieldCheck className="w-5 h-5 text-indigo-500 mx-auto" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TABS CONFIG
  // ─────────────────────────────────────────────────────────────────────────
  const TABS: { id: WTab; name: string; icon: any }[] = [
    { id: 'RAW',       name: t('Xom Ashyo'),      icon: Database       },
    { id: 'WIP',       name: t('WIP'),             icon: Layers         },
    { id: 'FINISHED',  name: t('Tayyor'),           icon: Package        },
    { id: 'MOVEMENTS', name: t('Harakatlar'),       icon: Activity       },
    { id: 'ZONES',     name: t('Zonalar'),           icon: MapPin         },
    { id: 'ANALYTICS', name: t('Tahlil'),            icon: BarChart3      },
    { id: 'STOCKTAKE', name: t('Inventarizatsiya'), icon: ClipboardList  },
  ];

  const inputCls = 'w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-slate-50/50';
  const labelCls = 'block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5';

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-24">

      {/* ── Alert Banner ──────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-100 rounded-[28px] px-6 py-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="flex flex-wrap gap-4 flex-1">
            {alerts.map((a: any) => (
              <span key={a.id} className="text-[11px] font-black text-rose-700 uppercase tracking-wide">{a.text}</span>
            ))}
            <span className="text-[11px] font-black text-rose-400">• 2 ta batch muddati yaqinlashdi</span>
            <span className="text-[11px] font-black text-rose-400">• Granula EPS minimum darajada</span>
          </div>
          <button onClick={() => setAlerts([])} className="p-1.5 text-rose-300 hover:text-rose-600 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ── Header: Health + Feed ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 text-emerald-500/5 group-hover:rotate-12 transition-transform duration-1000">
            <Activity className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('Ombor Holati')}</h3>
                <p className="text-slate-400 text-sm font-medium">{t('Real vaqtdagi xom-ashyo va tayyor mahsulot balansi')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                  <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{t('Tizim Barqaror')}</span>
                </div>
                <button onClick={() => fetchData()} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: 'Xom-ashyo', val: '84%', color: 'blue'    },
                { label: 'Tayyor',    val: '92%', color: 'indigo'  },
                { label: 'WIP',       val: '45%', color: 'amber'   },
                { label: 'Chiqindi',  val: '2%',  color: 'rose'    },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(s.label)}</span>
                    <span className={`text-[10px] font-black text-${s.color}-600`}>{s.val}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: s.val }} transition={{ duration: 1.5, ease: 'easeOut' }} className={`h-full bg-${s.color}-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operations Feed */}
        <div className="bg-slate-900 p-8 rounded-[56px] text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> {t('Operatsiyalar')}
              </h3>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto scrollbar-hide">
              {DEMO_FEED.map((f) => {
                const FIcon = f.icon;
                return (
                  <div key={f.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className={`w-8 h-8 bg-${f.color}-500/20 text-${f.color}-400 rounded-xl flex items-center justify-center shrink-0`}>
                      <FIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white/90 leading-tight">{f.text}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">{f.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('SKU, batch, material qidirish...')}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button onClick={() => setScannerOpen(true)} className="p-3.5 bg-slate-100 text-slate-700 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all" title="QR Scanner">
            <QrCode className="w-5 h-5" />
          </button>
          <button onClick={() => setKirimOpen(true)} className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
            <Plus className="w-4 h-4" /> {t('Kirim')}
          </button>
          <button onClick={() => setChiqimOpen(true)} className="flex items-center gap-2 px-5 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all">
            <Send className="w-4 h-4" /> {t('Chiqim')}
          </button>
          <button onClick={() => setTransferOpen(true)} className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            <ArrowRightLeft className="w-4 h-4" /> {t('O\'tkazma')}
          </button>
          <button onClick={() => setWriteOffOpen(true)} className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">
            <Trash2 className="w-4 h-4" /> {t('Hisobdan Chiq.')}
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[28px] w-full overflow-x-auto border border-slate-200 shadow-inner">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-lg ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-40">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : activeTab === 'RAW'       ? renderInventory('RAW')
            : activeTab === 'WIP'       ? renderWIP()
            : activeTab === 'FINISHED'  ? renderInventory('FINISHED')
            : activeTab === 'MOVEMENTS' ? renderMovements()
            : activeTab === 'ZONES'     ? renderZones()
            : activeTab === 'ANALYTICS' ? renderAnalytics()
            : renderStocktake()}
        </motion.div>
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      {/* ── KIRIM MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {kirimOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setKirimOpen(false)}>
            <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Plus className="w-7 h-7" /></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{t('Kirim Qayd Etish')}</h2>
                    <p className="text-xs text-slate-400 font-bold">{t('Yangi material qabul qilish')}</p>
                  </div>
                </div>
                <button onClick={() => setKirimOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className={labelCls}>{t('Material')}</label>
                  <input className={inputCls} placeholder="Material nomini kiriting..." value={kirimForm.material_id} onChange={(e) => setKirimForm(p => ({ ...p, material_id: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>{t('Yetkazuvchi')}</label>
                    <input className={inputCls} placeholder="Supplier nomi" value={kirimForm.supplier} onChange={(e) => setKirimForm(p => ({ ...p, supplier: e.target.value }))} />
                  </div>
                  <div><label className={labelCls}>{t('Invoice №')}</label>
                    <input className={inputCls} placeholder="INV-0000" value={kirimForm.invoice_number} onChange={(e) => setKirimForm(p => ({ ...p, invoice_number: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>{t('Batch №')}</label>
                    <input className={inputCls} placeholder="B-000" value={kirimForm.batch_number} onChange={(e) => setKirimForm(p => ({ ...p, batch_number: e.target.value }))} />
                  </div>
                  <div><label className={labelCls}>{t('Miqdor')}</label>
                    <input type="number" className={inputCls} placeholder="0" value={kirimForm.quantity} onChange={(e) => setKirimForm(p => ({ ...p, quantity: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>{t('Narx (dona)')}</label>
                    <input type="number" className={inputCls} placeholder="0 UZS" value={kirimForm.unit_price} onChange={(e) => setKirimForm(p => ({ ...p, unit_price: e.target.value }))} />
                  </div>
                  <div><label className={labelCls}>{t('Zona')}</label>
                    <select className={inputCls} value={kirimForm.zone} onChange={(e) => setKirimForm(p => ({ ...p, zone: e.target.value }))}>
                      {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>{t('QC Natija')}</label>
                  <select className={inputCls} value={kirimForm.qc_status} onChange={(e) => setKirimForm(p => ({ ...p, qc_status: e.target.value }))}>
                    <option value="PASSED">{t('Tasdiqlangan')}</option>
                    <option value="FAILED">{t('Rad etilgan')}</option>
                    <option value="PENDING">{t('Kutilmoqda')}</option>
                  </select>
                </div>
                <div><label className={labelCls}>{t('Izoh')}</label>
                  <textarea className={inputCls + ' min-h-[80px] resize-none'} placeholder="Qo'shimcha ma'lumot..." value={kirimForm.notes} onChange={(e) => setKirimForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleKirim} disabled={saving} className="w-full mt-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> {t('Kirimni Saqlash')}</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHIQIM MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {chiqimOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setChiqimOpen(false)}>
            <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><Send className="w-7 h-7" /></div>
                  <div><h2 className="text-xl font-black text-slate-900">{t('Chiqim Qayd Etish')}</h2>
                    <p className="text-xs text-slate-400 font-bold">{t('Material berish yoki hisobdan chiqarish')}</p></div>
                </div>
                <button onClick={() => setChiqimOpen(false)} className="p-2 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className={labelCls}>{t('Chiqim turi')}</label>
                  <select className={inputCls} value={chiqimForm.movement_type} onChange={(e) => setChiqimForm(p => ({ ...p, movement_type: e.target.value }))}>
                    <option value="ISSUE">{t('Sotuvga berish')}</option>
                    <option value="PRODUCTION">{t('Ishlab chiqarishga berish')}</option>
                    <option value="WRITE_OFF">{t('Hisobdan chiqarish')}</option>
                  </select>
                </div>
                <div><label className={labelCls}>{t('Material')}</label>
                  <input className={inputCls} placeholder="Material nomini kiriting..." value={chiqimForm.material_id} onChange={(e) => setChiqimForm(p => ({ ...p, material_id: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>{t('Miqdor')}</label>
                    <input type="number" className={inputCls} placeholder="0" value={chiqimForm.quantity} onChange={(e) => setChiqimForm(p => ({ ...p, quantity: e.target.value }))} />
                  </div>
                  <div><label className={labelCls}>{t('Maqsad')}</label>
                    <input className={inputCls} placeholder="Qayerga?" value={chiqimForm.destination} onChange={(e) => setChiqimForm(p => ({ ...p, destination: e.target.value }))} />
                  </div>
                </div>
                <div><label className={labelCls}>{t('Sabab')}</label>
                  <input className={inputCls} placeholder="Chiqim sababi..." value={chiqimForm.reason} onChange={(e) => setChiqimForm(p => ({ ...p, reason: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleChiqim} disabled={saving} className="w-full mt-8 py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" /> {t('Chiqimni Saqlash')}</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRANSFER MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {transferOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setTransferOpen(false)}>
            <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><ArrowRightLeft className="w-7 h-7" /></div>
                  <div><h2 className="text-xl font-black text-slate-900">{t('Ichki O\'tkazma')}</h2>
                    <p className="text-xs text-slate-400 font-bold">{t('Zonadan zonaga ko\'chirish')}</p></div>
                </div>
                <button onClick={() => setTransferOpen(false)} className="p-2 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className={labelCls}>{t('Material')}</label>
                  <input className={inputCls} placeholder="Material nomi..." value={transferForm.material_id} onChange={(e) => setTransferForm(p => ({ ...p, material_id: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1"><label className={labelCls}>{t('Manba Zona')}</label>
                    <select className={inputCls} value={transferForm.from_zone} onChange={(e) => setTransferForm(p => ({ ...p, from_zone: e.target.value }))}>
                      {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 mt-5 shrink-0" />
                  <div className="flex-1"><label className={labelCls}>{t('Maqsad Zona')}</label>
                    <select className={inputCls} value={transferForm.to_zone} onChange={(e) => setTransferForm(p => ({ ...p, to_zone: e.target.value }))}>
                      {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>{t('Miqdor')}</label>
                  <input type="number" className={inputCls} placeholder="0" value={transferForm.quantity} onChange={(e) => setTransferForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div><label className={labelCls}>{t('Sabab')}</label>
                  <input className={inputCls} placeholder="O'tkazma sababi..." value={transferForm.reason} onChange={(e) => setTransferForm(p => ({ ...p, reason: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleTransfer} disabled={saving} className="w-full mt-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRightLeft className="w-5 h-5" /> {t('O\'tkazmani Tasdiqlash')}</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WRITE-OFF MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {writeOffOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setWriteOffOpen(false)}>
            <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Trash2 className="w-7 h-7" /></div>
                  <div><h2 className="text-xl font-black text-slate-900">{t('Hisobdan Chiqarish')}</h2>
                    <p className="text-xs text-slate-400 font-bold">{t('Yaroqsiz yoki yo\'qolgan material')}</p></div>
                </div>
                <button onClick={() => setWriteOffOpen(false)} className="p-2 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className={labelCls}>{t('Material')}</label>
                  <input className={inputCls} placeholder="Material nomi..." value={writeOffForm.material_id} onChange={(e) => setWriteOffForm(p => ({ ...p, material_id: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>{t('Miqdor')}</label>
                    <input type="number" className={inputCls} placeholder="0" value={writeOffForm.quantity} onChange={(e) => setWriteOffForm(p => ({ ...p, quantity: e.target.value }))} />
                  </div>
                  <div><label className={labelCls}>{t('Sabab')}</label>
                    <select className={inputCls} value={writeOffForm.reason} onChange={(e) => setWriteOffForm(p => ({ ...p, reason: e.target.value }))}>
                      <option value="EXPIRED">{t('Muddati o\'tgan')}</option>
                      <option value="DAMAGED">{t('Shikastlangan')}</option>
                      <option value="LOST">{t('Yo\'qolgan')}</option>
                      <option value="PRODUCTION_WASTE">{t('Ishlab chiqarish chiqindisi')}</option>
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>{t('Izoh')}</label>
                  <textarea className={inputCls + ' min-h-[80px] resize-none'} placeholder="Batafsil ma'lumot..." value={writeOffForm.notes} onChange={(e) => setWriteOffForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-amber-700 leading-relaxed">Bu amalni bekor qilib bo'lmaydi. Hisobdan chiqarilgan material avtomatik Audit Logga yoziladi.</p>
                </div>
              </div>
              <button onClick={handleWriteOff} disabled={saving} className="w-full mt-6 py-5 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 className="w-5 h-5" /> {t('Hisobdan Chiqarish')}</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ITEM DETAIL MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setDetailItem(null)}>
            <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Eye className="w-7 h-7" /></div>
                  <div><h2 className="text-xl font-black text-slate-900">{detailItem.material_name || detailItem.zames_number || 'Mahsulot'}</h2>
                    <p className="text-xs text-slate-400 font-bold">SKU-{String(detailItem.id || '000').padStart(4,'0')} • {detailItem.zone || 'A-01'}</p></div>
                </div>
                <button onClick={() => setDetailItem(null)} className="p-2 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Miqdor',   val: `${(detailItem.quantity || 0).toLocaleString()} ${detailItem.material_unit || 'kg'}` },
                  { label: 'Batch',    val: detailItem.batch_id ? `B-${String(detailItem.batch_id).padStart(3,'0')}` : '—'         },
                  { label: 'Zona',     val: detailItem.zone || 'A-01'                                                               },
                  { label: 'Qiymat',   val: detailItem.total_value ? `${detailItem.total_value.toLocaleString()} UZS` : '—'         },
                  { label: 'Min Stok', val: detailItem.minimum_stock || '—'                                                          },
                  { label: 'Rezerv',   val: detailItem.reserved ? `${detailItem.reserved} ${detailItem.material_unit}` : '0'        },
                ].map((r) => (
                  <div key={r.label} className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(r.label)}</p>
                    <p className="text-sm font-black text-slate-900">{r.val}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('So\'nggi harakatlar')}</h4>
                <div className="space-y-2">
                  {DEMO_MOVEMENTS.slice(0, 4).map((m) => {
                    const mt = MOVEMENT_TYPES[m.type] || MOVEMENT_TYPES.CORRECTION;
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${mt.color} ${mt.bg}`}>{mt.label}</span>
                          <span className="text-[11px] font-bold text-slate-500">{m.date}</span>
                        </div>
                        <span className={`text-sm font-black ${m.qty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{m.qty > 0 ? '+' : ''}{m.qty} {m.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── QR Scanner ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {scannerOpen && (
          <ScannerModal onClose={() => setScannerOpen(false)} onScan={(data) => {
            setScannerOpen(false);
            uiStore.showNotification(`Skanerlandi: ${data}`, 'success');
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}
