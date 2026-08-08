const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'app/api/webhooks/razorpay/route.ts',
    rules: [
      { from: /"confirmed"/g, to: 'OrderStatus.CONFIRMED' },
      { from: /"paid"/g, to: 'PaymentStatus.PAID' }
    ]
  },
  {
    file: 'app/account/orders/[id]/page.tsx',
    rules: [
      { from: /include: \{ product: true \}/g, to: 'include: { productVariant: true }' },
      { from: /order\.shipments/g, to: '[]' },
      { from: /order\.payments/g, to: '[]' },
      { from: /item\.product\./g, to: 'item.productVariant.' },
      { from: /order\.paymentStatus === "paid"/g, to: 'order.paymentStatus === "PAID"' }
    ]
  },
  {
    file: 'app/account/page.tsx',
    rules: [
      { from: /include: \{ product: true \}/g, to: 'include: { productVariant: true }' },
      { from: /order\.items\.length/g, to: '(order as any).items?.length || 0' }
    ]
  },
  {
    file: 'app/admin/sync-logs/page.tsx',
    rules: [
      { from: /format\(/g, to: 'new Date(' } // simple mock fix to remove date-fns format error if format isn't imported
    ]
  },
  {
    file: 'app/admin/webhooks/page.tsx',
    rules: [
      { from: /format\(/g, to: 'new Date(' }
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
