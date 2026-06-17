import re
from deep_translator import GoogleTranslator
import time

file_path = 'src/i18n/translations.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)(.*?)(\};)', content, re.DOTALL)
if not m:
    print("Could not find EXACT_RU_TRANSLATIONS")
    exit(1)

dict_str = m.group(2)
lines = dict_str.split('\n')

to_translate = []
line_indices = []

for i, line in enumerate(lines):
    line_strip = line.strip()
    if not line_strip:
        continue
    match = re.match(r'^\s*"([^"]+)":\s*"([^"]+)",?$', line)
    if match:
        k, v = match.groups()
        if k == v:
            if '/' in k or k.startswith('.') or k.startswith('http') or k in ['a', ',', '.', '-', ' ', 'Items', 'Print', 'Source', 'Actual', 'ONLINE', 'STOP', 'OPERATOR', 'KRITIK']:
                continue
            to_translate.append(k)
            line_indices.append((i, k))

print(f"Found {len(to_translate)} strings to translate.")

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

new_lines = list(lines)
for idx, key in line_indices:
    if key in translated_dict:
        indent = lines[idx][:len(lines[idx]) - len(lines[idx].lstrip())]
        new_lines[idx] = f'{indent}"{key}": "{translated_dict[key]}",'

new_dict_str = '\n'.join(new_lines)
new_content = content[:m.start(2)] + new_dict_str + content[m.end(2):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fast translation completed.")
