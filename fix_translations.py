import re
import requests
import time
import json
import os

file_path = 'src/i18n/translations.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'(const EXACT_RU_TRANSLATIONS: Record<string, string> = \{)(.*?)(\};)', content, re.DOTALL)
if not m:
    print("Could not find EXACT_RU_TRANSLATIONS")
    exit(1)

dict_str = m.group(2)
lines = dict_str.split('\n')

new_lines = []
for line in lines:
    line_strip = line.strip()
    if not line_strip:
        new_lines.append(line)
        continue
    
    # check if key == value
    match = re.match(r'^\s*"([^"]+)":\s*"([^"]+)",?$', line)
    if not match:
        new_lines.append(line)
        continue
        
    k, v = match.groups()
    if k == v:
        # Ignore endpoints and URLs
        if '/' in k or k.startswith('.') or k.startswith('http'):
            new_lines.append(line)
            continue
            
        if k in ['a', ',', '.', '-', ' ', 'Items', 'Print', 'Source', 'Actual', 'ONLINE', 'STOP', 'OPERATOR', 'KRITIK']:
            new_lines.append(line)
            continue

        try:
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=uz&tl=ru&dt=t&q={requests.utils.quote(k)}"
            response = requests.get(url, timeout=5)
            result = response.json()
            translated = result[0][0][0]
            translated = translated.replace('"', '\\"')
            
            # preserve original indent
            indent = line[:len(line) - len(line.lstrip())]
            new_line = f'{indent}"{k}": "{translated}",'
            new_lines.append(new_line)
            print(f"{k} -> {translated}")
            time.sleep(0.3)
        except Exception as e:
            print(f"Error translating {k}: {e}")
            new_lines.append(line)
    else:
        new_lines.append(line)

new_dict_str = '\n'.join(new_lines)
new_content = content[:m.start(2)] + new_dict_str + content[m.end(2):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Translation fixed.")
