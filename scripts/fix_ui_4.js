const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'app/account/orders/[id]/page.tsx',
    rules: [
      { from: /order\.paymentStatus === 'paid'/g, to: 'order.paymentStatus === "PAID"' },
      { from: /order\.items\.map\(\(item\)/g, to: 'order.items.map((item: any)' },
      { from: /const shipment = \[\]\[0\];/g, to: 'const shipment = (order.shipments && order.shipments.length > 0) ? order.shipments[0] : null;' },
      { from: /const payment = \[\]\[0\];/g, to: 'const payment = (order.payments && order.payments.length > 0) ? order.payments[0] : null;' }
    ]
  },
  {
    file: 'app/admin/sync-logs/page.tsx',
    rules: [
      { from: /new Date\(\(log\.createdAt\)/g, to: 'String(log.createdAt' }
    ]
  },
  {
    file: 'app/admin/webhooks/page.tsx',
    rules: [
      { from: /new Date\(\(webhook\.createdAt\)/g, to: 'String(webhook.createdAt' },
      { from: /new Date\(\(webhook\.processedAt\)/g, to: 'webhook.processedAt ? String(webhook.processedAt' },
      { from: /'MMM d, yyyy HH:mm:ss'\)/g, to: ')' }
    ]
  },
  {
    file: 'app/category/[slug]/page.tsx',
    rules: [
      { from: /product: any/g, to: 'product: any' }
    ]
  },
  {
    file: 'app/page.tsx',
    rules: [
      { from: /product: any/g, to: 'product: any' }
    ]
  },
  {
    file: 'app/search/page.tsx',
    rules: [
      { from: /p: any/g, to: 'p: any' },
      { from: /product: any/g, to: 'product: any' }
    ]
  },
  {
    file: 'mnt/user-data/outputs/mathuram-foods/app/checkout/page.tsx',
    rules: [
      { from: /item\.standard_rate/g, to: 'item.price' }
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
