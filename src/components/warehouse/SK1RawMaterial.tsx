import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, Plus, QrCode, Filter, Package, ShieldCheck, Clock, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';
import ScannerModal from '../ScannerModal';
import { Material, RawMaterialBatch, Supplier, Warehouse } from '../../types';

type BatchFilter = 'ALL' | 'INSPECTION' | 'IN_STOCK' | 'CANCELLED';

const EMPTY_FORM = {
  material: '',
  supplier: '',
  invoice_number: '',
  quantity_kg: '',
  price_per_unit: '',
  expiry_date: '',
  moisture: '',
  size_mm: '',
};

export default function SK1RawMaterial() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<BatchFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [kirimOpen, setKirimOpen] = useState(false);
  const [batches, setBatches] = useState<RawMaterialBatch[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<RawMaterialBatch | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchesRes, materialsRes, suppliersRes, warehousesRes] = await Promise.all([
        api.get('batches/'),
        api.get('materials/'),
        api.get('suppliers/'),
        api.get('warehouses/'),
      ]);
      setBatches(batchesRes.data.results || batchesRes.data);
      setMaterials(materialsRes.data.results || materialsRes.data);
      setSuppliers(suppliersRes.data.results || suppliersRes.data);
      setWarehouses(warehousesRes.data.results || warehousesRes.data);
    } catch (err) {
      uiStore.showNotification("Xom ashyo ma'lumotlarini yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = [batch.batch_number, batch.material_name, batch.supplier_name, batch.invoice_number]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesFilter = filter === 'ALL' ? true : batch.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [batches, filter, searchTerm]);

  const handleCreateBatch = async () => {
    if (!form.material || !form.supplier || !form.invoice_number || !form.quantity_kg) {
      uiStore.showNotification("Majburiy maydonlarni to'ldiring", 'error');
      return;
    }

    setSubmitting(true);
    try {
      const now = Date.now();
      await api.post('batches/', {
        material: Number(form.material),
        supplier: Number(form.supplier),
        invoice_number: form.invoice_number,
        quantity_kg: Number(form.quantity_kg),
        remaining_quantity: Number(form.quantity_kg),
        price_per_unit: Number(form.price_per_unit || 0),
        expiry_date: form.expiry_date || null,
        batch_number: `BAT-${now}`,
        status: 'INSPECTION',
      });
      uiStore.showNotification("Yangi xom ashyo partiyasi yaratildi", 'success');
      setKirimOpen(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.detail || "Partiyani yaratib bo'lmadi", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanResult = (result: RawMaterialBatch) => {
    setSelectedBatch(result);
    setScannerOpen(false);
  };

  const filterOptions: BatchFilter[] = ['ALL', 'INSPECTION', 'IN_STOCK', 'CANCELLED'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("Partiya, material yoki supplier qidirish...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm"
            />
          </div>
          <button
            onClick={() => {
              const index = filterOptions.indexOf(filter);
              setFilter(filterOptions[(index + 1) % filterOptions.length]);
            }}
            className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all"
            title={t('Filtr')}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <QrCode className="w-4 h-4" /> {t('Scan')}
          </button>
          <button
            onClick={() => setKirimOpen(true)}
            className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <ArrowUpRight className="w-4 h-4" /> {t('Yangi Kirim')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">
        <span>{t('Joriy filtr')}:</span>
        <span className="text-emerald-600">{t(filter)}</span>
        <span>•</span>
        <span>{filteredBatches.length}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Partiya (Batch)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Material & Supplier')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Miqdor (FIFO)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Yaroqlilik')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('QC Status')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Amallar')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-sm font-bold text-slate-400">{t('Yuklanmoqda...')}</td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-sm font-bold text-slate-400">{t("Partiyalar topilmadi")}</td>
                </tr>
              ) : filteredBatches.map((batch, idx) => (
                <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{batch.batch_number}</div>
                        <div className="text-[10px] font-bold text-slate-500">
                          QR: {String(batch.qr_code || '').slice(0, 8) || '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900">{batch.material_name || '—'}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{batch.supplier_name || '—'} • {batch.invoice_number}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900">{batch.remaining_quantity} kg</div>
                    {idx === 0 && <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">FIFO: NEXT</div>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {batch.expiry_date || t('Kiritilmagan')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${batch.status === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-600' : batch.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {t(batch.status)}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                    >
                      {t('Tafsilot')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {scannerOpen && (
          <ScannerModal onClose={() => setScannerOpen(false)} onScan={handleScanResult} />
        )}

        {kirimOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{t('Yangi Xom Ashyo Qabul Qilish (QC bilan)')}</h3>
                <button onClick={() => setKirimOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">{t('Material')}</label>
                    <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1">
                      <option value="">{t('Tanlang...')}</option>
                      {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">{t('Supplier')}</label>
                    <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1">
                      <option value="">{t('Tanlang...')}</option>
                      {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">{t('Invoice / Yuk xati')}</label>
                    <input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">{t('Miqdor (kg)')}</label>
                    <input value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">{t('Narx')}</label>
                    <input value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">{t('Yaroqlilik')}</label>
                    <input value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} type="date" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t('QC Tekshiruvi (Majburiy)')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input value={form.moisture} onChange={(e) => setForm({ ...form, moisture: e.target.value })} type="text" placeholder={t("Namlik (%)")} className="w-full p-3 bg-white rounded-xl font-bold text-sm" />
                    <input value={form.size_mm} onChange={(e) => setForm({ ...form, size_mm: e.target.value })} type="text" placeholder={t("O'lcham (mm)")} className="w-full p-3 bg-white rounded-xl font-bold text-sm" />
                  </div>
                </div>

                <div className="text-[11px] font-bold text-slate-400">
                  {t('Qabul omborlari')}: {warehouses.map((warehouse) => warehouse.name).join(', ') || t('Kiritilmagan')}
                </div>

                <button
                  onClick={handleCreateBatch}
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                >
                  {submitting ? t('Yuborilmoqda...') : t('Tasdiqlash va Batch Yaratish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedBatch.batch_number}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedBatch.material_name}</p>
                </div>
                <button onClick={() => setSelectedBatch(null)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Ta\'minotchi')}</p>
                  <p className="font-black text-slate-900 mt-1">{selectedBatch.supplier_name || '—'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Invoice / Yuk xati')}</p>
                  <p className="font-black text-slate-900 mt-1">{selectedBatch.invoice_number}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Miqdor')}</p>
                  <p className="font-black text-slate-900 mt-1">{selectedBatch.quantity_kg} kg</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Qolgan miqdor')}</p>
                  <p className="font-black text-slate-900 mt-1">{selectedBatch.remaining_quantity} kg</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Holati')}</p>
                  <p className="font-black text-slate-900 mt-1">{t(selectedBatch.status)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Yaroqlilik')}</p>
                  <p className="font-black text-slate-900 mt-1">{selectedBatch.expiry_date || '—'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
