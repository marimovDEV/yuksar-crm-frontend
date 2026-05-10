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
  Truck
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
      title: t('Tizim haqida umumiy'),
      icon: Layout,
      content: (
        <div className="space-y-8">
          <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
             <h3 className="text-xl font-black text-blue-900 mb-4">{t('Yuksar Industrial ERP v2.4')}</h3>
             <p className="text-sm text-blue-800 leading-relaxed">
                {t("Ushbu tizim penoplast ishlab chiqarish korxonasining barcha jarayonlarini — xarid qilishdan tortib, ishlab chiqarish, sotuv va moliya hisobigacha bo'lgan zanjirni raqamlashtirish uchun mo'ljallangan. Tizim real vaqt rejimida (real-time) ishlaydi va har bir harakatni audit qiladi.")}
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold italic">1</div>
                <h4 className="font-black text-sm">{t('Modullilik')}</h4>
                <p className="text-[11px] text-slate-500">{t("Har bir bo'lim (Sotuv, Ombor, Ishlab chiqarish) alohida modul sifatida ishlaydi, lekin ma'lumotlar umumiy bazaga bog'langan.")}</p>
             </div>
             <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold italic">2</div>
                <h4 className="font-black text-sm">{t('Rollar Nazorati')}</h4>
                <p className="text-[11px] text-slate-500">{t("Foydalanuvchilar faqat o'zlariga tegishli bo'lgan ma'lumotlarni ko'rishadi va tahrirlashadi (RBAC tizimi).")}</p>
             </div>
             <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold italic">3</div>
                <h4 className="font-black text-sm">{t('Analitika')}</h4>
                <p className="text-[11px] text-slate-500">{t("Barcha ma'lumotlar asosida avtomatik grafiklar va bashoratli (predictive) tahlillar shakllanadi.")}</p>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'warehouse',
      title: t('1. Ombor va Zaxira'),
      icon: Database,
      content: (
        <div className="space-y-8">
           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                {t('Xom-ashyo qabul qilish (Kirim)')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("Ta'minotchidan yuk kelganda 'Ombor' -> 'Sklad 1' bo'limiga kiring. 'Kirim' tugmasini bosing, material turi, partiya raqami va miqdorini kiriting. Tizim avtomatik ravishda o'rtacha narxni hisoblaydi.")}
              </p>
           </div>

           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                {t('Ichki O\'tkazmalar (Transfer)')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("Materiallarni sexga yoki boshqa omborga o'tkazish uchun 'Ichki O'tkazmalar' bo'limidan foydalaning. Har bir transferda 'Yuboruvchi' va 'Qabul qiluvchi' mas'ul shaxslar bo'lishi kerak. Qabul qiluvchi tasdiqlamaguncha yuk 'Yo'lda' statusida bo'ladi.")}
              </p>
           </div>

           <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
              <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">{t('Ombor turlari')}:</h5>
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-[11px] font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">Sklad 1: Xom-ashyo</div>
                 <div className="text-[11px] font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">Sklad 2: Yarim tayyor bloklar</div>
                 <div className="text-[11px] font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">Sklad 3: Ichki aylanma</div>
                 <div className="text-[11px] font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">Sklad 4: Tayyor mahsulotlar</div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'production',
      title: t('2. Ishlab chiqarish poligoni'),
      icon: Factory,
      content: (
        <div className="space-y-8">
           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                {t('Ishlab chiqarish naryadi (Order)')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("Har qanday ishlab chiqarish 'Order' bilan boshlanadi. Orderda mahsulot turi, soni va ishlatiladigan retsept (BOM) ko'rsatiladi. Order yaratilganda xom-ashyo omborda 'Rezerv' qilinadi.")}
              </p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-6 border border-slate-100 rounded-[32px] hover:shadow-lg transition-all space-y-3">
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5" /></div>
                 <h5 className="font-black text-sm">{t('Bosqich 1: Zames (Qorishma)')}</h5>
                 <p className="text-xs text-slate-500">{t("Retsept bo'yicha materiallar bunkerga yuklanadi. Zames yakunlangach, unga xos QR kodli hujjat shakllanadi.")}</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-[32px] hover:shadow-lg transition-all space-y-3">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                 <h5 className="font-black text-sm">{t('Bosqich 2: Formovka (Blok quyish)')}</h5>
                 <p className="text-xs text-slate-500">{t("Tayyor qorishma qoliplarga quyiladi. Tizimda qaysi bunker va qaysi qolip ishlatilgani ko'rsatiladi.")}</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-[32px] hover:shadow-lg transition-all space-y-3">
                 <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Scissors className="w-5 h-5" /></div>
                 <h5 className="font-black text-sm">{t('Bosqich 3: CNC va Pardozlash')}</h5>
                 <p className="text-xs text-slate-500">{t("Bloklar kesiladi va shakl beriladi. Har bir kesimda hosil bo'lgan chiqindi (Waste) miqdori alohida kiritilishi shart.")}</p>
              </div>
           </div>

           <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px]">
              <h5 className="text-rose-900 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {t('Sifat Nazorati (QC)')}
              </h5>
              <p className="text-xs text-rose-800 leading-relaxed">
                {t("Mahsulot omborga kirishidan oldin QC xodimi tomonidan tekshiriladi. Agar brak bo'lsa, tizimga brak sababi kiritiladi va mahsulot 'Waste' yoki 'Repair' bo'limiga yo'naltiriladi.")}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'sales',
      title: t('3. Savdo va Mijozlar'),
      icon: ShoppingCart,
      content: (
        <div className="space-y-8">
           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                {t('Buyurtma rasmiylashtirish')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("'Savdo' bo'limida 'Yangi Buyurtma' tugmasini bosing. Mijozni tanlang (yoki yangi yarating), mahsulotlarni savatga qo'shing. To'lov turi (Naqd, Bank, Qarz) to'g'ri ko'rsatilganiga ishonch hosil qiling.")}
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                 <h5 className="font-bold text-sm text-slate-900">{t('Leadlar va CRM')}</h5>
                 <p className="text-xs text-slate-500">{t("Potensial mijozlar (Leadlar) bilan muloqot tarixini yozib boring. Har bir lead 'Mijoz' statusiga o'tgach, u bilan savdo qilish imkoni ochiladi.")}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                 <h5 className="font-bold text-sm text-slate-900">{t('Qarzdorlik')}</h5>
                 <p className="text-xs text-slate-500">{t("Agar sotuv 'Qarz' (Debt) asosida bo'lsa, tizim avtomatik ravishda mijoz balansiga qarz yozadi. To'lov amalga oshirilganda 'Moliya' bo'limi orqali qarz yopiladi.")}</p>
              </div>
           </div>

           <div className="p-8 bg-slate-50 rounded-[40px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white rounded-2xl shadow-sm"><Printer className="w-5 h-5 text-slate-400" /></div>
                 <p className="text-xs font-black text-slate-700 uppercase tracking-widest">{t('Hujjatlar')}</p>
              </div>
              <p className="text-[11px] text-slate-400 italic">{t("Har bir sotuvdan so'ng hisob-faktura va yuk xati (nakladnoy) avtomatik PDF formatda shakllanadi.")}</p>
           </div>
        </div>
      )
    },
    {
      id: 'finance',
      title: t('4. Moliya va Buxgalteriya'),
      icon: Wallet,
      content: (
        <div className="space-y-8">
           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                {t('Kassalar va Tranzaksiyalar')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("Tizimda bir nechta kassa (Asosiy kassa, Bank hisobi, Valyuta kassasi) bo'lishi mumkin. Har bir pul harakati (Kirim/Chiqim) tegishli kassa va moliya kategoriyasiga (Ish haqi, Soliqlar, Kommunal va h.k.) bog'lanishi shart.")}
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-[32px] space-y-3">
                 <h5 className="font-bold text-sm text-slate-900">{t('Kassalararo transfer')}</h5>
                 <p className="text-xs text-slate-500">{t("Pullarni bir kassadan ikkinchisiga o'tkazish 'Kassa Transferi' orqali amalga oshiriladi. Bu tranzaksiya foyda yoki zararga ta'sir qilmaydi.")}</p>
              </div>
              <div className="p-6 bg-white border border-slate-100 rounded-[32px] space-y-3">
                 <h5 className="font-bold text-sm text-slate-900">{t('Buxgalteriya o\'tkazmalari')}</h5>
                 <p className="text-xs text-slate-500">{t("Professional buxgalterlar uchun 'Accounting Ledger' (Bosh daftar) mavjud. Har bir operatsiya double-entry (debet/kredit) prinsipi bo'yicha ishlaydi.")}</p>
              </div>
           </div>

           <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] flex gap-5">
              <Calculator className="w-10 h-10 text-indigo-600 flex-none" />
              <div>
                 <h5 className="font-black text-sm text-indigo-900 mb-1">{t('Byudjet Nazorati')}</h5>
                 <p className="text-xs text-indigo-700 leading-relaxed">{t("Yil boshida yoki oy boshida har bir xarajat markazi uchun byudjet belgilanishi mumkin. Tizim belgilangan byudjetdan oshib ketish hollarida ogohlantirish beradi.")}</p>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'admin',
      title: t('5. Admin va Xavfsizlik'),
      icon: Shield,
      content: (
        <div className="space-y-8">
           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                {t('Xodimlar va Ruxsatlar')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("'Admin' bo'limida yangi xodimlarni qo'shishingiz va ularga rollar biriktirishingiz mumkin. Parollarni vaqti-vaqti bilan yangilab turish tavsiya etiladi. Xodim tizimdan ketsa, uning profilini 'Blocked' statusiga o'tkazing.")}
              </p>
           </div>

           <div className="p-8 bg-slate-900 text-white rounded-[48px] space-y-6">
              <h5 className="font-black text-sm flex items-center gap-2">
                 <Activity className="w-5 h-5 text-emerald-400" /> {t('Audit Jurnali (Logs)')}
              </h5>
              <div className="space-y-4">
                 <p className="text-xs text-slate-400 leading-relaxed">
                   {t("Tizimda har bir login, ma'lumot o'zgarishi, o'chirish yoki pul operatsiyasi jurnalda saqlanadi. Administratorlar 'Tizim Faolligi' bo'limi orqali kim, qachon va qaysi qurilmadan qanday amalni bajarganini ko'ra oladilar.")}
                 </p>
                 <div className="flex gap-2">
                    <span className="text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded">IP tracking</span>
                    <span className="text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded">Device fingerprinting</span>
                    <span className="text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded">Change diff tracking</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                {t('Qo\'llab-quvvatlash')}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("Har qanday texnik xatolik yoki savollar yuzasidan IT bo'limiga yoki tizim ishlab chiquvchilariga murojaat qiling. Har bir xato bildirishnomasi avtomatik ravishda dev-teamga yuboriladi.")}
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
                 {t('Tizimdan foydalanish')} <span className="text-indigo-400">{t('instruksiyasi')}</span>
               </h1>
               <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                 {t("Yuksar ERP tizimining barcha imkoniyatlari va ishlash tartibi bo'yicha batafsil instruksiya.")}
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
               <p className="text-xs text-slate-600 mb-6 leading-relaxed">{t("Agar biror savolingiz bo'lsa, tizim administratoriga murojaat qiling.")}</p>
               <div className="space-y-2">
                 <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2">
                   <Download className="w-4 h-4" /> PDF {t('Yuklash')}
                 </button>
                 <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                   <HelpCircle className="w-4 h-4" /> {t('Support')}
                 </button>
               </div>
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
               className="bg-white p-10 md:p-16 rounded-[48px] border border-slate-100 shadow-premium min-h-[700px]"
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
                   <div className="flex gap-4">
                     <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        <QrCode className="w-4 h-4" /> {t('Mobile Link')}
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
