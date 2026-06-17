import re

file_path = "src/components/EmployeePerformanceCenter.tsx"
trans_path = "src/i18n/translations.ts"

with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r">Umumiy ko'rinish<": r">{t(\"Umumiy ko'rinish\")}<",
    r">Reyting jadvali<": r">{t(\"Reyting jadvali\")}<",
    r">Bo'limlar reytingi<": r">{t(\"Bo'limlar reytingi\")}<",
    r">O'rtacha KPI ball<": r">{t(\"O'rtacha KPI ball\")}<",
    r">A-grad xodimlar<": r">{t(\"A-grad xodimlar\")}<",
    r">Bonus fond<": r">{t(\"Bonus fond\")}<",
    r">D-grad \(yordamga muhtoj\)<": r">{t(\"D-grad (yordamga muhtoj)\")}<",
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

with open(file_path, 'w') as f:
    f.write(content)

translations = {
    "Umumiy ko'rinish": "Общий обзор",
    "Reyting jadvali": "Таблица рейтинга",
    "Bo'limlar reytingi": "Рейтинг отделов",
    "O'rtacha KPI ball": "Средний балл KPI",
    "A-grad xodimlar": "Сотрудники А-уровня",
    "Bonus fond": "Бонусный фонд",
    "D-grad (yordamga muhtoj)": "D-уровень (нуждаются в помощи)",
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
    print(f"Added {len(to_add)} translations for EmployeePerformanceCenter.")
else:
    print("Translations already exist.")

