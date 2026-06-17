import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useI18n } from '../i18n';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number;
  username: string;
  full_name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
  is_active: boolean;
  is_superuser: boolean;
  role_obj?: { id: number; name: string };
  department?: { id: number; name: string };
  last_login?: string;
  last_login_ip?: string;
  date_joined?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: { id: number; name: string; codename: string }[];
}

interface AuditLog {
  id: number;
  user?: { id: number; full_name: string; username: string };
  action: string;
  module: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  status: 'SUCCESS' | 'ERROR' | 'WARNING';
}

interface ActiveUsersData {
  active_users: number;
  timestamp: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Faol',
  BLOCKED: 'Bloklangan',
  INACTIVE: 'Nofaol',
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'text-green-600',
  UPDATE: 'text-blue-600',
  DELETE: 'text-red-600',
  LOGIN: 'text-purple-600',
  LOGOUT: 'text-gray-500',
  ERROR: 'text-red-500',
};

function fmtDate(dt?: string) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab({ currentUser }: { currentUser: User }) {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'password' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', full_name: '', phone: '', email: '', password: '', role_obj: '' });
  const [pwdForm, setPwdForm] = useState({ new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('users/', { params: { search: search || undefined, status: filterStatus || undefined } }),
        api.get('roles/'),
      ]);
      setUsers(uRes.data?.results ?? uRes.data ?? []);
      setRoles(rRes.data?.results ?? rRes.data ?? []);
    } catch { /* noop */ }
    setLoading(false);
  }, [search, filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleImpersonate(user: User) {
    if (!window.confirm(`"${user.full_name}" sifatida kirasizmi?`)) return;
    try {
      const res = await api.post(`users/${user.id}/impersonate/`);
      const { access, refresh } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      window.location.reload();
    } catch (e: any) {
      alert('Xatolik: ' + (e?.response?.data?.detail || e.message));
    }
  }

  async function handleToggleStatus(user: User) {
    const action = user.status === 'ACTIVE' ? 'bloklash' : 'faollashtirish';
    if (!window.confirm(`"${user.full_name}"ni ${action}?`)) return;
    try {
      await api.post(`users/${user.id}/toggle_status/`);
      setMsg(`Foydalanuvchi ${action} muvaffaqiyatli`);
      load();
    } catch (e: any) {
      const err = e?.response?.data;
      let errMsg = String(err?.error || err || e.message);
      if (typeof err === 'object' && err !== null && !err.error) {
        errMsg = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ');
      }
      setMsg('Xatolik: ' + errMsg);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        username: form.username,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
      };
      if (form.role_obj) payload.role_id = Number(form.role_obj);
      if (modal === 'create') {
        payload.password = form.password;
        await api.post('users/', payload);
        setMsg('Foydalanuvchi yaratildi');
      } else if (selected) {
        await api.patch(`users/${selected.id}/`, payload);
        setMsg('Foydalanuvchi yangilandi');
      }
      setModal(null);
      load();
    } catch (e: any) {
      const err = e?.response?.data;
      let errMsg = String(err?.error || err || e.message);
      if (typeof err === 'object' && err !== null && !err.error) {
        errMsg = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ');
      }
      setMsg('Xatolik: ' + errMsg);
    }
    setSaving(false);
  }

  async function handleSetPassword() {
    if (pwdForm.new_password !== pwdForm.confirm) {
      setMsg('Parollar mos kelmadi'); return;
    }
    setSaving(true);
    try {
      await api.post(`users/${selected!.id}/set_password/`, { new_password: pwdForm.new_password });
      setMsg('Parol yangilandi');
      setModal(null);
    } catch (e: any) {
      const err = e?.response?.data;
      let errMsg = String(err?.error || err || e.message);
      if (typeof err === 'object' && err !== null && !err.error) {
        errMsg = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ');
      }
      setMsg('Xatolik: ' + errMsg);
    }
    setSaving(false);
  }

  function openEdit(u: User) {
    setSelected(u);
    setForm({ username: u.username, full_name: u.full_name, phone: u.phone, email: u.email || '', password: '', role_obj: String(u.role_obj?.id || '') });
    setModal('edit');
  }

  function openCreate() {
    setSelected(null);
    setForm({ username: '', full_name: '', phone: '', email: '', password: '', role_obj: '' });
    setModal('create');
  }

  function openPassword(u: User) {
    setSelected(u);
    setPwdForm({ new_password: '', confirm: '' });
    setModal('password');
  }

  const filtered = users.filter(u =>
    (!search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)) &&
    (!filterStatus || u.status === filterStatus)
  );

  return (
    <div>
      {msg && (
        <div className={`mb-3 p-3 rounded-lg text-sm font-medium ${msg.startsWith('Xatolik') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg}
          <button className="ml-2 text-xs opacity-60" onClick={() => setMsg('')}>×</button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("Ism, username yoki telefon bo'yicha qidirish...")}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">{t("Barcha statuslar")}</option>
          <option value="ACTIVE">Faol</option>
          <option value="BLOCKED">Bloklangan</option>
        </select>
        <button onClick={openCreate}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
          {t("+ Yangi foydalanuvchi")}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="text-left px-3 py-2 font-medium">Ism</th>
                <th className="text-left px-3 py-2 font-medium">Username</th>
                <th className="text-left px-3 py-2 font-medium">Telefon</th>
                <th className="text-left px-3 py-2 font-medium">Rol</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="text-left px-3 py-2 font-medium">{t("So'nggi kirish")}</th>
                <th className="text-left px-3 py-2 font-medium">IP</th>
                <th className="text-right px-3 py-2 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-900">
                    {u.full_name}
                    {u.is_superuser && <span className="ml-1 text-xs bg-purple-100 text-purple-700 rounded px-1">SU</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{u.username}</td>
                  <td className="px-3 py-2.5 text-gray-500">{u.phone}</td>
                  <td className="px-3 py-2.5 text-gray-500">{u.role_obj?.name || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[u.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[u.status] || u.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 text-xs">{fmtDate(u.last_login)}</td>
                  <td className="px-3 py-2.5 text-gray-400 text-xs font-mono">{u.last_login_ip || '—'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)}
                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">{t("Tahrir")}</button>
                      <button onClick={() => openPassword(u)}
                        className="text-xs px-2 py-1 text-orange-600 hover:bg-orange-50 rounded">Parol</button>
                      {u.id !== currentUser.id && (
                        <>
                          <button onClick={() => handleToggleStatus(u)}
                            className={`text-xs px-2 py-1 rounded ${u.status === 'ACTIVE' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {u.status === 'ACTIVE' ? 'Blok' : 'Faollashtir'}
                          </button>
                          <button onClick={() => handleImpersonate(u)}
                            className="text-xs px-2 py-1 text-purple-600 hover:bg-purple-50 rounded">{t("Kirish")}</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-6 text-gray-400">Foydalanuvchilar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Yangi foydalanuvchi' : 'Foydalanuvchini tahrirlash'} onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-3">
            {[
              { label: 'To\'liq ism', key: 'full_name', type: 'text' },
              { label: 'Username', key: 'username', type: 'text' },
              { label: 'Telefon', key: 'phone', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              ...(modal === 'create' ? [{ label: 'Parol', key: 'password', type: 'password' }] : []),
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select value={form.role_obj} onChange={e => setForm(f => ({ ...f, role_obj: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">— Rol tanlanmagan —</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-50">
                Bekor qilish
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'password' && selected && (
        <Modal title={`Parolni yangilash — ${selected.full_name}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Yangi parol</label>
              <input type="password" value={pwdForm.new_password}
                onChange={e => setPwdForm(f => ({ ...f, new_password: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tasdiqlash</label>
              <input type="password" value={pwdForm.confirm}
                onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSetPassword} disabled={saving}
                className="flex-1 bg-orange-600 text-white text-sm py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Saqlanmoqda...' : 'Yangilash'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-50">
                Bekor qilish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Roles ───────────────────────────────────────────────────────────────

function RolesTab() {
  const { t } = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<{ id: number; name: string; codename: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Role | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([api.get('roles/'), api.get('permissions/')]);
      setRoles(rRes.data?.results ?? rRes.data ?? []);
      setPerms(pRes.data?.results ?? pRes.data ?? []);
    } catch { /* noop */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    try {
      if (selected) {
        await api.patch(`roles/${selected.id}/`, form);
        setMsg('Rol yangilandi');
      } else {
        await api.post('roles/', form);
        setMsg('Rol yaratildi');
      }
      setModal(false);
      load();
    } catch (e: any) {
      setMsg('Xatolik: ' + (e?.response?.data?.name?.[0] || e.message));
    }
    setSaving(false);
  }

  async function handleDelete(role: Role) {
    if (!window.confirm(`"${role.name}" rolini o'chirasizmi?`)) return;
    try {
      await api.delete(`roles/${role.id}/`);
      setMsg('Rol o\'chirildi');
      load();
    } catch (e: any) {
      setMsg('Xatolik: ' + e.message);
    }
  }

  return (
    <div>
      {msg && (
        <div className={`mb-3 p-3 rounded-lg text-sm ${msg.startsWith('Xatolik') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg} <button className="ml-2 text-xs opacity-60" onClick={() => setMsg('')}>×</button>
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button onClick={() => { setSelected(null); setForm({ name: '', description: '' }); setModal(true); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Yangi rol
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{r.name}</h4>
                  {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelected(r); setForm({ name: r.name, description: r.description || '' }); setModal(true); }}
                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">{t("Tahrir")}</button>
                  <button onClick={() => handleDelete(r)}
                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded">O'chir</button>
                </div>
              </div>
              {r.permissions && r.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.permissions.map(p => (
                    <span key={p.id} className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{p.name}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{r.permissions?.length ?? 0} ta ruxsat</p>
            </div>
          ))}
          {roles.length === 0 && <p className="text-gray-400 text-sm col-span-2 text-center py-6">Rollar topilmadi</p>}
        </div>
      )}

      {modal && (
        <Modal title={selected ? 'Rolni tahrirlash' : 'Yangi rol'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol nomi</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tavsif</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-50">
                Bekor qilish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Audit Log ───────────────────────────────────────────────────────────

function AuditTab() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 30;

  const modules = [...new Set(logs.map(l => l.module).filter(Boolean))].slice(0, 20);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (filterModule) params.module = filterModule;
      if (filterAction) params.action = filterAction;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('audit-logs/', { params });
      const data = res.data;
      setLogs(data?.results ?? data ?? []);
      setCount(data?.count ?? (Array.isArray(data) ? data.length : 0));
    } catch { /* noop */ }
    setLoading(false);
  }, [page, filterModule, filterAction, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l =>
    !search || l.description?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tavsif yoki foydalanuvchi..."
          className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        <select value={filterModule} onChange={e => { setFilterModule(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Barcha modullar</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Barcha amallar</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ERROR'].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Barcha natijalar</option>
          <option value="SUCCESS">Muvaffaqiyat</option>
          <option value="ERROR">Xatolik</option>
          <option value="WARNING">Ogohlantirish</option>
        </select>
        <button onClick={load} className="border border-gray-200 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">⟳ Yangilash</button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="text-xs text-gray-400 mb-2">Jami: {count} ta yozuv</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="text-left px-3 py-2 font-medium">Vaqt</th>
                  <th className="text-left px-3 py-2 font-medium">Foydalanuvchi</th>
                  <th className="text-left px-3 py-2 font-medium">Amal</th>
                  <th className="text-left px-3 py-2 font-medium">Modul</th>
                  <th className="text-left px-3 py-2 font-medium">Tavsif</th>
                  <th className="text-left px-3 py-2 font-medium">IP</th>
                  <th className="text-left px-3 py-2 font-medium">Natija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{fmtDate(l.timestamp)}</td>
                    <td className="px-3 py-2 text-gray-700 text-xs">{l.user?.full_name || l.user?.username || '—'}</td>
                    <td className={`px-3 py-2 font-medium text-xs ${ACTION_COLOR[l.action] || 'text-gray-600'}`}>{l.action}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{l.module}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">{l.description}</td>
                    <td className="px-3 py-2 text-xs font-mono text-gray-400">{l.ip_address || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        l.status === 'ERROR' ? 'bg-red-100 text-red-700' :
                        l.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-6 text-gray-400">Yozuvlar topilmadi</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              ← Oldingi
            </button>
            <span className="text-xs text-gray-500">Sahifa {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={filtered.length < PAGE_SIZE}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Keyingi →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: Security ────────────────────────────────────────────────────────────

function SecurityTab() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorLogs, setErrorLogs] = useState<AuditLog[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, aRes, errRes] = await Promise.all([
        api.get('users/'),
        api.get('audit-logs/active_users/').catch(() => ({ data: null })),
        api.get('audit-logs/', { params: { status: 'ERROR', page_size: 10 } }),
      ]);
      setUsers(uRes.data?.results ?? uRes.data ?? []);
      setActiveUsers(aRes.data);
      setErrorLogs(errRes.data?.results ?? errRes.data ?? []);
    } catch { /* noop */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const blockedUsers = users.filter(u => u.status === 'BLOCKED');
  const recentLogins = users.filter(u => u.last_login).sort((a, b) =>
    new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime()
  ).slice(0, 10);

  const ipGroups: Record<string, User[]> = users.reduce<Record<string, User[]>>((acc, u) => {
    if (u.last_login_ip) {
      if (!acc[u.last_login_ip]) acc[u.last_login_ip] = [];
      acc[u.last_login_ip].push(u);
    }
    return acc;
  }, {});

  if (loading) return <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Faol sessiyalar', value: activeUsers?.active_users ?? '—', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Bloklangan foydalanuvchilar', value: blockedUsers.length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Xatoliklar (oxirgi)', value: errorLogs.length, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Jami foydalanuvchilar', value: users.length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent logins */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Oxirgi kirishlar</h4>
          <div className="space-y-2">
            {recentLogins.map(u => (
              <div key={u.id} className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-gray-800">{u.full_name}</span>
                  <span className="ml-1 text-gray-400">({u.username})</span>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">{fmtDate(u.last_login)}</div>
                  <div className="font-mono text-gray-400">{u.last_login_ip || '—'}</div>
                </div>
              </div>
            ))}
            {recentLogins.length === 0 && <p className="text-gray-400 text-xs">Ma'lumot yo'q</p>}
          </div>
        </div>

        {/* IP address groups */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">IP manzillar</h4>
          <div className="space-y-2">
            {Object.entries(ipGroups).sort((a, b) => b[1].length - a[1].length).slice(0, 10).map(([ip, ipUsers]) => (
              <div key={ip} className="flex items-center justify-between text-xs">
                <span className="font-mono text-gray-700">{ip}</span>
                <div className="text-right">
                  <span className={`${ipUsers.length > 1 ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                    {ipUsers.length} ta foydalanuvchi
                  </span>
                  <div className="text-gray-400">{ipUsers.map(u => u.username).join(', ')}</div>
                </div>
              </div>
            ))}
            {Object.keys(ipGroups).length === 0 && <p className="text-gray-400 text-xs">IP ma'lumotlar yo'q</p>}
          </div>
        </div>
      </div>

      {/* Recent errors */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Oxirgi xatoliklar</h4>
        {errorLogs.length > 0 ? (
          <div className="space-y-2">
            {errorLogs.map(l => (
              <div key={l.id} className="flex items-start gap-3 text-xs py-2 border-b border-gray-100 last:border-0">
                <div className="text-red-500 mt-0.5">⚠</div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-700">{l.description}</div>
                  <div className="text-gray-400 mt-0.5">{l.module} · {l.user?.full_name || '—'} · {fmtDate(l.timestamp)}</div>
                </div>
                <div className="text-gray-400 font-mono shrink-0">{l.ip_address || ''}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Oxirgi xatoliklar topilmadi</p>
        )}
      </div>

      {/* Blocked users */}
      {blockedUsers.length > 0 && (
        <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
          <h4 className="font-semibold text-red-700 mb-3 text-sm">Bloklangan foydalanuvchilar</h4>
          <div className="space-y-1">
            {blockedUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-800 font-medium">{u.full_name} <span className="text-gray-400">({u.username})</span></span>
                <span className="text-red-600">{u.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: System ──────────────────────────────────────────────────────────────

function SystemTab() {
  const { t } = useI18n();
  const [health, setHealth] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/health/');
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({ status: 'unknown', error: 'Health endpoint mavjud emas' });
      }
      setLoading(false);
    };
    load();
  }, []);

  const systemInfo = [
    { label: 'Platforma', value: 'PENAPLAS ERP v2.0' },
    { label: 'Backend', value: 'Django 5.2 + DRF' },
    { label: 'Frontend', value: 'React 19 + Vite 6' },
    { label: 'Auth', value: 'JWT (SimpleJWT)' },
    { label: 'DB', value: 'PostgreSQL' },
    { label: 'Sana', value: new Date().toLocaleDateString('uz-UZ') },
  ];

  return (
    <div className="space-y-6">
      {/* Health */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-4">Tizim holati</h4>
        {loading ? (
          <div className="text-gray-400 text-sm">Tekshirilmoqda...</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`font-medium ${health?.status === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                {health?.status === 'ok' ? 'Tizim normal ishlayapti' : 'Muammo aniqlandi'}
              </span>
            </div>
            {health && Object.entries(health).filter(([k]) => k !== 'status').map(([k, v]) => (
              <div key={k} className="text-xs text-gray-500 flex gap-2">
                <span className="font-medium text-gray-700">{k}:</span>
                <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System info */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-4">Tizim ma'lumotlari</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {systemInfo.map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className="text-sm font-medium text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles breakdown */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-4">Tizim modullari</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Sotuv', 'Ombor', 'Ishlab chiqarish', 'Sifat nazorat',
            'CNC', 'Pardozlash', 'Logistika', 'Moliya',
            'Buxgalteriya', 'Xodimlar', 'Chiqindi', 'Telemetriya'
          ].map(m => (
            <div key={m} className="flex items-center gap-2 text-xs py-1.5 px-2 bg-green-50 text-green-700 rounded">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  user: {
    id: number;
    username: string;
    full_name: string;
    is_superuser?: boolean;
    [key: string]: any;
  };
}

type TabId = 'users' | 'roles' | 'audit' | 'security' | 'system';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'users', label: 'Foydalanuvchilar', icon: '👤' },
  { id: 'roles', label: 'Rollar', icon: '🔐' },
  { id: 'audit', label: 'Audit log', icon: '📋' },
  { id: 'security', label: 'Xavfsizlik', icon: '🛡' },
  { id: 'system', label: 'Tizim', icon: '⚙️' },
];

export default function SuperAdminCenter({ user }: Props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>('users');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-bold text-sm">SA</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Super Admin Markazi</h1>
            <p className="text-xs text-gray-400">{user.full_name} — Tizim boshqaruvi</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {TABS.map(t_item => (
            <button key={t_item.id} onClick={() => setActiveTab(t_item.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t_item.id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <span>{t_item.icon}</span>
              <span>{t(t_item.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === 'users' && <UsersTab currentUser={user as User} />}
        {activeTab === 'roles' && <RolesTab />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'system' && <SystemTab />}
      </div>
    </div>
  );
}
