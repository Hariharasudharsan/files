const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'app/account/orders/[id]/page.tsx',
    rules: [
      { from: /product: true/g, to: 'productVariant: true' }
    ]
  },
  {
    file: 'app/checkout/CheckoutClient.tsx',
    rules: [
      { from: /item\.standard_rate/g, to: 'item.price' }
    ]
  },
  {
    file: 'app/search/page.tsx',
    rules: [
      { from: /p\.item_name/g, to: 'p.name' },
      { from: /p\.item_group/g, to: '(p.category?.name || "")' }
    ]
  },
  {
    file: 'components/AddToCartButton.tsx',
    rules: [
      { from: /\(product, 1\)/g, to: '(product as any, 1)' } // simple any cast for ui button
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
