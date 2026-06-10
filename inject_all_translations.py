import re
import os
import glob

workspace_files = glob.glob('src/components/workspaces/*.tsx')
other_files = glob.glob('src/components/*.tsx')
files_to_check = workspace_files + other_files

all_translations = set()
for f_path in files_to_check:
    if not os.path.exists(f_path):
        continue
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = re.findall(r't\(\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
        all_translations.update(matches)

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

insert_str = ""
for k in all_translations:
    # Escape quotes
    k_escaped = k.replace('"', '\\"')
    if f'"{k}":' not in content and f"'{k}':" not in content and f'"{k_escaped}":' not in content:
        insert_str += f'  "{k_escaped}": "{k_escaped}",\n'

if insert_str:
    new_content = re.sub(
        r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)',
        r'\1\n' + insert_str,
        content,
        count=1
    )
    with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Injected {len(insert_str.splitlines())} new translations!")
else:
    print("All translations are already present.")
