import fs from 'fs';
import path from 'path';

const projectRoot = '/vercel/share/v0-project';

const dirsToRemove = [
  'node_modules',
  '.next',
  '.turbo'
];

const filesToRemove = [
  'pnpm-lock.yaml'
];

console.log('[v0] Starting cleanup...');

// Remove directories
for (const dir of dirsToRemove) {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`[v0] Removing ${dir}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Remove files
for (const file of filesToRemove) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`[v0] Removing ${file}...`);
    fs.unlinkSync(filePath);
  }
}

console.log('[v0] Cleanup completed! Dependencies will be reinstalled automatically.');
