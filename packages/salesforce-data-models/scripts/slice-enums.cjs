#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Slices enum and enumNames arrays to a maximum of 30 values
 * to reduce the file size of large schema files.
 * 
 * Usage: node scripts/slice-enums.js <input-file> [output-file]
 */

const MAX_ENUM_LENGTH = 30;

function processNode(node) {
  if (!node || typeof node !== 'object') {
    return;
  }

  // Check if this node has schema with properties
  if (node.data && node.data.schema && node.data.schema.properties) {
    processProperties(node.data.schema.properties);
  }

  // Recursively process arrays
  if (Array.isArray(node)) {
    node.forEach(item => processNode(item));
  } else {
    // Recursively process object properties
    Object.values(node).forEach(value => {
      if (value && typeof value === 'object') {
        processNode(value);
      }
    });
  }
}

function processProperties(properties) {
  for (const [key, prop] of Object.entries(properties)) {
    if (prop && typeof prop === 'object') {
      // Check for enum
      if (Array.isArray(prop.enum) && prop.enum.length > MAX_ENUM_LENGTH) {
        console.log(`Slicing enum for property "${key}" from ${prop.enum.length} to ${MAX_ENUM_LENGTH} values`);
        prop.enum = prop.enum.slice(0, MAX_ENUM_LENGTH);
      }

      // Check for enumNames
      if (Array.isArray(prop.enumNames) && prop.enumNames.length > MAX_ENUM_LENGTH) {
        console.log(`Slicing enumNames for property "${key}" from ${prop.enumNames.length} to ${MAX_ENUM_LENGTH} values`);
        prop.enumNames = prop.enumNames.slice(0, MAX_ENUM_LENGTH);
      }

      // Recursively process nested properties
      if (prop.properties) {
        processProperties(prop.properties);
      }

      // Process items in array schemas
      if (prop.items && prop.items.properties) {
        processProperties(prop.items.properties);
      }
    }
  }
}

function sliceEnums(inputFile, outputFile) {
  console.log(`Reading ${inputFile}...`);
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  const originalSize = JSON.stringify(data).length;
  console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\nProcessing enums...');
  
  // Process nodes
  if (data.nodes) {
    data.nodes.forEach(node => processNode(node));
  }
  
  // Process edges (if any have schemas)
  if (data.edges) {
    data.edges.forEach(edge => processNode(edge));
  }
  
  const newSize = JSON.stringify(data).length;
  const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
  
  console.log(`\nNew size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Size reduction: ${savings}%`);
  
  console.log(`\nWriting to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
  console.log('Done!');
}

// Main
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node slice-enums.js <input-file> [output-file]');
  process.exit(1);
}

const inputFile = path.resolve(args[0]);
const outputFile = args[1] ? path.resolve(args[1]) : inputFile;

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

sliceEnums(inputFile, outputFile);

