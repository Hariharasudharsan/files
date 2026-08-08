import fs from 'fs';
import path from 'path';

const root = 'd:/files';
const srcDir = path.join(root, 'src');

const dirsToMove = ['app', 'components', 'store', 'tests', 'lib', 'types'];

console.log('Moving directories to src...');
for (const dir of dirsToMove) {
  const oldPath = path.join(root, dir);
  const newPath = path.join(srcDir, dir);
  if (fs.existsSync(oldPath)) {
    fs.cpSync(oldPath, newPath, { recursive: true });
    fs.rmSync(oldPath, { recursive: true, force: true });
    console.log(`Moved ${dir} to src/`);
  }
}

console.log('Updating tsconfig.json...');
const tsConfigPath = path.join(root, 'tsconfig.json');
let tsConfig = fs.readFileSync(tsConfigPath, 'utf8');
tsConfig = tsConfig.replace('"@/*": ["./*"]', '"@/*": ["./src/*"]');
fs.writeFileSync(tsConfigPath, tsConfig);
console.log('Updated tsconfig.json');

console.log('Replacing "@/src/" with "@/" in src directory...');
function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name) => {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

let replacedCount = 0;
walkSync(srcDir, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@/src/')) {
      content = content.replace(/@\/src\//g, '@/');
      fs.writeFileSync(filePath, content);
      replacedCount++;
    }
  }
});
console.log(`Replaced in ${replacedCount} files.`);
console.log('Migration complete.');
