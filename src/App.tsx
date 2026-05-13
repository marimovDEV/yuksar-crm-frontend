import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, 
  Package, 
  Factory, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Search, 
  Bell, 
  User as UserIcon,
  ChevronRight,
  Activity,
  Database,
  Truck,
  Layers,
  Scissors,
  Trash2,
  Brush,
  CheckCircle2,
  FileText,
  QrCode,
  Wallet,
  Calculator as CalculatorIcon,
  Box,
  ArrowRight,
  AlertOctagon,
  FileWarning,
  Target,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { User, UserRole } from './types';
import LanguageSwitcher from './components/LanguageSwitcher';
import Toast from './components/Toast';
import NotificationDropdown from './components/NotificationDropdown';
import { authService } from './lib/authService';
import api from './lib/api';
import { uiStore } from './lib/store';
import { useI18n } from './i18n';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import FAB from './components/layout/FAB';

const Dashboard = lazy(() => import('./components/Dashboard'));
const WarehouseUnified = lazy(() => import('./components/WarehouseUnified'));
const ProductionFloor = lazy(() => import('./components/ProductionFloor'));
const Sales = lazy(() => import('./components/Sales'));
const Clients = lazy(() => import('./components/Clients'));
const CNC = lazy(() => import('./components/CNC'));
const Finishing = lazy(() => import('./components/Finishing'));
const Waste = lazy(() => import('./components/Waste'));
const Reports = lazy(() => import('./components/Reports'));
const StaffManagement = lazy(() => import('./components/StaffManagement'));
const AdminActivity = lazy(() => import('./components/AdminActivity'));
const QualityControl = lazy(() => import('./components/QualityControl'));
const CourierDashboard = lazy(() => import('./components/CourierDashboard'));
const ProductionOrderManagement = lazy(() => import('./components/ProductionOrderManagement'));
const Documents = lazy(() => import('./components/Documents'));
const QRScanner = lazy(() => import('./components/QRScanner'));
const Finance = lazy(() => import('./components/Finance'));
const Contracts = lazy(() => import('./components/Contracts'));
const Debtors = lazy(() => import('./components/DebtDashboard'));
const Accounting = lazy(() => import('./components/Accounting'));
const BudgetManager = lazy(() => import('./components/BudgetManager'));
const Compliance = lazy(() => import('./components/Compliance'));
const Alerts = lazy(() => import('./components/Alerts'));
const ExecutiveDashboard = lazy(() => import('./components/ExecutiveDashboard'));
const ProfitabilityDashboard = lazy(() => import('./components/ProfitabilityDashboard'));
const MasterData = lazy(() => import('./components/MasterData'));
const InternalTransfers = lazy(() => import('./components/InternalTransfers'));
const Suppliers = lazy(() => import('./components/Suppliers'));
const PurchaseOrders = lazy(() => import('./components/PurchaseOrders'));
const DebtorsManagement = lazy(() => import('./components/Debtors'));
const FleetManagement = lazy(() => import('./components/FleetManagement'));
const LeadManagement = lazy(() => import('./components/LeadManagement'));
const DealerManagement = lazy(() => import('./components/DealerManagement'));
const DynamicPricing = lazy(() => import('./components/DynamicPricing'));
const Payroll = lazy(() => import('./components/Payroll'));
const UserGuide = lazy(() => import('./components/UserGuide'));
const POS = lazy(() => import('./components/sales/POS'));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null as any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare props: Readonly<{ children: any }>;
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center gap-6 bg-rose-50 rounded-[40px] border-2 border-rose-100 m-8 shadow-2xl">
          <div className="w-24 h-24 bg-rose-500 rounded-[32px] flex items-center justify-center shadow-xl shadow-rose-200">
            <FileWarning className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Tizimda xatolik yuz berdi</h2>
            <p className="text-slate-500 font-medium max-w-md">Kechirasiz, ushbu sahifani yuklashda muammo paydo bo'ldi. Iltimos, boshqa bo'limga o'ting yoki sahifani yangilang.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-slate-900 text-white rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string | null>(null); // Accordion state
  const currentRole = user?.effective_role || user?.role_display || user?.role || '';
  const isPrivilegedUser = !!(user?.is_superuser || ['Bosh Admin', 'SuperAdmin', 'Admin', 'SUPERADMIN', 'ADMIN'].includes(currentRole));

  const navigationGroups = [
    {
      id: 'main',
      title: null,
      items: [
        { id: 'dashboard', name: t('Boshqaruv Paneli'), icon: LayoutDashboard, roles: ['Bosh Admin', 'Omborchi', 'Ishlab chiqarish ustasi', 'CNC operatori', 'Pardozlovchi', 'Chiqindi operatori', 'Sotuv menejeri', 'Kuryer'] },
        { id: 'exec-dashboard', name: t('Direktor Paneli'), icon: Target, roles: ['Bosh Admin'] },
      ]
    },
    {
      id: 'warehouse-unified',
      title: t('1. Ombor Tizimi'),
      icon: Database,
      items: [
        { id: 'warehouse', name: t('Ombor Boshqaruvi'), icon: Database, roles: ['Bosh Admin', 'Omborchi', 'Ishlab chiqarish ustasi', 'CNC operatori', 'Sotuv menejeri'] },
        { id: 'transfers', name: t('Ichki O\'tkazmalar'), icon: Truck, roles: ['Bosh Admin', 'Omborchi'] },
      ]
    },
    {
      id: 'production-main',
      title: t('2. Ishlab Chiqarish'),
      icon: Factory,
      items: [
        { id: 'production-orders', name: t('Ishlab Chiqarish Buyurtmalari'), icon: FileText, roles: ['Bosh Admin', 'Ishlab chiqarish ustasi'] },
        { id: 'production', name: t('Ishlab Chiqarish Poligoni'), icon: Factory, roles: ['Bosh Admin', 'Ishlab chiqarish ustasi', 'CNC operatori', 'Pardozlovchi', 'Chiqindi operatori'] },
        { id: 'qc', name: t('Sifat Nazorati (QC)'), icon: CheckCircle2, roles: ['Bosh Admin', 'Ishlab chiqarish ustasi'] },
      ]
    },
    {
      id: 'procurement',
      title: t('3. Ta\'minot & Xarid'),
      icon: ShoppingCart,
      items: [
        { id: 'suppliers', name: t('Ta\'minotchilar'), icon: UserIcon, roles: ['Bosh Admin', 'Omborchi'] },
        { id: 'purchase-orders', name: t('Xarid Buyurtmalari'), icon: FileText, roles: ['Bosh Admin', 'Omborchi'] },
      ]
    },
    {
      id: 'sales-main',
      title: t('4. Sotuv & CRM'),
      icon: ShoppingCart,
      items: [
        { id: 'sales', name: t('Sotuvlar'), icon: ShoppingCart, roles: ['Bosh Admin', 'Sotuv menejeri'] },
        { id: 'clients', name: t('Mijozlar & CRM'), icon: UserIcon, roles: ['Bosh Admin', 'Sotuv menejeri'] },
        { id: 'debtors', name: t('Qarzdorlar Nazorati'), icon: Wallet, roles: ['Bosh Admin', 'Sotuv menejeri'] },
        { id: 'leads', name: t('Leadlar & CRM'), icon: UserIcon, roles: ['Bosh Admin', 'Sotuv menejeri'] },
        { id: 'dealers', name: t('Dilerlar'), icon: UserIcon, roles: ['Bosh Admin', 'Sotuv menejeri'] },
        { id: 'pricing', name: t('Narx Siyosati'), icon: Target, roles: ['Bosh Admin', 'Sotuv menejeri'] },
        { id: 'pos-catalog', name: t('POS & Katalog'), icon: LayoutGrid, roles: ['Bosh Admin', 'Sotuv menejeri'] },
      ]
    },
    {
      id: 'finance-accounting',
      title: t('5. Moliya & Buxgalteriya'),
      icon: Wallet,
      items: [
        { id: 'finance', name: t('Moliya & Kassa'), icon: Wallet, roles: ['Bosh Admin', 'Moliya boshqaruvchi'] },
        { id: 'accounting', name: t('Buxgalteriya'), icon: CalculatorIcon, roles: ['Bosh Admin', 'Buxgalter'] },
        { id: 'profit-analytics', name: t('Foyda Analitikasi'), icon: BarChart3, roles: ['Bosh Admin', 'Buxgalter'] },
        { id: 'payroll', name: t('Ish Haqi'), icon: Wallet, roles: ['Bosh Admin', 'Moliya boshqaruvchi', 'Buxgalter'] },
      ]
    },
    {
      id: 'master-data',
      title: t('6. Master Data'),
      icon: Database,
      items: [
        { id: 'recipes', name: t('Retseptlar & Normalar'), icon: Layers, roles: ['Bosh Admin', 'Ishlab chiqarish ustasi'] },
        { id: 'products', name: t('Mahsulot Katalogi'), icon: Box, roles: ['Bosh Admin', 'Sotuv menejeri'] },
      ]
    },
    {
      id: 'logistics-group',
      title: t('7. Logistika'),
      icon: Truck,
      items: [
        { id: 'logistics', name: t('Yetkazish'), icon: Truck, roles: ['Bosh Admin', 'Kuryer', 'Sotuv menejeri'] },
        { id: 'fleet', name: t('Transport Parki'), icon: Truck, roles: ['Bosh Admin'] },
      ]
    },
    {
      id: 'system-admin',
      title: t('8. Tizim Boshqaruvi'),
      icon: Settings,
      items: [
        { id: 'staff', name: t('Xodimlar'), icon: UserIcon, roles: ['Bosh Admin'] },
        { id: 'compliance', name: t('Hujjatlar & Soliq'), icon: FileText, roles: ['Bosh Admin'] },
        { id: 'documents', name: t('Hujjatlar Jurnali'), icon: FileText, roles: ['Bosh Admin', 'Omborchi', 'Ishlab chiqarish ustasi', 'Sotuv menejeri', 'Kuryer'] },
        { id: 'activity', name: t('Tizim Faolligi'), icon: Activity, roles: ['Bosh Admin'] },
        { id: 'alerts', name: t('Xabarnomalar'), icon: Bell, roles: ['Bosh Admin'] },
      ]
    },
    {
      id: 'user-guide',
      title: null,
      items: [
        { id: 'guide', name: t('Foydalanish qo\'llanmasi'), icon: BookOpen, roles: ['Bosh Admin', 'Admin', 'Sotuv menejeri', 'Omborchi', 'Ishlab chiqarish ustasi'] },
      ]
    }
  ];
  
  // Security Guard: Reset tab if not authorized
  useEffect(() => {
    if (user && activeTab !== 'dashboard') {
      const allItems = navigationGroups.flatMap(g => g.items);
      const isAllowed = allItems.some(item => item.id === activeTab && (!item.roles || isPrivilegedUser || item.roles.includes(currentRole)));
      if (!isAllowed) {
        console.warn(`Unauthorized tab access attempted: ${activeTab}. Redirecting to dashboard.`);
        setActiveTab('dashboard');
      }
    }
  }, [user, activeTab, currentRole, isPrivilegedUser]);

  useEffect(() => {
    const unsub = uiStore.subscribe(() => {
      setGlobalLoading(uiStore.isLoading);
    });

    // Safety Timeout: Auto-clear loading after 8s to prevent UI freeze
    let timeout: any;
    if (globalLoading) {
      timeout = setTimeout(() => {
        setGlobalLoading(false);
        if (uiStore.isLoading) {
          uiStore.setLoading(false);
          uiStore.showNotification("Tizim javobi kechikmoqda...", "info");
        }
      }, 8000);
    }

    return () => {
      unsub();
      if (timeout) clearTimeout(timeout);
    };
  }, [globalLoading]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { access } = authService.getTokens();
        if (!access || access === 'null' || access === 'undefined' || access.length < 10) {
          setIsCheckingAuth(false);
          return;
        }

        const response = await api.get('users/me/');
        const userData = response.data;
        
        const parseWarehouses = (data: any) => {
          let assigned = data.assigned_warehouses || data.assignedWarehouses || [];
          if (Array.isArray(assigned)) {
            return assigned.map(Number);
          }
          if (typeof assigned === 'string' && assigned === '*') {
            return ['*'];
          }
          return [];
        };

        const assigned = parseWarehouses(userData);
        const normalizedRole = userData.effective_role || userData.role_display || userData.role;
        const finalUser = {
          ...userData,
          role: normalizedRole,
          effective_role: normalizedRole,
          name: userData.name || userData.full_name || userData.username,
          assignedWarehouses: assigned
        };

        const isPrivileged = (['Bosh Admin', 'SuperAdmin', 'Admin', 'SUPERADMIN', 'ADMIN'].includes(normalizedRole) || userData.is_superuser);
        if (isPrivileged) {
          finalUser.assignedWarehouses = ['*'];
        }
        setUser(finalUser);
      } catch (err) {
        console.error("Auth initialization failed:", err);
        authService.logout();
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    initAuth();
  }, []);

  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Mobile check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setGlobalLoading(true);
    const cleanUsername = (username.trim().startsWith('@') ? username.trim().substring(1) : username.trim()).toLowerCase();
    
    console.log("🔑 Attempting login for:", cleanUsername);
    
    try {
      const { user } = await authService.login(cleanUsername, password);
      setUser(user);
    } catch (err: any) {
      const errorData = err.response?.data;
      console.error("❌ Login Error Details:", errorData || err.message);
      setAuthError(t(errorData?.detail || errorData?.message || 'Login yoki parol noto\'g\'ri'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const pageLoader = (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="text-sm font-semibold text-slate-600">{t('Sahifa yuklanmoqda...')}</span>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} onAction={setActiveTab} />;
      case 'warehouse':
        return <WarehouseUnified user={user!} />;
      case 'transfers':
        return <InternalTransfers />;
      case 'production':
        return <ProductionFloor user={user!} />;
      case 'sales':
        return <Sales user={user!} />;
      case 'clients':
        return user ? <Clients user={user} /> : null;
      case 'cnc':
        return <CNC user={user!} />;
      case 'finishing':
        return <Finishing user={user!} />;
      case 'waste':
        return <Waste user={user!} />;
      case 'reports':
        return <Reports user={user!} />;
      case 'qc':
        return user ? <QualityControl user={user} /> : null;
      case 'logistics':
        return user ? <CourierDashboard user={user} /> : null;
      case 'production-orders':
        return <ProductionOrderManagement />;
      case 'suppliers':
        return <Suppliers />;
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'activity':
        return <AdminActivity />;
      case 'staff':
        return <StaffManagement user={user!} />;
      case 'documents':
        return <Documents user={user!} />;
      case 'finance':
        return <Finance user={user!} />;
      case 'contracts':
        return <Contracts user={user!} />;
      case 'debtors':
        return <DebtorsManagement user={user!} />;
      case 'accounting':
        return <Accounting user={user!} />;
      case 'budgets':
        return <BudgetManager />;
      case 'compliance':
        return <Compliance />;
      case 'alerts':
        return <Alerts />;
      case 'guide':
        return <UserGuide />;
      case 'exec-dashboard':
        return <ExecutiveDashboard onAction={setActiveTab} />;
      case 'profit-analytics':
        return <ProfitabilityDashboard />;
      case 'recipes':
      case 'products':
        return <MasterData />;
      case 'fleet': return user ? <FleetManagement user={user} /> : null;
      case 'leads': return user ? <LeadManagement user={user} /> : null;
      case 'dealers': return user ? <DealerManagement user={user} /> : null;
      case 'pricing': return <DynamicPricing />;
      case 'payroll': return user ? <Payroll user={user} /> : null;
      case 'pos-catalog': return <POS user={user!} />;
      default:
        return <Dashboard user={user} onAction={setActiveTab} />;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-2 shadow-2xl shadow-indigo-200"
            >
                <Factory className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Yuksar ERP</h1>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-xl">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('Sessiya tekshirilmoqda...')}</span>
            </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100"
        >
          <div className="mb-6 flex justify-end">
            <LanguageSwitcher />
          </div>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30 group hover:rotate-12 transition-transform duration-500">
              <Factory className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Yuksar ERP</h1>
            <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">{t('Industrial Management')}</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">{t('Tizim Logini')}</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 font-bold text-slate-900"
                  placeholder={t('Loginni kiriting')}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">{t('Maxfiy Parol')}</label>
              <div className="relative group">
                <X className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="password" 
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 font-bold text-slate-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                {authError}
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black active:scale-[0.98] transition-all shadow-2xl shadow-slate-200 mt-4 flex items-center justify-center gap-3 group"
            >
              {t('Tizimga Kirish')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              {t("Hisobingiz yo'qmi? Iltimos, administratorga murojaat qiling.")}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const toggleGroup = (groupId: string) => {
    setActiveGroup(prev => prev === groupId ? null : groupId);
  };

  // Mobile Bottom Nav tabs — role-aware
  const getBottomNavItems = () => {
    const role = currentRole;
    const base = [
      { id: 'dashboard', name: 'Asosiy', icon: LayoutDashboard },
    ];

    // Role-specific tabs
    if (['Bosh Admin', 'Admin'].includes(role)) {
      base.push(
        { id: 'sklad1', name: 'Ombor', icon: Database },
        { id: 'production', name: 'Ishlab ch.', icon: Factory },
        { id: 'sales', name: 'Sotuv', icon: ShoppingCart },
      );
    } else if (['Sotuv menejeri'].includes(role)) {
      base.push(
        { id: 'sales', name: 'Sotuv', icon: ShoppingCart },
        { id: 'clients', name: 'Mijozlar', icon: UserIcon },
        { id: 'finance', name: 'Moliya', icon: Wallet },
      );
    } else if (['Omborchi'].includes(role)) {
      base.push(
        { id: 'sklad1', name: 'Xom ashyo', icon: Database },
      );
    } else if (['Ishlab chiqarish ustasi'].includes(role)) {
      base.push(
        { id: 'production', name: 'Ishlab ch.', icon: Factory },
        { id: 'production-master', name: 'Nazorat', icon: Activity },
        { id: 'sklad2', name: 'Bloklar', icon: Layers },
      );
    } else if (['CNC operatori'].includes(role)) {
      base.push(
        { id: 'cnc', name: 'CNC', icon: Scissors },
        { id: 'sklad3', name: 'Sklad', icon: Truck },
      );
    } else if (['Pardozlovchi'].includes(role)) {
      base.push(
        { id: 'finishing', name: 'Pardoz', icon: Brush },
      );
    } else if (['Chiqindi operatori'].includes(role)) {
      base.push(
        { id: 'waste', name: 'Chiqindi', icon: Trash2 },
      );
    } else if (['Kuryer'].includes(role)) {
      base.push(
        { id: 'logistics', name: 'Yetkazish', icon: Truck },
      );
    }

    // "More" always last
    base.push({ id: '__more__', name: 'Yana', icon: Menu });
    return base.slice(0, 5); // Max 5 tabs
  };



  const activeTabName = navigationGroups.flatMap(g => g.items).find(n => n.id === activeTab)?.name || 'Boshqaruv Paneli';

  return (
    <div className="h-screen bg-surface flex overflow-hidden">
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {globalLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all"
          >
            <div className="w-12 h-12 border-4 border-primary-accent border-t-transparent rounded-full animate-spin shadow-xl"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />

      {/* =========== DESKTOP SIDEBAR =========== */}
      {!isMobile && (
        <Sidebar 
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navigationGroups={navigationGroups}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}

      {/* =========== MAIN CONTENT AREA =========== */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isMobile ? (isSidebarOpen ? 'ml-72' : 'ml-[88px]') : ''}`}>
        
        {/* ===== TOPBAR (Integrated utilities) ===== */}
        <Topbar 
          user={user}
          activeTabName={activeTabName}
          isMobile={isMobile}
          onToggleMobileSidebar={() => setIsMoreOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          unreadCount={unreadCount}
          onUnreadChange={setUnreadCount}
        />

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className={`flex-1 p-3 md:p-8 overflow-y-auto overflow-x-hidden relative min-h-0 custom-scrollbar ${isMobile ? 'pb-24' : 'pb-10'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <ErrorBoundary>
                <Suspense fallback={pageLoader}>
                  {renderActiveTab()}
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* =========== FLOATING ACTION BUTTON (Desktop/Mobile) =========== */}
      {(isPrivilegedUser || currentRole !== '') && (
        <FAB userRole={currentRole} onAction={setActiveTab} />
      )}

      {/* =========== MOBILE BOTTOM NAVIGATION =========== */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 safe-area-bottom shadow-premium">
          <div className="flex items-center justify-around h-16 px-2">
            {getBottomNavItems().map((item) => {
              const isActive = item.id === '__more__' ? isMoreOpen : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === '__more__') {
                      setIsMoreOpen(true);
                    } else {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative ${
                    isActive ? 'text-primary-accent' : 'text-slate-400'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50/50' : 'bg-transparent'}`}>
                    <item.icon className={`w-5.5 h-5.5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {t(item.name)}
                  </span>
                  {isActive && item.id !== '__more__' && (
                    <motion.div 
                      layoutId="bottom-indicator" 
                      className="absolute top-0 w-8 h-1 bg-primary-accent rounded-b-lg" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* =========== MOBILE "MORE" DRAWER =========== */}
      <AnimatePresence>
        {isMobile && isMoreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsMoreOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] max-h-[85vh] overflow-y-auto safe-area-bottom px-4 pb-8"
            >
              <div className="flex justify-center py-4">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

              <div className="px-5 pb-6 flex items-center gap-4 border-b border-slate-100 mb-6">
                <div className="w-14 h-14 bg-primary text-white rounded-[22px] flex items-center justify-center shadow-lg">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-slate-900 truncate leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{t(currentRole)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {navigationGroups.map((group) => {
                  const visibleItems = group.items.filter(item => {
                    const isPrivileged = isPrivilegedUser;
                    return isPrivileged || item.roles?.includes(currentRole);
                  });
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={group.id} className="space-y-3">
                      {group.title && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{t(group.title)}</p>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        {visibleItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMoreOpen(false);
                            }}
                            className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all ${
                              activeTab === item.id
                                ? 'bg-primary-accent text-white shadow-xl shadow-blue-900/10'
                                : 'bg-slate-50 text-slate-600 active:bg-slate-100'
                            }`}
                          >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] font-bold text-center leading-tight">{t(item.name)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-[28px] font-black text-sm transition-all active:scale-[0.98]"
                >
                  <LogOut className="w-5 h-5" />
                  {t('Chiqish')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScannerOpen && (
          <Suspense fallback={null}>
            <QRScanner onClose={() => setIsScannerOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
