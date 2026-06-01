import React, { useEffect, useMemo, useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  ArrowRightLeft,
  ArrowRight,
  X,
  ShieldCheck,
  Package,
  QrCode,
  Filter,
  MoreVertical,
  Activity,
  Box,
  CheckCircle2,
  FileText,
  ClipboardCheck,
  Ban,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { FinishedBlock, Material, RawMaterialBatch, Warehouse, WarehouseTransfer } from '../types';

type TransferStatusFilter = 'ALL' | WarehouseTransfer['status'];

const EMPTY_TRANSFER = {
  transfer_type: 'WAREHOUSE',
  priority: 'NORMAL',
  from_warehouse: '',
  to_warehouse: '',
  block: '',
  material: '',
  batch: '',
  quantity: '',
  reason: '',
  notes: '',
};

export default function InternalTransfers() {
  const { t } = useI18n();
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [batches, setBatches] = useState<RawMaterialBatch[]>([]);
  const [blocks, setBlocks] = useState<FinishedBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<WarehouseTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransferStatusFilter>('ALL');
  const [newTransfer, setNewTransfer] = useState(EMPTY_TRANSFER);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, whRes, matRes, batchRes, blockRes] = await Promise.all([
        api.get('transfers/'),
        api.get('warehouses/'),
        api.get('materials/'),
        api.get('batches/'),
        api.get('production/finished-blocks/'),
      ]);
      setTransfers(transRes.data.results || transRes.data);
      setWarehouses(whRes.data.results || whRes.data);
      setMaterials(matRes.data.results || matRes.data);
      setBatches(batchRes.data.results || batchRes.data);
      setBlocks(blockRes.data.results || blockRes.data);
    } catch (err) {
      uiStore.showNotification(t("Ma'lumot yuklashda xatolik"), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = [
        transfer.transfer_number,
        transfer.block_id,
        transfer.material_name,
        transfer.batch_number,
        transfer.from_warehouse_name,
        transfer.to_warehouse_name,
        transfer.reason,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));

      const normalizedStatus = transfer.status === 'SHIPPED' ? 'IN_TRANSIT' : transfer.status;
      const matchesStatus = statusFilter === 'ALL' ? true : normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, transfers]);

  const eligibleBatches = useMemo(() => {
    return batches.filter((batch) => {
      if (!newTransfer.material || Number(batch.material) !== Number(newTransfer.material)) return false;
      return ['IN_STOCK', 'RESERVED'].includes(batch.status);
    });
  }, [batches, newTransfer.material]);

  const movableBlocks = useMemo(() => {
    return blocks.filter((block) => ['READY', 'TRANSFERRED', 'CUTTING', 'FINISHING', 'PACKAGED'].includes(block.status));
  }, [blocks]);

  const selectedBlock = useMemo(() => blocks.find((block) => Number(block.id) === Number(newTransfer.block)), [blocks, newTransfer.block]);

  const handleCreateTransfer = async (submitStatus: 'DRAFT' | 'PENDING') => {
    if (!newTransfer.from_warehouse || !newTransfer.to_warehouse || ((!newTransfer.material && !newTransfer.block) || !newTransfer.quantity || !newTransfer.reason)) {
      uiStore.showNotification(t("Barcha maydonlarni to'ldiring"), 'info');
      return;
    }
    if (newTransfer.from_warehouse === newTransfer.to_warehouse) {
      uiStore.showNotification(t("Chiqish va qabul ombori bir xil bo'lmasligi kerak"), 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('transfers/', {
        ...newTransfer,
        from_warehouse: Number(newTransfer.from_warehouse),
        to_warehouse: Number(newTransfer.to_warehouse),
        material: newTransfer.material ? Number(newTransfer.material) : undefined,
        block: newTransfer.block ? Number(newTransfer.block) : null,
        batch: newTransfer.batch ? Number(newTransfer.batch) : null,
        quantity: Number(newTransfer.quantity),
        status: submitStatus,
      });
      uiStore.showNotification(
        submitStatus === 'DRAFT' ? t("O'tkazma qoralama holatda saqlandi") : t("O'tkazma yaratildi va tasdiqlashga yuborildi"),
        'success'
      );
      setIsModalOpen(false);
      setNewTransfer(EMPTY_TRANSFER);
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.quantity?.[0] || err.response?.data?.error || t("O'tkazma yaratishda xatolik");
      uiStore.showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (transfer: WarehouseTransfer, action: 'submit' | 'approve' | 'ship' | 'receive' | 'complete' | 'cancel') => {
    setLoading(true);
    try {
      await api.post(`transfers/${transfer.id}/${action}/`, {});
      uiStore.showNotification(t(`Transfer ${action} bajarildi`), 'success');
      fetchData();
      setSelectedTransfer(null);
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || t("Amalni bajarib bo'lmadi"), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMeta = (status: string) => {
    const normalized = status === 'SHIPPED' ? 'IN_TRANSIT' : status;
    switch (normalized) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'RECEIVED': return 'bg-green-50 text-green-700 border-green-100';
      case 'IN_TRANSIT': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'APPROVED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'DRAFT': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const statusSteps: TransferStatusFilter[] = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED', 'CANCELLED'];
  const cardColorClass: Record<string, string> = {
    slate: 'text-slate-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
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
          <button
            onClick={() => uiStore.showNotification(t("QR oqimi keyingi passda transfer navigator bilan bog'lanadi"), 'info')}
            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 transition-all"
          >
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Qoralama', val: transfers.filter((item) => item.status === 'DRAFT').length, icon: FileText, color: 'slate' },
          { label: 'Tasdiqlash kutilmoqda', val: transfers.filter((item) => item.status === 'PENDING').length, icon: ShieldCheck, color: 'amber' },
          { label: 'Yo‘lda', val: transfers.filter((item) => ['IN_TRANSIT', 'SHIPPED'].includes(item.status)).length, icon: Truck, color: 'blue' },
          { label: 'Qabul qilindi', val: transfers.filter((item) => item.status === 'RECEIVED').length, icon: ClipboardCheck, color: 'green' },
          { label: 'Yakunlandi', val: transfers.filter((item) => item.status === 'COMPLETED').length, icon: CheckCircle2, color: 'emerald' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <card.icon className={`w-6 h-6 ${cardColorClass[card.color] || 'text-slate-600'}`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(card.label)}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[56px] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('Harakatlar Monitoringi')}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredTransfers.length} {t('ta transfer')}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('ID, Material yoki Batch...')}
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-xs font-bold w-72 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusSteps.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusFilter === status ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600'}`}
                >
                  {status === 'ALL' ? t('Barchasi') : t(status)}
                </button>
              ))}
            </div>
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
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                      <Package className="w-16 h-16" />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">{t('O\'tkazmalar topilmadi')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => {
                  const normalizedStatus = transfer.status === 'SHIPPED' ? 'IN_TRANSIT' : transfer.status;
                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-900">{transfer.transfer_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${transfer.priority === 'URGENT' ? 'bg-rose-500 text-white' : transfer.priority === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {t(transfer.priority || 'NORMAL')}
                          </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{t(transfer.transfer_type || 'WAREHOUSE')}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-amber-600">
                            <Box className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{transfer.material_name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                              {transfer.block_id ? `BLOCK: ${transfer.block_id}` : transfer.batch_number ? `BATCH: ${transfer.batch_number}` : 'NO BATCH'} • {transfer.material_sku || 'SKU'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t('Source')}</span>
                            <span className="text-xs font-bold text-slate-700">{transfer.from_warehouse_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t('Destination')}</span>
                            <span className="text-xs font-black text-blue-600">{transfer.to_warehouse_name}</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">{transfer.reason}</p>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className="text-sm font-black text-slate-900">{transfer.quantity}</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{t(transfer.material_unit || 'kg')}</p>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusMeta(normalizedStatus)}`}>
                            {t(normalizedStatus)}
                          </span>
                          <div className="flex gap-1 mt-3 w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full flex-1 ${['PENDING', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(normalizedStatus) ? 'bg-amber-400' : ''}`} />
                            <div className={`h-full flex-1 ${['APPROVED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(normalizedStatus) ? 'bg-indigo-400' : ''}`} />
                            <div className={`h-full flex-1 ${['IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(normalizedStatus) ? 'bg-blue-400' : ''}`} />
                            <div className={`h-full flex-1 ${['RECEIVED', 'COMPLETED'].includes(normalizedStatus) ? 'bg-green-400' : ''}`} />
                            <div className={`h-full flex-1 ${normalizedStatus === 'COMPLETED' ? 'bg-emerald-500' : ''}`} />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {normalizedStatus === 'DRAFT' && (
                            <button onClick={() => handleAction(transfer, 'submit')} className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-100" title={t('Yuborish')}>
                              <FileText className="w-5 h-5" />
                            </button>
                          )}
                          {normalizedStatus === 'PENDING' && (
                            <button onClick={() => handleAction(transfer, 'approve')} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100" title={t('Tasdiqlash')}>
                              <ShieldCheck className="w-5 h-5" />
                            </button>
                          )}
                          {normalizedStatus === 'APPROVED' && (
                            <button onClick={() => handleAction(transfer, 'ship')} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100" title={t('Jo\'natish')}>
                              <Truck className="w-5 h-5" />
                            </button>
                          )}
                          {normalizedStatus === 'IN_TRANSIT' && (
                            <button onClick={() => handleAction(transfer, 'receive')} className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100" title={t('Qabul qilish')}>
                              <ClipboardCheck className="w-5 h-5" />
                            </button>
                          )}
                          {normalizedStatus === 'RECEIVED' && (
                            <button onClick={() => handleAction(transfer, 'complete')} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100" title={t('Yakunlash')}>
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          {['DRAFT', 'PENDING', 'APPROVED'].includes(normalizedStatus) && (
                            <button onClick={() => handleAction(transfer, 'cancel')} className="p-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100" title={t('Bekor qilish')}>
                              <Ban className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => setSelectedTransfer(transfer)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }} className="bg-white w-full max-w-3xl rounded-[56px] overflow-hidden shadow-2xl border border-slate-100">
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

              <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-500 rounded-full" />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Yo\'nalish & Prioritet')}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Tur')}</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newTransfer.transfer_type} onChange={(e) => setNewTransfer({ ...newTransfer, transfer_type: e.target.value })}>
                        <option value="WAREHOUSE">{t('Omborlararo')}</option>
                        <option value="PRODUCTION">{t('Ishlab chiqarish')}</option>
                        <option value="QC">{t('Sifat nazorati')}</option>
                        <option value="RETURN">{t('Qaytarish')}</option>
                        <option value="WASTE">{t('Brak / Chiqindi')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Prioritet')}</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newTransfer.priority} onChange={(e) => setNewTransfer({ ...newTransfer, priority: e.target.value })}>
                        <option value="NORMAL">{t('O\'rtacha')}</option>
                        <option value="LOW">{t('Past')}</option>
                        <option value="HIGH">{t('Yuqori')}</option>
                        <option value="URGENT">{t('SHOSHILINCH')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Workflow')}</label>
                      <div className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold text-sm text-slate-500">
                        DRAFT → PENDING → APPROVED → IN_TRANSIT → RECEIVED → COMPLETED
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 border-dashed">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Chiqish Ombori (From)')}</label>
                      <select required className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm" value={newTransfer.from_warehouse} onChange={(e) => setNewTransfer({ ...newTransfer, from_warehouse: e.target.value })}>
                        <option value="">{t('Tanlang...')}</option>
                        {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Qabul Ombori (To)')}</label>
                      <select required className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm" value={newTransfer.to_warehouse} onChange={(e) => setNewTransfer({ ...newTransfer, to_warehouse: e.target.value })}>
                        <option value="">{t('Tanlang...')}</option>
                        {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Material & Partiya Nazorati')}</h4>
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Blok pasporti')}</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newTransfer.block} onChange={(e) => {
                        const block = blocks.find((item) => Number(item.id) === Number(e.target.value));
                        setNewTransfer({
                          ...newTransfer,
                          block: e.target.value,
                          material: block?.product_id ? String(block.product_id) : newTransfer.material,
                          quantity: block ? '1' : newTransfer.quantity,
                        });
                      }}>
                        <option value="">{t('Blok tanlanmagan')}</option>
                        {movableBlocks.map((block) => <option key={block.id} value={block.id}>{block.block_id} • {block.current_location?.location_code || block.warehouse_name || '-'}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Material / Mahsulot')}</label>
                      <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newTransfer.material} onChange={(e) => setNewTransfer({ ...newTransfer, material: e.target.value, batch: '' })}>
                        <option value="">{t('Tanlang...')}</option>
                        {materials.map((material) => <option key={material.id} value={material.id}>{material.name} ({material.sku || 'SKU'})</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Batch / Blok')}</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newTransfer.batch} onChange={(e) => setNewTransfer({ ...newTransfer, batch: e.target.value })}>
                        <option value="">{t('Batchsiz')}</option>
                        {eligibleBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_number} • {batch.remaining_quantity} kg</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Miqdor')}</label>
                      <input type="number" required min="0.01" step="0.01" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newTransfer.quantity} onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })} placeholder="0.00" />
                    </div>
                  </div>
                  {selectedBlock && (
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-[28px]">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('Tanlangan blok')}</p>
                      <p className="text-sm font-black text-blue-900 mt-1">{selectedBlock.block_id}</p>
                      <p className="text-xs font-bold text-blue-600 mt-1">{selectedBlock.recipe_name} • {selectedBlock.current_location?.location_code || selectedBlock.warehouse_name || '-'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('O\'tkazma Sababi')}</label>
                  <textarea className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none font-bold text-sm min-h-[100px] focus:bg-white focus:shadow-xl transition-all" value={newTransfer.reason} onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })} placeholder={t("Nima uchun bu ko'chirish amalga oshirilmoqda? (Masalan: Ishlab chiqarish ehtiyoji uchun)")} />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('Qo\'shimcha izoh')}</label>
                  <textarea className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none font-bold text-sm min-h-[90px]" value={newTransfer.notes} onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })} placeholder={t('Izohlar')} />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                    {t('Bekor qilish')}
                  </button>
                  <button type="button" disabled={loading} onClick={() => handleCreateTransfer('DRAFT')} className="flex-1 py-6 bg-white border border-slate-200 text-slate-700 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50">
                    {t('Qoralama saqlash')}
                  </button>
                  <button type="button" disabled={loading} onClick={() => handleCreateTransfer('PENDING')} className="flex-[1.7] py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50">
                    {loading ? t('Yaratilmoqda...') : t('Tasdiqlashga yuborish')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTransfer && (
          <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-xl bg-white h-full shadow-2xl p-10 flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTransfer.transfer_number}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t(selectedTransfer.status === 'SHIPPED' ? 'IN_TRANSIT' : selectedTransfer.status)}</p>
                </div>
                <button onClick={() => setSelectedTransfer(null)} className="p-3 bg-slate-50 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('O\'tkazma Tarixi')}</h4>
                  <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    <TimelineItem icon={Plus} color="emerald" title={t('O\'tkazma yaratildi')} time={selectedTransfer.created_at} subtitle={selectedTransfer.created_by_name} />
                    {selectedTransfer.approved_at && <TimelineItem icon={ShieldCheck} color="indigo" title={t('Tasdiqlandi')} time={selectedTransfer.approved_at} />}
                    {selectedTransfer.shipped_at && <TimelineItem icon={Truck} color="blue" title={t('Jo\'natildi')} time={selectedTransfer.shipped_at} />}
                    {selectedTransfer.received_at && <TimelineItem icon={ClipboardCheck} color="green" title={t('Qabul qilindi')} time={selectedTransfer.received_at} />}
                    {selectedTransfer.status === 'COMPLETED' && <TimelineItem icon={CheckCircle2} color="emerald" title={t('Yakunlandi')} time={selectedTransfer.received_at || selectedTransfer.created_at} />}
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('Maqsad / Sabab')}</span>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedTransfer.reason || t('Sabab ko\'rsatilmadi')}"</p>
                  </div>
                  <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <InfoItem label={t('Material')} value={selectedTransfer.material_name} />
                    <InfoItem label={t('Miqdor')} value={`${selectedTransfer.quantity} ${selectedTransfer.material_unit || ''}`} />
                    <InfoItem label={t('Manba')} value={selectedTransfer.from_warehouse_name} />
                    <InfoItem label={t('Qabul nuqtasi')} value={selectedTransfer.to_warehouse_name} />
                    <InfoItem label={t('Batch')} value={selectedTransfer.block_id || selectedTransfer.batch_number || t('Batchsiz')} />
                    <InfoItem label={t('Izohlar')} value={selectedTransfer.notes || '—'} />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-3">
                {selectedTransfer.status === 'DRAFT' && <ActionButton onClick={() => handleAction(selectedTransfer, 'submit')} label={t('Yuborish')} />}
                {selectedTransfer.status === 'PENDING' && <ActionButton onClick={() => handleAction(selectedTransfer, 'approve')} label={t('Tasdiqlash')} />}
                {(selectedTransfer.status === 'IN_TRANSIT' || selectedTransfer.status === 'SHIPPED') && <ActionButton onClick={() => handleAction(selectedTransfer, 'receive')} label={t('Qabul qilish')} />}
                {selectedTransfer.status === 'RECEIVED' && <ActionButton onClick={() => handleAction(selectedTransfer, 'complete')} label={t('Yakunlash')} />}
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

function TimelineItem({ icon: Icon, color, title, time, subtitle }: { icon: any; color: string; title: string; time?: string | null; subtitle?: string | null }) {
  const colorClass: Record<string, string> = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };
  return (
    <div className="flex gap-6 relative z-10">
      <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg ${colorClass[color] || 'bg-slate-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-400">{time ? new Date(time).toLocaleString() : '—'}</p>
        {subtitle && <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
      <p className="text-xs font-black text-slate-900">{value || '—'}</p>
    </div>
  );
}

function ActionButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
      {label}
    </button>
  );
}
