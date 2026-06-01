import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, ArrowDownLeft, Box, ArrowRightLeft, ClipboardList, 
  QrCode, Bell, Clock, ShieldCheck, Thermometer, BoxSelect, AlertTriangle, 
  Layers, Truck, Search, Plus, Trash2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';
import ScannerModal from '../ScannerModal';
import BlockPassport from '../production/BlockPassport';

interface WarehouseWorkspaceProps {
  user: any;
}

type WSubTab = 'INTAKE' | 'STOCK' | 'TRANSFERS' | 'AUDIT' | 'SCANNER' | 'TASKS' | 'ALERTS';

export default function WarehouseWorkspace({ user }: WarehouseWorkspaceProps) {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<WSubTab>('STOCK');
  
  // API Core States
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  
  // Scan & Passport states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);

  // Custom WMS states
  const [criticalThreshold, setCriticalThreshold] = useState(1000);
  const [lastCreatedBatch, setLastCreatedBatch] = useState<any>(null);

  // Kiruvchi Form State
  const [intakeForm, setIntakeForm] = useState({
    material: '',
    supplier: '',
    invoice_number: '',
    quantity_kg: '',
    price_per_unit: '',
    expiry_date: '',
    moisture: '',
    size_mm: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Inventarizatsiya Form State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [auditRemarks, setAuditRemarks] = useState('');
  const [activeAudit, setActiveAudit] = useState<any>(null);
  const [auditLines, setAuditLines] = useState<any[]>([]);
  const [physicalCount, setPhysicalCount] = useState<Record<number, string>>({});

  // Fetch core telemetry and logistics
  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, suppliersRes, warehousesRes, batchesRes, transfersRes, auditsRes] = await Promise.all([
        api.get('materials/').catch(() => ({ data: [] })),
        api.get('suppliers/').catch(() => ({ data: [] })),
        api.get('warehouses/').catch(() => ({ data: [] })),
        api.get('batches/').catch(() => ({ data: [] })),
        api.get('transfers/').catch(() => ({ data: [] })),
        api.get('inventory/audits/').catch(() => ({ data: [] }))
      ]);

      setMaterials(materialsRes.data.results || materialsRes.data || []);
      setSuppliers(suppliersRes.data.results || suppliersRes.data || []);
      setWarehouses(warehousesRes.data.results || warehousesRes.data || []);
      setBatches(batchesRes.data.results || batchesRes.data || []);
      setTransfers(transfersRes.data.results || transfersRes.data || []);
      
      const auditList = auditsRes.data.results || auditsRes.data || [];
      setAudits(auditList);
      
      const ongoing = auditList.find((a: any) => a.status === 'IN_PROGRESS' || a.status === 'DRAFT');
      if (ongoing) {
        setActiveAudit(ongoing);
        setAuditLines(ongoing.lines || []);
      }
    } catch (err) {
      console.error("WMS Fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Intake Action
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.material || !intakeForm.supplier || !intakeForm.invoice_number || !intakeForm.quantity_kg) {
      uiStore.showNotification(t("Barcha majburiy maydonlarni kiriting"), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const now = Date.now();
      const res = await api.post('batches/', {
        material: Number(intakeForm.material),
        supplier: Number(intakeForm.supplier),
        invoice_number: intakeForm.invoice_number,
        quantity_kg: Number(intakeForm.quantity_kg),
        remaining_quantity: Number(intakeForm.quantity_kg),
        price_per_unit: Number(intakeForm.price_per_unit || 0),
        expiry_date: intakeForm.expiry_date || null,
        batch_number: `BAT-${now}`,
        status: 'INSPECTION',
      });

      const selectedMaterial = materials.find(m => String(m.id) === intakeForm.material);
      const selectedSupplier = suppliers.find(s => String(s.id) === intakeForm.supplier);
      setLastCreatedBatch({
        ...res.data,
        material_name: selectedMaterial?.name || 'EPS Granula',
        supplier_name: selectedSupplier?.name || 'Polymer Holding',
        quantity_kg: Number(intakeForm.quantity_kg),
        moisture: intakeForm.moisture || '0.8%',
        size_mm: intakeForm.size_mm || '2.0mm',
        created_at: new Date().toISOString()
      });

      uiStore.showNotification(t("Yangi kiruvchi xomashyo partiyasi muvaffaqiyatli saqlandi"), 'success');
      setIntakeForm({
        material: '', supplier: '', invoice_number: '', quantity_kg: '',
        price_per_unit: '', expiry_date: '', moisture: '', size_mm: ''
      });
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.detail || t("Qabul qilishda xatolik yuz berdi"), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Start Physical Audit
  const handleStartAudit = async () => {
    if (!selectedWarehouseId) {
      uiStore.showNotification(t("Omborni tanlang"), 'error');
      return;
    }
    try {
      const res = await api.post('inventory/audits/', {
        warehouse: Number(selectedWarehouseId),
        remarks: auditRemarks || 'Operational Shift Count'
      });
      const newAudit = res.data;
      await api.post(`inventory/audits/${newAudit.id}/start/`);
      setActiveAudit(newAudit);
      setAuditLines(newAudit.lines || []);
      uiStore.showNotification(t("Inventarizatsiya boshlandi"), 'success');
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(t("Audit boshlashda xatolik yuz berdi"), 'error');
    }
  };

  // Complete Physical Audit Line
  const handleSaveLineCount = async (lineId: number) => {
    const countVal = physicalCount[lineId];
    if (!countVal || isNaN(Number(countVal))) {
      uiStore.showNotification(t("Miqdorni to'g'ri formatda kiriting"), 'error');
      return;
    }
    try {
      await api.post(`inventory/audits/${activeAudit.id}/count_line/`, {
        line_id: lineId,
        physical_qty: Number(countVal)
      });
      uiStore.showNotification(t("Hisob kitob qilindi"), 'success');
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Saqlashda xatolik"), 'error');
    }
  };

  // Finish Audit Session
  const handleCompleteAudit = async () => {
    try {
      await api.post(`inventory/audits/${activeAudit.id}/complete/`, {
        remarks: t("Smena hisobi bo'yicha to'liq yakunlandi")
      });
      uiStore.showNotification(t("Inventarizatsiya muvaffaqiyatli yakunlandi va yopildi"), 'success');
      setActiveAudit(null);
      setAuditLines([]);
      setPhysicalCount({});
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Auditni yopishda xatolik"), 'error');
    }
  };

  // Approve Movement Transfer
  const handleApproveTransfer = async (transferId: number, type: 'APPROVE' | 'DISPATCH') => {
    try {
      if (type === 'APPROVE') {
        await api.post(`transfers/${transferId}/receive/`);
        uiStore.showNotification(t("O'tkazma muvaffaqiyatli qabul qilindi"), 'success');
      } else {
        await api.post(`transfers/${transferId}/dispatch/`);
        uiStore.showNotification(t("Material yuklab yuborildi"), 'success');
      }
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Amalda xatolik yuz berdi"), 'error');
    }
  };

  const handleScanResult = (result: any) => {
    if (result) {
      setSelectedBlock(result);
    }
    setScannerOpen(false);
  };

  // WMS Operational Summary Stats
  const rawMaterialStocks = batches.reduce((acc, curr) => acc + Number(curr.remaining_quantity || 0), 0);
  const criticalItems = batches.filter(b => b.remaining_quantity < criticalThreshold).length;
  const pendingIncomingCount = transfers.filter(t => t.status === 'PENDING' || t.status === 'IN_TRANSIT').length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] pb-12">
      
      {/* 🚀 LEFT BAR: OPERATIONAL MENU */}
      <div className="w-full lg:w-72 bg-slate-900 border border-slate-800 rounded-[32px] p-6 flex flex-col justify-between shrink-0 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Database className="w-6 h-6 text-emerald-400" />
              WMS Terminal
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{t("Bosh Ombor Boshqaruvi")}</p>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'STOCK', label: 'Ombor qoldig‘i', icon: Box, color: 'text-emerald-400 bg-emerald-500/10' },
              { id: 'INTAKE', label: 'Kiruvchi (Intake)', icon: ArrowDownLeft, color: 'text-blue-400 bg-blue-500/10' },
              { id: 'TRANSFERS', label: 'Transferlar', icon: ArrowRightLeft, color: 'text-sky-400 bg-sky-500/10' },
              { id: 'AUDIT', label: 'Inventarizatsiya', icon: ClipboardList, color: 'text-amber-400 bg-amber-500/10' },
              { id: 'TASKS', label: 'Bugungi ishlar', icon: Clock, color: 'text-slate-400 bg-slate-500/10' },
              { id: 'ALERTS', label: 'Alarmlar', icon: Bell, color: 'text-rose-400 bg-rose-500/10', count: criticalItems },
            ].map((menu) => {
              const isActive = activeSubTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveSubTab(menu.id as WSubTab)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <menu.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : menu.color.split(' ')[0]}`} />
                    <span>{t(menu.label)}</span>
                  </div>
                  {menu.count !== undefined && menu.count > 0 && (
                    <span className="w-5 h-5 bg-rose-500 text-white rounded-lg text-[9px] font-black flex items-center justify-center border-2 border-slate-900">
                      {menu.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Telemetry summary */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
          <button 
            onClick={() => setScannerOpen(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-700 shadow-md active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            {t("Smart Scan")}
          </button>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">{t("Ombor operatsiyalari")}</span>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>{t("Xomashyo")}:</span>
              <span className="text-emerald-400">{rawMaterialStocks.toLocaleString()} kg</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>{t("Navbatdagi o'tkazmalar")}:</span>
              <span className="text-sky-400">{pendingIncomingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 RIGHT CONTENT: MAIN SCREEN DISPLAY */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm min-h-[500px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex h-full items-center justify-center py-24">
              <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <span className="text-sm font-semibold text-slate-600">{t('Qurilma ulanyapti...')}</span>
              </div>
            </div>
          ) : (
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* ============ 1. STOCK (OMBOR QOLDIG'I) ============ */}
              {activeSubTab === 'STOCK' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Ombor Qoldiqlari & Zaxira Holati")}</h3>
                    <p className="text-slate-500 font-medium">{t("Bosh xomashyo omboridagi barcha granulalar va materiallar FIFO hisobi")}</p>
                  </div>

                  {/* Silo thermodynamics / capacity visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { id: 'Silo-1', label: 'EPS Granula Class-A', level: 85, temp: '32.4°C', color: 'emerald', weight: '22,400 kg' },
                      { id: 'Silo-2', label: 'EPS Granula Class-B', level: 42, temp: '34.1°C', color: 'amber', weight: '10,800 kg' },
                      { id: 'Silo-3', label: 'EPS Granula Class-C', level: 12, temp: '29.8°C', color: 'rose', weight: '3,100 kg' },
                      { id: 'Silo-4', label: 'Kimyo & Qo‘shimchalar', level: 90, temp: '24.2°C', color: 'indigo', weight: '4,500 kg' },
                    ].map((silo) => (
                      <div key={silo.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between min-h-[240px] relative overflow-hidden group hover:shadow-xl hover:bg-white transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{silo.id}</span>
                            <h4 className="text-sm font-black text-slate-900 leading-tight mt-1">{silo.label}</h4>
                          </div>
                          <Thermometer className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                        </div>

                        {/* Liquid/Silo filling tube visualization */}
                        <div className="w-full bg-slate-200/50 rounded-2xl h-12 relative overflow-hidden mb-4 border border-slate-200/20 shadow-inner">
                          <div className={`h-full bg-${silo.color}-500/80 transition-all rounded-r-xl`} style={{ width: `${silo.level}%` }} />
                          <div className="absolute inset-0 flex items-center justify-between px-4 text-[10px] font-black text-slate-900 uppercase">
                            <span>{t("Hajm")}</span>
                            <span>{silo.level}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{t("Massa")}</p>
                            <p className="text-base font-black text-slate-900">{silo.weight}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase">{t("Harorat")}</p>
                            <p className="text-xs font-black text-slate-900">{silo.temp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-[32px] border border-slate-100 p-6">
                    <h4 className="text-base font-black text-slate-900 mb-4">{t("Batafsil FIFO Partiyalar Jurnali")}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3">
                            <th className="py-3 px-4">{t("Partiya kodi")}</th>
                            <th className="py-3 px-4">{t("Material xili")}</th>
                            <th className="py-3 px-4">{t("Ombor qoldig'i")}</th>
                            <th className="py-3 px-4">{t("Yuk xati")}</th>
                            <th className="py-3 px-4">{t("Partiya Yoshi (FIFO)")}</th>
                            <th className="py-3 px-4">{t("QC holati")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batches.slice(0, 8).map((b) => (
                            <tr key={b.id} className="border-b border-slate-200/50 hover:bg-white transition-all font-semibold text-sm">
                              <td className="py-4 px-4 font-black text-slate-900">{b.batch_number}</td>
                              <td className="py-4 px-4 text-slate-700">{b.material_name}</td>
                              <td className="py-4 px-4 font-black text-slate-900">{b.remaining_quantity} kg</td>
                              <td className="py-4 px-4 text-slate-500">{b.invoice_number}</td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const ageHours = Math.round((Date.now() - new Date(b.created_at || b.date || Date.now()).getTime()) / (1000 * 60 * 60));
                                  const ageDays = Math.floor(ageHours / 24);
                                  if (isNaN(ageHours)) return <span className="text-slate-400">—</span>;
                                  
                                  if (ageHours < 48) {
                                    return (
                                      <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-black uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {ageHours} {t("soat")} ({t("Yangi")})
                                      </span>
                                    );
                                  } else if (ageDays < 7) {
                                    return (
                                      <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 font-black uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {ageDays} {t("kun")} ({t("Standart")})
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="inline-flex items-center gap-1.5 text-[10px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 font-black uppercase animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        {ageDays} {t("kun")} ({t("FIFO: Tezkor")})
                                      </span>
                                    );
                                  }
                                })()}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  b.status === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {t(b.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ 2. INTAKE (QABUL QILISH FORM) ============ */}
              {activeSubTab === 'INTAKE' && (
                <div className="space-y-6 animate-in slide-in-from-left duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Xomashyo Qabul Qilish (Kirim Terminali)")}</h3>
                    <p className="text-slate-500 font-medium">{t("Yetkazib berilgan xomashyolarni smart qabul qilish va QC ro'yxatga olish")}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Intake Form */}
                    <div className="lg:col-span-7">
                      <form onSubmit={handleIntakeSubmit} className="space-y-6 bg-slate-50 p-8 rounded-[36px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Xomashyo turi (Material)")} *</label>
                            <select
                              required
                              value={intakeForm.material}
                              onChange={(e) => setIntakeForm({ ...intakeForm, material: e.target.value })}
                              className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none rounded-2xl font-bold text-sm"
                            >
                              <option value="">{t("Tanlang...")}</option>
                              {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Ta'minotchi (Supplier)")} *</label>
                            <select
                              required
                              value={intakeForm.supplier}
                              onChange={(e) => setIntakeForm({ ...intakeForm, supplier: e.target.value })}
                              className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none rounded-2xl font-bold text-sm"
                            >
                              <option value="">{t("Tanlang...")}</option>
                              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Yuk xati raqami (Invoice #)")} *</label>
                            <input
                              required
                              value={intakeForm.invoice_number}
                              onChange={(e) => setIntakeForm({ ...intakeForm, invoice_number: e.target.value })}
                              type="text"
                              placeholder="e.g. INVOICE-841A"
                              className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none rounded-2xl font-bold text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Qabul qilingan og'irlik (kg)")} *</label>
                            <input
                              required
                              value={intakeForm.quantity_kg}
                              onChange={(e) => setIntakeForm({ ...intakeForm, quantity_kg: e.target.value })}
                              type="number"
                              placeholder="e.g. 5000"
                              className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none rounded-2xl font-bold text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Xarid narxi (UZS per kg)")}</label>
                            <input
                              value={intakeForm.price_per_unit}
                              onChange={(e) => setIntakeForm({ ...intakeForm, price_per_unit: e.target.value })}
                              type="number"
                              placeholder="e.g. 14000"
                              className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none rounded-2xl font-bold text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Yaroqlilik muddati")}</label>
                            <input
                              value={intakeForm.expiry_date}
                              onChange={(e) => setIntakeForm({ ...intakeForm, expiry_date: e.target.value })}
                              type="date"
                              className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none rounded-2xl font-bold text-sm"
                            />
                          </div>
                        </div>

                        {/* Quality control physical test results */}
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-4">
                          <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            {t("Smart QC Laboratoriya ko'rsatkichlari (Majburiy)")}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              value={intakeForm.moisture}
                              onChange={(e) => setIntakeForm({ ...intakeForm, moisture: e.target.value })}
                              type="text"
                              placeholder={t("Namlik darajasi (%)")}
                              className="w-full p-3.5 bg-white border border-slate-100 focus:border-emerald-500 outline-none rounded-xl font-bold text-sm shadow-sm"
                            />
                            <input
                              value={intakeForm.size_mm}
                              onChange={(e) => setIntakeForm({ ...intakeForm, size_mm: e.target.value })}
                              type="text"
                              placeholder={t("Granula o'lchami (mm)")}
                              className="w-full p-3.5 bg-white border border-slate-100 focus:border-emerald-500 outline-none rounded-xl font-bold text-sm shadow-sm"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                          {submitting ? t("Partiya yaratilmoqda...") : t("Qabul qilish va FIFO partiya yaratish")}
                        </button>
                      </form>
                    </div>

                    {/* QR Label Output */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      {lastCreatedBatch ? (
                        <div className="bg-white border border-slate-200 p-8 rounded-[36px] shadow-lg flex flex-col justify-between min-h-[500px]">
                          <div>
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t("Partiya QR Yorlig'i")}</h4>
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">{t("Yaratildi")}</span>
                            </div>

                            {/* Beautiful SVG QR label container */}
                            <div className="border border-dashed border-slate-300 p-6 rounded-3xl bg-slate-50 flex flex-col items-center justify-center space-y-4">
                              <span className="text-[10px] font-black text-slate-400 tracking-wider">YUKSAR SCADA-WMS</span>
                              
                              <svg className="w-40 h-40" viewBox="0 0 100 100">
                                <rect x="5" y="5" width="20" height="20" fill="#0f172a" />
                                <rect x="10" y="10" width="10" height="10" fill="#f8fafc" />
                                
                                <rect x="75" y="5" width="20" height="20" fill="#0f172a" />
                                <rect x="80" y="10" width="10" height="10" fill="#f8fafc" />
                                
                                <rect x="5" y="75" width="20" height="20" fill="#0f172a" />
                                <rect x="10" y="80" width="10" height="10" fill="#f8fafc" />
                                
                                <rect x="35" y="10" width="5" height="5" fill="#0f172a" />
                                <rect x="50" y="15" width="5" height="10" fill="#0f172a" />
                                <rect x="60" y="5" width="10" height="5" fill="#0f172a" />
                                <rect x="30" y="30" width="10" height="5" fill="#0f172a" />
                                <rect x="45" y="35" width="5" height="5" fill="#0f172a" />
                                <rect x="55" y="45" width="15" height="5" fill="#0f172a" />
                                
                                <rect x="10" y="35" width="5" height="15" fill="#0f172a" />
                                <rect x="20" y="55" width="5" height="5" fill="#0f172a" />
                                
                                <rect x="75" y="30" width="5" height="10" fill="#0f172a" />
                                <rect x="85" y="40" width="10" height="5" fill="#0f172a" />
                                <rect x="90" y="55" width="5" height="15" fill="#0f172a" />
                                
                                <rect x="35" y="60" width="15" height="5" fill="#0f172a" />
                                <rect x="40" y="70" width="5" height="10" fill="#0f172a" />
                                <rect x="55" y="75" width="10" height="5" fill="#0f172a" />
                                <rect x="70" y="80" width="5" height="15" fill="#0f172a" />
                              </svg>

                              <span className="font-mono text-sm font-black text-slate-800 tracking-wider">{lastCreatedBatch.batch_number}</span>
                            </div>

                            <div className="mt-6 space-y-3 font-semibold text-xs text-slate-600">
                              <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span>{t("Material")}:</span>
                                <span className="font-extrabold text-slate-900">{lastCreatedBatch.material_name}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span>{t("Ta'minotchi")}:</span>
                                <span className="font-extrabold text-slate-900">{lastCreatedBatch.supplier_name}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span>{t("Og'irlik")}:</span>
                                <span className="font-extrabold text-slate-900">{lastCreatedBatch.quantity_kg?.toLocaleString()} kg</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span>{t("Namlik")}:</span>
                                <span className="font-extrabold text-slate-900">{lastCreatedBatch.moisture}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t("Granula o'lchami")}:</span>
                                <span className="font-extrabold text-slate-900">{lastCreatedBatch.size_mm}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => window.print()}
                            className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                          >
                            {t("Yorliqni Chop Etish")}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200/60 p-8 rounded-[36px] flex flex-col items-center justify-center text-center min-h-[500px] text-slate-400">
                          <QrCode className="w-16 h-16 mb-4 text-slate-300 animate-pulse" />
                          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-1">{t("Yorliq generatori")}</h4>
                          <p className="text-[10px] leading-relaxed max-w-[240px]">{t("Yangi xomashyo partiyasini qabul qilganingizdan so'ng, chop etish uchun QR yorlig'i shu yerda avtomatik ravishda yaratiladi.")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ============ 3. TRANSFERS (ICHKI O'TKAZMALAR) ============ */}
              {activeSubTab === 'TRANSFERS' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Ichki yuk tashuvlari va O'tkazmalar")}</h3>
                    <p className="text-slate-500 font-medium">{t("Sexlararo va omborlararo tasdiqlanishi kutilayotgan harakatlar")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {transfers.filter(tr => tr.status !== 'COMPLETED' && tr.status !== 'CANCELLED').length === 0 ? (
                      <div className="col-span-2 bg-slate-50 p-12 rounded-[32px] border border-slate-100 text-center">
                        <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{t("Faol transferlar mavjud emas")}</h4>
                        <p className="text-xs text-slate-500 mt-1">{t("Smena davomida barcha yuk o'tkazmalari muvaffaqiyatli yakunlangan.")}</p>
                      </div>
                    ) : (
                      transfers
                        .filter(tr => tr.status !== 'COMPLETED' && tr.status !== 'CANCELLED')
                        .map((tr) => (
                          <div key={tr.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between min-h-[220px] group hover:shadow-lg transition-all">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 text-[8px] font-black rounded-lg uppercase tracking-wider">#{tr.id}</span>
                                <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                                  tr.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {t(tr.status)}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 leading-snug">{tr.material_name || tr.product_name}</h4>
                              <p className="text-xs font-bold text-slate-500 mt-1">
                                {t("Yo'nalish")}: <span className="text-slate-800 font-extrabold">{tr.from_warehouse_name || 'Bosh Ombor'} &rarr; {tr.to_warehouse_name || 'Sex'}</span>
                              </p>
                              <p className="text-xs font-bold text-slate-500 mt-1">
                                {t("Miqdor")}: <span className="text-indigo-600 font-black">{tr.quantity || tr.quantity_kg} kg</span>
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400">{new Date(tr.created_at || tr.date).toLocaleDateString()}</span>
                              <div className="flex gap-2">
                                {tr.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleApproveTransfer(tr.id, 'DISPATCH')}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                  >
                                    {t("Yuklab yuborish")}
                                  </button>
                                )}
                                {tr.status === 'IN_TRANSIT' && (
                                  <button
                                    onClick={() => handleApproveTransfer(tr.id, 'APPROVE')}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                                  >
                                    {t("Qabul qilish")}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* ============ 4. AUDIT (INVENTARIZATSIYA) ============ */}
              {activeSubTab === 'AUDIT' && (
                <div className="space-y-6 animate-in slide-in-from-bottom duration-500 max-w-3xl">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Inventarizatsiya & Hisob Audit")}</h3>
                    <p className="text-slate-500 font-medium">{t("Ombor qoldiqlarini physical sanash va buxgalteriyadagi farqni aniqlash")}</p>
                  </div>

                  {!activeAudit ? (
                    <div className="bg-slate-50 p-8 rounded-[36px] border border-slate-100 space-y-6">
                      <h4 className="text-base font-black text-slate-900">{t("Yangi Inventarizatsiya Sessiyasi Boshlash")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Sanash o'tkaziladigan ombor")}</label>
                          <select
                            value={selectedWarehouseId}
                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                            className="w-full p-4 bg-white border border-slate-200 outline-none rounded-2xl font-bold text-sm"
                          >
                            <option value="">{t("Tanlang...")}</option>
                            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Izohlar & Qo'shimchalar")}</label>
                          <input
                            value={auditRemarks}
                            onChange={(e) => setAuditRemarks(e.target.value)}
                            type="text"
                            placeholder="e.g. Smena almashinuvi davridagi tekshiruv"
                            className="w-full p-4 bg-white border border-slate-200 outline-none rounded-2xl font-bold text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleStartAudit}
                        className="w-full bg-emerald-600 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                      >
                        {t("Auditni Boshlash")}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 bg-slate-50 p-8 rounded-[36px] border border-slate-100">
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                        <div>
                          <h4 className="text-base font-black text-slate-900">{t("Faol Audit Sessiyasi")} #{activeAudit.id}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase mt-1">{t("Ombor")}: {activeAudit.warehouse_name || 'Main Warehouse'}</p>
                        </div>
                        <button
                          onClick={handleCompleteAudit}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                          {t("Auditni Yakunlash")}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Mahsulotlarni Haqiqiy Miqdorini Kiriting")}</h4>
                        <div className="space-y-3">
                          {auditLines.map((line) => (
                            <div key={line.id} className="bg-white p-5 rounded-2xl border border-slate-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h5 className="text-sm font-black text-slate-900">{line.material_name || line.product_name}</h5>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{t("Tizimda")}: {line.system_qty} kg</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  value={physicalCount[line.id] || ''}
                                  onChange={(e) => setPhysicalCount({ ...physicalCount, [line.id]: e.target.value })}
                                  type="text"
                                  placeholder={t("Haqiqiy miqdor")}
                                  className="w-32 p-3 bg-slate-50 border border-slate-200 outline-none rounded-xl font-bold text-xs"
                                />
                                <button
                                  onClick={() => handleSaveLineCount(line.id)}
                                  className="px-4 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                  {t("Saqlash")}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============ 5. TASKS (BUGUNGI ISHLAR) ============ */}
              {activeSubTab === 'TASKS' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Bugungi Ish Rejalari va topshiriqlar")}</h3>
                    <p className="text-slate-500 font-medium">{t("Smena davomida bajarilishi majburiy bo'lgan ombor logistika ishlari")}</p>
                  </div>

                  <div className="bg-slate-50 rounded-[36px] border border-slate-100 p-8 space-y-4">
                    {[
                      { id: 1, text: "Granula xomashyolarini saralash va Silo-1 ga 3,000kg yuklash", done: true, priority: 'HIGH' },
                      { id: 2, text: "CNC kesish sexiga 15 ta tayyor blokni o'tkazish logistikasini tasdiqlash", done: false, priority: 'HIGH' },
                      { id: 3, text: "Ta'minotchi 'Polymer Holding' dan kiruvchi yuk xatini qabul qilish", done: false, priority: 'MEDIUM' },
                      { id: 4, text: "Ombor qoldiqlarini 100% inventarizatsiyadan o'tkazish", done: false, priority: 'LOW' }
                    ].map((task) => (
                      <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200/50 flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors cursor-pointer'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t(task.text)}</p>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1.5 inline-block ${
                              task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                              task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                            }`}>{t(task.priority)}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Duty</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============ 6. ALERTS (ALARMLAR) ============ */}
              {activeSubTab === 'ALERTS' && (
                <div className="space-y-6 animate-in slide-in-from-top duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("Kritik Ombor Alarmlari (ASU-WMS)")}</h3>
                    <p className="text-slate-500 font-medium">{t("Xavfsizlik datchiklari, material qoldiqlari va harorat haqida ogohlantirishlar")}</p>
                  </div>

                  {/* Threshold Control Card */}
                  <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{t("Kritik Zaxira Chegarasi (Threshold)")}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("Ogohlantirish beriladigan minimal material darajasi")}</p>
                      </div>
                      <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-xl text-xs font-black">{criticalThreshold.toLocaleString()} kg</span>
                    </div>

                    <input 
                      type="range" 
                      min="100" 
                      max="5000" 
                      step="100"
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      value={criticalThreshold}
                      onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 100)}
                    />
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <span>100 kg</span>
                      <span>1,000 kg</span>
                      <span>2,500 kg</span>
                      <span>5,000 kg</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {criticalItems === 0 ? (
                      <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[32px] text-center text-emerald-800">
                        <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                        <h4 className="font-black uppercase tracking-widest text-sm">{t("Tizimda ogohlantirishlar yo'q")}</h4>
                        <p className="text-xs mt-1">{t("Barcha omborlar normal termodinamik va zaxira holatida.")}</p>
                      </div>
                    ) : (
                      batches
                        .filter(b => b.remaining_quantity < criticalThreshold)
                        .map((b) => (
                          <div key={b.id} className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                                <AlertTriangle className="w-6 h-6 animate-pulse" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-rose-800 leading-snug">{t("Zaxira kritik darajada kam")}: {b.material_name}</h4>
                                <p className="text-xs text-rose-700 font-bold mt-1">
                                  {t("Partiya")}: {b.batch_number} • {t("Qoldiq")}: <span className="underline font-extrabold">{b.remaining_quantity} kg</span>
                                </p>
                              </div>
                            </div>
                            <span className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                              {t("Zudlik bilan to'ldirish shart")}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global WMS Modals */}
      {scannerOpen && (
        <ScannerModal onClose={() => setScannerOpen(false)} onScan={handleScanResult} type="BLOCK" />
      )}
      {selectedBlock && (
        <BlockPassport block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}
    </div>
  );
}
