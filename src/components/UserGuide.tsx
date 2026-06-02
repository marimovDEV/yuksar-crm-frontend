import React, { useState } from 'react';
import { 
  BookOpen, Database, Factory, Wallet, ShieldCheck, 
  ChevronRight, PlayCircle, Info, CheckCircle2, ShoppingCart, Truck, Activity
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
  dashboard: {
    title: "1. Asosiy Boshqaruv (Dashboard)",
    description: "Zavodning barcha asosiy ko'rsatkichlarini bir joyda ko'rsatuvchi rahbar paneli. Har kuni ertalab eng avval shu panelni tekshirish tavsiya etiladi.",
    steps: [
      { step: "Ko'rsatkichlar", desc: "Kunlik ishlab chiqarish hajmi, tayyor mahsulotlar va aktiv buyurtmalarni ko'zdan kechiring." },
      { step: "Moliya", desc: "Tushumlar va chiqimlar grafigini kuzating, sof foydani tahlil qiling." },
      { step: "Ogohlantirishlar (Alertlar)", desc: "Qizil rangda chiqqan datchik xatolari va kamayib ketgan zaxiralarni zudlik bilan mas'ulga yuboring." }
    ],
    outcome: "Zavoddagi barcha jarayonlarni atigi 1 daqiqa ichida baholash va muammolarni erta aniqlash imkonini beradi."
  },
  warehouse: {
    title: "2. Ombor Boshqaruvi va Inventarizatsiya",
    description: "Xom-ashyo qabuli, FIFO tizimi asosida ishlatilishi va zaxiralarning qat'iy hisobi.",
    steps: [
      { step: "Kirim qilish", desc: "Ombor bo'limida (+) tugmasi orqali yangi kelgan xom-ashyoni, uning ta'minotchisini va aniq vaznini kiriting." },
      { step: "FIFO nazorati", desc: "Tizim eng birinchi kelgan materialni birinchi bo'lib ishlab chiqarishga yuboradi (eskirib qolmasligi uchun)." },
      { step: "Tranzit", desc: "Sexlar o'rtasida mahsulotni ko'chirayotganda majburiy tizim tasdig'ini oling." },
      { step: "Inventarizatsiya", desc: "Oy oxirida 'Cycle Counting' orqali ombordagi real miqdor va tizimdagi miqdor farqini aniqlang va to'g'irlang." }
    ],
    outcome: "Ombordagi har bir kilogramm material hisobga olinadi va yo'qotishlar (o'g'rilik) ning oldi olinadi."
  },
  production: {
    title: "3. Ishlab Chiqarish va MES",
    description: "Xom-ashyoni tayyor mahsulotga aylantirish, zames tayyorlash va stanoklarni boshqarish.",
    steps: [
      { step: "Yangi Zames", desc: "Ishlab chiqarish bo'limidan retseptni tanlang. Tizim kerakli xom-ashyoni ombordan avtomatik yechib oladi." },
      { step: "Bunker taymeri", desc: "Aralashma bunkerga tushgach, yetilish vaqti (4-6 soat) tugashini kuting. Yashil bo'lganda formovkaga o'tkazish mumkin." },
      { step: "Blok quyish", desc: "Massani qolipga quygach, 'Blok yaratish' ni bosing. Har bir blokka QR-kod yorlig'i chop etib yopishtiring." },
      { step: "Qayta ishlash", desc: "Brak yoki chiqindilar paydo bo'lsa, ularni 'Recycle' sexiga yuborib maydalab, qayta ishlab chiqarishga qo'shing." }
    ],
    outcome: "Zavod doimiy uzluksiz ishlaydi va ishlab chiqarishdagi har bir jarayon QR kodlar orqali kuzatiladi."
  },
  qc: {
    title: "4. Sifat Nazorati (QC)",
    description: "Mahsulotlar sifatini tekshirish va brak (nuqsonli) mahsulotlarni ajratish.",
    steps: [
      { step: "O'lchash", desc: "Chiqgan bloklarning uzunligi, eni, qalinligi va zichligini o'lchab tizimga kiriting." },
      { step: "Sinf (Klass) berish", desc: "Standartga javob bersa A-Klass, biroz nuqsoni bo'lsa B-Klass qilib tasdiqlang." },
      { step: "Brak", desc: "Yaroqsiz mahsulotlarni zudlik bilan brakka chiqarib, chiqindi omboriga yo'naltiring." }
    ],
    outcome: "Mijozlarga faqat tekshirilgan yuqori sifatli mahsulotlar yetkaziladi."
  },
  sales: {
    title: "5. Sotuv va Yetkazib Berish",
    description: "Mijozlar bazasi, yangi buyurtmalar qabul qilish va yuklarni manzilga yuborish.",
    steps: [
      { step: "Buyurtma shakllantirish", desc: "Mijozni tanlang, mahsulotlarni tanlang va 'Saqlash' tugmasini bosing." },
      { step: "Zaxira va Ishlab chiqarish", desc: "Agar omborda mahsulot yetmasa, buyurtma avtomatik tarzda zavodga ishlab chiqarish navbatiga tushadi." },
      { step: "Yukni jo'natish", desc: "Yuk tayyor bo'lgach kuryerga (haydovchiga) biriktiring. Kuryer manzilga yetib borgach ilovada 'Yetkazildi' ni bosadi." }
    ],
    outcome: "Mijoz buyurtmalari hech qachon unutilmaydi va qarzdorliklar avtomatik nazorat qilinadi."
  },
  finance: {
    title: "6. Moliya va Hisob-kitob",
    description: "Zavodning barcha moliyaviy aylanmasi, pul tushumlari, kassa va xarajatlar tahlili.",
    steps: [
      { step: "Tushumlar", desc: "Sotilgan tovarlar uchun barcha pullar Naqd, Karta yoki Bank orqali to'g'ridan to'g'ri tizim kassa balansiga tushadi." },
      { step: "Xarajatlar", desc: "Ijara, oylik maosh, soliq va logistika xarajatlarini kunlik tarzda kirim qilib boring." },
      { step: "Qarzdorlar (Debitorlar)", desc: "Mijozlarning to'lanmagan qarzlari qizarib turadi, ularni vaqtida yig'ib oling." }
    ],
    outcome: "Har bir tiyin hisobi yuritiladi. Direktor tizim orqali qancha toza foyda ko'rayotganini real vaqtda ko'radi."
  }
};

const GUIDE_DATA_RU: Record<string, GuideContent> = {
  dashboard: {
    title: "1. Главная панель (Dashboard)",
    description: "Панель управления руководителя, на которой собраны все ключевые показатели завода. Рекомендуется проверять её каждое утро.",
    steps: [
      { step: "Показатели", desc: "Проверяйте ежедневный объем производства, наличие готовой продукции и активные заказы." },
      { step: "Финансы", desc: "Следите за графиками доходов и расходов, анализируйте чистую прибыль." },
      { step: "Уведомления (Alerts)", desc: "Немедленно передавайте ответственным лицам красные уведомления об ошибках датчиков или нехватке запасов." }
    ],
    outcome: "Позволяет за 1 минуту оценить состояние всех процессов на заводе и заранее выявить проблемы."
  },
  warehouse: {
    title: "2. Управление складом и Инвентаризация",
    description: "Приемка сырья, использование по системе FIFO и строгий учет запасов.",
    steps: [
      { step: "Приемка", desc: "В разделе склада через кнопку (+) введите новое поступившее сырье, поставщика и точный вес." },
      { step: "Контроль FIFO", desc: "Система отправляет в производство самое старое сырье (First In, First Out), чтобы оно не портилось." },
      { step: "Транзит", desc: "При перемещении материалов между цехами обязательно получайте подтверждение в системе." },
      { step: "Инвентаризация", desc: "В конце месяца используйте 'Cycle Counting', чтобы найти и исправить расхождения между фактическим наличием и системой." }
    ],
    outcome: "Каждый килограмм материала учитывается, что исключает потери и кражи."
  },
  production: {
    title: "3. Производство и MES",
    description: "Превращение сырья в готовую продукцию, создание замесов и управление станками.",
    steps: [
      { step: "Новый замес", desc: "Выберите рецепт в производственном модуле. Система автоматически спишет необходимое сырье со склада." },
      { step: "Таймер бункера", desc: "Подождите время созревания смеси в бункере (4-6 часов). Когда индикатор станет зеленым, можно формовать." },
      { step: "Формовка блоков", desc: "Залейте массу в форму и нажмите 'Создать блок'. Распечатайте и наклейте QR-код на каждый блок." },
      { step: "Переработка", desc: "Брак или отходы отправляйте в цех переработки (Recycle), чтобы измельчить их и добавить во вторичное производство." }
    ],
    outcome: "Завод работает непрерывно, а каждый этап производства отслеживается через QR-коды."
  },
  qc: {
    title: "4. Контроль качества (QC)",
    description: "Проверка качества продукции и отделение бракованных изделий.",
    steps: [
      { step: "Замеры", desc: "Измерьте длину, ширину, толщину и плотность выпущенных блоков и введите в систему." },
      { step: "Присвоение класса", desc: "Если продукт соответствует стандарту — присвойте А-Класс, если есть мелкие дефекты — В-Класс." },
      { step: "Брак", desc: "Немедленно отмечайте некачественную продукцию как брак и отправляйте на склад отходов." }
    ],
    outcome: "Клиентам доставляется только проверенная продукция высокого качества."
  },
  sales: {
    title: "5. Продажи и Логистика",
    description: "Ведение базы клиентов, прием новых заказов и отправка грузов по адресу.",
    steps: [
      { step: "Создание заказа", desc: "Выберите клиента, нужные товары и нажмите 'Сохранить'." },
      { step: "Запасы и Производство", desc: "Если на складе не хватает товара, заказ автоматически встает в очередь на производство." },
      { step: "Отгрузка", desc: "Готовый груз привязывается к курьеру (водителю). По прибытии курьер нажимает 'Доставлено' в приложении." }
    ],
    outcome: "Заказы клиентов никогда не теряются, а долги контролируются автоматически."
  },
  finance: {
    title: "6. Финансы и Бухгалтерия",
    description: "Анализ всего финансового оборота, поступлений, касс и расходов завода.",
    steps: [
      { step: "Поступления", desc: "Все деньги за проданные товары поступают на баланс кассы системы напрямую (Наличные, Карта, Банк)." },
      { step: "Расходы", desc: "Ежедневно вносите расходы на аренду, зарплату, налоги и логистику." },
      { step: "Дебиторы (Должники)", desc: "Неоплаченные долги клиентов подсвечиваются красным — вовремя собирайте платежи." }
    ],
    outcome: "Учет до копейки. Директор в реальном времени видит чистую прибыль."
  }
};

export default function UserGuide() {
  const { language, t } = useI18n();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'warehouse' | 'production' | 'qc' | 'sales' | 'finance'>('dashboard');

  const guideData = language === 'ru' ? GUIDE_DATA_RU : GUIDE_DATA_UZ;
  const currentGuide = guideData[activeTab];

  const TABS = [
    { id: 'dashboard', label: language === 'ru' ? "Панель" : "Boshqaruv", icon: Activity },
    { id: 'warehouse', label: language === 'ru' ? "Склад" : "Ombor", icon: Database },
    { id: 'production', label: language === 'ru' ? "Производство" : "Ishlab chiqarish", icon: Factory },
    { id: 'qc', label: language === 'ru' ? "Контроль Качества" : "Sifat nazorati", icon: ShieldCheck },
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
              {language === 'ru' ? "Полное официальное руководство" : "To'liq Rasmiy Yo'riqnoma"}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {language === 'ru' ? "Руководство пользователя YUKSAR ERP" : "YUKSAR ERP Foydalanuvchi qo'llanmasi"}
            </h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              {language === 'ru' 
                ? "Это подробное руководство поможет руководителю и сотрудникам полностью понять и использовать все функции системы. Выберите нужный раздел ниже для изучения."
                : "Ushbu batafsil qo'llanma rahbar va xodimlarga tizimning barcha imkoniyatlarini tushunish va to'liq foydalanishga yordam beradi. Quyidan kerakli bo'limni tanlang."}
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
              {language === 'ru' ? "ВИДЕО-ОБЗОР СИСТЕМЫ" : "TIZIM VIDEO-SHARHI"}
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
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
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
              <CheckCircle2 className="w-5 h-5" />
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
