
import axios from 'axios';
import { MOCK_DATA } from './mockData';

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.localhost');

export const API_URL = isLocalhost
  ? 'http://localhost:8000/api/'
  : 'https://penaplast.api.yolyolakayt.uz/api/';

function mkRes(data: any, config: any) {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

function pickMockKey(url: string): string | null {
  const keys = Object.keys(MOCK_DATA)
    .filter(k => url.includes(k))
    .sort((a, b) => b.length - a.length);
  return keys[0] ?? null;
}

const demoAdapter = async (config: any) => {
  const url: string = config.url || '';
  const method: string = (config.method || 'get').toLowerCase();

  // ── Mutations (POST / PUT / PATCH / DELETE) ──────────────────────
  if (method !== 'get') {
    if (url.includes('token/')) {
      let body: any = {};
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch {}
      if (body.username) localStorage.setItem('demo_last_username', body.username);
      return mkRes(MOCK_DATA['token/'], config);
    }
    // Any other mutation → optimistic success
    return mkRes({ success: true, detail: 'OK', id: Math.floor(Math.random() * 900) + 100 }, config);
  }

  // ── GET: /users/me/ — resolve by saved username ───────────────────
  if (url.includes('users/me/')) {
    const lastUsername = localStorage.getItem('demo_last_username') || 'admin';
    const found = (MOCK_DATA['users/'] as any[]).find(u => u.username === lastUsername);
    if (found) {
      return mkRes({
        ...found,
        role: found.effective_role || found.role,
        is_superuser: found.username === 'admin' || found.role === 'Bosh Admin',
        assigned_warehouses: (found.role === 'Bosh Admin' || found.username === 'admin') ? '*' : [],
      }, config);
    }
    return mkRes(MOCK_DATA['users/me/'], config);
  }

  // ── GET: contact-logs for specific client ─────────────────────────
  if (/clients\/\d+\/contact-logs/.test(url)) {
    return mkRes(MOCK_DATA['clients/contact-logs/'] || [], config);
  }

  // ── GET: invoices with customer filter ────────────────────────────
  if (url.includes('sales/invoices/')) {
    const customerId = config.params?.customer ? Number(config.params.customer) : null;
    let data: any[] = MOCK_DATA['sales/invoices/'] || [];
    if (customerId) data = data.filter(i => i.customer === customerId);
    return mkRes(data, config);
  }

  // ── GET: compliance violations with is_resolved filter ───────────
  if (url.includes('compliance/violations/')) {
    const raw = MOCK_DATA['compliance/violations/'] as any;
    const arr: any[] = raw?.results || raw || [];
    const param = config.params?.is_resolved;
    const filtered = (param === 'false' || param === false) ? arr.filter(v => !v.is_resolved) : arr;
    return mkRes({ results: filtered }, config);
  }

  // ── GET: production orders with status filter ─────────────────────
  if (url.includes('production/orders/')) {
    const key = pickMockKey(url);
    if (key && !config.params?.status) return mkRes(MOCK_DATA[key], config);
    let data: any[] = MOCK_DATA['production/orders/'] || [];
    if (config.params?.status) data = data.filter(o => o.status === config.params.status);
    return mkRes(data, config);
  }

  // ── GET: production blocks with status filter ─────────────────────
  if (url.includes('production/blocks/')) {
    let data: any[] = MOCK_DATA['production/blocks/'] || [];
    if (config.params?.status) data = data.filter(b => b.status === config.params.status);
    return mkRes(data, config);
  }

  // ── GET: blob export → real CSV data ────────────────────────────
  if (url.includes('export')) {
    const fmt = config.params?.file_format || (url.includes('PDF') ? 'PDF' : 'EXCEL');
    let rows: string[][] = [];

    if (url.includes('finance/export')) {
      const txns: any[] = (MOCK_DATA['finance/transactions/'] as any)?.results || MOCK_DATA['finance/transactions/'] || [];
      rows = [
        ['Sana', 'Tavsif', 'Miqdor (UZS)', 'Tur', 'Kassa', 'Kategoriya'],
        ...txns.map(t => [
          t.date ? new Date(t.date).toLocaleDateString('ru-RU') : '',
          t.description || '',
          String(t.amount || 0),
          t.type || '',
          t.cashbox_name || '',
          t.category_name || '',
        ]),
      ];
    } else if (url.includes('sales/export')) {
      const invoices: any[] = (MOCK_DATA['sales/invoices/'] as any[]) || [];
      rows = [
        ['Raqam', 'Mijoz', 'Sana', 'Jami (UZS)', 'Status', 'To\'lov turi'],
        ...invoices.map(i => [
          i.number || '',
          i.customer_name || '',
          i.created_at ? new Date(i.created_at).toLocaleDateString('ru-RU') : '',
          String(i.total_amount || 0),
          i.status || '',
          i.payment_method || '',
        ]),
      ];
    } else {
      rows = [['Demo Export'], ['Ma\'lumot mavjud emas']];
    }

    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const mimeType = fmt === 'PDF' ? 'text/csv;charset=utf-8;' : 'text/csv;charset=utf-8;';
    const ext = fmt === 'PDF' ? 'csv' : 'csv';
    const blob = new Blob([csv], { type: mimeType });
    const filename = url.includes('finance') ? `moliya-hisobot.${ext}` : `sotuv-hisobot.${ext}`;
    return {
      data: blob,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': mimeType, 'content-disposition': `attachment; filename="${filename}"` },
      config,
    };
  }

  // ── GET: generic longest-match lookup ────────────────────────────
  const key = pickMockKey(url);
  if (key !== null) return mkRes(MOCK_DATA[key], config);

  console.warn(`⚠️ DEMO FALLBACK: ${url}`);
  return mkRes([], config);
};

const api = axios.create({
  baseURL: API_URL,
  adapter: demoAdapter,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
