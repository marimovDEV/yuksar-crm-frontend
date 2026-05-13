import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  ClipboardCheck,
  Building2,
  Calendar,
  Layers,
  Star,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { uiStore } from '../lib/store';

interface RawMaterialQCModalProps {
  batch: any;
  onClose: () => void;
  onSuccess: () => void;
  t: any;
}

export default function RawMaterialQCModal({ batch, onClose, onSuccess, t }: RawMaterialQCModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [measurements, setMeasurements] = useState({
    density: '',
    moisture: '',
    impurity: '',
  });

  useEffect(() => {
    // Fetch warehouses for receiving the batch
    api.get('warehouse/warehouses/').then(res => setWarehouses(res.data.results || res.data));
  }, []);

  const handleQC = async () => {
    if (result === 'APPROVED' && !selectedWarehouse) {
      uiStore.showNotification(t("Ombor tanlanishi shart"), "error");
      return;
    }

    setLoading(true);
    try {
      if (result === 'APPROVED') {
        await api.post(`batches/${batch.id}/qc_approve/`, { 
          warehouse_id: selectedWarehouse,
          measurements,
          notes
        });
      } else {
        await api.post(`batches/${batch.id}/qc_reject/`, { 
          notes
        });
      }
      
      uiStore.showNotification(
        result === 'APPROVED' ? t("Xom-ashyo tasdiqlandi va omborga o'tkazildi") : t("Xom-ashyo rad etildi"), 
        result === 'APPROVED' ? "success" : "warning"
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || t("Xatolik yuz berdi");
      uiStore.showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{t('Xom-ashyo Sifat Nazorati')}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Batch')} #{batch.batch_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Batch Info Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Package className="w-3 h-3" /> {t('Material')}
              </p>
              <p className="text-sm font-black text-slate-900">{batch.material_name}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{batch.quantity_kg} kg</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Building2 className="w-3 h-3" /> {t('Ta\'minotchi')}
              </p>
              <p className="text-sm font-black text-slate-900">{batch.supplier_name || t('Noma\'lum')}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">INV: {batch.invoice_number}</p>
            </div>
          </div>

          {/* QC Form */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{t('Laboratoriya Ko\'rsatkichlari')}</h4>
            
            <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Zichlik (kg/m3)')}</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs"
                    value={measurements.density}
                    onChange={e => setMeasurements({...measurements, density: e.target.value})}
                    placeholder="12.5"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Namlik (%)')}</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs"
                    value={measurements.moisture}
                    onChange={e => setMeasurements({...measurements, moisture: e.target.value})}
                    placeholder="0.5"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Nopoklik (%)')}</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs"
                    value={measurements.impurity}
                    onChange={e => setMeasurements({...measurements, impurity: e.target.value})}
                    placeholder="0.1"
                  />
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{t('Yakuniy Qaror')}</h4>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setResult('APPROVED')}
                    className={`flex items-center justify-center gap-3 p-6 rounded-[32px] border-2 transition-all ${
                      result === 'APPROVED' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-6 h-6 ${result === 'APPROVED' ? 'text-emerald-500' : ''}`} />
                    <span className="font-black text-sm uppercase tracking-widest">{t('Tasdiqlash')}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setResult('REJECTED')}
                    className={`flex items-center justify-center gap-3 p-6 rounded-[32px] border-2 transition-all ${
                      result === 'REJECTED' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-100' : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'
                    }`}
                  >
                    <AlertTriangle className={`w-6 h-6 ${result === 'REJECTED' ? 'text-rose-500' : ''}`} />
                    <span className="font-black text-sm uppercase tracking-widest">{t('Rad etish')}</span>
                  </button>
               </div>
            </div>

            {result === 'APPROVED' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Qabul qilish uchun ombor')}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm appearance-none"
                    value={selectedWarehouse}
                    onChange={e => setSelectedWarehouse(e.target.value)}
                  >
                    <option value="">{t('Omborni tanlang...')}</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Izohlar')}</label>
               <textarea 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:border-blue-500 transition-all font-bold text-sm min-h-[100px]"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('Sifat bo\'yicha xulosa...')}
               />
            </div>
          </div>

          <div className="flex gap-6 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-5 border border-slate-200 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
            <button 
              onClick={handleQC}
              disabled={loading}
              className={`flex-2 px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 ${
                result === 'APPROVED' ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' : 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700'
              }`}
            >
              {loading ? t('Yuborilmoqda...') : t('Qarorni Saqlash')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
