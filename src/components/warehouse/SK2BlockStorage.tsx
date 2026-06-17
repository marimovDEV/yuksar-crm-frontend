import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { Search, Box, ShieldCheck, ShoppingBag, MapPin, Package, Layers } from 'lucide-react';
import api from '../../lib/api';

export default function SK2BlockStorage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('ALL');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('production/finished-blocks/', {
          params: { status: 'READY', page_size: 50 }
        });
        setBlocks(res.data?.results ?? res.data ?? []);
      } catch {
        setBlocks([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = blocks.filter(item => {
    const name = item.block_id || item.id || '';
    const lot = item.lot?.form_number || '';
    const matchesSearch = !searchTerm ||
      String(name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'ALL' ||
      (activeType === 'A_CLASS' && item.classification === 'A_CLASS') ||
      (activeType === 'B_CLASS' && item.classification === 'B_CLASS');
    return matchesSearch && matchesType;
  });

  const totalVolume = blocks.reduce((s: number, b: any) => s + (parseFloat(b.volume) || 0), 0);
  const aClass = blocks.filter(b => b.classification === 'A_CLASS').length;
  const aClassPct = blocks.length > 0 ? Math.round(aClass / blocks.length * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Jami Tayyor Bloklar')}</p>
            <h3 className="text-2xl font-black text-slate-900">{totalVolume.toFixed(1)} <span className="text-xs font-bold text-slate-400">m³</span></h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{blocks.length} {t('ta blok')}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Sifat Darajasi')}</p>
            <h3 className="text-2xl font-black text-emerald-600">{aClassPct}% A-Class</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{blocks.length - aClass} {t('ta B-class')}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('CNC uchun tayyor')}</p>
            <h3 className="text-2xl font-black text-blue-600">{aClass} {t('ta blok')}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{t('A-class bloklar')}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
          <div className="relative flex-grow max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("Blok ID yoki Forma raqami...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['ALL', 'A_CLASS', 'B_CLASS'].map(t2 => (
              <button key={t2} onClick={() => setActiveType(t2)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeType === t2 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t2 === 'ALL' ? t('Barchasi') : t2}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blocks list */}
      {loading ? (
        <div className="text-center py-10 text-slate-400 font-bold">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-sm">Tayyor bloklar topilmadi</p>
          <p className="text-xs mt-1">QC dan o'tgan bloklar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">{item.block_id || `BLK-${item.id}`}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        {item.lot?.form_number || '—'}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    item.classification === 'A_CLASS' ? 'bg-emerald-50 text-emerald-600' :
                    item.classification === 'B_CLASS' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {item.classification || '—'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('O\'lcham')}</p>
                    <p className="text-xs font-black text-slate-900">
                      {item.length && item.width && item.height
                        ? `${item.length}×${item.width}×${item.height}`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Zichlik')}</p>
                    <p className="text-xs font-black text-slate-900">
                      {item.actual_density ? `${item.actual_density} kg/m³` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {item.zone || item.warehouse?.name || 'SK-2'}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
                  <Layers className="w-3 h-3" />
                  {item.rack || item.lot?.form_number || '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
