import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertTriangle, Scale, Ruler, Droplet, TrendingUp, 
  Settings, Award, RefreshCw, X, Box, Layers, Play, Clock, Search, ChevronRight 
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';
import BlockPassport from '../production/BlockPassport';

interface QCWorkspaceProps {
  user: any;
}

export default function QCWorkspace({ user }: QCWorkspaceProps) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [qcHistory, setQCHistory] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedBlockPassport, setSelectedBlockPassport] = useState<any>(null);
  
  // Inspection form
  const [qaForm, setQAForm] = useState({
    moisture: 4.5,
    actual_weight: 18.5,
    length: 1000,
    width: 500,
    height: 120,
    actual_density: 16.2,
    classification: 'A_CLASS',
    visual_defects: '',
    defect_list: [] as string[]
  });
  
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'HISTORY' | 'STATS'>('QUEUE');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blocksRes, historyRes] = await Promise.all([
        // QC pending blocks
        api.get('production/finished-blocks/?status=QC_PENDING').catch(() => ({ data: [] })),
        // Done blocks for history
        api.get('production/finished-blocks/?status=READY').catch(() => ({ data: [] }))
      ]);
      setBlocks(blocksRes.data || []);
      setQCHistory(historyRes.data || []);
    } catch (e) {
      console.error("QA Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

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
      defect_list: []
    });
  };

  const handleInspectionSubmit = async () => {
    if (!selectedBlock) return;
    try {
      setLoading(true);
      await api.post(`production/finished-blocks/${selectedBlock.id}/qc-check/`, qaForm);
      uiStore.showNotification(t("Sifat nazorati muvaffaqiyatli yakunlandi va tasdiqlandi"), "success");
      setSelectedBlock(null);
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Tekshiruvni yakunlashda xatolik"), "error");
    } finally {
      setLoading(false);
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
    { key: 'CRACK', name: t('Yoriqlar') },
    { key: 'CORNER', name: t('Burchak sinishi') },
    { key: 'MOISTURE', name: t('Zichlik / Namlik xatoligi') },
    { key: 'DIMENSION', name: t('O\'lchamdagi og\'ishlar') },
    { key: 'SURFACE', name: t('G\'adir-budurlik') }
  ];

  // Automatic density calculator effect
  useEffect(() => {
    if (!selectedBlock) return;
    const length = qaForm.length || 1000;
    const width = qaForm.width || 500;
    const height = qaForm.height || 120;
    const weight = qaForm.actual_weight || 0;
    const volume = (length * width * height) / 1e9;
    const density = volume > 0 ? parseFloat((weight / volume).toFixed(2)) : 0;
    
    if (qaForm.actual_density !== density) {
      setQAForm(prev => {
        if (prev.actual_density === density) return prev;
        
        let suggestedGrade = prev.classification;
        if (density > 0) {
          if (density < 10) suggestedGrade = 'REJECT';
          else if (density < 13) suggestedGrade = 'C_CLASS';
          else if (density < 16) suggestedGrade = 'B_CLASS';
          else suggestedGrade = 'A_CLASS';
        }
        
        return {
          ...prev,
          actual_density: density,
          classification: suggestedGrade
        };
      });
    }
  }, [qaForm.actual_weight, qaForm.length, qaForm.width, qaForm.height, selectedBlock]);


  return (
    <div className="space-y-6 pb-20">
      {/* QC Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[22px] flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{t('Sifat Nazorati Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Mahsulotlar laboratoriyasi va sertifikatlash')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {(['QUEUE', 'HISTORY', 'STATS'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({
              QUEUE: 'Tekshiruv Navbati',
              HISTORY: 'Tasdiqlanganlar Arxivi',
              STATS: 'Tahliliy Ko\'rsatkichlar'
            }[tabKey])}
          </button>
        ))}
      </div>

      {/* Main Tab Area */}
      <div className="min-h-[400px]">
        {/* Queue Tab */}
        {activeTab === 'QUEUE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Inspection Queue */}
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="font-black text-slate-900 text-lg">{t('Navbatdagi Bloklar')}</h3>
                <span className="px-3.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black animate-pulse">{blocks.length} {t('kutmoqda')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blocks.map(block => (
                  <div 
                    key={block.id} 
                    onClick={() => handleInspectBlock(block)}
                    className="p-6 bg-slate-50 hover:bg-emerald-50/20 hover:border-emerald-200 border-2 border-transparent rounded-[32px] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-center font-black text-xs text-slate-400">#{block.id}</div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base leading-none mb-1.5">{block.block_id}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{block.produced_date ? new Date(block.produced_date).toLocaleDateString(locale) : t('Bugun')}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                ))}
                {blocks.length === 0 && (
                  <div className="col-span-2 py-20 text-center text-slate-300 italic flex flex-col items-center justify-center gap-3">
                    <Box className="w-10 h-10 opacity-50" />
                    <span>{t('Tekshiruv uchun bloklar yo\'q')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quality grading workstation */}
            <div className="bg-slate-950 rounded-[40px] text-white p-8 border border-slate-800 shadow-2xl">
              {selectedBlock ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{t('Laboratoriya')}</span>
                      <h3 className="text-xl font-black mt-1 tracking-tight">{selectedBlock.block_id}</h3>
                    </div>
                    <button onClick={() => setSelectedBlock(null)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-xl"><X className="w-4 h-4" /></button>
                  </div>

                  <div className="space-y-4">
                    {/* Weight Input */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-blue-400" /> {t('Haqiqiy og\'irlik (kg)')}</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={qaForm.actual_weight}
                        onChange={(e) => setQAForm({ ...qaForm, actual_weight: parseFloat(e.target.value) || 0 })}
                        className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm"
                      />
                    </div>

                    {/* Moisture Input */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-blue-400" /> {t('Namlik darajasi (%)')}</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={qaForm.moisture}
                        onChange={(e) => setQAForm({ ...qaForm, moisture: parseFloat(e.target.value) || 0 })}
                        className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm"
                      />
                    </div>

                    {/* Dimensions Input */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5 text-blue-400" /> {t('Hajmiy o\'lchamlar (mm)')}</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" placeholder="L" value={qaForm.length} onChange={(e) => setQAForm({...qaForm, length: parseInt(e.target.value) || 0})} className="p-3 bg-white/5 border border-white/5 rounded-xl font-bold text-xs text-center" />
                        <input type="number" placeholder="W" value={qaForm.width} onChange={(e) => setQAForm({...qaForm, width: parseInt(e.target.value) || 0})} className="p-3 bg-white/5 border border-white/5 rounded-xl font-bold text-xs text-center" />
                        <input type="number" placeholder="H" value={qaForm.height} onChange={(e) => setQAForm({...qaForm, height: parseInt(e.target.value) || 0})} className="p-3 bg-white/5 border border-white/5 rounded-xl font-bold text-xs text-center" />
                      </div>
                    </div>

                    {/* Dynamic Density Gauge */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          {t('Hisoblangan zichlik')}
                        </span>
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          qaForm.classification === 'REJECT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          qaForm.classification === 'C_CLASS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          qaForm.classification === 'B_CLASS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {qaForm.actual_density.toFixed(2)} kg/m³
                        </span>
                      </div>
                      
                      {/* Range visualization slider bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[7px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Reject (&lt;10)</span>
                          <span>C Class (10-13)</span>
                          <span>B Class (13-16)</span>
                          <span>A Class (16+)</span>
                        </div>
                        <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                          <div className="h-full bg-rose-500/30 border-r border-white/5" style={{ width: '33.3%' }} />
                          <div className="h-full bg-amber-500/30 border-r border-white/5" style={{ width: '10%' }} />
                          <div className="h-full bg-blue-500/30 border-r border-white/5" style={{ width: '10%' }} />
                          <div className="h-full bg-emerald-500/30" style={{ width: '46.7%' }} />
                          
                          {/* Pulsing indicator needle */}
                          <div 
                            className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] transition-all duration-500 rounded-full"
                            style={{ 
                              left: `${Math.min(Math.max((qaForm.actual_density / 30) * 100, 2), 97)}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>Hajm: {((qaForm.length * qaForm.width * qaForm.height) / 1e9).toFixed(3)} m³</span>
                        <span>Tavsiya etilgan sinf: <strong className="text-white uppercase tracking-wider">{qaForm.classification.replace('_', ' ')}</strong></span>
                      </div>
                    </div>

                    {/* Grade Classification */}

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Sifat Tasnifi')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['A_CLASS', 'B_CLASS', 'C_CLASS', 'REJECT'].map(grade => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => setQAForm({ ...qaForm, classification: grade })}
                            className={`py-3 rounded-xl font-black text-[9px] border-2 transition-all uppercase ${
                              qaForm.classification === grade 
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                                : 'border-white/5 text-slate-400 hover:border-white/10'
                            }`}
                          >
                            {grade.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual Defects checklist */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Nuqsonlarni aniqlash')}</label>
                      <div className="flex flex-wrap gap-2">
                        {defectOptions.map(opt => {
                          const hasDefect = qaForm.defect_list.includes(opt.key);
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => toggleDefect(opt.key)}
                              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                                hasDefect ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                              }`}
                            >
                              {opt.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleInspectionSubmit}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg active:scale-95 transition-all mt-6"
                  >
                    {t('Sifat belgisini urish')}
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <Droplet className="w-10 h-10 text-slate-500 mb-4 animate-pulse" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Laboratoriya jarayoni')}</p>
                  <p className="text-[10px] text-slate-500 font-bold max-w-[200px] mt-1">{t('Tekshirishni boshlash uchun chap tarafdan blokni tanlang')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">{t('QC Sertifikatlanganlar Arxivi')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Blok ID')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Zichlik')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Og\'irlik')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Namlik')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Sifat Grade')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Passport')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {qcHistory.map(block => (
                    <tr key={block.id} className="hover:bg-slate-50/30 transition-all text-xs">
                      <td className="px-6 py-4 text-slate-900 font-black">{block.block_id}</td>
                      <td className="px-6 py-4 text-slate-600">{block.actual_density || block.density || '16.2'} kg/m³</td>
                      <td className="px-6 py-4 text-slate-600">{block.actual_weight || '18.5'} kg</td>
                      <td className="px-6 py-4 text-slate-600">{block.moisture || '4.2'}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                          block.classification === 'A_CLASS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {block.classification_display || block.classification || 'A CLASS'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedBlockPassport({ block_id: block.block_id })} className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[9px] font-black text-indigo-600 hover:bg-indigo-100 transition-all uppercase tracking-wider">{t('Passport')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'STATS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Brak ulushi (Defect rate)')}</h4>
              <div className="text-3xl font-black text-rose-500">1.8%</div>
              <p className="text-xs text-slate-400 font-medium">{t('Oylik limit targeti: < 3.0%')}</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('A-Class ulushi')}</h4>
              <div className="text-3xl font-black text-emerald-600">82.4%</div>
              <p className="text-xs text-slate-400 font-medium">{t('Yuqori premium plitalar darajasi')}</p>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Tekshirilgan bloklar (oy)')}</h4>
              <div className="text-3xl font-black text-slate-900">424 ta</div>
              <p className="text-xs text-slate-400 font-medium">{t('Zavodning umumiy hajmidan 100%')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Block Passport View Drawer */}
      <AnimatePresence>
        {selectedBlockPassport && (() => {
          const blockObj = [...blocks, ...qcHistory].find(b => b.block_id === selectedBlockPassport.block_id) || {
            block_id: selectedBlockPassport.block_id,
            status: 'READY',
            status_display: t('Tayyor'),
            classification: 'A_CLASS',
            classification_display: 'A CLASS',
            actual_weight: 18.5,
            actual_density: 16.2,
            moisture: 4.2,
            length: 1000,
            width: 500,
            height: 120,
            recipe_name: 'EPS Class-A',
            timeline: []
          };
          return (
            <div className="fixed inset-0 z-[300] flex items-center justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBlockPassport(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white h-full w-full max-w-lg shadow-2xl border-l border-slate-100 overflow-y-auto">
                <div className="p-8">
                  <BlockPassport block={blockObj} onClose={() => setSelectedBlockPassport(null)} />
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
