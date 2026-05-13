import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Search, Calendar, Download, 
  ArrowUpRight, ArrowDownRight, Clock, User, 
  FileText, ExternalLink
} from 'lucide-react';
import api from '../../lib/api';

interface LedgerEntry {
  date: string;
  entry_number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  source_type: string;
  created_by: string | null;
}

interface LedgerData {
  account_code: string;
  account_name: string;
  start_date: string;
  end_date: string;
  opening_balance: number;
  entries: LedgerEntry[];
  closing_balance: number;
}

interface Props {
  accountCode: string;
  accountName: string;
  onBack: () => void;
}

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

export default function AccountLedger({ accountCode, accountName, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LedgerData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchLedger();
  }, [accountCode, startDate, endDate]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await api.get(`accounting/accounts/ledger_by_code/`, {
        params: { code: accountCode, start_date: startDate, end_date: endDate }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch ledger", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch fetchLedger after checking views.py
  // ...
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    <span className="text-blue-600 font-mono mr-3">{accountCode}</span>
                    {accountName}
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Batafsil Ledger (Operatsiyalar tarixi)</p>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
             <Calendar className="w-4 h-4 text-slate-400" />
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold" />
             <span className="text-slate-400 text-sm">—</span>
             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold" />
             <div className="flex-1" />
             <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                <Download className="w-4 h-4" /> Excel
             </button>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
             </div>
        ) : (
            <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kirish Qoldig'i</p>
                        <p className="text-2xl font-black text-slate-900">{fmt(data?.opening_balance || 0)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Davr Aylanmasi</p>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="text-emerald-600 font-black">+{fmt(data?.entries.reduce((s, e) => s + e.debit, 0) || 0)}</div>
                            <div className="text-rose-600 font-black">-{fmt(data?.entries.reduce((s, e) => s + e.credit, 0) || 0)}</div>
                        </div>
                    </div>
                    <div className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-200 text-white">
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-1">Yakuniy Qoldiq</p>
                        <p className="text-2xl font-black">{fmt(data?.closing_balance || 0)}</p>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-4 text-left">Sana</th>
                                <th className="px-6 py-4 text-left">Provodka</th>
                                <th className="px-6 py-4 text-left">Tavsif</th>
                                <th className="px-6 py-4 text-right">Debit</th>
                                <th className="px-6 py-4 text-right">Kredit</th>
                                <th className="px-6 py-4 text-right">Qoldiq</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.entries.map((entry, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4 text-slate-500 font-semibold">{entry.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 font-black font-mono">{entry.entry_number}</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">{entry.source_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-medium max-w-xs truncate">{entry.description}</td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-600">{entry.debit > 0 ? fmt(entry.debit) : ''}</td>
                                    <td className="px-6 py-4 text-right font-black text-rose-600">{entry.credit > 0 ? fmt(entry.credit) : ''}</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">{fmt(entry.balance)}</td>
                                </tr>
                            ))}
                            {(!data?.entries || data.entries.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                                        Davr uchun operatsiyalar topilmadi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
  );
}
