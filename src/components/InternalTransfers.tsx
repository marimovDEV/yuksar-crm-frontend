import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Database,
  Box,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  FileText,
  User,
  ShieldCheck,
  Package,
  QrCode,
  Filter,
  MoreVertical,
  Activity
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export default function InternalTransfers() {
  const { t } = useI18n();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  
  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    transfer_type: 'WAREHOUSE',
    priority: 'NORMAL',
    from_warehouse: '',
    to_warehouse: '',
    material: '',
    batch: '',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, whRes, matRes] = await Promise.all([
        api.get('transfers/'),
        api.get('warehouses/'),
        api.get('materials/')
      ]);
      setTransfers(transRes.data);
      setWarehouses(whRes.data);
      setMaterials(matRes.data);
    } catch (err) {
      console.error(err);
      uiStore.showNotification(t("Ma'lumot yuklashda xatolik"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.from_warehouse || !newTransfer.to_warehouse || !newTransfer.material || !newTransfer.quantity) {
      uiStore.showNotification(t("Barcha maydonlarni to'ldiring"), "info");
      return;
    }

    setLoading(true);
    try {
      await api.post('transfers/', newTransfer);
      uiStore.showNotification(t("O'tkazma yaratildi va tasdiqlashga yuborildi"), "success");
      setIsModalOpen(false);
      fetchData();
      setNewTransfer({
        transfer_type: 'WAREHOUSE',
        priority: 'NORMAL',
        from_warehouse: '',
        to_warehouse: '',
        material: '',
        batch: '',
        quantity: 0,
        reason: '',
        notes: ''
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.quantity?.[0] || t("O'tkazma yaratishda xatolik");
      uiStore.showNotification(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: string) => {
    setLoading(true);
    try {
      await api.post(`transfers/${id}/${action}/`);
      uiStore.showNotification(t(`Muvaffaqiyatli: ${action}`), "success");
      fetchData();
      setSelectedTransfer(null);
    } catch (err) {
      uiStore.showNotification(t("Amalni bajarib bo'lmadi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'emerald';
      case 'SHIPPED': return 'blue';
      case 'APPROVED': return 'indigo';
      case 'PENDING': return 'amber';
      case 'CANCELLED': return 'rose';
      case 'DRAFT': return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 🚀 LOGISTICS HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-100">
             <ArrowRightLeft className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('Ichki Logistika Markazi')}</h1>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">{t('Omborlararo Resurs Boshqaruvi')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 transition-all">
              <QrCode className="w-6 h-6" />
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all group"
           >
             <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
             <span className="uppercase tracking-widest text-[11px]">{t('Yangi O\'tkazma')}</span>
           </button>
        </div>
      </div>

      {/* 📊 LOGISTICS ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Tasdiqlash kutilmoqda', val: transfers.filter(t => t.status === 'PENDING').length, color: 'amber', icon: ShieldCheck },
           { label: 'Yo‘lda (Jo‘natildi)', val: transfers.filter(t => t.status === 'SHIPPED').length, color: 'blue', icon: Truck },
           { label: 'Bugun Qabul qilindi', val: transfers.filter(t => t.status === 'RECEIVED').length, color: 'emerald', icon: CheckCircle2 },
           { label: 'Jami Hajm', val: transfers.reduce((acc, curr) => acc + parseFloat(curr.quantity), 0).toFixed(1), color: 'slate', icon: Package }
         ].map((card, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
               <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(card.label)}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.val}</h3>
            </motion.div>
         ))}
      </div>

      {/* 📋 TRANSFER REPOSITORY */}
      <div className="bg-white rounded-[56px] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                 <Activity className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('Harakatlar Monitoringi')}</h3>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input type="text" placeholder={t('ID, Material yoki Batch...')} className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-xs font-bold w-64 focus:border-amber-500 transition-all shadow-sm" />
              </div>
              <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-600 transition-all shadow-sm">
                 <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('O\'tkazma ID')}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Material & Batch')}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Marshrut (Kimdan → Kimga)')}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Miqdor')}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('Holat')}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('Amallar')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transfers.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                         <Package className="w-16 h-16" />
                         <p className="text-sm font-black uppercase tracking-[0.2em]">{t('O\'tkazmalar topilmadi')}</p>
                      </div>
                   </td>
                </tr>
              ) : (
                transfers.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-900">{tr.transfer_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                             tr.priority === 'URGENT' ? 'bg-rose-500 text-white' : 
                             tr.priority === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                             {t(tr.priority)}
                          </span>
                       </div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{t(tr.transfer_type)}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-amber-600">
                          <Box className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900">{tr.material_name}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                              {tr.batch_number ? `BATCH: ${tr.batch_number}` : 'NO BATCH'} • {tr.material_sku}
                           </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t('Source')}</span>
                            <span className="text-xs font-bold text-slate-700">{tr.from_warehouse_name}</span>
                         </div>
                         <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t('Destination')}</span>
                            <span className="text-xs font-black text-blue-600">{tr.to_warehouse_name}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="text-sm font-black text-slate-900">{tr.quantity}</span>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{t(tr.material_unit)}</p>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center">
                          <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            tr.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            tr.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            tr.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                            tr.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {t(tr.status)}
                          </span>
                          
                          {/* Visual Workflow Mini-Bar */}
                          <div className="flex gap-1 mt-3 w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full flex-1 ${['PENDING', 'APPROVED', 'SHIPPED', 'RECEIVED'].includes(tr.status) ? 'bg-amber-400' : ''}`} />
                             <div className={`h-full flex-1 ${['APPROVED', 'SHIPPED', 'RECEIVED'].includes(tr.status) ? 'bg-indigo-400' : ''}`} />
                             <div className={`h-full flex-1 ${['SHIPPED', 'RECEIVED'].includes(tr.status) ? 'bg-blue-400' : ''}`} />
                             <div className={`h-full flex-1 ${tr.status === 'RECEIVED' ? 'bg-emerald-400' : ''}`} />
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {tr.status === 'PENDING' && (
                             <button onClick={() => handleAction(tr.id, 'approve')} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                <ShieldCheck className="w-5 h-5" />
                             </button>
                          )}
                          {tr.status === 'APPROVED' && (
                             <button onClick={() => handleAction(tr.id, 'ship')} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                                <Truck className="w-5 h-5" />
                             </button>
                          )}
                          {tr.status === 'SHIPPED' && (
                             <button onClick={() => handleAction(tr.id, 'receive')} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                                <CheckCircle2 className="w-5 h-5" />
                             </button>
                          )}
                          <button onClick={() => setSelectedTransfer(tr)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛠 NEW TRANSFER INDUSTRIAL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 40 }}
               className="bg-white w-full max-w-3xl rounded-[56px] overflow-hidden shadow-2xl border border-slate-100"
            >
               <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                        <Plus className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t('Yangi Logistik O\'tkazma')}</h3>
                        <p className="text-slate-500 font-medium">{t('Marshrut, Material va Batch-ni aniqlang')}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm border border-slate-100">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <form onSubmit={handleCreateTransfer} className="p-12 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  
                  {/* 📍 ROUTING SECTION */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-amber-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Yo\'nalish & Prioritet')}</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Tur')}</label>
                           <select 
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                              value={newTransfer.transfer_type}
                              onChange={e => setNewTransfer({...newTransfer, transfer_type: e.target.value})}
                           >
                              <option value="WAREHOUSE">{t('Omborlararo')}</option>
                              <option value="PRODUCTION">{t('Ishlab chiqarish')}</option>
                              <option value="QC">{t('Sifat nazorati')}</option>
                              <option value="RETURN">{t('Qaytarish')}</option>
                              <option value="WASTE">{t('Brak / Chiqindi')}</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Prioritet')}</label>
                           <select 
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                              value={newTransfer.priority}
                              onChange={e => setNewTransfer({...newTransfer, priority: e.target.value})}
                           >
                              <option value="NORMAL">{t('O\'rtacha')}</option>
                              <option value="LOW">{t('Past')}</option>
                              <option value="HIGH">{t('Yuqori')}</option>
                              <option value="URGENT">{t('SHOSHILINCH')}</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Sana')}</label>
                           <div className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold text-sm text-slate-400">
                              {new Date().toLocaleDateString()}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 border-dashed">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Chiqish Ombori (From)')}</label>
                           <select 
                              required
                              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm"
                              value={newTransfer.from_warehouse}
                              onChange={e => setNewTransfer({...newTransfer, from_warehouse: e.target.value})}
                           >
                              <option value="">{t('Tanlang...')}</option>
                              {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Qabul Ombori (To)')}</label>
                           <select 
                              required
                              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm"
                              value={newTransfer.to_warehouse}
                              onChange={e => setNewTransfer({...newTransfer, to_warehouse: e.target.value})}
                           >
                              <option value="">{t('Tanlang...')}</option>
                              {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* 📦 MATERIAL & BATCH SECTION */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-blue-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Material & Partiya Nazorati')}</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Material / Mahsulot')}</label>
                           <select 
                              required
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                              value={newTransfer.material}
                              onChange={e => setNewTransfer({...newTransfer, material: e.target.value})}
                           >
                              <option value="">{t('Tanlang...')}</option>
                              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Miqdor')}</label>
                           <div className="relative">
                              <input 
                                 type="number"
                                 required
                                 min="0.01"
                                 step="0.01"
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                 value={newTransfer.quantity || ''}
                                 onChange={e => setNewTransfer({...newTransfer, quantity: parseFloat(e.target.value)})}
                                 placeholder="0.00"
                              />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{t('Birlik')}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 📝 REASON & NOTES */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('O\'tkazma Sababi & Izoh')}</label>
                     <textarea 
                        className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none font-bold text-sm min-h-[120px] focus:bg-white focus:shadow-xl transition-all"
                        value={newTransfer.reason}
                        onChange={e => setNewTransfer({...newTransfer, reason: e.target.value})}
                        placeholder={t("Nima uchun bu ko'chirish amalga oshirilmoqda? (Masalan: Ishlab chiqarish ehtiyoji uchun)")}
                     />
                  </div>

                  <div className="flex gap-4 pt-6">
                     <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                     >
                        {t('Bekor qilish')}
                     </button>
                     <button 
                        type="submit"
                        disabled={loading}
                        className="flex-3 py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                        {loading ? t('Yaratilmoqda...') : t('O\'tkazma Buyurtmasini Yaratish')}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔍 TRANSFER DETAIL SLIDEOVER */}
      <AnimatePresence>
         {selectedTransfer && (
            <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/60 backdrop-blur-sm">
               <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-full max-w-xl bg-white h-full shadow-2xl p-10 flex flex-col"
               >
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTransfer.transfer_number}</h3>
                     <button onClick={() => setSelectedTransfer(null)} className="p-3 bg-slate-50 rounded-xl">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-10">
                     {/* TIMELINE */}
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('O\'tkazma Tarixi')}</h4>
                        <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                           <div className="flex gap-6 relative z-10">
                              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                                 <Plus className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-900">{t('O\'tkazma yaratildi')}</p>
                                 <p className="text-xs text-slate-400">{new Date(selectedTransfer.created_at).toLocaleString()}</p>
                                 <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">BY: {selectedTransfer.created_by_name}</p>
                              </div>
                           </div>
                           {selectedTransfer.approved_at && (
                              <div className="flex gap-6 relative z-10">
                                 <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <ShieldCheck className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900">{t('Tasdiqlandi')}</p>
                                    <p className="text-xs text-slate-400">{new Date(selectedTransfer.approved_at).toLocaleString()}</p>
                                 </div>
                              </div>
                           )}
                           {selectedTransfer.shipped_at && (
                              <div className="flex gap-6 relative z-10">
                                 <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                    <Truck className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900">{t('Jo\'natildi')}</p>
                                    <p className="text-xs text-slate-400">{new Date(selectedTransfer.shipped_at).toLocaleString()}</p>
                                 </div>
                              </div>
                           )}
                           {selectedTransfer.received_at && (
                              <div className="flex gap-6 relative z-10">
                                 <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                                    <CheckCircle2 className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900">{t('Qabul qilindi')}</p>
                                    <p className="text-xs text-slate-400">{new Date(selectedTransfer.received_at).toLocaleString()}</p>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                        <div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('Maqsad / Sabab')}</span>
                           <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedTransfer.reason || t('Sabab ko\'rsatilmadi')}"</p>
                        </div>
                        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
                           <div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Material')}</span>
                              <p className="text-xs font-black text-slate-900">{selectedTransfer.material_name}</p>
                           </div>
                           <div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Miqdor')}</span>
                              <p className="text-xs font-black text-slate-900">{selectedTransfer.quantity} {selectedTransfer.material_unit}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                     <button onClick={() => setSelectedTransfer(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                        {t('Yopish')}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
