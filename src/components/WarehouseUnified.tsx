import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  Package, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Box,
  Truck,
  ArrowUpRight,
  Maximize,
  Weight,
  Clock,
  X,
  User as UserIcon,
  Archive,
  BarChart3,
  Activity,
  Heart,
  ChevronRight,
  Scissors
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { User, BlockProduction, Inventory, Client } from '../types';
type StockItem = any;
import ScannerModal from './ScannerModal';

interface WarehouseUnifiedProps {
  user: User;
}

type WarehouseTab = 'RAW' | 'WIP' | 'FINISHED' | 'TRANSFERS';

export default function WarehouseUnified({ user }: WarehouseUnifiedProps) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<WarehouseTab>('RAW');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [stocks, setStocks] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<BlockProduction[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Modal States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const isAdmin = ['Bosh Admin', 'Admin'].includes(user.role || '');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'RAW') {
        const res = await api.get('stocks/', { params: { warehouse_name: 'Sklad №1' } });
        setStocks(res.data);
      } else if (activeTab === 'WIP') {
        const res = await api.get('production/blocks/');
        setBlocks(res.data);
      } else if (activeTab === 'FINISHED') {
        const res = await api.get('stocks/', { params: { warehouse: 3 } }); // Sklad 4
        setStocks(res.data);
        const cRes = await api.get('clients/');
        setClients(cRes.data);
      } else if (activeTab === 'TRANSFERS') {
        const res = await api.get('warehouse/transfers/'); // Future endpoint
        setTransfers(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const renderRawStock = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Jami Qiymat')}</p>
              <h4 className="text-xl font-black text-slate-900">{stocks.reduce((acc, s) => acc + (s.total_value || 0), 0).toLocaleString()} UZS</h4>
           </div>
        </div>
        {/* Add more KPIs here */}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Material')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Miqdor')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Holat')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amallar')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stocks.map(stock => (
              <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs">
                      {stock.material_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{stock.material_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{stock.material_unit}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center font-black text-slate-700">{stock.quantity.toLocaleString()}</td>
                <td className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest">
                   {stock.status === 'CRITICAL' ? <span className="text-rose-500 bg-rose-50 px-3 py-1 rounded-full">{t('Tanqislik')}</span> : <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{t('OK')}</span>}
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ArrowUpRight className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWIP = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Quritilmoqda')}</p>
             <h4 className="text-xl font-black text-amber-600">{blocks.filter(b => b.status === 'DRYING').length} {t('dona')}</h4>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Tayyor Bloklar')}</p>
             <h4 className="text-xl font-black text-emerald-600">{blocks.filter(b => b.status === 'READY').length} {t('dona')}</h4>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map(item => (
            <motion.div 
              layoutId={String(item.id)}
              key={item.id} 
              className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-premium hover:-translate-y-2 transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.quantity < (item.min_quantity || 10) ? 'rose' : 'blue'}-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <Box className="w-7 h-7" />
                 </div>
                 {item.quantity < (item.min_quantity || 10) && (
                    <span className="bg-rose-50 text-rose-500 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-rose-100 flex items-center gap-2">
                       <AlertTriangle className="w-3 h-3" />
                       {t('Kam Qoldi')}
                    </span>
                 )}
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">{t('Zames')}: {item.zames_number}</h3>
              <p className="text-xs font-bold text-slate-400 mb-4">{item.density} kg/m³ | {item.block_count} dona</p>
              <div className="flex gap-2">
                 <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">{t('Batafsil')}</button>
                 {item.status === 'READY' && <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Scissors className="w-4 h-4" /></button>}
              </div>
            </motion.div>
          ))}
       </div>
    </div>
  );

  const renderFinishedStock = () => (
    <div className="space-y-6">
       <div className="bg-white rounded-[40px] border border-slate-100 shadow-card overflow-hidden">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50/50">
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Mahsulot')}</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Miqdor')}</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Zona')}</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amallar')}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {stocks.map(stock => (
                  <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-5 font-black text-slate-900">{stock.material_name}</td>
                     <td className="px-8 py-5 text-center font-black text-slate-700">{stock.quantity.toLocaleString()} {stock.material_unit}</td>
                     <td className="px-8 py-5 text-center">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{t('Zone A')}</span>
                     </td>
                     <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderTransfers = () => (
    <div className="space-y-6">
       <div className="bg-white rounded-[40px] border border-slate-100 shadow-card overflow-hidden">
          <table className="w-full text-left">
             <thead>
                <tr className="bg-slate-50/50">
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Material')}</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Yo\'nalish')}</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Sana')}</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Mas\'ul')}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {transfers.map(transfer => (
                  <tr key={transfer.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-5 font-black text-slate-900">{transfer.material_name}</td>
                     <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                           <span>{transfer.from_warehouse_name}</span>
                           <ArrowRightLeft className="w-3 h-3" />
                           <span>{transfer.to_warehouse_name}</span>
                        </div>
                     </td>
                     <td className="px-8 py-5 text-center text-xs font-bold text-slate-500">{new Date(transfer.date).toLocaleDateString(locale)}</td>
                     <td className="px-8 py-5 text-right font-black text-blue-600 text-xs">{transfer.responsible_name || t('System')}</td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      {/* Warehouse Health & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-premium relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 text-emerald-500/5 group-hover:rotate-12 transition-transform duration-1000">
              <Activity className="w-48 h-48" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('Ombor Holati')}</h3>
                    <p className="text-slate-400 text-sm font-medium">{t('Real vaqtdagi xom-ashyo va tayyor mahsulot balansi')}</p>
                 </div>
                 <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100">
                    <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Tizim Barqaror')}</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Xom-ashyo', val: '84%', color: 'blue' },
                   { label: 'Tayyor', val: '92%', color: 'indigo' },
                   { label: 'WIP', val: '45%', color: 'amber' },
                   { label: 'Chiqindi', val: '2%', color: 'rose' }
                 ].map((stat) => (
                   <div key={stat.label} className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(stat.label)}</span>
                         <span className={`text-[10px] font-black text-${stat.color}-600`}>{stat.val}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: stat.val }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className={`h-full bg-${stat.color}-500 shadow-[0_0_10px_rgba(var(--${stat.color}-500-rgb),0.3)]`} 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                 <QrCode className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight">{t('Tezkor Skaner')}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                 {t('QR-kod orqali mahsulotlarni tezkor qabul qilish va jo\'natish tizimi.')}
              </p>
              <button 
                onClick={() => setIsScannerModalOpen(true)}
                className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                 {t('Skanerni Ochish')}
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-slate-900 text-white rounded-xl">
               <Database className="w-6 h-6" />
             </div>
             {t('Enterprise Ombor Boshqaruvi')}
           </h1>
           <p className="text-slate-500 font-medium">{t('Barcha skladlar va materiallar oqimi nazorati')}</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsScannerModalOpen(true)}
            className="p-3.5 bg-slate-100 text-slate-900 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg shadow-slate-200/50"
           >
              <QrCode className="w-5 h-5" />
           </button>
           <button className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('Kirim')}
           </button>
           <button className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              {t('O\'tkazma')}
           </button>
        </div>
      </div>

      {/* Unified Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[28px] w-fit border border-slate-200 shadow-inner">
        {[
          { id: 'RAW', name: t('Xom Ashyo'), icon: Database },
          { id: 'WIP', name: t('Yarim Tayyor (WIP)'), icon: Layers },
          { id: 'FINISHED', name: t('Tayyor Mahsulot'), icon: Package },
          { id: 'TRANSFERS', name: t('O\'tkazmalar'), icon: Truck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as WarehouseTab)}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-lg ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
             <div className="flex items-center justify-center py-40">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
             </div>
          ) : activeTab === 'RAW' ? (
             renderRawStock()
          ) : activeTab === 'WIP' ? (
             renderWIP()
          ) : activeTab === 'FINISHED' ? (
             renderFinishedStock()
          ) : (
            renderTransfers()
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isScannerModalOpen && (
          <ScannerModal 
            onClose={() => setIsScannerModalOpen(false)}
            onScan={(data) => console.log("Scanned:", data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
