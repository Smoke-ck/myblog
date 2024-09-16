const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNodes = {};
let gainNodes = {};
let audioBuffers = {};

const rpmRange = document.getElementById('rpm-range');
const rpmDisplay = document.getElementById('rpm-display');
const startButton = document.getElementById('start-engine');
const stopButton = document.getElementById('stop-engine');
const speedometer = document.getElementById('speedometer');

const loadCarSound = async (url) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
};

const loadSounds = async () => {
  stopButton.disabled = true;
  const sounds = {
    500: 'assets/sounds/500.wav',
    1000: 'assets/sounds/1000.wav',
    2000: 'assets/sounds/2000.wav',
    3000: 'assets/sounds/3000.wav',
    4000: 'assets/sounds/4000.wav',
    5000: 'assets/sounds/5000.wav',
    6000: 'assets/sounds/6000.wav',
    7000: 'assets/sounds/7000.wav'
};

  for (const rpm in sounds) {
    const audioBuffer = await loadCarSound(sounds[rpm]);
    audioBuffers[rpm] = audioBuffer;
  }
};

const startEngine = () => {
  startButton.disabled = true;
  stopButton.disabled = false;
  for (const rpm in audioBuffers) {
    const bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = audioBuffers[rpm];
    const gainNode = audioCtx.createGain();
    bufferSource.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    bufferSource.loop = true;
    bufferSource.start();

    sourceNodes[rpm] = bufferSource;
    gainNodes[rpm] = gainNode;
  }

  for (const node in gainNodes) {
    if (node === '500') {
        console.log()
      gainNodes[node].gain.setValueAtTime(1, audioCtx.currentTime);
    } else {
      gainNodes[node].gain.setValueAtTime(0, audioCtx.currentTime);
    }
   }
};

const stopEngine = () => {
  startButton.disabled = false;
  stopButton.disabled = true;
  for (const rpm in sourceNodes) {
    sourceNodes[rpm].stop();
    sourceNodes[rpm].disconnect();
  }
  sourceNodes = {};
  gainNodes = {};
  rpmRange.value = 500;
  rpmDisplay.textContent = 500;
};

let idleTimeout = null;
const idleTime = 2000;
const rpmDecreaseSpeed = 50;

const updateSound = (event) => {
  let speed, rpm;
  const maxSpeed = 200;

  if (event.coords) {
    speed = Math.round(event.coords.speed * 3.6);
    rpm = 500 +(speed / maxSpeed)*( 7000 - 500);
  } else {
    rpm = parseInt(event.target.value)
  }
  rpmDisplay.textContent = rpm;
  speedometer.textContent = speed;
  const interpolate = (rpm, minRpm, maxRpm) => Math.max(0, Math.min(1, (rpm - minRpm) / (maxRpm - minRpm)));

  const t1 = interpolate(rpm, 500, 1000);
  const t2 = interpolate(rpm, 1000, 3000);
  const t3 = interpolate(rpm, 2000, 4000);
  const t4 = interpolate(rpm, 3000, 5000);
  const t5 = interpolate(rpm, 4000, 6000);
  const t6 = interpolate(rpm, 5000, 7000);
  const t7 = interpolate(rpm, 6000, 7000);
  const currentTime = audioCtx.currentTime;
  const rampDuration = 0.3;

  if (gainNodes[500]) {
    gainNodes[500].gain.cancelScheduledValues(currentTime);
    gainNodes[500].gain.linearRampToValueAtTime(1 - t1, currentTime + rampDuration);
  
    gainNodes[1000].gain.cancelScheduledValues(currentTime);
    gainNodes[1000].gain.linearRampToValueAtTime(t1 - t2, currentTime + rampDuration);
  
    gainNodes[2000].gain.cancelScheduledValues(currentTime);
    gainNodes[2000].gain.linearRampToValueAtTime(t2 - t3, currentTime + rampDuration);
  
    gainNodes[3000].gain.cancelScheduledValues(currentTime);
    gainNodes[3000].gain.linearRampToValueAtTime(t3 - t4, currentTime + rampDuration);
  
    gainNodes[4000].gain.cancelScheduledValues(currentTime);
    gainNodes[4000].gain.linearRampToValueAtTime(t4 - t5, currentTime + rampDuration);
  
    gainNodes[5000].gain.cancelScheduledValues(currentTime);
    gainNodes[5000].gain.linearRampToValueAtTime(t5 - t6, currentTime + rampDuration);
  
    gainNodes[6000].gain.cancelScheduledValues(currentTime);
    gainNodes[6000].gain.linearRampToValueAtTime(t6 - t7, currentTime + rampDuration);
  
    gainNodes[7000].gain.cancelScheduledValues(currentTime);
    gainNodes[7000].gain.linearRampToValueAtTime(t7, currentTime + rampDuration);
  }
};

window.onload = async () => {
  await loadSounds();
};

rpmRange.addEventListener('input', updateSound );
startButton.addEventListener('click', startEngine);
stopButton.addEventListener('click', stopEngine);

navigator.geolocation.watchPosition(updateSound, null, { enableHighAccuracy: !0 })
