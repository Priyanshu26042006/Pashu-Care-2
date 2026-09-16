import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');

function findZipFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findZipFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.zip')) {
      results.push(path.relative(process.cwd(), fullPath));
    }
  }
  return results;
}

const zipFiles = findZipFiles(publicDir);

if (zipFiles.length > 0) {
  console.error('\n\x1b[31m[BUILD ERROR] Forbidden .zip archive detected in public/ directory:\x1b[0m');
  for (const file of zipFiles) {
    console.error(`  - ${file}`);
  }
  console.error('\x1b[31mPolicy restriction: .zip files must not be stored in the public/ folder.\x1b[0m\n');
  process.exit(1);
}
