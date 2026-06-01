import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, Filter, Box, ShieldCheck, UserCircle, Cpu, Layers, Package, ShoppingBag, MapPin } from 'lucide-react';

const DEMO_FINISHED_GOODS = [
  { id: 'FG-2026-00010', name: 'Penoplast Panel M20 (20mm)', sku: 'PP-M20-20', type: 'Sheets', qty_packs: 50, qty_sheets: 1000, volume: '20.0 m³', quality: 'A_CLASS', location: 'Zone B-04', batch_ref: 'BLK-2026-000154', produced_at: '2025-06-15' },
  { id: 'FG-2026-00011', name: 'Penoplast Panel M25 (50mm)', sku: 'PP-M25-50', type: 'Sheets', qty_packs: 35, qty_sheets: 350, volume: '17.5 m³', quality: 'A_CLASS', location: 'Zone B-05', batch_ref: 'BLK-2026-000155', produced_at: '2025-06-15' },
  { id: 'FG-2026-00012', name: 'Decorative Molding D-101', sku: 'DM-101', type: 'Decor', qty_packs: 12, qty_sheets: 240, volume: '4.8 m³', quality: 'PREMIUM', location: 'Zone C-01', batch_ref: 'BLK-2026-000140', produced_at: '2025-06-14' },
  { id: 'FG-2026-00013', name: 'EPS Foam Sheet M15 (100mm)', sku: 'PP-M15-100', type: 'Sheets', qty_packs: 20, qty_sheets: 100, volume: '10.0 m³', quality: 'B_CLASS', location: 'Zone B-02', batch_ref: 'BLK-2026-000156', produced_at: '2025-06-15' },
];

export default function SK2BlockStorage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('ALL');

  const filtered = DEMO_FINISHED_GOODS.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_ref.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeType === 'ALL' || item.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Visual Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Jami Tayyor Mahsulot')}</p>
            <h3 className="text-2xl font-black text-slate-900">52.3 <span className="text-xs font-bold text-slate-400">m³</span></h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">1,690 {t('Plita/Dona')}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Sifat Darajasi')}</p>
            <h3 className="text-2xl font-black text-emerald-600">92% A-Class</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">8% B-Class {t('va dekor elementlar')}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Yuklashga Tayyor')}</p>
            <h3 className="text-2xl font-black text-blue-600">117 {t('Pachka')}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{t('Logistika buyurtmalariga bog\'langan')}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
          <div className="relative flex-grow max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("Mahsulot nomi, SKU yoki Blok ID qidirish...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveType('ALL')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('Barchasi')}
            </button>
            <button 
              onClick={() => setActiveType('Sheets')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'Sheets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('Plitalar')}
            </button>
            <button 
              onClick={() => setActiveType('Decor')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'Decor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('Dekor')}
            </button>
          </div>
        </div>
      </div>

      {/* Finished Goods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug">{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.sku}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  item.quality === 'A_CLASS' || item.quality === 'PREMIUM' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {t(item.quality)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Qadoqlar soni')}</p>
                  <p className="text-sm font-black text-slate-900">{item.qty_packs} {t('Pachka')}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.qty_sheets} {t('Dona')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Hajmi')}</p>
                  <p className="text-sm font-black text-slate-900">{item.volume}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <MapPin className="w-4 h-4 text-slate-400" />
                {item.location}
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
                <Layers className="w-3 h-3" />
                {item.batch_ref}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
