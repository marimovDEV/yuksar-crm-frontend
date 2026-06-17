import re

file_path = "src/components/workspaces/WarehouseWorkspace.tsx"
trans_path = "src/i18n/translations.ts"

with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r">Ombor qoldig‘i<": r">{t(\"Ombor qoldig'i\")}<",
    r">Kiruvchi \(Intake\)<": r">{t(\"Kiruvchi (Intake)\")}<",
    r">Transferlar<": r">{t(\"Transferlar\")}<",
    r">Bugungi ishlar<": r">{t(\"Bugungi ishlar\")}<",
    r">Alarmlar<": r">{t(\"Alarmlar\")}<",
    r">Navbatdagi o'tkazmalar<": r">{t(\"Navbatdagi o'tkazmalar\")}<",
    # also looking for 'Ombor qoldig‘i' inside arrays if any:
    r"name: 'Ombor qoldig‘i'": r"name: t(\"Ombor qoldig'i\")",
    r"name: 'Kiruvchi \(Intake\)'": r"name: t(\"Kiruvchi (Intake)\")",
    r"name: 'Transferlar'": r"name: t(\"Transferlar\")",
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

with open(file_path, 'w') as f:
    f.write(content)

translations = {
    "Ombor qoldig'i": "Остатки на складе",
    "Kiruvchi (Intake)": "Приемка (Intake)",
    "Transferlar": "Переводы",
    "Bugungi ishlar": "Сегодняшние задачи",
    "Alarmlar": "Уведомления/Алармы",
    "Navbatdagi o'tkazmalar": "Ожидаемые переводы",
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
    print(f"Added {len(to_add)} translations for WarehouseWorkspace.")
else:
    print("Translations already exist.")

