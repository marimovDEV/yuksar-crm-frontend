import re
import os
import time
from deep_translator import GoogleTranslator

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

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
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
    if m.startswith('telemetry') or m.startswith('production/'): continue
    to_translate.append(m)

print(f"Translating {len(to_translate)} strings...")

translator = GoogleTranslator(source='uz', target='ru')
translated_dict = {}

batch_size = 50
for i in range(0, len(to_translate), batch_size):
    batch = to_translate[i:i+batch_size]
    try:
        results = translator.translate_batch(batch)
        for original, trans in zip(batch, results):
            if trans:
                translated_dict[original] = trans.replace('"', '\\"')
        time.sleep(1)
    except Exception as e:
        print(f"Error at batch {i}: {e}")

insert_str = ""
for k, v in translated_dict.items():
    insert_str += f'  "{k}": "{v}",\n'

new_content = re.sub(
    r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)',
    r'\1\n' + insert_str,
    content,
    count=1
)

with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Translation and injection complete.")
