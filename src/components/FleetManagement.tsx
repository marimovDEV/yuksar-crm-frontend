import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  Plus,
  X,
  MapPin,
  User as UserIcon,
  Activity,
  Wrench,
  FileText,
  ChevronRight,
  Clock,
  Fuel,
  Package,
} from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../i18n';
import { uiStore } from '../lib/store';
import { User } from '../types';

interface FleetManagementProps {
  user: User;
}

type VehicleTab = 'Transport' | 'Reyslar' | 'Haydovchilar';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  REPAIR: 'bg-rose-50 text-rose-600 border-rose-100',
  IDLE: 'bg-amber-50 text-amber-600 border-amber-100',
};

const tripStatusColors: Record<string, string> = {
  PLANNED: 'bg-blue-50 text-blue-600 border-blue-100',
  ON_ROAD: 'bg-amber-50 text-amber-600 border-amber-100',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  CLOSED: 'bg-slate-50 text-slate-500 border-slate-100',
};

export default function FleetManagement({ user }: FleetManagementProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<VehicleTab>('Transport');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [waybillTrip, setWaybillTrip] = useState<any | null>(null);

  const [vehicleForm, setVehicleForm] = useState({ plate: '', model: '', capacity_kg: '', fuel_type: 'DIESEL', status: 'ACTIVE' });
  const [tripForm, setTripForm] = useState({ vehicle_id: '', driver_id: '', from_loc: '', to_loc: '', cargo_kg: '', km_plan: '' });
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', license: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, tRes, dRes] = await Promise.all([
        api.get('fleet/vehicles/'),
        api.get('fleet/trips/'),
        api.get('fleet/drivers/'),
      ]);
      setVehicles(vRes.data || []);
      setTrips(tRes.data || []);
      setDrivers(dRes.data || []);
    } catch {
      uiStore.showNotification(t("Ma'lumotlarni yuklashda xatolik"), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('fleet/vehicles/', { ...vehicleForm, capacity_kg: Number(vehicleForm.capacity_kg) });
      uiStore.showNotification(t("Transport qo'shildi"), 'success');
      setIsVehicleModalOpen(false);
      setVehicleForm({ plate: '', model: '', capacity_kg: '', fuel_type: 'DIESEL', status: 'ACTIVE' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('fleet/trips/', { ...tripForm, cargo_kg: Number(tripForm.cargo_kg), km_plan: Number(tripForm.km_plan) });
      uiStore.showNotification(t("Reys qo'shildi"), 'success');
      setIsTripModalOpen(false);
      setTripForm({ vehicle_id: '', driver_id: '', from_loc: '', to_loc: '', cargo_kg: '', km_plan: '' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('fleet/drivers/', driverForm);
      uiStore.showNotification(t("Haydovchi qo'shildi"), 'success');
      setIsDriverModalOpen(false);
      setDriverForm({ name: '', phone: '', license: '' });
      fetchData();
    } catch {
      uiStore.showNotification(t('Xatolik yuz berdi'), 'error');
    }
  };

  const tabs: VehicleTab[] = ['Transport', 'Reyslar', 'Haydovchilar'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
              <Truck className="w-8 h-8" />
            </div>
            {t('Transport Parki')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Avtomobillar, reyslar va haydovchilar boshqaruvi')}</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'Transport' && (
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t("Transport Qo'shish")}</span>
            </button>
          )}
          {activeTab === 'Reyslar' && (
            <button
              onClick={() => setIsTripModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t('Yangi Reys')}</span>
            </button>
          )}
          {activeTab === 'Haydovchilar' && (
            <button
              onClick={() => setIsDriverModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t("Haydovchi Qo'shish")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('Jami Transport'), value: vehicles.length, color: 'bg-indigo-50 text-indigo-600' },
          { label: t('Faol'), value: vehicles.filter(v => v.status === 'ACTIVE').length, color: 'bg-emerald-50 text-emerald-600' },
          { label: t("Ta'mirda"), value: vehicles.filter(v => v.status === 'REPAIR').length, color: 'bg-rose-50 text-rose-600' },
          { label: t('Reyslar'), value: trips.length, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center font-black text-xl`}>
              {stat.value}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] gap-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-[24px]" />
          ))}
        </div>
      )}

      {/* Transport Tab */}
      {!loading && activeTab === 'Transport' && (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  {[t('Davlat raqami'), t('Model'), t('Yuk kg'), t("Yoqilg'i"), t('Holat'), t("Ta'mirlash tarixi")].map(h => (
                    <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-black text-slate-900">{v.plate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{v.model}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{(v.capacity_kg || 0).toLocaleString('ru-RU')} kg</td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 text-xs font-black text-slate-600">
                        <Fuel className="w-4 h-4" /> {v.fuel_type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${statusColors[v.status] || statusColors.IDLE}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">
                      {v.last_service ? new Date(v.last_service).toLocaleDateString('ru-RU') : '—'}
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">{t("Transport topilmadi")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reyslar Tab */}
      {!loading && activeTab === 'Reyslar' && (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  {[t('Reys №'), t('Transport'), t('Haydovchi'), t('Manzil'), t('Yuk kg'), t('Status'), t('Km'), t("Yoqilg'i l"), t('Amal')].map(h => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trips.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5 text-xs font-black text-indigo-600">{tr.trip_number}</td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-700">{tr.vehicle_plate}</td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-700">{tr.driver_name}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {tr.to_loc}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-black text-slate-900">{(tr.cargo_kg || 0).toLocaleString('ru-RU')}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${tripStatusColors[tr.status] || tripStatusColors.PLANNED}`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{tr.km_actual || tr.km_plan}</td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{tr.fuel_liters || '—'}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setWaybillTrip(tr)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {t("Yo'l varaqasi")}
                      </button>
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr><td colSpan={9} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">{t('Reyslar topilmadi')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Haydovchilar Tab */}
      {!loading && activeTab === 'Haydovchilar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map(d => (
            <div key={d.id} className="bg-white p-8 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center">
                    <UserIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{d.name}</p>
                    <p className="text-xs font-bold text-slate-500">{d.phone}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-full border border-emerald-100">
                  {d.status}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Guvohnoma')}</span>
                  <span className="text-xs font-black text-slate-700">{d.license}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Transport')}</span>
                  <span className="text-xs font-black text-slate-700">{d.vehicle_plate || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Vaqtida %')}</span>
                  <span className="text-xs font-black text-emerald-600">{d.on_time_pct}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Yoqilg'i tejash")}</span>
                  <span className="text-xs font-black text-amber-600">{d.fuel_save_pct}%</span>
                </div>
              </div>
            </div>
          ))}
          {drivers.length === 0 && (
            <div className="col-span-3 py-20 text-center text-slate-300 font-black uppercase tracking-widest">{t('Haydovchilar topilmadi')}</div>
          )}
        </div>
      )}

      {/* Vehicle Modal */}
      <AnimatePresence>
        {isVehicleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Truck className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black text-slate-900">{t("Yangi Transport")}</h3>
                </div>
                <button onClick={() => setIsVehicleModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddVehicle} className="p-8 space-y-5">
                {[
                  { label: t('Davlat raqami'), key: 'plate', placeholder: '01 A 123 AA' },
                  { label: t('Model'), key: 'model', placeholder: 'MAN TGS 26.400' },
                  { label: t('Yuk kg'), key: 'capacity_kg', placeholder: '10000', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      required
                      type={field.type || 'text'}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                      value={(vehicleForm as any)[field.key]}
                      onChange={e => setVehicleForm({ ...vehicleForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Yoqilg'i turi")}</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm appearance-none" value={vehicleForm.fuel_type} onChange={e => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })}>
                    <option value="DIESEL">{t('Dizel')}</option>
                    <option value="PETROL">{t('Benzin')}</option>
                    <option value="GAS">{t('Gaz')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Holat')}</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm appearance-none" value={vehicleForm.status} onChange={e => setVehicleForm({ ...vehicleForm, status: e.target.value })}>
                    <option value="ACTIVE">{t('Faol')}</option>
                    <option value="REPAIR">{t("Ta'mirda")}</option>
                    <option value="IDLE">{t("Bo'sh")}</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t("Qo'shish")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trip Modal */}
      <AnimatePresence>
        {isTripModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl"><MapPin className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black text-slate-900">{t('Yangi Reys')}</h3>
                </div>
                <button onClick={() => setIsTripModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddTrip} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Transport')}</label>
                  <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm appearance-none" value={tripForm.vehicle_id} onChange={e => setTripForm({ ...tripForm, vehicle_id: e.target.value })}>
                    <option value="">{t('Tanlang...')}</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Haydovchi')}</label>
                  <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm appearance-none" value={tripForm.driver_id} onChange={e => setTripForm({ ...tripForm, driver_id: e.target.value })}>
                    <option value="">{t('Tanlang...')}</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                {[
                  { label: t('Qayerdan'), key: 'from_loc', placeholder: 'Sergeli, Toshkent' },
                  { label: t('Qayerga'), key: 'to_loc', placeholder: 'Samarqand sh.' },
                  { label: t('Yuk kg'), key: 'cargo_kg', placeholder: '5000', type: 'number' },
                  { label: t('Km (reja)'), key: 'km_plan', placeholder: '320', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      required
                      type={field.type || 'text'}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                      value={(tripForm as any)[field.key]}
                      onChange={e => setTripForm({ ...tripForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsTripModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t("Reys Yaratish")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Driver Modal */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl"><UserIcon className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black text-slate-900">{t("Yangi Haydovchi")}</h3>
                </div>
                <button onClick={() => setIsDriverModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddDriver} className="p-8 space-y-5">
                {[
                  { label: t('Ismi'), key: 'name', placeholder: 'Sherzod Tursunov' },
                  { label: t('Telefon'), key: 'phone', placeholder: '+998901234567' },
                  { label: t('Guvohnoma raqami'), key: 'license', placeholder: 'AA1234567' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                      value={(driverForm as any)[field.key]}
                      onChange={e => setDriverForm({ ...driverForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsDriverModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">{t('Bekor qilish')}</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t("Qo'shish")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Waybill Modal */}
      <AnimatePresence>
        {waybillTrip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{t("Yo'l Varaqasi")}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{waybillTrip.trip_number}</p>
                  </div>
                </div>
                <button onClick={() => setWaybillTrip(null)} className="p-3 bg-white rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-4">
                {[
                  { label: t('Transport'), value: waybillTrip.vehicle_plate },
                  { label: t('Haydovchi'), value: waybillTrip.driver_name },
                  { label: t('Qayerdan'), value: waybillTrip.from_loc },
                  { label: t('Qayerga'), value: waybillTrip.to_loc },
                  { label: t('Yuk kg'), value: `${(waybillTrip.cargo_kg || 0).toLocaleString('ru-RU')} kg` },
                  { label: t('Km (reja)'), value: `${waybillTrip.km_plan} km` },
                  { label: t('Km (haqiqiy)'), value: waybillTrip.km_actual ? `${waybillTrip.km_actual} km` : '—' },
                  { label: t("Yoqilg'i"), value: waybillTrip.fuel_liters ? `${waybillTrip.fuel_liters} litr` : '—' },
                  { label: t('Holat'), value: waybillTrip.status },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                    <span className="text-sm font-black text-slate-900">{row.value}</span>
                  </div>
                ))}
                <button
                  onClick={() => { uiStore.showNotification(t("PDF yuklandi"), 'success'); setWaybillTrip(null); }}
                  className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  {t('PDF Yuklab olish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
