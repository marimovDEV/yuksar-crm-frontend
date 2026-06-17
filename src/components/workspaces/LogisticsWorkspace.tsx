import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Truck, MapPin, Phone, CheckCircle2, Clock, ChevronRight,
  Package, Search, X, User as UserIcon, RefreshCw,
  AlertTriangle, FileText, Fuel, Navigation, Car, BarChart3
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

const ScannerModal = lazy(() => import('../ScannerModal'));

interface LogisticsWorkspaceProps {
  user: any;
}

type LTab = 'DASHBOARD' | 'TRIPS' | 'VEHICLES' | 'DRIVERS' | 'WAYBILLS' | 'DELIVERIES' | 'FUEL';

export default function LogisticsWorkspace({ user }: LogisticsWorkspaceProps) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<LTab>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Data state
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [waybills, setWaybills] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);

  // Search
  const [search, setSearch] = useState('');

  // Trip complete form
  const [completingTrip, setCompletingTrip] = useState<any>(null);
  const [actualDistance, setActualDistance] = useState('');
  const [completing, setCompleting] = useState(false);

  // Waybill form
  const [showWaybillForm, setShowWaybillForm] = useState(false);
  const [waybillForm, setWaybillForm] = useState({ driver: '', vehicle_number: '', destination: '', purpose: 'CLIENT', notes: '' });
  const [savingWaybill, setSavingWaybill] = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [tripsRes, vehiclesRes, driversRes, waybillsRes, deliveriesRes, fuelRes] = await Promise.all([
        api.get('transport/trips/').catch(() => ({ data: [] })),
        api.get('transport/vehicles/').catch(() => ({ data: [] })),
        api.get('transport/drivers/').catch(() => ({ data: [] })),
        api.get('transport/waybills/').catch(() => ({ data: [] })),
        api.get('sales/deliveries/').catch(() => ({ data: [] })),
        api.get('transport/fuel-logs/').catch(() => ({ data: [] })),
      ]);
      setTrips(Array.isArray(tripsRes.data?.results || tripsRes.data) ? tripsRes.data?.results || tripsRes.data : []);
      setVehicles(Array.isArray(vehiclesRes.data?.results || vehiclesRes.data) ? vehiclesRes.data?.results || vehiclesRes.data : []);
      setDrivers(Array.isArray(driversRes.data?.results || driversRes.data) ? driversRes.data?.results || driversRes.data : []);
      setWaybills(Array.isArray(waybillsRes.data?.results || waybillsRes.data) ? waybillsRes.data?.results || waybillsRes.data : []);
      setDeliveries(Array.isArray(deliveriesRes.data?.results || deliveriesRes.data) ? deliveriesRes.data?.results || deliveriesRes.data : []);
      setFuelLogs(Array.isArray(fuelRes.data?.results || fuelRes.data) ? fuelRes.data?.results || fuelRes.data : []);
    } catch (err) {
      console.error('LogisticsWorkspace fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCompleteTrip = async () => {
    if (!completingTrip || !actualDistance) return;
    setCompleting(true);
    try {
      await api.post(`transport/trips/${completingTrip.id}/complete/`, { actual_distance: parseFloat(actualDistance) });
      uiStore.showNotification(t('Safar muvaffaqiyatli yakunlandi'), 'success');
      setCompletingTrip(null);
      setActualDistance('');
      fetchAll(true);
    } catch {
      uiStore.showNotification(t('Yakunlashda xatolik'), 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleSaveWaybill = async () => {
    setSavingWaybill(true);
    try {
      await api.post('transport/waybills/', waybillForm);
      uiStore.showNotification(t('Yo\'l varag\'i yaratildi'), 'success');
      setShowWaybillForm(false);
      setWaybillForm({ driver: '', vehicle_number: '', destination: '', purpose: 'CLIENT', notes: '' });
      fetchAll(true);
    } catch {
      uiStore.showNotification(t('Saqlashda xatolik'), 'error');
    } finally {
      setSavingWaybill(false);
    }
  };

  // Derived KPIs
  const activeTrips = trips.filter(t => t.status === 'EN_ROUTE' || t.status === 'PENDING').length;
  const completedToday = trips.filter(t => {
    const d = t.end_time || t.updated_at;
    return (t.status === 'COMPLETED' || t.status === 'DELIVERED') && d?.startsWith(new Date().toISOString().split('T')[0]);
  }).length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE' || !v.status).length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING').length;
  const lateTrips = trips.filter(t => {
    if (t.status !== 'EN_ROUTE') return false;
    const eta = t.estimated_arrival || t.eta;
    return eta && new Date(eta) < new Date();
  }).length;

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'EN_ROUTE': case 'SENT': return 'bg-blue-100 text-blue-700';
      case 'DELIVERED': case 'COMPLETED': case 'RECEIVED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const statusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'EN_ROUTE': return 'Yo\'lda';
      case 'SENT': return 'Yuborildi';
      case 'DELIVERED': return 'Yetkazildi';
      case 'COMPLETED': return 'Yakunlandi';
      case 'PENDING': return 'Kutmoqda';
      case 'RECEIVED': return 'Qabul qilindi';
      case 'CANCELLED': return 'Bekor';
      default: return status || '—';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-sky-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-700 rounded-[22px] flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Truck className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1.5">{t('Logistika Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Safarlar · Mashinalar · Haydovchilar · Yetkazish')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          {[
            { label: 'Faol safarlar', value: activeTrips, color: 'text-sky-400' },
            { label: 'Kechikayotgan', value: lateTrips, color: lateTrips > 0 ? 'text-rose-400' : 'text-slate-400' },
            { label: 'Bo\'sh mashinalar', value: availableVehicles, color: 'text-emerald-400' },
            { label: 'Kutilgan yetkazma', value: pendingDeliveries, color: 'text-amber-400' },
          ].map(({ label, value, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="w-px h-10 bg-slate-700" />}
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            </React.Fragment>
          ))}
          <button onClick={() => fetchAll(true)} disabled={refreshing}
            className="ml-2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto gap-1">
        {([
          ['DASHBOARD', 'Dashboard'],
          ['TRIPS', `Safarlar (${trips.length})`],
          ['WAYBILLS', `Yo\'l Varaqalari (${waybills.length})`],
          ['DELIVERIES', `Yetkazishlar (${deliveries.length})`],
          ['VEHICLES', `Mashinalar (${vehicles.length})`],
          ['DRIVERS', `Haydovchilar (${drivers.length})`],
          ['FUEL', 'Yoqilg\'i'],
        ] as [LTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}>
            {t(label)}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Jami safarlar', value: trips.length, icon: Navigation, color: 'bg-blue-50 text-blue-700' },
              { label: 'Faol haydovchilar', value: drivers.length, icon: UserIcon, color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Transport vositalari', value: vehicles.length, icon: Car, color: 'bg-slate-50 text-slate-700' },
              { label: 'Bugun yakunlangan', value: completedToday, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`${color} rounded-[28px] border border-white p-6 flex flex-col gap-3 shadow-sm`}>
                <Icon className="w-6 h-6" />
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{t(label)}</p>
                <p className="text-3xl font-black">{value}</p>
              </div>
            ))}
          </div>

          {/* Active trips */}
          <div className="bg-white rounded-[32px] border border-slate-100 p-6">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-500" /> Faol Safarlar
            </h3>
            <div className="space-y-3">
              {trips.filter(t => t.status === 'EN_ROUTE' || t.status === 'PENDING').map((trip: any) => (
                <div key={trip.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Safar #{trip.id}</p>
                      <p className="text-xs text-slate-400">{trip.driver_name || trip.driver || '—'} · {trip.vehicle_number || trip.vehicle || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${statusColor(trip.status)}`}>{statusLabel(trip.status)}</span>
                    {trip.status === 'EN_ROUTE' && (
                      <button onClick={() => setCompletingTrip(trip)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all">
                        Yakunlash
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {trips.filter(t => t.status === 'EN_ROUTE' || t.status === 'PENDING').length === 0 && (
                <div className="py-10 text-center text-slate-300">
                  <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Faol safarlar yo'q</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending deliveries alert */}
          {pendingDeliveries > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-amber-800">
                {pendingDeliveries} ta yetkazma kutmoqda. <button onClick={() => setActiveTab('DELIVERIES')} className="underline">Ko'rish →</button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TRIPS ── */}
      {activeTab === 'TRIPS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900">Barcha Safarlar</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-400 w-48" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    {['#', 'Haydovchi', 'Mashina', 'Status', 'Boshlangan', 'Masofa', 'Amal'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trips.filter(t => !search || (t.driver_name || '').toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)).map((trip: any) => (
                    <tr key={trip.id} className="hover:bg-slate-50/50 transition-all text-sm">
                      <td className="px-5 py-4 font-black text-slate-400">#{trip.id}</td>
                      <td className="px-5 py-4 font-bold text-slate-900">{trip.driver_name || trip.driver || '—'}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{trip.vehicle_number || trip.vehicle || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${statusColor(trip.status)}`}>{statusLabel(trip.status)}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{trip.start_time ? new Date(trip.start_time).toLocaleString(locale) : '—'}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{trip.actual_distance ? `${trip.actual_distance} km` : trip.planned_distance ? `~${trip.planned_distance} km` : '—'}</td>
                      <td className="px-5 py-4">
                        {(trip.status === 'EN_ROUTE' || trip.status === 'PENDING') && (
                          <button onClick={() => setCompletingTrip(trip)}
                            className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-100 transition-all">
                            Yakunla
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trips.length === 0 && <div className="py-16 text-center text-slate-300"><Truck className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Safarlar yo'q</p></div>}
            </div>
          </div>

          {/* Complete Trip Modal */}
          {completingTrip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 w-full max-w-md space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-lg">Safarni Yakunlash</h3>
                  <button onClick={() => setCompletingTrip(null)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-slate-500">Safar #{completingTrip.id} · {completingTrip.driver_name || '—'}</p>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Haqiqiy masofa (km)</label>
                  <input type="number" value={actualDistance} onChange={e => setActualDistance(e.target.value)}
                    placeholder="masalan: 145"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setCompletingTrip(null)} className="py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase">Bekor</button>
                  <button disabled={!actualDistance || completing} onClick={handleCompleteTrip}
                    className="py-3 bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 transition-all">
                    {completing ? 'Saqlanmoqda...' : 'Yakunlash'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WAYBILLS ── */}
      {activeTab === 'WAYBILLS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900">Yo'l Varaqalari</h3>
            <button onClick={() => setShowWaybillForm(true)}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center gap-2">
              <FileText className="w-4 h-4" /> Yangi Varaq
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Haydovchi', 'Mashina', 'Maqsad', 'Muddati', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {waybills.map((wb: any) => (
                  <tr key={wb.id} className="hover:bg-slate-50/50 text-sm">
                    <td className="px-5 py-4 font-black text-slate-400">#{wb.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{wb.driver_name || wb.driver || '—'}</td>
                    <td className="px-5 py-4 font-bold text-slate-600">{wb.vehicle_number || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{wb.destination || wb.purpose || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{wb.date ? new Date(wb.date).toLocaleDateString(locale) : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${statusColor(wb.status)}`}>{statusLabel(wb.status || 'PENDING')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {waybills.length === 0 && <div className="py-16 text-center text-slate-300"><FileText className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Yo'l varaqalari yo'q</p></div>}
          </div>

          {/* New waybill modal */}
          {showWaybillForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 w-full max-w-md space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-lg">Yangi Yo'l Varag'i</h3>
                  <button onClick={() => setShowWaybillForm(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Haydovchi</label>
                    <select value={waybillForm.driver} onChange={e => setWaybillForm({ ...waybillForm, driver: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-400">
                      <option value="">Haydovchi tanlang...</option>
                      {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Mashina raqami</label>
                    <input value={waybillForm.vehicle_number} onChange={e => setWaybillForm({ ...waybillForm, vehicle_number: e.target.value })}
                      placeholder="01 A 123 BC"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Yo'nalish / Maqsad</label>
                    <input value={waybillForm.destination} onChange={e => setWaybillForm({ ...waybillForm, destination: e.target.value })}
                      placeholder="Toshkent, Chilonzor..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Maqsad turi</label>
                    <select value={waybillForm.purpose} onChange={e => setWaybillForm({ ...waybillForm, purpose: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-400">
                      <option value="CLIENT">Mijozga yetkazish</option>
                      <option value="PROJECT">Ichki loyiha</option>
                      <option value="TRANSFER">Omborlararo o'tkazma</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Izoh</label>
                    <textarea value={waybillForm.notes} onChange={e => setWaybillForm({ ...waybillForm, notes: e.target.value })}
                      rows={2} placeholder="Qo'shimcha ma'lumot..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-400 resize-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => setShowWaybillForm(false)} className="py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase">Bekor</button>
                  <button disabled={!waybillForm.driver || !waybillForm.destination || savingWaybill} onClick={handleSaveWaybill}
                    className="py-3 bg-sky-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase hover:bg-sky-700 transition-all">
                    {savingWaybill ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DELIVERIES ── */}
      {activeTab === 'DELIVERIES' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50">
              <h3 className="font-black text-slate-900">Yetkazib Berish Buyurtmalari</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Turi', 'Manzil', 'Haydovchi', 'Status', 'Sana'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {deliveries.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 text-sm">
                    <td className="px-5 py-4 font-black text-slate-400">#{d.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-600">{d.type === 'CLIENT' ? 'Mijozga' : 'Loyiha'}</td>
                    <td className="px-5 py-4 font-bold text-slate-900 truncate max-w-[150px]">{d.destination_client?.name || d.destination_project?.name || d.destination_manual || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{d.driver_name || '—'} {d.vehicle_number ? `· ${d.vehicle_number}` : ''}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${statusColor(d.status)}`}>{statusLabel(d.status)}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString(locale) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveries.length === 0 && <div className="py-16 text-center text-slate-300"><Package className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Yetkazishlar yo'q</p></div>}
          </div>
        </div>
      )}

      {/* ── VEHICLES ── */}
      {activeTab === 'VEHICLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v: any) => (
            <div key={v.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{v.plate_number || v.number || `Mashina #${v.id}`}</h4>
                    <p className="text-xs text-slate-400">{v.type_display || v.type || v.vehicle_type || '—'}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${statusColor(v.status || 'AVAILABLE')}`}>
                  {v.status === 'IN_USE' ? 'Ishlatilmoqda' : v.status === 'MAINTENANCE' ? 'Ta\'mirda' : 'Tayyor'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {v.model && <div className="bg-slate-50 rounded-xl p-3"><p className="text-[9px] font-black text-slate-400 uppercase">Model</p><p className="font-black">{v.model}</p></div>}
                {v.year && <div className="bg-slate-50 rounded-xl p-3"><p className="text-[9px] font-black text-slate-400 uppercase">Yil</p><p className="font-black">{v.year}</p></div>}
                {v.capacity && <div className="bg-slate-50 rounded-xl p-3"><p className="text-[9px] font-black text-slate-400 uppercase">Yuk ko'tarish</p><p className="font-black">{v.capacity} t</p></div>}
                {v.mileage && <div className="bg-slate-50 rounded-xl p-3"><p className="text-[9px] font-black text-slate-400 uppercase">Yurgan</p><p className="font-black">{v.mileage} km</p></div>}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="col-span-3 py-20 text-center text-slate-300">
              <Car className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Mashinalar ro'yxati bo'sh</p>
            </div>
          )}
        </div>
      )}

      {/* ── DRIVERS ── */}
      {activeTab === 'DRIVERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((d: any) => (
            <div key={d.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 flex items-start gap-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-[18px] flex items-center justify-center shrink-0">
                <UserIcon className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 text-lg leading-tight">{d.full_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-sm text-slate-500 font-bold">{d.phone || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  {d.vehicle_number && (
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Mashina</p>
                      <p className="font-black text-slate-900">{d.vehicle_number}</p>
                    </div>
                  )}
                  {d.vehicle_type && (
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Turi</p>
                      <p className="font-black text-slate-900">{d.vehicle_type}</p>
                    </div>
                  )}
                  {d.passport_info && (
                    <div className="bg-slate-50 rounded-xl p-2.5 col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Pasport</p>
                      <p className="font-bold text-slate-700">{d.passport_info}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {drivers.length === 0 && (
            <div className="col-span-2 py-20 text-center text-slate-300">
              <UserIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Haydovchilar ro'yxati bo'sh</p>
            </div>
          )}
        </div>
      )}

      {/* ── FUEL ── */}
      {activeTab === 'FUEL' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Jami yoqilg\'i', value: fuelLogs.reduce((s: number, f: any) => s + parseFloat(f.fuel_given || 0), 0).toFixed(0) + ' L', color: 'bg-amber-50 text-amber-800' },
              { label: 'Iste\'mol qilingan', value: fuelLogs.reduce((s: number, f: any) => s + parseFloat(f.fuel_used || 0), 0).toFixed(0) + ' L', color: 'bg-rose-50 text-rose-800' },
              { label: 'Yozuvlar', value: fuelLogs.length, color: 'bg-slate-50 text-slate-700' },
              { label: 'Safarlar', value: new Set(fuelLogs.map((f: any) => f.trip)).size, color: 'bg-indigo-50 text-indigo-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-[24px] border border-white p-5 shadow-sm text-center`}>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-2">{label}</p>
                <p className="text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  {['Haydovchi', 'Safar', 'Berilgan (L)', 'Ishlatilgan (L)', 'Sana'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fuelLogs.map((fl: any) => (
                  <tr key={fl.id} className="hover:bg-slate-50/50 text-sm">
                    <td className="px-5 py-4 font-bold text-slate-900">{fl.driver_name || fl.driver || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">#{fl.trip}</td>
                    <td className="px-5 py-4 font-black text-sky-700">{fl.fuel_given} L</td>
                    <td className="px-5 py-4 font-black text-rose-700">{fl.fuel_used ?? '—'} {fl.fuel_used ? 'L' : ''}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{fl.created_at ? new Date(fl.created_at).toLocaleDateString(locale) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fuelLogs.length === 0 && <div className="py-16 text-center text-slate-300"><Fuel className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Yoqilg'i jurnali bo'sh</p></div>}
          </div>
        </div>
      )}

      {/* QR Scanner */}
      <Suspense fallback={null}>
        {isScannerOpen && <ScannerModal onClose={() => setIsScannerOpen(false)} onScan={(code) => { setIsScannerOpen(false); uiStore.showNotification(`QR: ${code}`, 'info'); }} />}
      </Suspense>
    </div>
  );
}
