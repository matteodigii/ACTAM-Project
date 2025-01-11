// Compressor Pedal

const compressorPedal = function (audioContext, input) {
  
  // Default Settings
  const defaults = {
    threshold: document.getElementById("Knob-threshold-compressor").value - 100,
    attack: document.getElementById("Knob-attack-compressor").value / 1000,
    release: document.getElementById("Knob-release-compressor").value / 100,
  };

  const output = audioContext.createGain();
  const compressor = audioContext.createDynamicsCompressor();

  // Default values applied
  compressor.threshold.value = defaults.threshold;
  compressor.attack.value = defaults.attack;
  compressor.release.value = defaults.release;

  // Linking the nodes
  input.connect(compressor);
  compressor.connect(output);

  // To update values dinamically, according to the user choice
  return {
    input,
    output,
    setThreshold(value) {
      compressor.threshold.value = Math.max(-70, value);
    },
    setAttack(value) {
      compressor.attack.value = value;
    },
    setRelease(value) {
      compressor.release.value = Math.max(0.01, Math.min(1, value));
    },
  };
};

const releaseKnob = document.getElementById('Knob-release-compressor');
releaseKnob.addEventListener('input', (event) => {
if (compressorNode) {
  const value = event.target.value / 100;
  compressorNode.setRelease(value);
  updateKnobValues('Knob-release-compressor', value);
}
});

const attackKnob = document.getElementById('Knob-attack-compressor');
attackKnob.addEventListener('input', (event) => {
if (compressorNode) {
  const value = event.target.value / 1000;
  compressorNode.setAttack(value);
  updateKnobValues('Knob-attack-compressor', value);
}
});

const thresholdKnob = document.getElementById('Knob-threshold-compressor');
thresholdKnob.addEventListener('input', (event) => {
if (compressorNode) {
  const value = event.target.value - 100;
  compressorNode.setThreshold(value);
  updateKnobValues('Knob-threshold-compressor', value);
}
});
