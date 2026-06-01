import React, { useState } from 'react';
import { 
  BookOpen, Database, Factory, Wallet, ShieldCheck, 
  ChevronRight, PlayCircle, Info, CheckCircle2, ShoppingCart, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';
import erpTourVideo from '../assets/images/erp_grand_tour.webp';

interface GuideStep {
  step: string;
  desc: string;
}

interface GuideContent {
  title: string;
  description: string;
  steps: GuideStep[];
  outcome: string;
}

const GUIDE_DATA_UZ: Record<string, GuideContent> = {
  warehouse: {
    title: "1. Omborda Xom-ashyo Kirimi",
    description: "Yangi xom-ashyo kelganda uni tizimga kirim qilish va ombor balansini oshirish jarayoni.",
    steps: [
      { step: "Tizimga kirish", desc: "Chap menyudan 'Ombor (WMS)' -> 'Ombor Boshqaruvi' bo'limini tanlang." },
      { step: "Kirimni boshlash", desc: "Yuqoridagi 'Kirim qilish' (+) tugmasini bosing." },
      { step: "Ma'lumotlarni kiritish", desc: "Ta'minotchi ismini tanlang, material turini (masalan, Granula) va tarozidagi haqiqiy og'irlikni (kg) kiriting." },
      { step: "Saqlash", desc: "'Saqlash' tugmasini bosing. Tizim avtomatik ravishda yangi xom-ashyo partiyasini (Batch) yaratadi va omborga qo'shadi." }
    ],
    outcome: "Ombordagi xom-ashyo qoldig'i real vaqtda yangilanadi va moliya balansida ta'minotchiga qarz yoziladi."
  },
  production: {
    title: "2. Ishlab Chiqarish (MES Flow)",
    description: "Xom-ashyodan tayyor aralashma (zames) qilish va undan bloklar quyish jarayoni.",
    steps: [
      { step: "Zames boshlash", desc: "'Ishlab Chiqarish (MES)' -> 'Ishlab Chiqarish Poligoni'ga o'ting va 'Yangi zames' tugmasini bosing." },
      { step: "Retsept tanlash", desc: "Kerakli retseptni (masalan, D20) tanlang. Tizim avtomatik granula miqdorini hisoblaydi va ombordan yechadi." },
      { step: "Bunker kutish vaqti", desc: "Zamesni bunkerga yuklang. Bunker taymeri (4-6 soat) tugagach, yashil rangga kiradi." },
      { step: "Blok quyish va QR", desc: "Bunkerdan aralashmani olib, formaga quying va 'Blok quyish'ni bosing. Tizim yaratgan QR-kodni chop etib, blokka yopishtiring." }
    ],
    outcome: "Ishlab chiqarilgan blok avtomatik ravishda 'Sovutilmoqda (Cooling)' holatida zaxiraga kiradi."
  },
  sales: {
    title: "3. Sotuv va Yetkazib Berish",
    description: "Mijozga tovar sotish, pulini hisoblash va yuk mashinasida yuborish jarayoni.",
    steps: [
      { step: "Buyurtma ochish", desc: "'Sotuvlar' bo'limidan mijozni tanlang va mahsulot hamda uning miqdorini qo'shib 'Saqlash'ni bosing." },
      { step: "Zaxira tekshiruvi", desc: "Agar omborda tayyor mahsulot bo'lsa buyurtma 'Confirmed' bo'ladi, agar yo'q bo'lsa avtomatik ishlab chiqarishga navbatga turadi." },
      { step: "Yukni jo'natish", desc: "Mahsulot tayyor bo'lgach, holatni 'Shipped' qiling. Bu kuryer ilovasida yetkazib berish ro'yxatini shakllantiradi." },
      { step: "Yetkazish", desc: "Kuryer yukni manzilga topshirgach, telefondan 'Yetkazildi' tugmasini bosadi va buyurtma yakunlanadi." }
    ],
    outcome: "Mahsulot ombordan chiqib ketadi va kassa yoki mijoz qarz balansi avtomatik tarzda shakllanadi."
  },
  finance: {
    title: "4. Moliya va Kassa Nazorati",
    description: "Kassadagi pullar, tushumlar va zavod xarajatlarining 100% shaffof hisobi.",
    steps: [
      { step: "Kassa aylanmasi", desc: "Barcha savdolar to'lov usuliga qarab (Naqd, Karta, Bank) tegishli kassa balansiga tushadi." },
      { step: "Xarajatlarni yozish", desc: "Ish haqi, elektr, ijara kabi barcha chiqimlarni o'z vaqtida tegishli toifa bilan chiqim qiling." },
      { step: "Direktor tahlili", desc: "Bosh sahifadagi grafiklar va tushum ko'rsatkichlari orqali zavodning sof foydasini kuzatib boring." }
    ],
    outcome: "Zavodning moliya va buxgalteriya balansi har doim tiyin-tiyinigacha to'g'ri chiqadi."
  }
};

const GUIDE_DATA_RU: Record<string, GuideContent> = {
  warehouse: {
    title: "1. Приемка сырья на Склад",
    description: "Процесс оприходования нового сырья при поступлении на завод и увеличения баланса склада.",
    steps: [
      { step: "Вход в систему", desc: "В левом меню выберите 'Склад (WMS)' -> 'Управление складом'." },
      { step: "Начало приемки", desc: "Нажмите кнопку 'Приемка' (+) в верхней части экрана." },
      { step: "Ввод данных", desc: "Выберите поставщика, тип сырья (например, Гранулы) и укажите точный вес (кг) с весов." },
      { step: "Сохранение", desc: "Нажмите кнопку 'Сохранить'. Система автоматически создаст новую партию (Batch) и добавит ее на склад." }
    ],
    outcome: "Остаток сырья на складе обновляется в реальном времени, а в финансовом балансе фиксируется долг перед поставщиком."
  },
  production: {
    title: "2. Производство (MES Flow)",
    description: "Процесс создания готовой смеси (замеса) из сырья и формования блоков.",
    steps: [
      { step: "Запуск замеса", desc: "Перейдите в 'Производство (MES)' -> 'Производственный полигон' и нажмите 'Новый замес'." },
      { step: "Выбор рецепта", desc: "Выберите нужный рецепт (например, D20). Система автоматически рассчитает и спишет необходимое сырье со склада." },
      { step: "Выдержка в бункере", desc: "Загрузите смесь в бункер. Когда таймер бункера (4-6 часов) истечет, его индикатор загорится зеленым." },
      { step: "Формовка и QR-код", desc: "Вылейте смесь из бункера в форму, сформируйте блок и нажмите 'Литье блока'. Распечатайте созданный QR-код и наклейте на блок." }
    ],
    outcome: "Произведенный блок автоматически поступает на склад в статусе 'Охлаждение (Cooling)'."
  },
  sales: {
    title: "3. Продажи и Доставка",
    description: "Продажа товара клиенту, расчет стоимости и отправка грузовым транспортом.",
    steps: [
      { step: "Создание заказа", desc: "В разделе 'Продажи' выберите клиента, добавьте товары, укажите их количество и нажмите 'Сохранить'." },
      { step: "Проверка наличия", desc: "Если товар есть на складе, заказ подтверждается. Если товара нет, он автоматически становится в очередь на производство." },
      { step: "Отгрузка", desc: "Когда товар готов, измените статус на 'Отгружен (Shipped)'. Это добавит заказ в список доставки в приложении курьера." },
      { step: "Вручение", desc: "После доставки курьер нажимает кнопку 'Доставлено' в приложении, и заказ завершается." }
    ],
    outcome: "Товар списывается со склада, а баланс кассы и долг клиента обновляются автоматически."
  },
  finance: {
    title: "4. Финансы и Касса",
    description: "100% прозрачный учет всех касс, поступлений и расходов завода.",
    steps: [
      { step: "Обороты кассы", desc: "Все продажи автоматически поступают на баланс соответствующей кассы в зависимости от метода оплаты (Наличные, Карта, Банк)." },
      { step: "Фиксация расходов", desc: "Своевременно оформляйте расходы на зарплату, электричество, аренду и другие нужды с указанием категории." },
      { step: "Анализ директора", desc: "Следите за чистой прибылью завода с помощью графиков и финансовых показателей на главной странице." }
    ],
    outcome: "Финансовый и бухгалтерский баланс завода всегда сходится до копейки."
  }
};

export default function UserGuide() {
  const { language, t } = useI18n();
  const [activeTab, setActiveTab] = useState<'warehouse' | 'production' | 'sales' | 'finance'>('warehouse');

  const guideData = language === 'ru' ? GUIDE_DATA_RU : GUIDE_DATA_UZ;
  const currentGuide = guideData[activeTab];

  const TABS = [
    { id: 'warehouse', label: language === 'ru' ? "Склад" : "Ombor", icon: Database },
    { id: 'production', label: language === 'ru' ? "Производство" : "Ishlab chiqarish", icon: Factory },
    { id: 'sales', label: language === 'ru' ? "Продажи" : "Sotuv", icon: ShoppingCart },
    { id: 'finance', label: language === 'ru' ? "Финансы" : "Moliya", icon: Wallet }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      
      {/* Video Grand Tour Block */}
      <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              {language === 'ru' ? "Официальное руководство" : "Rasmiy Yo'riqnoma"}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {language === 'ru' ? "Как работает система YUKSAR ERP?" : "YUKSAR ERP tizimi qanday ishlaydi?"}
            </h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              {language === 'ru' 
                ? "Посмотрите краткий видео-обзор завода и системы, чтобы понять основной рабочий процесс за 2 минуты."
                : "2 daqiqada asosiy ish jarayonini tushunish uchun zavod va tizimning qisqa video-sharhini tomosha qiling."}
            </p>
          </div>
          
          <div className="md:col-span-5 rounded-[24px] overflow-hidden border border-slate-200 bg-slate-900 relative group aspect-video">
            <img 
              src={erpTourVideo} 
              alt="ERP Tour Video Preview" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer text-indigo-600">
                <PlayCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider">
              {language === 'ru' ? "ВИДЕО-ОБЗОР" : "VIDEO-SHARH"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-slate-100/80 p-2 rounded-3xl border border-slate-200 flex flex-wrap gap-2 justify-center md:justify-start">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                isActive 
                  ? 'bg-white text-indigo-600 shadow-md border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 md:p-10 rounded-[32px] border border-slate-200 shadow-sm space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {currentGuide.title}
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-3xl">
              {currentGuide.description}
            </p>
          </div>

          {/* Steps list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGuide.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{step.step}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Outcome Alert */}
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4 items-start">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-widest">
                {language === 'ru' ? "РЕЗУЛЬТАТ ЭТОГО ПРОЦЕССА" : "JARAYONNING YAKUNIY NATIJASI"}
              </h5>
              <p className="text-emerald-700 font-medium text-xs leading-relaxed">
                {currentGuide.outcome}
              </p>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
