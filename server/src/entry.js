import { extractFrames, convertFrames, getConvertedFrames } from './gif-processor';
import { sendPayload, populateDeviceList } from './requests';
import { initialiseCanvasGif, createCanvasGif, animateCanvasGif, stopCanvasGifAnimation } from './canvas.js';

const resetDom = () => {
  stopCanvasGifAnimation();
  updateSendStatus('', 'inherit');
  $truncateWarning.style.display = 'none';

  const $prevSuperGif = document.querySelector('.jsgif');
  if ($prevSuperGif) $prevSuperGif.remove();

  const $prevFrameCanvas = document.querySelector('#frameCanvas');
  $prevFrameCanvas && $prevFrameCanvas.remove();

  $fileDropzone.removeAllFiles();
}

const calculateGifSize = (w, h) => {
  const wR = screenWidth / w;
  const hR = screenHeight / h;
  const n = Math.min(wR, hR);
  return [Math.ceil(n * w), Math.ceil(n * h)]; 
}

const resizeGif = ($image) => {
  const { width, height } = $image;
  const [ newWidth, newHeight ] = calculateGifSize(width, height);

  $image.style.display = 'none';
  $image.height = newHeight;
  $image.width = newWidth;
  return $image;
}

const resizeSuperGif = (h) => {
  document.querySelector('.jsgif').style.height = `${h}px`;
}

const updateSendStatus = (text, color, display) => {
  $sendStatus.textContent = text;
  $sendStatus.style.color = color;
  if (display) $sendStatus.style.display = display;
}

const formOnSubmit = (e) => {
  e.preventDefault();
  const { width, height } = document.querySelector('#frameCanvas');
  const frames = getConvertedFrames();
  const deviceId = $select.value;

  updateSendStatus(`Sending GIF to ${deviceId}...`, 'inherit', 'block');

  sendPayload(frames, width, height, deviceId)
    .then((r) => {
        if (r.ok) updateSendStatus(`Sent!`, 'mediumseagreen');
        else updateSendStatus(`Could not send. Try again?`, 'crimson');
     })
    .catch((error) => {
        console.log(error);
        updateSendStatus(`Could not send. Try again?`, 'crimson');
     });
}

const fileInputOnChange = function(file) {
  $filename.textContent = file.name; 
  const objectURL = window.URL.createObjectURL(file);
  const $gif = new Image();
  $gif.src = objectURL;
  $gif.onload = () => gifOnLoad($gif);
  $submitButton.style.display = 'inline-block';
  $fieldsetDevice.style.display = 'block';
  $fileDropzone.removeFile(file);
}

const gifOnLoad = ($image) => {
  resetDom();
  
  $gifBox.style.display = 'inline-block';
  const $gif = $gifBox.querySelector('#og').appendChild(resizeGif($image));
  const { width, height } = $gif;

  extractFrames($gif, width)
    .then(([frames, truncateStatus]) => {
        resizeSuperGif(height);
       if (truncateStatus) $truncateWarning.style.display = 'block';
       return convertFrames(frames, width, height);
    })
    .then(createCanvasGif)
    .then((previewCtx) => animateCanvasGif(previewCtx, getConvertedFrames(), width, height));
}

const dropzoneOptions = {
  acceptedFiles: "image/gif",
  clickable: "button#fileDropzone",
  createImageThumbnails: false,
  maxFiles: 1,
  autoQueue: false,
  url: "localhost", // We aren't using DZ to do the upload so this is not used
  autoProcessQueue: false,
  autoQueue: false,
  previewTemplate: "<div></div>"
};

const screenWidth = 128;
const screenHeight = 64;

// dom elements
const $gifBox = document.querySelector('#gifBox');
const $truncateWarning = document.querySelector('#truncateWarning');
const $iothubWarning = document.querySelector('#iothubWarning');
const $form = document.querySelector('form');
const $filename = $form.querySelector('#filename');
const $fieldsetDevice = $form.querySelector("#deviceChoice"); 
const $submitButton = $form.querySelector('input[type="submit"]');
const $select = $form.querySelector('select');
const $sendStatus = $form.querySelector('#sendStatus');
const $dropzoneButton = $form.querySelector('#fileDropzone');
const $fileDropzone = new Dropzone(document.body, dropzoneOptions);

$form.addEventListener('submit', formOnSubmit);
$dropzoneButton.addEventListener('press', (event) => event.preventDefault());
$dropzoneButton.addEventListener('click', (event) => event.preventDefault());
$fileDropzone.on("addedfile", fileInputOnChange);

// get device list early before user sees the dropdown 
populateDeviceList($select, $iothubWarning);

