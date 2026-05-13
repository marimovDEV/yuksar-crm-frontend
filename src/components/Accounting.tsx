import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator, BookOpen, TrendingUp, TrendingDown, DollarSign,
  FileText, ChevronRight, ChevronDown, Search, Filter,
  Plus, Check, X, Eye, ArrowUpRight, ArrowDownRight,
  Landmark, PieChart, BarChart3, RefreshCw, AlertCircle,
  Wallet, Building2, Receipt, Scale, Download, Printer,
  History, ShieldCheck, CheckCircle2, Paperclip
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import type {
  User, AccountNode, JournalEntry, TrialBalance,
  BalanceSheet, IncomeStatement, CashFlowStatement, AccountingSummary, TaxRate
} from '../types';

import AccountingDashboard from './accounting/AccountingDashboard';
import AccountLedger from './accounting/AccountLedger';
import TaxControl from './accounting/TaxControl';

interface Props {
  user: User | null;
}

type Tab = 'dashboard' | 'accounts' | 'journal' | 'trial-balance' | 'balance-sheet' | 'pnl' | 'cash-flow' | 'tax';

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

export default function Accounting({ user }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);

  // Data states
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowStatement | null>(null);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{code: string, name: string} | null>(null);

  // Create entry form
  const [newEntry, setNewEntry] = useState({
    description: '',
    reference: '',
    lines: [
      { account_code: '', debit: '', credit: '', description: '' },
      { account_code: '', debit: '', credit: '', description: '' },
    ]
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  // Date filters

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (tab) {
        case 'dashboard':
          const sumRes = await api.get('accounting/summary/');
          setSummary(sumRes.data);
          break;
        case 'accounts':
          const accRes = await api.get('accounting/accounts/tree/');
          setAccounts(accRes.data);
          break;
        case 'journal':
          const jeRes = await api.get('accounting/journal-entries/');
          setEntries(jeRes.data.results || jeRes.data);
          break;
        case 'trial-balance':
          const tbRes = await api.get(`accounting/trial-balance/?start_date=${startDate}&end_date=${endDate}`);
          setTrialBalance(tbRes.data);
          break;
        case 'balance-sheet':
          const bsRes = await api.get(`accounting/balance-sheet/?date=${endDate}`);
          setBalanceSheet(bsRes.data);
          break;
        case 'pnl':
          const plRes = await api.get(`accounting/income-statement/?start_date=${startDate}&end_date=${endDate}`);
          setIncomeStatement(plRes.data);
          break;
        case 'cash-flow':
          const cfRes = await api.get(`accounting/cash-flow/?start_date=${startDate}&end_date=${endDate}`);
          setCashFlow(cfRes.data);
          break;
        case 'tax':
          const txRes = await api.get('accounting/tax-rates/');
          setTaxRates(txRes.data.results || txRes.data);
          break;
      }
    } catch (err) {
      console.error('Accounting load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append('description', newEntry.description);
      data.append('reference', newEntry.reference);
      data.append('source_type', 'MANUAL');
      data.append('auto_post', 'false');
      if (attachment) data.append('attachment', attachment);

      const lines = newEntry.lines
        .filter(l => l.account_code && (parseFloat(l.debit || '0') > 0 || parseFloat(l.credit || '0') > 0))
        .map(l => ({
          account_code: l.account_code,
          debit: parseFloat(l.debit || '0'),
          credit: parseFloat(l.credit || '0'),
          description: l.description,
        }));
      
      data.append('lines_json', JSON.stringify(lines));

      await api.post('accounting/journal-entries/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowCreateEntry(false);
      setAttachment(null);
      setNewEntry({
        description: '', reference: '',
        lines: [
          { account_code: '', debit: '', credit: '', description: '' },
          { account_code: '', debit: '', credit: '', description: '' },
        ]
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };


  const handlePostEntry = async (id: number) => {
    try {
      await api.post(`accounting/journal-entries/${id}/post_entry/`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const handleVoidEntry = async (id: number) => {
    const reason = prompt('Bekor qilish sababi:');
    if (!reason) return;
    try {
      await api.post(`accounting/journal-entries/${id}/void_entry/`, { reason });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const toggleAccount = (code: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const tabs: { id: Tab; name: string; icon: any }[] = [
    { id: 'dashboard', name: t('Umumiy'), icon: PieChart },
    { id: 'accounts', name: t('Hisoblar Rejasi'), icon: Landmark },
    { id: 'journal', name: t('accounting.journal'), icon: BookOpen },
    { id: 'trial-balance', name: t('accounting.trial_balance'), icon: Scale },
    { id: 'balance-sheet', name: t('accounting.balance_sheet'), icon: BarChart3 },
    { id: 'pnl', name: t('accounting.pnl'), icon: TrendingUp },
    { id: 'cash-flow', name: t('accounting.cash_flow'), icon: Wallet },
    { id: 'tax', name: t('accounting.tax'), icon: Receipt },
  ];

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-amber-100 text-amber-700',
    POSTED: 'bg-emerald-100 text-emerald-700',
    VOID: 'bg-red-100 text-red-700',
  };

  const typeColors: Record<string, string> = {
    ASSET: 'bg-blue-100 text-blue-700',
    LIABILITY: 'bg-purple-100 text-purple-700',
    EQUITY: 'bg-indigo-100 text-indigo-700',
    REVENUE: 'bg-emerald-100 text-emerald-700',
    EXPENSE: 'bg-rose-100 text-rose-700',
    CONTRA: 'bg-gray-100 text-gray-700',
  };

  const totalDebit = useMemo(() => 
    newEntry.lines.reduce((s, l) => s + parseFloat(l.debit || '0'), 0), [newEntry.lines]);
  const totalCredit = useMemo(() => 
    newEntry.lines.reduce((s, l) => s + parseFloat(l.credit || '0'), 0), [newEntry.lines]);

  // ═══════════════ RENDER ACCOUNT TREE ═══════════════
  const renderAccountTree = (nodes: AccountNode[], depth = 0) => {
    return nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedAccounts.has(node.code);
      const matchSearch = !searchQuery || 
        (node.code || '').includes(searchQuery) || 
        (node.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch && !hasChildren) return null;

      return (
        <div key={node.code}>
          <div
            className={`flex items-center gap-2 py-3 px-4 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 group ${depth > 0 ? 'ml-' + (depth * 4) : ''}`}
            onClick={() => hasChildren ? toggleAccount(node.code) : setSelectedAccount({code: node.code, name: node.name})}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 flex-none" /> 
                         : <ChevronRight className="w-4 h-4 text-slate-400 flex-none" />
            ) : <div className="w-4 flex-none" />}
            
            <span className="text-xs font-mono font-black text-slate-400 w-14 flex-none">{node.code}</span>
            <span className={`text-sm font-black flex-1 ${depth === 0 ? 'text-slate-900' : 'text-slate-700'}`}>
              {node.name}
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${typeColors[node.account_type] || 'bg-gray-100'}`}>
              {node.account_type_display}
            </span>
            <span className={`text-sm font-black tabular-nums min-w-[120px] text-right ${node.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {fmt(node.balance)}
            </span>
            {!hasChildren && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedAccount({code: node.code, name: node.name}); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all ml-2"
                >
                    <History className="w-4 h-4" />
                </button>
            )}
          </div>
          {hasChildren && isExpanded && (
              <div className="border-l-2 border-slate-50 ml-6 pl-2 my-1">
                  {renderAccountTree(node.children!, depth + 1)}
              </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
                    <Calculator className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buxgalteriya Yadrosi</h1>
            </div>
            <p className="text-slate-500 font-semibold ml-14">Full ERP Accounting & Ledger System (BHM Standarti)</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm text-sm">
            <Printer className="w-4 h-4" /> Export Report
          </button>
          <button 
            onClick={() => setShowCreateEntry(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 text-sm"
          >
            <Plus className="w-5 h-5" /> Yangi Provodka
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-100/50 p-1.5 rounded-[24px] flex gap-1 overflow-x-auto custom-scrollbar border border-slate-200/50 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelectedAccount(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id && !selectedAccount ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[60vh]">
        {loading && !summary && !accounts.length && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Accounting Engine Loading...</p>
            </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={selectedAccount ? 'ledger' : tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            
            {/* LEDGER DRILL-DOWN */}
            {selectedAccount ? (
                <AccountLedger 
                    accountCode={selectedAccount.code} 
                    accountName={selectedAccount.name} 
                    onBack={() => setSelectedAccount(null)} 
                />
            ) : (
                <>
                {/* ═══════════ DASHBOARD ═══════════ */}
                {tab === 'dashboard' && <AccountingDashboard summary={summary} />}

                {/* ═══════════ CHART OF ACCOUNTS ═══════════ */}
                {tab === 'accounts' && (
                  <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center gap-6">
                      <div className="p-4 bg-blue-50 rounded-2xl">
                        <Landmark className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-wider">Hisoblar Rejasi (BHM)</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">Standart 21-son BHMS asosidagi iyerarxiya</p>
                      </div>
                      <div className="flex items-center bg-slate-50 px-5 py-3 rounded-[20px] border border-slate-200 w-64 shadow-inner">
                        <Search className="w-4 h-4 text-slate-400 mr-3" />
                        <input type="text" placeholder="Kod yoki nom..." value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                      </div>
                    </div>
                    <div className="p-6 max-h-[700px] overflow-y-auto custom-scrollbar space-y-1">
                      {accounts.length === 0 ? (
                        <div className="text-center py-24 text-slate-400">
                          <Landmark className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-black uppercase tracking-widest">Ma'lumotlar topilmadi</p>
                        </div>
                      ) : renderAccountTree(accounts)}
                    </div>
                  </div>
                )}

                {/* ═══════════ JOURNAL ENTRIES ═══════════ */}
                {tab === 'journal' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm divide-y divide-slate-50">
                      {entries.length === 0 ? (
                        <div className="text-center py-24 text-slate-400">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-black uppercase tracking-widest">Provodkalar mavjud emas</p>
                        </div>
                      ) : entries.map(entry => (
                        <div key={entry.id} className="p-6 hover:bg-slate-50/50 transition-all group">
                          <div className="flex items-start gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-mono font-black text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">{entry.entry_number}</span>
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${statusColors[entry.status]}`}>
                                  {entry.status_display}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">Source: {entry.source_type_display}</span>
                                <div className="flex-1" />
                                <span className="text-xs text-slate-400 font-bold">{entry.date}</span>
                              </div>
                              <p className="text-base font-black text-slate-900 mb-4">{entry.description}</p>
                              
                              {/* Lines grid - Double Entry visualization */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1 border-l-4 border-emerald-500/20 pl-4 py-2 bg-emerald-50/30 rounded-r-2xl">
                                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-2">{t('Debet yozuvlari')}</p>
                                      {entry.lines.filter(l => l.debit > 0).map(line => (
                                          <div key={line.id} className="flex items-center justify-between text-xs">
                                              <span className="font-mono font-black text-slate-500 w-12">{line.account_code}</span>
                                              <span className="text-slate-700 font-bold flex-1 truncate mx-2">{line.account_name}</span>
                                              <span className="text-emerald-600 font-black tabular-nums">{fmt(line.debit)}</span>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="space-y-1 border-l-4 border-rose-500/20 pl-4 py-2 bg-rose-50/30 rounded-r-2xl">
                                      <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-2">{t('Kredit yozuvlari')}</p>
                                      {entry.lines.filter(l => l.credit > 0).map(line => (
                                          <div key={line.id} className="flex items-center justify-between text-xs">
                                              <span className="font-mono font-black text-slate-500 w-12">{line.account_code}</span>
                                              <span className="text-slate-700 font-bold flex-1 truncate mx-2">{line.account_name}</span>
                                              <span className="text-rose-600 font-black tabular-nums">{fmt(line.credit)}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                            </div>
                            <div className="text-right flex-none w-48">
                              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">{t('Jami summa')}</p>
                              <p className="text-2xl font-black text-slate-900 tracking-tighter">{fmt(entry.total_amount)}</p>
                              <div className="flex gap-2 mt-4 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                {entry.status === 'DRAFT' && (
                                  <button onClick={() => handlePostEntry(entry.id)}
                                    className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {entry.status === 'POSTED' && (
                                  <button onClick={() => handleVoidEntry(entry.id)}
                                    className="p-2.5 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 transition-all">
                                    <Printer className="w-4 h-4" />
                                </button>
                                {entry.attachment && (
                                    <a 
                                      href={entry.attachment} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </a>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══════════ TRIAL BALANCE ═══════════ */}
                {tab === 'trial-balance' && trialBalance && (
                  <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-50 rounded-2xl">
                          <Scale className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-wider">Aylanma Vedomost'</h3>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            {trialBalance.start_date} — {trialBalance.end_date}
                          </p>
                        </div>
                      </div>
                      {trialBalance.is_balanced ? (
                        <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-[24px] border border-emerald-100 shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Balanslangan</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-rose-50 px-6 py-3 rounded-[24px] border border-rose-100 shadow-sm">
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Balansda Farq Bor!</span>
                        </div>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50">
                            <th className="text-left py-5 px-8">Hisob / Klass</th>
                            <th className="text-right py-5 px-4" colSpan={2}>Kirish qoldiq</th>
                            <th className="text-right py-5 px-4" colSpan={2}>Davr aylanmasi</th>
                            <th className="text-right py-5 px-8" colSpan={2}>Chiqish qoldiq</th>
                          </tr>
                          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <th></th>
                            <th className="text-right px-4 py-2 border-l border-slate-50">Debit</th>
                            <th className="text-right px-4 py-2">Kredit</th>
                            <th className="text-right px-4 py-2 border-l border-slate-50 text-indigo-600">Debit</th>
                            <th className="text-right px-4 py-2 text-indigo-600">Kredit</th>
                            <th className="text-right px-8 py-2 border-l border-slate-50 text-slate-900">Debit</th>
                            <th className="text-right px-8 py-2 text-slate-900">Kredit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {trialBalance.accounts.map(acc => (
                            <tr key={acc.code} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-4 px-8">
                                <span className="font-mono text-xs font-black text-slate-400 mr-3">{acc.code}</span>
                                <span className="text-slate-900 font-bold">{acc.name}</span>
                              </td>
                              <td className="text-right px-4 tabular-nums text-slate-500 font-medium">{acc.opening_debit > 0 ? fmt(acc.opening_debit) : ''}</td>
                              <td className="text-right px-4 tabular-nums text-slate-500 font-medium">{acc.opening_credit > 0 ? fmt(acc.opening_credit) : ''}</td>
                              <td className="text-right px-4 tabular-nums font-black text-indigo-600">{acc.period_debit > 0 ? fmt(acc.period_debit) : ''}</td>
                              <td className="text-right px-4 tabular-nums font-black text-indigo-600">{acc.period_credit > 0 ? fmt(acc.period_credit) : ''}</td>
                              <td className="text-right px-8 tabular-nums font-black text-slate-900">{acc.closing_debit > 0 ? fmt(acc.closing_debit) : ''}</td>
                              <td className="text-right px-8 tabular-nums font-black text-slate-900">{acc.closing_credit > 0 ? fmt(acc.closing_credit) : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-900 text-white font-black">
                            <td className="py-6 px-8 text-xs uppercase tracking-widest">Jami Aylanma (Balance)</td>
                            <td colSpan={4}></td>
                            <td className="text-right px-8 tabular-nums text-xl tracking-tighter">{fmt(trialBalance.total_debit)}</td>
                            <td className="text-right px-8 tabular-nums text-xl tracking-tighter">{fmt(trialBalance.total_credit)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* ═══════════ BALANCE SHEET ═══════════ */}
                {tab === 'balance-sheet' && balanceSheet && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Assets */}
                    <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-blue-50 bg-blue-50/30">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-blue-900 tracking-tight uppercase tracking-widest">Aktivlar (Assets)</h3>
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-50 p-4">
                        {balanceSheet.assets.map(a => (
                          <div key={a.code} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-all">
                            <div>
                              <span className="text-xs font-mono font-black text-slate-400 mr-3">{a.code}</span>
                              <span className="text-sm font-black text-slate-700">{a.name}</span>
                            </div>
                            <span className="text-sm font-black tabular-nums text-blue-700">{fmt(a.balance)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-8 mt-auto border-t-4 border-blue-600 bg-blue-50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-blue-900 uppercase tracking-[0.2em]">Jami Aktivlar</span>
                          <span className="text-3xl font-black text-blue-700 tracking-tighter">{fmt(balanceSheet.total_assets)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Liabilities + Equity */}
                    <div className="space-y-8">
                      <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-purple-50 bg-purple-50/30">
                          <h3 className="text-xl font-black text-purple-900 tracking-tight uppercase tracking-widest">Majburiyatlar</h3>
                        </div>
                        <div className="divide-y divide-slate-50 p-4">
                          {balanceSheet.liabilities.map(l => (
                            <div key={l.code} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-all">
                              <div>
                                <span className="text-xs font-mono font-black text-slate-400 mr-3">{l.code}</span>
                                <span className="text-sm font-black text-slate-700">{l.name}</span>
                              </div>
                              <span className="text-sm font-black tabular-nums text-purple-700">{fmt(l.balance)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-purple-50/50 border-t border-purple-100">
                          <div className="flex justify-between text-xs font-black text-purple-800 uppercase tracking-widest px-4">
                            <span>Jami Majburiyatlar</span><span>{fmt(balanceSheet.total_liabilities)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-indigo-50 bg-indigo-50/30">
                          <h3 className="text-xl font-black text-indigo-900 tracking-tight uppercase tracking-widest">Kapital & Zaxiralar</h3>
                        </div>
                        <div className="divide-y divide-slate-50 p-4">
                          {balanceSheet.equity.map(e => (
                            <div key={e.code} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-all">
                              <div>
                                <span className="text-xs font-mono font-black text-slate-400 mr-3">{e.code}</span>
                                <span className="text-sm font-black text-slate-700">{e.name}</span>
                              </div>
                              <span className="text-sm font-black tabular-nums text-indigo-700">{fmt(e.balance)}</span>
                            </div>
                          ))}
                          {balanceSheet.retained_earnings !== 0 && (
                            <div className="px-6 py-4 flex items-center justify-between bg-emerald-50 rounded-2xl mx-2 my-1">
                              <span className="text-sm text-emerald-800 font-black uppercase tracking-tight">Taqsimlanmagan foyda</span>
                              <span className="text-sm font-black tabular-nums text-emerald-700">{fmt(balanceSheet.retained_earnings)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Equilibrium Check */}
                      <div className={`p-8 rounded-[40px] shadow-xl relative overflow-hidden ${balanceSheet.is_balanced ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'}`}>
                        <div className="relative z-10 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Accounting Equilibrium</p>
                            <h4 className="text-2xl font-black tracking-tight mb-2">
                                {balanceSheet.is_balanced ? '✅ Balans Tenglandi' : '❌ Balansda Farq Bor!'}
                            </h4>
                            <p className="text-xs font-bold opacity-80 text-center max-w-xs">
                                Aktivlar ({fmt(balanceSheet.total_assets)}) = Passivlar ({fmt(balanceSheet.total_liabilities_and_equity)})
                            </p>
                        </div>
                        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 blur-[60px] rounded-full" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════════ P&L / INCOME STATEMENT ═══════════ */}
                {tab === 'pnl' && incomeStatement && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-200">
                            <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Operatsion Daromad</p>
                            <h3 className="text-4xl font-black tracking-tighter">{fmt(incomeStatement.total_revenue)}</h3>
                            <div className="flex items-center gap-2 mt-4 opacity-80">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-bold">Monthly Target: 92%</span>
                            </div>
                        </div>
                        <div className="bg-rose-600 rounded-[32px] p-8 text-white shadow-xl shadow-rose-200">
                            <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Jami Xarajatlar</p>
                            <h3 className="text-4xl font-black tracking-tighter">{fmt(incomeStatement.total_expenses)}</h3>
                            <div className="flex items-center gap-2 mt-4 opacity-80">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-xs font-bold">{t("OpEx Nisbati")}: {(incomeStatement.total_expenses / incomeStatement.total_revenue * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
                            <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">{t("Sof Foyda")}</p>
                            <h3 className={`text-4xl font-black tracking-tighter ${incomeStatement.net_income >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {fmt(incomeStatement.net_income)}
                            </h3>
                            <p className="text-xs font-bold mt-4 text-slate-400 uppercase tracking-widest">{incomeStatement.profit_margin}% {t("Sof Foyda Marjasi")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between">
                                <h3 className="text-xl font-black text-emerald-900 tracking-tight uppercase tracking-widest">Daromad Manbalari</h3>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <div className="p-6 space-y-2">
                                {incomeStatement.revenues.map(r => (
                                    <div key={r.code} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[24px] transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{r.code}</span>
                                            <span className="text-sm font-black text-slate-900">{r.name}</span>
                                        </div>
                                        <span className="text-lg font-black text-emerald-600 tabular-nums">{fmt(r.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-rose-50 bg-rose-50/30 flex items-center justify-between">
                                <h3 className="text-xl font-black text-rose-900 tracking-tight uppercase tracking-widest">Xarajat Strukturasi</h3>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-rose-100">
                                    <TrendingDown className="w-6 h-6 text-rose-600" />
                                </div>
                            </div>
                            <div className="p-6 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {incomeStatement.expenses.map(e => (
                                    <div key={e.code} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[24px] transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{e.code}</span>
                                            <span className="text-sm font-black text-slate-900">{e.name}</span>
                                        </div>
                                        <span className="text-lg font-black text-rose-600 tabular-nums">{fmt(e.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* ═══════════ PUL OQIMI / CASH FLOW ═══════════ */}
                {tab === 'cash-flow' && cashFlow && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kirish Qoldig'i</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{fmt(cashFlow.opening_cash)}</p>
                        </div>
                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Jami Kirim</p>
                            <p className="text-2xl font-black text-emerald-600 tracking-tighter">+{fmt(cashFlow.total_inflow)}</p>
                        </div>
                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Jami Chiqim</p>
                            <p className="text-2xl font-black text-rose-600 tracking-tighter">-{fmt(cashFlow.total_outflow)}</p>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yakuniy Pul Qoldig'i</p>
                            <p className="text-2xl font-black text-white tracking-tighter">{fmt(cashFlow.closing_cash)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center gap-4">
                                <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                                <h3 className="text-xl font-black text-emerald-900 tracking-tight uppercase tracking-widest">Pul Kirimi (Inflow)</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {cashFlow.inflows.map((inf, i) => (
                                    <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{inf.date} | {inf.source}</span>
                                            <span className="text-sm font-black text-slate-900 truncate max-w-xs">{inf.description}</span>
                                        </div>
                                        <span className="text-lg font-black text-emerald-600 tabular-nums">{fmt(inf.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-rose-50 bg-rose-50/30 flex items-center gap-4">
                                <ArrowDownRight className="w-6 h-6 text-rose-600" />
                                <h3 className="text-xl font-black text-rose-900 tracking-tight uppercase tracking-widest">Pul Chiqimi (Outflow)</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {cashFlow.outflows.map((out, i) => (
                                    <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{out.date} | {out.source}</span>
                                            <span className="text-sm font-black text-slate-900 truncate max-w-xs">{out.description}</span>
                                        </div>
                                        <span className="text-lg font-black text-rose-600 tabular-nums">{fmt(out.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* ═══════════ TAXES ═══════════ */}
                {tab === 'tax' && <TaxControl />}
                </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NEW ENTRY MODAL */}
      <AnimatePresence>
          {showCreateEntry && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowCreateEntry(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                  >
                      {/* Modal Header */}
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                                  <BookOpen className="w-6 h-6" />
                              </div>
                              <div>
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Yangi Provodka Kiritish</h3>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Double-Entry Accounting Journal</p>
                              </div>
                          </div>
                          <button onClick={() => setShowCreateEntry(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                              <X className="w-6 h-6 text-slate-400" />
                          </button>
                      </div>

                      <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Operatsiya Tavsifi</label>
                                  <input 
                                      value={newEntry.description}
                                      onChange={e => setNewEntry(p => ({ ...p, description: e.target.value }))}
                                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm"
                                      placeholder="Masalan: Xaridor to'lovi qabul qilindi"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Asos Hujjat Raqami</label>
                                  <input 
                                      value={newEntry.reference}
                                      onChange={e => setNewEntry(p => ({ ...p, reference: e.target.value }))}
                                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm"
                                      placeholder="Masalan: INV-2026-001"
                                  />
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Entry Lines</h4>
                                  <button onClick={() => setNewEntry(prev => ({...prev, lines: [...prev.lines, { account_code: '', debit: '', credit: '', description: '' }]}))}
                                      className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">+ Qator qo'shish</button>
                              </div>

                              <div className="bg-slate-50 rounded-[32px] p-4 border border-slate-100">
                                  <table className="w-full text-xs">
                                      <thead>
                                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                              <th className="px-4 py-2 text-left">Hisob Kodi</th>
                                              <th className="px-4 py-2 text-right">Debit</th>
                                              <th className="px-4 py-2 text-right">Kredit</th>
                                              <th className="px-4 py-2 text-left">Izoh</th>
                                              <th className="px-2 py-2"></th>
                                          </tr>
                                      </thead>
                                      <tbody className="space-y-2">
                                          {newEntry.lines.map((line, i) => (
                                              <tr key={i}>
                                                  <td className="px-2 py-1">
                                                      <input value={line.account_code}
                                                          onChange={e => {
                                                              const lines = [...newEntry.lines];
                                                              lines[i].account_code = e.target.value;
                                                              setNewEntry(p => ({ ...p, lines }));
                                                          }}
                                                          className="w-24 px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center"
                                                          placeholder="5010" />
                                                  </td>
                                                  <td className="px-2 py-1">
                                                      <input type="number" value={line.debit}
                                                          onChange={e => {
                                                              const lines = [...newEntry.lines];
                                                              lines[i].debit = e.target.value;
                                                              lines[i].credit = e.target.value ? '' : lines[i].credit;
                                                              setNewEntry(p => ({ ...p, lines }));
                                                          }}
                                                          className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-right text-emerald-600"
                                                          placeholder="0" />
                                                  </td>
                                                  <td className="px-2 py-1">
                                                      <input type="number" value={line.credit}
                                                          onChange={e => {
                                                              const lines = [...newEntry.lines];
                                                              lines[i].credit = e.target.value;
                                                              lines[i].debit = e.target.value ? '' : lines[i].debit;
                                                              setNewEntry(p => ({ ...p, lines }));
                                                          }}
                                                          className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-right text-rose-600"
                                                          placeholder="0" />
                                                  </td>
                                                  <td className="px-2 py-1">
                                                      <input value={line.description}
                                                          onChange={e => {
                                                              const lines = [...newEntry.lines];
                                                              lines[i].description = e.target.value;
                                                              setNewEntry(p => ({ ...p, lines }));
                                                          }}
                                                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                                                          placeholder="Qator izohi..." />
                                                  </td>
                                                  <td className="px-2 py-1 text-center">
                                                      <button onClick={() => setNewEntry(prev => ({...prev, lines: prev.lines.filter((_, idx) => idx !== i)}))} 
                                                          className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                                                          <X className="w-4 h-4" />
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>

                          <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[32px] text-white">
                              <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Balance Check</p>
                                  {Math.abs(totalDebit - totalCredit) < 0.01 ? (
                                      <div className="flex items-center gap-2 text-emerald-400 font-black">
                                          <CheckCircle2 className="w-5 h-5" />
                                          BALANSLANGAN
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2 text-rose-400 font-black animate-pulse">
                                          <AlertCircle className="w-5 h-5" />
                                          DISBALANCE: {fmt(Math.abs(totalDebit - totalCredit))}
                                      </div>
                                  )}
                              </div>
                              <div className="flex gap-8">
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Debit</p>
                                      <p className="text-2xl font-black tabular-nums">{fmt(totalDebit)}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Credit</p>
                                      <p className="text-2xl font-black tabular-nums">{fmt(totalCredit)}</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
                          <div className="flex-1 flex gap-2">
                              <label className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-[24px] font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-slate-100 transition-all">
                                  <Paperclip className="w-4 h-4" />
                                  {attachment ? attachment.name : 'Hujjat biriktirish'}
                                  <input type="file" className="hidden" onChange={e => setAttachment(e.target.files?.[0] || null)} />
                              </label>
                              {attachment && (
                                  <button onClick={() => setAttachment(null)} className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                                      <X className="w-4 h-4" />
                                  </button>
                              )}
                          </div>
                          <div className="flex-[2] flex gap-4">
                            <button onClick={() => setShowCreateEntry(false)}
                                className="flex-1 px-8 py-4.5 bg-white border-2 border-slate-200 text-slate-600 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">Bekor qilish</button>
                            <button 
                                onClick={handleCreateEntry}
                                disabled={Math.abs(totalDebit - totalCredit) >= 0.01 || !newEntry.description}
                                className="flex-[2] px-8 py-4.5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Yozuvni Saqlash (Save Entry)
                            </button>
                          </div>
                      </div>

                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
}
