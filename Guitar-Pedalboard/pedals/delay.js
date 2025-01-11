// Delay Pedal

const delayPedal = function (audioContext, input) {
    
    // Default settings
    const defaults = {
        tone: 3200,
        speed: document.getElementById("Knob-time-delay").value / 200,
        mix: document.getElementById("Knob-mix-delay").value / 100,
        feedback: document.getElementById("Knob-feedback-delay").value / 101,
        maxDelay: 1
    };

    const output = audioContext.createGain();
    const delay = audioContext.createDelay(defaults.maxDelay);
    const feedbackGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const mixGain = audioContext.createGain();

    // Apply default values
    delay.delayTime.value = defaults.speed;
    feedbackGain.gain.value = defaults.feedback;
    mixGain.gain.value = defaults.mix;
    filter.frequency.value = defaults.tone;

    // Linking the nodes
    input.connect(filter);
    filter.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    feedbackGain.connect(mixGain);
    mixGain.connect(output);
    input.connect(output);

    // To update values dinamically, according to the user choice
    return {
        input,
        output,
        setTime(value) {
            delay.delayTime.value = value;
        },
        setMix(value) {
            mixGain.gain.value = value;
        },
        setFeedback(value) {
            feedbackGain.gain.value = value;
        },
        setTone(value) {
            filter.frequency.value = value;
        },
    };
};

const timeKnob = document.getElementById('Knob-time-delay');
timeKnob.addEventListener('input', (event) => {
  if (delayNode) {
      const value = event.target.value / 200;
      delayNode.setTime(value);
      updateKnobValues('Knob-time-delay', value);
  }
});

const delaymixKnob = document.getElementById('Knob-mix-delay');
delaymixKnob.addEventListener('input', (event) => {
  if (delayNode) {
      const value = event.target.value / 100;
      delayNode.setMix(value);
      updateKnobValues('Knob-mix-delay', value);
  }
});

const delayfeedbackKnob = document.getElementById('Knob-feedback-delay');
delayfeedbackKnob.addEventListener('input', (event) => {
  if (delayNode) {
      const value = event.target.value / 101;
      delayNode.setFeedback(value);
      updateKnobValues('Knob-feedback-delay', value);
  }
});
