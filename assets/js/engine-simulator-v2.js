

// METER

let Meter = function Meter($elm, config) {

  // DOM
	let $needle, $value;

	// Others

	let steps = (config.valueMax - config.valueMin) / config.valueStep,
			angleStep = (config.angleMax - config.angleMin) / steps;

	let margin = 10; // in %
	let angle = 0; // in degrees

	let value2angle = function(value) {
		let angle = ((value / (config.valueMax - config.valueMin)) * (config.angleMax - config.angleMin) + config.angleMin);

		return angle;
	};

	this.setValue = function(v) {
		$needle.style.transform = "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(v)) + "deg)";
		$value.innerHTML = config.needleFormat(v);
	};

	let switchLabel = function(e) {
		e.target.closest(".meter").classList.toggle('meter--big-label');
	};

	let makeElement = function(parent, className, innerHtml, style) {

		let	e = document.createElement('div');
		e.className = className;

		if (innerHtml) {
			e.innerHTML = innerHtml;
		}

		if (style) {
			for (var prop in style) {
				e.style[prop] = style[prop];
			}
		}

		parent.appendChild(e);

		return e;
	};

	// Label unit
	makeElement($elm, "label label-unit", config.valueUnit);

	for (let n=0; n < steps+1; n++) {
		let value = config.valueMin + n * config.valueStep;
		angle = config.angleMin + n * angleStep;

		// Red zone
		let redzoneClass = "";
		if (value > config.valueRed) {
			redzoneClass = " redzone";
		}

		makeElement($elm, "grad grad--" + n + redzoneClass, config.labelFormat(value), {
			left: (50 - (50 - margin) * Math.sin(angle * (Math.PI / 180))) + "%",
			top: (50 + (50 - margin) * Math.cos(angle * (Math.PI / 180))) + "%"
		});

		// Tick
		makeElement($elm, "grad-tick grad-tick--" + n + redzoneClass, "", {
			left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
			top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
			transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
		});

		// Half ticks
		angle += angleStep / 2;

		if (angle < config.angleMax) {
			makeElement($elm, "grad-tick grad-tick--half grad-tick--" + n + redzoneClass, "", {
				left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
				top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
				transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
			});
		}

		// Quarter ticks
		angle += angleStep / 4;

		if (angle < config.angleMax) {
			makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
				left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
				top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
				transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
			});
		}

		angle -= angleStep / 2;

		if (angle < config.angleMax) {
			makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
				left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
				top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
				transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
			});
		}
	}
	// NEEDLE
	angle = value2angle(config.value);
	$needle = makeElement($elm, "needle", "", {
		transform: "translate3d(-50%, 0, 0) rotate(" + angle + "deg)"
	});

	let $axle = makeElement($elm, "needle-axle").addEventListener("click", switchLabel);
	makeElement($elm, "label label-value", "<div>" + config.labelFormat(config.value) + "</div>" + "<span>" + config.labelUnit + "</span>").addEventListener("click", switchLabel);

	$value = $elm.querySelector(".label-value div");
};


// DOM LOADED FIESTA

document.addEventListener("DOMContentLoaded",	function() {

	let rpmMeter = new Meter(document.querySelector(".meter--rpm"), {
		value: 6.3,
		valueMin: 0,
		valueMax: 8000,
		valueStep: 1000,
		valueUnit: "<div>RPM</div><span>x1000</span>",
		angleMin: 30,
		angleMax: 330,
		labelUnit: "RPM",
		labelFormat: function(v) { return Math.round(v / 1000); },
		needleFormat: function(v) { return Math.round(v / 100) * 100; },
		valueRed: 6500
	});

	let speedMeter = new Meter(document.querySelector(".meter--speed"), {
		value: 203,
		valueMin: 0,
		valueMax: 220,
		valueStep: 20,
		valueUnit: "<span>Speed</span><div>Km/h</div>",
		angleMin: 30,
		angleMax: 330,
		labelUnit: "Km/h",
		labelFormat: function(v) { return Math.round(v); },
		needleFormat: function(v) { return Math.round(v); }
	});

	let gearMeter = document.querySelector('.meter--gear div');

	// USER INPUTS

	document.onkeydown = keyDown;
	document.onkeyup = keyUp;

	function keyDown(e) {

		e = e || window.event;

		if (e.keyCode == '38') { 			// up arrow
			isAccelerating = true;
		}
		else if (e.keyCode == '40') { // down arrow
			isBraking = true;
		}
		else if (e.keyCode == '37') { // left arrow
		}
		else if (e.keyCode == '39') { // right arrow
		}

	}

	function keyUp(e) {

		e = e || window.event;

		if (e.keyCode == '38') {			// up arrow
			isAccelerating = false;
		}
		else if (e.keyCode == '40') { // down arrow
			isBraking = false;
		}
		else if (e.keyCode == '37') { // left arrow
			gearDown();
		}
		else if (e.keyCode == '39') { // right arrow
			gearUp();
		}

	}

	function gearUp() {
		if (gear < gears.length - 1) {
			gear++;
			gearMeter.innerHTML = gear;
		}
	}

	function gearDown() {
		if (gear > 1) {
			gear--;
			gearMeter.innerHTML = gear;
		}
	}

	// VEHICLE CONFIG

	let
			mass = 1200,
			cx = 0.28,
			gears = [0, 0.4, 0.7, 1.0, 1.3, 1.5, 1.68],
			transmitionRatio = 0.17,
			wheelDiameter = 0.5,
			brakeTorqueMax = 300,

			gear = 1,
			speed = 10,	// in km/h
			overallRatio,
			wheelTorque,
			brakeTorque,
			resistance,
			acceleration;

	// MOTOR CONFIG
	let
			rpmIdle = 600,
			rpmMax = 8000,
			rpmRedzone = 6500,
			torqueMin = 20, // in m.kg
			torqueMax = 45, // in m.kg
			torque,
			rpm = 0,
			isAccelerating = false,
			isBraking = false;

	// Helper functions
	let torqueByRpm = function(rpm) {
		let torque = torqueMin + (rpm / rpmMax) * (torqueMax - torqueMin);
		return torque;
	};

	function kmh2ms(speed) {	// Km/h to m/s
		return speed / 3.6;
	}

	let lastTime = new Date().getTime(),
			nowTime,
			delta;

	// MAIN LOOP
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let sourceNodes = {};
  let gainNodes = {};
  let audioBuffers = {};
  let startNode = null;
  let startGain = null;
  let startAudioBuffer = null;

	(function engineLoop(){
		window.requestAnimationFrame(engineLoop);

		// Delta time
		nowTime = new Date().getTime();
		delta = (nowTime - lastTime) / 1000; // in seconds
		lastTime = nowTime;

		let oldSpeed = speed;
		let oldRpm = rpm;

		// Torque
    torque = isAccelerating && rpm < rpmMax ? torqueByRpm(rpm) : -(rpm * rpm / 1000000);
    brakeTorque = isBraking ? brakeTorqueMax : 0;

		overallRatio = transmitionRatio * gears[gear];
		wheelTorque = torque / overallRatio - brakeTorque;

		acceleration = 20 * wheelTorque / (wheelDiameter * mass / 2);
		resistance = 0.5 * 1.2 * cx * kmh2ms(speed)^2;

		// Speed

		speed += (acceleration - resistance) * delta;

		if (speed < 0) { speed = 0; }

		rpm = speed / (60 * transmitionRatio * gears[gear] * (Math.PI * wheelDiameter / 1000));

		// Idle
		if (rpm < rpmIdle) {
			rpm = oldRpm;
			speed = oldSpeed;
		}

		// Gear shifter
		if (rpm > rpmRedzone) {
			gearMeter.classList.add('redzone');

		} else {
			gearMeter.classList.remove('redzone');
		}
		// Update GUI

		speedMeter.setValue(speed);
		rpmMeter.setValue(rpm);

		// Update engine sound
		if (sourceNodes[600]) {
      updateSound(rpm);
		}
	})();

  const loadCarSound = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  };

  const loadSounds = async (folder) => {
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
  };

  const setAudioBuffer = () => audioCtx.createBufferSource();
  const createGain = () => audioCtx.createGain();

  const updateSound = (rpm) => {
    loader.classList.remove('active');

    // let speed, rpm;
    // const maxSpeed = 200;

    // if (event.coords) {
    //   speed = Math.round(event.coords.speed * 3.6);
    //   rpm = 600 +(speed / maxSpeed)*( 7000 - 600);
    // } else {
    //   rpm = parseInt(event.target.value)
    // }
    // rpmDisplay.textContent = rpm;
    // speedometer.textContent = speed;

    const interpolate = (rpm, minRpm, maxRpm) => Math.max(0, Math.min(1, (rpm - minRpm) / (maxRpm - minRpm)));

    const t1 = interpolate(rpm, 600, 1000);
    const t2 = interpolate(rpm, 1000, 2000);
    const t3 = interpolate(rpm, 2000, 3000);
    const t4 = interpolate(rpm, 3000, 4000);
    const t5 = interpolate(rpm, 4000, 5000);
    const t6 = interpolate(rpm, 5000, 6000);
    const t7 = interpolate(rpm, 6000, 7000);
    const currentTime = audioCtx.currentTime;
    const rampDuration = 0.3;
    const keys =  Object.keys(sourceNodes);
    const transitions = [1 - t1, t1 - t2, t2 - t3, t3 - t4, t4 - t5, t5 - t6, t6 - t7, t7];

    if (keys.length) {
      keys.forEach((rpmValue, index) => {
        sourceNodes[rpmValue].playbackRate.value = rpm / rpmValue;
        gainNodes[rpmValue].gain.cancelScheduledValues(currentTime);
        gainNodes[rpmValue].gain.linearRampToValueAtTime(transitions[index], currentTime);
      });
    }
  };

	var loader = document.querySelector('.loader');
	var btnVolume = document.querySelector('.btn-volume');

  function startEngine() {

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
  }

  btnVolume.addEventListener('click', async () => {
    await loadSounds('sportcar');
    startEngine();
  });
});
