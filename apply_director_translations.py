import re

new_translations = {
    "bosqich": "этап",
    "Faol": "Активен",
    "Kutmoqda": "Ожидает",
    "Muammo": "Проблема",
    "Kutish": "Ожидание",
    "Hamma narsa joyida!": "Всё в порядке!",
    "Bosqich yuklanishi": "Загрузка этапа",
    "Sifat Ko'rsatkichlari": "Показатели качества",
    "Tayyor bloklar": "Готовые блоки",
    "QC kutmoqda": "Ожидает QC",
    "QC rad etilgan": "Отклонено QC",
    "Umumiy brak %": "Общий процент брака",
    "Moliyaviy Ko'rsatkich": "Финансовый показатель",
    "Bugungi daromad": "Доход за сегодня",
    "Oylik daromad": "Доход за месяц",
    "Yetkazishlar": "Доставки",
    "Kritik stok": "Критичный запас",
    "To'liq moliyaviy hisobot": "Полный финансовый отчет",
    "Xom Ashyo (Ombor)": "Сырье (Склад)",
    "Predvspenivatel (Zamas)": "Предвспениватель (Замес)",
    "Bunker (Matuiratsiya)": "Бункер (Матурация)",
    "Formovka (Blok hosil)": "Формовка (Создание блока)",
    "Quritish": "Сушка",
    "Sifat Nazorati (QC)": "Контроль качества (QC)",
    "CNC Kesish": "Резка ЧПУ",
    "Pardozlash": "Отделка",
    "Tayyor Mahsulot Ombor": "Склад готовой продукции",
    "Yetkazib berish": "Доставка",
    "Jonli": "В эфире",
    "Batafsil": "Подробнее",
    "Ishlab Chiqarish Zanjiri": "Производственная цепочка",
    "Ogohlantirishlar": "Предупреждения"
}

file_path = 'src/i18n/translations.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)(.*?)(\};)', content, re.DOTALL)

dict_str = m.group(2)
lines = dict_str.split('\n')

for k, v in new_translations.items():
    if f'"{k}"' not in dict_str:
        lines.append(f'  "{k}": "{v}",')

new_dict_str = '\n'.join(lines)
new_content = content[:m.start(2)] + new_dict_str + content[m.end(2):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Translations applied successfully.")
