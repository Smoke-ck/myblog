const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNodes = {};
let gainNodes = {};
let audioBuffers = {};
let startNode = null;
let startGain = null;
let startAudioBuffer = null;

const rpmRange = document.getElementById('rpm-range');
const rpmDisplay = document.getElementById('rpm-display');
const startButton = document.getElementById('start-engine');
const stopButton = document.getElementById('stop-engine');
const speedometer = document.getElementById('speedometer');
const carSelect = document.getElementById('car-select');

const loadCarSound = async (url) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
};

const loadSounds = async (folder) => {
  stopButton.disabled = true;
  const startEngine = 'assets/sounds/starter.wav'
  const sounds = {
    600: `assets/sounds/${folder}/600.wav`,
    1000: `assets/sounds/${folder}/1000.wav`,
    2000: `assets/sounds/${folder}/2000.wav`,
    3000: `assets/sounds/${folder}/3000.wav`,
    4000: `assets/sounds/${folder}/4000.wav`,
    5000: `assets/sounds/${folder}/5000.wav`,
    6000: `assets/sounds/${folder}/6000.wav`,
    7000: `assets/sounds/${folder}/7000.wav`
};

  for (const rpm in sounds) {
    const audioBuffer = await loadCarSound(sounds[rpm]);
    audioBuffers[rpm] = audioBuffer;
  }

  startAudioBuffer = await loadCarSound(startEngine);
};

const setAudioBuffer = () => audioCtx.createBufferSource();
const createGain = () => audioCtx.createGain();

const startEngine = () => {
  startButton.disabled = true;
  stopButton.disabled = false;
  rpmRange.disabled = false;

  const bufferSource = setAudioBuffer();
  bufferSource.buffer = startAudioBuffer;
  const gainNode = createGain();
  bufferSource.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  bufferSource.loop = false;
  bufferSource.start();

  startNode = bufferSource;
  startGain = gainNode;
  startGain.gain.setValueAtTime(1, audioCtx.currentTime);

  setTimeout(() => {
    for (const rpm in audioBuffers) {
      const bufferSource = setAudioBuffer();
      bufferSource.buffer = audioBuffers[rpm];
      const gainNode = createGain();
      bufferSource.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      bufferSource.loop = true;
      bufferSource.start();

      sourceNodes[rpm] = bufferSource;
      gainNodes[rpm] = gainNode;
    }

    for (const node in gainNodes) {
      if (node === '600') {
        gainNodes[node].gain.setValueAtTime(1, audioCtx.currentTime);
      } else {
        gainNodes[node].gain.setValueAtTime(0, audioCtx.currentTime);
      }
     }
  }, 600);
};

const stopEngine = () => {
  startButton.disabled = false;
  stopButton.disabled = true;
  rpmRange.disabled = true;

  for (const rpm in sourceNodes) {
    sourceNodes[rpm].stop();
    sourceNodes[rpm].disconnect();
  }
  sourceNodes = {};
  gainNodes = {};
  rpmRange.value = 0;
  rpmDisplay.textContent = 0;
};

const updateSound = (event) => {
  let speed, rpm;
  const maxSpeed = 200;

  if (event.coords) {
    speed = Math.round(event.coords.speed * 3.6);
  } else {
    speed = parseInt(event.target.value);
  }
  rpm = 600 + (speed / maxSpeed)*( 7000 - 600);
  rpmDisplay.textContent = Math.trunc(rpm);
  speedometer.textContent = speed;
  const interpolate = (rpm, minRpm, maxRpm) => Math.max(0, Math.min(1, (rpm - minRpm) / (maxRpm - minRpm)));

  const t1 = interpolate(rpm, 600, 1000);
  const t2 = interpolate(rpm, 1000, 2000);
  const t3 = interpolate(rpm, 2000, 3000);
  const t4 = interpolate(rpm, 3000, 4000);
  const t5 = interpolate(rpm, 4000, 5000);
  const t6 = interpolate(rpm, 5000, 6000);
  const t7 = interpolate(rpm, 6000, 7000);
  const currentTime = audioCtx.currentTime;
  const rampDuration = 0.5;
  const keys =  Object.keys(sourceNodes);
  const transitions = [1 - t1, t1 - t2, t2 - t3, t3 - t4, t4 - t5, t5 - t6, t6 - t7, t7];

  if (keys.length) {
    keys.forEach((rpmValue, index) => {
      sourceNodes[rpmValue].playbackRate.value = rpm / rpmValue;
      gainNodes[rpmValue].gain.cancelScheduledValues(currentTime);
      gainNodes[rpmValue].gain.linearRampToValueAtTime(transitions[index], currentTime + rampDuration);
    });
  }
};

function checkKey(event) {
  if (rpmRange.disabled === true ) return

  if (event.keyCode == '38') {
    rpmRange.value = Math.min(parseInt(rpmRange.value) + 1, 200);
    updateSound({ target: rpmRange });
  }
  else if (event.keyCode == '40') {
    rpmRange.value = Math.max(parseInt(rpmRange.value) - 1, 0);
    updateSound({ target: rpmRange });
  }
}

window.onload = async () => {
  await loadSounds(carSelect.value);
};

rpmRange.addEventListener('input', updateSound );
startButton.addEventListener('click', startEngine);
stopButton.addEventListener('click', stopEngine);
navigator.geolocation.watchPosition(updateSound, null, { enableHighAccuracy: !0 });
document.addEventListener('keydown', checkKey);

carSelect.addEventListener('change', async (e) => {
  stopEngine();
  currentCar = e.target.value;
  await loadSounds(currentCar);
});
