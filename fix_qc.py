import re

file_path = "src/components/workspaces/QCWorkspace.tsx"
trans_path = "src/i18n/translations.ts"

with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r">Kiruvchi QC<": r">{t(\"Kiruvchi QC\")}<",
    r">Tayyor bloklar<": r">{t(\"Tayyor bloklar\")}<",
    r">Defektlar<": r">{t(\"Defektlar\")}<",
    r">Statistika<": r">{t(\"Statistika\")}<",
    r">O'tish %<": r">{t(\"O'tish %\")}<",
    r">Tayyor Bloklar \(0\)<": r">{t(\"Tayyor Bloklar (0)\")}<",
    r">Kiruvchi QC \(0\)<": r">{t(\"Kiruvchi QC (0)\")}<",
    r">Defektlar \(0\)<": r">{t(\"Defektlar (0)\")}<",
    r">Tekshiruv navbati<": r">{t(\"Tekshiruv navbati\")}<",
    r">Kiruvchi partiyalar<": r">{t(\"Kiruvchi partiyalar\")}<",
    r">Tasdiqlanganlar<": r">{t(\"Tasdiqlanganlar\")}<",
    r">Rad etilgan<": r">{t(\"Rad etilgan\")}<",
    r">Barcha tekshiruvlar yakunlangan<": r">{t(\"Barcha tekshiruvlar yakunlangan\")}<",
    r">Navbatda tekshirishni kutayotgan blok yoki partiya yo'q<": r">{t(\"Navbatda tekshirishni kutayotgan blok yoki partiya yo'q\")}<",
    r"name: 'Kiruvchi QC'": r"name: t(\"Kiruvchi QC\")",
    r"name: 'Tayyor bloklar'": r"name: t(\"Tayyor bloklar\")",
    r"name: 'Defektlar'": r"name: t(\"Defektlar\")",
    r"name: 'Statistika'": r"name: t(\"Statistika\")",
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

with open(file_path, 'w') as f:
    f.write(content)

translations = {
    "Kiruvchi QC": "Входящий QC",
    "Tayyor bloklar": "Готовые блоки",
    "Defektlar": "Дефекты",
    "Statistika": "Статистика",
    "O'tish %": "Процент прохождения",
    "Tayyor Bloklar (0)": "Готовые блоки (0)",
    "Kiruvchi QC (0)": "Входящий QC (0)",
    "Defektlar (0)": "Дефекты (0)",
    "Tekshiruv navbati": "Очередь проверок",
    "Kiruvchi partiyalar": "Входящие партии",
    "Tasdiqlanganlar": "Утвержденные",
    "Rad etilgan": "Отклоненные",
    "Barcha tekshiruvlar yakunlangan": "Все проверки завершены",
    "Navbatda tekshirishni kutayotgan blok yoki partiya yo'q": "Нет блоков или партий, ожидающих проверку",
}

with open(trans_path, 'r') as f:
    trans_content = f.read()

to_add = []
for k, v in translations.items():
    if f'"{k}"' not in trans_content and f"'{k}'" not in trans_content:
        to_add.append(f'  "{k}": "{v}",\n')

if to_add:
    parts = trans_content.rsplit("};", 1)
    new_content = parts[0] + "".join(to_add) + "};" + parts[1]
    with open(trans_path, 'w') as f:
        f.write(new_content)
    print(f"Added {len(to_add)} translations for QCWorkspace.")
else:
    print("Translations already exist.")

