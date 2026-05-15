import React from 'react';
import { useI18n } from '../../i18n';
import { BarChart3, TrendingUp, TrendingDown, Activity, Box, Trash2 } from 'lucide-react';

export default function WarehouseAnalytics() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Turnover Rate (Aylanish)', val: '14.2', icon: Activity, color: 'blue' },
          { label: 'Loss % (Yo\'qotish)', val: '1.2%', icon: TrendingDown, color: 'emerald' },
          { label: 'Waste % (Chiqindi)', val: '18.4%', icon: Trash2, color: 'rose' },
          { label: 'Dead Stock (O\'lik qoldiq)', val: '840 kg', icon: Box, color: 'amber' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center`}>
              <s.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(s.label)}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 min-h-[300px] flex items-center justify-center text-center">
        <div>
          <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{t('Stock Aging & Efficiency Analytics')}</h3>
          <p className="text-sm font-bold text-slate-500 max-w-md mx-auto mt-2">{t('Real-time analitika modullari direktorlar paneli uchun tayyorlanmoqda. Charts integratsiyasi davom etyapti.')}</p>
        </div>
      </div>
    </div>
  );
}
