import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceFile = join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const targetDir = join(__dirname, '../static/pdf.js/build');
const targetFile = join(targetDir, 'pdf.worker.min.js');

try {
  // Ensure target directory exists
  mkdirSync(targetDir, { recursive: true });

  // Copy the worker file
  copyFileSync(sourceFile, targetFile);

  console.log('✅ PDF.js worker copied successfully');
  console.log(`   From: ${sourceFile}`);
  console.log(`   To: ${targetFile}`);
} catch (error) {
  console.error('❌ Failed to copy PDF.js worker:', error.message);
  process.exit(1);
}
