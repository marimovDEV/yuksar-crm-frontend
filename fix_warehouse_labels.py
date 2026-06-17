import re
file_path = "src/components/workspaces/WarehouseWorkspace.tsx"
with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    r"label: 'Ombor qoldig‘i'": r'label: t("Ombor qoldig\'i")',
    r"label: 'Kiruvchi \(Intake\)'": r'label: t("Kiruvchi (Intake)")',
    r"label: 'Transferlar'": r'label: t("Transferlar")',
    r"label: 'Bugungi ishlar'": r'label: t("Bugungi ishlar")',
    r"label: 'Alarmlar'": r'label: t("Alarmlar")',
    r"label: \"Navbatdagi o'tkazmalar\"": r'label: t("Navbatdagi o\'tkazmalar")'
}
for k, v in replacements.items():
    content = re.sub(k, v, content)
with open(file_path, 'w') as f:
    f.write(content)
