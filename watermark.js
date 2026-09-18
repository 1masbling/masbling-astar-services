
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 🛠️ CONFIGURATION DIRECTORIES
const INPUT_DIR = './images/raw'; // Put your original phone photos here
const OUTPUT_DIR = './images/showcase'; // Watermarked photos will save here
const LOGO_PATH = './images/logo.png'; // Path to your transparent business logo
const LOGO_WIDTH_PERCENT = 0.20; // Logo will take up 20% of the image width

async function addWatermark() {
  try {
    // Make sure output folder exists
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Read all files from raw images folder
    const files = fs.readdirSync(INPUT_DIR).filter(file => 
      ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
    );

    if (files.length === 0) {
      console.log('No raw photos found to watermark.');
      return;
    }

    // Get logo dimensions
    const logoMetadata = await sharp(LOGO_PATH).metadata();

    for (const file of files) {
      const inputFilePath = path.join(INPUT_DIR, file);
      const outputFilePath = path.join(OUTPUT_DIR, file);

      // Get background image dimensions
      const imageMetadata = await sharp(inputFilePath).metadata();
      const targetLogoWidth = Math.round(imageMetadata.width * LOGO_WIDTH_PERCENT);
      const targetLogoHeight = Math.round(logoMetadata.height * (targetLogoWidth / logoMetadata.width));

      // Resize logo to fit nicely and make it slightly transparent
      const resizedLogoBuffer = await sharp(LOGO_PATH)
        .resize(targetLogoWidth, targetLogoHeight)
        .ensureAlpha(0.6) // 60% opacity so it blends nicely
        .toBuffer();

      // Calculate bottom-right corner position (with 20px padding)
      const leftPosition = imageMetadata.width - targetLogoWidth - 20;
      const topPosition = imageMetadata.height - targetLogoHeight - 20;

      // Overlay logo onto the photo
      await sharp(inputFilePath)
        .composite([{ input: resizedLogoBuffer, top: topPosition, left: leftPosition }])
        .toFile(outputFilePath);

      console.log(`✅ Watermarked: ${file}`);
    }
  } catch (error) {
    console.error('❌ Error processing watermarks:', error);
  }
}

addWatermark();
