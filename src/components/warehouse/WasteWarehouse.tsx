import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n';
import { Trash2, ShieldAlert, RotateCcw, CheckCircle, RefreshCw, BarChart2, Info, Play, CheckCheck } from 'lucide-react';
import api from '../../lib/api';
import { uiStore } from '../../lib/store';

type WasteTask = {
  id: number;
  task_number: string;
  dept_display: string;
  source_department: string;
  category: number | null;
  category_name?: string;
  weight_kg: number;
  created_at: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  status_display?: string;
  recycled_weight_kg: number;
  loss_weight_kg: number;
  batch_number?: string | null;
};

type WasteCategory = {
  id: number;
  name: string;
};

type ReturnTask = {
  id: string;
  customer: string;
  item: string;
  qty: string;
  reason: string;
  date: string;
  status: 'PENDING_QC' | 'ACCEPTED' | 'RECYCLED';
  weight: number;
};

const INITIAL_RETURNS: ReturnTask[] = [
  { id: 'RET-2026-001', customer: 'Imorat Stroy', item: 'Fasad Panel Deluxe', qty: '40 sheets', reason: 'Noto\'g\'ri qalinlik', date: '2025-06-15', status: 'PENDING_QC', weight: 40 },
  { id: 'RET-2026-002', customer: 'Sharq Qurilish', item: 'EPS Blocks M20', qty: '2 blocks', reason: 'Deformatsiya', date: '2025-06-12', status: 'RECYCLED', weight: 25 },
];

export default function WasteWarehouse() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<WasteTask[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [returns, setReturns] = useState<ReturnTask[]>(INITIAL_RETURNS);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, categoriesRes, statsRes] = await Promise.all([
        api.get('waste/tasks/'),
        api.get('waste/categories/'),
        api.get('waste/tasks/stats/'),
      ]);
      setTasks(tasksRes.data.results || tasksRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      uiStore.showNotification("Chiqindi ombori ma'lumotlarini yuklab bo'lmadi", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const defaultCategory = categories[0]?.id;

  const handleReturnAction = async (ret: ReturnTask, mode: 'ACCEPTED' | 'RECYCLED') => {
    if (!defaultCategory) {
      uiStore.showNotification("Avval chiqindi kategoriyalarini sozlang", 'error');
      return;
    }
    try {
      const created = await api.post('waste/tasks/', {
        source_department: 'WAREHOUSE',
        weight_kg: ret.weight,
        category: defaultCategory,
        batch_number: ret.id,
      });

      if (mode === 'RECYCLED') {
        await api.post(`waste/tasks/${created.data.id}/start/`);
        await api.post(`waste/tasks/${created.data.id}/finish/`, {
          recycled_weight_kg: ret.weight,
          loss_weight_kg: 0,
          notes: `${ret.customer}: ${ret.reason}`,
        });
      }

      setReturns((current) => current.map((item) => item.id === ret.id ? { ...item, status: mode } : item));
      uiStore.showNotification(mode === 'RECYCLED' ? "Qaytarilgan mahsulot recycle jarayoniga yuborildi" : "Qaytarilgan mahsulot qabul qilindi", 'success');
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Amalni bajarib bo'lmadi", 'error');
    }
  };

  const handleTaskAction = async (task: WasteTask) => {
    try {
      if (task.status === 'PENDING') {
        await api.post(`waste/tasks/${task.id}/start/`);
        uiStore.showNotification("Qayta ishlash boshlandi", 'success');
      } else if (task.status === 'PROCESSING') {
        const recycled = Number(task.weight_kg) * 0.92;
        const loss = Number(task.weight_kg) - recycled;
        await api.post(`waste/tasks/${task.id}/finish/`, {
          recycled_weight_kg: recycled,
          loss_weight_kg: loss,
          notes: 'Ombor panelidan yakunlandi',
        });
        uiStore.showNotification("Vazifa yakunlandi", 'success');
      }
      fetchData();
    } catch (err: any) {
      uiStore.showNotification(err.response?.data?.error || "Vazifa yangilanmadi", 'error');
    }
  };

  const wasteItems = useMemo(() => tasks.slice(0, 6), [tasks]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Umumiy Chiqindi (Bugun)')}</p>
            <h3 className="text-2xl font-black text-rose-600">{stats?.today_total || 0} <span className="text-xs font-bold text-slate-400">kg</span></h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{stats?.pending_tasks || 0} {t('qayta ishlashga tayyor')}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Qayta Ishlandi')}</p>
            <h3 className="text-2xl font-black text-emerald-600">{tasks.filter((task) => task.status === 'COMPLETED').reduce((sum, task) => sum + Number(task.recycled_weight_kg || 0), 0)} <span className="text-xs font-bold text-slate-400">kg</span></h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{t('ekologik qayta aylanish')}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Mijozlar Qaytaruvlari')}</p>
            <h3 className="text-2xl font-black text-amber-600">{returns.filter((item) => item.status === 'PENDING_QC').length} {t('ta buyurtma')}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{t('Sifat nazorati kutilyapti')}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Net Defect Rate')}</p>
            <h3 className="text-2xl font-black text-indigo-600">{tasks.length ? Math.round((tasks.filter((task) => task.status !== 'COMPLETED').length / tasks.length) * 100) : 0}%</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{categories.length} {t('kategoriya')}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">{t('Zavod Chiqindilari va Braklar')}</h3>
            <p className="text-xs font-bold text-slate-400">{t('CNC va quyish sexlaridan kelgan qayta ishlash xomashyolari')}</p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-sm font-bold text-slate-400">{t('Yuklanmoqda...')}</div>
            ) : wasteItems.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100/60 text-rose-600 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{item.category_name || item.task_number}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.dept_display} • {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900">{item.weight_kg} kg</span>
                  <button onClick={() => handleTaskAction(item)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${item.status === 'PENDING' ? 'bg-blue-600 text-white' : item.status === 'PROCESSING' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {item.status === 'PENDING' ? <Play className="w-3.5 h-3.5" /> : item.status === 'PROCESSING' ? <CheckCheck className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {item.status === 'PENDING' ? t('Boshlash') : item.status === 'PROCESSING' ? t('Yakunlash') : t(item.status)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">{t('Mijozlardan Qaytgan Yuklar')}</h3>
            <p className="text-xs font-bold text-slate-400">{t('Qayta ishlashga, almashtirishga yoki yaroqsizga chiqarish buyruqlari')}</p>
          </div>

          <div className="space-y-4">
            {returns.map((ret) => (
              <div key={ret.id} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{ret.id}</span>
                    <h4 className="text-sm font-black text-slate-900 mt-2">{ret.customer}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{ret.item} ({ret.qty})</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ret.status === 'PENDING_QC' ? 'bg-blue-50 text-blue-600 animate-pulse' : ret.status === 'RECYCLED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {t(ret.status)}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200/40 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 leading-snug">
                    <span className="font-bold text-rose-500">{t('Sabab')}:</span> {ret.reason}
                  </p>
                  {ret.status === 'PENDING_QC' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleReturnAction(ret, 'ACCEPTED')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t('Qabul')}
                      </button>
                      <button onClick={() => handleReturnAction(ret, 'RECYCLED')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all">
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('Recycle')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
        <Info className="w-6 h-6 text-amber-600 shrink-0" />
        <div>
          <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">{t('Eslatma')}</h4>
          <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
            {t("Brak mahsulotlar va qirqimlar ekologik barqarorlik talablari asosida avtomatik ravishda Pre-expander (Ko'pirtirish) xomashyo partiyasiga 5% dan oshmagan mikdorda aralashtirilib, qayta ishlab chiqarishga qaytariladi.")}
          </p>
        </div>
      </div>
    </div>
  );
}
