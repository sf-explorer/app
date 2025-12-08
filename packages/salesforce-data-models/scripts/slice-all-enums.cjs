#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Processes all JSON data models to slice large enum arrays
 */

const DATA_DIR = path.join(__dirname, '../data');
const SCRIPT_PATH = path.join(__dirname, 'slice-enums.cjs');

function processAllFiles() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  
  console.log(`Found ${files.length} JSON files to process\n`);
  
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${file}`);
    console.log('='.repeat(60));
    
    try {
      const originalSize = fs.statSync(filePath).size;
      totalOriginalSize += originalSize;
      
      execSync(`node "${SCRIPT_PATH}" "${filePath}"`, { stdio: 'inherit' });
      
      const newSize = fs.statSync(filePath).size;
      totalNewSize += newSize;
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total new size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total reduction: ${((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2)}%`);
}

processAllFiles();

