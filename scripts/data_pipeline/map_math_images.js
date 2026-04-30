const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'public', 'db', 'wordlist_math.json');
const outDir = path.join(__dirname, '..', '..', 'public', 'db', 'math');

console.log('Reading wordlist_math.json...');
let wordsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let mappedCount = 0;

wordsData = wordsData.map(item => {
  // Map any valid word that has an image
  if (item.word && item.word.trim() !== '') {
    const safeWord = item.word.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const imageFilename = `${safeWord}.png`;
    const imagePath = path.join(outDir, imageFilename);
    
    // If the image file was successfully generated, map it
    if (fs.existsSync(imagePath)) {
      item.image = `db/math/${imageFilename}`;
      mappedCount++;
    }
  }
  return item;
});

fs.writeFileSync(dataPath, JSON.stringify(wordsData, null, 2), 'utf8');
console.log(`Successfully mapped ${mappedCount} images to wordlist_math.json!`);
