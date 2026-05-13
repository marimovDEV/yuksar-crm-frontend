import React from 'react';
import { useI18n } from '../../i18n';
import { motion } from 'motion/react';
import { 
  PieChart, Wallet, Building2, ArrowUpRight, 
  ArrowDownRight, Landmark, Receipt, Scale,
  TrendingUp, TrendingDown, Clock, AlertCircle,
  FileText, ShieldCheck, Activity
} from 'lucide-react';

export default function AccountingDashboard({ summary }: Props) {
  const { t, locale } = useI18n();
  if (!summary) return null;

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(Math.round(n));
  if (!summary) return null;

  return (
    <div className="space-y-8">
        {/* Today's Financial State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('accounting.assets')}</span>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{fmt(summary.balances.total_cash + summary.balances.receivables + summary.balances.raw_materials + summary.balances.finished_goods)}</p>
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] font-bold text-emerald-600">+2.4%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('o\'tgan oyga nisbatan')}</span>
                </div>
            </div>

            <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-rose-50 rounded-2xl">
                        <ShieldCheck className="w-5 h-5 text-rose-600" />
                    </div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{t('accounting.liabilities')}</span>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{fmt(summary.balances.payables)}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Majburiyatlar (Supplier debt)</p>
            </div>

            <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        <Scale className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('accounting.equity')}</span>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{fmt(summary.balances.total_cash + summary.balances.receivables - summary.balances.payables)}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Xususiy kapital va foyda</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accounting.net_income')}</span>
                </div>
                <p className="text-2xl font-black tracking-tight">{fmt(summary.monthly_pl.net_income)}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{summary.monthly_pl.profit_margin}% Gross Margin</p>
            </div>
        </div>

        {/* Breakdown Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-slate-100 rounded-[40px] p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider mb-8">{t('accounting.asset_breakdown')}</h3>
                <div className="space-y-6">
                    {[
                        { label: 'Bank & Cash', value: summary.balances.total_cash, color: 'bg-blue-600', percent: 45 },
                        { label: 'Accounts Receivable', value: summary.balances.receivables, color: 'bg-emerald-600', percent: 25 },
                        { label: 'Raw Materials', value: summary.balances.raw_materials, color: 'bg-amber-600', percent: 15 },
                        { label: 'Finished Goods', value: summary.balances.finished_goods, color: 'bg-purple-600', percent: 15 },
                    ].map(item => (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">{item.label}</span>
                                <span className="text-slate-900">{fmt(item.value)}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percent}%` }}
                                    className={`h-full rounded-full ${item.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[40px] p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider mb-8">{t('accounting.health_alerts')}</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-[28px] border border-emerald-100">
                        <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">{t('Davr holati')}</h4>
                            <p className="text-xs text-emerald-700 font-bold mt-1">{t('Moliya davri ochiq')}. {summary.posted_count} {t('ta provodka tasdiqlangan')}.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-[28px] border border-amber-100">
                        <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">{t('Qoralama provodkalar')}</h4>
                            <p className="text-xs text-amber-700 font-bold mt-1">{t('Sizda')} {summary.draft_count} {t('ta qoralama (Draft) provodka bor. Tasdiqlashni unutmang')}.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-[28px] border border-blue-100">
                        <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{t('accounting.audit_trail')}</h4>
                            <p className="text-xs text-blue-700 font-bold mt-1">{t('Oxirgi 24 soatda yangi operatsiyalar kelib tushdi')}.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
            {[
                { label: 'Trial Balance Export', icon: FileText, color: 'blue' },
                { label: 'Close Fiscal Period', icon: ShieldCheck, color: 'slate' },
                { label: 'Tax Reconciliation', icon: Receipt, color: 'emerald' },
                { label: 'Inventory Sync', icon: Scale, color: 'purple' },
            ].map(action => (
                <button key={action.label} className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:shadow-lg transition-all active:scale-95 shadow-sm">
                    <action.icon className={`w-4 h-4 text-${action.color}-600`} />
                    {action.label}
                </button>
            ))}
        </div>
    </div>
  );
}
