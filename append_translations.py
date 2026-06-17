import re

trans_file = "src/i18n/translations.ts"
with open(trans_file, 'r') as f:
    content = f.read()

new_translations = {
    "Xodimlar Performans Markazi": "Центр эффективности сотрудников",
    "4-komponentli KPI · Ish hajmi 40% · Sifat 30% · Intizom 15% · Tejamkorlik 15%": "4-компонентный KPI · Объем работы 40% · Качество 30% · Дисциплина 15% · Экономия 15%",
    "Ish hajmi": "Объем работы",
    "Sifat": "Качество",
    "Intizom": "Дисциплина",
    "Tejamkorlik": "Экономия",
    "Ajoyib": "Отлично",
    "Yaxshi": "Хорошо",
    "Qoniqarsiz": "Неудовлетворительно",
    "Rollar": "Роли",
    "Audit log": "Журнал аудита",
    "Xavfsizlik": "Безопасность",
    "Tizim boshqaruvi": "Управление системой",
    "Barcha statuslar": "Все статусы",
    "+ Yangi foydalanuvchi": "+ Новый пользователь",
    "Tahrir": "Редактировать",
    "Kirish/Vhod": "Вход",
    "Kirish": "Вход",
    "Ism, username yoki telefon bo'yicha qidirish...": "Поиск по имени, username или телефону...",
}

to_add = []
for k, v in new_translations.items():
    if f'"{k}"' not in content and f"'{k}'" not in content:
        to_add.append(f'  "{k}": "{v}",\n')

if to_add:
    parts = content.rsplit("};", 1)
    if len(parts) == 2:
        # parts[0] is everything before the LAST }; which is likely the EXACT_RU_TRANSLATIONS end
        # wait, let me just find EXACT_MAP_RU
        parts = content.rsplit("};\n\nconst EXACT_MAP_RU", 1)
        if len(parts) == 2:
            # parts[0] ends with the last translation
            new_content = parts[0] + ",\n" + "".join(to_add) + "};\n\nconst EXACT_MAP_RU" + parts[1]
            # wait, if parts[0] already includes the last key, I just need to append. BUT I MUST REMOVE THE TRAILING } first!
            # parts[0] does NOT contain `};\n\nconst EXACT_MAP_RU`.
            # so parts[0] is just `  "Yetkazish Terminali": "Терминал доставки",\n  "users/me/": "users/me/"\n`
            with open(trans_file, "w") as f:
                f.write(new_content)
            print(f"Added {len(to_add)} missing KPI/Admin keys")
        else:
            print("Could not find EXACT_MAP_RU")
else:
    print("All keys already exist")

