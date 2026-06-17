import re

app_file = "src/App.tsx"
trans_file = "src/i18n/translations.ts"

with open(app_file, "r") as f:
    app_content = f.read()

# Find all t('...') or t("...") in App.tsx
matches = re.findall(r"t\(['\"](.*?)['\"]\)", app_content)

with open(trans_file, "r") as f:
    trans_content = f.read()

existing_keys = set(re.findall(r'"([^"]+)"\s*:', trans_content))
existing_keys.update(re.findall(r"'([^']+)'\s*:", trans_content))

missing = set(m for m in matches if m not in existing_keys)

# Define a manual translation dictionary for known sidebar items
ru_dict = {
    "Boshqaruv Paneli": "Панель управления",
    "Direktor Paneli": "Панель директора",
    "1. Ombor (WMS)": "1. Склад (WMS)",
    "Ombor Boshqaruvi": "Управление складом",
    "Ichki O'tkazmalar": "Внутренние перемещения",
    "2. Ishlab Chiqarish (MES)": "2. Производство (MES)",
    "Operator Paneli": "Панель оператора",
    "Ishlab Chiqarish Buyurtmalari": "Производственные заказы",
    "Ishlab Chiqarish Poligoni": "Производственный полигон",
    "SCADA Live Xaritasi": "SCADA Live Карта",
    "CNC Boshqaruvi": "Управление ЧПУ",
    "Finishing Sexi": "Цех отделки",
    "Sifat Boshqaruvi (QC)": "Контроль качества (QC)",
    "Texnolog Paneli": "Панель технолога",
    "Texnik Xizmat (SCADA)": "Техническое обслуживание (SCADA)",
    "Chiqindi Boshqaruvi": "Управление отходами",
    "3. Ta'minot & Xarid": "3. Снабжение и закупки",
    "Ta'minotchilar": "Поставщики",
    "Xarid Buyurtmalari": "Заказы на закупку",
    "4. Sotuv & CRM": "4. Продажи и CRM",
    "Sotuv Boshqaruvi": "Управление продажами",
    "Mijozlar & CRM": "Клиенты и CRM",
    "Qarzdorlar Nazorati": "Контроль должников",
    "Leadlar & CRM": "Лиды и CRM",
    "Dilerlar": "Дилеры",
    "Narx Siyosati": "Ценовая политика",
    "POS & Katalog": "POS и каталог",
    "5. Moliya & Buxgalteriya": "5. Финансы и бухгалтерия",
    "Moliya & Kassa": "Финансы и касса",
    "Buxgalteriya Terminali": "Бухгалтерский терминал",
    "Foyda Analitikasi": "Аналитика прибыли",
    "Ish Haqi": "Заработная плата",
    "6. Master Data": "6. Мастер-данные",
    "Retseptlar & Normalar": "Рецепты и нормы",
    "Mahsulot Katalogi": "Каталог продуктов",
    "7. Logistika": "7. Логистика",
    "Yetkazish Terminali": "Терминал доставки",
    "Transport Parki": "Транспортный парк",
    "8. Tizim Boshqaruvi": "8. Управление системой",
    "Xodimlar": "Сотрудники",
    "Performans & KPI": "Производительность и KPI",
    "Hujjatlar & Soliq": "Документы и налоги",
    "Hujjatlar Jurnali": "Журнал документов",
    "Tizim Faolligi": "Активность системы",
    "Xabarnomalar": "Уведомления",
    "Foydalanish qo'llanmasi": "Руководство пользователя",
    "Mening KPI": "Мой KPI"
}

to_add = []
for m in sorted(missing):
    # Try to clean up exact matches
    key = m
    val = ru_dict.get(key, key) # fallback to key if not found
    to_add.append(f'  "{key}": "{val}",\n')

if to_add:
    # Insert at the end of EXACT_RU_TRANSLATIONS before the closing brace
    # Assuming the file ends with:
    #   "Brak darajasi": "Уровень брака"
    # };
    
    # We will do string replacement
    parts = trans_content.rsplit("};\n\nconst EXACT_MAP_RU", 1)
    if len(parts) == 2:
        new_content = parts[0] + ",\n" + "".join(to_add) + "};\n\nconst EXACT_MAP_RU" + parts[1]
        with open(trans_file, "w") as f:
            f.write(new_content)
        print(f"Added {len(to_add)} missing keys from App.tsx")
    else:
        print("Could not find the end of the dictionary.")
else:
    print("No missing keys found for App.tsx")

