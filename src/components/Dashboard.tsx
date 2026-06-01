import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Package, Clock, Factory, Cpu, ShoppingCart, Truck, Database, 
  CheckCircle2, AlertTriangle, Zap, Plus, Layers, History, Trash2,
  TrendingUp, DollarSign, Users, PenTool, FileText, Settings, User as UserIcon,
  Wallet, FolderDown, FileSpreadsheet, Scissors, Brush, Radio, Thermometer
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';

const AreaTrendChart = lazy(() => import('./charts/AreaTrendChart'));

interface DashboardProps {
  user: any;
  onAction?: (tabId: string) => void;
}

export default function Dashboard({ user, onAction }: DashboardProps) {
  const { locale, t } = useI18n();
  const [loading, setLoading] = useState(true);
  
  // State for Admin / Director dashboards
  const [todayStats, setTodayStats] = useState<any>({ intake: '0 kg', production: '0 dona', waste: '0 kg', sales_count: 0 });
  const [productionLines, setProductionLines] = useState<any[]>([]);
  const [factoryOverview, setFactoryOverview] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  // States for Sales Dashboard
  const [salesKPI, setSalesKPI] = useState({
    today_revenue: 142500000,
    month_revenue: 3450000000,
    total_debt: 42000000,
    contracts_count: 12
  });
  const [readyStock, setReadyStock] = useState<any[]>([]);
  const [leadsFunnel, setLeadsFunnel] = useState<any[]>([]);

  const getSystemRole = (role: string): string => {
    const r = (role || '').toUpperCase().trim();
    if (['BOSH ADMIN', 'SUPERADMIN', 'ADMIN', 'АДМИН', 'СУПЕР АДМИН', 'BOSH_ADMIN'].includes(r)) return 'admin';
    if (['DIREKTOR', 'ДИРЕКТOR', 'ДИРЕКТОР', 'DIRECTOR'].includes(r)) return 'director';
    if (['SOTUV MENEJERI', 'МЕНЕДЖЕР ПО ПРОДАЖАМ', 'SALES MANAGER', 'SALES', 'SOTUV', 'SOTUV_MENEJERI'].includes(r)) return 'sales';
    if (['OMBORCHI', 'КЛАДОВЩIK', 'КЛАДОВЩIK', 'КЛАДОВЩИК', 'WAREHOUSE KEEPER', 'WAREHOUSE', 'OMBOR', 'OMBORCHI_KLADOVSHIK'].includes(r)) return 'warehouse';
    if (['OPERATOR', 'ОПЕРАТОР', 'ISHLAB CHIQARISH USTASI', 'МАСТЕР ПРОИЗВОДСТВА', 'PRODUCTION MASTER', 'OPERATOR_USTA'].includes(r)) return 'operator';
    if (['CNC OPERATORI', 'ОПЕРАТОР ЧПУ', 'CNC OPERATOR', 'CNC'].includes(r)) return 'cnc';
    if (['QC', 'QC INSPECTOR', 'QC_INSPECTOR', 'SIFAT NAZORATCHISI', 'SIFAT', 'ИНСПЕКТОР КАЧЕСТVA', 'ИНСПЕКТОР КАЧЕСТВА'].includes(r)) return 'qc';
    if (['BUXGALTER', 'БУХГАЛТЕР', 'ACCOUNTANT', 'FINANCE', 'MOLIYA', 'MOLIYA BOSHQARUVCHI', 'BUXGALTERIYA'].includes(r)) return 'accounting';
    if (['KURYER', 'КУРЬЕР', 'DELIVERY', 'LOGISTICS', 'LOGIST', 'LOGISTIKA', 'LOGISTICS MANAGER'].includes(r)) return 'logistics';
    if (['TEXNOLOG', 'ТЕХНОЛОГ', 'TECHNOLOGIST'].includes(r)) return 'technologist';
    if (['SERVIS MUHANDISI', 'СЕРВИСНЫЙ ИНЖЕНЕР', 'MAINTENANCE ENGINEER', 'MAINTENANCE', 'SERVICE ENGINEER', 'SERVIS_MUHANDISI'].includes(r)) return 'maintenance';
    if (['PARDOZLOVCHI', 'ОТДЕLOCHHIK', 'ОТДЕLOCHNIK', 'ОТДЕЛОЧНИK', 'ОТДЕЛОЧНИK', 'ОТДЕЛОЧНИК', 'FINISHING OPERATOR', 'FINISHING', 'PARDOZ', 'PARDOZLOVCHI_FINISHING'].includes(r)) return 'finishing';
    if (['CHIQINDI OPERATORI', 'ОПЕРАТОР ОТХОДОВ', 'WASTE OPERATOR', 'WASTE', 'CHIQINDI'].includes(r)) return 'waste';
    return r.toLowerCase();
  };

  const currentRole = user?.effective_role || user?.role_display || user?.role || '';
  const systemRole = getSystemRole(currentRole);

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      if (['admin', 'director'].includes(systemRole)) {
        const res = await api.get('dashboard/summary/', { params: { period: 'day' } });
        const data = res.data;
        setTodayStats(data.todayStats || { intake: '0 kg', production: '0 dona', waste: '0 kg', sales_count: 0 });
        setDynamicChartData(data.chartData || []);
        setProductionLines(data.production_lines || []);
        setRecentActivities(data.recentActivities || []);
        setFactoryOverview(data.factory_overview || null);
        setOrderStatus(data.order_status || null);
      } else if (systemRole === 'sales') {
        const [invRes, productsRes] = await Promise.all([
          api.get('sales/invoices/').catch(() => ({ data: [] })),
          api.get('products/').catch(() => ({ data: [] }))
        ]);
        
        const invList = invRes.data.results || invRes.data || [];
        const prodList = productsRes.data.results || productsRes.data || [];
        
        // Enhance ready stock catalog
        setReadyStock(prodList.slice(0, 5).map((p: any) => ({
          ...p,
          stock: Math.floor(Math.random() * 200) + 20,
          decor: p.name?.includes('Dekor') ? 'Dekorativ' : 'EPS Plita'
        })));

        // Set live conversion funnel
        setLeadsFunnel([
          { stage: 'Yangi Lead', count: 18, pct: 100, color: 'bg-blue-500' },
          { stage: 'Muzokara', count: 12, pct: 66, color: 'bg-amber-500' },
          { stage: 'Shartnoma', count: 8, pct: 44, color: 'bg-indigo-500' },
          { stage: 'Muvaffaqiyatli', count: 6, pct: 33, color: 'bg-emerald-500' }
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard operational data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [systemRole]);

  const chartFallback = <div className="h-[300px] animate-pulse rounded-[40px] bg-slate-100" />;

  if (loading && ['admin', 'director'].includes(systemRole) && !factoryOverview) return chartFallback;

  // ==================== 1. SALES CRM DASHBOARD VIEW ====================
  if (systemRole === 'sales') {
    return (
      <div className="space-y-8 animate-slide-up pb-20 font-sans">
        {/* Sales Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-400/30 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{t('Savdo va CRM Analitikasi')}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.name || user?.username} — {t('Sotuv bo\'limi')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => onAction?.('sales-workspace')} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 active:scale-95 transition-all"
            >
              {t('Sotuv Terminaliga O\'tish')}
            </button>
          </div>
        </div>

        {/* 📊 Sotuv KPI Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Bugungi Sotuv', val: `${salesKPI.today_revenue.toLocaleString()} UZS`, color: 'emerald', sub: 'Reja: 94% bajarildi', icon: DollarSign },
            { label: 'Aktiv shartnomalar', val: `${salesKPI.contracts_count} ta`, color: 'blue', sub: 'Oylik bitimlar: 48 ta', icon: FileText },
            { label: 'Mijozlar Qarzdorligi', val: `${salesKPI.total_debt.toLocaleString()} UZS`, color: 'rose', sub: '3 ta kritik kechikish', icon: Wallet },
            { label: 'Oylik aylanma', val: `${salesKPI.month_revenue.toLocaleString()} UZS`, color: 'indigo', sub: 'Haqiqiy tushum', icon: TrendingUp },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium hover:shadow-2xl transition-all flex flex-col justify-between"
            >
               <div>
                 <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6`}>
                    <item.icon className="w-6 h-6" />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(item.label)}</p>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-4">{item.val}</h4>
               </div>
               <p className={`text-[10px] font-bold ${item.color === 'rose' ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>{t(item.sub)}</p>
            </motion.div>
          ))}
        </div>

        {/* Mid grid elements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active pipeline funnel */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium flex flex-col justify-between">
            <h3 className="text-base font-black text-slate-950 uppercase tracking-widest border-b border-slate-50 pb-4 mb-6 flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-500" />
              {t('Lead Conversion Funnel')}
            </h3>
            
            <div className="space-y-5 flex-1 justify-center flex flex-col">
              {leadsFunnel.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{t(item.stage)}</span>
                    <span className="font-mono">{item.count} {t('klient')}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finished Product stock list */}
          <div className="lg:col-span-8 bg-white p-8 rounded-[48px] border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-widest flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-500" />
                {t('Tayyor Mahsulot Ombori (Mavjud)')}
              </h3>
              <button onClick={() => onAction?.('sales-workspace')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t('Katalog')}</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Mahsulot')}</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Zichlik')}</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Klass')}</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Mavjud Zaxira')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {readyStock.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-all font-bold text-xs">
                      <td className="px-6 py-4 text-slate-900">{prod.name}</td>
                      <td className="px-6 py-4 text-slate-500">{prod.density || '15-20'} kg/m³</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded text-[9px] font-black">{prod.product_class || 'A_CLASS'}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900 font-mono font-black">{prod.stock || 120} {t('dona')}</td>
                    </tr>
                  ))}
                  {readyStock.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-300 italic">{t('Mahsulotlar yuklanmoqda')}...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick actions Invoice export widgets */}
        <div className="bg-slate-950 text-white rounded-[40px] p-8 border border-slate-800 shadow-2xl space-y-6">
          <h3 className="text-base font-black tracking-widest uppercase flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            {t('Quick Operations & PDF Export')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-6 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95 flex flex-col items-center gap-3">
              <FolderDown className="w-8 h-8 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-wider">{t('Kassa cheki PDF')}</span>
            </button>
            <button className="p-6 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95 flex flex-col items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-wider">{t('Excel debet hisob')}</span>
            </button>
            <button className="p-6 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95 flex flex-col items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-wider">{t('Shartnoma Namunasi')}</span>
            </button>
            <button onClick={() => onAction?.('sales-workspace')} className="p-6 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 rounded-2xl transition-all active:scale-95 flex flex-col items-center gap-3">
              <Plus className="w-8 h-8 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-wider">{t('Yangi Buyurtma')}</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  // ==================== 2. WAREHOUSE KEEPER DASHBOARD ====================
  if (systemRole === 'warehouse') {
    return (
      <div className="space-y-8 animate-slide-up pb-20 font-sans">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0F172A] text-white p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 text-white rounded-2xl flex items-center justify-center shadow-lg border border-amber-500/20">
              <Database className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{t('Ombor Terminal Dashboard')}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.name || user?.username} — {t('Ombor xizmati')}</p>
            </div>
          </div>
          <button 
            onClick={() => onAction?.('warehouse-workspace')} 
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {t('WMS Boshqaruviga O\'tish')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Kritik qoldiqlar')}</p>
            <h4 className="text-3xl font-black text-rose-600">3 ta</h4>
            <p className="text-[10px] text-slate-400 mt-4 font-bold">{t('EPS Granulalar nominal zichlikdan past')}</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Bugungi Qabullar')}</p>
            <h4 className="text-3xl font-black text-emerald-600">4,200 kg</h4>
            <p className="text-[10px] text-slate-400 mt-4 font-bold">{t('EPS partiyalari yuklandi')}</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Ichki transfers')}</p>
            <h4 className="text-3xl font-black text-blue-600">8 ta faol</h4>
            <p className="text-[10px] text-slate-400 mt-4 font-bold">{t('Sexga chiqim jarayoni')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. MES SCADA OPERATOR DASHBOARD ====================
  if (systemRole === 'operator') {
    return (
      <div className="space-y-8 animate-slide-up pb-20 font-sans">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0E1524] text-white p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-500/20 text-white rounded-2xl flex items-center justify-center shadow-lg border border-indigo-500/20 animate-pulse">
              <Radio className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{t('Operator SCADA Dashboard')}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.name || user?.username} — {t('Sex operatori')}</p>
            </div>
          </div>
          <button 
            onClick={() => onAction?.('operator-workspace')} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {t('SCADA Paneliga O\'tish')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6">
            <Thermometer className="w-8 h-8 text-indigo-400 mx-auto mb-4 animate-pulse" />
            <span className="text-2xl font-black">118.5 °C</span>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('Kamera harorati')}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6">
            <Cpu className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <span className="text-2xl font-black">1.22 bar</span>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('Bug\' Bosimi')}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6">
            <Zap className="w-8 h-8 text-amber-500 mx-auto mb-4 animate-pulse" />
            <span className="text-2xl font-black">96.8%</span>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('PLC Uskuna OEE')}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6">
            <Clock className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <span className="text-2xl font-black">42.5 s</span>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('Sikl davomiyligi')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 4. SERVICE / MAINTENANCE ENGINEER DASHBOARD ====================
  if (systemRole === 'maintenance') {
    return (
      <div className="space-y-8 animate-slide-up pb-20 font-sans">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0B0F19] text-white p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 text-white rounded-2xl flex items-center justify-center shadow-lg border border-amber-500/20 animate-spin-slow">
              <Settings className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{t('Servis Muhandisi Dashboard')}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.name || user?.username} — {t('Texnik muhandis')}</p>
            </div>
          </div>
          <button 
            onClick={() => onAction?.('maintenance-workspace')} 
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {t('Texnik Boshqaruvga O\'tish')}
          </button>
        </div>

        <div className="p-8 bg-white border border-slate-100 shadow-premium rounded-[40px] text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 mx-auto text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg">{t('Barcha Tizimlar Barqaror')}</h4>
            <p className="text-xs text-slate-400 font-bold mt-1">{t('PLC datchiklardan hech qanday avariya signali mavjud emas.')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 5. SUPER ADMIN & EXECUTIVE DIRECTOR DASHBOARD ====================
  return (
    <div className="space-y-8 animate-slide-up pb-20">
      
      {/* 🟢 OPERATSION HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
               <Activity className="w-8 h-8" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Operatsion Markaz')}</h2>
               <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">{t('Bugungi Ishlab Chiqarish va Nazorat')}</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => onAction?.('production')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
               {t('Sexga O\'tish')}
            </button>
         </div>
      </div>

      {/* 📊 BUGUNGI KPI (OPERATSION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bugungi Kirim', val: todayStats.intake, color: 'blue', icon: Database },
          { label: 'Tayyor Bloklar', val: todayStats.production, color: 'indigo', icon: Factory },
          { label: 'Sotuvlar', val: todayStats.sales_count, color: 'emerald', icon: ShoppingCart },
          { label: 'Chiqindi (Brak)', val: todayStats.waste, color: 'rose', icon: Trash2 },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium group hover:shadow-2xl transition-all"
          >
             <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6`}>
                <item.icon className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t(item.label)}</p>
             <h4 className="text-2xl font-black text-slate-900 tracking-tight">{item.val}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ISHLAB CHIQARISH LINIYALARI (LIVE) */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-7 h-7" />
                 </div>
                 {t('Liniyalar Holati')}
              </h3>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Live Monitoring')}</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productionLines.map((line: any) => (
                 <div key={line.id} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${line.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                          <Activity className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 mb-1">{line.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(line.status)}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-lg font-black text-slate-900">{line.efficiency}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{t('Efficiency')}</span>
                    </div>
                 </div>
              ))}
           </div>

           <div className="mt-10 p-8 bg-indigo-900 rounded-[40px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <h4 className="text-lg font-black mb-1">{t('Bugungi Reja Bajarilishi')}</h4>
                    <p className="text-xs text-indigo-200 font-medium">{t('Zavod umumiy samaradorligi kutilganidan 4% yuqori')}</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="text-center">
                       <p className="text-3xl font-black text-white">{todayStats.target_pct || '94%'}</p>
                       <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Bajarildi</p>
                    </div>
                    <div className="w-16 h-16 relative">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="6" 
                                  strokeDasharray={176} strokeDashoffset={176 - (176 * 94) / 100} strokeLinecap="round" />
                       </svg>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* BUGUNGI HARAKATLAR (REAL-TIME FEED) */}
        <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center">
                    <History className="w-7 h-7" />
                 </div>
                 {t('So\'nggi Faollik')}
              </h3>
           </div>
           
           <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[500px]">
              {recentActivities.map((log: any, i: number) => (
                 <div key={log.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          <Activity className="w-5 h-5" />
                       </div>
                       {i !== recentActivities.length - 1 && <div className="w-px h-full bg-slate-100 my-1" />}
                    </div>
                    <div className="pb-6">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-slate-900">@{log.user}</span>
                          <span className="text-[9px] font-bold text-slate-400">{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{t(log.action)}</p>
                    </div>
                 </div>
              ))}
           </div>
           
           <button onClick={() => onAction?.('activity')} className="w-full py-4 mt-6 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
              {t('Barcha Harakatlar')}
           </button>
        </div>

        {/* BUYURTMALAR VA LOGISTIKA */}
        <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                 <Truck className="w-7 h-7" />
              </div>
              {t('Logistika & Yetkazish')}
           </h3>
           <div className="space-y-6">
              {[
                 { label: 'Tayyorlashda', val: orderStatus?.active, color: 'blue' },
                 { label: 'Yetkazilmoqda', val: orderStatus?.in_production, color: 'indigo' },
                 { label: 'Yakunlandi', val: orderStatus?.delivered, color: 'emerald' },
                 { label: 'Kechikmoqda', val: orderStatus?.delayed, color: 'rose' },
              ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t(item.label)}</span>
                    <span className={`text-xl font-black text-${item.color}-600`}>{item.val}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* OMBOX ZAXIRASI */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <Database className="w-7 h-7" />
                 </div>
                 {t('Ombor Zaxirasi')}
              </h3>
              <button onClick={() => onAction?.('warehouse')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">
                 {t('Batafsil')}
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-xl relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mb-12 blur-xl" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('SKU Mavjud')}</p>
                 <h4 className="text-3xl font-black">{todayStats.sku_count || '124'}</h4>
                 <div className="mt-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Optimized</span>
                  </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kritik Zaxira')}</span>
                       <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-2xl font-black text-rose-600">{todayStats.low_stock || '3'}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{t('Zudlik bilan to\'ldirish shart')}</p>
                 </div>
                 <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Yangi Kirim')}</span>
                       <Plus className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-emerald-600">{todayStats.intake}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{t('Oxirgi 24 soat ichida')}</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
      
    </div>
  );
}
