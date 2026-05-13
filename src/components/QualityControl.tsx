import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  Package,
  ShieldCheck,
  Activity,
  TrendingUp,
  BarChart3,
  History,
  QrCode,
  MapPin,
  ClipboardList
} from 'lucide-react';
import api from '../lib/api';
import { uiStore } from '../lib/store';
import { FinishedBlock, User as UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';
import BlockQCModal from './production/BlockQCModal';
import BlockPassport from './production/BlockPassport';
import RawMaterialQCModal from './RawMaterialQCModal';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

export default function QualityControl({ user }: { user: UserType }) {
  const { t } = useI18n();
  const [blocks, setBlocks] = useState<FinishedBlock[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [qcType, setQcType] = useState<'BLOCKS' | 'RAW_MATERIALS'>('BLOCKS');
  const [selectedBlockForQC, setSelectedBlockForQC] = useState<FinishedBlock | null>(null);
  const [selectedBlockForPassport, setSelectedBlockForPassport] = useState<FinishedBlock | null>(null);
  const [selectedBatchForQC, setSelectedBatchForQC] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blocksRes, batchesRes] = await Promise.all([
        api.get('production/finished-blocks/'),
        api.get('batches/')
      ]);
      setBlocks(blocksRes.data);
      setBatches(batchesRes.data.results || batchesRes.data);
    } catch (err) {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBlocks = blocks.filter(b => {
    const matchesSearch = (b.block_id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (b.recipe_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'queue') return matchesSearch && b.status === 'QC_PENDING';
    if (activeTab === 'history') return matchesSearch && b.status !== 'QC_PENDING';
    return matchesSearch;
  });

  const filteredBatches = batches.filter(b => {
    const matchesSearch = (b.batch_number || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (b.material_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'queue') return matchesSearch && b.status === 'INSPECTION';
    if (activeTab === 'history') return matchesSearch && b.status !== 'INSPECTION' && b.status !== 'RECEIVED';
    return matchesSearch;
  });

  const stats = qcType === 'BLOCKS' ? [
    { label: 'Bugun Tekshirildi', val: blocks.filter(b => b.status !== 'QC_PENDING').length, color: 'blue', icon: ClipboardList },
    { label: 'Tasdiqlandi (A/B)', val: blocks.filter(b => ['A_CLASS', 'B_CLASS'].includes(b.classification || '')).length, color: 'emerald', icon: CheckCircle2 },
    { label: 'Rad etildi (Reject)', val: blocks.filter(b => b.classification === 'REJECT').length, color: 'rose', icon: XCircle },
    { label: 'Sifat Ko\'rsatkichi', val: '97.2%', color: 'amber', icon: TrendingUp },
  ] : [
    { label: 'Kutilayotgan QC', val: batches.filter(b => b.status === 'INSPECTION').length, color: 'blue', icon: ClipboardList },
    { label: 'Qabul Qilingan', val: batches.filter(b => b.status === 'IN_STOCK').length, color: 'emerald', icon: CheckCircle2 },
    { label: 'Rad Etilgan', val: batches.filter(b => b.status === 'CANCELLED').length, color: 'rose', icon: XCircle },
    { label: 'O\'rtacha Sifat', val: '99.1%', color: 'amber', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 QC CENTER HEADER & STATS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
             <ShieldCheck className="w-10 h-10 text-blue-600" />
             {t('Quality Control Center')}
          </h1>
          <p className="text-slate-500 font-medium text-xs uppercase tracking-[0.2em] mt-2 ml-1">{t('Zavod Sifat Nazorati va Tasniflash Tizimi')}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={t("Block ID yoki Retsept...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-bold w-64 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              />
           </div>
           <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* 📊 KPI WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-premium hover:shadow-xl transition-all group overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:bg-blue-50 transition-colors" />
               <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{t(stat.label)}</p>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight relative z-10">{stat.val}</h3>
            </motion.div>
         ))}
      </div>

      {/* 📋 MAIN INTERFACE */}
      <div className="bg-white rounded-[56px] border border-slate-100 shadow-premium overflow-hidden min-h-[600px] flex flex-col">
         
         {/* TABS */}
         <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-200/50">
                  {[
                    { id: 'queue', label: t('QC Queue (Navbat)'), icon: Activity },
                    { id: 'gallery', label: t('Reject Gallery'), icon: ClipboardList },
                    { id: 'history', label: t('QC History (Tarix)'), icon: History },
                    { id: 'analytics', label: t('Analytics (Tahlil)'), icon: BarChart3 }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300
                        ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-lg shadow-blue-100 ring-1 ring-blue-50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
                      `}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
               </div>

               {activeTab !== 'analytics' && (
                  <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setQcType('BLOCKS')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          qcType === 'BLOCKS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                        }`}
                     >
                        {t('Tayyor Bloklar')}
                     </button>
                     <button 
                        onClick={() => setQcType('RAW_MATERIALS')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          qcType === 'RAW_MATERIALS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                        }`}
                     >
                        {t('Xom-ashyo')}
                     </button>
                  </div>
               )}
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Live Feed: {(qcType === 'BLOCKS' ? blocks : batches).length} {t('Items')}
               </div>
            </div>
         </div>

          <div className="flex-1">
            {activeTab === 'analytics' ? (
              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Classification Distribution */}
                    <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">{t('Sifat Tasnifi Taqsimoti')}</h3>
                       <div className="h-[300px] min-h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                  data={[
                                    { name: 'A-Class', value: blocks.filter(b => b.classification === 'A_CLASS').length, color: '#10b981' },
                                    { name: 'B-Class', value: blocks.filter(b => b.classification === 'B_CLASS').length, color: '#3b82f6' },
                                    { name: 'C-Class', value: blocks.filter(b => b.classification === 'C_CLASS').length, color: '#f59e0b' },
                                    { name: 'Reject', value: blocks.filter(b => b.classification === 'REJECT').length, color: '#ef4444' },
                                  ].filter(d => d.value > 0)}
                                  innerRadius={80}
                                  outerRadius={110}
                                  paddingAngle={8}
                                  dataKey="value"
                                >
                                  {blocks.length > 0 && [
                                    { color: '#10b981' }, { color: '#3b82f6' }, { color: '#f59e0b' }, { color: '#ef4444' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Daily Volume */}
                    <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">{t('Kunlik QC Hajmi')}</h3>
                       <div className="h-[300px] min-h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={
                               Object.entries(
                                 blocks.reduce((acc: any, b) => {
                                   const date = new Date(b.created_at).toLocaleDateString();
                                   acc[date] = (acc[date] || 0) + 1;
                                   return acc;
                                 }, {})
                               ).map(([date, val]) => ({ date, val })).slice(-7)
                             }>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                <Tooltip 
                                  cursor={{ fill: '#f1f5f9' }}
                                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="val" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>

                 {/* Trend Metrics */}
                 <div className="bg-slate-900 p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                             <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="text-xl font-black">{t('Sifat Progressi')}</h4>
                       </div>
                       <p className="text-slate-400 text-sm font-medium max-w-sm">
                          O'tgan haftaga nisbatan A-klass mahsulotlar ulushi 4.2% ga oshdi. Brak miqdori 0.8% ga kamaydi.
                       </p>
                    </div>
                    <div className="flex items-center gap-10">
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Target')}</p>
                          <p className="text-2xl font-black">98.5%</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('Actual')}</p>
                          <p className="text-2xl font-black text-emerald-400">97.2%</p>
                       </div>
                       <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all">
                          {t('Eksport (PDF)')}
                       </button>
                    </div>
                 </div>
              </div>
            ) : activeTab === 'gallery' ? (
              <div className="p-10 space-y-10 animate-in slide-in-from-bottom duration-700">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('Reject & Defect Gallery')}</h3>
                       <p className="text-slate-500 text-sm font-medium">{t('Sifat talablariga javob bermagan mahsulotlar arxivi')}</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100">{t('Hammasini Chiqarish')}</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {blocks.filter(b => b.classification === 'REJECT').length === 0 ? (
                       <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-[48px]">
                          <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold">{t('Hozircha brak mahsulotlar yo\'q')}</p>
                       </div>
                    ) : (
                       blocks.filter(b => b.classification === 'REJECT').map((b, i) => (
                         <motion.div 
                           key={b.id} 
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.05 }}
                           className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group"
                         >
                            <div className="h-48 bg-slate-900 relative flex items-center justify-center">
                               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                               <XCircle className="w-16 h-16 text-rose-500/20 group-hover:scale-125 transition-transform duration-700" />
                               <div className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">REJECTED</div>
                               <div className="absolute bottom-4 left-4">
                                  <p className="text-white font-black text-xs">{b.block_id}</p>
                                  <p className="text-white/40 text-[9px] font-bold uppercase">{b.recipe_name}</p>
                               </div>
                            </div>
                            <div className="p-6 space-y-4">
                               <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{t('Sabab')}: {t('Zichlik Noto\'g\'ri')}</p>
                               </div>
                               <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400">{new Date(b.created_at).toLocaleDateString()}</span>
                                  <button onClick={() => setSelectedBlockForPassport(b)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">{t('Batafsil')}</button>
                               </div>
                            </div>
                         </motion.div>
                       ))
                    )}
                 </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{qcType === 'BLOCKS' ? t('Block ID & Passport') : t('Batch # & QR')}</th>
                         <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{qcType === 'BLOCKS' ? t('Mahsulot & Batch') : t('Material')}</th>
                         <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mas\'ul Shaxs')}</th>
                         <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Vaqt')}</th>
                         <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Holati')}</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amallar')}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {loading ? (
                         <tr>
                            <td colSpan={6} className="py-24 text-center">
                               <div className="flex flex-col items-center gap-4">
                                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('Yuklanmoqda...')}</p>
                               </div>
                            </td>
                         </tr>
                      ) : (qcType === 'BLOCKS' ? filteredBlocks : filteredBatches).length === 0 ? (
                         <tr>
                            <td colSpan={6} className="py-32 text-center">
                               <div className="flex flex-col items-center gap-6 opacity-30 grayscale">
                                  <ClipboardList className="w-20 h-20" />
                                  <div>
                                     <p className="text-xl font-black text-slate-900 uppercase tracking-widest">{t('Navbat bo\'sh')}</p>
                                     <p className="text-sm font-medium text-slate-500 mt-2">{t('Barcha elementlar tekshiruvdan o\'tgan')}</p>
                                  </div>
                               </div>
                            </td>
                         </tr>
                      ) : (
                        (qcType === 'BLOCKS' ? filteredBlocks : filteredBatches).map((item) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-blue-50/20 transition-all group"
                          >
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                      <QrCode className="w-6 h-6" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 tracking-tight">{qcType === 'BLOCKS' ? item.block_id : item.batch_number}</p>
                                      {qcType === 'BLOCKS' && (
                                        <button 
                                          onClick={() => setSelectedBlockForPassport(item)}
                                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                        >
                                          {t('Pasportni ko\'rish')}
                                        </button>
                                      )}
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-8">
                                <p className="text-sm font-black text-slate-900">{qcType === 'BLOCKS' ? item.recipe_name : item.material_name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                   {qcType === 'BLOCKS' && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase">{item.batch_number || 'NO BATCH'}</span>}
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{qcType === 'BLOCKS' ? t('Smena') : t('Miqdor')}: {qcType === 'BLOCKS' ? (item.shift_display || 'A') : (item.quantity_kg + ' kg')}</span>
                                </div>
                             </td>
                             <td className="px-6 py-8">
                                <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-[8px] font-black text-blue-600 border border-blue-100">
                                      {(item.operator_name || item.responsible_user_name)?.charAt(0) || 'U'}
                                   </div>
                                   <span className="text-xs font-bold text-slate-700">{item.operator_name || item.responsible_user_name || 'System Operator'}</span>
                                </div>
                             </td>
                             <td className="px-6 py-8">
                                <p className="text-xs font-black text-slate-900">{new Date(item.created_at || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(item.created_at || item.date).toLocaleDateString()}</p>
                             </td>
                             <td className="px-6 py-8 text-center">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                  (item.status === 'READY' || item.status === 'IN_STOCK') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  (item.status === 'QC_PENDING' || item.status === 'INSPECTION') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                   {t(item.status_display || item.status)}
                                </span>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   {(item.status === 'QC_PENDING' || item.status === 'INSPECTION') ? (
                                     <button 
                                       onClick={() => qcType === 'BLOCKS' ? setSelectedBlockForQC(item) : setSelectedBatchForQC(item)}
                                       className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                                     >
                                        {t('Tekshirish')}
                                     </button>
                                   ) : (
                                     <div className={`p-3 rounded-xl border ${
                                       (item.classification === 'A_CLASS' || item.status === 'IN_STOCK') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                       item.classification === 'REJECT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500'
                                     }`}>
                                        <p className="text-[9px] font-black uppercase">{t(item.classification_display || item.status)}</p>
                                     </div>
                                   )}
                                </div>
                             </td>
                          </motion.tr>
                        ))
                      )}
                   </tbody>
                </table>
              </div>
            )}
         </div>
      </div>

      {/* 🛠 MODALS SECTION */}
      <AnimatePresence>
        {selectedBlockForQC && (
          <BlockQCModal 
            block={selectedBlockForQC} 
            onClose={() => setSelectedBlockForQC(null)} 
            onSuccess={fetchData}
          />
        )}
        {selectedBlockForPassport && (
          <BlockPassport 
            block={selectedBlockForPassport} 
            onClose={() => setSelectedBlockForPassport(null)} 
            onQC={() => {
              setSelectedBlockForQC(selectedBlockForPassport);
              setSelectedBlockForPassport(null);
            }}
          />
        )}
        {selectedBatchForQC && (
          <RawMaterialQCModal 
            batch={selectedBatchForQC} 
            onClose={() => setSelectedBatchForQC(null)} 
            onSuccess={fetchData}
            t={t}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
