import re

trans_file = "src/i18n/translations.ts"

with open(trans_file, "r") as f:
    lines = f.readlines()

seen_keys = set()
cleaned_lines = []

for line in lines:
    match = re.search(r'^\s*["\']([^"\']+)["\']\s*:', line)
    if match:
        key = match.group(1)
        if key in seen_keys:
            # Skip duplicate
            continue
        seen_keys.add(key)
    cleaned_lines.append(line)

with open(trans_file, "w") as f:
    f.writelines(cleaned_lines)

print("Duplicates removed.")
