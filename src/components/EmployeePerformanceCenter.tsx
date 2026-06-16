/**
 * Employee Performance Center v2
 * 4-komponentli KPI: Ish hajmi 40% + Sifat 30% + Intizom 15% + Tejamkorlik 15%
 * Tabs: Umumiy | Reyting | Bo'limlar | O'sish | Mening KPI
 */
import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiComponents { volume: number; quality: number; discipline: number; efficiency: number }

interface BonusData {
  score: number;
  components: KpiComponents;
  efficiency: number;
  bonus_pct: number;
  bonus_amount: number;
  grade: 'A' | 'B' | 'C' | 'D';
  details: Record<string, any>;
}

interface RatingData { rank: number; total: number; percentile: number }

interface TrendPoint {
  month: string; year: number; month_num: number;
  metric: number; label: string;
  [key: string]: any;
}

interface TrendResponse {
  trend: TrendPoint[]; bonus: BonusData; rating: RatingData; role: string;
}

interface Employee {
  id: number; full_name: string; username: string;
  role: string; role_obj?: { name: string }; department?: string;
  score: number; bonus_amount: number; efficiency: number;
  status: string; last_login?: string; rank: number;
}

interface ImprovingEmployee extends Employee {
  current_score: number; prev_score: number; delta: number;
  current_grade: 'A' | 'B' | 'C' | 'D';
}

interface DepartmentRank {
  department: string; dept_id: number; employee_count: number;
  avg_score: number; grade: 'A' | 'B' | 'C' | 'D';
  total_bonus: number; rank: number;
}

interface User { id: number; username: string; full_name?: string; [key: string]: any }

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE: Record<string, { bg: string; text: string; border: string; bar: string; label: string; emoji: string }> = {
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', label: 'Ajoyib', emoji: '🏆' },
  B: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500',    label: 'Yaxshi',  emoji: '✅' },
  C: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: 'bg-amber-500',   label: "O'rtacha",emoji: '⚠️' },
  D: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     bar: 'bg-red-400',     label: "Qoniqarsiz",emoji:'❌'},
};

const KPI_COMPONENTS = [
  { key: 'volume',     label: 'Ish hajmi',    weight: 40, color: 'bg-blue-500',    icon: '📦' },
  { key: 'quality',    label: 'Sifat',        weight: 30, color: 'bg-emerald-500', icon: '✅' },
  { key: 'discipline', label: 'Intizom',      weight: 15, color: 'bg-purple-500',  icon: '⏰' },
  { key: 'efficiency', label: 'Tejamkorlik',  weight: 15, color: 'bg-amber-500',   icon: '⚡' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} mln`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)} ming`
  : String(n);

const fmtDate = (dt?: string) =>
  dt ? new Date(dt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function TrendBar({ data, colorClass = 'bg-blue-500' }: { data: TrendPoint[]; colorClass?: string }) {
  if (!data.length) return <p className="text-gray-300 text-xs">Trend ma'lumoti yo'q</p>;
  const max = Math.max(...data.map(d => d.metric), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {data.map((d, i) => {
        const pct = (d.metric / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} title={`${d.month}: ${d.metric.toFixed(1)} ${d.label}`}
            className="flex-1 flex flex-col items-center gap-0.5 group cursor-pointer">
            <div className={`w-full rounded-t transition-all duration-500 ${isLast ? colorClass : colorClass + '/40'}`}
              style={{ height: `${Math.max(6, pct)}%` }} />
            <span className="text-[9px] text-gray-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Activity Heatmap (GitHub-style) ─────────────────────────────────────────

function ActivityHeatmap({ userId }: { userId: number }) {
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`users/${userId}/login_history/`).then(res => {
      const logs: any[] = res.data?.results ?? res.data ?? [];
      const map: Record<string, number> = {};
      logs.forEach(l => {
        const d = l.timestamp?.slice(0, 10);
        if (d) map[d] = (map[d] || 0) + 1;
      });
      setData(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  // Last 12 weeks
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: data[key] || 0 });
  }

  const getColor = (count: number) =>
    count === 0 ? 'bg-gray-100' :
    count === 1 ? 'bg-blue-200' :
    count <= 3 ? 'bg-blue-400' : 'bg-blue-600';

  if (loading) return <div className="text-xs text-gray-400 animate-pulse">Yuklanmoqda...</div>;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">So'nggi 12 hafta faolligi</p>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        {Array.from({ length: 12 }, (_, week) =>
          cells.slice(week * 7, week * 7 + 7).map((cell, day) => (
            <div key={`${week}-${day}`} title={`${cell.date}: ${cell.count} ta amal`}
              className={`w-3 h-3 rounded-sm ${getColor(cell.count)}`} />
          ))
        )}
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-400">
        <span>Kam</span>
        {['bg-gray-100','bg-blue-200','bg-blue-400','bg-blue-600'].map(c => (
          <div key={c} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span>Ko'p</span>
      </div>
    </div>
  );
}

// ─── KPI Radar (4 komponent progress bars) ───────────────────────────────────

function KpiRadar({ components }: { components: KpiComponents }) {
  return (
    <div className="space-y-3">
      {KPI_COMPONENTS.map(c => {
        const val = (components as any)[c.key] ?? 0;
        const weighted = Math.round(val * c.weight / 100);
        return (
          <div key={c.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                {c.icon} {c.label} <span className="text-gray-400">({c.weight}%)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-800">{val}/100</span>
                <span className="text-xs text-gray-400">→ +{weighted}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-700 ${c.color}`}
                style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Employee Detail Panel ────────────────────────────────────────────────────

function EmployeeDetailPanel({
  employeeId, inline = false, onClose
}: { employeeId: number; inline?: boolean; onClose: () => void }) {
  const [trendData, setTrendData] = useState<TrendResponse | null>(null);
  const [kpi, setKpi] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'kpi' | 'trend' | 'activity'>('kpi');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tRes, kRes] = await Promise.all([
          api.get(`users/${employeeId}/kpi_trend/`),
          api.get(`users/${employeeId}/kpi/`),
        ]);
        setTrendData(tRes.data);
        setKpi(kRes.data);
      } catch { /* noop */ }
      setLoading(false);
    })();
  }, [employeeId]);

  const content = loading ? (
    <div className="flex items-center justify-center py-12 text-gray-400 animate-pulse">
      KPI ma'lumotlari yuklanmoqda...
    </div>
  ) : (() => {
    const trend = trendData?.trend ?? [];
    const bonus = trendData?.bonus;
    const rating = trendData?.rating;
    const grade = bonus?.grade ?? 'C';
    const g = GRADE[grade];
    const comp = bonus?.components ?? { volume: 0, quality: 0, discipline: 0, efficiency: 0 };

    // Pick trend bar color by grade
    const barColor = grade === 'A' ? 'bg-emerald-500' : grade === 'B' ? 'bg-blue-500'
      : grade === 'C' ? 'bg-amber-500' : 'bg-red-400';

    return (
      <div className="space-y-4">
        {/* Score row */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-xl p-4 border ${g.border} ${g.bg} text-center`}>
            <div className="text-3xl mb-1">{g.emoji}</div>
            <div className={`text-3xl font-black ${g.text}`}>{bonus?.score ?? 0}</div>
            <div className={`text-xs font-semibold ${g.text} mt-0.5`}>{g.label}</div>
          </div>
          <div className="rounded-xl p-4 border border-gray-100 bg-gray-50 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xl font-black text-gray-800">{fmtMoney(bonus?.bonus_amount ?? 0)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{bonus?.bonus_pct ?? 0}% bonus</div>
          </div>
          <div className="rounded-xl p-4 border border-purple-100 bg-purple-50 text-center">
            <div className="text-2xl mb-1">🏅</div>
            <div className="text-xl font-black text-purple-700">#{rating?.rank ?? '—'}</div>
            <div className="text-xs text-purple-500 mt-0.5">
              {rating?.total ? `${rating.total} kishidan` : '—'}
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'kpi', label: '📊 KPI tarkibi' },
            { id: 'trend', label: '📈 6 oy trend' },
            { id: 'activity', label: '📅 Faollik' },
          ].map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id as any)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSection === s.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* KPI Components */}
        {activeSection === 'kpi' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">4-komponentli KPI formulasi</p>
              <KpiRadar components={comp} />
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Yakuniy ball = {comp.volume}×0.4 + {comp.quality}×0.3 + {comp.discipline}×0.15 + {comp.efficiency}×0.15
                </span>
                <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${g.bg} ${g.text}`}>
                  = {bonus?.score}
                </span>
              </div>
            </div>

            {/* Role KPI details */}
            {kpi && (
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3">Rol KPI — joriy oy</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(kpi)
                    .filter(([k]) => !['role', 'user_id', 'error', 'note', '_error'].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                        <div className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">
                          {k.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm font-black text-gray-800">
                          {typeof v === 'number'
                            ? (k.includes('pct') || k.includes('rate') ? `${v}%`
                              : k.includes('mln') ? `${v} mln`
                              : v.toLocaleString())
                            : String(v)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Bonus details */}
            {bonus?.details && Object.keys(bonus.details).filter(k => !k.startsWith('_') && !['login_days','work_days'].includes(k)).length > 0 && (
              <div className={`rounded-xl border ${g.border} ${g.bg} p-4`}>
                <p className={`text-xs font-semibold ${g.text} mb-2`}>Hisob-kitob asosi</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(bonus.details)
                    .filter(([k]) => !k.startsWith('_') && !['login_days','work_days'].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="text-xs bg-white/70 rounded px-2 py-1">
                        <span className={`font-medium ${g.text}`}>{k.replace(/_/g, ' ')}: </span>
                        <span className="font-black text-gray-800">
                          {typeof v === 'number' ? v.toLocaleString() : String(v)}
                        </span>
                      </div>
                    ))}
                </div>
                {bonus.details.login_days != null && (
                  <div className="text-xs text-gray-500 mt-2">
                    ⏰ Davomat: {bonus.details.login_days}/{bonus.details.work_days} ish kuni
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6-month trend */}
        {activeSection === 'trend' && trend.length > 0 && (
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              {trend[0]?.label} bo'yicha 6 oylik dinamika
            </p>
            <TrendBar data={trend} colorClass={barColor} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {trend.slice(-3).map(t => (
                <div key={`${t.year}-${t.month_num}`} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-gray-400">{t.month} {t.year}</div>
                  <div className="text-sm font-black text-gray-800">{t.metric.toFixed(1)}</div>
                  <div className="text-[9px] text-gray-400">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity heatmap */}
        {activeSection === 'activity' && (
          <div className="rounded-xl border border-gray-100 p-4">
            <ActivityHeatmap userId={employeeId} />
          </div>
        )}
      </div>
    );
  })();

  if (inline) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">Xodim Performans Tafsiloti</h2>
            <p className="text-xs text-gray-400">{trendData?.role ?? '—'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 text-gray-400 hover:text-gray-600 text-xl flex items-center justify-center">×</button>
        </div>
        <div className="p-5">{content}</div>
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ onSelectEmployee }: { onSelectEmployee: (id: number) => void }) {
  const [ranking, setRanking] = useState<Employee[]>([]);
  const [improving, setImproving] = useState<ImprovingEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('users/performance-ranking/'),
      api.get('users/most-improving/').catch(() => ({ data: [] })),
    ]).then(([r, i]) => {
      setRanking(r.data ?? []);
      setImproving(i.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400 animate-pulse">Yuklanmoqda...</div>;

  const active = ranking.filter(e => e.status === 'ACTIVE');
  const avgScore = active.length ? Math.round(active.reduce((s, e) => s + e.score, 0) / active.length) : 0;
  const totalBonus = active.reduce((s, e) => s + e.bonus_amount, 0);
  const top10 = ranking.slice(0, 10);
  const gradeDist = { A: 0, B: 0, C: 0, D: 0 };
  ranking.forEach(e => {
    const g = e.score >= 90 ? 'A' : e.score >= 75 ? 'B' : e.score >= 50 ? 'C' : 'D';
    gradeDist[g as keyof typeof gradeDist]++;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "O'rtacha KPI ball", value: avgScore, suffix: '/100', color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'A-grad xodimlar', value: gradeDist.A, suffix: ' kishi', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Bonus fond', value: fmtMoney(totalBonus), suffix: ' UZS', color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'D-grad (yordamga muhtoj)', value: gradeDist.D, suffix: ' kishi', color: 'text-red-700', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className={`text-2xl font-black ${s.color}`}>
              {s.value}<span className="text-xs font-normal opacity-70">{s.suffix}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TOP-10 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🏆 TOP-10 Xodimlar
          </h3>
          <div className="space-y-2">
            {top10.map((e, i) => {
              const g = GRADE[e.score >= 90 ? 'A' : e.score >= 75 ? 'B' : e.score >= 50 ? 'C' : 'D'];
              return (
                <div key={e.id} className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
                  onClick={() => onSelectEmployee(e.id)}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-amber-600/70 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{e.full_name}</div>
                    <div className="text-[10px] text-gray-400">{e.role_obj?.name || e.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${g.bar}`} style={{ width: `${e.score}%` }} />
                    </div>
                    <span className={`text-xs font-black w-6 text-right ${g.text}`}>{e.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most improving */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📈 Eng ko'p o'sganlar (bu oy)
          </h3>
          {improving.length === 0 ? (
            <p className="text-gray-400 text-sm">Ma'lumot hali mavjud emas</p>
          ) : (
            <div className="space-y-2">
              {improving.map((e, i) => {
                const g = GRADE[e.current_grade];
                const isUp = e.delta > 0;
                return (
                  <div key={e.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
                    onClick={() => onSelectEmployee(e.id)}>
                    <div className="text-base">{isUp ? '↑' : e.delta === 0 ? '→' : '↓'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{e.full_name}</div>
                      <div className="text-[10px] text-gray-400">{e.role_obj?.name || e.role}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isUp ? '+' : ''}{e.delta} ball
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {e.prev_score} → <span className={`font-bold ${g.text}`}>{e.current_score}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grade distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Grad taqsimoti</h3>
        <div className="grid grid-cols-4 gap-4">
          {(['A', 'B', 'C', 'D'] as const).map(grade => {
            const g = GRADE[grade];
            const count = gradeDist[grade];
            const pct = ranking.length ? Math.round(count / ranking.length * 100) : 0;
            return (
              <div key={grade} className={`rounded-xl p-4 border ${g.border} ${g.bg} text-center`}>
                <div className="text-2xl mb-1">{g.emoji}</div>
                <div className={`text-2xl font-black ${g.text}`}>{grade}</div>
                <div className="text-sm font-semibold text-gray-700 mt-1">{count} xodim</div>
                <div className="text-xs text-gray-500">{pct}%</div>
                <div className={`text-[10px] mt-1 font-medium ${g.text}`}>{g.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Ranking Tab ──────────────────────────────────────────────────────────────

function RankingTab({ onSelect }: { onSelect: (id: number) => void }) {
  const [ranking, setRanking] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  useEffect(() => {
    api.get('users/performance-ranking/').then(r => setRanking(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const roles = [...new Set(ranking.map(e => e.role_obj?.name || e.role).filter(Boolean))];

  const filtered = ranking.filter(e => {
    const g = e.score >= 90 ? 'A' : e.score >= 75 ? 'B' : e.score >= 50 ? 'C' : 'D';
    return (
      (!filterRole || (e.role_obj?.name || e.role) === filterRole) &&
      (!filterGrade || g === filterGrade) &&
      (!search || e.full_name?.toLowerCase().includes(search.toLowerCase()) || e.username?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Ism yoki username..."
          className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Barcha rollar</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Barcha gradlar</option>
          {['A', 'B', 'C', 'D'].map(g => <option key={g} value={g}>Grad {g} — {GRADE[g].label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-3 py-2 w-10 text-center">#</th>
                <th className="px-3 py-2 text-left">Xodim</th>
                <th className="px-3 py-2 text-left">Rol</th>
                <th className="px-3 py-2 text-center">Ball</th>
                <th className="px-3 py-2 text-center w-40">KPI tarkibi</th>
                <th className="px-3 py-2 text-right">Bonus</th>
                <th className="px-3 py-2 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((emp, i) => {
                const grade = emp.score >= 90 ? 'A' : emp.score >= 75 ? 'B' : emp.score >= 50 ? 'C' : 'D';
                const g = GRADE[grade];
                const isTop = i < 3 && !filterRole && !filterGrade && !search;
                return (
                  <tr key={emp.id} className={`hover:bg-gray-50 transition-colors ${isTop ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-3 py-2.5 text-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mx-auto ${
                        i === 0 ? 'bg-amber-400 text-white' :
                        i === 1 ? 'bg-gray-300 text-gray-700' :
                        i === 2 ? 'bg-amber-700/60 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{emp.rank}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-gray-900 text-sm">{emp.full_name}</div>
                      <div className="text-xs text-gray-400">@{emp.username}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{emp.role_obj?.name || emp.role}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-black ${g.bg} ${g.text}`}>
                        {g.emoji} {emp.score}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {/* Compact 4-component mini bars */}
                      <div className="flex gap-0.5 items-end h-6">
                        {KPI_COMPONENTS.map(c => (
                          <div key={c.key} title={`${c.label}`}
                            className={`flex-1 rounded-sm ${c.color}`}
                            style={{ height: `${Math.max(4, ((emp as any)[c.key] ?? 50))}%` }} />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-700 text-xs">
                      {fmtMoney(emp.bonus_amount)} UZS
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => onSelect(emp.id)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        →
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Departments Tab ──────────────────────────────────────────────────────────

function DepartmentsTab() {
  const [depts, setDepts] = useState<DepartmentRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('users/department_ranking/').then(r => setDepts(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400 animate-pulse">Yuklanmoqda...</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Bo'limlar bo'yicha o'rtacha KPI ball — joriy oy</p>
      {depts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-2xl mb-2">🏢</p>
          <p>Bo'limlar ma'lumoti topilmadi</p>
          <p className="text-xs mt-1">Foydalanuvchilarga bo'lim belgilang</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depts.map(dept => {
            const g = GRADE[dept.grade];
            return (
              <div key={dept.dept_id} className={`rounded-xl border ${g.border} ${g.bg} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${g.text}`}>#{dept.rank}</span>
                      <h4 className="font-bold text-gray-900">{dept.department}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{dept.employee_count} xodim</p>
                  </div>
                  <div className={`text-2xl font-black px-3 py-1 rounded-lg ${g.bg} ${g.text} border ${g.border}`}>
                    {dept.grade}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-white/70 rounded-full h-3">
                    <div className={`h-3 rounded-full ${g.bar} transition-all duration-700`}
                      style={{ width: `${dept.avg_score}%` }} />
                  </div>
                  <span className={`text-xl font-black ${g.text}`}>{dept.avg_score}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Jami bonus fond:</span>
                  <span className={`font-bold ${g.text}`}>{fmtMoney(dept.total_bonus)} UZS</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type TabId = 'OVERVIEW' | 'RANKING' | 'DEPARTMENTS' | 'MY_KPI';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'OVERVIEW',     label: "Umumiy ko'rinish", icon: '📊' },
  { id: 'RANKING',      label: 'Reyting jadvali',  icon: '🏆' },
  { id: 'DEPARTMENTS',  label: "Bo'limlar reytingi",icon: '🏢' },
  { id: 'MY_KPI',       label: 'Mening KPI',        icon: '👤' },
];

export default function EmployeePerformanceCenter({ user }: { user: User }) {
  const [tab, setTab] = useState<TabId>('OVERVIEW');
  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-lg">🏅</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Xodimlar Performans Markazi</h1>
            <p className="text-xs text-gray-400">
              4-komponentli KPI · Ish hajmi 40% · Sifat 30% · Intizom 15% · Tejamkorlik 15%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {tab === 'OVERVIEW'    && <OverviewTab onSelectEmployee={id => setDetailId(id)} />}
          {tab === 'RANKING'     && <RankingTab onSelect={id => setDetailId(id)} />}
          {tab === 'DEPARTMENTS' && <DepartmentsTab />}
          {tab === 'MY_KPI'      && <EmployeeDetailPanel employeeId={user.id} inline onClose={() => {}} />}
        </div>
      </div>

      {/* Detail modal */}
      {detailId && <EmployeeDetailPanel employeeId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}
