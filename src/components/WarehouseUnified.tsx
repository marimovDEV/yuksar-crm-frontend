import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import ScannerModal from './ScannerModal';
import { 
  MapPin, Box, Layers, Package2, Truck, 
  ArrowRightLeft, ClipboardList, BarChart3, QrCode, AlertTriangle 
} from 'lucide-react';

// Import newly created WMS modules
import WarehouseMap from './warehouse/WarehouseMap';
import SK1RawMaterial from './warehouse/SK1RawMaterial';
import SK2BlockStorage from './warehouse/SK2BlockStorage';
import { SK3DecorStorage, SK4Shipment } from './warehouse/SK34Storage';
import WasteWarehouse from './warehouse/WasteWarehouse';
import WarehouseTransfers from './warehouse/WarehouseTransfers';
import CycleCounting from './warehouse/CycleCounting';
import WarehouseAnalytics from './warehouse/WarehouseAnalytics';
import BlockPassport from './production/BlockPassport';
import { FinishedBlock } from '../types';

interface WarehouseUnifiedProps { user: User; }

type WTab = 'MAP' | 'SK1' | 'SK2' | 'SK3' | 'SK4' | 'WASTE' | 'TRANSFERS' | 'STOCKTAKE' | 'ANALYTICS';

export default function WarehouseUnified({ user }: WarehouseUnifiedProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<WTab>('MAP');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<FinishedBlock | null>(null);

  // Enterprise Modules Definition
  const MODULES = [
    { id: 'MAP', label: 'Live Xarita', icon: MapPin, color: 'blue' },
    { id: 'SK1', label: 'Склад сырья', icon: Box, color: 'emerald' },
    { id: 'SK2', label: 'Склад готовой продукции', icon: Layers, color: 'indigo' },
    { id: 'SK3', label: 'Склад декора', icon: Package2, color: 'amber' },
    { id: 'SK4', label: 'Зона отгрузки', icon: Truck, color: 'violet' },
    { id: 'WASTE', label: 'Брак / возврат / отходы', icon: AlertTriangle, color: 'rose' },
    { id: 'TRANSFERS', label: 'Ichki O\'tkazmalar', icon: ArrowRightLeft, color: 'sky' },
    { id: 'STOCKTAKE', label: 'Inventarizatsiya', icon: ClipboardList, color: 'rose' },
    { id: 'ANALYTICS', label: 'Analitika', icon: BarChart3, color: 'slate' },
  ] as const;

  const handleScanResult = (result: any) => {
    if (result?.block_id) {
      setSelectedBlock(result);
    }
    setScannerOpen(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* GLOBAL WMS HEADER */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
              Warehouse Management System
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                {t('LIVE')}
              </div>
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {t('Bosh Ombor va Logistika Markazi')}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/50"
            >
              <QrCode className="w-5 h-5" />
              {t('Smart Scan')}
            </button>
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 flex items-center justify-center relative cursor-pointer hover:bg-rose-500/30 transition-all">
              <AlertTriangle className="w-6 h-6" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black flex items-center justify-center text-white border-2 border-slate-900">3</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {MODULES.map((m) => {
          const isActive = activeTab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                isActive 
                  ? `bg-${m.color}-600 text-white shadow-lg shadow-${m.color}-200 scale-100` 
                  : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 scale-95 hover:scale-100'
              }`}
            >
              <m.icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-${m.color}-500`}`} />
              {t(m.label)}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE MODULE */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'MAP' && <WarehouseMap />}
            {activeTab === 'SK1' && <SK1RawMaterial />}
            {activeTab === 'SK2' && <SK2BlockStorage />}
            {activeTab === 'SK3' && <SK3DecorStorage />}
            {activeTab === 'SK4' && <SK4Shipment />}
            {activeTab === 'WASTE' && <WasteWarehouse />}
            {activeTab === 'TRANSFERS' && <WarehouseTransfers />}
            {activeTab === 'STOCKTAKE' && <CycleCounting />}
            {activeTab === 'ANALYTICS' && <WarehouseAnalytics />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* GLOBAL MODALS */}
      {scannerOpen && (
        <ScannerModal onClose={() => setScannerOpen(false)} onScan={handleScanResult} type="BLOCK" />
      )}
      {selectedBlock && (
        <BlockPassport block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}
    </div>
  );
}
