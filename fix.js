const fs = require('fs');
const glob = require('glob');

const files = glob.sync('**/*.ts*', { 
  ignore: ['node_modules/**', '.next/**', 'generated/**', 'dist/**'],
  cwd: process.cwd(),
  absolute: true
});

let modified = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace retry Logger
  if (file.endsWith('retry.ts')) {
    content = content.replace(/Logger\.warn/g, 'logger.warn');
    content = content.replace(/Logger\.error/g, 'logger.error');
    changed = true;
  }

  // Replace new PrismaClient()
  if (content.includes('new PrismaClient(')) {
    content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+["']@prisma\/client["'];?\r?\n?/g, '');
    content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+["']@\/generated\/prisma\/client["'];?\r?\n?/g, '');
    
    // Sometimes it's let prisma = new PrismaClient(); or const prisma = new PrismaClient();
    content = content.replace(/(const|let)\s+prisma\s*=\s*new\s+PrismaClient\([^)]*\);?/g, 'import { prisma } from "@/lib/infrastructure/database/prisma";');
    
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
    modified++;
  }
}

console.log(`Modified ${modified} files.`);
