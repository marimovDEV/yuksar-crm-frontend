import os
import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    t_content = f.read()

keys = set()
m = re.search(r'const EXACT_RU_TRANSLATIONS: Record<string, string> = \{(.*?)\};', t_content, re.DOTALL)
if m:
    for line in m.group(1).split('\n'):
        if ':' in line:
            k = line.split(':', 1)[0].strip().strip('"\'')
            keys.add(k)

m2 = re.search(r'const ENTERPRISE_KEYS: Record<string, Record<AppLanguage, string>> = \{(.*?)\};', t_content, re.DOTALL)
if m2:
    for line in m2.group(1).split('\n'):
        if 'uz:' in line:
            m = re.search(r"uz:\s*['\"]([^'\"]+)['\"]", line)
            if m: keys.add(m.group(1))
            # also extract the key string
            k_match = re.match(r"\s*['\"]?([a-zA-Z0-9_\.]+)['\"]?\s*:", line)
            if k_match: keys.add(k_match.group(1))

missing = set()
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                # find t("...") or t('...')
                t_calls = re.findall(r"t\(['\"]([^'\"]+)['\"]\)", content)
                for t in t_calls:
                    if t not in keys:
                        missing.add(t)

for m in sorted(missing):
    print(m)
