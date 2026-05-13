
import re

def clean_translations(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the EXACT_RU_TRANSLATIONS object
    match = re.search(r'const EXACT_RU_TRANSLATIONS: Record<string, string> = \{(.*?)\};', content, re.DOTALL)
    if not match:
        print("Could not find EXACT_RU_TRANSLATIONS object")
        return

    translations_str = match.group(1)
    
    # Split by lines and parse keys
    lines = translations_str.split('\n')
    seen_keys = set()
    new_lines = []
    
    # Regex to match "Key": "Value", or 'Key': 'Value',
    key_regex = re.compile(r'^\s*["\'](.*?)["\']\s*:')
    
    for line in lines:
        if not line.strip():
            new_lines.append(line)
            continue
            
        key_match = key_regex.search(line)
        if key_match:
            key = key_match.group(1)
            if key in seen_keys:
                print(f"Removing duplicate key: {key}")
                continue
            seen_keys.add(key)
        
        new_lines.append(line)

    new_translations_str = '\n'.join(new_lines)
    new_content = content.replace(translations_str, new_translations_str)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == "__main__":
    clean_translations('/Users/ogabek/Documents/projects/new penoplast/yuksar/frontend/src/i18n/translations.ts')
