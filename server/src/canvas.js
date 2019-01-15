let animateInterval;

export const initialiseCanvasGif = (w, h) => {
  const $frameCanvas = document.createElement('canvas');
  $frameCanvas.id = 'frameCanvas';
  document.querySelector('#gifBox #preview').appendChild($frameCanvas);

  $frameCanvas.width = w;
  $frameCanvas.height = h;
  const ctx = $frameCanvas.getContext('2d');
  return ctx;
};

export const createCanvasGif = ({convertedFrames, w, h}) => {
  const previewCtx = initialiseCanvasGif(w, h);
  return previewCtx;
}

export const animateCanvasGif = (ctx, convertedFrames, w, h) => {
  const delay = 100;
  let frameNum = 0;
  let end = convertedFrames.length -1;
  const nextFrame = () => {
    paintFrame(ctx, convertedFrames[frameNum], w, h);
    frameNum = (frameNum < end) ? frameNum +1 : 0 
  };
  animateInterval = setInterval(nextFrame, delay);
}

const paintFrame = (ctx, frameBuffer, w, h) => {
  const imageData = ctx.getImageData(0, 0, w, h);

  for (let i = 0; i < frameBuffer.length; i++) {
    for (let j = 0; j < 8; j++) {
      let pixelColor = ((frameBuffer[i] >>> j) & 1) ? 255 : 0;
      let page = Math.floor(i / w);
      let pos = ((i % w) + (page * w * 8) + (j * w)) * 4;

      imageData.data[pos] = imageData.data[pos+1] = imageData.data[pos+2] = pixelColor;
      imageData.data[pos+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

export const stopCanvasGifAnimation = () => (animateInterval && clearInterval(animateInterval));


