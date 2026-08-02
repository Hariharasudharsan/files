const fs = require('fs');

let pg = fs.readFileSync('lib/integrations/search/postgres-adapter.ts', 'utf8');
pg = pg.replace(/inventory: p\.availableStock/g, 'availableStock: p.availableStock');
fs.writeFileSync('lib/integrations/search/postgres-adapter.ts', pg);

let s3 = fs.readFileSync('lib/integrations/storage/s3-adapter.ts', 'utf8');
s3 = s3.replace(/return await data\.Body\?\.transformToString\(\) \|\| "";/g, 'const str = await data.Body?.transformToString(); return str || "";');
fs.writeFileSync('lib/integrations/storage/s3-adapter.ts', s3);
