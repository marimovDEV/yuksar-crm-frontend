import re
import os

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Get existing keys
keys = set()
m = re.search(r'const EXACT_RU_TRANSLATIONS: Record<string, string> = \{(.*?)\};', content, re.DOTALL)
if m:
    for line in m.group(1).split('\n'):
        if ':' in line:
            k = line.split(':', 1)[0].strip().strip('"\'')
            keys.add(k)

m2 = re.search(r'const ENTERPRISE_KEYS: Record<string, Record<AppLanguage, string>> = \{(.*?)\};', content, re.DOTALL)
if m2:
    for line in m2.group(1).split('\n'):
        if 'uz:' in line:
            m = re.search(r"uz:\s*['\"]([^'\"]+)['\"]", line)
            if m: keys.add(m.group(1))
            k_match = re.match(r"\s*['\"]?([a-zA-Z0-9_\.]+)['\"]?\s*:", line)
            if k_match: keys.add(k_match.group(1))

missing = set()
warehouse_files = [
    "src/components/workspaces/WarehouseWorkspace.tsx",
    "src/components/WarehouseUnified.tsx",
    "src/components/warehouse/SK1RawMaterial.tsx",
    "src/components/warehouse/WarehouseMap.tsx",
    "src/components/warehouse/WasteWarehouse.tsx",
    "src/components/warehouse/WarehouseAnalytics.tsx",
    "src/components/warehouse/WarehouseTransfers.tsx",
    "src/components/warehouse/SK34Storage.tsx",
    "src/components/warehouse/SK2BlockStorage.tsx",
    "src/components/warehouse/CycleCounting.tsx",
    "src/pages/Warehouse.tsx"
]

for file in warehouse_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            text_content = f.read()
            t_calls = re.findall(r"t\(['\"]([^'\"]+)['\"]\)", text_content)
            for t in t_calls:
                if t not in keys and not re.match(r'^[\d\W_]+$', t):
                    missing.add(t)
                    
            texts = re.findall(r'>([^<>{]+)<', text_content)
            for t in texts:
                t = t.strip()
                if len(t) > 2 and not t.isdigit() and not re.match(r'^[\d\W_]+$', t):
                    if t not in keys:
                        missing.add(t)

to_translate = []
for m in sorted(missing):
    if '/' in m or '_' in m and ' ' not in m: continue 
    to_translate.append(m)

print("MISSING WAREHOUSE KEYS:")
for k in to_translate:
    print(k)
