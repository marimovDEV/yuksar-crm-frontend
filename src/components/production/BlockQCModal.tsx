import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  FileText,
  ShieldCheck,
  Package,
  Droplets,
  Maximize
} from 'lucide-react';
import { FinishedBlock } from '../../types';
import { useI18n } from '../../i18n';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';

interface BlockQCModalProps {
  block: FinishedBlock;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BlockQCModal({ block, onClose, onSuccess }: BlockQCModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState(block.classification || 'A_CLASS');
  const [status, setStatus] = useState(block.status || 'READY');
  const [actualWeight, setActualWeight] = useState(block.actual_weight?.toString() || '');
  const [actualDensity, setActualDensity] = useState(block.actual_density?.toString() || '');
  const [moisture, setMoisture] = useState(block.moisture?.toString() || '');
  const [length, setLength] = useState(block.length?.toString() || '1000');
  const [width, setWidth] = useState(block.width?.toString() || '1000');
  const [height, setHeight] = useState(block.height?.toString() || '1000');
  const [visualDefects, setVisualDefects] = useState(block.visual_defects?.join(', ') || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`production/finished-blocks/${block.id}/perform-qc/`, {
        classification,
        status,
        actual_weight: actualWeight ? parseFloat(actualWeight) : null,
        actual_density: actualDensity ? parseFloat(actualDensity) : null,
        moisture: moisture ? parseFloat(moisture) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        visual_defects: visualDefects,
        notes
      });
      uiStore.showNotification(t("Sifat nazorati yakunlandi"), "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      uiStore.showNotification(t(err.response?.data?.error || "Xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const classifications = [
    { id: 'A_CLASS', name: t('A-Klass'), color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: t('Ideal holatda') },
    { id: 'B_CLASS', name: t('B-Klass'), color: 'text-blue-600 bg-blue-50 border-blue-200', desc: t('Minimal nuqsonlar') },
    { id: 'C_CLASS', name: t('C-Klass'), color: 'text-amber-600 bg-amber-50 border-amber-200', desc: t('Katta nuqsonlar') },
    { id: 'REJECT', name: t('Reject'), color: 'text-rose-600 bg-rose-50 border-rose-200', desc: t('Yaroqsiz / Qayta ishlash') },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight">{t("Sifat Nazorati & Tasniflash")}</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{block.block_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Classification Selection */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Sifat Tasnifi")}</label>
             <div className="grid grid-cols-2 gap-4">
                {classifications.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setClassification(cls.id as any)}
                    className={`
                      relative p-6 rounded-[32px] border-2 text-left transition-all group
                      ${classification === cls.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-2xl mb-3 flex items-center justify-center border ${cls.color}`}>
                       {classification === cls.id ? <CheckCircle2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <p className={`text-sm font-black mb-1 ${classification === cls.id ? 'text-blue-600' : 'text-slate-900'}`}>{cls.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{cls.desc}</p>
                    
                    {classification === cls.id && (
                      <motion.div layoutId="qc-select" className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
             </div>
          </div>

          {/* Physical Data Inputs */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Fizik Ko'rsatkichlar")}</label>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 ml-1">{t("Haqiqiy Vazn (kg)")}</p>
                   <div className="relative">
                      <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number"
                        step="0.01"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        placeholder="0.00"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 ml-1">{t("Haqiqiy Zichlik (kg/m³)")}</p>
                   <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number"
                        step="0.1"
                        value={actualDensity}
                        onChange={(e) => setActualDensity(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        placeholder="0.0"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 ml-1">{t("Namlik (%)")}</p>
                   <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number"
                        step="0.1"
                        value={moisture}
                        onChange={(e) => setMoisture(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        placeholder="0.0"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("O'lchamlar (mm)")}</label>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 ml-1">{t("Uzunlik")}</p>
                   <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        placeholder="1000"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 ml-1">{t("Eni")}</p>
                   <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-slate-400" />
                      <input 
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        placeholder="1000"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 ml-1">{t("Bo'yi")}</p>
                   <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-45 text-slate-400" />
                      <input 
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        placeholder="1000"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Keyingi Holat")}</label>
             <div className="flex gap-3">
                {['READY', 'QC_PENDING', 'RECYCLE'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s as any)}
                    className={`
                      flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all
                      ${status === s ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                    `}
                  >
                    {t(s)}
                  </button>
                ))}
             </div>
          </div>

          {/* Visual Defects */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Vizual nuqsonlar")}</label>
             <input 
               type="text"
               value={visualDefects}
               onChange={(e) => setVisualDefects(e.target.value)}
               className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold"
               placeholder={t("Yoriqlar, g'ovaklik, rang farqi...")}
             />
          </div>

          {/* Notes */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Izohlar / Nuqsonlar")}</label>
             <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="w-full p-6 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold min-h-[100px]"
               placeholder={t("Blokdagi kamchiliklarni kiriting...")}
             />
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
           <button
             onClick={handleSubmit}
             disabled={loading}
             className={`
               w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl
               ${loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200'}
             `}
           >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {t("Natijani Saqlash")}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
