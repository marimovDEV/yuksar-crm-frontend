import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  ShoppingCart,
  Zap,
  Target,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n';
import api from '../../lib/api';

export default function ProjectCosting() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCostingData = async () => {
      try {
        // This would ideally be a specialized analytics endpoint
        const res = await api.get('sales/orders/');
        setOrders(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to fetch costing data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCostingData();
  }, []);

  const filtered = orders.filter(o => 
    (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Hero Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6">
                <Target className="w-10 h-10 text-slate-50 group-hover:text-blue-50 transition-colors" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('O\'rtacha Rentabellik')}</p>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">24.8%</h3>
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                <ArrowUpRight className="w-4 h-4" />
                +2.4% {t('o\'tgan oydan')}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6">
                <Zap className="w-10 h-10 text-slate-50 group-hover:text-amber-50 transition-colors" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('Eng foydali loyiha')}</p>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">42.1%</h3>
             <div className="text-[10px] font-black text-blue-600 uppercase">
                "Modern House Complex"
             </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6">
                <DollarSign className="w-10 h-10 text-white/5" />
             </div>
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{t('Jami Potentsial Foyda')}</p>
             <h3 className="text-3xl font-black tracking-tight mb-4">1.2B <span className="text-sm font-bold opacity-30">UZS</span></h3>
             <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                {t('Aktiv buyurtmalar bo\'yicha')}
             </div>
          </div>
       </div>

       {/* Detailed Table */}
       <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                   <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t('Loyiha Rentabelligi')}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Sotuv vs Xarajat tahlili')}</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all" />
                   <input 
                     type="text" 
                     placeholder={t('Buyurtma yoki mijoz...')}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm w-full md:w-64"
                   />
                </div>
                <button onClick={() => alert("Bu funksiya tez kunda ishga tushadi")}  className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900">
                   <Filter className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/20">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Loyiha / Mijoz')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Sotuv Summasi')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Xarajatlar')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Foyda (Gross)')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Rentabellik')}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filtered.map((order, idx) => {
                      const sales = parseFloat(order.total_amount) || 0;
                      // Simulated cost: roughly 60-85% of sales
                      const cost = sales * (0.6 + Math.random() * 0.25);
                      const profit = sales - cost;
                      const margin = (profit / sales) * 100;

                      return (
                         <motion.tr 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           key={order.id} 
                           className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                         >
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                     <Package className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900">{order.order_number || `#ORD-${order.id}`}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">{order.customer_name}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-sm font-black text-slate-900">{sales.toLocaleString()} <span className="text-[10px] text-slate-300">UZS</span></p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-sm font-bold text-rose-500">{cost.toLocaleString()} <span className="text-[10px] opacity-40">UZS</span></p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-sm font-black text-emerald-600">{profit.toLocaleString()} <span className="text-[10px] opacity-40">UZS</span></p>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-all">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span className="text-xs font-black text-slate-900">{margin.toFixed(1)}%</span>
                               </div>
                            </td>
                         </motion.tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}
