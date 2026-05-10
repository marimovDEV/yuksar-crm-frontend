
const d = (daysAgo: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString();
};
const today = new Date().toISOString();

export const MOCK_DATA: Record<string, any> = {
  // ─── DASHBOARD ───────────────────────────────────────────────────
  'dashboard/summary/': {
    total_sales: 1250000000,
    active_orders: 45,
    production_efficiency: 94.2,
    stock_value: 850000000,
    sales_growth: 12.5,
    order_growth: 8.4,
    efficiency_growth: -1.2,
    stock_growth: 5.7,
    strategicKpis: [
      { name: 'Sof Foyda', value: 450000000, trend: '+12.4%', color: 'indigo' },
      { name: 'Tushum', value: 1250000000, trend: '+8%', color: 'emerald' },
      { name: 'Xarajatlar', value: 380500000, trend: '-5.2%', color: 'rose' },
      { name: 'Sklad Qiymati', value: 850200000, trend: '+5.7%', color: 'amber' },
    ],
    todayStats: { intake: '1 850 kg', production: '62 dona', waste: '18 kg', sales_count: 11 },
    chartData: [
      { name: 'Dush', prod: 420, sales: 260 },
      { name: 'Sesh', prod: 380, sales: 310 },
      { name: 'Chor', prod: 510, sales: 480 },
      { name: 'Pay', prod: 460, sales: 390 },
      { name: 'Jum', prod: 620, sales: 540 },
      { name: 'Shan', prod: 390, sales: 300 },
      { name: 'Yak', prod: 280, sales: 220 },
    ],
    heuristics: {
      supply_alerts: [
        { id: 1, message: 'Polistirol zaxirasi kamaymoqda', warehouse: 'Sklad 1', days_left: 3, status: 'CRITICAL', action_label: 'Xarid', action_type: 'ORDER' },
        { id: 2, message: 'Yelim zaxirasi minimal darajada', warehouse: 'Sklad 1', days_left: 5, status: 'WARNING', action_label: 'Tekshirish', action_type: 'VIEW' },
      ],
      strategic_metrics: [
        { title: 'Cash Flow Risk', content: 'Kutilayotgan kassa uzilishi', value: '15-may', description: 'Kelgusi hafta xom-ashyo to\'lovlari uchun mablag\' yetishmasligi ehtimoli bor.', type: 'RISK', action_label: 'Moliya Paneli', tab_id: 'finance' },
        { title: 'Efficiency Opportunity', content: 'CNC kesish tezligini oshirish', value: '+15%', description: 'Yangi tartib bo\'yicha bloklarni joylashtirish chiqindini 5% ga kamaytiradi.', type: 'OPPORTUNITY', action_label: 'CNC Paneli', tab_id: 'cnc' },
      ],
    },
  },

  // ─── AUTH ─────────────────────────────────────────────────────────
  'token/': { access: 'demo_access_token', refresh: 'demo_refresh_token' },
  'users/me/': { id: 1, username: 'admin', name: 'Alisher Usmonov', role: 'SUPERADMIN', is_superuser: true, assigned_warehouses: '*' },

  // ─── USERS / ROLES / DEPARTMENTS ─────────────────────────────────
  'users/': [
    { id: 1, username: 'admin', name: 'Alisher Usmonov', full_name: 'Alisher Usmonov', role: 'Bosh Admin', role_display: 'Bosh Admin', effective_role: 'Bosh Admin', phone: '+998901112233', status: 'ACTIVE', salary: 15000000, department_name: 'Boshqaruv', is_superuser: true },
    { id: 2, username: 'omborchi_bobur', name: 'Bobur Xolmatov', full_name: 'Bobur Xolmatov', role: 'Omborchi', role_display: 'Omborchi', effective_role: 'Omborchi', phone: '+998903334455', status: 'ACTIVE', salary: 5500000, department_name: 'Ombor' },
    { id: 3, username: 'usta_karim', name: 'Karim Toshmatov', full_name: 'Karim Toshmatov', role: 'Ishlab chiqarish ustasi', role_display: 'Ishlab chiqarish ustasi', effective_role: 'Ishlab chiqarish ustasi', phone: '+998905556677', status: 'ACTIVE', salary: 7000000, department_name: 'Ishlab chiqarish' },
    { id: 4, username: 'cnc_sardor', name: 'Sardor Yusupov', full_name: 'Sardor Yusupov', role: 'CNC operatori', role_display: 'CNC operatori', effective_role: 'CNC operatori', phone: '+998907778899', status: 'ACTIVE', salary: 6000000, department_name: 'CNC' },
    { id: 5, username: 'pardoz_nilufar', name: 'Nilufar Rahimova', full_name: 'Nilufar Rahimova', role: 'Pardozlovchi', role_display: 'Pardozlovchi', effective_role: 'Pardozlovchi', phone: '+998909990011', status: 'ACTIVE', salary: 5000000, department_name: 'Pardozlash' },
    { id: 6, username: 'chiqindi_otabek', name: 'Otabek Nazarov', full_name: 'Otabek Nazarov', role: 'Chiqindi operatori', role_display: 'Chiqindi operatori', effective_role: 'Chiqindi operatori', phone: '+998901231122', status: 'ACTIVE', salary: 4500000, department_name: 'Chiqindi' },
    { id: 7, username: 'sales_jamshid', name: 'Jamshid Karimov', full_name: 'Jamshid Karimov', role: 'Sotuv menejeri', role_display: 'Sotuv menejeri', effective_role: 'Sotuv menejeri', phone: '+998904445566', status: 'ACTIVE', salary: 8000000, department_name: 'Sotuv' },
    { id: 8, username: 'kuryer_shahzod', name: 'Shahzod Ergashev', full_name: 'Shahzod Ergashev', role: 'Kuryer', role_display: 'Kuryer', effective_role: 'Kuryer', phone: '+998906667788', status: 'ACTIVE', salary: 4000000, department_name: 'Logistika' },
    { id: 9, username: 'moliya_kamola', name: 'Kamola Abdullayeva', full_name: 'Kamola Abdullayeva', role: 'Moliya boshqaruvchi', role_display: 'Moliya boshqaruvchi', effective_role: 'Moliya boshqaruvchi', phone: '+998902223344', status: 'ACTIVE', salary: 9000000, department_name: 'Moliya' },
    { id: 10, username: 'buxgalter_gulnora', name: 'Gulnora Ismoilova', full_name: 'Gulnora Ismoilova', role: 'Buxgalter', role_display: 'Buxgalter', effective_role: 'Buxgalter', phone: '+998908889900', status: 'ACTIVE', salary: 8500000, department_name: 'Buxgalteriya' },
  ],
  'roles/': [
    { id: 1, name: 'Bosh Admin', permissions: [1,2,3,4,5,6,7,8,9,10] },
    { id: 2, name: 'Omborchi', permissions: [1,2,3] },
    { id: 3, name: 'Ishlab chiqarish ustasi', permissions: [2,3,4] },
    { id: 4, name: 'CNC operatori', permissions: [3,4] },
    { id: 5, name: 'Pardozlovchi', permissions: [4] },
    { id: 6, name: 'Chiqindi operatori', permissions: [4] },
    { id: 7, name: 'Sotuv menejeri', permissions: [5,6] },
    { id: 8, name: 'Kuryer', permissions: [6] },
    { id: 9, name: 'Moliya boshqaruvchi', permissions: [7,8] },
    { id: 10, name: 'Buxgalter', permissions: [8,9] },
  ],
  'departments/': [
    { id: 1, name: 'Boshqaruv', description: 'Zavod rahbariyati' },
    { id: 2, name: 'Ombor', description: 'Xom ashyo va tayyor mahsulot ombori' },
    { id: 3, name: 'Ishlab chiqarish', description: 'Penoplast ishlab chiqarish bo\'limi' },
    { id: 4, name: 'CNC', description: 'CNC kesish bo\'limi' },
    { id: 5, name: 'Pardozlash', description: 'Pardozlash va bezash bo\'limi' },
    { id: 6, name: 'Chiqindi', description: 'Chiqindi qayta ishlash bo\'limi' },
    { id: 7, name: 'Sotuv', description: 'Sotuv va mijozlar xizmati' },
    { id: 8, name: 'Logistika', description: 'Yetkazib berish va transport' },
    { id: 9, name: 'Moliya', description: 'Moliya va kassa boshqaruvi' },
    { id: 10, name: 'Buxgalteriya', description: 'Buxgalteriya va hisobot' },
  ],

  // ─── NOTIFICATIONS / AUDIT ───────────────────────────────────────
  'notifications/': [
    { id: 1, message: 'Yangi xarid buyurtmasi kutilmoqda', type: 'info', timestamp: d(0) },
    { id: 2, message: 'Sklad 1 da xom-ashyo kam qoldi', type: 'error', timestamp: d(0) },
    { id: 3, message: 'PO-2026-003 buyurtmasi tasdiqlandi', type: 'success', timestamp: d(1) },
  ],
  'audit-logs/active_users/': { active_count: 4, total_users: 10, status: 'Barqaror' },
  'audit-logs/': {
    results: [
      { id: 1, userName: 'Alisher Usmonov', action: 'Tizimga kirdi', module: 'Auth', timestamp: d(0), status: 'SUCCESS', ipAddress: '192.168.1.10' },
      { id: 2, userName: 'Jamshid Karimov', action: 'Yangi buyurtma yaratdi', module: 'Sales', timestamp: d(0), status: 'SUCCESS', ipAddress: '192.168.1.12' },
      { id: 3, userName: 'Karim Toshmatov', action: 'Zames yaratdi', module: 'Production', timestamp: d(0), status: 'SUCCESS', ipAddress: '192.168.1.15' },
      { id: 4, userName: 'Bobur Xolmatov', action: 'Stok yangiladi', module: 'Warehouse', timestamp: d(1), status: 'SUCCESS', ipAddress: '192.168.1.11' },
      { id: 5, userName: 'Sardor Yusupov', action: 'CNC ishi yakunladi', module: 'CNC', timestamp: d(1), status: 'SUCCESS', ipAddress: '192.168.1.14' },
      { id: 6, userName: 'Kamola Abdullayeva', action: 'Kassa operatsiyasi', module: 'Finance', timestamp: d(1), status: 'SUCCESS', ipAddress: '192.168.1.16' },
      { id: 7, userName: 'Gulnora Ismoilova', action: 'Journal yozuvi qo\'shdi', module: 'Accounting', timestamp: d(2), status: 'SUCCESS', ipAddress: '192.168.1.17' },
      { id: 8, userName: 'Jamshid Karimov', action: 'Invoice tasdiqladi', module: 'Sales', timestamp: d(2), status: 'SUCCESS', ipAddress: '192.168.1.12' },
    ]
  },

  // ─── WAREHOUSE ────────────────────────────────────────────────────
  'warehouses/': [
    { id: 1, name: 'Sklad №1 — Xom Ashyo', location: 'Toshkent, Sergeli', capacity: 50000, current_usage: 18500 },
    { id: 2, name: 'Sklad №2 — Bloklar', location: 'Toshkent, Sergeli', capacity: 30000, current_usage: 12000 },
    { id: 3, name: 'Sklad №3 — CNC/Dekor', location: 'Toshkent, Sergeli', capacity: 20000, current_usage: 8200 },
    { id: 4, name: 'Sklad №4 — Tayyor Mahsulot', location: 'Toshkent, Sergeli', capacity: 40000, current_usage: 22000 },
  ],
  'stocks/': [
    { id: 1, material_name: 'Polistirol EPS PSB-S-20', material_unit: 'kg', quantity: 8500, available_quantity: 7200, reserved_quantity: 1300, total_value: 102000000, status: 'OK', warehouse_name: 'Sklad №1', updated_at: d(0) },
    { id: 2, material_name: 'Polistirol EPS PSB-S-25', material_unit: 'kg', quantity: 3200, available_quantity: 2800, reserved_quantity: 400, total_value: 44800000, status: 'OK', warehouse_name: 'Sklad №1', updated_at: d(0) },
    { id: 3, name: 'Yelim PVA', material_name: 'Yelim PVA', material_unit: 'kg', quantity: 420, available_quantity: 380, reserved_quantity: 40, total_value: 6300000, status: 'LOW', warehouse_name: 'Sklad №1', updated_at: d(1) },
    { id: 4, material_name: 'Antopiren (olov himoya)', material_unit: 'kg', quantity: 650, available_quantity: 600, reserved_quantity: 50, total_value: 9750000, status: 'OK', warehouse_name: 'Sklad №1', updated_at: d(1) },
    { id: 5, material_name: 'Amortizator lenta', material_unit: 'm', quantity: 1200, available_quantity: 1000, reserved_quantity: 200, total_value: 3600000, status: 'OK', warehouse_name: 'Sklad №1', updated_at: d(2) },
    { id: 6, material_name: 'Penoplast Blok 20kg/m³', material_unit: 'dona', quantity: 180, available_quantity: 140, reserved_quantity: 40, total_value: 81000000, status: 'OK', warehouse_name: 'Sklad №2', updated_at: d(0) },
    { id: 7, material_name: 'Penoplast Blok 25kg/m³', material_unit: 'dona', quantity: 95, available_quantity: 80, reserved_quantity: 15, total_value: 49875000, status: 'LOW', warehouse_name: 'Sklad №2', updated_at: d(0) },
    { id: 8, material_name: 'Kesilgan Plita 50mm', material_unit: 'dona', quantity: 320, available_quantity: 290, reserved_quantity: 30, total_value: 22400000, status: 'OK', warehouse_name: 'Sklad №4', updated_at: d(0) },
    { id: 9, material_name: 'Kesilgan Plita 100mm', material_unit: 'dona', quantity: 210, available_quantity: 185, reserved_quantity: 25, total_value: 29400000, status: 'OK', warehouse_name: 'Sklad №4', updated_at: d(1) },
  ],
  'warehouse/inventory/': [
    { id: 1, product_name: 'Polistirol EPS PSB-S-20', quantity: 7200, unit: 'kg', warehouse_name: 'Sklad №1' },
    { id: 2, product_name: 'Yelim PVA', quantity: 380, unit: 'kg', warehouse_name: 'Sklad №1' },
    { id: 3, product_name: 'Penoplast Blok 20kg/m³', quantity: 140, unit: 'dona', warehouse_name: 'Sklad №2' },
    { id: 4, product_name: 'Kesilgan Plita 50mm', quantity: 290, unit: 'dona', warehouse_name: 'Sklad №4' },
  ],
  'warehouse/transfers/': [
    { id: 1, transfer_number: 'TR-2026-001', from_warehouse_name: 'Sklad №2', to_warehouse_name: 'Sklad №3', material_name: 'Penoplast Blok 20kg', quantity: 30, status: 'COMPLETED', created_at: d(0) },
    { id: 2, transfer_number: 'TR-2026-002', from_warehouse_name: 'Sklad №1', to_warehouse_name: 'Sklad №2', material_name: 'Polistirol EPS', quantity: 500, status: 'COMPLETED', created_at: d(1) },
  ],
  'transfers/': [
    { id: 1, transfer_number: 'TRF-2026-001', from_warehouse: 2, from_warehouse_name: 'Sklad №2 — Bloklar', to_warehouse: 3, to_warehouse_name: 'Sklad №3 — CNC/Dekor', material: 1, material_name: 'Penoplast Blok 20kg/m³', quantity: 40, unit: 'dona', status: 'COMPLETED', notes: 'CNC kesish uchun', created_at: d(0) },
    { id: 2, transfer_number: 'TRF-2026-002', from_warehouse: 3, from_warehouse_name: 'Sklad №3 — CNC/Dekor', to_warehouse: 4, to_warehouse_name: 'Sklad №4 — Tayyor Mahsulot', material: 4, material_name: 'Kesilgan Plita 50mm', quantity: 80, unit: 'dona', status: 'COMPLETED', notes: 'Tayyor mahsulot omboriga', created_at: d(1) },
    { id: 3, transfer_number: 'TRF-2026-003', from_warehouse: 1, from_warehouse_name: 'Sklad №1 — Xom Ashyo', to_warehouse: 2, to_warehouse_name: 'Sklad №2 — Bloklar', material: 2, material_name: 'Polistirol EPS PSB-S-25', quantity: 200, unit: 'kg', status: 'IN_TRANSIT', notes: 'Ishlab chiqarish uchun', created_at: d(0) },
    { id: 4, transfer_number: 'TRF-2026-004', from_warehouse: 2, from_warehouse_name: 'Sklad №2 — Bloklar', to_warehouse: 4, to_warehouse_name: 'Sklad №4 — Tayyor Mahsulot', material: 3, material_name: 'Penoplast Blok 25kg/m³', quantity: 20, unit: 'dona', status: 'PENDING', notes: '', created_at: d(0) },
  ],

  // ─── MATERIALS / PRODUCTS / BATCHES ──────────────────────────────
  'materials/': [
    { id: 1, name: 'Polistirol EPS PSB-S-20', unit: 'kg', price: 12000, category: 'RAW', description: 'Asosiy xom ashyo, zichligi 20 kg/m³' },
    { id: 2, name: 'Polistirol EPS PSB-S-25', unit: 'kg', price: 14000, category: 'RAW', description: 'Asosiy xom ashyo, zichligi 25 kg/m³' },
    { id: 3, name: 'Yelim PVA', unit: 'kg', price: 15000, category: 'RAW', description: 'Qatlam yopishtirgich' },
    { id: 4, name: 'Antopiren (olov himoya)', unit: 'kg', price: 18000, category: 'RAW', description: 'Olovga chidamlilik qo\'shimchasi' },
    { id: 5, name: 'Amortizator lenta', unit: 'm', price: 3000, category: 'RAW', description: 'O\'rash va himoya lentalari' },
    { id: 6, name: 'Penoplast Blok 20kg/m³', unit: 'dona', price: 450000, category: 'SEMI', description: 'Yarim tayyor blok, 1x1x0.5m' },
    { id: 7, name: 'Penoplast Blok 25kg/m³', unit: 'dona', price: 525000, category: 'SEMI', description: 'Yarim tayyor blok, 1x1x0.5m' },
    { id: 8, name: 'Kesilgan Plita 50mm', unit: 'dona', price: 70000, category: 'FINISHED', description: '1x0.5m, 50mm qalinlikdagi plita' },
    { id: 9, name: 'Kesilgan Plita 100mm', unit: 'dona', price: 140000, category: 'FINISHED', description: '1x0.5m, 100mm qalinlikdagi plita' },
    { id: 10, name: 'Qirqim chiqindilari', unit: 'kg', price: 2000, category: 'OTHER', description: 'Qayta ishlash uchun' },
  ],
  'products/': [
    { id: 1, name: 'Penoplast Blok 20kg/m³ (PSB-S-20)', sku: 'BL-20', unit: 'dona', price: 450000, category: 'BLOK', description: '1x1x0.5m, zichligi 20 kg/m³' },
    { id: 2, name: 'Penoplast Blok 25kg/m³ (PSB-S-25)', sku: 'BL-25', unit: 'dona', price: 525000, category: 'BLOK', description: '1x1x0.5m, zichligi 25 kg/m³' },
    { id: 3, name: 'Plita 50mm (PSB-S-15)', sku: 'PL-50', unit: 'dona', price: 70000, category: 'PLITA', description: '1x0.5m, 50mm, zichligi 15 kg/m³' },
    { id: 4, name: 'Plita 100mm (PSB-S-20)', sku: 'PL-100', unit: 'dona', price: 140000, category: 'PLITA', description: '1x0.5m, 100mm, zichligi 20 kg/m³' },
    { id: 5, name: 'Plita 150mm (PSB-S-25)', sku: 'PL-150', unit: 'dona', price: 210000, category: 'PLITA', description: '1x0.5m, 150mm, zichligi 25 kg/m³' },
    { id: 6, name: 'Qirqim (chiqindi) — qayta ishlash', sku: 'WS-01', unit: 'kg', price: 2000, category: 'CHIQINDI', description: 'CNC sexi chiqindilari' },
  ],
  'batches/': [
    { id: 1, batch_number: 'LOT-2026-001', material_name: 'Polistirol EPS PSB-S-20', supplier_name: 'Polimer Trade LLC', quantity: 2000, remaining_quantity: 1800, unit: 'kg', status: 'IN_STOCK', price_per_unit: 12000, created_at: d(5) },
    { id: 2, batch_number: 'LOT-2026-002', material_name: 'Polistirol EPS PSB-S-25', supplier_name: 'Polimer Trade LLC', quantity: 1000, remaining_quantity: 900, unit: 'kg', status: 'IN_STOCK', price_per_unit: 14000, created_at: d(4) },
    { id: 3, batch_number: 'LOT-2026-003', material_name: 'Yelim PVA', supplier_name: 'Chemical Uz', quantity: 500, remaining_quantity: 420, unit: 'kg', status: 'IN_STOCK', price_per_unit: 15000, created_at: d(3) },
    { id: 4, batch_number: 'LOT-2026-004', material_name: 'Antopiren (olov himoya)', supplier_name: 'Chemical Uz', quantity: 300, remaining_quantity: 280, unit: 'kg', status: 'IN_STOCK', price_per_unit: 18000, created_at: d(2) },
    { id: 5, batch_number: 'LOT-2026-005', material_name: 'Polistirol EPS PSB-S-20', supplier_name: 'EPS Markazi LLC', quantity: 3000, remaining_quantity: 3000, unit: 'kg', status: 'RECEIVED', price_per_unit: 11500, created_at: d(0) },
  ],

  // ─── SUPPLIERS ────────────────────────────────────────────────────
  'suppliers/': [
    { id: 1, name: 'Polimer Trade LLC', contact_info: '+998901234567, info@polimer.uz', rating: 4.5, address: 'Toshkent, Yunusobod' },
    { id: 2, name: 'Chemical Uz', contact_info: '+998907654321, chem@chemuz.uz', rating: 4.2, address: 'Toshkent, Chilonzor' },
    { id: 3, name: 'EPS Markazi LLC', contact_info: '+998909988776, eps@epscenter.uz', rating: 4.8, address: 'Toshkent, Shayxontohur' },
    { id: 4, name: 'O\'zPolimer MCHJ', contact_info: '+998901122334, info@uzpolimer.uz', rating: 3.9, address: 'Samarqand viloyati' },
  ],

  // ─── CLIENTS / CRM ────────────────────────────────────────────────
  'clients/': [
    { id: 1, name: 'Dilshod Ergashev', company_name: 'Artel MCHJ', phone: '+998901234567', secondary_phone: '+998911234567', email: 'dartel@artel.uz', address: 'Toshkent, Mirzo Ulugbek', balance: -12000000, customer_type: 'WHOLESALE', customer_type_display: 'Ulgurji', credit_limit: 50000000, total_purchased: 380000000, orders_count: 24, lead_status: 'WON', interest_level: 'HIGH', assigned_manager: 7, created_at: d(120) },
    { id: 2, name: 'Zulfiya Xasanova', company_name: 'Texnopark LLC', phone: '+998902345678', email: 'info@texnopark.uz', address: 'Toshkent, Yakkasaroy', balance: 0, customer_type: 'WHOLESALE', customer_type_display: 'Ulgurji', credit_limit: 30000000, total_purchased: 220000000, orders_count: 15, lead_status: 'WON', interest_level: 'HIGH', assigned_manager: 7, created_at: d(90) },
    { id: 3, name: 'Mansur Tursunov', company_name: 'Toshkent Qurilish', phone: '+998903456789', address: 'Toshkent, Uchtepa', balance: -5500000, customer_type: 'WHOLESALE', customer_type_display: 'Ulgurji', credit_limit: 20000000, total_purchased: 95000000, orders_count: 8, lead_status: 'WON', interest_level: 'MEDIUM', assigned_manager: 7, created_at: d(60) },
    { id: 4, name: 'Mohira Yusupova', company_name: 'Andijan Servis', phone: '+998904567890', address: 'Andijon shahar', balance: 2000000, customer_type: 'RETAIL', customer_type_display: 'Chakana', credit_limit: 5000000, total_purchased: 28000000, orders_count: 5, lead_status: 'WON', interest_level: 'MEDIUM', assigned_manager: 7, created_at: d(45) },
    { id: 5, name: 'Behruz Qodirov', company_name: 'Samarqand Trade', phone: '+998905678901', email: 'b.qodirov@samtrade.uz', address: 'Samarqand shahar', balance: -8000000, customer_type: 'WHOLESALE', customer_type_display: 'Ulgurji', credit_limit: 40000000, total_purchased: 165000000, orders_count: 12, lead_status: 'WON', interest_level: 'HIGH', assigned_manager: 7, created_at: d(75) },
    { id: 6, name: 'Nargiza Alimova', company_name: '', phone: '+998906789012', address: 'Toshkent, Olmazor', balance: 0, customer_type: 'RETAIL', customer_type_display: 'Chakana', credit_limit: 2000000, total_purchased: 4500000, orders_count: 3, lead_status: 'NEGOTIATION', interest_level: 'LOW', assigned_manager: 7, created_at: d(10) },
    { id: 7, name: 'Jasur Mirzayev', company_name: 'Buxoro Trans', phone: '+998907890123', email: 'j.mirzayev@buxtrans.uz', address: 'Buxoro shahar', balance: -3200000, customer_type: 'WHOLESALE', customer_type_display: 'Ulgurji', credit_limit: 25000000, total_purchased: 72000000, orders_count: 7, lead_status: 'WON', interest_level: 'MEDIUM', assigned_manager: 7, created_at: d(50) },
    { id: 8, name: 'Sherzod Raximov', company_name: '', phone: '+998908901234', address: 'Toshkent, Bektemir', balance: 1500000, customer_type: 'RETAIL', customer_type_display: 'Chakana', credit_limit: 3000000, total_purchased: 8500000, orders_count: 4, lead_status: 'LEAD', interest_level: 'MEDIUM', assigned_manager: 7, created_at: d(5) },
  ],
  'clients/contact-logs/': [
    { id: 1, customer: 1, manager: 7, manager_name: 'Jamshid Karimov', contact_type: 'CALL', notes: 'Yangi buyurtma muhokamasi. 500 dona blok kerak.', follow_up_date: d(-3), created_at: d(2) },
    { id: 2, customer: 1, manager: 7, manager_name: 'Jamshid Karimov', contact_type: 'MEETING', notes: 'Ofisda uchrashuv. Narx kelishildi.', follow_up_date: null, created_at: d(7) },
    { id: 3, customer: 2, manager: 7, manager_name: 'Jamshid Karimov', contact_type: 'TELEGRAM', notes: 'Yetkazib berish muddati haqida savol. 3 ish kunida javob berildi.', follow_up_date: null, created_at: d(1) },
  ],

  // ─── SALES / INVOICES ─────────────────────────────────────────────
  'sales/invoices/': [
    { id: 1, invoice_number: 'INV-2026-001', customer: 1, customer_name: 'Artel MCHJ', total_amount: 90000000, status: 'DELIVERED', status_display: 'Yetkazildi', payment_method: 'BANK', payment_method_display: 'Bank', delivery_address: 'Toshkent, Mirzo Ulugbek', discount_amount: 5000000, items: [{ id:1, product: 1, product_name: 'Penoplast Blok 20kg/m³', quantity: 200, price: 450000 }], created_at: d(10) },
    { id: 2, invoice_number: 'INV-2026-002', customer: 2, customer_name: 'Texnopark LLC', total_amount: 52500000, status: 'SHIPPED', status_display: 'Yetkazilmoqda', payment_method: 'CASH', payment_method_display: 'Naqd', delivery_address: 'Toshkent, Yakkasaroy', discount_amount: 0, items: [{ id:2, product: 2, product_name: 'Penoplast Blok 25kg/m³', quantity: 100, price: 525000 }], created_at: d(5) },
    { id: 3, invoice_number: 'INV-2026-003', customer: 5, customer_name: 'Samarqand Trade', total_amount: 42000000, status: 'IN_PRODUCTION', status_display: 'Ishlab chiqarilmoqda', payment_method: 'DEBT', payment_method_display: 'Nasiya', delivery_address: 'Samarqand shahar', discount_amount: 3000000, items: [{ id:3, product: 3, product_name: 'Plita 50mm', quantity: 600, price: 70000 }], created_at: d(3) },
    { id: 4, invoice_number: 'INV-2026-004', customer: 3, customer_name: 'Toshkent Qurilish', total_amount: 28000000, status: 'CONFIRMED', status_display: 'Tasdiqlandi', payment_method: 'BANK', payment_method_display: 'Bank', delivery_address: 'Toshkent, Uchtepa', discount_amount: 0, items: [{ id:4, product: 4, product_name: 'Plita 100mm', quantity: 200, price: 140000 }], created_at: d(2) },
    { id: 5, invoice_number: 'INV-2026-005', customer: 7, customer_name: 'Buxoro Trans', total_amount: 31500000, status: 'NEW', status_display: 'Yangi', payment_method: 'CASH', payment_method_display: 'Naqd', delivery_address: 'Buxoro shahar', discount_amount: 0, items: [{ id:5, product: 2, product_name: 'Penoplast Blok 25kg/m³', quantity: 60, price: 525000 }], created_at: d(0) },
    { id: 6, invoice_number: 'INV-2026-006', customer: 4, customer_name: 'Andijan Servis', total_amount: 8400000, status: 'COMPLETED', status_display: 'Yakunlandi', payment_method: 'CARD', payment_method_display: 'Karta', delivery_address: 'Andijon shahar', discount_amount: 600000, items: [{ id:6, product: 3, product_name: 'Plita 50mm', quantity: 120, price: 70000 }], created_at: d(15) },
    { id: 7, invoice_number: 'INV-2026-007', customer: 1, customer_name: 'Artel MCHJ', total_amount: 105000000, status: 'READY', status_display: 'Tayyor', payment_method: 'BANK', payment_method_display: 'Bank', delivery_address: 'Toshkent, Mirzo Ulugbek', discount_amount: 0, items: [{ id:7, product: 1, product_name: 'Penoplast Blok 20kg/m³', quantity: 200, price: 450000 }, { id:8, product: 3, product_name: 'Plita 50mm', quantity: 150, price: 70000 }], created_at: d(1) },
  ],
  'sales/contracts/': [
    { id: 1, contract_number: 'CONT-2026-001', title: 'Asosiy yetkazib berish shartnomasi', customer_name: 'Artel MCHJ', status: 'ACTIVE', total_value: 500000000, start_date: '2026-01-01', end_date: '2026-12-31', days_remaining: 237 },
    { id: 2, contract_number: 'CONT-2026-002', title: 'Qurilish materiallari shartnomasi', customer_name: 'Toshkent Qurilish', status: 'ACTIVE', total_value: 120000000, start_date: '2026-02-01', end_date: '2026-07-31', days_remaining: 83 },
    { id: 3, contract_number: 'CONT-2026-003', title: 'Ulgurji savdo shartnomasi', customer_name: 'Samarqand Trade', status: 'ACTIVE', total_value: 200000000, start_date: '2026-03-01', end_date: '2026-08-31', days_remaining: 114 },
  ],
  'sales/debtors/': {
    total_debt: 28700000,
    debtors_count: 4,
    avg_debt: 7175000,
    top_debtor: { name: 'Artel MCHJ', amount: 12000000 },
    aging_summary: { '0-30': 18200000, '30-60': 8000000, '60-90': 2500000, '90+': 0 },
    debtors: [
      { id: 1, name: 'Dilshod Ergashev', company: 'Artel MCHJ', debt: 12000000, days_overdue: 18, aging: '0-30', phone: '+998901234567' },
      { id: 3, name: 'Mansur Tursunov', company: 'Toshkent Qurilish', debt: 5500000, days_overdue: 42, aging: '30-60', phone: '+998903456789' },
      { id: 5, name: 'Behruz Qodirov', company: 'Samarqand Trade', debt: 8000000, days_overdue: 35, aging: '30-60', phone: '+998905678901' },
      { id: 7, name: 'Jasur Mirzayev', company: 'Buxoro Trans', debt: 3200000, days_overdue: 8, aging: '0-30', phone: '+998907890123' },
    ],
  },
  'sales/kpi/': { total_sales: 357900000, orders_count: 7, conversion_rate: 68.4, avg_order_value: 51128571, new_clients: 2 },

  // ─── PRODUCTION ───────────────────────────────────────────────────
  'production/recipes/': [
    { id: 1, name: 'PSB-S-20 Standart', description: 'Standart 20 kg/m³ zichlikdagi penoplast retsepti', items: [{ id:1, material: 1, material_name: 'Polistirol EPS PSB-S-20', quantity: 45 }, { id:2, material: 4, material_name: 'Antopiren (olov himoya)', quantity: 2 }] },
    { id: 2, name: 'PSB-S-25 Mustahkam', description: 'Mustahkam 25 kg/m³ zichlikdagi penoplast retsepti', items: [{ id:3, material: 2, material_name: 'Polistirol EPS PSB-S-25', quantity: 52 }, { id:4, material: 4, material_name: 'Antopiren (olov himoya)', quantity: 2.5 }] },
    { id: 3, name: 'PSB-S-15 Yengil', description: 'Yengil 15 kg/m³ zichlikdagi penoplast', items: [{ id:5, material: 1, material_name: 'Polistirol EPS PSB-S-20', quantity: 38 }] },
  ],
  'production/zames/': [
    { id: 1, zames_number: 'ZMS-2026-001', recipe: 1, recipe_name: 'PSB-S-20 Standart', status: 'DONE', input_weight: 47, output_weight: 44.5, operator: 3, operator_name: 'Karim Toshmatov', machine_id: 'MX-01', start_time: d(2), end_time: d(2), created_at: d(2) },
    { id: 2, zames_number: 'ZMS-2026-002', recipe: 2, recipe_name: 'PSB-S-25 Mustahkam', status: 'DONE', input_weight: 54.5, output_weight: 53, operator: 3, operator_name: 'Karim Toshmatov', machine_id: 'MX-01', start_time: d(1), end_time: d(1), created_at: d(1) },
    { id: 3, zames_number: 'ZMS-2026-003', recipe: 1, recipe_name: 'PSB-S-20 Standart', status: 'IN_PROGRESS', input_weight: 47, output_weight: 0, operator: 3, operator_name: 'Karim Toshmatov', machine_id: 'MX-02', start_time: d(0), end_time: null, created_at: d(0) },
    { id: 4, zames_number: 'ZMS-2026-004', recipe: 3, recipe_name: 'PSB-S-15 Yengil', status: 'PENDING', input_weight: 38, output_weight: 0, operator: 3, operator_name: 'Karim Toshmatov', machine_id: null, start_time: null, end_time: null, created_at: d(0) },
  ],
  'production/bunkers/': [
    { id: 1, bunker_number: 1, name: 'Bunker №1', status: 'Ready', capacity: 1000, current_fill: 980, zames_id: 1, zames_number: 'ZMS-2026-001', loaded_at: d(2), aging_time_hours: 24, material_name: 'PSB-S-20 Standart' },
    { id: 2, bunker_number: 2, name: 'Bunker №2', status: 'Aging', capacity: 1000, current_fill: 860, zames_id: 2, zames_number: 'ZMS-2026-002', loaded_at: d(1), aging_time_hours: 18, material_name: 'PSB-S-25 Mustahkam' },
    { id: 3, bunker_number: 3, name: 'Bunker №3', status: 'Empty', capacity: 1000, current_fill: 0, zames_id: null, zames_number: null, loaded_at: null, aging_time_hours: 0, material_name: null },
    { id: 4, bunker_number: 4, name: 'Bunker №4', status: 'Aging', capacity: 1200, current_fill: 1100, zames_id: 3, zames_number: 'ZMS-2026-003', loaded_at: d(0), aging_time_hours: 10, material_name: 'PSB-S-20 Standart' },
  ],
  'production/blocks/': [
    { id: 1, zames: 1, zames_number: 'ZMS-2026-001', form_number: 'F-0101', block_count: 1, length: 1000, width: 1000, height: 500, density: 20, volume: 0.5, weight_per_block: 10, status: 'READY', status_display: 'Tayyor', warehouse: 2, date: d(2) },
    { id: 2, zames: 1, zames_number: 'ZMS-2026-001', form_number: 'F-0102', block_count: 1, length: 1000, width: 1000, height: 500, density: 20, volume: 0.5, weight_per_block: 10, status: 'RESERVED', status_display: 'Band qilingan', warehouse: 2, date: d(2) },
    { id: 3, zames: 2, zames_number: 'ZMS-2026-002', form_number: 'F-0201', block_count: 1, length: 1000, width: 1000, height: 500, density: 25, volume: 0.5, weight_per_block: 12.5, status: 'READY', status_display: 'Tayyor', warehouse: 2, date: d(1) },
    { id: 4, zames: 2, zames_number: 'ZMS-2026-002', form_number: 'F-0202', block_count: 1, length: 1000, width: 1000, height: 500, density: 25, volume: 0.5, weight_per_block: 12.5, status: 'DRYING', status_display: 'Quritilmoqda', warehouse: 2, date: d(1) },
    { id: 5, zames: 1, zames_number: 'ZMS-2026-001', form_number: 'F-0103', block_count: 1, length: 1000, width: 1000, height: 500, density: 20, volume: 0.5, weight_per_block: 10, status: 'SOLD', status_display: 'Sotildi', warehouse: 2, date: d(3) },
  ],
  'production/orders/': [
    { id: 1, order_number: 'PO-2026-001', product: 1, product_name: 'Penoplast Blok 20kg/m³', quantity: 200, progress: 65, status: 'IN_PROGRESS', status_display: 'Jarayonda', priority: 'HIGH', responsible: 3, responsible_name: 'Karim Toshmatov', start_date: d(5), deadline: d(-3), created_at: d(7), source_order: 'INV-2026-001', stages: [
      { id: 1, order: 1, stage_type: 'ZAMES', stage_type_display: 'Zames', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 1, started_at: d(5), completed_at: d(5), responsible: 3, related_id: 1 },
      { id: 2, order: 1, stage_type: 'DRYING', stage_type_display: 'Quritish', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 2, started_at: d(5), completed_at: d(4), responsible: 3, related_id: null },
      { id: 3, order: 1, stage_type: 'BUNKER', stage_type_display: 'Bunker', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 3, started_at: d(4), completed_at: d(3), responsible: 3, related_id: 1 },
      { id: 4, order: 1, stage_type: 'FORMOVKA', stage_type_display: 'Formovka', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 4, started_at: d(3), completed_at: d(2), responsible: 3, related_id: null },
      { id: 5, order: 1, stage_type: 'BLOK', stage_type_display: 'Blok', status: 'ACTIVE', status_display: 'Faol', sequence: 5, started_at: d(2), completed_at: null, responsible: 3, related_id: 1 },
      { id: 6, order: 1, stage_type: 'CNC', stage_type_display: 'CNC', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 6, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 7, order: 1, stage_type: 'DEKOR', stage_type_display: 'Dekor', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 7, started_at: null, completed_at: null, responsible: null, related_id: null },
    ]},
    { id: 2, order_number: 'PO-2026-002', product: 2, product_name: 'Penoplast Blok 25kg/m³', quantity: 100, progress: 100, status: 'COMPLETED', status_display: 'Tugallandi', priority: 'MEDIUM', responsible: 3, responsible_name: 'Karim Toshmatov', start_date: d(10), deadline: d(-1), created_at: d(12), source_order: 'INV-2026-002', stages: [
      { id: 8, order: 2, stage_type: 'ZAMES', stage_type_display: 'Zames', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 1, started_at: d(10), completed_at: d(10), responsible: 3, related_id: 2 },
      { id: 9, order: 2, stage_type: 'DRYING', stage_type_display: 'Quritish', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 2, started_at: d(10), completed_at: d(9), responsible: 3, related_id: null },
      { id: 10, order: 2, stage_type: 'BUNKER', stage_type_display: 'Bunker', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 3, started_at: d(9), completed_at: d(8), responsible: 3, related_id: 2 },
      { id: 11, order: 2, stage_type: 'FORMOVKA', stage_type_display: 'Formovka', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 4, started_at: d(8), completed_at: d(7), responsible: 3, related_id: null },
      { id: 12, order: 2, stage_type: 'BLOK', stage_type_display: 'Blok', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 5, started_at: d(7), completed_at: d(5), responsible: 3, related_id: 3 },
      { id: 13, order: 2, stage_type: 'CNC', stage_type_display: 'CNC', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 6, started_at: d(5), completed_at: d(3), responsible: 4, related_id: 1 },
      { id: 14, order: 2, stage_type: 'DEKOR', stage_type_display: 'Dekor', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 7, started_at: d(3), completed_at: d(1), responsible: 5, related_id: null },
    ]},
    { id: 3, order_number: 'PO-2026-003', product: 3, product_name: 'Plita 50mm', quantity: 600, progress: 20, status: 'IN_PROGRESS', status_display: 'Jarayonda', priority: 'HIGH', responsible: 3, responsible_name: 'Karim Toshmatov', start_date: d(2), deadline: d(-7), created_at: d(3), source_order: 'INV-2026-003', stages: [
      { id: 15, order: 3, stage_type: 'ZAMES', stage_type_display: 'Zames', status: 'COMPLETED', status_display: 'Tugallandi', sequence: 1, started_at: d(2), completed_at: d(2), responsible: 3, related_id: 3 },
      { id: 16, order: 3, stage_type: 'DRYING', stage_type_display: 'Quritish', status: 'ACTIVE', status_display: 'Faol', sequence: 2, started_at: d(1), completed_at: null, responsible: 3, related_id: null },
      { id: 17, order: 3, stage_type: 'BUNKER', stage_type_display: 'Bunker', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 3, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 18, order: 3, stage_type: 'FORMOVKA', stage_type_display: 'Formovka', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 4, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 19, order: 3, stage_type: 'BLOK', stage_type_display: 'Blok', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 5, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 20, order: 3, stage_type: 'CNC', stage_type_display: 'CNC', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 6, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 21, order: 3, stage_type: 'DEKOR', stage_type_display: 'Dekor', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 7, started_at: null, completed_at: null, responsible: null, related_id: null },
    ]},
    { id: 4, order_number: 'PO-2026-004', product: 4, product_name: 'Plita 100mm', quantity: 200, progress: 0, status: 'PENDING', status_display: 'Kutilmoqda', priority: 'MEDIUM', responsible: null, responsible_name: null, start_date: null, deadline: d(-10), created_at: d(1), source_order: 'INV-2026-004', stages: [
      { id: 22, order: 4, stage_type: 'ZAMES', stage_type_display: 'Zames', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 1, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 23, order: 4, stage_type: 'DRYING', stage_type_display: 'Quritish', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 2, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 24, order: 4, stage_type: 'BUNKER', stage_type_display: 'Bunker', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 3, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 25, order: 4, stage_type: 'FORMOVKA', stage_type_display: 'Formovka', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 4, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 26, order: 4, stage_type: 'BLOK', stage_type_display: 'Blok', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 5, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 27, order: 4, stage_type: 'CNC', stage_type_display: 'CNC', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 6, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 28, order: 4, stage_type: 'DEKOR', stage_type_display: 'Dekor', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 7, started_at: null, completed_at: null, responsible: null, related_id: null },
    ]},
    { id: 5, order_number: 'PO-2026-005', product: 2, product_name: 'Penoplast Blok 25kg/m³', quantity: 60, progress: 0, status: 'QC_PENDING', status_display: 'QC tekshiruvi', priority: 'LOW', responsible: 3, responsible_name: 'Karim Toshmatov', start_date: d(8), deadline: d(-2), created_at: d(9), stages: [
      { id: 29, order: 5, stage_type: 'ZAMES', stage_type_display: 'Zames', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 1, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 30, order: 5, stage_type: 'DRYING', stage_type_display: 'Quritish', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 2, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 31, order: 5, stage_type: 'BUNKER', stage_type_display: 'Bunker', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 3, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 32, order: 5, stage_type: 'FORMOVKA', stage_type_display: 'Formovka', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 4, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 33, order: 5, stage_type: 'BLOK', stage_type_display: 'Blok', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 5, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 34, order: 5, stage_type: 'CNC', stage_type_display: 'CNC', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 6, started_at: null, completed_at: null, responsible: null, related_id: null },
      { id: 35, order: 5, stage_type: 'DEKOR', stage_type_display: 'Dekor', status: 'PENDING', status_display: 'Kutilmoqda', sequence: 7, started_at: null, completed_at: null, responsible: null, related_id: null },
    ]},
  ],
  'production/orders/kpi_summary/': { total_orders: 5, completed: 1, in_progress: 2, delayed: 1, qc_pending: 1 },
  'production/batches/': [
    { id: 1, batch_number: 'PBATCH-2026-001', product_name: 'Penoplast Blok 20kg/m³', total_cost: 22500000, unit_cost: 112500, quantity: 200 },
  ],
  'production/waste/': [
    { id: 1, task_number: 'W-2026-001', batch_number: 'ZMS-2026-001', category_name: 'CNC Qirqim', weight_kg: 12.5, status: 'COMPLETED', dept_display: 'CNC Sexi', created_at: d(2) },
    { id: 2, task_number: 'W-2026-002', batch_number: 'ZMS-2026-002', category_name: 'Ishlab chiqarish chiqindisi', weight_kg: 8.0, status: 'PROCESSING', dept_display: 'Ishlab chiqarish', created_at: d(1) },
  ],

  // ─── CNC ──────────────────────────────────────────────────────────
  'cnc/jobs/': [
    { id: 1, job_number: 'CNC-2026-001', input_block: 1, input_block_number: 'F-0101', output_product: 3, output_product_name: 'Plita 50mm', quantity_planned: 10, quantity_finished: 10, machine_id: 'CNC-01', status: 'COMPLETED', operator_name: 'Sardor Yusupov', priority: 'HIGH', start_time: d(3), last_started_at: d(3), total_duration_seconds: 5400, end_time: d(3), created_at: d(3), waste_m3: 0.02 },
    { id: 2, job_number: 'CNC-2026-002', input_block: 3, input_block_number: 'F-0201', output_product: 4, output_product_name: 'Plita 100mm', quantity_planned: 5, quantity_finished: 3, machine_id: 'CNC-01', status: 'IN_PROGRESS', operator_name: 'Sardor Yusupov', priority: 'MEDIUM', start_time: d(0), last_started_at: d(0), total_duration_seconds: 1800, end_time: null, created_at: d(0), waste_m3: 0.01 },
    { id: 3, job_number: 'CNC-2026-003', input_block: null, input_block_number: 'F-0102', output_product: 3, output_product_name: 'Plita 50mm', quantity_planned: 10, quantity_finished: 0, machine_id: 'CNC-02', status: 'PENDING', operator_name: 'Sardor Yusupov', priority: 'LOW', start_time: null, last_started_at: null, total_duration_seconds: 0, end_time: null, created_at: d(0), waste_m3: 0 },
  ],

  // ─── FINISHING ────────────────────────────────────────────────────
  'finishing/jobs/': [
    { id: 1, job_number: 'FIN-2026-001', cnc_job: 1, product: 3, product_name: 'Plita 50mm', quantity: 10, current_stage: 'READY', stage_display: 'Tayyor', status: 'COMPLETED', status_display: 'Tugallandi', operator: 5, operator_name: 'Nilufar Rahimova', notes: null, progress: 100, started_at: d(2), completed_at: d(1), created_at: d(3) },
    { id: 2, job_number: 'FIN-2026-002', cnc_job: 2, product: 4, product_name: 'Plita 100mm', quantity: 3, current_stage: 'SHPAKLYOVKA', stage_display: 'Shpaklyovka', status: 'RUNNING', status_display: 'Bajarilmoqda', operator: 5, operator_name: 'Nilufar Rahimova', notes: 'Ehtiyot bilan', progress: 60, started_at: d(0), completed_at: null, created_at: d(0) },
    { id: 3, job_number: 'FIN-2026-003', cnc_job: null, product: 3, product_name: 'Plita 50mm', quantity: 8, current_stage: 'ARMIRLASH', stage_display: 'Armirlash', status: 'PENDING', status_display: 'Kutilmoqda', operator: null, operator_name: null, notes: null, progress: 0, started_at: null, completed_at: null, created_at: d(0) },
  ],

  // ─── WASTE ────────────────────────────────────────────────────────
  'waste/categories/': [
    { id: 1, name: 'CNC Qirqim', norm_percent: 5, description: 'CNC kesishda hosil bo\'ladigan qirqim chiqindilari' },
    { id: 2, name: 'Ishlab chiqarish chiqindisi', norm_percent: 3, description: 'Blok quyishda hosil bo\'ladigan chiqindilar' },
    { id: 3, name: 'Pardozlash chiqindisi', norm_percent: 2, description: 'Pardozlash bosqichidagi chiqindilar' },
    { id: 4, name: 'Nuqsonli mahsulot', norm_percent: 1, description: 'Sifat nazoratidan o\'tmagan mahsulotlar' },
  ],
  'waste/tasks/': [
    { id: 1, task_number: 'WS-2026-001', source_department: 'CNC', dept_display: 'CNC Sexi', batch_number: 'ZMS-2026-001', category: 1, category_name: 'CNC Qirqim', weight_kg: 12.5, status: 'COMPLETED', status_display: 'Tugallandi', operator: 6, operator_name: 'Otabek Nazarov', created_at: d(3), last_started_at: d(2), finished_at: d(2), total_duration_seconds: 3600, recycled_weight_kg: 11.2, loss_weight_kg: 1.3, notes: null },
    { id: 2, task_number: 'WS-2026-002', source_department: 'PRODUCTION', dept_display: 'Ishlab chiqarish', batch_number: 'ZMS-2026-002', category: 2, category_name: 'Ishlab chiqarish chiqindisi', weight_kg: 8.0, status: 'PROCESSING', status_display: 'Qayta ishlanmoqda', operator: 6, operator_name: 'Otabek Nazarov', created_at: d(1), last_started_at: d(0), finished_at: null, total_duration_seconds: 1800, recycled_weight_kg: 0, loss_weight_kg: 0, notes: 'Granulator yordamida' },
    { id: 3, task_number: 'WS-2026-003', source_department: 'FINISHING', dept_display: 'Pardozlash', batch_number: 'FIN-2026-002', category: 3, category_name: 'Pardozlash chiqindisi', weight_kg: 3.5, status: 'PENDING', status_display: 'Kutilmoqda', operator: null, operator_name: null, created_at: d(0), last_started_at: null, finished_at: null, total_duration_seconds: 0, recycled_weight_kg: 0, loss_weight_kg: 0, notes: null },
  ],
  'waste/tasks/stats/': { total_weight_kg: 24, recycled_kg: 11.2, loss_kg: 1.3, pending_count: 1, processing_count: 1, completed_count: 1, recycling_rate: 87.5 },

  // ─── FINANCE ──────────────────────────────────────────────────────
  'finance/cashboxes/': [
    { id: 1, name: 'Asosiy Kassa (Naqd)', type: 'CASH', type_display: 'Naqd pul', balance: 12500000, branch: 'Asosiy filial', responsible_person: 9, responsible_person_name: 'Kamola Abdullayeva', is_active: true },
    { id: 2, name: 'Asosiy Bank (Toshkent)', type: 'BANK', type_display: 'Bank hisobi', balance: 87500000, branch: 'Toshkent', responsible_person: 9, responsible_person_name: 'Kamola Abdullayeva', is_active: true },
    { id: 3, name: 'Karta Hisobi', type: 'CARD', type_display: 'Plastik karta', balance: 5200000, branch: 'Asosiy filial', responsible_person: 9, responsible_person_name: 'Kamola Abdullayeva', is_active: true },
  ],
  'finance/categories/': [
    { id: 1, name: 'Sotuv tushumi', description: 'Mahsulot sotuvidan olingan daromad' },
    { id: 2, name: 'Xom ashyo xarid', description: 'Xom ashyo va materiallar xaridi' },
    { id: 3, name: 'Xodimlar maoshi', description: 'Oylik maosh to\'lovlari' },
    { id: 4, name: 'Kommunal xizmatlar', description: 'Elektr, gaz, suv to\'lovlari' },
    { id: 5, name: 'Transport xarajatlari', description: 'Yuk tashish va yetkazib berish' },
    { id: 6, name: 'Ijara', description: 'Ishlab chiqarish maydonlari ijarasi' },
    { id: 7, name: 'Boshqa xarajatlar', description: 'Turli operatsion xarajatlar' },
    { id: 8, name: 'Mijozdan to\'lov', description: 'Mijozlardan kelgan to\'lovlar' },
  ],
  'finance/transactions/': [
    { id: 1, cashbox: 1, cashbox_name: 'Asosiy Kassa', amount: 90000000, type: 'INCOME', department: 'SALES', category_name: 'Sotuv tushumi', customer_name: 'Artel MCHJ', description: 'INV-2026-001 to\'lovi', performed_by_name: 'Jamshid Karimov', created_at: d(10) },
    { id: 2, cashbox: 1, cashbox_name: 'Asosiy Kassa', amount: 24000000, type: 'EXPENSE', department: 'PRODUCTION', category_name: 'Xom ashyo xarid', customer_name: '', description: 'Polistirol EPS xaridi (LOT-2026-001)', performed_by_name: 'Kamola Abdullayeva', created_at: d(8) },
    { id: 3, cashbox: 2, cashbox_name: 'Asosiy Bank', amount: 52500000, type: 'INCOME', department: 'SALES', category_name: 'Sotuv tushumi', customer_name: 'Texnopark LLC', description: 'INV-2026-002 to\'lovi (bank orqali)', performed_by_name: 'Kamola Abdullayeva', created_at: d(5) },
    { id: 4, cashbox: 1, cashbox_name: 'Asosiy Kassa', amount: 55000000, type: 'EXPENSE', department: 'ADMIN', category_name: 'Xodimlar maoshi', customer_name: '', description: 'Aprel oyi maoshi', performed_by_name: 'Kamola Abdullayeva', created_at: d(4) },
    { id: 5, cashbox: 2, cashbox_name: 'Asosiy Bank', amount: 8500000, type: 'EXPENSE', department: 'PRODUCTION', category_name: 'Kommunal xizmatlar', customer_name: '', description: 'Elektr energiya to\'lovi, aprel', performed_by_name: 'Kamola Abdullayeva', created_at: d(3) },
    { id: 6, cashbox: 1, cashbox_name: 'Asosiy Kassa', amount: 12000000, type: 'EXPENSE', department: 'LOGISTICS', category_name: 'Transport xarajatlari', customer_name: '', description: 'Yuk mashinalari yoqilg\'isi va ta\'mir', performed_by_name: 'Kamola Abdullayeva', created_at: d(2) },
    { id: 7, cashbox: 3, cashbox_name: 'Karta Hisobi', amount: 8400000, type: 'INCOME', department: 'SALES', category_name: 'Sotuv tushumi', customer_name: 'Andijan Servis', description: 'INV-2026-006 to\'lovi (karta)', performed_by_name: 'Jamshid Karimov', created_at: d(15) },
    { id: 8, cashbox: 2, cashbox_name: 'Asosiy Bank', amount: 18000000, type: 'EXPENSE', department: 'ADMIN', category_name: 'Ijara', customer_name: '', description: 'Ishlab chiqarish binosi ijarasi, may', performed_by_name: 'Kamola Abdullayeva', created_at: d(1) },
  ],
  'finance/transfers/': [
    { id: 1, from_cashbox: 1, from_cashbox_name: 'Asosiy Kassa', to_cashbox: 2, to_cashbox_name: 'Asosiy Bank', amount: 50000000, description: 'Oylik bank o\'tkazmasi', performed_by_name: 'Kamola Abdullayeva', created_at: d(4) },
    { id: 2, from_cashbox: 2, from_cashbox_name: 'Asosiy Bank', to_cashbox: 3, to_cashbox_name: 'Karta Hisobi', amount: 5000000, description: 'Karta to\'ldirish', performed_by_name: 'Kamola Abdullayeva', created_at: d(2) },
  ],
  'finance/client-balances/': [
    { id: 1, customer: 1, customer_name: 'Artel MCHJ', total_debt: 12000000, last_updated: d(1) },
    { id: 3, customer: 3, customer_name: 'Toshkent Qurilish', total_debt: 5500000, last_updated: d(2) },
    { id: 5, customer: 5, customer_name: 'Samarqand Trade', total_debt: 8000000, last_updated: d(0) },
    { id: 7, customer: 7, customer_name: 'Buxoro Trans', total_debt: 3200000, last_updated: d(1) },
  ],
  'finance/analytics/': {
    total_income: 163400000,
    total_expense: 117500000,
    net_profit: 45900000,
    profit_margin: 28.1,
    cash_balance: 105200000,
    monthly_trend: [
      { month: 'Yan', income: 95000000, expense: 72000000 },
      { month: 'Fev', income: 110000000, expense: 81000000 },
      { month: 'Mar', income: 138000000, expense: 98000000 },
      { month: 'Apr', income: 155000000, expense: 110000000 },
      { month: 'May', income: 163400000, expense: 117500000 },
    ],
    expense_breakdown: [
      { name: 'Xom ashyo', value: 24000000 },
      { name: 'Maosh', value: 55000000 },
      { name: 'Kommunal', value: 8500000 },
      { name: 'Transport', value: 12000000 },
      { name: 'Ijara', value: 18000000 },
    ],
  },

  // ─── ACCOUNTING ───────────────────────────────────────────────────
  'accounting/summary/': {
    balances: { cash: 12500000, bank: 87500000, total_cash: 105200000, receivables: 28700000, payables: 14200000, raw_materials: 102000000, finished_goods: 132675000 },
    monthly_pl: { revenue: 163400000, expenses: 117500000, net_income: 45900000, profit_margin: 28.1 },
    monthly_totals: { total_debit: 281000000, total_credit: 281000000 },
    recent_entries: [],
    entry_count: 48, posted_count: 45, draft_count: 3,
  },
  'accounting/accounts/tree/': [
    { id: 1, code: '1000', name: 'Aktivlar', account_type: 'ASSET', account_type_display: 'Aktiv', parent: null, children_count: 3, balance: 368575000, full_path: '1000 — Aktivlar', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0), children: [
      { id: 2, code: '1010', name: 'Naqd pul', account_type: 'ASSET', account_type_display: 'Aktiv', parent: 1, children_count: 0, balance: 12500000, full_path: '1000 → 1010', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 3, code: '1020', name: 'Bank hisobi', account_type: 'ASSET', account_type_display: 'Aktiv', parent: 1, children_count: 0, balance: 87500000, full_path: '1000 → 1020', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 4, code: '1200', name: 'Debitorlik qarzlari', account_type: 'ASSET', account_type_display: 'Aktiv', parent: 1, children_count: 0, balance: 28700000, full_path: '1000 → 1200', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 5, code: '1300', name: 'Xom ashyo zaxiralari', account_type: 'ASSET', account_type_display: 'Aktiv', parent: 1, children_count: 0, balance: 102000000, full_path: '1000 → 1300', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 6, code: '1400', name: 'Tayyor mahsulot', account_type: 'ASSET', account_type_display: 'Aktiv', parent: 1, children_count: 0, balance: 132675000, full_path: '1000 → 1400', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
    ]},
    { id: 10, code: '2000', name: 'Majburiyatlar', account_type: 'LIABILITY', account_type_display: 'Majburiyat', parent: null, children_count: 2, balance: 14200000, full_path: '2000 — Majburiyatlar', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0), children: [
      { id: 11, code: '2100', name: 'Kreditorlik qarzlari', account_type: 'LIABILITY', account_type_display: 'Majburiyat', parent: 10, children_count: 0, balance: 14200000, full_path: '2000 → 2100', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
    ]},
    { id: 20, code: '3000', name: 'Kapital', account_type: 'EQUITY', account_type_display: 'Kapital', parent: null, children_count: 1, balance: 250000000, full_path: '3000 — Kapital', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0), children: [
      { id: 21, code: '3100', name: 'Ustav kapitali', account_type: 'EQUITY', account_type_display: 'Kapital', parent: 20, children_count: 0, balance: 250000000, full_path: '3000 → 3100', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
    ]},
    { id: 30, code: '4000', name: 'Daromadlar', account_type: 'REVENUE', account_type_display: 'Daromad', parent: null, children_count: 1, balance: 163400000, full_path: '4000 — Daromadlar', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0), children: [
      { id: 31, code: '4100', name: 'Sotuv daromadi', account_type: 'REVENUE', account_type_display: 'Daromad', parent: 30, children_count: 0, balance: 163400000, full_path: '4000 → 4100', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
    ]},
    { id: 40, code: '5000', name: 'Xarajatlar', account_type: 'EXPENSE', account_type_display: 'Xarajat', parent: null, children_count: 5, balance: 117500000, full_path: '5000 — Xarajatlar', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0), children: [
      { id: 41, code: '5100', name: 'Xom ashyo', account_type: 'EXPENSE', account_type_display: 'Xarajat', parent: 40, children_count: 0, balance: 24000000, full_path: '5000 → 5100', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 42, code: '5200', name: 'Maosh xarajatlari', account_type: 'EXPENSE', account_type_display: 'Xarajat', parent: 40, children_count: 0, balance: 55000000, full_path: '5000 → 5200', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 43, code: '5300', name: 'Kommunal xarajatlar', account_type: 'EXPENSE', account_type_display: 'Xarajat', parent: 40, children_count: 0, balance: 8500000, full_path: '5000 → 5300', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 44, code: '5400', name: 'Transport xarajatlari', account_type: 'EXPENSE', account_type_display: 'Xarajat', parent: 40, children_count: 0, balance: 12000000, full_path: '5000 → 5400', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
      { id: 45, code: '5500', name: 'Ijara xarajatlari', account_type: 'EXPENSE', account_type_display: 'Xarajat', parent: 40, children_count: 0, balance: 18000000, full_path: '5000 → 5500', is_active: true, is_system: true, description: '', created_at: d(200), updated_at: d(0) },
    ]},
  ],
  'accounting/journal-entries/': {
    results: [
      { id: 1, entry_number: 'JE-2026-001', date: d(10), description: 'Artel MCHJ\'dan to\'lov qabul qilindi', source_type: 'SALE', source_type_display: 'Sotuv', status: 'POSTED', status_display: 'Tasdiqlangan', total_amount: 90000000, total_debit: 90000000, total_credit: 90000000, is_balanced: true, created_by_name: 'Gulnora Ismoilova', posted_at: d(10), created_at: d(10), updated_at: d(10), lines: [{ id:1, account: 2, account_code: '1010', account_name: 'Naqd pul', debit: 90000000, credit: 0, description: '' }, { id:2, account: 31, account_code: '4100', account_name: 'Sotuv daromadi', debit: 0, credit: 90000000, description: '' }] },
      { id: 2, entry_number: 'JE-2026-002', date: d(8), description: 'Xom ashyo xaridi — Polimer Trade LLC', source_type: 'WAREHOUSE', source_type_display: 'Ombor', status: 'POSTED', status_display: 'Tasdiqlangan', total_amount: 24000000, total_debit: 24000000, total_credit: 24000000, is_balanced: true, created_by_name: 'Gulnora Ismoilova', posted_at: d(8), created_at: d(8), updated_at: d(8), lines: [{ id:3, account: 5, account_code: '1300', account_name: 'Xom ashyo zaxiralari', debit: 24000000, credit: 0, description: '' }, { id:4, account: 2, account_code: '1010', account_name: 'Naqd pul', debit: 0, credit: 24000000, description: '' }] },
      { id: 3, entry_number: 'JE-2026-003', date: d(4), description: 'Aprel oyi maoshi to\'lovi', source_type: 'MANUAL', source_type_display: 'Qo\'lda', status: 'POSTED', status_display: 'Tasdiqlangan', total_amount: 55000000, total_debit: 55000000, total_credit: 55000000, is_balanced: true, created_by_name: 'Gulnora Ismoilova', posted_at: d(4), created_at: d(4), updated_at: d(4), lines: [{ id:5, account: 42, account_code: '5200', account_name: 'Maosh xarajatlari', debit: 55000000, credit: 0, description: '' }, { id:6, account: 2, account_code: '1010', account_name: 'Naqd pul', debit: 0, credit: 55000000, description: '' }] },
      { id: 4, entry_number: 'JE-2026-004', date: d(1), description: 'Ijara to\'lovi, may oyi', source_type: 'MANUAL', source_type_display: 'Qo\'lda', status: 'DRAFT', status_display: 'Qoralama', total_amount: 18000000, total_debit: 18000000, total_credit: 18000000, is_balanced: true, created_by_name: 'Gulnora Ismoilova', posted_at: null, created_at: d(1), updated_at: d(1), lines: [{ id:7, account: 45, account_code: '5500', account_name: 'Ijara xarajatlari', debit: 18000000, credit: 0, description: '' }, { id:8, account: 3, account_code: '1020', account_name: 'Bank hisobi', debit: 0, credit: 18000000, description: '' }] },
    ]
  },
  'accounting/trial-balance/': {
    start_date: '2026-05-01', end_date: '2026-05-09',
    accounts: [
      { code: '1010', name: 'Naqd pul', account_type: 'ASSET', opening_debit: 5000000, opening_credit: 0, period_debit: 90000000, period_credit: 79000000, closing_debit: 12500000, closing_credit: 0 },
      { code: '1020', name: 'Bank hisobi', account_type: 'ASSET', opening_debit: 80000000, opening_credit: 0, period_debit: 52500000, period_credit: 26500000, closing_debit: 87500000, closing_credit: 0 },
      { code: '1300', name: 'Xom ashyo', account_type: 'ASSET', opening_debit: 78000000, opening_credit: 0, period_debit: 24000000, period_credit: 0, closing_debit: 102000000, closing_credit: 0 },
      { code: '4100', name: 'Sotuv daromadi', account_type: 'REVENUE', opening_debit: 0, opening_credit: 120000000, period_debit: 0, period_credit: 43400000, closing_debit: 0, closing_credit: 163400000 },
      { code: '5200', name: 'Maosh xarajatlari', account_type: 'EXPENSE', opening_debit: 110000000, opening_credit: 0, period_debit: 55000000, period_credit: 0, closing_debit: 117500000, closing_credit: 0 },
    ],
    total_debit: 319500000, total_credit: 319500000, is_balanced: true,
  },
  'accounting/balance-sheet/': {
    date: '2026-05-09',
    assets: [
      { code: '1010', name: 'Naqd pul', balance: 12500000 },
      { code: '1020', name: 'Bank hisobi', balance: 87500000 },
      { code: '1200', name: 'Debitorlik qarzlari', balance: 28700000 },
      { code: '1300', name: 'Xom ashyo zaxiralari', balance: 102000000 },
      { code: '1400', name: 'Tayyor mahsulot', balance: 132675000 },
    ],
    liabilities: [{ code: '2100', name: 'Kreditorlik qarzlari', balance: 14200000 }],
    equity: [{ code: '3100', name: 'Ustav kapitali', balance: 250000000 }],
    retained_earnings: 99175000,
    total_assets: 363375000, total_liabilities: 14200000, total_equity: 349175000, total_liabilities_and_equity: 363375000, is_balanced: true,
  },
  'accounting/income-statement/': {
    start_date: '2026-05-01', end_date: '2026-05-09',
    revenues: [{ code: '4100', name: 'Sotuv daromadi', amount: 163400000 }],
    expenses: [
      { code: '5100', name: 'Xom ashyo', amount: 24000000 },
      { code: '5200', name: 'Maosh', amount: 55000000 },
      { code: '5300', name: 'Kommunal', amount: 8500000 },
      { code: '5400', name: 'Transport', amount: 12000000 },
      { code: '5500', name: 'Ijara', amount: 18000000 },
    ],
    total_revenue: 163400000, total_expenses: 117500000, net_income: 45900000, profit_margin: 28.1,
  },
  'accounting/cash-flow/': {
    start_date: '2026-05-01', end_date: '2026-05-09',
    opening_cash: 85000000, total_inflow: 163400000, total_outflow: 117500000, net_cash_flow: 45900000, closing_cash: 105200000,
    inflows: [
      { date: d(10), description: 'Artel MCHJ to\'lovi', amount: 90000000, source: 'SALE', entry_number: 'JE-2026-001' },
      { date: d(5), description: 'Texnopark LLC to\'lovi', amount: 52500000, source: 'SALE', entry_number: 'JE-2026-003' },
    ],
    outflows: [
      { date: d(8), description: 'Xom ashyo xaridi', amount: 24000000, source: 'WAREHOUSE', entry_number: 'JE-2026-002' },
      { date: d(4), description: 'Maosh to\'lovi', amount: 55000000, source: 'MANUAL', entry_number: 'JE-2026-003' },
      { date: d(1), description: 'Ijara to\'lovi', amount: 18000000, source: 'MANUAL', entry_number: 'JE-2026-004' },
    ],
  },
  'accounting/tax-rates/': [
    { id: 1, name: 'QQS (20%)', code: 'VAT20', rate: 20, is_active: true, description: 'Qo\'shilgan qiymat solig\'i', created_at: d(200), updated_at: d(0) },
    { id: 2, name: 'Daromad solig\'i (15%)', code: 'IT15', rate: 15, is_active: true, description: 'Korporativ daromad solig\'i', created_at: d(200), updated_at: d(0) },
    { id: 3, name: 'Ijtimoiy sug\'urta (12%)', code: 'SI12', rate: 12, is_active: true, description: 'Ijtimoiy ta\'minot fondi', created_at: d(200), updated_at: d(0) },
  ],
  'accounting/fiscal-periods/': {
    results: [
      { id: 1, name: '2026 — I Chorak', start_date: '2026-01-01', end_date: '2026-03-31', is_closed: true, closed_by_name: 'Gulnora Ismoilova', closed_at: d(39), created_at: d(200) },
      { id: 2, name: '2026 — II Chorak', start_date: '2026-04-01', end_date: '2026-06-30', is_closed: false, closed_by_name: null, closed_at: null, created_at: d(39) },
    ]
  },

  // ─── BUDGETS ──────────────────────────────────────────────────────
  'budgets/cost-centers/': {
    results: [
      { id: 1, name: 'Ishlab chiqarish', code: 'PROD', manager: 3, manager_name: 'Karim Toshmatov', is_active: true },
      { id: 2, name: 'Sotuv', code: 'SALES', manager: 7, manager_name: 'Jamshid Karimov', is_active: true },
      { id: 3, name: 'Moliya', code: 'FIN', manager: 9, manager_name: 'Kamola Abdullayeva', is_active: true },
      { id: 4, name: 'Logistika', code: 'LOG', manager: 8, manager_name: 'Shahzod Ergashev', is_active: true },
    ]
  },
  'budgets/budgets/': {
    results: [
      { id: 1, name: 'Xom ashyo xaridi', fiscal_period: 2, cost_center: 1, cost_center_name: 'Ishlab chiqarish', account: 41, account_code: '5100', account_name: 'Xom ashyo', planned_amount: 120000000, actual_amount: 24000000, variance: 96000000, used_percentage: 20, status: 'ACTIVE', created_at: d(39) },
      { id: 2, name: 'Xodimlar maoshi', fiscal_period: 2, cost_center: 1, cost_center_name: 'Ishlab chiqarish', account: 42, account_code: '5200', account_name: 'Maosh', planned_amount: 220000000, actual_amount: 55000000, variance: 165000000, used_percentage: 25, status: 'ACTIVE', created_at: d(39) },
      { id: 3, name: 'Marketing xarajatlari', fiscal_period: 2, cost_center: 2, cost_center_name: 'Sotuv', account: 45, account_code: '5500', account_name: 'Boshqa', planned_amount: 15000000, actual_amount: 3500000, variance: 11500000, used_percentage: 23, status: 'ACTIVE', created_at: d(39) },
    ]
  },

  // ─── COMPLIANCE ───────────────────────────────────────────────────
  'compliance/rules/': {
    results: [
      { id: 1, name: 'QQS hisob-faktura majburiyligi', rule_type: 'TAX', rule_type_display: 'Soliq', severity: 'BLOCK', severity_display: 'Bloklovchi', is_active: true, description: '50 mln UZS dan yuqori savdolarda QQS hisob-fakturasi majburiy' },
      { id: 2, name: 'Kredit limiti nazorati', rule_type: 'CREDIT', rule_type_display: 'Kredit', severity: 'WARNING', severity_display: 'Ogohlantirish', is_active: true, description: 'Mijoz kredit limitidan oshganda ogohlantirish yuborish' },
      { id: 3, name: 'Mahsulot sifati nazorati', rule_type: 'QUALITY', rule_type_display: 'Sifat', severity: 'BLOCK', severity_display: 'Bloklovchi', is_active: true, description: 'QC tekshiruvidan o\'tmagan mahsulotni sotishga ruxsat yo\'q' },
    ]
  },
  'compliance/violations/': {
    results: [
      { id: 1, rule: 2, rule_name: 'Kredit limiti nazorati', severity: 'WARNING', description: 'Artel MCHJ kredit limitining 90%iga yetdi', context_data: { client: 'Artel MCHJ', current: 45000000, limit: 50000000 }, is_resolved: false, resolved_by: null, resolved_by_name: null, resolution_note: '', created_at: d(2) },
    ]
  },
  'compliance/documents/': {
    results: [
      { id: 1, title: 'Soliq to\'lash jadvali 2026', document_type: 'TAX_SCHEDULE', status: 'ACTIVE', expiry_date: '2026-12-31', created_at: d(120) },
      { id: 2, title: 'ISO 9001 Sifat sertifikati', document_type: 'CERTIFICATE', status: 'ACTIVE', expiry_date: '2027-06-30', created_at: d(200) },
    ]
  },
  'compliance/attendance/': [
    { id: 1, user_name: 'Karim Toshmatov', date: d(0), check_in: '08:02', check_out: '17:15', hours_worked: 9.2, status: 'PRESENT' },
    { id: 2, user_name: 'Sardor Yusupov', date: d(0), check_in: '08:10', check_out: '17:05', hours_worked: 8.9, status: 'PRESENT' },
    { id: 3, user_name: 'Nilufar Rahimova', date: d(0), check_in: '08:30', check_out: '17:30', hours_worked: 9.0, status: 'PRESENT' },
    { id: 4, user_name: 'Otabek Nazarov', date: d(0), check_in: null, check_out: null, hours_worked: 0, status: 'ABSENT' },
    { id: 5, user_name: 'Bobur Xolmatov', date: d(0), check_in: '07:55', check_out: '17:00', hours_worked: 9.1, status: 'PRESENT' },
  ],

  // ─── ALERTS ───────────────────────────────────────────────────────
  'alerts/alerts/unread/': [
    { id: 1, rule: 1, title: 'Kritik: Polistirol zaxirasi kam', message: 'Polistirol EPS PSB-S-20 zaxirasi 3 kunga yetadi. Zudlik bilan buyurtma bering!', severity: 'CRITICAL', severity_display: 'Kritik', is_resolved: false, resolved_by: null, created_at: d(0) },
    { id: 2, rule: 2, title: 'Ogohlantirish: Kredit limiti', message: 'Artel MCHJ kredit limitining 90%iga yetdi (45M / 50M UZS)', severity: 'WARNING', severity_display: 'Ogohlantirish', is_resolved: false, resolved_by: null, created_at: d(1) },
    { id: 3, rule: null, title: 'Ma\'lumot: Buyurtma tayyor', message: 'PO-2026-002 buyurtmasi muvaffaqiyatli yakunlandi va omborga topshirildi', severity: 'INFO', severity_display: 'Ma\'lumot', is_resolved: false, resolved_by: null, created_at: d(1) },
  ],

  // ─── REPORTS ─────────────────────────────────────────────────────
  'reports/analytics/': {
    kpis: { monthly_profit: 45900000, avg_margin: 28.1, stock_value: 363375000, total_waste_kg: 24, waste_per_block_kg: 0.18, total_sales: 357900000 },
    heuristics: {
      supply_alerts: [
        { id: 1, material: 'Polistirol EPS PSB-S-20', status: 'CRITICAL', message: 'Zaxira 3 kunga yetadi. Zudlik bilan buyurtma berish tavsiya etiladi.' },
        { id: 2, material: 'Yelim PVA', status: 'LOW', message: 'Minimal darajaga yaqinlashmoqda (420 kg qoldi).' },
      ],
      cash_prediction: { risk_level: 'NORMAL', message: 'Keyingi 15 kunlik pul oqimi barqaror. Kutilayotgan tushumlar barcha xarajatlarni qoplaydi.', projected_15d_inflow: 95000000, overdue: 28700000, action_label: 'Moliya tahlili' },
    },
    charts: {
      sales_trend: [
        { date: '05.05', value: 31500000 }, { date: '06.05', value: 45000000 }, { date: '07.05', value: 38000000 },
        { date: '08.05', value: 52000000 }, { date: '09.05', value: 61000000 }, { date: '10.05', value: 48000000 }, { date: '11.05', value: 72000000 },
      ],
      waste_distribution: [
        { name: 'CNC Sexi', value: 52 }, { name: 'Blok Quyish', value: 33 }, { name: 'Pardozlash', value: 15 },
      ],
    },
  },
  'reports/profitability/': [
    { invoice: 'INV-2026-001', product: 'Penoplast Blok 20kg/m³', quantity: 200, price: 450000, cost: 315000, profit: 135000, margin: 30.0, date: d(10), is_legacy: false, production_batch: 1 },
    { invoice: 'INV-2026-002', product: 'Penoplast Blok 25kg/m³', quantity: 100, price: 525000, cost: 385000, profit: 140000, margin: 26.7, date: d(5), is_legacy: false, production_batch: null },
    { invoice: 'INV-2026-003', product: 'Plita 50mm', quantity: 600, price: 70000, cost: 52000, profit: 18000, margin: 25.7, date: d(3), is_legacy: false, production_batch: null },
    { invoice: 'INV-2026-006', product: 'Plita 50mm', quantity: 120, price: 70000, cost: 53000, profit: 17000, margin: 24.3, date: d(15), is_legacy: false, production_batch: null },
    { invoice: 'INV-2026-007', product: 'Penoplast Blok 20kg/m³', quantity: 200, price: 450000, cost: 318000, profit: 132000, margin: 29.3, date: d(1), is_legacy: false, production_batch: null },
  ],
  'reports/history/': [
    { id: 1, name: 'Aprel oyi moliyaviy hisobot', report_type: 'FINANCE', period: 'this_month', file_format: 'PDF', status: 'COMPLETED', created_at: d(9), file_url: '#' },
    { id: 2, name: 'Ishlab chiqarish analitikasi — haftalik', report_type: 'PRODUCTION', period: 'this_week', file_format: 'EXCEL', status: 'COMPLETED', created_at: d(4), file_url: '#' },
    { id: 3, name: 'Sotuv hisoboti', report_type: 'SALES', period: 'last_month', file_format: 'CSV', status: 'COMPLETED', created_at: d(2), file_url: '#' },
  ],

  // ─── LOGISTICS / COURIER ─────────────────────────────────────────
  'transport/deliveries/': [
    { id: 1, invoice: 1, invoice_number: 'INV-2026-001', courier: 8, courier_name: 'Shahzod Ergashev', status: 'DELIVERED', status_display: 'Yetkazildi', customer_name: 'Artel MCHJ', address: 'Toshkent, Mirzo Ulugbek', started_at: d(10), delivered_at: d(9), notes: '' },
    { id: 2, invoice: 2, invoice_number: 'INV-2026-002', courier: 8, courier_name: 'Shahzod Ergashev', status: 'EN_ROUTE', status_display: 'Yetkazilmoqda', customer_name: 'Texnopark LLC', address: 'Toshkent, Yakkasaroy', started_at: d(0), delivered_at: null, notes: '' },
    { id: 3, invoice: 5, invoice_number: 'INV-2026-005', courier: null, courier_name: null, status: 'PENDING', status_display: 'Kutilmoqda', customer_name: 'Buxoro Trans', address: 'Buxoro shahar', started_at: null, delivered_at: null, notes: 'Uzoq masofa' },
  ],
  'transport/vehicles/': [
    { id: 1, plate: '01 A 234 BA', model: 'Mercedes Sprinter', fuel_type: 'Dizel', mileage: 87400, last_maintenance: d(30), status: 'ACTIVE', driver_name: 'Shahzod Ergashev' },
    { id: 2, plate: '01 B 567 CA', model: 'DAF LF', fuel_type: 'Dizel', mileage: 124500, last_maintenance: d(60), status: 'MAINTENANCE', driver_name: null },
  ],

  // ─── PURCHASE ORDERS ─────────────────────────────────────────────
  'purchase-orders/': [
    { id: 1, batch_number: 'PO-2026-001', material_name: 'Polistirol EPS PSB-S-20', supplier_name: 'Polimer Trade LLC', quantity: 3000, unit: 'kg', status: 'RECEIVED', created_at: d(5) },
    { id: 2, batch_number: 'PO-2026-002', material_name: 'Yelim PVA', supplier_name: 'Chemical Uz', quantity: 500, unit: 'kg', status: 'IN_TRANSIT', created_at: d(2) },
    { id: 3, batch_number: 'PO-2026-003', material_name: 'Polistirol EPS PSB-S-25', supplier_name: 'EPS Markazi LLC', quantity: 2000, unit: 'kg', status: 'CONFIRMED', created_at: d(0) },
  ],

  // ─── HRM ─────────────────────────────────────────────────────────
  'hrm/staff/': [
    { id: 1, full_name: 'Alisher Usmonov', username: 'admin', role_display: 'Bosh Admin', phone: '+998901112233', salary: 15000000, department_name: 'Boshqaruv', status: 'ACTIVE' },
    { id: 2, full_name: 'Bobur Xolmatov', username: 'omborchi_bobur', role_display: 'Omborchi', phone: '+998903334455', salary: 5500000, department_name: 'Ombor', status: 'ACTIVE' },
    { id: 3, full_name: 'Karim Toshmatov', username: 'usta_karim', role_display: 'Ishlab chiqarish ustasi', phone: '+998905556677', salary: 7000000, department_name: 'Ishlab chiqarish', status: 'ACTIVE' },
    { id: 4, full_name: 'Sardor Yusupov', username: 'cnc_sardor', role_display: 'CNC operatori', phone: '+998907778899', salary: 6000000, department_name: 'CNC', status: 'ACTIVE' },
    { id: 5, full_name: 'Nilufar Rahimova', username: 'pardoz_nilufar', role_display: 'Pardozlovchi', phone: '+998909990011', salary: 5000000, department_name: 'Pardozlash', status: 'ACTIVE' },
    { id: 6, full_name: 'Otabek Nazarov', username: 'chiqindi_otabek', role_display: 'Chiqindi operatori', phone: '+998901231122', salary: 4500000, department_name: 'Chiqindi', status: 'ACTIVE' },
    { id: 7, full_name: 'Jamshid Karimov', username: 'sales_jamshid', role_display: 'Sotuv menejeri', phone: '+998904445566', salary: 8000000, department_name: 'Sotuv', status: 'ACTIVE' },
    { id: 8, full_name: 'Shahzod Ergashev', username: 'kuryer_shahzod', role_display: 'Kuryer', phone: '+998906667788', salary: 4000000, department_name: 'Logistika', status: 'ACTIVE' },
    { id: 9, full_name: 'Kamola Abdullayeva', username: 'moliya_kamola', role_display: 'Moliya boshqaruvchi', phone: '+998902223344', salary: 9000000, department_name: 'Moliya', status: 'ACTIVE' },
    { id: 10, full_name: 'Gulnora Ismoilova', username: 'buxgalter_gulnora', role_display: 'Buxgalter', phone: '+998908889900', salary: 8500000, department_name: 'Buxgalteriya', status: 'ACTIVE' },
  ],
  'hrm/roles/': [
    { id: 1, name: 'Bosh Admin' }, { id: 2, name: 'Omborchi' }, { id: 3, name: 'Ishlab chiqarish ustasi' },
    { id: 4, name: 'CNC operatori' }, { id: 5, name: 'Pardozlovchi' }, { id: 6, name: 'Chiqindi operatori' },
    { id: 7, name: 'Sotuv menejeri' }, { id: 8, name: 'Kuryer' }, { id: 9, name: 'Moliya boshqaruvchi' }, { id: 10, name: 'Buxgalter' },
  ],

  // ─── DOCUMENTS ───────────────────────────────────────────────────
  'documents/': {
    results: [
      { id: 1, number: 'DOC-2026-001', type: 'HISOB_FAKTURA_CHIQIM', type_label: 'Hisob-faktura (Chiqim)', date: d(10), from_entity_name: 'Yuksar ERP', to_entity_name: 'Artel MCHJ', status: 'DONE', status_label: 'Yakunlandi', total_amount: 90000000, created_by_name: 'Jamshid Karimov', items: [] },
      { id: 2, number: 'DOC-2026-002', type: 'HISOB_FAKTURA_CHIQIM', type_label: 'Hisob-faktura (Chiqim)', date: d(5), from_entity_name: 'Yuksar ERP', to_entity_name: 'Texnopark LLC', status: 'DONE', status_label: 'Yakunlandi', total_amount: 52500000, created_by_name: 'Jamshid Karimov', items: [] },
      { id: 3, number: 'DOC-2026-003', type: 'ICHKI_YUK_XATI', type_label: 'Ichki yuk xati', date: d(3), from_entity_name: 'Sklad №2', to_entity_name: 'Sklad №3', status: 'DONE', status_label: 'Yakunlandi', total_amount: 0, created_by_name: 'Bobur Xolmatov', items: [] },
      { id: 4, number: 'DOC-2026-004', type: 'HISOB_FAKTURA_KIRIM', type_label: 'Hisob-faktura (Kirim)', date: d(5), from_entity_name: 'Polimer Trade LLC', to_entity_name: 'Yuksar ERP', status: 'CONFIRMED', status_label: 'Tasdiqlandi', total_amount: 24000000, created_by_name: 'Bobur Xolmatov', items: [] },
    ]
  },

  // ─── FLEET ───────────────────────────────────────────────────────
  'fleet/vehicles/': [
    { id: 1, plate: '01 A 123 AA', model: 'MAN TGS 26.400', capacity_kg: 10000, fuel_type: 'DIESEL', status: 'ACTIVE', last_service: d(10), mileage: 145000 },
    { id: 2, plate: '01 B 456 BB', model: 'Isuzu NPR 75', capacity_kg: 3500, fuel_type: 'DIESEL', status: 'ACTIVE', last_service: d(5), mileage: 87000 },
    { id: 3, plate: '01 C 789 CC', model: 'Mercedes Sprinter', capacity_kg: 1500, fuel_type: 'PETROL', status: 'REPAIR', last_service: d(20), mileage: 210000 },
    { id: 4, plate: '01 D 012 DD', model: 'Hyundai HD78', capacity_kg: 5000, fuel_type: 'DIESEL', status: 'IDLE', last_service: d(15), mileage: 62000 },
  ],
  'fleet/drivers/': [
    { id: 1, name: 'Sherzod Tursunov', phone: '+998901234567', license: 'AA1234567', vehicle_id: 1, vehicle_plate: '01 A 123 AA', on_time_pct: 96, fuel_save_pct: 8, trips_count: 124, status: 'ACTIVE' },
    { id: 2, name: 'Mansur Qodirov', phone: '+998907654321', license: 'BB7654321', vehicle_id: 2, vehicle_plate: '01 B 456 BB', on_time_pct: 88, fuel_save_pct: 3, trips_count: 87, status: 'ACTIVE' },
    { id: 3, name: 'Ulugbek Mirzayev', phone: '+998909876543', license: 'CC9876543', vehicle_id: null, vehicle_plate: null, on_time_pct: 92, fuel_save_pct: 5, trips_count: 56, status: 'ACTIVE' },
  ],
  'fleet/trips/': [
    { id: 1, trip_number: 'TR-2026-001', vehicle_id: 1, vehicle_plate: '01 A 123 AA', driver_id: 1, driver_name: 'Sherzod Tursunov', from_loc: 'Sergeli, Toshkent', to_loc: 'Samarqand sh.', cargo_kg: 8500, status: 'DELIVERED', km_plan: 320, km_actual: 318, fuel_liters: 96, created_at: d(3), delivered_at: d(2) },
    { id: 2, trip_number: 'TR-2026-002', vehicle_id: 2, vehicle_plate: '01 B 456 BB', driver_id: 2, driver_name: 'Mansur Qodirov', from_loc: 'Sergeli, Toshkent', to_loc: 'Namangan sh.', cargo_kg: 3200, status: 'ON_ROAD', km_plan: 310, km_actual: 0, fuel_liters: 0, created_at: d(1), delivered_at: null },
    { id: 3, trip_number: 'TR-2026-003', vehicle_id: 1, vehicle_plate: '01 A 123 AA', driver_id: 1, driver_name: 'Sherzod Tursunov', from_loc: 'Sergeli, Toshkent', to_loc: 'Buxoro sh.', cargo_kg: 9000, status: 'PLANNED', km_plan: 560, km_actual: 0, fuel_liters: 0, created_at: d(0), delivered_at: null },
    { id: 4, trip_number: 'TR-2026-004', vehicle_id: 4, vehicle_plate: '01 D 012 DD', driver_id: 3, driver_name: 'Ulugbek Mirzayev', from_loc: 'Sergeli, Toshkent', to_loc: 'Andijon sh.', cargo_kg: 4800, status: 'CLOSED', km_plan: 420, km_actual: 425, fuel_liters: 115, created_at: d(5), delivered_at: d(4) },
  ],

  // ─── CRM LEADS ───────────────────────────────────────────────────
  'leads/': [
    { id: 1, name: 'Bobur Toshmatov', phone: '+998901111111', source: 'WEBSITE', status: 'NEW', manager_name: 'Jamshid Karimov', note: 'Penoplast blok qiziqtiradi', created_at: d(0), amount_expected: 5000000 },
    { id: 2, name: 'Gulnora Yusupova', phone: '+998902222222', source: 'CALL', status: 'CALLED', manager_name: 'Jamshid Karimov', note: 'Ulgurji taklif so\'radi', created_at: d(1), amount_expected: 15000000 },
    { id: 3, name: 'Abdullayev Qurilish MChJ', phone: '+998903333333', source: 'REFERRAL', status: 'OFFER_SENT', manager_name: 'Jamshid Karimov', note: 'Shartnoma ko\'rib chiqilmoqda', created_at: d(2), amount_expected: 45000000 },
    { id: 4, name: 'Sarvar Xoliqov', phone: '+998904444444', source: 'WEBSITE', status: 'WON', manager_name: 'Jamshid Karimov', note: 'Buyurtma berildi', created_at: d(4), amount_expected: 8000000 },
    { id: 5, name: 'Beta Qurilish', phone: '+998905555555', source: 'CALL', status: 'LOST', manager_name: 'Jamshid Karimov', note: 'Narx moslanmadi', created_at: d(5), amount_expected: 3000000 },
    { id: 6, name: 'Mirzo Xasanov', phone: '+998906666666', source: 'REFERRAL', status: 'NEW', manager_name: 'Jamshid Karimov', note: 'Namuna so\'radi', created_at: d(0), amount_expected: 12000000 },
  ],

  // ─── DEALERS ─────────────────────────────────────────────────────
  'dealers/': [
    { id: 1, name: 'Samarqand Qurilish Savdosi', region: 'Samarqand', category: 'A', credit_limit: 50000000, debt: 12500000, last_order: d(3), status: 'ACTIVE', phone: '+998662221133', stir: '123456789', address: 'Samarqand, Mirzo Ulugbek ko\'ch. 12', monthly_target: 30000000, monthly_actual: 28500000 },
    { id: 2, name: 'Namangan Materials', region: 'Namangan', category: 'B', credit_limit: 30000000, debt: 8000000, last_order: d(7), status: 'ACTIVE', phone: '+998694445566', stir: '987654321', address: 'Namangan, Mustaqillik ko\'ch. 5', monthly_target: 15000000, monthly_actual: 11000000 },
    { id: 3, name: 'Buxoro Inshoat', region: 'Buxoro', category: 'A', credit_limit: 45000000, debt: 0, last_order: d(1), status: 'ACTIVE', phone: '+998652223344', stir: '456789123', address: 'Buxoro, Navoiy ko\'ch. 8', monthly_target: 25000000, monthly_actual: 27000000 },
    { id: 4, name: 'Farg\'ona Trade', region: 'Farg\'ona', category: 'C', credit_limit: 15000000, debt: 4500000, last_order: d(14), status: 'INACTIVE', phone: '+998736667788', stir: '789123456', address: 'Farg\'ona, Buyuk ipak yo\'li 3', monthly_target: 10000000, monthly_actual: 2000000 },
  ],

  // ─── PRICING ─────────────────────────────────────────────────────
  'pricing/rules/': [
    { id: 1, product_id: 1, product_name: 'Penoplast Blok 20kg/m³', tier: 'RETAIL', segment: 'Oddiy mijozlar', price: 45000, discount_pct: 0, valid_until: null },
    { id: 2, product_id: 1, product_name: 'Penoplast Blok 20kg/m³', tier: 'WHOLESALE', segment: 'Ulgurji xaridorlar', price: 42000, discount_pct: 6.7, valid_until: null },
    { id: 3, product_id: 1, product_name: 'Penoplast Blok 20kg/m³', tier: 'DEALER', segment: 'Rasmiy dilerlar', price: 38000, discount_pct: 15.6, valid_until: null },
    { id: 4, product_id: 1, product_name: 'Penoplast Blok 20kg/m³', tier: 'VIP', segment: 'Premium mijozlar', price: 35000, discount_pct: 22.2, valid_until: null },
    { id: 5, product_id: 1, product_name: 'Penoplast Blok 20kg/m³', tier: 'PROMO', segment: 'Aksiya davri', price: 40000, discount_pct: 11.1, valid_until: '2026-06-30' },
    { id: 6, product_id: 2, product_name: 'Penoplast Blok 25kg/m³', tier: 'RETAIL', segment: 'Oddiy mijozlar', price: 55000, discount_pct: 0, valid_until: null },
    { id: 7, product_id: 2, product_name: 'Penoplast Blok 25kg/m³', tier: 'WHOLESALE', segment: 'Ulgurji xaridorlar', price: 51000, discount_pct: 7.3, valid_until: null },
    { id: 8, product_id: 2, product_name: 'Penoplast Blok 25kg/m³', tier: 'DEALER', segment: 'Rasmiy dilerlar', price: 46000, discount_pct: 16.4, valid_until: null },
    { id: 9, product_id: 3, product_name: 'Plita 50mm', tier: 'RETAIL', segment: 'Oddiy mijozlar', price: 28000, discount_pct: 0, valid_until: null },
    { id: 10, product_id: 3, product_name: 'Plita 50mm', tier: 'DEALER', segment: 'Rasmiy dilerlar', price: 23000, discount_pct: 17.9, valid_until: null },
  ],

  // ─── PAYROLL ─────────────────────────────────────────────────────
  'payroll/': [
    // May 2026
    { id: 1, user_id: 1, name: 'Alisher Usmonov', position: 'Bosh Admin', base_salary: 15000000, bonus: 2000000, deduction: 0, total: 17000000, status: 'PAID', month: '2026-05' },
    { id: 2, user_id: 2, name: 'Bobur Xolmatov', position: 'Omborchi', base_salary: 5500000, bonus: 500000, deduction: 0, total: 6000000, status: 'PAID', month: '2026-05' },
    { id: 3, user_id: 3, name: 'Karim Toshmatov', position: 'Ishlab chiqarish ustasi', base_salary: 7000000, bonus: 1500000, deduction: 0, total: 8500000, status: 'PENDING', month: '2026-05' },
    { id: 4, user_id: 4, name: 'Sardor Yusupov', position: 'CNC operatori', base_salary: 6000000, bonus: 800000, deduction: 0, total: 6800000, status: 'PENDING', month: '2026-05' },
    { id: 5, user_id: 5, name: 'Nilufar Rahimova', position: 'Pardozlovchi', base_salary: 5000000, bonus: 300000, deduction: 200000, total: 5100000, status: 'PENDING', month: '2026-05' },
    { id: 6, user_id: 6, name: 'Otabek Nazarov', position: 'Chiqindi operatori', base_salary: 4500000, bonus: 0, deduction: 0, total: 4500000, status: 'PENDING', month: '2026-05' },
    { id: 7, user_id: 7, name: 'Jamshid Karimov', position: 'Sotuv menejeri', base_salary: 8000000, bonus: 3500000, deduction: 0, total: 11500000, status: 'PENDING', month: '2026-05' },
    { id: 8, user_id: 8, name: 'Shahzod Ergashev', position: 'Kuryer', base_salary: 4000000, bonus: 200000, deduction: 0, total: 4200000, status: 'PAID', month: '2026-05' },
    { id: 9, user_id: 9, name: 'Kamola Abdullayeva', position: 'Moliya boshqaruvchi', base_salary: 9000000, bonus: 1000000, deduction: 0, total: 10000000, status: 'PENDING', month: '2026-05' },
    { id: 10, user_id: 10, name: 'Gulnora Ismoilova', position: 'Buxgalter', base_salary: 8500000, bonus: 500000, deduction: 0, total: 9000000, status: 'PENDING', month: '2026-05' },
    // April 2026 - all PAID
    { id: 11, user_id: 1, name: 'Alisher Usmonov', position: 'Bosh Admin', base_salary: 15000000, bonus: 1500000, deduction: 0, total: 16500000, status: 'PAID', month: '2026-04' },
    { id: 12, user_id: 2, name: 'Bobur Xolmatov', position: 'Omborchi', base_salary: 5500000, bonus: 300000, deduction: 0, total: 5800000, status: 'PAID', month: '2026-04' },
    { id: 13, user_id: 3, name: 'Karim Toshmatov', position: 'Ishlab chiqarish ustasi', base_salary: 7000000, bonus: 1200000, deduction: 0, total: 8200000, status: 'PAID', month: '2026-04' },
    { id: 14, user_id: 4, name: 'Sardor Yusupov', position: 'CNC operatori', base_salary: 6000000, bonus: 600000, deduction: 0, total: 6600000, status: 'PAID', month: '2026-04' },
    { id: 15, user_id: 5, name: 'Nilufar Rahimova', position: 'Pardozlovchi', base_salary: 5000000, bonus: 200000, deduction: 0, total: 5200000, status: 'PAID', month: '2026-04' },
    { id: 16, user_id: 6, name: 'Otabek Nazarov', position: 'Chiqindi operatori', base_salary: 4500000, bonus: 0, deduction: 100000, total: 4400000, status: 'PAID', month: '2026-04' },
    { id: 17, user_id: 7, name: 'Jamshid Karimov', position: 'Sotuv menejeri', base_salary: 8000000, bonus: 2800000, deduction: 0, total: 10800000, status: 'PAID', month: '2026-04' },
    { id: 18, user_id: 8, name: 'Shahzod Ergashev', position: 'Kuryer', base_salary: 4000000, bonus: 150000, deduction: 0, total: 4150000, status: 'PAID', month: '2026-04' },
    { id: 19, user_id: 9, name: 'Kamola Abdullayeva', position: 'Moliya boshqaruvchi', base_salary: 9000000, bonus: 800000, deduction: 0, total: 9800000, status: 'PAID', month: '2026-04' },
    { id: 20, user_id: 10, name: 'Gulnora Ismoilova', position: 'Buxgalter', base_salary: 8500000, bonus: 400000, deduction: 0, total: 8900000, status: 'PAID', month: '2026-04' },
    // March 2026 - all PAID
    { id: 21, user_id: 1, name: 'Alisher Usmonov', position: 'Bosh Admin', base_salary: 15000000, bonus: 1000000, deduction: 0, total: 16000000, status: 'PAID', month: '2026-03' },
    { id: 22, user_id: 2, name: 'Bobur Xolmatov', position: 'Omborchi', base_salary: 5500000, bonus: 200000, deduction: 0, total: 5700000, status: 'PAID', month: '2026-03' },
    { id: 23, user_id: 3, name: 'Karim Toshmatov', position: 'Ishlab chiqarish ustasi', base_salary: 7000000, bonus: 1000000, deduction: 0, total: 8000000, status: 'PAID', month: '2026-03' },
    { id: 24, user_id: 4, name: 'Sardor Yusupov', position: 'CNC operatori', base_salary: 6000000, bonus: 500000, deduction: 0, total: 6500000, status: 'PAID', month: '2026-03' },
    { id: 25, user_id: 5, name: 'Nilufar Rahimova', position: 'Pardozlovchi', base_salary: 5000000, bonus: 100000, deduction: 200000, total: 4900000, status: 'PAID', month: '2026-03' },
    { id: 26, user_id: 6, name: 'Otabek Nazarov', position: 'Chiqindi operatori', base_salary: 4500000, bonus: 0, deduction: 0, total: 4500000, status: 'PAID', month: '2026-03' },
    { id: 27, user_id: 7, name: 'Jamshid Karimov', position: 'Sotuv menejeri', base_salary: 8000000, bonus: 2500000, deduction: 0, total: 10500000, status: 'PAID', month: '2026-03' },
    { id: 28, user_id: 8, name: 'Shahzod Ergashev', position: 'Kuryer', base_salary: 4000000, bonus: 100000, deduction: 0, total: 4100000, status: 'PAID', month: '2026-03' },
    { id: 29, user_id: 9, name: 'Kamola Abdullayeva', position: 'Moliya boshqaruvchi', base_salary: 9000000, bonus: 700000, deduction: 0, total: 9700000, status: 'PAID', month: '2026-03' },
    { id: 30, user_id: 10, name: 'Gulnora Ismoilova', position: 'Buxgalter', base_salary: 8500000, bonus: 300000, deduction: 0, total: 8800000, status: 'PAID', month: '2026-03' },
  ],

  // ─── KPI DATA ────────────────────────────────────────────────────
  'users/1/kpi/': { efficiency: 94, brak_pct: 1.2, tasks_done: 48, smena_punctuality: 98, on_time_pct: 96 },
  'users/2/kpi/': { inventory_accuracy: 99.2, transfers: 34, errors: 1, on_time_pct: 95 },
  'users/3/kpi/': { production_per_smena: 62, brak_pct: 0.8, smena_punctuality: 97, tasks_done: 156 },
  'users/4/kpi/': { cnc_jobs_done: 28, hours_worked: 176, waste_pct: 2.1, efficiency: 91 },
  'users/5/kpi/': { finishing_jobs: 22, quality_score: 96, hours_worked: 168, on_time_pct: 94 },
  'users/6/kpi/': { waste_processed_kg: 245, recycling_rate: 87.5, tasks_done: 18, on_time_pct: 92 },
  'users/7/kpi/': { sales_count: 11, revenue: 125000000, lead_conversion: 68, avg_deal: 11363636 },
  'users/8/kpi/': { deliveries: 24, on_time_pct: 92, km_driven: 3420 },
  'users/9/kpi/': { transactions: 89, reports_done: 12, accuracy: 99.8, on_time_pct: 97 },
  'users/10/kpi/': { journal_entries: 156, reports: 8, accuracy: 99.9, on_time_pct: 99 },

  // ─── DEALER PAYMENTS ─────────────────────────────────────────────
  'dealers/1/payments/': [
    { id: 1, amount: 5000000, date: d(15), method: 'BANK', note: "Oylik to'lov" },
    { id: 2, amount: 8000000, date: d(30), method: 'CASH', note: '' },
    { id: 3, amount: 6000000, date: d(45), method: 'BANK', note: "Shartnoma to'lovi" },
  ],
  'dealers/2/payments/': [
    { id: 4, amount: 3000000, date: d(10), method: 'BANK', note: "Oylik to'lov" },
    { id: 5, amount: 5000000, date: d(25), method: 'CASH', note: '' },
  ],
  'dealers/3/payments/': [
    { id: 6, amount: 10000000, date: d(5), method: 'BANK', note: "Katta buyurtma to'lovi" },
    { id: 7, amount: 7000000, date: d(20), method: 'BANK', note: '' },
    { id: 8, amount: 8000000, date: d(35), method: 'CARD', note: "Karta orqali" },
  ],
  'dealers/4/payments/': [
    { id: 9, amount: 2000000, date: d(20), method: 'CASH', note: '' },
  ],
};
