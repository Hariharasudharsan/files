const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Since we are in Node without glob easily installed, we can just write a simple recursive function
function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles(path.join(__dirname, 'app'), /\.tsx?$/).concat(
  findFiles(path.join(__dirname, 'components'), /\.tsx?$/)
);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // Replace usages in Product objects
  content = content.replace(/(\w+)\.item_name/g, '$1.name');
  content = content.replace(/(\w+)\.item_code/g, '$1.variants[0]?.item_code');
  content = content.replace(/(\w+)\.standard_rate/g, '$1.variants[0]?.price');
  content = content.replace(/(\w+)\.image/g, '$1.variants[0]?.image');
  content = content.replace(/(\w+)\.item_group/g, '($1 as any).category?.name || "Category"');

  // Specific fix for CartItem which has flat properties
  content = content.replace(/(\w+)\.variants\[0\]\?\.item_code/g, (match, p1) => {
    // If it's a cart item, it has item_code directly now because it extends ProductVariant
    // We can't know for sure, so we might just use a getter or let TS guide us.
    // Let's rely on standard_rate -> price first.
    return match; // We'll do this more carefully
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
