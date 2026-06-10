import re

extra_translations = {
    "Boshqaruv": "Управление",
    "Moliya": "Финансы",
    "Sotuv": "Продажи",
    "Ishlab Chiqarish": "Производство",
    "Ishlab chiqarish": "Производство",
    "Ombor": "Склад",
    "Sifat Nazorati": "Контроль качества",
    "Sifat nazorati": "Контроль качества",
    "Logistika": "Логистика",
    "Xodimlar": "Персонал",
    "Sozlamalar": "Настройки",
    "Dashboard": "Панель приборов",
    "Kassa": "Касса",
    "Kredit": "Кредит",
    "Debit": "Дебет",
    "Kirish Qoldig'i": "Входящий остаток",
    "Live": "В эфире",
    "Raw Granules": "Сырые гранулы",
    "Connected": "Подключено",
    "uzs": "сум",
    "UZS": "сум",
    "step": "шаг",
    "Qadoqlash": "Упаковка",
    "Yuklash": "Погрузка",
    "Yetkazib berildi": "Доставлено",
    "Yetkazib berish": "Доставка",
    "Barchasi": "Все",
    "Tasdiqlash": "Подтвердить",
    "Bekor qilish": "Отмена",
    "Saqlash": "Сохранить",
    "O'chirish": "Удалить",
    "Qo'shish": "Добавить",
    "Tahrirlash": "Редактировать",
    "Holat": "Статус",
    "Sana": "Дата",
    "Mijoz": "Клиент",
    "Summa": "Сумма",
    "Miqdor": "Количество",
    "Qoldiq": "Остаток",
    "Izoh": "Комментарий",
    "Hisobotlar": "Отчеты",
    "Asosiy": "Главная",
    "Chiqish": "Выйти",
    "Profil": "Профиль",
    "Sotuv Terminali": "Терминал продаж",
    "Sotuv Boshqaruvi": "Управление продажами",
    "Savdo CRM": "Торговая CRM",
    "Texnolog Paneli": "Панель технолога",
    "Texnolog Terminali": "Терминал технолога",
    "Ishlab Chiqarish Ustasi": "Мастер производства",
    "Sifat Nazorati Terminali": "Терминал контроля качества",
    "Logistika nazorati": "Контроль логистики",
    "Chiqindilar": "Отходы",
    "Chiqindi Nazorati": "Контроль отходов",
    "Chiqindi Sexi": "Цех отходов",
    "Qayta Ishlandi": "Переработано",
    "Qaytarish": "Возврат",
    "Yuk xati": "Накладная",
    "Tranzaksiyalar": "Транзакции",
    "Kirim": "Приход",
    "Chiqim": "Расход",
    "Jami": "Итого",
    "P (bar)": "Давление (бар)",
    "T (°C)": "Температура (°C)",
    "Prefoamer PV-1": "Предвспениватель PV-1",
    "Molder BF-12": "Формовщик BF-12",
    "Yuksar ERP": "Yuksar ERP",
    "Qabul qilish": "Принять",
    "Jo'natish": "Отправить",
    "Boshlash": "Начать",
    "Tugatish": "Завершить",
    "Buyurtma": "Заказ",
    "Buyurtmalar": "Заказы",
    "Material": "Материал",
    "Materiallar": "Материалы",
    "Ombor qoldig'i": "Остаток на складе",
    "Omborlar": "Склады",
    "Xomashyo": "Сырье",
    "Tayyor Mahsulot Ombori (Mavjud)": "Склад готовой продукции (в наличии)",
    "Sifat tasnifi": "Классификация качества",
    "Brak/Chiqindi": "Брак/Отходы",
    "Sifat darajasi": "Уровень качества",
    "Yangi Buyurtma Ustasi": "Мастер нового заказа",
    "Kechikayotgan Ishlar": "Просроченные задачи",
    "Aktiv Buyurtmalar": "Активные заказы",
    "Kutilayotgan ishlar": "Ожидающие задачи",
    "Barcha amallar": "Все операции",
    "Tasdiqlangan (Final)": "Одобрено (Финал)"
}

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert extra translations right after `const EXACT_RU_TRANSLATIONS: Record<string, string> = {`
insert_str = ""
for k, v in extra_translations.items():
    # Only insert if it's not already in EXACT_RU_TRANSLATIONS
    # Very basic check, might falsely match if it's in another block, but it's safe enough.
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

print("Injected extra translations.")
