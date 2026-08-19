import Jimp from 'jimp';

async function main() {
  try {
    const img = await Jimp.read('public/assets_1/Home_Hero_Background.png');
    const width = img.getWidth();
    
    // Scan y=10..50, x=120..270 for white pixels (DIPTYQUE logo area)
    let whitePixelCount = 0;
    for (let y = 10; y < 50; y++) {
      for (let x = 120; x < 270; x++) {
        const color = Jimp.intToRGBA(img.getPixelColor(x, y));
        if (color.r > 240 && color.g > 240 && color.b > 240) {
          whitePixelCount++;
        }
      }
    }
    console.log(`White pixels in logo area: ${whitePixelCount}`);

    // Scan y=380..460, x=50..340 for "향이 머무는 순간" text area in hero
    let heroTextWhitePixels = 0;
    for (let y = 380; y < 460; y++) {
      for (let x = 50; x < 340; x++) {
        const color = Jimp.intToRGBA(img.getPixelColor(x, y));
        if (color.r > 240 && color.g > 240 && color.b > 240) {
          heroTextWhitePixels++;
        }
      }
    }
    console.log(`White pixels in hero text area: ${heroTextWhitePixels}`);
    
    // Check Bottom Banner (Home_Banner.png) for "L'ART DU PARFUM"
    const banner = await Jimp.read('public/assets_1/Home_Banner.png');
    let bannerTextWhitePixels = 0;
    for (let y = 100; y < 300; y++) {
      for (let x = 50; x < 340; x++) {
        const color = Jimp.intToRGBA(banner.getPixelColor(x, y));
        if (color.r > 240 && color.g > 240 && color.b > 240) {
          bannerTextWhitePixels++;
        }
      }
    }
    console.log(`White pixels in banner text area: ${bannerTextWhitePixels}`);

  } catch (err) {
    console.error(err);
  }
}

main();
