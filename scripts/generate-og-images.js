const sharp = require('sharp');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.jpeg');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateOGImages() {
  console.log('🎨 Generating Open Graph images...\n');

  const width = 1200;
  const height = 630;
  const logoSize = 300;

  try {
    // Read and resize logo
    const logoBuffer = await sharp(LOGO_PATH)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Create SVG with gradient background and text
    const createSVG = (title, subtitle) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6c7948;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#5d6541;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6546b8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
        <text x="600" y="480" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
        <text x="600" y="540" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)" text-anchor="middle">${subtitle}</text>
      </svg>
    `;

    // Generate og-image.png (general)
    const ogImagePath = path.join(PUBLIC_DIR, 'og-image.png');
    const svgGeneral = createSVG('Kawa Missa', 'Gestão Paroquial Simplificada');

    await sharp(Buffer.from(svgGeneral))
      .resize(width, height)
      .composite([
        {
          input: logoBuffer,
          top: Math.floor((height - logoSize) / 2) - 100,
          left: Math.floor((width - logoSize) / 2)
        }
      ])
      .png()
      .toFile(ogImagePath);

    console.log(`✅ Created og-image.png (${width}x${height})`);

    // Generate og-image-public.png (for public pages)
    const ogImagePublicPath = path.join(PUBLIC_DIR, 'og-image-public.png');
    const svgPublic = createSVG('Kawa Missa', 'Consulte os horários das missas');

    await sharp(Buffer.from(svgPublic))
      .resize(width, height)
      .composite([
        {
          input: logoBuffer,
          top: Math.floor((height - logoSize) / 2) - 100,
          left: Math.floor((width - logoSize) / 2)
        }
      ])
      .png()
      .toFile(ogImagePublicPath);

    console.log(`✅ Created og-image-public.png (${width}x${height})`);

    console.log('\n🎉 Open Graph images generated successfully!');
    console.log(`📁 Images saved to: ${PUBLIC_DIR}`);
  } catch (error) {
    console.error('❌ Error generating OG images:', error);
    process.exit(1);
  }
}

generateOGImages();
