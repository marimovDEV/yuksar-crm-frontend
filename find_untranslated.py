import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract EXACT_RU_TRANSLATIONS block
match = re.search(r'const EXACT_RU_TRANSLATIONS: Record<string, string> = \{(.*?)\};', content, re.DOTALL)
if match:
    block = match.group(1)
    lines = block.split('\n')
    untranslated = []
    for line in lines:
        if ':' in line:
            parts = line.split(':', 1)
            key = parts[0].strip()
            val = parts[1].strip().strip(',').strip()
            # Remove quotes
            if val.startswith('"') and val.endswith('"'): val = val[1:-1]
            elif val.startswith("'") and val.endswith("'"): val = val[1:-1]
            
            # Check if there's no cyrillic
            if not re.search(r'[А-Яа-яЁё]', val):
                untranslated.append((key, val))
                
    for k, v in untranslated:
        print(f"{k}: {v}")
