import React from 'react';
import { motion } from 'motion/react';
import { 
  X, ShieldCheck, Box, User as UserIcon, 
  Maximize, Clock, Activity, QrCode, 
  Layers, Brush, FileText
} from 'lucide-react';
import { useI18n } from '../../i18n';

interface FigurePassportProps {
  figure: any;
  onClose: () => void;
}

export default function FigurePassport({ figure, onClose }: FigurePassportProps) {
  const { t, locale } = useI18n();

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
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{figure.figure_id || 'FIG-2026-000890'}</h2>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Figura Pasporti")}</p>
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
                  <p className="text-lg font-black">{t(figure.status || 'TAYYOR')}</p>
               </div>
            </div>
            <div className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${getClassificationColor(figure.classification || 'A_CLASS')}`}>
               {t(figure.classification_display || 'A-CLASS')}
            </div>
          </div>

          {/* Source CNC / Block Info */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers className="w-4 h-4" /> {t("Manba Ma'lumotlari")}</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("CNC Job")}</p>
                   <p className="text-xl font-black text-slate-900">{figure.cnc_job || 'CNC-2026-000089'}</p>
                   <p className="text-xs font-bold text-slate-500 mt-1">{figure.machine || 'CNC-1'} | Oper: {figure.cnc_operator || 'Mirzayev F.'}</p>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-[28px] border border-blue-100">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{t("Manba Blok")}</p>
                   <p className="text-xl font-black text-blue-900">{figure.source_block || 'BLK-2026-000247'}</p>
                   <p className="text-xs font-bold text-blue-600 mt-1">Sifat: A-Class | Zichlik: D20</p>
                </div>
             </div>
          </div>

          {/* Product & Dimensions */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box className="w-4 h-4" /> {t("Mahsulot & O'lchamlar")}</h3>
             <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                <p className="text-lg font-black text-slate-900 mb-4">{figure.product_name || 'Fasad panel 500x500x50'}</p>
                <div className="grid grid-cols-3 gap-3">
                   <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t("Uzunlik")}</p>
                      <p className="text-base font-black text-slate-900">{figure.length || '500'} mm</p>
                   </div>
                   <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t("Eni")}</p>
                      <p className="text-base font-black text-slate-900">{figure.width || '500'} mm</p>
                   </div>
                   <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t("Qalinligi")}</p>
                      <p className="text-base font-black text-slate-900">{figure.height || '50'} mm</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Finishing Stages */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Brush className="w-4 h-4" /> {t("Finishing (Pardozlash)")}</h3>
             <div className="bg-white border border-slate-100 rounded-[28px] shadow-sm p-2">
                {[
                  { title: 'Armirlash', op: 'Raximov U.', time: '30 daqiqa', done: true },
                  { title: 'Shpaklovka', op: 'Raximov U.', time: '25 daqiqa', done: true },
                  { title: 'Quritish', op: 'Avto', time: '6 soat', done: true },
                  { title: 'Bo\'yoq (RAL 9003)', op: 'Xasanov M.', time: 'Oq', done: true },
                ].map((stage, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded-2xl">
                     <div>
                        <p className="text-sm font-black text-slate-900">{t(stage.title)}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{stage.op} • {stage.time}</p>
                     </div>
                     {stage.done ? (
                       <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                       </div>
                     ) : (
                       <div className="w-8 h-8 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </div>

          {/* Yakuniy QC */}
          <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Activity className="w-5 h-5" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Yakuniy QC")}</p>
                </div>
                <p className="text-xs font-bold text-slate-500">19:15 | Xoliqova M.</p>
             </div>
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-600"><span className="text-slate-400">Yuzasi:</span> Tekis, yoriq yo'q</p>
                   <p className="text-xs font-bold text-slate-600"><span className="text-slate-400">Rang:</span> Bir xil</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">
                   A-CLASS
                </div>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex gap-4">
           <button onClick={() => alert("Bu funksiya tez kunda ishga tushadi")}  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black active:scale-95 transition-all">
              <FileText className="w-5 h-5" />
              {t("Hujjatni Yuklash")}
           </button>
           <button onClick={() => alert("Bu funksiya tez kunda ishga tushadi")}  className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
              <QrCode className="w-6 h-6" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
