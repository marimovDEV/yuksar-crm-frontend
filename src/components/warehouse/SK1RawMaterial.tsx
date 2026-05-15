import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, Plus, QrCode, Filter, Package, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEMO_BATCHES = [
  { id: 'BAT-2026-00001', material: 'EPS Granula', supplier: 'Sinopec', invoice: 'INV-0012', qty: 2500, price: '14,500', received: '2025-06-01', expiry: '2026-06-01', qc: 'PASSED', zone: 'A-01' },
  { id: 'BAT-2026-00002', material: 'EPS Granula', supplier: 'Sinopec', invoice: 'INV-0018', qty: 1200, price: '14,500', received: '2025-06-05', expiry: '2026-06-05', qc: 'PENDING', zone: 'A-01' },
  { id: 'BAT-2026-00003', material: 'Penoglue', supplier: 'MasterBuild', invoice: 'INV-0021', qty: 300, price: '22,000', received: '2025-06-10', expiry: '2025-12-10', qc: 'PASSED', zone: 'A-02' },
];

export default function SK1RawMaterial() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [kirimOpen, setKirimOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Controls */}
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
          <button className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200">
            <QrCode className="w-4 h-4" /> {t('Scan')}
          </button>
          <button onClick={() => setKirimOpen(true)} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            <ArrowUpRight className="w-4 h-4" /> {t('Yangi Kirim')}
          </button>
        </div>
      </div>

      {/* Batches Table / Grid */}
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
              {DEMO_BATCHES.filter(b => b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.material.toLowerCase().includes(searchTerm.toLowerCase())).map((batch, idx) => (
                <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{batch.id}</div>
                        <div className="text-[10px] font-bold text-slate-500">ZONA: {batch.zone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900">{batch.material}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{batch.supplier} • {batch.invoice}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900">{batch.qty} kg</div>
                    {idx === 0 && <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">FIFO: NEXT</div>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {batch.expiry}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${batch.qc === 'PASSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {t(batch.qc)}
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">
                      {t('Tafsilot')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Kirim Modal Placeholder */}
      <AnimatePresence>
        {kirimOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{t('Yangi Xom Ashyo Qabul Qilish (QC bilan)')}</h3>
                <button onClick={() => setKirimOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 ml-1">{t('Material')}</label><select className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1"><option>EPS Granula</option></select></div>
                  <div><label className="text-xs font-bold text-slate-500 ml-1">{t('Supplier')}</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" placeholder="Sinopec..." /></div>
                  <div><label className="text-xs font-bold text-slate-500 ml-1">{t('Invoice / Yuk xati')}</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-500 ml-1">{t('Miqdor (kg)')}</label><input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold mt-1" /></div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t('QC Tekshiruvi (Majburiy)')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={t("Namlik (%)")} className="w-full p-3 bg-white rounded-xl font-bold text-sm" />
                    <input type="text" placeholder={t("O'lcham (mm)")} className="w-full p-3 bg-white rounded-xl font-bold text-sm" />
                  </div>
                </div>
                
                <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
                  {t('Tasdiqlash va Batch Yaratish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
