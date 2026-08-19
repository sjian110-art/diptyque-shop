import Jimp from 'jimp';
import fs from 'fs';

async function main() {
  try {
    const image = await Jimp.read('design/홈 - DIPTYQUE Noir Editorial (Refined).png');
    
    if (!fs.existsSync('public/assets')) {
      fs.mkdirSync('public/assets', { recursive: true });
    }

    // 1. Crop Hero Background (0, 0, 390, 624)
    console.log('Cropping Hero Background...');
    const heroBg = image.clone().crop(0, 0, 390, 624);
    await heroBg.writeAsync('public/assets/hero_bg.png');

    // 2. Crop Bottom Banner (0, 1849, 390, 468)
    console.log('Cropping Bottom Banner...');
    const bannerBg = image.clone().crop(0, 1849, 390, 468);
    await bannerBg.writeAsync('public/assets/banner_bg.png');

    // 3. Crop Do Son Bottle (left bottle)
    // Left Bottle: X range 75..130 -> crop 70..135 (width 65), Y range 1496..1592 -> crop 1491..1597 (height 106)
    console.log('Cropping Do Son Bottle...');
    const doson = image.clone().crop(70, 1491, 65, 106);
    await doson.writeAsync('public/assets/product_doson.png');

    // 4. Crop Philosykos Bottle (right bottle)
    // Right Bottle: X range 258..314 -> crop 253..319 (width 66), Y range 1499..1592 -> crop 1494..1597 (height 103)
    console.log('Cropping Philosykos Bottle...');
    const philosykos = image.clone().crop(253, 1494, 66, 103);
    await philosykos.writeAsync('public/assets/product_philosykos.png');

    console.log('Success! Clean assets saved.');
  } catch (error) {
    console.error(error);
  }
}

main();
