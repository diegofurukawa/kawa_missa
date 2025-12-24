const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.jpeg');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Icon sizes for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 16, name: 'icon-16x16.png' },
];

// Apple touch icon
const appleIcon = { size: 180, name: 'apple-touch-icon.png', outputDir: '../public' };

async function generateIcons() {
  console.log('🎨 Generating PWA icons from logo.jpeg...\n');

  try {
    // Generate standard icons
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(ICONS_DIR, name);

      await sharp(LOGO_PATH)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 246, g: 245, b: 248, alpha: 1 } // #f6f5f8
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Created ${name} (${size}x${size})`);
    }

    // Generate Apple touch icon
    const appleTouchPath = path.join(__dirname, appleIcon.outputDir, appleIcon.name);
    await sharp(LOGO_PATH)
      .resize(appleIcon.size, appleIcon.size, {
        fit: 'contain',
        background: { r: 246, g: 245, b: 248, alpha: 1 }
      })
      .png()
      .toFile(appleTouchPath);

    console.log(`✅ Created ${appleIcon.name} (${appleIcon.size}x${appleIcon.size})`);

    console.log('\n🎉 All icons generated successfully!');
    console.log(`📁 Icons saved to: ${ICONS_DIR}`);
    console.log(`📁 Apple icon saved to: ${path.join(__dirname, appleIcon.outputDir)}`);
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
