import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, FlaskConical, BarChart3, TrendingUp, Cpu, Thermometer, Zap, 
  Settings, Clock, CheckCircle2, AlertTriangle, FileText, Plus, X 
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface TechnologistWorkspaceProps {
  user: any;
}

export default function TechnologistWorkspace({ user }: TechnologistWorkspaceProps) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [qcMetrics, setQCMetrics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'RECIPES' | 'QC_ANALYTICS' | 'PROCESS_CONTROL'>('RECIPES');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Formula state
  const [newRecipe, setNewRecipe] = useState({
    name: 'EPS-15 Premium Block',
    description: 'A-Class bloklar uchun optimal formula',
    density: 15,
    steam_ratio: 1.2,
    cycle_time: 45,
  });

  // BOM constructor ratios (kg per 100kg batch)
  const [bom, setBom] = useState({
    eps_granules: 80,
    pentane: 4.5,
    recycled_eps: 15,
    anti_fire_agent: 0.5
  });


  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesRes, qcRes] = await Promise.all([
        api.get('recipes/').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/?status=READY').catch(() => ({ data: [] }))
      ]);
      setRecipes(recipesRes.data.results || recipesRes.data || []);
      setQCMetrics(qcRes.data || []);
    } catch (err) {
      console.error("Technologist Workspace fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Technologist Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[22px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FlaskConical className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1.5">{t('Texnolog Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Recepturalar, laboratoriya va jarayon nazorati')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {(['RECIPES', 'QC_ANALYTICS', 'PROCESS_CONTROL'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({
              RECIPES: 'Retsepturalar (Formulalar)',
              QC_ANALYTICS: 'Sifat va Laboratoriya',
              PROCESS_CONTROL: 'Jarayon Telemetriyasi'
            }[tabKey])}
          </button>
        ))}
      </div>

      {/* Contents */}
      <div className="min-h-[400px]">
        {/* Recipes Formula List */}
        {activeTab === 'RECIPES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side list */}
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="font-black text-slate-900 text-lg">{t('Faol Retsepturalar')}</h3>
                <span className="px-3.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-black">{recipes.length} {t('formula')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="p-6 bg-slate-50 border border-transparent rounded-[32px] shadow-sm hover:bg-white hover:border-indigo-100 transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-150 transition-all" />
                    <div>
                      <h4 className="font-black text-slate-950 text-lg leading-tight mb-2">{recipe.name}</h4>
                      <p className="text-xs text-slate-400 font-bold leading-normal truncate">{recipe.description}</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200/60 pt-4 mt-4">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('Nominal zichlik')}</span>
                        <span className="text-sm font-black text-slate-900 font-mono">{recipe.density || '15-20'} kg/m³</span>
                      </div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider">{t('Faol')}</span>
                    </div>
                  </div>
                ))}
                {recipes.length === 0 && (
                  <div className="col-span-2 py-20 text-center text-slate-300 italic flex flex-col items-center justify-center gap-3">
                    <Layers className="w-10 h-10 opacity-50" />
                    <span>{t('Retsepturalar mavjud emas')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right formula parameters form */}
            {/* Interactive BOM Recipe Builder & COGS Cost Estimator */}
            <div className="bg-slate-950 rounded-[40px] text-white p-8 border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
              {(() => {
                const EPS_PRICE = 22000;
                const PENTANE_PRICE = 28000;
                const RECYCLED_PRICE = 6000;
                const ANTI_FIRE_PRICE = 45000;

                const totalWeight = bom.eps_granules + bom.pentane + bom.recycled_eps + bom.anti_fire_agent;
                const rawMaterialCost = 
                  (bom.eps_granules * EPS_PRICE) + 
                  (bom.pentane * PENTANE_PRICE) + 
                  (bom.recycled_eps * RECYCLED_PRICE) + 
                  (bom.anti_fire_agent * ANTI_FIRE_PRICE);
                  
                const energyOverheadCost = (newRecipe.cycle_time * 1400) + (newRecipe.steam_ratio * 35000);
                const totalCOGS = rawMaterialCost + energyOverheadCost;
                const recommendedWholesalePrice = totalCOGS * 1.35;
                
                return (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t('BOM konstruktor')}</span>
                        <h3 className="text-xl font-black mt-1 tracking-tight">{t('Retsept Simulyatori')}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black">{totalWeight.toFixed(1)} kg</span>
                    </div>

                    <div className="space-y-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Retsept nomi')}</label>
                        <input 
                          type="text" 
                          value={newRecipe.name} 
                          onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs" 
                        />
                      </div>

                      {/* BOM Ratios Sliders */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('BOM Xom-ashyo Ratios (100kg batch)')}</span>
                        
                        {/* EPS Granules */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>EPS Granula</span>
                            <span className="text-white font-mono">{bom.eps_granules} kg</span>
                          </div>
                          <input 
                            type="range" min="50" max="95" step="1"
                            value={bom.eps_granules}
                            onChange={(e) => setBom({...bom, eps_granules: parseInt(e.target.value) || 0})}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                          />
                        </div>

                        {/* Recycled EPS */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>Qayta ishlangan EPS</span>
                            <span className="text-white font-mono">{bom.recycled_eps} kg</span>
                          </div>
                          <input 
                            type="range" min="0" max="40" step="1"
                            value={bom.recycled_eps}
                            onChange={(e) => setBom({...bom, recycled_eps: parseInt(e.target.value) || 0})}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                          />
                        </div>
                      </div>

                      {/* Target Parameters */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase">{t('Zichlik (kg/m³)')}</label>
                          <input 
                            type="number" 
                            value={newRecipe.density}
                            onChange={(e) => setNewRecipe({...newRecipe, density: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase">{t('Sikl (soniya)')}</label>
                          <input 
                            type="number" 
                            value={newRecipe.cycle_time}
                            onChange={(e) => setNewRecipe({...newRecipe, cycle_time: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold" 
                          />
                        </div>
                      </div>

                      {/* Margins breakdown metrics */}
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 pt-3 mt-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Hisoblangan Tannarx (COGS)')}</span>
                          <span className="font-mono font-black text-indigo-400">{totalCOGS.toLocaleString()} UZS</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Sotish narxi (35% target)')}</span>
                          <span className="font-mono font-black text-emerald-400">{Math.round(recommendedWholesalePrice).toLocaleString()} UZS</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500" style={{ width: '35%' }} />
                        </div>
                        <p className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-wider">{t('Tejamkorlik tavsiyasi faol')}</p>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={async () => {
                        try {
                          await api.post('recipes/', {
                            name: newRecipe.name,
                            density: newRecipe.density,
                            cycle_time: newRecipe.cycle_time,
                            steam_ratio: newRecipe.steam_ratio,
                            description: `BOM: EPS ${bom.eps_granules}%, Recycled ${bom.recycled_eps}%`
                          });
                          uiStore.showNotification(t("Yangi formula muvaffaqiyatli saqlandi"), "success");
                          fetchData();
                        } catch (err) {
                          uiStore.showNotification(t("Formulani saqlashda xatolik yuz berdi"), "error");
                        }
                      }}
                      className="w-full bg-indigo-600 text-white py-4.5 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-all active:scale-95 mt-4"
                    >
                      {t('Retseptni tasdiqlash')}
                    </button>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* Quality control analytics */}
        {activeTab === 'QC_ANALYTICS' && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{t('Sifat Ko\'rsatkichlari & Korrelyatsiya')}</h3>
                <p className="text-xs text-slate-400 font-medium">{t('Real vaqtdagi laboratoriya zichligi va bug\' bosimi tahlili')}</p>
              </div>
              <span className="px-3.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black">98.2% {t('sifatli')}</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column Stats */}
              <div className="lg:col-span-1 space-y-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('O\'rtacha brak darajasi')}</span>
                  <div className="text-3xl font-black text-rose-500">1.4%</div>
                  <p className="text-[10px] text-slate-400 font-bold">{t('ISO limitlaridan sezilarli past')}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('Zichlik barqarorligi')}</span>
                  <div className="text-3xl font-black text-emerald-600">98.5%</div>
                  <p className="text-[10px] text-slate-400 font-bold">{t('D15 zichlik xatoligi: ±0.2 kg/m³')}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('Laboratoriya tasniflari')}</span>
                  <div className="text-3xl font-black text-indigo-600">A-Class</div>
                  <p className="text-[10px] text-slate-400 font-bold">{t('Zavod mahsulotlarining 85% qismi')}</p>
                </div>
              </div>

              {/* Right Column: Steam vs Density SVG Correlation Chart */}
              <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 text-white rounded-[32px] shadow-lg flex flex-col justify-between relative overflow-hidden min-h-[360px]">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <h4 className="text-sm font-black tracking-tight">{t('Steam Bosimi va Zichlik Sweet-Spot Grafigi')}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Optimal termodinamik hududni aniqlash tizimi')}</p>
                </div>

                {/* SVG Graph Grid */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg width="100%" height="180" viewBox="0 0 320 180" className="overflow-visible">
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="140" x2="300" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    
                    {/* Axes */}
                    <line x1="40" y1="20" x2="40" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                    <line x1="40" y1="150" x2="300" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                    
                    {/* Sweet-Spot Optimal Region Shaded Area */}
                    <path 
                      d="M 120,70 Q 180,50 240,65 L 240,115 Q 180,95 120,120 Z" 
                      fill="rgba(16, 185, 129, 0.12)" 
                      stroke="rgba(16, 185, 129, 0.3)" 
                      strokeWidth="1.5" 
                      strokeDasharray="4,3" 
                    />
                    <text x="180" y="85" fill="rgba(16, 185, 129, 0.4)" fontSize="7" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest">Sweet Spot</text>

                    {/* Axis Labels */}
                    <text x="300" y="165" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">Bosim (bar)</text>
                    <text x="30" y="20" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end" transform="rotate(-90 30 20)">Zichlik (kg/m³)</text>

                    {/* Plotted Lot Nodes */}
                    {[
                      { lot: 'Lot #248', pressure: 1.20, density: 15.0, status: 'OPTIMAL', cx: 160, cy: 110, color: 'fill-emerald-400 stroke-emerald-500' },
                      { lot: 'Lot #249', pressure: 1.35, density: 14.2, status: 'OPTIMAL', cx: 215, cy: 120, color: 'fill-emerald-400 stroke-emerald-500' },
                      { lot: 'Lot #250', pressure: 0.95, density: 25.8, status: 'SUBOPTIMAL', cx: 80, cy: 50, color: 'fill-amber-400 stroke-amber-500' },
                      { lot: 'Lot #251', pressure: 1.55, density: 10.5, status: 'CRITICAL', cx: 275, cy: 150, color: 'fill-rose-400 stroke-rose-500 animate-pulse' },
                      { lot: 'Lot #252', pressure: 1.25, density: 16.2, status: 'OPTIMAL', cx: 180, cy: 95, color: 'fill-emerald-400 stroke-emerald-500' },
                    ].map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.cx}
                        cy={pt.cy}
                        r="6"
                        className={`${pt.color} cursor-pointer transition-all duration-300 hover:r-9 stroke-2 hover:stroke-white`}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>
                </div>

                {/* Hover stats interactive display */}
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-[10px] text-slate-400 font-bold flex justify-between items-center">
                  {hoveredPoint ? (
                    <>
                      <span>{hoveredPoint.lot} ({hoveredPoint.status})</span>
                      <span className="text-white">Bosim: {hoveredPoint.pressure} bar &bull; Zichlik: {hoveredPoint.density} kg/m³</span>
                    </>
                  ) : (
                    <span className="italic uppercase tracking-widest text-slate-500 animate-pulse text-[8px] mx-auto">{t('Statistika nuqtasi ustiga sichqonchani olib boring')}</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Process telemetries */}
        {activeTab === 'PROCESS_CONTROL' && (
          <div className="bg-slate-950 text-white rounded-[40px] border border-slate-800 shadow-2xl p-8 space-y-6">
            <h3 className="font-black text-slate-100 text-lg border-b border-slate-800 pb-4">{t('Real vaqtdagi Termodinamik Parametrlar')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <Thermometer className="w-8 h-8 text-indigo-400 mx-auto mb-4 animate-pulse" />
                <span className="text-2xl font-black text-slate-100">118.5 <span className="text-xs text-slate-400">°C</span></span>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('Kamera harorati')}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <Cpu className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <span className="text-2xl font-black text-slate-100">1.22 <span className="text-xs text-slate-400">bar</span></span>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('Steam bosimi')}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <Zap className="w-8 h-8 text-amber-500 mx-auto mb-4 animate-pulse" />
                <span className="text-2xl font-black text-slate-100">96.8%</span>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('PLC Uskuna OEE')}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <Clock className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
                <span className="text-2xl font-black text-slate-100">42.5 <span className="text-xs text-slate-400">s</span></span>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('Sikl davomiyligi')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
