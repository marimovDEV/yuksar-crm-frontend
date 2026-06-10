import re
import os

files_to_check = [
    "src/components/workspaces/OperatorWorkspace.tsx",
    "src/components/workspaces/CNCWorkspace.tsx",
    "src/components/workspaces/QCWorkspace.tsx",
    "src/components/ProductionFloor.tsx"
]

all_translations = set()
for f_path in files_to_check:
    if not os.path.exists(f_path):
        continue
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # find t("...") or t('...')
        matches = re.findall(r't\(\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
        all_translations.update(matches)

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

insert_str = ""
for k in all_translations:
    if f'"{k}":' not in content and f"'{k}':" not in content:
        # Default translation is the same string (we just add it for completeness)
        # We can try to translate some common ones or just map them to themselves
        insert_str += f'  "{k}": "{k}",\n'

if insert_str:
    new_content = re.sub(
        r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)',
        r'\1\n' + insert_str,
        content,
        count=1
    )
    with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Injected {len(insert_str.splitlines())} MES translations!")
else:
    print("All MES translations are already present.")
