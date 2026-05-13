import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { motion } from 'motion/react';
import { 
  Receipt, Calculator, AlertCircle, Calendar, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  HelpCircle, Info
} from 'lucide-react';
import api from '../../lib/api';

interface TaxRate {
  id: number;
  name: string;
  code: string;
  rate: number;
}

export default function TaxControl() {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [vatSummary, setVatSummary] = useState({
    input_vat: 24500000, // Example data
    output_vat: 38200000,
    net_payable: 13700000
  });

  const [calcData, setCalcData] = useState({
    amount: '',
    tax_code: 'VAT_12'
  });
  const [calcResult, setCalcResult] = useState<any>(null);

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(Math.round(n));

  const fetchRates = async () => {
    try {
      const res = await api.get('accounting/tax-rates/');
      setTaxRates(res.data.results || res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleCalculate = async () => {
    if (!calcData.amount) return;
    try {
      const res = await api.post('accounting/vat-calculate/', {
        amount: parseFloat(calcData.amount),
        tax_code: calcData.tax_code
      });
      setCalcResult(res.data);
    } catch (err) {}
  };

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <ArrowDownRight className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('Kiruvchi QQS (Input VAT)')}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{fmt(vatSummary.input_vat)}</p>
                <p className="text-xs text-slate-500 font-bold mt-2">Hisoblangan QQS (Kiruvchi)</p>
            </div>

            <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Chiquvchi QQS (Output VAT)')}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{fmt(vatSummary.output_vat)}</p>
                <p className="text-xs text-slate-500 font-bold mt-2">To'lanishi kerak bo'lgan QQS</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
                        <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Sof to\'lanadigan soliq')}</span>
                </div>
                <p className="text-3xl font-black tracking-tight">{fmt(vatSummary.net_payable)}</p>
                <p className="text-xs text-slate-400 font-bold mt-2">Budjetga to'lanadigan sof summa</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Calculator */}
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[40px] shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Soliq Kalkulyatori
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Bazaviy Summa</label>
                        <input 
                            type="number" 
                            value={calcData.amount}
                            onChange={e => setCalcData({...calcData, amount: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-slate-900"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Soliq Turi</label>
                        <select 
                            value={calcData.tax_code}
                            onChange={e => setCalcData({...calcData, tax_code: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                        >
                            {taxRates.map(r => (
                                <option key={r.id} value={r.code}>{r.name} ({r.rate}%)</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleCalculate}
                        className="w-full py-4.5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    >
                        Hisoblash
                    </button>
                </div>

                {calcResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-blue-50 rounded-[28px] border border-blue-100 space-y-3"
                    >
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Asosiy summa:</span>
                            <span className="text-slate-900 font-black">{fmt(calcResult.base_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Soliq ({calcResult.tax_rate}%):</span>
                            <span className="text-blue-600 font-black">+{fmt(calcResult.tax_amount)}</span>
                        </div>
                        <div className="h-px bg-blue-200/50 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-slate-900 font-black uppercase tracking-wider text-xs">Jami summa:</span>
                            <span className="text-xl font-black text-blue-700">{fmt(calcResult.total)}</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Tax Deadlines */}
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[40px] shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    Soliq Taqvimi (Deadlines)
                </h3>
                <div className="space-y-4">
                    {[
                        { name: 'QQS (VAT) Hisoboti', date: '20 May, 2026', status: 'URGENT', days: 8 },
                        { name: 'Foyda Solig\'i', date: '25 May, 2026', status: 'UPCOMING', days: 13 },
                        { name: 'Ijtimoiy Soliq & Daromad Solig\'i', date: '15 May, 2026', status: 'TODAY', days: 0 },
                        { name: 'Statistika Hisoboti', date: '10 Iyun, 2026', status: 'NORMAL', days: 28 },
                    ].map((tax, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-[24px] border border-slate-100 group hover:border-blue-200 transition-all">
                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-xs ${
                                tax.status === 'URGENT' ? 'bg-rose-100 text-rose-600' : 
                                tax.status === 'TODAY' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {tax.days}d
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{tax.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{tax.date}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                tax.status === 'URGENT' ? 'bg-rose-500 text-white' : 
                                tax.status === 'TODAY' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {tax.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Tips & Guidance */}
        <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[32px] flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
                <Info className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-wider">Eslatma (Pro Tip)</h4>
                <p className="text-sm text-blue-700 font-semibold mt-1">
                    QQS hisob-kitoblarini har haftada tekshirib borish tavsiya etiladi. Tizim avtomatik ravishda barcha tasdiqlangan (POSTED) sotuv va xarid fakturalaridan QQSni ajratib oladi. 
                    Davr yopilishidan oldin (Period Close) barcha provodkalar balanslanganligiga ishonch hosil qiling.
                </p>
            </div>
        </div>
    </div>
  );
}
