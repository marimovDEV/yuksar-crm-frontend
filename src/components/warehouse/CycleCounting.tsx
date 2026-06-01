import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { Search, ClipboardList, ScanLine, AlertTriangle, CheckCircle2, FileText, Camera, X } from 'lucide-react';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';
import { InventoryAudit, InventoryAuditLine, Warehouse } from '../../types';

export default function CycleCounting() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(null);
  const [warehouseId, setWarehouseId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [evidenceByLine, setEvidenceByLine] = useState<Record<number, string>>({});
  const [draftCounts, setDraftCounts] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeEvidenceLine, setActiveEvidenceLine] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auditsRes, warehousesRes] = await Promise.all([
        api.get('inventory/audits/'),
        api.get('warehouses/'),
      ]);
      setAudits(auditsRes.data.results || auditsRes.data);
      setWarehouses(warehousesRes.data.results || warehousesRes.data);
    } catch (err) {
      uiStore.showNotification("Inventarizatsiya ma'lumotlarini yuklab bo'lmadi", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAudits = audits.filter((audit) =>
    audit.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.lines?.some((line) => line.material_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const submitCount = async (auditId: number, line: InventoryAuditLine) => {
    const value = draftCounts[line.id];
    if (value === undefined || value === '') {
      uiStore.showNotification("Sanalgan miqdorni kiriting", 'error');
      return;
    }
    try {
      const res = await api.post(`inventory/audits/${auditId}/count_line/`, {
        line_id: line.id,
        actual_qty: Number(value),
      });
      setSelectedAudit(res.data);
      setAudits((current) => current.map((audit) => audit.id === res.data.id ? res.data : audit));
      uiStore.showNotification("Audit qatori yangilandi", 'success');
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Sanalgan miqdor saqlanmadi", 'error');
    }
  };

  const createAudit = async () => {
    if (!warehouseId) {
      uiStore.showNotification("Omborni tanlang", 'error');
      return;
    }
    try {
      const res = await api.post('inventory/audits/', { warehouse: Number(warehouseId), remarks });
      uiStore.showNotification("Yangi audit yaratildi", 'success');
      setCreateOpen(false);
      setWarehouseId('');
      setRemarks('');
      setSelectedAudit(res.data);
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Audit yaratilmadi", 'error');
    }
  };

  const startAudit = async (audit: InventoryAudit) => {
    try {
      const res = await api.post(`inventory/audits/${audit.id}/start/`);
      setSelectedAudit(res.data);
      setAudits((current) => current.map((item) => item.id === res.data.id ? res.data : item));
      uiStore.showNotification("Audit boshlandi", 'success');
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Audit boshlanmadi", 'error');
    }
  };

  const completeAudit = async () => {
    if (!selectedAudit) return;
    try {
      const res = await api.post(`inventory/audits/${selectedAudit.id}/complete/`, { remarks });
      setSelectedAudit(res.data);
      setAudits((current) => current.map((item) => item.id === res.data.id ? res.data : item));
      uiStore.showNotification("Audit yakunlandi", 'success');
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Auditni yakunlab bo'lmadi", 'error');
    }
  };

  const startLatestDraftAudit = () => {
    const latest = audits.find((audit) => audit.status === 'DRAFT') || audits[0];
    if (!latest) {
      setCreateOpen(true);
      return;
    }
    setSelectedAudit(latest);
    startAudit(latest);
  };

  const handleEvidenceClick = (lineId: number) => {
    setActiveEvidenceLine(lineId);
    fileInputRef.current?.click();
  };

  const handleEvidenceSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || activeEvidenceLine === null) return;
    setEvidenceByLine((current) => ({ ...current, [activeEvidenceLine]: file.name }));
    uiStore.showNotification("Foto isbot biriktirildi", 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleEvidenceSelected} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform" />
          <div className="relative z-10">
            <ClipboardList className="w-8 h-8 mb-4 text-blue-400" />
            <h3 className="text-2xl font-black mb-1">Cycle Counting</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Professional Inventarizatsiya')}</p>
          </div>
        </div>

        <button onClick={startLatestDraftAudit} className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center text-emerald-600 gap-3 group">
          <ScanLine className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm uppercase tracking-widest">{t('Scan Orqali Sanash')}</span>
        </button>

        <button onClick={() => setCreateOpen(true)} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center text-slate-600 gap-3 group">
          <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm uppercase tracking-widest">{t('Yangi Audit Yaratish')}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{t('Joriy Auditlar (Diff Analysis)')}</h4>
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("Zona yoki material qidirish...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-all font-bold text-xs"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Audit ID / Sana')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Obyekt (Zona / Material)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Kutilmoqda (System)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Haqiqiy (Counted)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Farq (Diff)')}</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Status / Auditor')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm font-bold text-slate-400">{t('Yuklanmoqda...')}</td></tr>
              ) : filteredAudits.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm font-bold text-slate-400">{t('Auditlar topilmadi')}</td></tr>
              ) : filteredAudits.flatMap((audit) => audit.lines.map((line) => (
                <tr key={line.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <button onClick={() => setSelectedAudit(audit)} className="font-black text-slate-900 text-sm hover:text-blue-600">{`AUD-${audit.id}`}</button>
                    <div className="text-[10px] font-bold text-slate-500">{new Date(audit.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{line.material_name}</div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{audit.warehouse_name}</div>
                  </td>
                  <td className="p-4 font-black text-slate-400">{line.system_qty}</td>
                  <td className="p-4">
                    {line.actual_qty !== null ? (
                      <span className="font-black text-slate-900">{line.actual_qty}</span>
                    ) : (
                      <button onClick={() => setSelectedAudit(audit)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100">
                        {t('Kiritish')}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    {line.actual_qty !== null && (
                      <div className={`font-black ${Number(line.variance) === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {Number(line.variance) > 0 ? '+' : ''}{line.variance}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 w-fit ${
                          audit.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                          line.actual_qty !== null && Number(line.variance) !== 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {audit.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {audit.status === 'COMPLETED' ? t('MATCHED') : line.actual_qty !== null && Number(line.variance) !== 0 ? t('MISMATCH') : t('PENDING')}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{audit.auditor_name || '—'}</span>
                      </div>
                      {line.actual_qty !== null && Number(line.variance) !== 0 && (
                        <button onClick={() => handleEvidenceClick(line.id)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200" title={t('Foto Isbot Yuklash')}>
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {evidenceByLine[line.id] && (
                      <div className="text-[10px] font-bold text-blue-500 mt-2">{evidenceByLine[line.id]}</div>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">{t('Yangi Audit Yaratish')}</h3>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                <option value="">{t('Omborni tanlang...')}</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
              </select>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={t('Izohlar')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold min-h-[120px]" />
              <button onClick={createAudit} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700">
                {t('Auditni yaratish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedAudit.warehouse_name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t(selectedAudit.status_display || selectedAudit.status)}</p>
              </div>
              <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {selectedAudit.lines.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-3 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="col-span-4">
                    <p className="text-sm font-black text-slate-900">{line.material_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Tizimdagi qoldiq')}: {line.system_qty}</p>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={draftCounts[line.id] ?? (line.actual_qty ?? '')}
                      onChange={(e) => setDraftCounts((current) => ({ ...current, [line.id]: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold"
                      placeholder={t('Haqiqiy (Counted)')}
                    />
                  </div>
                  <div className="col-span-2 text-sm font-black text-slate-500">
                    {line.actual_qty !== null ? `${line.variance > 0 ? '+' : ''}${line.variance}` : '—'}
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button onClick={() => handleEvidenceClick(line.id)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600">
                      <Camera className="w-4 h-4" />
                    </button>
                    <button onClick={() => submitCount(selectedAudit.id, line)} className="px-4 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {t('Saqlash')}
                    </button>
                  </div>
                </div>
              ))}
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={t('Izohlar')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold min-h-[100px]" />
              <div className="flex gap-3">
                {selectedAudit.status !== 'IN_PROGRESS' && selectedAudit.status !== 'COMPLETED' && (
                  <button onClick={() => startAudit(selectedAudit)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">
                    {t('Auditni boshlash')}
                  </button>
                )}
                <button onClick={completeAudit} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest">
                  {t('Auditni yakunlash')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
