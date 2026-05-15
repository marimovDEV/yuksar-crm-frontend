import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, Filter, ClipboardList, ScanLine, AlertTriangle, CheckCircle2, FileText, Camera } from 'lucide-react';

const DEMO_AUDITS = [
  { id: 'AUD-2026-101', date: '2025-06-15', zone: 'A-01', material: 'EPS Granula', expected: '380 kg', counted: '380 kg', diff: '0', status: 'MATCHED', auditor: 'Admin' },
  { id: 'AUD-2026-102', date: '2025-06-15', zone: 'D-01', material: 'Penoplast 20', expected: '42 m³', counted: '40 m³', diff: '-2 m³', status: 'MISMATCH', auditor: 'Sardor B.' },
  { id: 'AUD-2026-103', date: '2025-06-15', zone: 'B-01', material: 'Chiqindi Polimer', expected: '150 kg', counted: null, diff: null, status: 'PENDING', auditor: 'Pending' },
];

export default function CycleCounting() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <ClipboardList className="w-8 h-8 mb-4 text-blue-400" />
            <h3 className="text-2xl font-black mb-1">Cycle Counting</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Professional Inventarizatsiya')}</p>
          </div>
        </div>

        <button className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center text-emerald-600 gap-3 group">
          <ScanLine className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm uppercase tracking-widest">{t('Scan Orqali Sanash')}</span>
        </button>

        <button className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center text-slate-600 gap-3 group">
          <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm uppercase tracking-widest">{t('Yangi Audit Yaratish')}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{t('Joriy Auditlar (Diff Analysis)')}</h4>
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("Zona yoki material qidirish...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-all font-bold text-xs"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Audit ID / Sana')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Obyekt (Zona / Material)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kutilmoqda (System)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Haqiqiy (Counted)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Farq (Diff)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Status / Auditor')}</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_AUDITS.filter(a => a.zone.includes(searchTerm) || a.material.toLowerCase().includes(searchTerm.toLowerCase())).map(audit => (
                <tr key={audit.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-sm">{audit.id}</div>
                    <div className="text-[10px] font-bold text-slate-500">{audit.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{audit.material}</div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Zona: {audit.zone}</div>
                  </td>
                  <td className="p-4 font-black text-slate-400">{audit.expected}</td>
                  <td className="p-4">
                    {audit.counted ? (
                      <span className="font-black text-slate-900">{audit.counted}</span>
                    ) : (
                      <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100">
                        {t('Kiritish')}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    {audit.diff && (
                      <div className={`font-black ${audit.diff === '0' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {audit.diff}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 w-fit ${
                          audit.status === 'MATCHED' ? 'bg-emerald-50 text-emerald-600' :
                          audit.status === 'MISMATCH' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {audit.status === 'MATCHED' && <CheckCircle2 className="w-3 h-3" />}
                          {audit.status === 'MISMATCH' && <AlertTriangle className="w-3 h-3" />}
                          {t(audit.status)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{audit.auditor}</span>
                      </div>
                      {audit.status === 'MISMATCH' && (
                        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200" title={t('Foto Isbot Yuklash')}>
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
