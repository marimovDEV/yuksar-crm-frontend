import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, Filter, Layers, Clock, ShieldCheck, UserCircle, Cpu, Thermometer } from 'lucide-react';

const DEMO_BLOCKS = [
  { id: 'BLK-2026-000154', type: 'Penoplast 20', size: '2000x1000x1000', density: '20 kg/m³', weight: '40 kg', created: '2025-06-15 08:30', cooling_left: '00:00:00', operator: 'Jasur U.', machine: 'Stanok-1', bunker: 'Bunker-A', qc: 'PASSED' },
  { id: 'BLK-2026-000155', type: 'Penoplast 20', size: '2000x1000x1000', density: '20.2 kg/m³', weight: '40.4 kg', created: '2025-06-15 10:15', cooling_left: '01:45:00', operator: 'Jasur U.', machine: 'Stanok-1', bunker: 'Bunker-A', qc: 'PENDING' },
  { id: 'BLK-2026-000156', type: 'Penoplast 25', size: '2000x1000x1000', density: '25.1 kg/m³', weight: '50.2 kg', created: '2025-06-15 11:00', cooling_left: '02:30:00', operator: 'Alisher B.', machine: 'Stanok-2', bunker: 'Bunker-B', qc: 'PENDING' },
];

export default function SK2BlockStorage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("Blok ID, operator yoki stanok qidirish...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
            />
          </div>
          <button className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Block Tracking Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_BLOCKS.filter(b => b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.operator.toLowerCase().includes(searchTerm.toLowerCase())).map(block => {
          const isCooling = block.cooling_left !== '00:00:00';
          return (
            <div key={block.id} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">{block.id}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{block.type} • {block.size}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${block.qc === 'PASSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {t(block.qc)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Zichlik')}</p>
                  <p className="text-sm font-black text-slate-900">{block.density}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Haqiqiy Vazn')}</p>
                  <p className="text-sm font-black text-slate-900">{block.weight}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                <div className="flex items-center gap-1.5"><UserCircle className="w-4 h-4" /> {block.operator}</div>
                <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> {block.machine}</div>
              </div>

              <div className={`p-4 rounded-2xl flex items-center justify-between ${isCooling ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-widest">{isCooling ? t('Quritilmoqda') : t('CNC uchun Tayyor')}</span>
                </div>
                {isCooling && <span className="font-black text-sm">{block.cooling_left}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
