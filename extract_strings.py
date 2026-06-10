import os
import re
from collections import Counter

# Read translations
with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    t_content = f.read()

# Get keys from EXACT_RU_TRANSLATIONS
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

# Search TSX files
found = Counter()
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Simple regex to find JSX text: >Text<
                texts = re.findall(r'>([^<>{]+)<', content)
                for t in texts:
                    t = t.strip()
                    # ignore numbers, empty, very short
                    if len(t) > 2 and not t.isdigit() and not re.match(r'^[\W_]+$', t):
                        if t not in keys:
                            found[t] += 1

print("Top 50 missing translations:")
for k, v in found.most_common(50):
    print(f"{v} occurrences: {k}")

