import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator as CalculatorIcon, Wallet, DollarSign, TrendingUp, TrendingDown,
  ArrowRightLeft, Plus, CheckCircle2, AlertCircle, FileText, Calendar, Users, 
  Settings, Award, RefreshCw, X, ChevronRight 
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface AccountingWorkspaceProps {
  user: any;
}

type AccSubTab = 'LEDGER' | 'PAYROLL' | 'CASHBOXES' | 'REPORTS';

export default function AccountingWorkspace({ user }: AccountingWorkspaceProps) {
  const { t, locale } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<AccSubTab>('LEDGER');
  const [loading, setLoading] = useState(true);

  // States
  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Transaction Form
  const [txForm, setTxForm] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    cashbox: '',
    department: 'ADMIN',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cashboxesRes, transactionsRes, payrollRes, staffRes] = await Promise.all([
        api.get('finance/cashboxes/').catch(() => ({ data: [] })),
        api.get('finance/transactions/').catch(() => ({ data: [] })),
        api.get('payroll/').catch(() => ({ data: [] })),
        api.get('users/').catch(() => ({ data: [] }))
      ]);

      setCashboxes(cashboxesRes.data.results || cashboxesRes.data || []);
      setTransactions(transactionsRes.data.results || transactionsRes.data || []);
      setPayroll(payrollRes.data.results || payrollRes.data || []);
      setStaff(staffRes.data.results || staffRes.data || []);
    } catch (e) {
      console.error("Accounting Workspace fetch failure:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.cashbox || !txForm.description) {
      uiStore.showNotification(t("Barcha maydonlarni to'ldiring"), "error");
      return;
    }
    try {
      setLoading(true);
      await api.post('finance/transactions/', txForm);
      uiStore.showNotification(t("Tranzaksiya muvaffaqiyatli saqlandi"), "success");
      setTxForm({
        amount: '',
        type: 'EXPENSE',
        cashbox: cashboxes[0]?.id || '',
        department: 'ADMIN',
        description: ''
      });
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePayrollPay = async (payrollId: number) => {
    try {
      setLoading(true);
      await api.post(`payroll/${payrollId}/pay/`);
      uiStore.showNotification(t("Ish haqi muvaffaqiyatli to'landi"), "success");
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = cashboxes.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Accounting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-xl animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[22px] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CalculatorIcon className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{t('Buxgalteriya Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Tranzaksiyalar jurnali va kassalar monitoringi')}</p>
          </div>
        </div>
        <div className="bg-slate-900 text-white px-6 py-3.5 rounded-[22px] shadow-lg border border-slate-800 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('Umumiy Kassa Qoldig\'i')}</p>
            <p className="text-base font-black text-slate-100 font-mono">{totalBalance?.toLocaleString()} <span className="text-[10px] text-slate-400">UZS</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {(['LEDGER', 'PAYROLL', 'CASHBOXES', 'REPORTS'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveSubTab(tabKey)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeSubTab === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({
              LEDGER: 'Kassa & Tranzaksiyalar',
              PAYROLL: 'Ish Haqini Boshqarish',
              CASHBOXES: 'Kassalar Monitoringi',
              REPORTS: 'Moliya & Nasiya Tahlili'
            }[tabKey])}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="min-h-[400px]">
        {/* Ledger & Transactions */}
        {activeSubTab === 'LEDGER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick transaction form */}
            <div className="bg-slate-950 rounded-[40px] text-white p-8 border border-slate-800 shadow-2xl flex flex-col justify-between">
              <form onSubmit={handleTxSubmit} className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t('Kassa kitobi')}</span>
                  <h3 className="text-xl font-black mt-1 tracking-tight">{t('Tranzaksiya Yaratish')}</h3>
                </div>

                <div className="space-y-4">
                  {/* Type Income / Expense */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Tranzaksiya turi')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['INCOME', 'EXPENSE'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTxForm({ ...txForm, type: type as any })}
                          className={`py-3.5 rounded-xl font-black text-[10px] border-2 transition-all uppercase ${
                            txForm.type === type 
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' 
                              : 'border-white/5 text-slate-400 hover:border-white/10'
                          }`}
                        >
                          {type === 'INCOME' ? t('Kirim (Income)') : t('Chiqim (Expense)')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cashbox Select */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Kassani tanlang')}</label>
                    <select
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                      value={txForm.cashbox}
                      onChange={(e) => setTxForm({ ...txForm, cashbox: e.target.value })}
                    >
                      <option value="">{t('Kassani tanlang')}...</option>
                      {cashboxes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Summa (UZS)')}</label>
                    <input 
                      type="number"
                      value={txForm.amount}
                      onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                      placeholder="5,000,000"
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Bo\'lim (Kategoriya)')}</label>
                    <select
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                      value={txForm.department}
                      onChange={(e) => setTxForm({ ...txForm, department: e.target.value })}
                    >
                      {['ADMIN', 'PRODUCTION', 'LOGISTICS', 'SALES', 'OTHER'].map(d => (
                        <option key={d} value={d}>{t(d)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('Izoh / Maqsad')}</label>
                    <input 
                      type="text"
                      value={txForm.description}
                      onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                      placeholder={t("Masalan: Granula xaridi uchun to'lov")}
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg active:scale-95 transition-all mt-6"
                >
                  {t('Saqlash')}
                </button>
              </form>
            </div>

            {/* Ledger Audit log */}
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg border-b border-slate-50 pb-4 mb-6">{t('Oxirgi Tranzaksiyalar')}</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {transactions.map(tx => (
                    <div key={tx.id} className="p-5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-3xl transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
                          tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {tx.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm leading-tight">{tx.description}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-wide">
                            <span>{tx.cashbox_name}</span>
                            <span>•</span>
                            <span className="text-indigo-500">{t(tx.department_display || tx.department)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-base ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{parseFloat(tx.amount || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">UZS</span>
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date(tx.created_at).toLocaleDateString(locale)}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="py-20 text-center text-slate-300 text-xs italic">{t('Tranzaksiyalar mavjud emas')}</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Payroll Tab */}
        {activeSubTab === 'PAYROLL' && (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Ish Haqini To\'lash Jurnali')}</h3>
              <span className="px-3.5 py-1 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500">{payroll.length} {t('xodim')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Ism / Bo\'lim')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Oylik Maosh')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mukofot (Bonus)')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Jami to\'lov')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Status')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('To\'lov')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-xs">
                  {payroll.map(item => {
                    const emp = staff.find(s => s.id === item.user_id);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/30 transition-all">
                        <td className="px-6 py-4">
                          <p className="text-slate-900 font-black">{item.user_name || emp?.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.role || t(emp?.role)}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{parseFloat(item.base_salary || 0).toLocaleString()} UZS</td>
                        <td className="px-6 py-4 text-emerald-600">+{parseFloat(item.bonus || 0).toLocaleString()} UZS</td>
                        <td className="px-6 py-4 text-slate-900 font-black">{parseFloat(item.total_paid || 0).toLocaleString()} UZS</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                            item.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {item.status === 'PAID' ? t('To\'landi') : t('Kutilmoqda')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status !== 'PAID' ? (
                            <button onClick={() => handlePayrollPay(item.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md">{t('To\'lash')}</button>
                          ) : (
                            <span className="text-slate-300 italic text-[10px] font-medium">{t('To\'langan')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {payroll.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-300 italic">{t('Ish haqi ma\'lumotlari mavjud emas')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cashboxes Monitoring */}
        {activeSubTab === 'CASHBOXES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cashboxes.map(box => (
              <div key={box.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full blur-xl -mr-10 -mt-10" />
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${box.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                    {box.is_active ? t('Faol') : t('O\'chirilgan')}
                  </span>
                </div>
                <div className="mt-4">
                  <h4 className="font-black text-slate-900 text-base mb-1">{box.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(box.type_display || box.type)}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-end justify-between mt-4">
                  <span className="text-[9px] font-black text-slate-300 uppercase">{t('Qoldiq')}</span>
                  <span className="font-black text-lg text-slate-900 font-mono">{parseFloat(box.balance || 0).toLocaleString()} UZS</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS & P&L / Debtor Aging */}
        {activeSubTab === 'REPORTS' && (
          <div className="space-y-6">
            {/* P&L and Energy vs Material Cost Center card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Cost Center Card */}
              <div className="lg:col-span-1 bg-slate-950 text-white rounded-[40px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t('Tahlil Markazi')}</span>
                      <h3 className="text-xl font-black mt-1 tracking-tight">{t('P&L Tannarx Markazi')}</h3>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Operational Costs list */}
                  <div className="space-y-3">
                    {[
                      { name: t('Xom-ashyo (EPS)'), val: 88400000, desc: t('Sinf A, B granulalar'), color: 'text-blue-400' },
                      { name: t('Gaz Iste\'moli'), val: 14200000, desc: t('Bleyzer bug\' generatori'), color: 'text-orange-400' },
                      { name: t('Elektr Energiyasi'), val: 6800000, desc: t('SCADA kompressor sexlari'), color: 'text-yellow-400' },
                      { name: t('Ish Haqini To\'lash'), val: 24500000, desc: t('Shift operatorlari / ustalar'), color: 'text-indigo-400' }
                    ].map((cost, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                        <div>
                          <p className="text-xs font-black text-white">{cost.name}</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-0.5">{cost.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black ${cost.color}`}>{cost.val.toLocaleString()} UZS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 mt-6 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">{t('Jami Amaliy Tannarx')}</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">133,900,000 UZS</span>
                </div>
              </div>

              {/* Energy Overhead vs Material Costs Ratio */}
              <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{t('Energiya va Resurs Balansi')}</h3>
                      <p className="text-xs text-slate-400 font-medium">{t('Energiya xarajatining xom-ashyoga nisbati (SCADA OEE)')}</p>
                    </div>
                    <span className="px-3.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black">{t('Optimal: < 25%')}</span>
                  </div>

                  <div className="space-y-6">
                    {/* Energy vs Material ratio details */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-900">23.8%</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Joriy oylik nisbat')}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-wider">{t('Yashil hudud (Zo\'r)')}</span>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{t('Muvaffaqiyatli energiya tejash rejimi')}</p>
                      </div>
                    </div>

                    {/* Progress bar comparison */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{t('Xom-ashyo (Materials)')}</span>
                        <span>{t('Energiya overhead (Gas/Elec)')}</span>
                      </div>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                        <div className="h-full bg-indigo-600" style={{ width: '80.7%' }} />
                        <div className="h-full bg-amber-500" style={{ width: '19.3%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1">
                        <span>80.7% (88,400,000 UZS)</span>
                        <span>19.3% (21,000,000 UZS)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-blue-50/50 border border-blue-100/50 rounded-3xl text-xs font-bold text-blue-700 leading-snug flex items-center gap-4">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 animate-ping" />
                  <span>{t('Tejamkorlik tahlili: Gaz va elektr quvvatlarida SCADA optimallashtirish tufayli o\'tgan oyga nisbatan 1.4% tejamkorlik yozildi.')}</span>
                </div>
              </div>

            </div>

            {/* Nasiya (Debtor) Aging Reports */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{t('Qarzdorlik (Nasiya) Aging Monitoringi')}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t('Klientlarning to\'lov muddatlari bo\'yicha toifasi va xavflilik tahlili')}</p>
                </div>
                <span className="px-3.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black">{t('Jami: 289,000,000 UZS')}</span>
              </div>

              {/* Debt buckets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { range: '1 - 30 ' + t('kun'), amount: 124500000, risk: t('Kichik xavf'), pct: 43, color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100/50' },
                  { range: '31 - 60 ' + t('kun'), amount: 85200000, risk: t('O\'rtacha xavf'), pct: 29, color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100/50' },
                  { range: '61 - 90 ' + t('kun'), amount: 45000000, risk: t('Yuqori xavf'), pct: 16, color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50/50', border: 'border-orange-100/50' },
                  { range: '90+ ' + t('kun'), amount: 34300000, risk: t('Kritik xavf'), pct: 12, color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-100/50' }
                ].map((bucket, idx) => (
                  <div key={idx} className={`p-6 rounded-[28px] border ${bucket.border} ${bucket.bg} space-y-4`}>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bucket.range}</p>
                      <p className="text-xl font-black text-slate-900 mt-1">{bucket.amount.toLocaleString()} <span className="text-[10px] text-slate-400">UZS</span></p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-black">
                        <span className={bucket.text}>{bucket.risk}</span>
                        <span className="text-slate-400">{bucket.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bucket.color}`} style={{ width: `${bucket.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Debtors List Table */}
              <div className="overflow-x-auto pt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mijoz nomi')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Jami Nasiya')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Muddat (Kechikish)')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Risk toifasi')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-xs">
                    {[
                      { name: 'Xurshid Qurilish Savdo', debt: 75000000, days: 12, risk: 'LOW', risk_label: t('Kichik xavf'), color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
                      { name: 'Sherzod Penoplast Diler', debt: 85200000, days: 45, risk: 'MEDIUM', risk_label: t('O\'rtacha xavf'), color: 'bg-amber-50 text-amber-600 border border-amber-100' },
                      { name: 'Premium Stroy Invest', debt: 45000000, days: 78, risk: 'HIGH', risk_label: t('Yuqori xavf'), color: 'bg-orange-50 text-orange-600 border border-orange-100' },
                      { name: 'Grand Plast Block MChJ', debt: 34300000, days: 104, risk: 'CRITICAL', risk_label: t('Kritik xavf'), color: 'bg-rose-50 text-rose-600 border border-rose-100' }
                    ].map((debtor, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                        <td className="px-6 py-4 text-slate-900 font-black">{debtor.name}</td>
                        <td className="px-6 py-4 text-slate-700">{debtor.debt.toLocaleString()} UZS</td>
                        <td className="px-6 py-4 text-slate-500">{debtor.days} {t('kun')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${debtor.color}`}>
                            {debtor.risk_label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => uiStore.showNotification(t("Qarzdorga bildirishnoma va SMS eslatma muvaffaqiyatli jo'natildi"), "success")}
                            className="px-3.5 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all rounded-xl text-[9px] font-black uppercase tracking-wider"
                          >
                            {t('Eslatish')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
