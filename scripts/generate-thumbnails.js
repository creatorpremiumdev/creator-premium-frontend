// scripts/generate-thumbnails.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = './public/demo-images';
const outputQuality = 30; // 30% quality for thumbnails
const maxWidth = 600; // Max width in pixels

// Get all collection folders
const items = fs.readdirSync(baseDir);
const collectionFolders = items.filter(item => {
  const itemPath = path.join(baseDir, item);
  return fs.statSync(itemPath).isDirectory() && item.startsWith('collection');
});

console.log(`Found ${collectionFolders.length} collection folders to process...\n`);

let totalProcessed = 0;
let totalErrors = 0;

// Process each collection folder
collectionFolders.forEach((collectionFolder, folderIndex) => {
  const collectionPath = path.join(baseDir, collectionFolder);
  const thumbsPath = path.join(baseDir, 'thumbs', collectionFolder);
  
  // Create thumbs directory if it doesn't exist
  if (!fs.existsSync(thumbsPath)) {
    fs.mkdirSync(thumbsPath, { recursive: true });
    console.log(`Created directory: ${thumbsPath}`);
  }
  
  // Get all JPG images in the collection
  const images = fs.readdirSync(collectionPath).filter(f => 
    f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg')
  );
  
  console.log(`Processing ${collectionFolder}: ${images.length} images`);
  
  // Process each image
  images.forEach((image, imageIndex) => {
    const inputPath = path.join(collectionPath, image);
    const outputPath = path.join(thumbsPath, image);
    
    // Skip if thumbnail already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  ⏭️  Skipped: ${image} (already exists)`);
      return;
    }
    
    sharp(inputPath)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: outputQuality,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath)
      .then(info => {
        const originalSize = fs.statSync(inputPath).size;
        const newSize = info.size;
        const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
        
        totalProcessed++;
        console.log(`  ✅ ${image}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${savings}% smaller)`);
      })
      .catch(err => {
        totalErrors++;
        console.error(`  ❌ Error processing ${image}:`, err.message);
      });
  });
  
  console.log(''); // Empty line between collections
});

// Summary after a delay to let async operations complete
setTimeout(() => {
  console.log('\n========================================');
  console.log('GENERATION COMPLETE');
  console.log(`✅ Successfully processed: ${totalProcessed} images`);
  if (totalErrors > 0) {
    console.log(`❌ Errors: ${totalErrors} images`);
  }
  console.log('========================================\n');
}, 3000);