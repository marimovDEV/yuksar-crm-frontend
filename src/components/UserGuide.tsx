import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function UserGuide() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: t('Boshlash'),
      icon: Zap,
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            {t("Yuksar ERP tizimiga xush kelibsiz! Ushbu qo'llanma sizga tizimning asosiy funksiyalari bilan tanishishga va ishni samarali tashkil etishga yordam beradi.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> {t('Kirish va Xavfsizlik')}
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                {t("Tizimga kirish uchun administrator tomonidan berilgan login va paroldan foydalaning. Har bir harakat audit jurnalida qayd etiladi.")}
              </p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <h4 className="font-black text-emerald-900 mb-2 flex items-center gap-2">
                <Layout className="w-5 h-5" /> {t('Interfeys')}
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {t("Chap tomondagi panel orqali bo'limlararo o'tishingiz mumkin. Yuqoridagi panelda qidiruv va bildirishnomalar joylashgan.")}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'warehouse',
      title: t('Ombor Boshqaruvi'),
      icon: Database,
      content: (
        <div className="space-y-6">
          <h4 className="font-black text-slate-900">{t('Materiallar va Xom-ashyo')}</h4>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-none text-[10px] font-bold">1</div>
              <p className="text-sm text-slate-600"><strong>{t('Kirim qilish')}:</strong> {t("Ta'minot bo'limidan kelgan materiallarni 'Sklad 1' bo'limida qabul qiling.")}</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-none text-[10px] font-bold">2</div>
              <p className="text-sm text-slate-600"><strong>{t('O\'tkazmalar')}:</strong> {t("Materiallarni ishlab chiqarishga yoki sexlararo o'tkazish uchun 'Ichki O'tkazmalar' bo'limidan foydalaning.")}</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-none text-[10px] font-bold">3</div>
              <p className="text-sm text-slate-600"><strong>{t('Inventarizatsiya')}:</strong> {t("Har oy yakunida ombor qoldiqlarini tizimdagi ma'lumotlar bilan solishtiring.")}</p>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'production',
      title: t('Ishlab Chiqarish'),
      icon: Factory,
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-[32px] mb-6 relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-lg font-black mb-2">{t('Ish tartibi')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t("Ishlab chiqarish jarayoni naryadlar asosida amalga oshiriladi. Har bir bosqich (Zames, Quyish, Kesish) tizimda qayd etilishi shart.")}</p>
             </div>
             <Factory className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10" />
          </div>
          <div className="grid grid-cols-1 gap-4">
             {[
               { t: 'Naryad yaratish', d: 'Buyurtmalar asosida yangi ishlab chiqarish topshiriqlarini shakllantirish.' },
               { t: 'Zames va Quyish', d: 'Xom-ashyoni sarflash va bloklarni qoliplarga quyish jarayoni.' },
               { t: 'Sifat Nazorati', d: 'Tayyor mahsulotni texnik talablarga muvofiqligini tekshirish.' }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-none font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{t(item.t)}</p>
                    <p className="text-[11px] text-slate-500">{t(item.d)}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )
    },
    {
      id: 'sales',
      title: t('Sotuv va CRM'),
      icon: ShoppingCart,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
               <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
               <h4 className="font-black text-slate-900">{t('Savdo Voronkasi')}</h4>
               <p className="text-xs text-slate-500">{t('Mijozlar bilan ishlash va buyurtmalar nazorati')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-5 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors">
               <h5 className="font-bold text-sm mb-1">{t('Yangi Buyurtma')}</h5>
               <p className="text-xs text-slate-500">{t("Mijozni tanlang, mahsulotlarni savatga qo'shing va to'lov turini belgilang.")}</p>
            </div>
            <div className="p-5 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors">
               <h5 className="font-bold text-sm mb-1">{t('Qarzdorlik Nazorati')}</h5>
               <p className="text-xs text-slate-500">{t("Muddati o'tgan qarzdorliklarni 'Qarzdorlar' bo'limida kuzatib boring.")}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'finance',
      title: t('Moliya'),
      icon: Users,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("Barcha moliya operatsiyalari (kirim, chiqim, kassa transferi) real vaqtda qayd etiladi. Hisobotlar bo'limida foyda va xarajatlar tahlilini ko'rishingiz mumkin.")}
          </p>
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
             <h5 className="text-amber-900 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
               <HelpCircle className="w-4 h-4" /> {t('Muhim eslatma')}
             </h5>
             <p className="text-xs text-amber-800 leading-relaxed">
               {t("Kassadagi qoldiqni har kuni ish yakunida tizimdagi qoldiq bilan solishtiring. Har qanday tafovut haqida rahbariyatga xabar bering.")}
             </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-[56px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left space-y-6 max-w-xl">
               <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('Qo\'llanma')} v2.4</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                 {t('Tizimdan foydalanish')} <span className="text-indigo-400">{t('ruhiyatlari')}</span>
               </h1>
               <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                 {t("Yuksar ERP tizimining barcha imkoniyatlari va ishlash tartibi bo'yicha to'liq instruksiya.")}
               </p>
            </div>
            <div className="w-full md:w-80 h-80 bg-white/5 rounded-[48px] border border-white/10 backdrop-blur-xl flex items-center justify-center relative group">
               <PlayCircle className="w-20 h-20 text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer" />
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl whitespace-nowrap">
                 {t('Video Qo\'llanma')}
               </div>
            </div>
         </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm sticky top-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4">{t('Bo\'limlar')}</h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[24px] transition-all group ${activeSection === section.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSection === section.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-sm'}`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm truncate">{section.title}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeSection === section.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                </button>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('Yordam kerakmi?')}</p>
               <p className="text-xs text-slate-600 mb-6 leading-relaxed">{t("Agar biror savolingiz bo'lsa, texnik yordam bo'limiga murojaat qiling.")}</p>
               <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                 {t('Support Center')}
               </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSection}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="bg-white p-10 md:p-16 rounded-[48px] border border-slate-100 shadow-premium min-h-[600px]"
             >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                     {sections.find(s => s.id === activeSection)?.icon && React.createElement(sections.find(s => s.id === activeSection)!.icon, { className: "w-8 h-8" })}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{sections.find(s => s.id === activeSection)?.title}</h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{t('Batafsil ma\'lumot')}</p>
                   </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  {sections.find(s => s.id === activeSection)?.content}
                </div>

                <div className="mt-20 pt-10 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                         <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Rasmiy hujjat')}</span>
                   </div>
                   <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                     {t('PDF yuklab olish')} <FileText className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
