/**
 * png-to-lcd
 * exports framebuffer for use with common OLED displays
 */
import floydSteinberg from 'floyd-steinberg';

export default function png_to_lcd(file, options) {
  return convert(file, options);
}
  
function convert(pimage, options) {
  const pixels = pimage.data,
      pixelsLen = pixels.length,
      height = pimage.height,
      width = pimage.width,
      alpha = pimage.hasAlphaChannel,
      threshold = options.threshold || 120,
      unpackedBuffer = [],
      depth = 4;

  // create a new buffer that will be filled with pixel bytes 
  const buffer = new Uint8Array((width * height / 8));
  buffer.fill(0x00);

  // if dithering is preferred, run this on the pixel data first to transform RGB vals
  if (options.dither) {
    floydSteinberg(pimage);
  }

  // filter pixels to create monochrome image data
  for (let i = 0; i < pixelsLen; i += depth) {
    // just take the red value
    let redSample = pixels[i + 1] = pixels[i + 2] = pixels[i];
    const pixelVal = (redSample > threshold) ? 1 : 0;

    // push to unpacked buffer list
    unpackedBuffer[i/depth] = pixelVal;
  }

  // time to pack the buffer
  for (let i = 0; i < unpackedBuffer.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);

    // set up page and byte position
    const page = Math.floor(y / 8);
    const byte = (page === 0) ? x : x + width * page; 
    const pageShift = 0x01 << (y - 8 * page);
    
    if (unpackedBuffer[i] === 0) {
      // 'off' pixel
      buffer[byte] &= ~pageShift;
    } else {
      // 'on' pixel
      buffer[byte] |= pageShift;
    }
  }
  return buffer;
}
