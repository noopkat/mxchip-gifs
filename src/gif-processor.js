import pngToLcd from './png-to-lcd';

let convertedFrames = [];

export const extractFrames = (gif, w) => {
  return new Promise((resolve, reject) => {
    const sizeLimit = 4;
    const sg = new SuperGif({gif, max_width: w, progressbar_height: 0});

    sg.load(() => {
      const ctx = sg.get_canvas().getContext('2d');
      const { height, width } = sg.get_canvas();
      const length = sg.get_length();
      const truncateStatus = length > sizeLimit;
      const size = Math.min(sizeLimit, length); 

      const frames = [];
      for (let i = 0; i < size; i += 1) {
        sg.move_to(i);
        frames.push(ctx.getImageData(0, 0, width, height));
      }
      resolve([frames, truncateStatus]);
    });
  });
}

export const convertFrames = (frames, w, h) => {
  const defaultOptions = {
    dither: true,
    threshold: 120
  };

  const { dither, threshold } = Object.assign({}, defaultOptions);
  convertedFrames = frames.map((f) => Array.prototype.slice.call(pngToLcd(f, {dither, threshold})));
  return {convertedFrames, w, h};
}

export const getConvertedFrames = () => convertedFrames;

