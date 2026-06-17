import re

trans_file = "src/i18n/translations.ts"
with open(trans_file, "r") as f:
    lines = f.readlines()

# List of keys that ESBuild warned about
bad_keys = [
    "3. Ta\\'minot & Xarid",
    "Foydalanish qo\\'llanmasi",
    "Ichki O\\'tkazmalar",
    "O\\'tkazmalar",
    "Ta\\'minotchilar",
]

new_lines = []
for line in lines:
    should_delete = False
    for bk in bad_keys:
        if f'"{bk}": "{bk}"' in line or f"'{bk}': '{bk}'" in line:
            should_delete = True
            print(f"Deleting line: {line.strip()}")
            break
    if not should_delete:
        new_lines.append(line)

with open(trans_file, "w") as f:
    f.writelines(new_lines)
