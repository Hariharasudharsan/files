const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'lib/integrations/erp/erpnext/mappers.ts',
    rules: [
      { from: /i\.item_code/g, to: 'i.productVariantId' },
      { from: /item_code: i\.productVariantId/g, to: 'item_code: i.productVariantId' } // ensuring it maps back to ERPNext format if needed
    ]
  },
  {
    file: 'lib/repositories/order-repository.ts',
    rules: [
      { from: /i\.item_code/g, to: 'i.productVariantId' },
      { from: /item_code: i\.productVariantId/g, to: 'productVariantId: i.productVariantId' }
    ]
  },
  {
    file: 'lib/validation/orders.ts',
    rules: [
      { from: /item_code:/g, to: 'productVariantId:' }
    ]
  },
  {
    file: 'app/search/page.tsx',
    rules: [
      { from: /\(p\.category\?\./g, to: '((p as any).category?.' }
    ]
  }
];

for (const rep of replacements) {
  const filePath = path.join(__dirname, rep.file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  
  for (const rule of rep.rules) {
    content = content.replace(rule.from, rule.to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}
