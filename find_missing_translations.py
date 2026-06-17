import os
import re

translations_file = "src/i18n/translations.ts"
with open(translations_file, "r") as f:
    translations_content = f.read()

# Extract keys from translations.ts
# Matches "Key Name": "Value"
keys = set(re.findall(r'"([^"]+)"\s*:', translations_content))
keys.update(re.findall(r"'([^']+)'\s*:", translations_content))

missing = set()

# Scan all TSX files
for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            with open(os.path.join(root, file), "r") as f:
                content = f.read()
                # Find all t('some string') or t("some string") or t(`some string`)
                matches = re.findall(r't\((["\'])(.*?)\1\)', content)
                for match in matches:
                    text = match[1]
                    if text not in keys and not text.startswith("users/") and text != "":
                        missing.add(text)

with open("missing_translations_report.txt", "w") as f:
    for m in sorted(list(missing)):
        f.write(f'"{m}": "",\n')

print(f"Found {len(missing)} missing translations. Wrote to missing_translations_report.txt")
