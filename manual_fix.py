import re
import urllib.request
import urllib.parse
import json
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

new_lines = []

def translate(text):
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=uz&tl=ru&dt=t&q={urllib.parse.quote(text)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res[0][0][0]
    except Exception as e:
        print("err", text, e)
        return None

count = 0
for line in lines:
    line_strip = line.strip()
    if not line_strip:
        new_lines.append(line)
        continue
    
    match = re.match(r'^\s*"([^"]+)":\s*"([^"]+)",?$', line)
    if not match:
        new_lines.append(line)
        continue
        
    k, v = match.groups()
    if k == v:
        if '/' in k or k.startswith('.') or k.startswith('http') or k in ['a', ',', '.', '-', ' ', 'Items', 'Print', 'Source', 'Actual', 'ONLINE', 'STOP', 'OPERATOR', 'KRITIK']:
            new_lines.append(line)
            continue
            
        translated = translate(k)
        if translated:
            translated = translated.replace('"', '\\"')
            indent = line[:len(line) - len(line.lstrip())]
            new_lines.append(f'{indent}"{k}": "{translated}",')
            count += 1
            print(f"[{count}] {k} -> {translated}")
        else:
            new_lines.append(line)
        time.sleep(0.1)
    else:
        new_lines.append(line)

new_dict_str = '\n'.join(new_lines)
new_content = content[:m.start(2)] + new_dict_str + content[m.end(2):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Manual translation fixed {count} items.")
