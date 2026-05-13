import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Package, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  MonitorDot, 
  Plus,
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useI18n } from '../i18n';

/* ─── MINI COMPONENTS ─── */

const StatCard = ({ icon: Icon, title, value, subtitle, footer, color, progress }: any) => (
  <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-xl transition-all group">
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tight">{title}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{value}</span>
            {subtitle && <span className="text-sm font-bold text-slate-400">{subtitle}</span>}
          </div>
        </div>
      </div>

      {progress !== undefined && (
        <div className="space-y-3 mb-6">
           <div className="flex justify-between items-end">
              <div className="flex gap-1">
                 <div className="w-1.5 h-3 bg-slate-100 rounded-full" />
                 <div className="w-1.5 h-5 bg-slate-100 rounded-full" />
                 <div className="w-1.5 h-4 bg-slate-100 rounded-full" />
              </div>
              <span className="text-xs font-black text-slate-900">{progress}%</span>
           </div>
           <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full ${color === 'rose' ? 'bg-rose-400' : 'bg-emerald-400'}`}
              />
           </div>
        </div>
      )}
    </div>

    {footer && (
      <button className="flex items-center justify-between w-full p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
        <span className="text-[10px] font-black uppercase tracking-widest ml-2">{footer}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    )}
  </div>
);

const PulseCard = ({ type, title, value, subValue, output, density, trend, color }: any) => (
  <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-50 space-y-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {type === 'sales' ? <TrendingUp className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-xs font-black text-slate-900">{title}</p>
        <p className="text-xl font-black text-slate-900">{value} <span className="text-xs font-bold text-slate-400">mln sum</span></p>
      </div>
    </div>

    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
       <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className={`h-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
    </div>

    {output && (
      <div className="space-y-4 pt-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Vyxod:</span>
          <span className="text-slate-900 font-black">{output} blokov</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Plotnost:</span>
          <span className="text-slate-900 font-black">{density}</span>
        </div>
        
        <div className="flex gap-3 pt-2">
           <button className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              <Pause className="w-3 h-3 fill-current" /> Pauza
           </button>
           <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              Zavershit
           </button>
        </div>
      </div>
    )}
  </div>
);

export default function DirectorControlCenter() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('dashboard/summary/');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 pb-32 bg-[#F8FAFC] min-h-screen space-y-10">
      
      {/* ─── TOP KPI GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard 
          icon={Factory} 
          title="Ishlab chiqarish" 
          value="12,5" 
          subtitle="m³" 
          footer="Probili segodnya" 
          color="blue" 
        />
        <StatCard 
          icon={Package} 
          title="Skladlar" 
          value="921" 
          subtitle="mln sum" 
          footer="Vsego v materialax" 
          color="emerald" 
        />
        <StatCard 
          icon={Truck} 
          title="Otgruzki" 
          value="4" 
          subtitle="raboty | 7t" 
          progress={60}
          color="emerald" 
        />
        <StatCard 
          icon={ShoppingCart} 
          title="Zakupki" 
          value="145" 
          subtitle="mln sum" 
          progress={60}
          color="rose" 
        />
      </div>

      {/* ─── BIZNES PULS ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <MonitorDot className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Biznes-puls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <PulseCard type="sales" title="Prodaji" value="5,3" color="blue" />
           <PulseCard type="prod" title="Proizvodstvo" value="18,5" subValue="580 kg" color="emerald" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <MonitorDot className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Biznes-puls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <PulseCard 
             type="sales" 
             title="Prodaji" 
             value="5,3" 
             color="blue" 
             output={8} 
             density={18} 
           />
           <PulseCard 
             type="prod" 
             title="Proizvodstvo" 
             value="18,5" 
             subValue="580 kg" 
             color="emerald" 
             output={10} 
             density={25}
             trend="-5,5%" 
           />
        </div>
      </div>

      {/* ─── FLOATING ACTION ─── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-8 z-50">
        <button className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all">
          <Plus className="w-5 h-5" />
          {t('Sozdat Partiyu')}
        </button>
      </div>

    </div>
  );
}
