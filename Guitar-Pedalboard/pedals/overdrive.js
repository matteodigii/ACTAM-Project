// Overdrive Pedal

const overdrivePedal = function(audioContext, input) {
  
  // Default Settings
  const defaults = {
    drive: document.getElementById("Knob-drive-overdrive").value,
    tone: document.getElementById("Knob-tone-overdrive").value,
  };

  const output = audioContext.createGain();
  const overdrive = audioContext.createWaveShaper();
  const toneFilter = audioContext.createBiquadFilter();

  // Parameter setting for Tone knob
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = defaults.tone * 50;

  // Make Distortion Curve
  // @link https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
  function makeDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  overdrive.curve = makeDistortionCurve(defaults.drive);
  overdrive.oversample = "4x";
  output.gain.value = 1;

  // Linking all the nodes
  input.connect(overdrive);
  overdrive.connect(toneFilter);
  toneFilter.connect(output);

  // To update values dinamically, according to the user choice
  return {
    input,
    output,
    setDrive(value) {
      overdrive.curve = makeDistortionCurve(value);
    },
    setTone(value) {
      toneFilter.frequency.value = value * 50;
    },
  };
};

// Handling knobs according to user interaction
const driveKnob = document.getElementById('Knob-drive-overdrive');
driveKnob.addEventListener('input', (event) => {
if (overdriveNode) {
  const value = event.target.value;
  overdriveNode.setDrive(value); 
  updateKnobValues('Knob-drive-overdrive', value);
}
});

const toneKnob = document.getElementById('Knob-tone-overdrive');
toneKnob.addEventListener('input', (event) => {
if (overdriveNode) {
  const value = event.target.value;
  overdriveNode.setTone(value); 
  updateKnobValues('Knob-tone-overdrive', value);
}
});