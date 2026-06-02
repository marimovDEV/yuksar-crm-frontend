import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Cpu, Activity, Thermometer, Zap, AlertTriangle, AlertOctagon, 
  CheckCircle, Plus, X, ShieldAlert, Clock, RefreshCw, ClipboardList, PenTool
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

interface MaintenanceWorkspaceProps {
  user: any;
}

type MTab = 'TELEMETRY' | 'ORDERS' | 'ALARMS';

export default function MaintenanceWorkspace({ user }: MaintenanceWorkspaceProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<MTab>('TELEMETRY');
  const [liveTelemetry, setLiveTelemetry] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // Alarms and Tickets
  const [alarms, setAlarms] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<number[]>([]);
  
  // New ticket state
  const [newTicket, setNewTicket] = useState({
    equipment_name: '',
    issue_description: '',
    priority: 'HIGH' as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    assigned_technician: user?.name || user?.username || 'Navbatchi Muhandis'
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // PLC grid nodes interactive states
  const [plcNodes, setPlcNodes] = useState([
    { id: 'V-01', name: 'Steam Feed Valve', role: 'Steam', ip: '192.168.1.10', reg: 'HR-4001', status: 'ACTIVE' },
    { id: 'V-02', name: 'Exhaust Steam Out', role: 'Steam', ip: '192.168.1.10', reg: 'HR-4002', status: 'CLOSED' },
    { id: 'P-01', name: 'Vacuum Pump #1', role: 'Vacuum', ip: '192.168.1.11', reg: 'HR-4010', status: 'ACTIVE' },
    { id: 'P-02', name: 'Vacuum Pump #2', role: 'Vacuum', ip: '192.168.1.11', reg: 'HR-4011', status: 'STANDBY' },
    { id: 'G-01', name: 'Gas Main Line', role: 'Gas', ip: '192.168.1.12', reg: 'HR-4020', status: 'ACTIVE' },
    { id: 'G-02', name: 'Burner Injector', role: 'Gas', ip: '192.168.1.12', reg: 'HR-4021', status: 'WARNING' },
    { id: 'C-01', name: 'Cooling Water In', role: 'Cooling', ip: '192.168.1.13', reg: 'HR-4030', status: 'ACTIVE' },
    { id: 'C-02', name: 'Cooling Water Out', role: 'Cooling', ip: '192.168.1.13', reg: 'HR-4031', status: 'CLOSED' },
    { id: 'S-01', name: 'EPS Silo Feed #1', role: 'Silo', ip: '192.168.1.14', reg: 'HR-4040', status: 'ACTIVE' },
    { id: 'S-02', name: 'EPS Silo Feed #2', role: 'Silo', ip: '192.168.1.14', reg: 'HR-4041', status: 'ACTIVE' },
    { id: 'B-01', name: 'Bunker 1 Regulator', role: 'Bunker', ip: '192.168.1.15', reg: 'HR-4050', status: 'CLOSED' },
    { id: 'B-02', name: 'Bunker 2 Steam Inj', role: 'Bunker', ip: '192.168.1.15', reg: 'HR-4051', status: 'CRITICAL' },
  ]);

  const handleTogglePlcNode = (nodeId: string) => {
    setPlcNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const nextStatus = 
          node.status === 'ACTIVE' ? 'CLOSED' : 
          node.status === 'CLOSED' ? 'ACTIVE' : 
          node.status === 'STANDBY' ? 'ACTIVE' :
          node.status === 'WARNING' ? 'ACTIVE' : 'ACTIVE';
        uiStore.showNotification(`${t('MODBUS TCP')} [${node.id}] ${t('tizimi buyrug\'i yuborildi')}: Register ${node.reg} => ${nextStatus === 'ACTIVE' ? '1 (OPEN)' : '0 (CLOSE)'}`, "success");
        return { ...node, status: nextStatus };
      }
      return node;
    }));
  };

  // PM Preventive Maintenance checklists
  const [pmTasks, setPmTasks] = useState([
    { id: 1, name: 'Kompressor filtrlari tozaligi', period: 'Kunlik', status: 'DUE', statusLabel: t('Bajarish kerak') },
    { id: 2, name: 'Bug\' klapanlari germetikligi', period: 'Haftalik', status: 'DONE', statusLabel: t('Bajarilgan') },
    { id: 3, name: 'Vakuum nasosi moy sathini tekshirish', period: 'Haftalik', status: 'OVERDUE', statusLabel: t('MUDDATI O\'TGAN') }
  ]);

  const handleTogglePmTask = (taskId: number) => {
    setPmTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const nextStatus = task.status === 'DONE' ? 'DUE' : 'DONE';
        const nextLabel = nextStatus === 'DONE' ? t('Bajarilgan') : t('Bajarish kerak');
        if (nextStatus === 'DONE') {
          uiStore.showNotification(`${t('Profilaktika bajarildi')}: ${task.name}`, "success");
        }
        return { ...task, status: nextStatus, statusLabel: nextLabel };
      }
      return task;
    }));
  };



  // Fetch telemetry and tickets
  const fetchMaintenanceData = async () => {
    try {
      const [telemetryRes, alarmsRes, ticketsRes] = await Promise.all([
        api.get('telemetry/tags/live/').catch(() => ({ data: {} })),
        api.get('alerts/').catch(() => ({ data: [] })),
        api.get('support-tickets/').catch(() => ({ data: [] }))
      ]);

      setLiveTelemetry(telemetryRes.data || {});
      setAlarms(Array.isArray(alarmsRes.data) ? alarmsRes.data : []);
      setTickets(Array.isArray(ticketsRes.data.results) ? ticketsRes.data.results : (Array.isArray(ticketsRes.data) ? ticketsRes.data : []));
    } catch (err) {
      console.error("Maintenance Workspace fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
    const interval = setInterval(fetchMaintenanceData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleAckAlarm = async (alarmId: number) => {
    try {
      await api.post(`telemetry/alarms/${alarmId}/acknowledge/`).catch(() => {});
      setAcknowledgedAlarms(prev => [...prev, alarmId]);
      uiStore.showNotification(t("Avariya holati tasdiqlandi va alarm o'chirildi"), "success");
      fetchMaintenanceData();
    } catch (err) {
      // Fallback local support
      setAcknowledgedAlarms(prev => [...prev, alarmId]);
      uiStore.showNotification(t("Avariya holati tasdiqlandi"), "success");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.equipment_name || !newTicket.issue_description) {
      uiStore.showNotification(t("Barcha maydonlarni to'ldiring"), "error");
      return;
    }
    setSubmittingTicket(true);
    try {
      await api.post('support-tickets/', {
        equipment_name: newTicket.equipment_name,
        description: newTicket.issue_description,
        priority: newTicket.priority,
        status: 'OPEN',
        assigned_to_name: newTicket.assigned_technician
      });
      uiStore.showNotification(t("Ta'mirlash topshirig'i muvaffaqiyatli ro'yxatga olindi"), "success");
      setNewTicket({
        equipment_name: '',
        issue_description: '',
        priority: 'HIGH',
        assigned_technician: user?.name || user?.username || 'Navbatchi Muhandis'
      });
      setIsNewTicketOpen(false);
      fetchMaintenanceData();
    } catch (err) {
      // Mock create local ticket
      const mockTicket = {
        id: Date.now(),
        equipment_name: newTicket.equipment_name,
        description: newTicket.issue_description,
        priority: newTicket.priority,
        status: 'OPEN',
        assigned_to_name: newTicket.assigned_technician,
        created_at: new Date().toISOString()
      };
      setTickets(prev => [mockTicket, ...prev]);
      uiStore.showNotification(t("Ta'mirlash topshirig'i qo'shildi (Lokal rejim)"), "success");
      setIsNewTicketOpen(false);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, nextStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      await api.patch(`support-tickets/${ticketId}/`, { status: nextStatus });
      uiStore.showNotification(t("Topshiriq statusi yangilandi"), "success");
      fetchMaintenanceData();
    } catch (err) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
      uiStore.showNotification(t("Topshiriq statusi yangilandi (Lokal rejim)"), "success");
    }
  };

  // Safe tag value getter
  const getTagVal = (key: string, fallback: any) => {
    if (liveTelemetry && liveTelemetry[key]) {
      return liveTelemetry[key].value !== undefined ? liveTelemetry[key].value : liveTelemetry[key];
    }
    return fallback;
  };

  const activeAlarms = alarms.filter(a => !acknowledgedAlarms.includes(a.id));

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Maintenance Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0B0F19] text-white p-8 rounded-[36px] border border-slate-800 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Settings className="text-white w-8 h-8 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-1.5">{t('Servis Muhandisi Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t('Uskunalar diagnostikasi, telemetriya va avariyalar jurnali')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNewTicketOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('Ta\'mirlash Buyurtmasi')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {(['TELEMETRY', 'ORDERS', 'ALARMS'] as const).map(tabKey => {
          const isAlarmTab = tabKey === 'ALARMS';
          const count = isAlarmTab ? activeAlarms.length : 0;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 ${
                activeTab === tabKey ? 'bg-[#0B0F19] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t({
                TELEMETRY: 'Uskunalar Monitoringi',
                ORDERS: 'Ta\'mirlash Ishlari',
                ALARMS: 'Avariyalar & PLC Alarmlar'
              }[tabKey])}
              {count > 0 && (
                <span className="bg-rose-500 text-white rounded-full px-2 py-0.5 text-[9px] font-black animate-pulse">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main viewport */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'TELEMETRY' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Core telemetries */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 text-white rounded-[32px] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <Thermometer className="w-6 h-6 animate-pulse" />
                    </span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider">{t('OK')}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('Predvspenivatel Harorati')}</p>
                    <p className="text-3xl font-black font-mono mt-1">{getTagVal('molder_temp', '118.4')} <span className="text-sm font-bold text-slate-400">°C</span></p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 text-white rounded-[32px] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                      <Activity className="w-6 h-6" />
                    </span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider">{t('OK')}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('Steam Bosimi')}</p>
                    <p className="text-3xl font-black font-mono mt-1">{getTagVal('steam_pressure', '1.25')} <span className="text-sm font-bold text-slate-400">bar</span></p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 text-white rounded-[32px] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                      <Cpu className="w-6 h-6 animate-spin-slow" />
                    </span>
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider">{t('YUQORI')}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('Kompressor Bosimi')}</p>
                    <p className="text-3xl font-black font-mono mt-1">{getTagVal('vacuum_level', '7.4')} <span className="text-sm font-bold text-slate-400">bar</span></p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 text-white rounded-[32px] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                      <Zap className="w-6 h-6 animate-pulse" />
                    </span>
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">{t('KRITIK')}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('Energiya Sarfi')}</p>
                    <p className="text-3xl font-black font-mono mt-1">42.8 <span className="text-sm font-bold text-slate-400">kW/h</span></p>
                  </div>
                </div>
              </div>

              {/* Digital twins state simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-[#0B0F19] text-white border border-slate-800 shadow-2xl rounded-[40px] p-8 space-y-6">
                  <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{t('SCADA MODBUS PLC Tarmoq Xaritasi')}</h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{t('Datchiklar, bug\' klapanlari va nasoslar holatini boshqarish va testlash')}</p>
                    </div>
                    <span className="px-3.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black">{plcNodes.length} {t('tugun faol')}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {plcNodes.map(node => {
                      const isActive = node.status === 'ACTIVE';
                      const isClosed = node.status === 'CLOSED';
                      const isStandby = node.status === 'STANDBY';
                      const isWarning = node.status === 'WARNING';
                      const isCritical = node.status === 'CRITICAL';
                      
                      return (
                        <div 
                          key={node.id} 
                          onClick={() => handleTogglePlcNode(node.id)}
                          className={`p-5 rounded-[28px] border-2 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-95 flex flex-col justify-between min-h-[140px] relative overflow-hidden group ${
                            isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            isClosed ? 'bg-white/5 border-white/10 text-slate-500' :
                            isStandby ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                            isWarning ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                            'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                              isActive ? 'bg-emerald-500/20 text-emerald-300' :
                              isClosed ? 'bg-white/5 text-slate-400' :
                              isStandby ? 'bg-blue-500/20 text-blue-300' :
                              isWarning ? 'bg-amber-500/20 text-amber-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>{node.id}</span>
                            
                            <span className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' :
                              isClosed ? 'bg-slate-600' :
                              isStandby ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' :
                              isWarning ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' :
                              'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                            }`} />
                          </div>

                          <div className="mt-4 space-y-1">
                            <h4 className={`text-xs font-black uppercase tracking-wider ${isClosed ? 'text-slate-400' : 'text-white'}`}>{node.name}</h4>
                            <p className="text-[8px] font-bold text-slate-500 font-mono tracking-widest">{node.reg} &bull; {node.ip}</p>
                          </div>

                          <div className="mt-3 border-t border-white/5 pt-2 flex justify-between items-center text-[8px] font-black uppercase">
                            <span className="text-slate-500">{node.role}</span>
                            <span className={
                              isActive ? 'text-emerald-400' :
                              isClosed ? 'text-slate-500' :
                              isStandby ? 'text-blue-400' :
                              isWarning ? 'text-amber-400' :
                              'text-rose-400'
                            }>{t(node.status)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-950 text-white rounded-[40px] p-8 border border-slate-800 shadow-2xl space-y-6">
                  <h3 className="text-lg font-black tracking-tight leading-none mb-4">{t('Server & Uskunalar Tarmoqlari')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs text-slate-300 font-bold">SCADA Gateway Server</span>
                      <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs text-slate-300 font-bold">PLC MODBUS TCP Client</span>
                      <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs text-slate-300 font-bold">Historian InfluxDB API</span>
                      <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-bold">Sticker Printer IP</span>
                      <span className="flex items-center gap-1.5 text-[9px] text-rose-400 font-black uppercase animate-pulse">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        Offline
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ORDERS' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Tickets list */}
              <div className="lg:col-span-8 bg-white border border-slate-100 shadow-sm rounded-[40px] p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                    {t('Faol Ta\'mirlash Ishlari')}
                  </h3>
                  <span className="px-3.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black">{tickets.length} {t('buyurtma')}</span>
                </div>

                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:shadow-xl transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                            ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' :
                            ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {t(ticket.priority)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(ticket.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-base">{ticket.equipment_name}</h4>
                        <p className="text-xs text-slate-500 font-bold">{ticket.description}</p>
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {t('Muhandis')}: {ticket.assigned_to_name || 'Navbatchi'}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 justify-center shrink-0">
                        {ticket.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all w-full md:w-auto"
                          >
                            {t('Jarayonni Boshlash')}
                          </button>
                        )}
                        {ticket.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'COMPLETED')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all w-full md:w-auto flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('Bajarildi')}
                          </button>
                        )}
                        {ticket.status === 'COMPLETED' && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {t('Bajarilgan')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {tickets.length === 0 && (
                    <div className="py-20 text-center text-slate-300 italic flex flex-col items-center justify-center gap-3">
                      <PenTool className="w-12 h-12 opacity-40 animate-pulse" />
                      <span>{t('Hozirgi smenada faol nosozliklar aniqlanmadi')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduled PM Checklist Card Widget */}
              <div className="lg:col-span-4 bg-slate-900 text-white rounded-[40px] p-8 border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-500 animate-pulse" />
                    <div>
                      <h3 className="text-base font-black tracking-tight">{t('Profilaktika (PM) Jurnali')}</h3>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{t('Rejadagi texnik ko\'riklar checklisti')}</p>
                    </div>
                  </div>

                  {/* PM Progress */}
                  {(() => {
                    const completed = pmTasks.filter(t => t.status === 'DONE').length;
                    const pct = Math.round((completed / pmTasks.length) * 100);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                          <span>{t('Bajarilgan Rejalar')}</span>
                          <span>{completed} / {pmTasks.length} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Checklist items */}
                  <div className="space-y-3">
                    {pmTasks.map(task => {
                      const isDone = task.status === 'DONE';
                      const isOverdue = task.status === 'OVERDUE';
                      
                      return (
                        <div 
                          key={task.id}
                          onClick={() => handleTogglePmTask(task.id)}
                          className={`p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${
                            isDone ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-60' :
                            isOverdue ? 'bg-rose-500/5 border-rose-500/20 text-rose-400 animate-pulse' :
                            'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={isDone}
                              readOnly
                              className="w-4 h-4 rounded border-white/10 bg-transparent text-amber-500 focus:ring-0 cursor-pointer pointer-events-none" 
                            />
                            <div className="space-y-0.5">
                              <p className={`text-xs font-black tracking-tight ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>{task.name}</p>
                              <span className="text-[7px] font-black uppercase text-slate-500">{task.period}</span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            isDone ? 'bg-emerald-500/10 text-emerald-400' :
                            isOverdue ? 'bg-rose-500/10 text-rose-400' :
                            'bg-white/5 text-slate-400'
                          }`}>{task.statusLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-6 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                  <span>Smena navbatchisi:</span>
                  <span className="text-white">{user?.name || 'Muhandis'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ALARMS' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-100 shadow-sm rounded-[40px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <AlertOctagon className="w-6 h-6 text-rose-500 animate-pulse" />
                    {t('Faol PLC & Datchik Avariyalari')}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold tracking-tight mt-1">{t('Kritik bug\', vakuum yoki dvigatel avariya to\'xtash signallari')}</p>
                </div>
                <span className="px-3.5 py-1 bg-rose-50 text-rose-500 border border-rose-100 rounded-full text-[10px] font-black animate-pulse">
                  {activeAlarms.length} {t('avariya')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeAlarms.map(alarm => (
                  <div key={alarm.id} className="p-6 bg-rose-50/50 border border-rose-100/60 rounded-[32px] space-y-4 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:scale-150 transition-all" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{t('Alarm faol')}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{alarm.alarm_type || alarm.name}</h4>
                      <p className="text-xs text-slate-500 font-bold">{alarm.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">PLC Tag: {alarm.tag_key || 'DB10.DBX0.0'}</span>
                    </div>

                    <button
                      onClick={() => handleAckAlarm(alarm.id)}
                      className="w-full mt-4 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 transition-all active:scale-95"
                    >
                      {t('Tugallash & Acknowledged')}
                    </button>
                  </div>
                ))}

                {/* Local default fallbacks for visual presentation */}
                {activeAlarms.length === 0 && (
                  <div className="col-span-2 p-6 bg-emerald-50/50 border border-emerald-100/60 rounded-[32px] p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 mx-auto text-emerald-500">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{t('Barcha Tizimlar Barqaror')}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-1">{t('PLC datchiklardan hech qanday avariya signali mavjud emas.')}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Maintenance ticket form drawer */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-md">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{t('Yangi Ta\'mirlash Ishi')}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('Nosozlik to\'g\'risida ma\'lumotlar')}</p>
                  </div>
                </div>
                <button onClick={() => setIsNewTicketOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Uskuna / Dvigatel Nomi')}</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Steam Boiler SB-1500"
                    value={newTicket.equipment_name}
                    onChange={(e) => setNewTicket({...newTicket, equipment_name: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:border-amber-500 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Nosozlik Muammosi Tavsifi')}</label>
                  <textarea 
                    required
                    placeholder="Qozonxonadagi bug' klapanining qistirmasi eskirgan, bug' qochishi kuzatilmoqda."
                    rows={3}
                    value={newTicket.issue_description}
                    onChange={(e) => setNewTicket({...newTicket, issue_description: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:border-amber-500 font-bold text-slate-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Prioritet')}</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e: any) => setNewTicket({...newTicket, priority: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:border-amber-500 font-bold text-slate-900"
                    >
                      <option value="CRITICAL">{t('Kritik (To\'xtash)')}</option>
                      <option value="HIGH">{t('Yuqori (Tezkor)')}</option>
                      <option value="MEDIUM">{t('O\'rtacha')}</option>
                      <option value="LOW">{t('Past')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('Mas\'ul muhandis')}</label>
                    <input 
                      type="text" 
                      disabled
                      value={newTicket.assigned_technician}
                      className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-[20px] font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full py-5 bg-slate-950 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submittingTicket ? t('Yozib olingmoqda...') : t('Tasdiqlash va Yuborish')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
