import re

file_path = "src/components/SuperAdminCenter.tsx"
with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r'>Rollar<': r'>{t("Rollar")}<',
    r'>Audit log<': r'>{t("Audit log")}<',
    r'>Xavfsizlik<': r'>{t("Xavfsizlik")}<',
    r'>Tizim boshqaruvi<': r'>{t("Tizim boshqaruvi")}<',
    r'>Barcha statuslar<': r'>{t("Barcha statuslar")}<',
    r'>\+ Yangi foydalanuvchi<': r'>{t("+ Yangi foydalanuvchi")}<',
    r'>Tahrir<': r'>{t("Tahrir")}<',
    r"placeholder='Ism, username yoki telefon bo`yicha qidirish\.\.\.'": r"placeholder={t('Ism, username yoki telefon bo`yicha qidirish...')}",
    r"placeholder=\"Ism, username yoki telefon bo'yicha qidirish\.\.\.\"": r"placeholder={t(\"Ism, username yoki telefon bo'yicha qidirish...\")}",
    r'>Kirish<': r'>{t("Kirish")}<',
    r'>Vhod<': r'>{t("Kirish")}<', # In case there's "Kirish/Vhod"
    r'>Kirish/Vhod<': r'>{t("Kirish/Vhod")}<',
    r"value='Barcha statuslar'": r"value={t('Barcha statuslar')}",
    r"value=\"Barcha statuslar\"": r"value={t(\"Barcha statuslar\")}",
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

with open(file_path, 'w') as f:
    f.write(content)

