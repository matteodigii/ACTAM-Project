// Tremolo Pedal

const tremoloPedal = function (audioContext, input) {

    // Default Settings
    const defaults = {
      rate: document.getElementById("Knob-rate-tremolo").value / 5,
      depth: document.getElementById("Knob-depth-tremolo").value / 100,
      wave: "sine"
    };

    const output = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const tremolo = audioContext.createGain();
    const depthIn = audioContext.createGain();
    const depthOut = audioContext.createGain();
    
    // Setting default values
    lfo.frequency.value = defaults.rate;
    lfo.type = defaults.wave;
    depthOut.gain.value = defaults.depth;
    depthIn.gain.value = 1 - defaults.depth;

    // Linking the nodes
    lfo.connect(tremolo.gain);
    lfo.start();
    input.connect(tremolo);
    tremolo.connect(depthOut);
    depthOut.connect(output);
    input.connect(depthIn);
    depthIn.connect(output);

    // To update values dinamically, according to the user choice
    return {
      input,
      output,
      setRate(value) {
        lfo.frequency.value = value;
      },
      setDepth(value) {
        depthIn.gain.value = 1 - value;
        depthOut.gain.value = value;
      },
    };
};

const rateKnob = document.getElementById('Knob-rate-tremolo');
rateKnob.addEventListener('input', (event) => {
if (chorusNode) {
    const value = event.target.value / 5;
    chorusNode.setRate(value);
    updateKnobValues('Knob-rate-tremolo', value);
}
});

const depthKnob = document.getElementById('Knob-depth-tremolo');
depthKnob.addEventListener('input', (event) => {
if (chorusNode) {
    const value = event.target.value / 100;
    chorusNode.setDepth(value);
    updateKnobValues('Knob-depth-tremolo', value);
}
});