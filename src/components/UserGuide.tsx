import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  PlayCircle, 
  ShieldCheck, 
  Zap, 
  Clock, 
  HelpCircle,
  FileText,
  Search,
  Layout,
  Database,
  Factory,
  ShoppingCart,
  Users,
  Wallet,
  Calculator,
  Shield,
  Activity,
  AlertTriangle,
  ArrowRight,
  Printer,
  QrCode,
  Download,
  Settings,
  Truck,
  Layers,
  Scissors,
  UserCheck,
  ClipboardList,
  Target,
  BarChart,
  HardDrive,
  Cpu,
  Feather
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';
import api from '../lib/api';

const ICON_MAP: Record<string, any> = {
  'Layout': Layout,
  'Database': Database,
  'Factory': Factory,
  'ShoppingBag': ShoppingCart,
  'BarChart3': BarChart,
  'UserCheck': UserCheck,
  'Settings': Settings,
  'BookOpen': BookOpen,
  'ShieldCheck': ShieldCheck,
  'Zap': Zap
};

interface GuideContent {
  id: number;
  title_uz: string;
  title_ru: string;
  body_uz: string;
  body_ru: string;
  order: number;
}

interface GuideSection {
  id: number;
  title_uz: string;
  title_ru: string;
  icon: string;
  order: number;
  contents: GuideContent[];
}

export default function UserGuide() {
  const { t, language } = useI18n();
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const response = await api.get('user-guide/');
        const data = response.data;
        setSections(data);
        if (data.length > 0) {
          setActiveSectionId(data[0].id);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user guide:', err);
        setError(t('Ma\'lumotlarni yuklashda xatolik yuz berdi'));
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [t]);

  const activeSection = sections.find(s => s.id === activeSectionId);
  const ActiveIcon = activeSection ? (ICON_MAP[activeSection.icon] || HelpCircle) : Layout;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-500" />
        <p className="text-slate-600 font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
        >
          {t('Qayta urinish')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-[56px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left space-y-6 max-w-xl">
               <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('Yuksar ERP Qo\'llanmasi')} v2.4</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                 {t('Tizimdan foydalanish')} <span className="text-indigo-400">{t('to\'liq instruksiyasi')}</span>
               </h1>
               <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                 {t("Barcha modullar, xodimlar rollari va tizim imkoniyatlari bo'yicha batafsil qo'llanma.")}
               </p>
            </div>
            <div className="w-full md:w-80 h-80 bg-white/5 rounded-[48px] border border-white/10 backdrop-blur-xl flex items-center justify-center relative group">
               <PlayCircle className="w-20 h-20 text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer" />
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl whitespace-nowrap">
                 {t('Video Kursni Ko\'rish')}
               </div>
            </div>
         </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm sticky top-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4">{t('Mundarija')}</h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const IconComp = ICON_MAP[section.icon] || FileText;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[24px] transition-all group ${activeSectionId === section.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSectionId === section.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-sm'}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm truncate">
                      {language === 'ru' ? section.title_ru : section.title_uz}
                    </span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeSectionId === section.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                  </button>
                );
              })}
            </div>
            
            <div className="mt-10 p-8 bg-slate-50 rounded-[40px] border border-slate-100 text-center">
               <QrCode className="w-16 h-16 mx-auto text-slate-300 mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('Mobil versiya uchun skanerlang')}</p>
               <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                 {t('PDF Hujjatni Yuklash')}
               </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSectionId}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="bg-white p-10 md:p-16 rounded-[48px] border border-slate-100 shadow-premium min-h-[700px]"
             >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                     <ActiveIcon className="w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {activeSection ? (language === 'ru' ? activeSection.title_ru : activeSection.title_uz) : ''}
                      </h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{t('Yuksar ERP Professional Guide')}</p>
                   </div>
                </div>

                <div className="space-y-12">
                  {activeSection?.contents.map((content) => (
                    <div key={content.id} className="space-y-4">
                      <h3 className="text-xl font-black text-slate-900">
                        {language === 'ru' ? content.title_ru : content.title_uz}
                      </h3>
                      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {language === 'ru' ? content.body_ru : content.body_uz}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-20 pt-10 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                         <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Xavfsizlik tasdiqlangan')}</span>
                   </div>
                   <div className="flex gap-4">
                     <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        {t('Chop etish')} <Printer className="w-4 h-4" />
                     </button>
                   </div>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
