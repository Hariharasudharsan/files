import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'products.json');
const raw = fs.readFileSync(dataPath, 'utf-8');
const products = JSON.parse(raw);

products.forEach(p => {
  if (p.imageUrl) {
    p.image = p.imageUrl;
    delete p.imageUrl;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
console.log('Fixed JSON property names!');
