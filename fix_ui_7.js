const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'lib/integrations/erp/erpnext/mappers.ts',
    rules: [
      { from: /item_code: item\.item_code/g, to: 'item_code: item.productVariantId' }
    ]
  },
  {
    file: 'lib/repositories/order-repository.ts',
    rules: [
      { from: /itemCode: item\.item_code/g, to: 'id: item.productVariantId' },
      { from: /item_code \$\{item\.item_code\}/g, to: 'productVariantId ${item.productVariantId}' }
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
