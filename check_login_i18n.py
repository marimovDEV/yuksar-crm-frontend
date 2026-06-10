import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

keys_to_check = [
    "Boshqaruv Paneli",
    "Tizim Logini",
    "Loginni kiriting",
    "Maxfiy Parol",
    "Tizimga Kirish",
    "Hisobingiz yo'qmi? Iltimos, administratorga murojaat qiling.",
    "Sessiya tekshirilmoqda...",
    "Industrial Management"
]

for key in keys_to_check:
    if f'"{key}"' in content or f"'{key}'" in content or f'`{key}`' in content:
        print(f"✅ FOUND: {key}")
    else:
        print(f"❌ MISSING: {key}")
