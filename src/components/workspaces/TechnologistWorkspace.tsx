import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical, Layers, Thermometer, Cpu, Zap, Clock,
  RefreshCw, AlertTriangle, CheckCircle2, Activity,
  BarChart3, Calculator, Package, TrendingDown
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface TechnologistWorkspaceProps {
  user: any;
}

type TTab = 'RECIPES' | 'DENSITY_CALC' | 'BUNKERS' | 'PROCESS_CONTROL' | 'QC_STATS';

export default function TechnologistWorkspace({ user }: TechnologistWorkspaceProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TTab>('PROCESS_CONTROL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [recipes, setRecipes] = useState<any[]>([]);
  const [bunkers, setBunkers] = useState<any[]>([]);
  const [finishedBlocks, setFinishedBlocks] = useState<any[]>([]);
  const [zames, setZames] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, any>>({});

  // Recipe form
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    density: 15,
    steam_ratio: 1.2,
    cycle_time: 45,
  });
  const [bom, setBom] = useState({ eps_granules: 80, recycled_eps: 15 });
  const [savingRecipe, setSavingRecipe] = useState(false);

  // Density calculator
  const [densityInput, setDensityInput] = useState({ weight: '', volume_l: '', volume_w: '', volume_h: '' });

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [recipesRes, bunkersRes, blocksRes, zamesRes, telRes] = await Promise.all([
        api.get('production/recipes/').catch(() => ({ data: [] })),
        api.get('production/bunkers/').catch(() => ({ data: [] })),
        api.get('production/finished-blocks/').catch(() => ({ data: [] })),
        api.get('production/zames/').catch(() => ({ data: [] })),
        api.get('telemetry/tags/live/').catch(() => ({ data: [] })),
      ]);
      setRecipes(Array.isArray(recipesRes.data?.results || recipesRes.data) ? recipesRes.data?.results || recipesRes.data : []);
      setBunkers(Array.isArray(bunkersRes.data?.results || bunkersRes.data) ? bunkersRes.data?.results || bunkersRes.data : []);
      setFinishedBlocks(Array.isArray(blocksRes.data?.results || blocksRes.data) ? blocksRes.data?.results || blocksRes.data : []);
      setZames(Array.isArray(zamesRes.data?.results || zamesRes.data) ? zamesRes.data?.results || zamesRes.data : []);

      // Map telemetry tags by tag_name
      const telData = telRes.data?.results || telRes.data || [];
      const telMap: Record<string, any> = {};
      if (Array.isArray(telData)) {
        telData.forEach((tag: any) => { telMap[tag.tag_name || tag.name] = tag; });
      }
      setTelemetry(telMap);
    } catch (err) {
      console.error('TechnologistWorkspace fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh telemetry every 30s when on PROCESS_CONTROL tab
  useEffect(() => {
    if (activeTab !== 'PROCESS_CONTROL') return;
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchAll]);

  // Derived QC stats
  const totalBlocks = finishedBlocks.length;
  const passedBlocks = finishedBlocks.filter((b: any) => b.status === 'READY' || b.status === 'APPROVED').length;
  const failedBlocks = finishedBlocks.filter((b: any) => b.status === 'RECYCLE' || b.status === 'REJECTED').length;
  const brakPercent = totalBlocks > 0 ? ((failedBlocks / totalBlocks) * 100).toFixed(1) : '0.0';

  // Density calculator result
  const calcDensity = () => {
    const w = parseFloat(densityInput.weight);
    const l = parseFloat(densityInput.volume_l) / 100;
    const wid = parseFloat(densityInput.volume_w) / 100;
    const h = parseFloat(densityInput.volume_h) / 100;
    if (!w || !l || !wid || !h) return null;
    const vol = l * wid * h;
    return vol > 0 ? (w / vol).toFixed(2) : null;
  };
  const densityResult = calcDensity();

  // Telemetry helpers
  const getTelVal = (name: string, fallback = '—') => {
    const tag = telemetry[name];
    if (!tag) return fallback;
    const val = tag.value ?? tag.current_value ?? tag.last_value;
    return val !== undefined && val !== null ? String(val) : fallback;
  };
  const hasTelData = Object.keys(telemetry).length > 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[22px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FlaskConical className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1.5">{t('Texnolog Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Retseptlar · Bunkerlar · Jarayon · QC Statistikasi')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Umumiy bloklar</p>
            <p className="text-2xl font-black">{totalBlocks}</p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brak %</p>
            <p className={`text-2xl font-black ${parseFloat(brakPercent) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>{brakPercent}%</p>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="ml-2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto gap-1">
        {([
          ['PROCESS_CONTROL', 'Jarayon Nazorati'],
          ['BUNKERS', 'Bunkerlar'],
          ['QC_STATS', 'QC Statistikasi'],
          ['DENSITY_CALC', 'Zichlik Kalkulyatori'],
          ['RECIPES', 'Retsepturalar'],
        ] as [TTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {/* ── PROCESS_CONTROL ── */}
      {activeTab === 'PROCESS_CONTROL' && (
        <div className="space-y-6">
          {!hasTelData && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-amber-700">
                Telemetriya tizimi bilan aloqa yo'q yoki PLC ma'lumot uzatmayapti.
                <span className="font-normal ml-1">Quyidagi qiymatlar bo'sh ko'rsatilishi mumkin.</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Thermometer, color: 'text-rose-400', label: 'Kamera harorati', tagNames: ['chamber_temp', 'temperature', 'steam_temp'], unit: '°C' },
              { icon: Activity, color: 'text-blue-400', label: 'Steam bosimi', tagNames: ['steam_pressure', 'pressure', 'boiler_pressure'], unit: 'bar' },
              { icon: Zap, color: 'text-amber-400', label: 'Energiya iste\'mol', tagNames: ['energy_kwh', 'power_kw', 'electricity'], unit: 'kWh' },
              { icon: Clock, color: 'text-indigo-400', label: 'Sikl davomiyligi', tagNames: ['cycle_time', 'mold_cycle', 'press_cycle'], unit: 's' },
            ].map(({ icon: Icon, color, label, tagNames, unit }) => {
              const val = tagNames.map(n => getTelVal(n)).find(v => v !== '—') || '—';
              return (
                <div key={label} className="bg-slate-900 text-white rounded-[28px] border border-slate-800 p-6 flex flex-col items-center gap-3">
                  <Icon className={`w-8 h-8 ${color} ${val !== '—' ? 'animate-pulse' : 'opacity-40'}`} />
                  <div className="text-2xl font-black">
                    {val !== '—' ? (
                      <>{val} <span className="text-xs text-slate-400">{unit}</span></>
                    ) : (
                      <span className="text-slate-600 text-base">Ma'lumot yo'q</span>
                    )}
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{t(label)}</p>
                </div>
              );
            })}
          </div>

          {/* All available tags */}
          {hasTelData && (
            <div className="bg-white rounded-[32px] border border-slate-100 p-6">
              <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">Barcha telemetriya signallari</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(telemetry).map(([name, tag]: [string, any]) => {
                  const val = tag.value ?? tag.current_value ?? tag.last_value;
                  const unit = tag.unit || tag.engineering_unit || '';
                  return (
                    <div key={name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{name}</p>
                      <p className="text-lg font-black text-slate-900 mt-1">
                        {val !== undefined && val !== null ? `${val}` : '—'}
                        {unit && <span className="text-xs text-slate-400 ml-1">{unit}</span>}
                      </p>
                      {tag.description && <p className="text-[8px] text-slate-400 mt-0.5 truncate">{tag.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zames summary for process context */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-6">
            <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">Bugungi Zamaslar (predvspenivatel)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {zames.slice(0, 8).map((z: any) => (
                <div key={z.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-black text-slate-900 text-sm">Zamas #{z.id}</p>
                    <p className="text-xs text-slate-400">{z.recipe_name || z.recipe || 'Retsept ko\'rsatilmagan'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                      z.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      z.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{z.status}</span>
                    <p className="text-xs font-bold text-slate-500 mt-1">{z.output_weight ? `${z.output_weight} kg` : `${z.input_weight || '—'} kg`}</p>
                  </div>
                </div>
              ))}
              {zames.length === 0 && (
                <div className="col-span-2 py-10 text-center text-slate-300 text-sm">Zamaslar topilmadi</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BUNKERS ── */}
      {activeTab === 'BUNKERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900">Bunker Nazorati</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-600">{bunkers.length} bunker</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bunkers.map((bunker: any) => {
              const fillPct = bunker.current_volume && bunker.capacity
                ? Math.min(100, Math.round((bunker.current_volume / bunker.capacity) * 100))
                : (bunker.fill_percent ?? 0);
              const status = bunker.status || (fillPct > 80 ? 'FULL' : fillPct > 20 ? 'FILLING' : 'EMPTY');
              return (
                <div key={bunker.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900">{bunker.name || `Bunker #${bunker.id}`}</h4>
                      <p className="text-xs text-slate-400">{bunker.description || bunker.location || ''}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                      status === 'FULL' ? 'bg-emerald-100 text-emerald-700' :
                      status === 'FILLING' ? 'bg-blue-100 text-blue-700' :
                      status === 'READY' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{status}</span>
                  </div>

                  {/* Fill bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                      <span>To'lish darajasi</span>
                      <span className="text-slate-700">{fillPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${fillPct > 80 ? 'bg-emerald-500' : fillPct > 30 ? 'bg-blue-500' : 'bg-amber-400'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hajm</p>
                      <p className="font-black text-slate-900">{bunker.current_volume ?? '—'} / {bunker.capacity ?? '—'} m³</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retsept</p>
                      <p className="font-black text-slate-900 truncate">{bunker.recipe_name || bunker.recipe || '—'}</p>
                    </div>
                    {bunker.temperature !== undefined && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Harorat</p>
                        <p className="font-black text-slate-900">{bunker.temperature} °C</p>
                      </div>
                    )}
                    {bunker.aging_time !== undefined && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pishish vaqti</p>
                        <p className="font-black text-slate-900">{bunker.aging_time} soat</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {bunkers.length === 0 && (
              <div className="col-span-3 py-20 text-center text-slate-300">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Bunkerlar topilmadi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QC_STATS ── */}
      {activeTab === 'QC_STATS' && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Jami bloklar', value: totalBlocks, color: 'text-slate-900', bg: 'bg-slate-50' },
              { label: 'O\'tgan (READY)', value: passedBlocks, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Rad etilgan', value: failedBlocks, color: 'text-rose-700', bg: 'bg-rose-50' },
              { label: 'Brak %', value: `${brakPercent}%`, color: parseFloat(brakPercent) > 5 ? 'text-rose-700' : 'text-emerald-700', bg: parseFloat(brakPercent) > 5 ? 'bg-rose-50' : 'bg-emerald-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-[28px] border border-slate-100 p-6 text-center`}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t(label)}</p>
                <p className={`text-3xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Blocks by status breakdown */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-6">
            <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">Tayyor bloklar — holat bo'yicha</h3>
            <div className="space-y-2">
              {(['READY', 'RECYCLE', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'DRYING', 'PENDING'] as string[]).map(status => {
                const count = finishedBlocks.filter((b: any) => b.status === status).length;
                if (count === 0) return null;
                const pct = totalBlocks > 0 ? Math.round((count / totalBlocks) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-28 text-[10px] font-black text-slate-500 uppercase tracking-widest">{status}</span>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'READY' || status === 'APPROVED' ? 'bg-emerald-500' :
                          status === 'RECYCLE' || status === 'REJECTED' ? 'bg-rose-500' :
                          'bg-blue-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-black text-slate-700">{count}</span>
                    <span className="w-10 text-right text-[10px] font-bold text-slate-400">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Failed blocks detail */}
          {failedBlocks > 0 && (
            <div className="bg-white rounded-[32px] border border-rose-100 p-6">
              <h3 className="font-black text-rose-700 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Rad etilgan bloklar
              </h3>
              <div className="space-y-2">
                {finishedBlocks.filter((b: any) => b.status === 'RECYCLE' || b.status === 'REJECTED').slice(0, 10).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div>
                      <p className="font-black text-slate-900 text-sm">Blok #{b.id} {b.lot_number ? `· ${b.lot_number}` : ''}</p>
                      <p className="text-xs text-slate-400">{b.rejection_reason || b.qc_notes || 'Sabab ko\'rsatilmagan'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-600">{b.status}</p>
                      <p className="text-[10px] text-slate-400">{b.density ? `${b.density} kg/m³` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DENSITY_CALC ── */}
      {activeTab === 'DENSITY_CALC' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div>
              <h3 className="font-black text-slate-900 text-lg">Zichlik Kalkulyatori</h3>
              <p className="text-xs text-slate-400 mt-1">Blok og'irligi va hajmidan zichlikni hisoblash</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Og'irlik (kg)</label>
                <input
                  type="number"
                  placeholder="masalan: 18.5"
                  value={densityInput.weight}
                  onChange={e => setDensityInput({ ...densityInput, weight: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['volume_l', 'volume_w', 'volume_h'] as const).map((field, i) => (
                  <div key={field}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{['Uzunlik (cm)', 'Kenglik (cm)', 'Balandlik (cm)'][i]}</label>
                    <input
                      type="number"
                      placeholder={['200', '100', '60'][i]}
                      value={densityInput[field]}
                      onChange={e => setDensityInput({ ...densityInput, [field]: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className={`p-6 rounded-[24px] border text-center transition-all ${densityResult ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
              {densityResult ? (
                <>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Hisoblangan Zichlik</p>
                  <p className="text-5xl font-black text-indigo-700">{densityResult}</p>
                  <p className="text-sm font-bold text-indigo-400 mt-1">kg/m³</p>
                  <div className="mt-4 pt-4 border-t border-indigo-100">
                    <p className="text-[10px] font-bold text-slate-500">
                      {parseFloat(densityResult) < 10 ? '⚠️ Juda yengil — sifat muammosi bo\'lishi mumkin' :
                       parseFloat(densityResult) < 15 ? '✅ EPS-10 toifasi' :
                       parseFloat(densityResult) < 20 ? '✅ EPS-15 toifasi (standart)' :
                       parseFloat(densityResult) < 25 ? '✅ EPS-20 toifasi' :
                       parseFloat(densityResult) < 35 ? '✅ EPS-25/30 toifasi (og\'ir)' :
                       '⚠️ Juda og\'ir — retseptni tekshiring'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-slate-300 font-bold">Barcha maydonlarni to'ldiring</p>
              )}
            </div>
          </div>

          {/* EPS density class reference */}
          <div className="bg-slate-900 text-white rounded-[32px] border border-slate-800 p-8 space-y-4">
            <h3 className="font-black text-lg">EPS Zichlik Standarti (GOST 15588)</h3>
            <p className="text-xs text-slate-400">O'zbekiston va Rossiya standartlari bo'yicha</p>
            <div className="space-y-3 mt-4">
              {[
                { grade: 'EPS-10', range: '8–12 kg/m³', use: 'Yopiq joy izolyatsiyasi', color: 'bg-slate-700' },
                { grade: 'EPS-15', range: '13–17 kg/m³', use: 'Umumiy qurilish izolyatsiyasi', color: 'bg-blue-800' },
                { grade: 'EPS-20', range: '18–22 kg/m³', use: 'Pol va devor izolyatsiyasi', color: 'bg-indigo-800' },
                { grade: 'EPS-25', range: '23–27 kg/m³', use: 'Asosiy devor izolyatsiyasi', color: 'bg-violet-800' },
                { grade: 'EPS-30', range: '28–34 kg/m³', use: 'Sanoat bino izolyatsiyasi', color: 'bg-purple-800' },
                { grade: 'EPS-35+', range: '35+ kg/m³', use: 'Maxsus og\'ir yuk izolyatsiyasi', color: 'bg-pink-900' },
              ].map(({ grade, range, use, color }) => (
                <div key={grade} className={`${color} rounded-2xl p-4 flex items-center justify-between`}>
                  <div>
                    <p className="font-black text-white">{grade}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{use}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-200">{range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RECIPES ── */}
      {activeTab === 'RECIPES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe list */}
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="font-black text-slate-900 text-lg">Faol Retsepturalar</h3>
              <span className="px-3.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-black">{recipes.length} formula</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map((recipe: any) => (
                <div key={recipe.id} className="p-6 bg-slate-50 border border-transparent rounded-[28px] hover:bg-white hover:border-indigo-100 transition-all space-y-4">
                  <div>
                    <h4 className="font-black text-slate-950 text-lg leading-tight">{recipe.name}</h4>
                    <p className="text-xs text-slate-400 font-bold mt-1">{recipe.description || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Zichlik</p>
                      <p className="font-black text-slate-900">{recipe.density || '—'} kg/m³</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Sikl</p>
                      <p className="font-black text-slate-900">{recipe.cycle_time || '—'} s</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Steam ratio</p>
                      <p className="font-black text-slate-900">{recipe.steam_ratio || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Holat</p>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black">Faol</span>
                    </div>
                  </div>
                </div>
              ))}
              {recipes.length === 0 && (
                <div className="col-span-2 py-20 text-center text-slate-300 flex flex-col items-center gap-3">
                  <Layers className="w-10 h-10 opacity-40" />
                  <p>Retsepturalar topilmadi</p>
                </div>
              )}
            </div>
          </div>

          {/* New recipe form */}
          <div className="bg-slate-950 rounded-[40px] text-white p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">BOM Konstruktor</span>
              <h3 className="text-xl font-black mt-1">Yangi Retsept</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Retsept nomi</label>
                <input
                  type="text"
                  value={newRecipe.name}
                  placeholder="EPS-15 Premium..."
                  onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tavsif</label>
                <input
                  type="text"
                  value={newRecipe.description}
                  placeholder="Izoh..."
                  onChange={e => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                />
              </div>

              {/* BOM sliders */}
              <div className="space-y-3 pt-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">BOM (100 kg batch)</span>
                {[
                  { key: 'eps_granules', label: 'EPS Granula', min: 50, max: 95 },
                  { key: 'recycled_eps', label: 'Qayta ishlangan EPS', min: 0, max: 40 },
                ] .map(({ key, label, min, max }) => (
                  <div key={key}>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                      <span>{label}</span>
                      <span className="text-white font-mono">{bom[key as keyof typeof bom]} kg</span>
                    </div>
                    <input
                      type="range" min={min} max={max}
                      value={bom[key as keyof typeof bom]}
                      onChange={e => setBom({ ...bom, [key]: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
                {[
                  { label: 'Zichlik', field: 'density', unit: 'kg/m³' },
                  { label: 'Sikl', field: 'cycle_time', unit: 's' },
                  { label: 'Steam', field: 'steam_ratio', unit: 'ratio' },
                ].map(({ label, field, unit }) => (
                  <div key={field}>
                    <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">{label}</label>
                    <input
                      type="number"
                      value={(newRecipe as any)[field]}
                      onChange={e => setNewRecipe({ ...newRecipe, [field]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                    />
                    <p className="text-[8px] text-slate-600 mt-0.5">{unit}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={savingRecipe || !newRecipe.name}
              onClick={async () => {
                setSavingRecipe(true);
                try {
                  await api.post('production/recipes/', {
                    name: newRecipe.name,
                    description: `${newRecipe.description} | BOM: EPS ${bom.eps_granules}%, Recycled ${bom.recycled_eps}%`,
                    density: newRecipe.density,
                    cycle_time: newRecipe.cycle_time,
                    steam_ratio: newRecipe.steam_ratio,
                  });
                  uiStore.showNotification('Retsept muvaffaqiyatli saqlandi', 'success');
                  setNewRecipe({ name: '', description: '', density: 15, steam_ratio: 1.2, cycle_time: 45 });
                  fetchAll(true);
                } catch {
                  uiStore.showNotification('Retseptni saqlashda xatolik', 'error');
                } finally {
                  setSavingRecipe(false);
                }
              }}
              className="w-full bg-indigo-600 disabled:opacity-50 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
            >
              {savingRecipe ? 'Saqlanmoqda...' : 'Retseptni Saqlash'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
