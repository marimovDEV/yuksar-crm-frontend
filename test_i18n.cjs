const fs = require('fs');
const content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const regex = /^\s*["']([^"']+)["']\s*:\s*["']([^"']+)["'],?/gm;
const exactMapRu = new Map();
let match;
while ((match = regex.exec(content)) !== null) {
  exactMapRu.set(canonicalize(match[1]), match[2]);
}

function canonicalize(text) {
  return text
    .replace(/[’`ʻʼ]/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function testTranslation(text) {
  const can = canonicalize(text);
  const trans = exactMapRu.get(can);
  console.log(`"${text}" -> [${can}] -> "${trans}"`);
}

testTranslation("3. Ta'minot & Xarid");
testTranslation("Foydalanish qo'llanmasi");
testTranslation("Ichki O'tkazmalar");

