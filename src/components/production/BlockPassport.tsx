import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database, 
  User as UserIcon, 
  Clock, 
  Activity, 
  CheckCircle2, 
  QrCode, 
  MapPin, 
  Layers,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
  FileText,
  Droplets,
  Maximize
} from 'lucide-react';
import { FinishedBlock } from '../../types';
import { useI18n } from '../../i18n';

interface BlockPassportProps {
  block: FinishedBlock;
  onClose: () => void;
  onQC?: () => void;
}

export default function BlockPassport({ block, onClose, onQC }: BlockPassportProps) {
  const { t, locale } = useI18n();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-emerald-500';
      case 'COOLING': return 'bg-blue-500';
      case 'QC_PENDING': return 'bg-amber-500';
      case 'RESERVED': return 'bg-purple-500';
      case 'RECYCLE': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getClassificationColor = (cls: string) => {
    switch (cls) {
      case 'A_CLASS': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'B_CLASS': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'C_CLASS': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'REJECT': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(block.status)} animate-pulse`} />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{block.block_id}</h2>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Blok Pasporti")}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Main Badge & Action */}
          <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{t("Status")}</p>
                  <p className="text-lg font-black">{t(block.status_display)}</p>
               </div>
            </div>
            <div className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${getClassificationColor(block.classification)}`}>
               {t(block.classification_display)}
            </div>
          </div>

          {/* Core Passport Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Layers className="w-5 h-5" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Batch / Zames")}</p>
                </div>
                <p className="text-xl font-black text-slate-900">{block.recipe_name || '—'}</p>
                <p className="text-xs font-bold text-blue-600 mt-1">{block.lot}</p>
             </div>
             
             <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm"><UserIcon className="w-5 h-5" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Operator")}</p>
                </div>
                <p className="text-xl font-black text-slate-900">{block.operator_name || '—'}</p>
                <p className="text-xs font-bold text-amber-600 mt-1">{t(block.shift_display || 'Kunlik')}</p>
             </div>
          </div>

          {/* Physical Passport */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4" /> {t("Fizik Ko'rsatkichlar")}</h3>
             <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <p className="text-[9px] font-black text-slate-400 uppercase">{t("Vazn")}</p>
                   </div>
                   <p className="text-lg font-black text-slate-900">{block.actual_weight || '—'} <span className="text-xs text-slate-400">kg</span></p>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-3 h-3 text-amber-500" />
                      <p className="text-[9px] font-black text-slate-400 uppercase">{t("Zichlik")}</p>
                   </div>
                   <p className="text-lg font-black text-slate-900">{block.actual_density || '—'} <span className="text-xs text-slate-400">kg/m³</span></p>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-3 h-3 text-emerald-500" />
                      <p className="text-[9px] font-black text-slate-400 uppercase">{t("Namlik")}</p>
                   </div>
                   <p className="text-lg font-black text-slate-900">{block.moisture || '0'} <span className="text-xs text-slate-400">%</span></p>
                </div>
             </div>
          </div>

          {/* Dimensions Passport */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Maximize className="w-4 h-4" /> {t("O'lchamlar (mm)")}</h3>
             <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t("Uzunlik")}</p>
                   <p className="text-base font-black text-slate-900">{block.length || '1000'}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t("Eni")}</p>
                   <p className="text-base font-black text-slate-900">{block.width || '1000'}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t("Bo'yi")}</p>
                   <p className="text-base font-black text-slate-900">{block.height || '1000'}</p>
                </div>
             </div>
          </div>

          {/* Location Passport */}
          <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><MapPin className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("Hozirgi Manzil")}</p>
                   <p className="text-lg font-black text-blue-900">{block.warehouse_name || t("Aniq emas")}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("Zona / Rack")}</p>
                <p className="text-sm font-black text-blue-900">{block.zone || '—'} / {block.rack || '—'}</p>
             </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" /> {t("Blok Tarixi (Traceability)")}</h3>
             <div className="space-y-4">
                {block.timeline?.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== block.timeline!.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center z-10 text-slate-400">
                       <div className="w-2 h-2 bg-slate-400 rounded-full" />
                    </div>
                    <div className="flex-1 pb-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t(item.status)}</p>
                             <p className="text-xs text-slate-500 font-medium">{item.notes}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-900">{new Date(item.timestamp).toLocaleTimeString(locale)}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.user_name}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex gap-4">
           <button 
             onClick={onQC}
             className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black active:scale-95 transition-all"
           >
              <Activity className="w-5 h-5" />
              {t("QC & Tasniflash")}
           </button>
           <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
              <QrCode className="w-6 h-6" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
