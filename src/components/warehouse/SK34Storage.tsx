import React from 'react';
import { useI18n } from '../../i18n';
import { Package2, Truck } from 'lucide-react';

export function SK3DecorStorage() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-6">
        <Package2 className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">{t('SK-3 (Dekor Ombori)')}</h2>
      <p className="text-sm font-bold text-slate-500 max-w-sm">{t('Dekorativ va fasad elementlari shu yerda saqlanadi. Sifat nazorati va qadoqlash integratsiyasi tayyorlanmoqda.')}</p>
    </div>
  );
}

export function SK4Shipment() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center mb-6">
        <Truck className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">{t('SK-4 (Yuklash va Jo\'natish)')}</h2>
      <p className="text-sm font-bold text-slate-500 max-w-sm">{t('Tayyor mahsulotlarni mijozlarga jo\'natish, logistika va kuryerlarni boshqarish moduli.')}</p>
    </div>
  );
}
