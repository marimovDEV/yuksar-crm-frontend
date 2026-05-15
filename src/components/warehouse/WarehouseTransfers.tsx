import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, Filter, ArrowRightLeft, User, Factory, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

const DEMO_TRANSFERS = [
  { id: 'TR-0012', date: '2025-06-15 10:30', batch: 'BAT-2026-00001', qty: '250 kg', from: 'SK-1 (Xom Ashyo)', to: 'Ishlab Chiqarish', operator: 'Sardor B.', reason: 'Stanok #2 uchun rezerv', status: 'COMPLETED' },
  { id: 'TR-0013', date: '2025-06-15 11:45', batch: 'BLK-2026-000154', qty: '1 dona', from: 'Ishlab Chiqarish', to: 'SK-2 (Bloklar)', operator: 'Jasur U.', reason: 'Quritishga qo\'yish', status: 'COMPLETED' },
  { id: 'TR-0014', date: '2025-06-15 12:00', batch: 'BLK-2026-000130', qty: '1 dona', from: 'SK-2 (Bloklar)', to: 'CNC Kesish', operator: 'Alisher B.', reason: 'Kesishga o\'tkazildi', status: 'IN_TRANSIT' },
];

export default function WarehouseTransfers() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("ID, Partiya yoki Blok qidirish...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
            />
          </div>
          <button className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <button className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <ArrowRightLeft className="w-4 h-4" /> {t('Yangi O\'tkazma')}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Transfer ID & Sana')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Obyekt (Batch / Block)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Yo\'nalish (From → To)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mas\'ul / Operator')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TRANSFERS.filter(t => t.id.includes(searchTerm) || t.batch.includes(searchTerm)).map(tr => (
                <tr key={tr.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-sm">{tr.id}</div>
                    <div className="text-[10px] font-bold text-slate-500">{tr.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{tr.batch}</div>
                        <div className="text-[10px] font-black text-blue-500 uppercase">{tr.qty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 text-center">{tr.from}</div>
                      <ArrowRightLeft className="w-4 h-4 text-slate-300" />
                      <div className="flex-1 p-2 bg-blue-50 rounded-xl text-[10px] font-bold text-blue-600 text-center">{tr.to}</div>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">{tr.reason}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      {tr.operator}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tr.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {t(tr.status)}
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
