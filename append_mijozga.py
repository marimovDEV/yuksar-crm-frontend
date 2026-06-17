trans_path = "src/i18n/translations.ts"
with open(trans_path, 'r') as f:
    trans_content = f.read()

if '"Mijozga Ko\'rsatish"' not in trans_content:
    parts = trans_content.rsplit("};", 1)
    new_content = parts[0] + '  "Mijozga Ko\'rsatish": "ПОКАЗАТЬ КЛИЕНТУ",\n};' + parts[1]
    with open(trans_path, 'w') as f:
        f.write(new_content)
    print("Added Mijozga Ko'rsatish")
