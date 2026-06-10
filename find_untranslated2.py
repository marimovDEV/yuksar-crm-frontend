import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract ENTERPRISE_KEYS block
match = re.search(r'const ENTERPRISE_KEYS: Record<string, Record<AppLanguage, string>> = \{(.*?)\};', content, re.DOTALL)
if match:
    block = match.group(1)
    lines = block.split('\n')
    untranslated = []
    for line in lines:
        if 'ru:' in line:
            # find ru: '...'
            m = re.search(r"ru:\s*['\"]([^'\"]+)['\"]", line)
            if m:
                val = m.group(1)
                if not re.search(r'[А-Яа-яЁё]', val):
                    untranslated.append(val)
                
    for v in untranslated:
        print(v)
