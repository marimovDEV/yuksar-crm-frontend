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

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function UserGuide() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('overview');

  const sections: Section[] = [
    {
      id: 'overview',
      title: t('Umumiy Ma\'lumot'),
      icon: Layout,
      content: (
        <div className="space-y-8">
          <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
             <h3 className="text-xl font-black text-indigo-900 mb-4">{t('Yuksar Industrial ERP v2.4')}</h3>
             <p className="text-sm text-indigo-800 leading-relaxed">
                {t("Yuksar ERP — bu korxonaning barcha biznes-jarayonlarini yagona ekotizimga birlashtiruvchi platforma. Tizimning asosiy maqsadi — inson omilini kamaytirish, xatoliklarni oldini olish va real vaqt rejimida aniq hisobotlarni taqdim etish.")}
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500" /> {t('Tezkorlik')}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t("Barcha ma'lumotlar server bilan lahzalarda sinxronizatsiya qilinadi. Har bir bo'lim boshqa bo'limning harakatini darhol ko'radi.")}</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('Xavfsizlik')}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t("Ma'lumotlar shifrlangan va audit qilinadi. Hech bir tranzaksiya izsiz o'chirilmaydi.")}</p>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'warehouse',
      title: t('1. Ombor va Logistika'),
      icon: Database,
      content: (
        <div className="space-y-8">
           <div className="space-y-4 border-l-4 border-blue-500 pl-6">
              <h4 className="text-lg font-black text-slate-900">{t('Ombor Boshqaruvi')}</h4>
              <p className="text-sm text-slate-600">
                {t("Tizimda 4 ta asosiy ombor mavjud. Har bir omborning o'z mas'ul shaxsi bor.")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 rounded-2xl text-[11px]"><strong>Sklad 1:</strong> {t('Xom-ashyo (Granula, kimyoviy moddalar)')}</div>
                 <div className="p-4 bg-slate-50 rounded-2xl text-[11px]"><strong>Sklad 2:</strong> {t('Tayyor bloklar (Yetilish jarayonida)')}</div>
                 <div className="p-4 bg-slate-50 rounded-2xl text-[11px]"><strong>Sklad 3:</strong> {t('Yarim tayyor (Kesilgan, shakl berilgan)')}</div>
                 <div className="p-4 bg-slate-50 rounded-2xl text-[11px]"><strong>Sklad 4:</strong> {t('Tayyor mahsulot (Sotuvga tayyor)')}</div>
              </div>
           </div>

           <div className="space-y-4 border-l-4 border-emerald-500 pl-6">
              <h4 className="text-lg font-black text-slate-900">{t('Logistika va Yetkazib berish')}</h4>
              <p className="text-sm text-slate-600">
                {t("Sotuvdan so'ng yuk xati (Nakladnoy) asosida logistika bo'limi kuryer tayinlaydi. Kuryer yukni qabul qilganda 'Yo'lda' statusi yoqiladi va mijozga yetkazilgach 'Yetkazildi' deb qayd etiladi.")}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'production',
      title: t('2. Ishlab Chiqarish'),
      icon: Factory,
      content: (
        <div className="space-y-8">
           <div className="p-6 bg-slate-900 text-white rounded-[32px] relative overflow-hidden">
              <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                 <Factory className="w-6 h-6 text-indigo-400" /> {t('Ishlab Chiqarish Zanjiri')}
              </h4>
              <div className="space-y-4 text-xs text-slate-400">
                 <p>{t("1. Buyurtma (Order) yaratiladi")}</p>
                 <p>{t("2. Zames (Retsept asosida qorishma)")}</p>
                 <p>{t("3. Formovka (Blok quyish)")}</p>
                 <p>{t("4. Sklad 2 ga o'tkazish (Yetilish)")}</p>
                 <p>{t("5. CNC va Pardozlash (Kesish)")}</p>
                 <p>{t("6. QC (Sifat nazorati)")}</p>
                 <p>{t("7. Sklad 4 ga qabul qilish")}</p>
              </div>
              <Cpu className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />
           </div>

           <div className="p-6 border border-slate-100 rounded-[32px] space-y-4">
              <h5 className="font-black text-sm">{t('Retseptlar (BOM)')}</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("Har bir mahsulot turi uchun aniq retsept (Xom-ashyo me'yorlari) kiritilgan. Ishlab chiqarish ustasi faqat tasdiqlangan retseptlar bo'yicha ishlay oladi. Retseptdan og'ish hollarida tizim ogohlantirish beradi.")}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'sales',
      title: t('3. Sotuv va CRM'),
      icon: ShoppingCart,
      content: (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
                 <Users className="w-8 h-8 text-emerald-600" />
                 <h5 className="font-black text-sm text-emerald-900">{t('Mijozlar Bazasi')}</h5>
                 <p className="text-xs text-emerald-700">{t("Har bir mijoz uchun alohida karta mavjud bo'lib, unda barcha sotuvlar, to'lovlar va qarzdorlik tarixi saqlanadi.")}</p>
              </div>
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl space-y-3">
                 <Target className="w-8 h-8 text-amber-600" />
                 <h5 className="font-black text-sm text-amber-900">{t('Leadlar Nazorati')}</h5>
                 <p className="text-xs text-amber-700">{t("Sotuv voronkasining eng yuqori bosqichi. Leadlarni o'z vaqtida qayta ishlash savdo hajmini oshiradi.")}</p>
              </div>
           </div>

           <div className="p-8 border border-slate-100 rounded-[40px] space-y-4">
              <h4 className="font-black text-slate-900">{t('Narx Siyosati')}</h4>
              <p className="text-sm text-slate-600">
                {t("Tizimda 'Retail' (Chakna) va 'Wholesale' (Ulgurji) narxlar mavjud. Maxsus mijozlar uchun dilerlik narxlari va individual chegirmalar kiritish imkoniyati bor.")}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'finance',
      title: t('4. Moliya va Analitika'),
      icon: Wallet,
      content: (
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                 <h5 className="font-black text-sm mb-3 flex items-center gap-2"><BarChart className="w-4 h-4 text-blue-500" /> {t('Foyda Analitikasi')}</h5>
                 <p className="text-xs text-slate-500 leading-relaxed">{t("Xarajatlarni (P&L) tahlil qilish orqali har bir mahsulotning sof foydasini (Marginality) ko'rish mumkin.")}</p>
              </div>
              <div className="flex-1 p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                 <h5 className="font-black text-sm mb-3 flex items-center gap-2"><Calculator className="w-4 h-4 text-indigo-500" /> {t('Ish Haqi (Payroll)')}</h5>
                 <p className="text-xs text-slate-500 leading-relaxed">{t("Xodimlarning ishbay (piecework) yoki oylik (fixed) maoshlari ishlab chiqarish natijalariga ko'ra hisoblanadi.")}</p>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'roles',
      title: t('5. Xodimlar Rollari'),
      icon: UserCheck,
      content: (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">A</div>
                    <h5 className="font-black text-slate-900">{t('Bosh Admin')}</h5>
                 </div>
                 <ul className="space-y-2 text-[11px] text-slate-500">
                    <li>• {t('Barcha modullarga to\'liq ruxsat')}</li>
                    <li>• {t('Moliya va foyda hisobotlari')}</li>
                    <li>• {t('Xodimlarni boshqarish va audit')}</li>
                    <li>• {t('Tizim sozlamalari va zaxira nusxalari')}</li>
                 </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">S</div>
                    <h5 className="font-black text-slate-900">{t('Sotuv menejeri')}</h5>
                 </div>
                 <ul className="space-y-2 text-[11px] text-slate-500">
                    <li>• {t('Mijozlar bazasi va Leadlar bilan ishlash')}</li>
                    <li>• {t('Yangi sotuvlarni rasmiylashtirish')}</li>
                    <li>• {t('Qarzdorlik nazorati va to\'lov qabul qilish')}</li>
                    <li>• {t('Sotuv statistikasi')}</li>
                 </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold">O</div>
                    <h5 className="font-black text-slate-900">{t('Omborchi')}</h5>
                 </div>
                 <ul className="space-y-2 text-[11px] text-slate-500">
                    <li>• {t('Xom-ashyo qabul qilish va tarqatish')}</li>
                    <li>• {t('Ichki o\'tkazmalarni tasdiqlash')}</li>
                    <li>• {t('Ombor qoldiqlarini nazorat qilish')}</li>
                    <li>• {t('Inventarizatsiya dalolatnomalari')}</li>
                 </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">U</div>
                    <h5 className="font-black text-slate-900">{t('Ishlab chiqarish ustasi')}</h5>
                 </div>
                 <ul className="space-y-2 text-[11px] text-slate-500">
                    <li>• {t('Ishlab chiqarish naryadlarini boshqarish')}</li>
                    <li>• {t('Zames va Formovka jarayonlari nazorati')}</li>
                    <li>• {t('Materiallar sarfi va retseptlar')}</li>
                    <li>• {t('Sifat nazorati (QC)')}</li>
                 </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">C</div>
                    <h5 className="font-black text-slate-900">{t('CNC operatori')}</h5>
                 </div>
                 <ul className="space-y-2 text-[11px] text-slate-500">
                    <li>• {t('Kesish topshiriqlarini bajarish')}</li>
                    <li>• {t('Bloklar sarfini qayd etish')}</li>
                    <li>• {t('Chiqindi (Waste) miqdorini kiritish')}</li>
                 </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center font-bold">K</div>
                    <h5 className="font-black text-slate-900">{t('Kuryer')}</h5>
                 </div>
                 <ul className="space-y-2 text-[11px] text-slate-500">
                    <li>• {t('Yetkazib berish topshiriqlari')}</li>
                    <li>• {t('Mijoz manzili va aloqa')}</li>
                    <li>• {t('Yukni topshirishni tasdiqlash')}</li>
                 </ul>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'masterdata',
      title: t('6. Tizim Sozlamalari'),
      icon: Settings,
      content: (
        <div className="space-y-8">
           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900">{t('Hujjatlar va Soliqlar')}</h4>
              <p className="text-sm text-slate-600">
                {t("Tizimda firma ma'lumotlari, soliq stavkalari va valyuta kurslari kiritiladi. Har bir chop etiladigan hujjat (Invoice, Nakladnoy) ushbu ma'lumotlar asosida shakllanadi.")}
              </p>
           </div>
           <div className="p-6 bg-indigo-900 text-white rounded-[40px] flex items-center justify-between">
              <div className="space-y-2">
                 <h5 className="font-black text-sm">{t('Yordam kerakmi?')}</h5>
                 <p className="text-xs text-indigo-300">{t('Texnik yordam markazi 24/7 ishlaydi.')}</p>
              </div>
              <button className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                 {t('Support Center')}
              </button>
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
               key={activeSection}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="bg-white p-10 md:p-16 rounded-[48px] border border-slate-100 shadow-premium min-h-[700px]"
             >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                     {sections.find(s => s.id === activeSection)?.icon && React.createElement(sections.find(s => s.id === activeSection)!.icon, { className: "w-8 h-8" })}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{sections.find(s => s.id === activeSection)?.title}</h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{t('Yuksar ERP Professional Guide')}</p>
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
