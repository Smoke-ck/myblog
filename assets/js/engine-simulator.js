document.addEventListener("DOMContentLoaded", () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let sourceNode = null;
  let audioBuffer = null;

  const carSounds = {
    car: 'assets/sounds/car.mp3',
    excavator: 'assets/sounds/excavator.mp3',
    motorcycle: 'assets/sounds/motorcycle.mp3',
    bus: 'assets/sounds/bus.mp3',
    locomotive: 'assets/sounds/locomotive.mp3'
  };

  let currentCar = 'car';

  const speedRange = document.getElementById('speed-range');
  const speedDisplay = document.getElementById('speed-display');
  const carSelect = document.getElementById('car-select');
  const startEngineButton = document.getElementById('start-engine');
  const stopEngineButton = document.getElementById('stop-engine');

  const loadCarSound = async (carType) => {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
    }

    const response = await fetch(carSounds[carType]);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  }

  const startSound = () => {
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;

    sourceNode.connect(audioCtx.destination);
    sourceNode.start();
  }

  const updateSound = () => {
    const speed = speedRange.value;
    speedDisplay.textContent = speed;

    if (sourceNode) {
      const playbackRate = 0.9 + speed / 100;
      sourceNode.playbackRate.setValueAtTime(playbackRate, audioCtx.currentTime);
    }
  }

  speedRange.addEventListener('input', updateSound);

  const resetSpeed = () => {
    speedRange.value = 0;
    speedDisplay.textContent = 0;
  }

  carSelect.addEventListener('change', async (e) => {
    currentCar = e.target.value;
    resetSpeed();
    await loadCarSound(currentCar);
    updateSound();
  });

  stopEngineButton.addEventListener('click', ()=> {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
      isPlaying = false;
    }
    resetSpeed();
  });

  startEngineButton.addEventListener('click', () => {
    loadCarSound(currentCar).then(() => {
      startSound();
    });
  });

  loadCarSound(currentCar);
});
