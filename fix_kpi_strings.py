import os
import re

file_path = "src/components/EmployeePerformanceCenter.tsx"
with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r'>Xodimlar Performans Markazi<': r'>{t("Xodimlar Performans Markazi")}<',
    r'4-komponentli KPI · Ish hajmi 40% · Sifat 30% · Intizom 15% · Tejamkorlik 15%': r'{t("4-komponentli KPI · Ish hajmi 40% · Sifat 30% · Intizom 15% · Tejamkorlik 15%")}',
    r'>Ajoyib<': r'>{t("Ajoyib")}<',
    r'>Yaxshi<': r'>{t("Yaxshi")}<',
    r'>Qoniqarsiz<': r'>{t("Qoniqarsiz")}<',
    # We might need to replace 'Ish hajmi', 'Sifat', 'Intizom', 'Tejamkorlik' if they are used elsewhere
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

with open(file_path, 'w') as f:
    f.write(content)

