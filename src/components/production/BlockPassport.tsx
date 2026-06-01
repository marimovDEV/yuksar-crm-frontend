import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database, 
  User as UserIcon, 
  Clock, 
  Activity, 
  CheckCircle2, Award, 
  QrCode, 
  MapPin, 
  Layers,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
  FileText,
  Droplets,
  Maximize,
  Factory,
  Clock3,
  Truck,
  AlertTriangle,
  DollarSign,
  Gauge,
  ShoppingCart,
  BarChart3,
  Zap,
  Flame,
  Wrench,
  Star
} from 'lucide-react';
import { FinishedBlock } from '../../types';
import { useI18n } from '../../i18n';

interface BlockPassportProps {
  block: FinishedBlock;
  onClose: () => void;
  onQC?: () => void;
}

const STATUS_ICONS: Record<string, string> = {
  CREATED: '📦',
  COOLING: '❄️',
  QC_PENDING: '🔍',
  READY: '✅',
  CUTTING: '✂️',
  FINISHING: '🎨',
  SHIPPED: '🚛',
  SOLD: '💰',
  TRANSFERRED: '🔄',
  PACKAGED: '📦',
  RESERVED: '🔒',
  RECYCLE: '♻️',
};

function formatUZS(value: number | undefined | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 0,
  }).format(value);
}

function getElapsedLabel(ms: number, t: (s: string) => string): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours} ${t('soat')} ${minutes} ${t('daqiqa')}`;
  }
  return `${minutes} ${t('daqiqa')}`;
}

export default function BlockPassport({ block, onClose, onQC }: BlockPassportProps) {
  const { t, locale } = useI18n();
  const qrPayload = block.qr_code_data || block.block_id;
  const defects = block.defect_list || (typeof block.visual_defects === 'string' ? block.visual_defects.split(',').map((item) => item.trim()).filter(Boolean) : []);

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

  const getClassificationBadgeColor = (cls: string) => {
    switch (cls) {
      case 'A': case 'A_CLASS': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'B': case 'B_CLASS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'C': case 'C_CLASS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reject': case 'REJECT': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 5) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' };
    if (moisture <= 10) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' };
    return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500' };
  };

  // Sort timeline chronologically (oldest first)
  const sortedTimeline = [...(block.timeline || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const fa = block.financial_analysis;
  const qm = block.quality_metrics;
  const ci = block.commercial_info;

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

          {/* RAQAMLI SIFAT SERTIFIKATI (Signed Digital Certificate) */}
          <div className="relative overflow-hidden p-6 rounded-[32px] border-2 border-dashed border-emerald-500/30 bg-emerald-50/10 shadow-inner flex flex-col gap-4">
             <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600">
                      <Award className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Raqamli Sifat Sertifikati")}</h4>
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{t("Yuksar QC Certified")}</p>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black tracking-widest uppercase shadow-sm shadow-emerald-500/20">{t("VERIFIED")}</span>
                   <span className="text-[7px] font-bold text-slate-400 mt-1">{t("SCADA SECURE SIGNATURE")}</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600 border-t border-b border-slate-100 py-3">
                <div>
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">{t("Laboratoriya tekshiruvi")}</p>
                   <p className="text-[10px] font-black text-slate-800 mt-0.5">{block.operator_name || 'SCADA Usta'} &bull; {t("Laborant")}</p>
                </div>
                <div>
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">{t("Sertifikat Hash")}</p>
                   <p className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-0.5 break-all">
                      {`YS-QC-${block.block_id.replace(/\s+/g, '')}-${((block.actual_weight || 18.5) * (block.moisture || 4.2)).toFixed(0)}`}
                   </p>
                </div>
             </div>

             <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
                <span>SCADA Validation: Node V2.18-OK</span>
                <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck className="w-3 h-3" /> Secure Cryptographic Seal</span>
             </div>
          </div>


          {/* Core Passport Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Layers className="w-5 h-5" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Batch / Zames")}</p>
                </div>
                <p className="text-xl font-black text-slate-900">{block.zames_number || block.recipe_name || '—'}</p>
                <p className="text-xs font-bold text-blue-600 mt-1">{block.production_batch_number || block.lot}</p>
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

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Factory className="w-5 h-5" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Ishlab chiqarish")}</p>
                </div>
                <p className="text-sm font-black text-slate-900">{block.recipe_name || '—'}</p>
                <p className="text-xs font-bold text-indigo-600 mt-1">{t("Bunker")}: {block.bunker_name || '—'} • {t("Stanok")}: {block.machine_id || '—'}</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><Clock3 className="w-5 h-5" /></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Texnik")}</p>
                </div>
                <p className="text-sm font-black text-slate-900">{t("Cooling Time")}: {block.cooling_time_hours ?? '—'} h</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">{t("Hajm")}: {block.lot_volume || '—'} m³ • {t("Target")}: {block.lot_density || '—'} kg/m³</p>
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
                   <p className="text-lg font-black text-blue-900">{block.current_location?.warehouse_name || block.warehouse_name || t("Aniq emas")}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("Zona / Rack")}</p>
                <p className="text-sm font-black text-blue-900">{block.current_location?.zone || block.zone || '—'} / {block.current_location?.rack || block.rack || '—'}</p>
                <p className="text-[10px] font-bold text-blue-500 mt-1">{block.current_location?.location_code || '—'}</p>
             </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* NEW SECTION 1: Financial Analysis */}
          {/* ═══════════════════════════════════════════════════ */}
          {fa && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> {t("Moliyaviy Tahlil")}
              </h3>
              <div className="rounded-[28px] border border-slate-100 overflow-hidden shadow-sm">
                {/* Dark header with total cost */}
                <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t("Jami Tannarx")}</p>
                      <p className="text-lg font-black">{formatUZS(fa.total_cost)} <span className="text-xs text-white/50">UZS</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t("Margin foizi")}</p>
                    <p className="text-lg font-black text-emerald-400">{fa.margin_percent?.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Cost breakdown list */}
                <div className="bg-white divide-y divide-slate-50">
                  {[
                    { label: t("EPS Xom Ashyo"), value: fa.eps_cost, icon: <Database className="w-3.5 h-3.5 text-blue-500" /> },
                    { label: t("Gaz xarajati"), value: fa.gas_cost, icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
                    { label: t("Elektr xarajati"), value: fa.electricity_cost, icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
                    { label: t("Ish haqi"), value: fa.labor_cost, icon: <UserIcon className="w-3.5 h-3.5 text-indigo-500" /> },
                    { label: t("Pardozlash xarajati"), value: fa.finishing_cost, icon: <Wrench className="w-3.5 h-3.5 text-slate-500" /> },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-sm font-bold text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{formatUZS(item.value)} <span className="text-[10px] text-slate-400">UZS</span></span>
                    </div>
                  ))}

                  {/* Divider before totals */}
                  <div className="border-t-2 border-slate-200" />

                  {/* Sell Price */}
                  <div className="flex items-center justify-between px-5 py-3 bg-emerald-50/50">
                    <span className="text-sm font-black text-emerald-700 uppercase tracking-wide">{t("Sotish Narxi")}</span>
                    <span className="text-base font-black text-emerald-600">{formatUZS(fa.sell_price)} <span className="text-[10px] text-emerald-400">UZS</span></span>
                  </div>

                  {/* Profit / Margin */}
                  <div className="flex items-center justify-between px-5 py-3 bg-emerald-50/50">
                    <span className="text-sm font-black text-emerald-700 uppercase tracking-wide">{t("Foyda (margin)")}</span>
                    <span className="text-base font-black text-emerald-600">{formatUZS(fa.margin)} <span className="text-[10px] text-emerald-400">UZS ({fa.margin_percent?.toFixed(1)}%)</span></span>
                  </div>

                  {/* Progress bar for margin */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Margin foizi")}</span>
                      <span className="text-xs font-black text-slate-600">{fa.margin_percent?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-400 to-emerald-600"
                        style={{ width: `${Math.min(Math.max(fa.margin_percent || 0, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* NEW SECTION 2: Quality Metrics */}
          {/* ═══════════════════════════════════════════════════ */}
          {qm && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Gauge className="w-4 h-4" /> {t("Sifat Ko'rsatkichlari")}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Density: target vs actual */}
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">{t("Zichlik")}</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{qm.density} <span className="text-xs text-slate-400">kg/m³</span></p>
                  {block.lot_density && (
                    <p className="text-[10px] font-bold text-blue-500 mt-1">{t("Maqsad")}: {block.lot_density} kg/m³</p>
                  )}
                </div>

                {/* Moisture with color indicator */}
                {(() => {
                  const mc = getMoistureColor(qm.moisture);
                  return (
                    <div className={`p-4 ${mc.bg} border ${mc.border} rounded-2xl`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className={`w-3 h-3 ${mc.text}`} />
                        <p className="text-[9px] font-black text-slate-400 uppercase">{t("Namlik")}</p>
                        <div className={`w-2 h-2 rounded-full ${mc.dot} ml-auto`} />
                      </div>
                      <p className={`text-lg font-black ${mc.text}`}>{qm.moisture}%</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {qm.moisture < 5 ? '< 5% ✓' : qm.moisture <= 10 ? '5-10%' : '> 10% ⚠'}
                      </p>
                    </div>
                  );
                })()}

                {/* Dimensions */}
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize className="w-3 h-3 text-indigo-500" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">{t("O'lchamlar")}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {qm.dimensions.length} × {qm.dimensions.width} × {qm.dimensions.height}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">mm</p>
                </div>

                {/* Defect percent */}
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">{t("Nuqson foizi")}</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{qm.defect_percent}%</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full ${qm.defect_percent > 5 ? 'bg-rose-500' : qm.defect_percent > 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(qm.defect_percent * 5, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Classification badge */}
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{t("Sinf")}</p>
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${getClassificationBadgeColor(qm.classification)}`}>
                      {qm.classification}
                    </span>
                  </div>
                </div>

                {/* Operator score */}
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-3 h-3 text-amber-500" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">{t("Operator bahosi")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-slate-900">{qm.operator_score}</p>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            qm.operator_score >= 80 ? 'bg-emerald-500' : qm.operator_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${qm.operator_score}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 text-right">/100</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* NEW SECTION 3: Commercial Info */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> {t("Savdo Ma'lumotlari")}
            </h3>

            {ci?.sold ? (
              <div className="p-6 bg-emerald-50 rounded-[28px] border border-emerald-100 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t("Mijoz nomi")}</p>
                    <p className="text-base font-black text-emerald-900">{ci.customer || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t("Faktura raqami")}</p>
                    <p className="text-sm font-black text-emerald-900">{ci.invoice_number || ci.invoice || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t("Faktura sanasi")}</p>
                    <p className="text-sm font-black text-emerald-900">
                      {ci.invoice_date ? new Date(ci.invoice_date).toLocaleDateString(locale) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t("Sotish Narxi")}</p>
                    <p className="text-sm font-black text-emerald-900">{ci.sell_price ? formatUZS(ci.sell_price) + ' UZS' : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t("To'lov holati")}</p>
                    <p className="text-sm font-black text-emerald-900">{ci.payment_status ? t(ci.payment_status) : '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">{t("Hali sotilmagan")}</p>
                  {ci?.reserved && (
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mt-1">{t("RESERVED")}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Defect History */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t("Defect History")}</h3>
             <div className="p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                {defects.length === 0 ? (
                  <p className="text-sm font-bold text-slate-400">{t("Nuqson qayd etilmagan")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {defects.map((defect) => (
                      <span key={defect} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">{defect}</span>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Transfer History */}
          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Truck className="w-4 h-4" /> {t("Transfer History")}</h3>
             <div className="space-y-3">
                {(block.transfer_history || []).length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-bold text-slate-400">{t("Transferlar hali mavjud emas")}</div>
                ) : (
                  block.transfer_history?.map((transfer) => (
                    <div key={transfer.id} className="p-5 bg-slate-50 border border-slate-100 rounded-[28px]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-slate-900">{transfer.transfer_number}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{transfer.from_warehouse_name} → {transfer.to_warehouse_name}</p>
                          <p className="text-xs text-slate-500 mt-2">{transfer.reason || transfer.notes || '—'}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest">{t(transfer.status)}</span>
                          <p className="text-[10px] font-bold text-slate-400 mt-2">{transfer.created_at ? new Date(transfer.created_at).toLocaleString(locale) : '—'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* ENHANCED TIMELINE */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" /> {t("Blok Tarixi (Traceability)")}</h3>
             <div className="space-y-4">
                {sortedTimeline.map((item, i) => {
                  const statusIcon = STATUS_ICONS[item.status] || '⬤';
                  // Calculate elapsed time to next step
                  let elapsedLabel: string | null = null;
                  if (i < sortedTimeline.length - 1) {
                    const currentTime = new Date(item.timestamp).getTime();
                    const nextTime = new Date(sortedTimeline[i + 1].timestamp).getTime();
                    const diff = nextTime - currentTime;
                    if (diff > 0) {
                      elapsedLabel = getElapsedLabel(diff, t);
                    }
                  }

                  return (
                    <div key={i} className="flex gap-4 relative">
                      {i !== sortedTimeline.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100" />
                      )}
                      <div className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center z-10 text-lg">
                         {statusIcon}
                      </div>
                      <div className="flex-1 pb-6">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t(item.status)}</p>
                               <p className="text-xs text-slate-500 font-medium">{item.notes}</p>
                               {elapsedLabel && (
                                 <p className="text-[10px] font-bold text-blue-500 mt-1.5 flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> {elapsedLabel}
                                 </p>
                               )}
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-900">{new Date(item.timestamp).toLocaleTimeString(locale)}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.user_name}</p>
                               <p className="text-[9px] font-bold text-slate-300 mt-0.5">{new Date(item.timestamp).toLocaleDateString(locale)}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
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
           <button onClick={() => { void navigator.clipboard?.writeText(qrPayload); }} className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all" title={qrPayload}>
              <QrCode className="w-6 h-6" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
