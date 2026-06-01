import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  User as UserIcon,
  Tag,
  MessageSquare,
  X,
  CheckCircle2,
  Calendar,
  ArrowLeftRight,
  Building2,
  Paperclip,
  Users,
  LayoutDashboard,
  History,
  AlertCircle,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, 
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
    Cashbox, ExpenseCategory, FinancialTransaction, 
    User, InternalTransfer, ClientBalance 
} from '../types';
import api from '../lib/api';
import { uiStore } from '../lib/store';
import { useI18n } from '../i18n';

import TransactionDrawer from './finance/TransactionDrawer';
import CategoryManager from './finance/CategoryManager';
import ProjectCosting from './finance/ProjectCosting';

interface FinanceProps {
  user: User;
}

export default function Finance({ user }: FinanceProps) {
  const { locale, t } = useI18n();
  const currentRole = user.effective_role || user.role_display || user.role;
  const canManageTransfers = ['Bosh Admin', 'Admin'].includes(currentRole) || !!user.is_superuser;
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [balances, setBalances] = useState<ClientBalance[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'TRANSFERS' | 'DEBTS' | 'PL' | 'CATEGORIES' | 'PROJECTS'>('DASHBOARD');
  const [debtType, setDebtType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [isAdding, setIsAdding] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedCashbox, setSelectedCashbox] = useState<Cashbox | null>(null);
  
  const [isManagingAccounts, setIsManagingAccounts] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<number | null>(null);

  const [transferData, setTransferData] = useState({
    from_cashbox: '',
    to_cashbox: '',
    amount: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      const [cbRes, transRes, catRes, transferRes, balanceRes, analyticsRes, customerRes] = await Promise.all([
        api.get('finance/cashboxes/'),
        api.get('finance/transactions/'),
        api.get('finance/categories/'),
        canManageTransfers ? api.get('finance/transfers/') : Promise.resolve({ data: [] }),
        api.get('finance/client-balances/'),
        api.get('finance/analytics/'),
        api.get('sales/customers/')
      ]);
      setCashboxes(cbRes.data.results || cbRes.data);
      setTransactions(transRes.data.results || transRes.data);
      setCategories(catRes.data.results || catRes.data);
      setTransfers(transferRes.data.results || transferRes.data);
      setBalances(balanceRes.data.results || balanceRes.data);
      setAnalytics(analyticsRes.data);
      setCustomers(customerRes.data.results || customerRes.data);
    } catch (err) {
      console.error("Failed to fetch finance data", err);
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('finance/transfers/', transferData);
      uiStore.showNotification(t("O'tkazma muvaffaqiyatli bajarildi"), "success");
      setIsTransferring(false);
      setTransferData({ from_cashbox: '', to_cashbox: '', amount: '', description: '' });
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || t("Xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    uiStore.showNotification(t("Hisobot tayyorlanmoqda..."), "info");
    try {
      const response = await api.get('finance/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'finance_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      uiStore.showNotification(t("Eksport qilishda xatolik"), "error");
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(Math.round(n));

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'CANCELLED': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  if (loading && !analytics) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Moliya ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                    <Wallet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('finance.control_center')}</h1>
            </div>
            <p className="text-slate-500 font-semibold ml-14">{t("Real-vaqtdagi pul oqimi va moliya nazorati")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTransferring(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm text-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Ichki o'tkazma
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 text-sm"
          >
            <Plus className="w-5 h-5" />
            Yangi operatsiya
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[24px] w-fit overflow-x-auto custom-scrollbar no-scrollbar border border-slate-200/50">
        {[
          { id: 'DASHBOARD', label: t('Umumiy'), icon: LayoutDashboard },
          { id: 'TRANSACTIONS', label: t('finance.ledger'), icon: History },
          { id: 'DEBTS', label: t('Qarzdorlik'), icon: AlertCircle },
          { id: 'PROJECTS', label: t('finance.profitability'), icon: TrendingUp },
          { id: 'CATEGORIES', label: t('Kategoriyalar'), icon: Tag },
          { id: 'TRANSFERS', label: t("O'tkazmalar"), icon: ArrowLeftRight },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'DASHBOARD' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Operational Alerts */}
            {analytics?.alerts?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.alerts.map((alert: any, idx: number) => (
                        <div key={idx} className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-start gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">{alert.title}</h4>
                                <p className="text-sm text-amber-700 font-semibold mt-1">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Liquidity Pool */}
              <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{t('finance.liquidity_pool')}</p>
                            <h2 className="text-5xl font-black tabular-nums tracking-tighter">
                                {fmt(analytics?.total_balance || 0)} <span className="text-2xl text-slate-500">UZS</span>
                            </h2>
                        </div>
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/10">
                            <Building2 className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-[24px]">
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">{t('finance.inflow')}</p>
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                <span className="text-lg font-black">{fmt(analytics?.monthly_inflow || 0)}</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-[24px]">
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">{t('finance.outflow')}</p>
                            <div className="flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                                <span className="text-lg font-black">{fmt(analytics?.monthly_outflow || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative element */}
                <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
              </div>

              {/* Net Profit Card */}
              <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">+12.5%</span>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('finance.net_profit')}</p>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{fmt(analytics?.net_profit || 0)}</h3>
                </div>
                <div className="h-24 w-full mt-4 min-h-[96px] min-w-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.profit_trend || []}>
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>

              {/* Cashflow Score */}
              <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm">
                 <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                 </div>
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('Likvidlik holati')}</p>
                 <div className="flex items-end gap-2 mb-4">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">84</h3>
                    <span className="text-sm font-bold text-slate-400 pb-1">/ 100</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }} />
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold mt-3 uppercase tracking-wider">{t('finance.health.label')}: <span className="text-emerald-600">{t('finance.health.excellent')}</span></p>
              </div>
            </div>

            {/* Cashflow Forecast vs Actual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border-2 border-slate-100 rounded-[40px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-wider">{t('finance.forecast')}</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">{t('Haqiqiy va kutilayotgan tushum (30 kun)')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">{t('Haqiqiy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-200" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">{t('Prognoz')}</span>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.forecast_data || []}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                      />
                      <Area type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" />
                      <Area type="monotone" dataKey="forecast" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Debt Aging */}
              <div className="bg-white border-2 border-slate-100 rounded-[40px] p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase tracking-wider">{t('Qarzdorlik tahlili (Aging)')}</h3>
                <div className="space-y-6">
                    {analytics?.debt_aging?.map((item: any) => (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">{item.label}</span>
                                <span className="text-slate-900">{fmt(item.amount)}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percent}%` }}
                                    className={`h-full rounded-full ${item.color}`}
                                />
                            </div>
                        </div>
                    ))}
                    
                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <div className="p-4 bg-rose-50 rounded-[24px] border border-rose-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{t('Kechikkan qarzdorlik')}</span>
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                            </div>
                            <p className="text-2xl font-black text-rose-900">{fmt(analytics?.critical_debt || 0)}</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Cashbox Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">{t('Likvidlik tugunlari (Kassalar)')}</h3>
                    <button onClick={() => setIsManagingAccounts(true)} className="text-xs font-black text-blue-600 hover:underline">{t('finance.manage_accounts')}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cashboxes.map(box => (
                        <motion.div 
                            key={box.id}
                            whileHover={{ y: -5 }}
                            className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm group hover:border-blue-200 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${box.type === 'CASH' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {box.type === 'CASH' ? <Banknote className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${box.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {box.is_active ? t('status.active') : t('status.inactive')}
                                </span>
                            </div>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{box.name}</h4>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter mt-1">{fmt(box.balance)}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Last activity: {new Date().toLocaleDateString()}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Qidirish (tavsif, mijoz, kategoriya)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => uiStore.showNotification(t("Filtrlar menyusi ochilmoqda..."), "info")} className="p-4 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-all text-slate-600">
                            <Filter className="w-5 h-5" />
                        </button>
                        <button onClick={handleDownloadExcel} className="p-4 bg-slate-50 border border-slate-200 rounded-[20px] hover:bg-slate-100 transition-all text-slate-600">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-2 text-left">Status</th>
                                <th className="px-6 py-2 text-left">Sana / Vaqt</th>
                                <th className="px-6 py-2 text-left">Tavsif</th>
                                <th className="px-6 py-2 text-left">Kategoriya</th>
                                <th className="px-6 py-2 text-right">Summa</th>
                                <th className="px-6 py-2 text-center">Hujjat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(trans => (
                                <motion.tr 
                                    key={trans.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    <td className="px-6 py-5 first:rounded-l-[24px] bg-white border-y-2 border-l-2 border-slate-100 group-hover:border-blue-100">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border ${getStatusColor(trans.status)}`}>
                                            {trans.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y-2 border-slate-100 group-hover:border-blue-100">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900">{new Date(trans.created_at).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(trans.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y-2 border-slate-100 group-hover:border-blue-100 max-w-xs">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 truncate">{trans.description || 'Tavsif yo\'q'}</span>
                                            {trans.customer_name && (
                                                <span className="text-[10px] text-blue-600 font-black flex items-center gap-1 mt-1 uppercase tracking-wider">
                                                    <UserIcon className="w-3 h-3" /> {trans.customer_name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y-2 border-slate-100 group-hover:border-blue-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{trans.category_name || 'BOSHQA'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y-2 border-slate-100 group-hover:border-blue-100 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-base font-black tabular-nums ${trans.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {trans.type === 'INCOME' ? '+' : '-'}{fmt(trans.amount)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{trans.cashbox_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 last:rounded-r-[24px] bg-white border-y-2 border-r-2 border-slate-100 group-hover:border-blue-100 text-center">
                                        <button onClick={() => uiStore.showNotification(t("Hujjat yuklash tizimi ishga tushirilmoqda"), "info")} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'DEBTS' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] w-fit border-2 border-slate-100 shadow-sm">
                <button 
                    onClick={() => setDebtType('CUSTOMER')}
                    className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${debtType === 'CUSTOMER' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Mijozlar Qarzi
                </button>
                <button 
                    onClick={() => setDebtType('SUPPLIER')}
                    className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${debtType === 'SUPPLIER' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Yetkazib Beruvchilar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {balances.filter(b => debtType === 'CUSTOMER' ? b.balance < 0 : b.balance > 0).map(b => (
                    <motion.div 
                        key={b.customer_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-[22px] flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-slate-900 tracking-tight">{b.customer_name}</h4>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('Mijoz')}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Balans')}</p>
                                <p className={`text-2xl font-black ${b.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {fmt(Math.abs(b.balance))} <span className="text-sm">UZS</span>
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => setSelectedClientForHistory(b.customer_id)} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">History</button>
                                <button onClick={() => handleDownloadExcel()} className="flex-1 px-4 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Statement</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'TRANSFERS' && (
          <div className="space-y-6">
             <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">From</th>
                                <th className="px-6 py-4 text-center"><ArrowLeftRight className="w-4 h-4 mx-auto" /></th>
                                <th className="px-6 py-4 text-left">To</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-left">Performed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map(tr => (
                                <tr key={tr.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{new Date(tr.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-slate-900">{tr.from_cashbox_name}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-slate-900">{tr.to_cashbox_name}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-base font-black text-blue-600 tabular-nums">{fmt(tr.amount)}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-500 font-semibold">{tr.performed_by_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'CATEGORIES' && (
            <CategoryManager categories={categories} onRefresh={fetchData} />
        )}

        {activeTab === 'PROJECTS' && (
            <ProjectCosting onRefresh={fetchData} />
        )}
      </AnimatePresence>

      {/* Footer Status Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-2xl z-40">
        <div className="flex items-center gap-6 px-4">
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Umumiy Aktivlar")}</span>
                <span className="text-sm font-black text-white">{fmt(analytics?.total_balance || 0)} UZS</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Mavjud Kredit")}</span>
                <span className="text-sm font-black text-emerald-400">∞</span>
            </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" className="w-full h-full object-cover grayscale" />
                    </div>
                ))}
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Live</span>
                <span className="text-[10px] font-black text-slate-300">Finance Team</span>
            </div>
        </div>
      </div>

      {/* Transaction Drawer */}
      <TransactionDrawer 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        onSuccess={fetchData}
        cashboxes={cashboxes}
        categories={categories}
        customers={customers}
        user={user}
      />

      {/* Internal Transfer Modal */}
      <AnimatePresence>
        {isTransferring && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransferring(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                    <ArrowLeftRight className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ichki O'tkazma</h3>
                </div>
                <button onClick={() => setIsTransferring(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleTransfer} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Qayerdan</label>
                        <select 
                            required
                            value={transferData.from_cashbox}
                            onChange={(e) => setTransferData({...transferData, from_cashbox: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm"
                        >
                            <option value="">Tanlang</option>
                            {cashboxes.map(cb => (
                                <option key={cb.id} value={cb.id}>{cb.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Qayerga</label>
                        <select 
                            required
                            value={transferData.to_cashbox}
                            onChange={(e) => setTransferData({...transferData, to_cashbox: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm"
                        >
                            <option value="">Tanlang</option>
                            {cashboxes.map(cb => (
                                <option key={cb.id} value={cb.id}>{cb.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Summa (UZS)</label>
                    <input 
                        required
                        type="number" 
                        value={transferData.amount}
                        onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-slate-900 shadow-inner"
                        placeholder="0.00"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tavsif / Sabab</label>
                    <textarea 
                        value={transferData.description}
                        onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[22px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm resize-none"
                        placeholder="O'tkazma sababi..."
                        rows={3}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsTransferring(false)} className="flex-1 px-8 py-4.5 border border-slate-200 text-slate-600 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all text-xs">Bekor qilish</button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[1.5] px-8 py-4.5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all text-xs disabled:opacity-50"
                  >
                    {loading ? 'O\'tkazilmoqda...' : 'O\'tkazishni Tasdiqlash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Management Modal */}
      <AnimatePresence>
        {isManagingAccounts && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsManagingAccounts(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('finance.manage_accounts')}</h3>
                </div>
                <button onClick={() => setIsManagingAccounts(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {cashboxes.map(cb => (
                  <div key={cb.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all">
                    <div>
                      <h4 className="font-bold text-slate-900">{cb.name}</h4>
                      <p className="text-sm font-semibold text-slate-500">{t(cb.type === 'CASH' ? 'Naqd' : 'Perezich')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{fmt(cb.balance)} UZS</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${cb.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {cb.is_active ? t('Faol') : t('Nofaol')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={() => uiStore.showNotification(t("Yangi kassa qo'shish API orqali amalga oshiriladi"), "info")} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
                  + Yangi Kassa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client History Modal */}
      <AnimatePresence>
        {selectedClientForHistory !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedClientForHistory(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                    <History className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tranzaksiyalar Tarixi</h3>
                </div>
                <button onClick={() => setSelectedClientForHistory(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-4 py-3 rounded-tl-xl">Sana</th>
                      <th className="px-4 py-3">Tavsif</th>
                      <th className="px-4 py-3">Summa</th>
                      <th className="px-4 py-3 rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(t => t.customer === selectedClientForHistory).map(trans => (
                      <tr key={trans.id} className="border-b border-slate-50">
                        <td className="px-4 py-4 text-sm font-bold text-slate-600">{new Date(trans.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-900">{trans.description}</td>
                        <td className={`px-4 py-4 text-base font-black ${trans.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trans.type === 'INCOME' ? '+' : '-'}{fmt(trans.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${getStatusColor(trans.status)}`}>{trans.status}</span>
                        </td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.customer === selectedClientForHistory).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-bold">Hech qanday tranzaksiya topilmadi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
    </svg>
);
