const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'app/category/[slug]/page.tsx',
    rules: [
      { from: /product\.item_code/g, to: 'product.id' }
    ]
  },
  {
    file: 'app/checkout/CheckoutClient.tsx',
    rules: [
      { from: /item\.item_code/g, to: 'item.item_code' }, // Already handled in CartItem
      { from: /item\.standard_rate/g, to: 'item.price' },
      { from: /item\.item_name/g, to: 'item.product_name' }
    ]
  },
  {
    file: 'app/page.tsx',
    rules: [
      { from: /product\.item_code/g, to: 'product.id' }
    ]
  },
  {
    file: 'app/product/[slug]/page.tsx',
    rules: [
      { from: /product\.image/g, to: 'product.variants[0]?.image' },
      { from: /product\.item_name/g, to: 'product.name' },
      { from: /product\.item_group/g, to: '"Category"' },
      { from: /product\.standard_rate/g, to: 'product.variants[0]?.price' },
      { from: /addItem\(product\)/g, to: 'addItem(product, product.variants[0])' } // Adding variant explicitly
    ]
  },
  {
    file: 'app/search/page.tsx',
    rules: [
      { from: /product\.item_name/g, to: 'product.name' },
      { from: /product\.item_group/g, to: '"Category"' },
      { from: /product\.item_code/g, to: 'product.id' }
    ]
  },
  {
    file: 'mnt/user-data/outputs/mathuram-foods/app/checkout/page.tsx',
    rules: [
      { from: /item\.item_code/g, to: 'item.item_code' },
      { from: /item\.standard_rate/g, to: 'item.price' }
    ]
  }
];

for (const rep of replacements) {
  const filePath = path.join(__dirname, rep.file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - not found`);
    continue;
  }
  
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
