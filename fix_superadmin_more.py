import re

file_path = "src/components/SuperAdminCenter.tsx"
trans_path = "src/i18n/translations.ts"

with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r">So'nggi kirish<": r">{t(\"So'nggi kirish\")}<",
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

with open(file_path, 'w') as f:
    f.write(content)

translations = {
    "So'nggi kirish": "Последний вход",
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
    print(f"Added {len(to_add)} translations for SuperAdminCenter (more).")
else:
    print("Translations already exist.")

