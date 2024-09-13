//OOP
class EngineSound {
  #audioContext = null;
  #audioSources = {};
  #audioGains = {};
  #rpmRange = null;
  #rpmDisplay = null;
  #startButton = null;
  #stopButton = null;
  #sounds = {};

  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioSources = {};
    this.audioGains = {};
    this.rpmRange = document.getElementById('rpm-range');
    this.rpmDisplay = document.getElementById('rpm-display');
    this.startButton = document.getElementById('start-engine');
    this.stopButton = document.getElementById('stop-engine');
    this.stopButton.disabled = true;
  };

  set audioPaths(sounds) {
    this.sounds = sounds;
  }

   async loadSounds() {
    for (const rpm in this.sounds) {
      const audioBuffer = await this.loadCarSound(this.sounds[rpm]);
      this.audioSources[rpm] = audioBuffer;
    }
  };

  async loadCarSound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  };

  async startEngine() {
    this.startButton.disabled = true;
    this.stopButton.disabled = false;
    await this.loadSounds();

    for (const rpm in this.audioSources) {
      const audioSource = this.audioContext.createBufferSource();
      audioSource.buffer = this.audioSources[rpm];
      const audioGain = this.audioContext.createGain();
      audioSource.connect(audioGain);
      audioGain.connect(this.audioContext.destination);
      audioSource.loop = true;
      audioSource.start();

      this.audioSources[rpm] = audioSource;
      this.audioGains[rpm] = audioGain;
    }

    for (const node in this.audioGains) {
      if (node === '500') {
        this.audioGains[node].gain.setValueAtTime(1, this.audioContext.currentTime);
      } else {
        this.audioGains[node].gain.setValueAtTime(0, this.audioContext.currentTime);
      }
    }
    // This for testing
    // let latitude = 37.7749;
    // let longitude = -122.4194;
    // let speed = 0;

    // setInterval(() => {
    // console.log('test');
    // latitude += 0.0001;
    // longitude += 0.0001;
    // speed += 1
    // const geo = {
    //     coords: {
    //     latitude,
    //     longitude,
    //     speed,
    //     },
    // };
    // this.updateSound(geo);
    // }, 1000);
  };

  stopEngine() {
    this.startButton.disabled = false;
    this.stopButton.disabled = true;
    for (const rpm in this.audioSources) {
      this.audioSources[rpm].stop();
      this.audioSources[rpm].disconnect();
    }
    this.audioSources = {};
    this.audioGains = {};
    this.rpmRange.value = 500;
    this.rpmDisplay.textContent = 500;
  };

  updateSound(geo) {
    const speed = Math.round(geo.coords.speed * 3.6);
    const maxSpeed = 200;
    // const rpm = parseInt(this.rpmRange.value);
    const rpm = 500 +(speed / maxSpeed)*( 7000 - 500);
    this.rpmDisplay.textContent = rpm;
    const interpolate = (rpm, minRpm, maxRpm) => Math.max(0, Math.min(1, (rpm - minRpm) / (maxRpm - minRpm)));

    const t1 = interpolate(rpm, 500, 1000);
    const t2 = interpolate(rpm, 1000, 3000);
    const t3 = interpolate(rpm, 2000, 4000);
    const t4 = interpolate(rpm, 3000, 5000);
    const t5 = interpolate(rpm, 4000, 6000);
    const t6 = interpolate(rpm, 5000, 7000);
    const t7 = interpolate(rpm, 6000, 7000);
    const currentTime = this.audioContext.currentTime;
    const rampDuration = 0.3;

    if (this.audioGains[500]) {
      this.audioGains[500].gain.cancelScheduledValues(currentTime);
      this.audioGains[500].gain.linearRampToValueAtTime(1 - t1, currentTime + rampDuration);

      this.audioGains[1000].gain.cancelScheduledValues(currentTime);
      this.audioGains[1000].gain.linearRampToValueAtTime(t1 - t2, currentTime + rampDuration);

      this.audioGains[2000].gain.cancelScheduledValues(currentTime);
      this.audioGains[2000].gain.linearRampToValueAtTime(t2 - t3, currentTime + rampDuration);

      this.audioGains[3000].gain.cancelScheduledValues(currentTime);
      this.audioGains[3000].gain.linearRampToValueAtTime(t3 - t4, currentTime + rampDuration);

      this.audioGains[4000].gain.cancelScheduledValues(currentTime);
      this.audioGains[4000].gain.linearRampToValueAtTime(t4 - t5, currentTime + rampDuration);

      this.audioGains[5000].gain.cancelScheduledValues(currentTime);
      this.audioGains[5000].gain.linearRampToValueAtTime(t5 - t6, currentTime + rampDuration);

      this.audioGains[6000].gain.cancelScheduledValues(currentTime);
      this.audioGains[6000].gain.linearRampToValueAtTime(t6 - t7, currentTime + rampDuration);

      this.audioGains[7000].gain.cancelScheduledValues(currentTime);
      this.audioGains[7000].gain.linearRampToValueAtTime(t7, currentTime + rampDuration);
    }
  };
};

window.onload = async () => {
  const musclcar = new EngineSound();
  await musclcar.init();

  musclcar.audioPaths = {
    500: 'assets/sounds/500.wav',
    1000: 'assets/sounds/1000.wav',
    2000: 'assets/sounds/2000.wav',
    3000: 'assets/sounds/3000.wav',
    4000: 'assets/sounds/4000.wav',
    5000: 'assets/sounds/5000.wav',
    6000: 'assets/sounds/6000.wav',
    7000: 'assets/sounds/7000.wav'
  };
  // musclcar.rpmRange.addEventListener('input', () => { musclcar.updateSound() });
  musclcar.startButton.addEventListener('click', () => { musclcar.startEngine() });
  musclcar.stopButton.addEventListener('click', () => { musclcar.stopEngine() });

  // check geolocation to calculate rpm
  navigator.geolocation.watchPosition((geo) => {
    musclcar.updateSound(geo), null, { enableHighAccuracy: true }
  });

  // distance calculation
  // function calculateDistance(lat1, lon1, lat2, lon2, unit) {
  //   if (lat1 === lat2 && lon1 === lon2) { return 0 }

  //   const radlat1 = Math.PI * lat1 / 180;
  //   const radlat2 = Math.PI * lat2 / 180;
  //   const theta = lon1 - lon2;
  //   const radtheta = Math.PI * theta / 180;
  //   let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  //   if (dist > 1) { dist = 1 }

  //   dist = Math.acos(dist) * 180 / Math.PI;
  //   dist *= 60 * 1.1515;

  //   (unit === "K") ? dist *= 1.609344 : dist *= 0.8684;

  //   return dist;
  // }
};

// functional
// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// let sourceNodes = {};
// let gainNodes = {};
// let audioBuffers = {};

// const rpmRange = document.getElementById('rpm-range');
// const rpmDisplay = document.getElementById('rpm-display');
// const startButton = document.getElementById('start-engine');
// const stopButton = document.getElementById('stop-engine');

// const loadCarSound = async (url) => {
//   const response = await fetch(url);
//   const arrayBuffer = await response.arrayBuffer();
//   return await audioCtx.decodeAudioData(arrayBuffer);
// };

// const loadSounds = async () => {
//   const sounds = {
//     500: 'assets/sounds/500.wav',
//     1000: 'assets/sounds/1000.wav',
//     2000: 'assets/sounds/2000.wav',
//     3000: 'assets/sounds/3000.wav',
//     4000: 'assets/sounds/4000.wav',
//     5000: 'assets/sounds/5000.wav',
//     6000: 'assets/sounds/6000.wav',
//     7000: 'assets/sounds/7000.wav'
// };

//   for (const rpm in sounds) {
//     const audioBuffer = await loadCarSound(sounds[rpm]);
//     audioBuffers[rpm] = audioBuffer;
//   }
// };

// const startEngine = () => {
//   for (const rpm in audioBuffers) {
//     const bufferSource = audioCtx.createBufferSource();
//     bufferSource.buffer = audioBuffers[rpm];
//     const gainNode = audioCtx.createGain();
//     bufferSource.connect(gainNode);
//     gainNode.connect(audioCtx.destination);
//     bufferSource.loop = true;
//     bufferSource.start();

//     sourceNodes[rpm] = bufferSource;
//     gainNodes[rpm] = gainNode;
//   }

//   for (const node in gainNodes) {
//     if (node === '500') {
//         console.log()
//       gainNodes[node].gain.setValueAtTime(1, audioCtx.currentTime);
//     } else {
//       gainNodes[node].gain.setValueAtTime(0, audioCtx.currentTime);
//     }
//    }
// };

// const stopEngine = () => {
//   for (const rpm in sourceNodes) {
//     sourceNodes[rpm].stop();
//     sourceNodes[rpm].disconnect();
//   }
//   sourceNodes = {};
//   gainNodes = {};
//   rpmRange.value = 500;
//   rpmDisplay.textContent = 500;
// };

// let idleTimeout = null;
// const idleTime = 2000;
// const rpmDecreaseSpeed = 50;

// const updateSound = () => {
//   const rpm = parseInt(rpmRange.value);
//   rpmDisplay.textContent = rpm;

//   const interpolate = (rpm, minRpm, maxRpm) => Math.max(0, Math.min(1, (rpm - minRpm) / (maxRpm - minRpm)));

//   const t1 = interpolate(rpm, 500, 1000);
//   const t2 = interpolate(rpm, 1000, 3000);
//   const t3 = interpolate(rpm, 2000, 4000);
//   const t4 = interpolate(rpm, 3000, 5000);
//   const t5 = interpolate(rpm, 4000, 6000);
//   const t6 = interpolate(rpm, 5000, 7000);
//   const t7 = interpolate(rpm, 6000, 7000);
//   const currentTime = audioCtx.currentTime;
//   const rampDuration = 0.3;

//   gainNodes[500].gain.cancelScheduledValues(currentTime);
//   gainNodes[500].gain.linearRampToValueAtTime(1 - t1, currentTime + rampDuration);

//   gainNodes[1000].gain.cancelScheduledValues(currentTime);
//   gainNodes[1000].gain.linearRampToValueAtTime(t1 - t2, currentTime + rampDuration);

//   gainNodes[2000].gain.cancelScheduledValues(currentTime);
//   gainNodes[2000].gain.linearRampToValueAtTime(t2 - t3, currentTime + rampDuration);

//   gainNodes[3000].gain.cancelScheduledValues(currentTime);
//   gainNodes[3000].gain.linearRampToValueAtTime(t3 - t4, currentTime + rampDuration);

//   gainNodes[4000].gain.cancelScheduledValues(currentTime);
//   gainNodes[4000].gain.linearRampToValueAtTime(t4 - t5, currentTime + rampDuration);

//   gainNodes[5000].gain.cancelScheduledValues(currentTime);
//   gainNodes[5000].gain.linearRampToValueAtTime(t5 - t6, currentTime + rampDuration);

//   gainNodes[6000].gain.cancelScheduledValues(currentTime);
//   gainNodes[6000].gain.linearRampToValueAtTime(t6 - t7, currentTime + rampDuration);

//   gainNodes[7000].gain.cancelScheduledValues(currentTime);
//   gainNodes[7000].gain.linearRampToValueAtTime(t7, currentTime + rampDuration);
// };

// window.onload = async () => {
//   await loadSounds();
// };

// rpmRange.addEventListener('input', updateSound );
// startButton.addEventListener('click', startEngine);
// stopButton.addEventListener('click', stopEngine);
