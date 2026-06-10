import re
import os

extra_translations = {
    "Amalda xatolik yuz berdi": "Произошла ошибка при операции",
    "Audit boshlashda xatolik yuz berdi": "Ошибка при запуске аудита",
    "Auditni Boshlash": "Начать аудит",
    "Auditni Yakunlash": "Завершить аудит",
    "Auditni yopishda xatolik": "Ошибка при закрытии аудита",
    "Barcha majburiy maydonlarni kiriting": "Заполните все обязательные поля",
    "Barcha omborlar normal termodinamik va zaxira holatida.": "Все склады находятся в нормальном термодинамическом и складском состоянии.",
    "Batafsil FIFO Partiyalar Jurnali": "Подробный журнал партий FIFO",
    "Bosh Ombor Boshqaruvi": "Управление главным складом",
    "Bosh xomashyo omboridagi barcha granulalar va materiallar FIFO hisobi": "Учет FIFO всех гранул и материалов на главном складе сырья",
    "Bugungi Ish Rejalari va topshiriqlar": "Планы работы и задания на сегодня",
    "CNC va quyish sexlaridan kelgan qayta ishlash xomashyolari": "Сырье для переработки из цехов ЧПУ и формовки",
    "Cycle Counting": "Циклический пересчет",
    "Dekor": "Декор",
    "Eslatma": "Примечание",
    "FIFO: NEXT": "FIFO: СЛЕДУЮЩИЙ",
    "FIFO: Tezkor": "FIFO: Срочно",
    "Faol Audit Sessiyasi": "Активная сессия аудита",
    "Faol transferlar mavjud emas": "Нет активных перемещений",
    "Haqiqiy miqdor": "Фактическое количество",
    "Harorat": "Температура",
    "Hisob kitob qilindi": "Рассчитано",
    "Inventarizatsiya & Hisob Audit": "Инвентаризация и аудит",
    "Inventarizatsiya boshlandi": "Инвентаризация начата",
    "Inventarizatsiya muvaffaqiyatli yakunlandi va yopildi": "Инвентаризация успешно завершена и закрыта",
    "Jami Tayyor Mahsulot": "Всего готовой продукции",
    "Kiritish": "Ввод",
    "Kritik Ombor Alarmlari (ASU-WMS)": "Критические сигналы склада (АСУ-WMS)",
    "Kritik Zaxira Chegarasi (Threshold)": "Критический предел запасов (Порог)",
    "LIVE": "В РЕАЛЬНОМ ВРЕМЕНИ",
    "Mahsulot nomi, SKU yoki Blok ID qidirish...": "Поиск по названию продукта, артикулу или ID блока...",
    "Mahsulotlarni Haqiqiy Miqdorini Kiriting": "Введите фактическое количество продукции",
    "Massa": "Масса",
    "Material xili": "Тип материала",
    "Material yuklab yuborildi": "Материал отгружен",
    "Mijozlar Qaytaruvlari": "Возвраты клиентов",
    "Mijozlardan Qaytgan Yuklar": "Грузы, возвращенные клиентами",
    "Namlik darajasi (%)": "Уровень влажности (%)",
    "Net Defect Rate": "Чистая доля брака",
    "Ogohlantirish beriladigan minimal material darajasi": "Минимальный уровень материала для предупреждения",
    "Ombor Qoldiqlari & Zaxira Holati": "Остатки на складе и состояние запасов",
    "Ombor operatsiyalari": "Складские операции",
    "Ombor qoldiqlarini physical sanash va buxgalteriyadagi farqni aniqlash": "Физический пересчет складских остатков и выявление расхождений с бухгалтерией",
    "Omborni tanlang": "Выберите склад",
    "Pachka": "Пачка",
    "Partiya Yoshi (FIFO)": "Возраст партии (FIFO)",
    "Partiya kodi": "Код партии",
    "Partiya yaratilmoqda...": "Создание партии...",
    "Plitalar": "Плиты",
    "QC holati": "Статус ОТК",
    "Qabul": "Приемка",
    "Qabul qilish va FIFO partiya yaratish": "Приемка и создание партии FIFO",
    "Qabul qilishda xatolik yuz berdi": "Произошла ошибка при приемке",
    "Qadoqlar soni": "Количество упаковок",
    "Qayta ishlashga, almashtirishga yoki yaroqsizga chiqarish buyruqlari": "Приказы на переработку, замену или утилизацию",
    "Qurilma ulanyapti...": "Устройство подключается...",
    "Recycle": "Переработка",
    "Sabab": "Причина",
    "Saqlashda xatolik": "Ошибка при сохранении",
    "Sexlararo va omborlararo tasdiqlanishi kutilayotgan harakatlar": "Ожидающие подтверждения перемещения между цехами и складами",
    "Shift Duty": "Сменное дежурство",
    "Sifat Darajasi": "Уровень качества",
    "Sifat nazorati kutilyapti": "Ожидается контроль качества",
    "Smart Scan": "Умное сканирование",
    "Standart": "Стандарт",
    "Tizimda": "В системе",
    "Umumiy Chiqindi (Bugun)": "Общие отходы (Сегодня)",
    "WMS Terminal": "Терминал WMS",
    "Warehouse Management System": "Система управления складом",
    "Xarid narxi (UZS per kg)": "Цена закупки (UZS за кг)",
    "Xavfsizlik datchiklari, material qoldiqlari va harorat haqida ogohlantirishlar": "Предупреждения датчиков безопасности, остатков материалов и температуры",
    "Xomashyo Qabul Qilish (Kirim Terminali)": "Приемка сырья (Терминал поступления)",
    "Xomashyo turi (Material)": "Вид сырья (Материал)",
    "YUKSAR SCADA-WMS": "YUKSAR SCADA-WMS",
    "Yangi Inventarizatsiya Sessiyasi Boshlash": "Начать новую сессию инвентаризации",
    "Yangi kiruvchi xomashyo partiyasi muvaffaqiyatli saqlandi": "Новая входящая партия сырья успешно сохранена",
    "Yaroqlilik muddati": "Срок годности",
    "Yorliq generatori": "Генератор этикеток",
    "Yorliqni Chop Etish": "Распечатать этикетку",
    "Yuk xati raqami (Invoice #)": "Номер накладной (Invoice #)",
    "Yuklab yuborish": "Отгрузить",
    "Yuklashga Tayyor": "Готово к отгрузке",
    "Zavod Chiqindilari va Braklar": "Заводские отходы и брак",
    "Zaxira kritik darajada kam": "Запасы критически малы",
    "ekologik qayta aylanish": "экологическая переработка",
    "qayta ishlashga tayyor": "готово к переработке",
    "ta buyurtma": "заказов",
    "va dekor elementlar": "и элементы декора"
}

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

insert_str = ""
for k, v in extra_translations.items():
    if f'"{k}":' not in content and f"'{k}':" not in content:
        insert_str += f'  "{k}": "{v}",\n'

new_content = re.sub(
    r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)',
    r'\1\n' + insert_str,
    content,
    count=1
)

with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Warehouse translations injected successfully!")
