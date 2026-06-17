import re
file_path = "src/components/ExecutiveDashboard.tsx"
trans_path = "src/i18n/translations.ts"
with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r'"Kesish Liniyasi #1"': r't("Kesish Liniyasi #1")',
    r'"Press Liniyasi #2"': r't("Press Liniyasi #2")',
    r'"EPS Qadoqlash #3"': r't("EPS Qadoqlash #3")',
    r'"Qo\'shimcha Liniya #4"': r't("Qo\'shimcha Liniya #4")'
}
for k, v in replacements.items():
    content = re.sub(k, v, content)
with open(file_path, 'w') as f:
    f.write(content)

file_path_db = "src/components/Dashboard.tsx"
with open(file_path_db, 'r') as f:
    content = f.read()

replacements_db = {
    r'"Liniya #1 \(EPS\)"': r't("Liniya #1 (EPS)")',
    r'"Liniya #2 \(Press\)"': r't("Liniya #2 (Press)")',
    r'"Liniya #3 \(Kesish\)"': r't("Liniya #3 (Kesish)")',
    r'"EPS qadoqlash #1"': r't("EPS qadoqlash #1")',
    r'"Liniya #4 \(Maxsus\)"': r't("Liniya #4 (Maxsus)")',
}
for k, v in replacements_db.items():
    content = re.sub(k, v, content)
with open(file_path_db, 'w') as f:
    f.write(content)

translations = {
    "Kesish Liniyasi #1": "Линия резки #1",
    "Press Liniyasi #2": "Линия пресса #2",
    "EPS Qadoqlash #3": "Упаковка EPS #3",
    "Qo'shimcha Liniya #4": "Дополнительная линия #4",
    "Liniya #1 (EPS)": "Линия #1 (EPS)",
    "Liniya #2 (Press)": "Линия #2 (Пресс)",
    "Liniya #3 (Kesish)": "Линия #3 (Резка)",
    "EPS qadoqlash #1": "Упаковка EPS #1",
    "Liniya #4 (Maxsus)": "Линия #4 (Специальная)"
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
    print(f"Added {len(to_add)} translations for lines.")

