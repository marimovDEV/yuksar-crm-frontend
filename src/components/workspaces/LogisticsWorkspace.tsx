import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, MapPin, Phone, CheckCircle2, Clock, ChevronRight, Navigation,
  Package, QrCode, Search, AlertCircle, X, ShieldCheck, Map, User as UserIcon
} from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import { uiStore } from '../../lib/store';

const ScannerModal = lazy(() => import('../ScannerModal'));

interface LogisticsWorkspaceProps {
  user: any;
}

export default function LogisticsWorkspace({ user }: LogisticsWorkspaceProps) {
  const { t, locale } = useI18n();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'HISTORY'>('PENDING');

  // Canvas drawing states & refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4f46e5'; // indigo-600
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    // Prevent default touch scrolling
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const checkIsCanvasBlank = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Check if alpha channel has any colored pixels
      if (data[i + 3] !== 0) {
        return false;
      }
    }
    return true;
  };


  // Simulated Courier Vehicle stats
  const vehicleStats = {
    name: 'Labo Carrier Van',
    plate: '01 A 777 BA',
    fuel: 75, // %
    status: 'READY'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('documents/', { params: { courier_id: user.id } }).catch(() => ({ data: [] }));
      setDocuments(res.data.results || res.data || []);
    } catch (err) {
      console.error("Logistics Workspace fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (docId: string | number, action: 'start_delivery' | 'confirm_delivery') => {
    if (action === 'confirm_delivery') {
      const isBlank = checkIsCanvasBlank();
      if (isBlank) {
        uiStore.showNotification(t("Iltimos, mijoz imzosini oling!"), "error");
        return;
      }
    }
    try {
      setLoading(true);
      await api.post(`documents/${docId}/${action}/`);
      uiStore.showNotification(
        action === 'start_delivery' ? t("Yetkazib berish jarayoni boshlandi") : t("Muvaffaqiyatli yetkazildi va yopildi"), 
        "success"
      );
      setSelectedDoc(null);
      fetchData();
    } catch (err) {
      uiStore.showNotification(t("Amalni bajarishda xatolik yuz berdi"), "error");
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (data: any) => {
    if (data.number || data.items) {
      setSelectedDoc(data);
    } else {
      uiStore.showNotification(t("Noma'lum QR kod format"), "info");
    }
  };

  const pendingList = documents.filter(d => d.status !== 'IN_TRANSIT' && d.status !== 'DONE' && d.status !== 'CANCELLED');
  const activeList = documents.filter(d => d.status === 'IN_TRANSIT');
  const doneList = documents.filter(d => d.status === 'DONE');

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg">
            <Truck className="text-white w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1.5">{t('Kuryer Terminali')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Yuklarni yetkazib berish monitoringi')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="relative z-10 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
        >
          <QrCode className="w-4 h-4" />
          {t('QR Kodni Skanlash')}
        </button>
      </div>

      {/* Courier/Vehicle Live Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Biriktirilgan Ulov')}</span>
            <h4 className="text-base font-black text-slate-900 leading-tight">{vehicleStats.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase font-mono">{vehicleStats.plate}</p>
          </div>
          <Truck className="w-8 h-8 text-blue-500 opacity-60" />
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Yoqilg\'i darajasi')}</span>
            <h4 className="text-lg font-black text-slate-900 leading-tight">{vehicleStats.fuel}%</h4>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${vehicleStats.fuel}%` }} />
            </div>
          </div>
          <AlertCircle className="w-6 h-6 text-emerald-500 opacity-60" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('Smena holati')}</span>
            <h4 className="text-base font-black text-emerald-600 leading-tight uppercase tracking-wider flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              {t('Yo\'nalishda')}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{t('Navbatchilik ochiq')}</p>
          </div>
          <ShieldCheck className="w-7 h-7 text-emerald-600 opacity-60" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto pr-2 custom-scrollbar">
        {(['PENDING', 'ACTIVE', 'HISTORY'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t({
              PENDING: 'Kutilayotgan topshiriqlar',
              ACTIVE: 'Faol Yetkazmalar',
              HISTORY: 'Muvaffaqiyatli Yakunlanganlar'
            }[tabKey])}
          </button>
        ))}
      </div>

      {/* Content Queue */}
      <div className="min-h-[300px]">
        {activeTab === 'PENDING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 hover:shadow-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base leading-tight mb-1">{doc.number}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{doc.to_entity_name}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            ))}
            {pendingList.length === 0 && (
              <div className="col-span-2 py-20 text-center text-slate-300 italic flex flex-col items-center justify-center gap-3 bg-white rounded-[32px] border border-slate-100">
                <Package className="w-10 h-10 opacity-50" />
                <span>{t('Kutilayotgan yuklar navbati bo\'sh')}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ACTIVE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeList.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 hover:shadow-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <Navigation className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-100 text-base leading-tight mb-1">{doc.number}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{doc.to_entity_name}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            ))}
            {activeList.length === 0 && (
              <div className="col-span-2 py-20 text-center text-slate-300 italic flex flex-col items-center justify-center gap-3 bg-white rounded-[32px] border border-slate-100">
                <Navigation className="w-10 h-10 opacity-50 animate-bounce" />
                <span>{t('Hozir yo\'lda faol yuklar yo\'q')}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">{t('Yetkazilgan Buyurtmalar Jurnali')}</h3>
            <div className="space-y-3">
              {doneList.map(doc => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between opacity-80 hover:opacity-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-none mb-1">{doc.number}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{doc.to_entity_name}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{t('Muvaffaqiyatli yakunlangan')}</span>
                </div>
              ))}
              {doneList.length === 0 && (
                <div className="py-12 text-center text-slate-300 text-xs italic">{t('Tugallangan buyurtmalar tarixi yo\'q')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <Suspense fallback={null}>
            <ScannerModal 
              type="DOCUMENT"
              onScan={onScanSuccess}
              onClose={() => setIsScannerOpen(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Detail Dialog */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoc(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             
             <motion.div 
               initial={{ y: "100%", opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: "100%", opacity: 0 }}
               className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col p-8"
             >
               <div className="space-y-8">
                 <div className="text-center space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Yuk xati tafsilotlari')}</p>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedDoc.number}</h3>
                 </div>

                 <div className="space-y-4">
                   <div className="bg-slate-50 p-5 rounded-[24px] flex items-start gap-4">
                     <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                     <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('Manzil (Xaridor)')}</span>
                       <p className="text-xs font-black text-slate-800 leading-relaxed">{selectedDoc.to_entity_name}</p>
                     </div>
                   </div>

                    <div className="bg-slate-50 p-5 rounded-[24px] flex items-start gap-4">
                      <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('Topshiriq vaqti')}</span>
                        <p className="text-xs font-black text-slate-800">{new Date(selectedDoc.created_at || '').toLocaleString(locale)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Route map SVG simulator */}
                  {selectedDoc.status === 'IN_TRANSIT' && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('Faol Yetkazish Marshruti')}</span>
                      <div className="bg-slate-950 p-4 rounded-[24px] border border-slate-800 shadow-inner flex flex-col items-center">
                        <svg width="100%" height="80" viewBox="0 0 320 80" className="overflow-visible">
                          {/* Animated curved connection path */}
                          <path d="M 40,40 C 120,10 200,70 280,40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeLinecap="round" />
                          <path d="M 40,40 C 120,10 200,70 280,40" fill="none" stroke="url(#blue-gradient)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6,4" />
                          
                          <defs>
                            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>

                          {/* Plant Node */}
                          <g transform="translate(40,40)">
                            <circle r="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                            <circle r="4" fill="#818cf8" />
                          </g>
                          <text x="40" y="65" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase font-sans">Yuksar Plant</text>

                          {/* Customer Node */}
                          <g transform="translate(280,40)">
                            <circle r="12" fill="#172554" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                            <circle r="4" fill="#3b82f6" />
                          </g>
                          <text x="280" y="65" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase font-sans">Mijoz</text>

                          {/* Animated Pulsing Car/Truck along path */}
                          <circle r="6" fill="#6366f1" filter="drop-shadow(0 0 4px #6366f1)">
                            <animateMotion dur="8s" repeatCount="indefinite" path="M 40,40 C 120,10 200,70 280,40" />
                          </circle>
                        </svg>
                        <div className="flex justify-between w-full text-[8px] font-bold text-slate-400 mt-1">
                          <span>Yuklash yakunlandi &bull; 100%</span>
                          <span className="text-blue-400 uppercase tracking-widest animate-pulse">Tranzitda &bull; GPS: OK</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Electronic Signature Canvas Board */}
                  {selectedDoc.status === 'IN_TRANSIT' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('Mijoz Imzosi (Elektron Tasdiq)')}</span>
                        <button 
                          type="button" 
                          onClick={clearSignature}
                          className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                        >
                          {t('Tozalash')}
                        </button>
                      </div>
                      <div className="border border-slate-200 rounded-[24px] bg-slate-50 overflow-hidden shadow-inner relative h-32">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={128}
                          className="w-full h-full cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        <div className="absolute bottom-2 right-4 text-[7px] text-slate-400 pointer-events-none uppercase font-mono tracking-widest">
                          {t('Imzo maydoni')}
                        </div>
                      </div>
                    </div>
                  )}


                 <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                   {(selectedDoc.status === 'CONFIRMED' || selectedDoc.status === 'CREATED') && (
                     <button 
                       onClick={() => handleAction(selectedDoc.id, 'start_delivery')}
                       className="w-full bg-indigo-600 text-white p-5 rounded-[24px] font-black text-sm shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                       <Navigation className="w-4 h-4 animate-pulse" />
                       {t('YUKNI QABUL QILIB YURISH')}
                     </button>
                   )}
                   {selectedDoc.status === 'IN_TRANSIT' && (
                     <button 
                       onClick={() => handleAction(selectedDoc.id, 'confirm_delivery')}
                       className="w-full bg-emerald-600 text-white p-5 rounded-[24px] font-black text-sm shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 className="w-5 h-5" />
                       {t('YETKAZIB BERILDI')}
                     </button>
                   )}
                   <button onClick={() => setSelectedDoc(null)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all font-mono">{t('Yopish')}</button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
