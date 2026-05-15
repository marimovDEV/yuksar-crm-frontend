import React from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n';
import { Box, Layers, Factory, Wind, Scissors, CheckCircle2, Truck } from 'lucide-react';

const ZONES = [
  { id: 'A-01', name: 'SK-1 (Xom Ashyo)', type: 'Raw Material', capacity: 78, current: 45, items: 12, color: 'emerald', icon: Box },
  { id: 'B-01', name: 'Ishlab Chiqarish', type: 'Production', capacity: 60, current: 30, items: 6, color: 'blue', icon: Factory },
  { id: 'C-01', name: 'SK-2 (Bloklar)', type: 'WIP Block', capacity: 30, current: 28, items: 3, color: 'indigo', icon: Layers },
  { id: 'C-02', name: 'CNC Kesish', type: 'Cutting', capacity: 15, current: 8, items: 2, color: 'amber', icon: Scissors },
  { id: 'D-01', name: 'SK-4 (Tayyor)', type: 'Finished Goods', capacity: 85, current: 80, items: 20, color: 'emerald', icon: CheckCircle2 },
  { id: 'D-02', name: 'Shipment', type: 'Dispatch', capacity: 100, current: 15, items: 5, color: 'violet', icon: Truck },
];

export default function WarehouseMap() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{t('REAL-TIME WAREHOUSE MAP')}</h3>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
        </div>
      </div>

      <div className="relative bg-white rounded-3xl border border-slate-200 p-8 min-h-[400px] overflow-hidden">
        {/* Animated Flow Lines Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
           <defs>
              <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                 <stop offset="100%" stopColor="#10b981" stopOpacity="0.2"/>
              </linearGradient>
           </defs>
           <path d="M 150 150 L 300 150 L 300 300 L 500 300 L 500 150 L 700 150" fill="none" stroke="url(#flow-gradient)" strokeWidth="4" strokeDasharray="10,10">
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite"/>
           </path>
        </svg>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {ZONES.map((zone, idx) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-white rounded-2xl border-2 border-${zone.color}-100 p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer`}
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${zone.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform`} />
              
              <div className="flex items-start justify-between relative z-10 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${zone.color}-100 flex items-center justify-center text-${zone.color}-600 shadow-inner`}>
                  <zone.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-black text-slate-900">{t(zone.name)}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t(zone.id)}</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">{t('Bandlik')}</span>
                    <span className="text-slate-900">{Math.round((zone.current / zone.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full bg-${zone.color}-500 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(zone.current / zone.capacity) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">{t('Partiyalar')}: {zone.items}</span>
                  <span className="font-black text-slate-700">{zone.current} / {zone.capacity}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
