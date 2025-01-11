// Reverb Pedal

const reverbPedal = function (audioContext, input) {
    
    // Default Settings
    const defaults = {
        mix: document.getElementById("Knob-dryWet-reverb").value / 100 ,
        tone: document.getElementById("Knob-decay-reverb").value * 100 , 
    };

    const output = audioContext.createGain();
    const boost = audioContext.createGain();
    const reverb = audioContext.createConvolver();
    const filter = audioContext.createBiquadFilter();
    const wetGain = audioContext.createGain();
    
    filter.type = 'lowpass';
    boost.gain.value = 1.5;

    // Assuring the impulse response is correctly loaded, otherwise send an error
    if (typeof impulseResponseBuffer !== "undefined" && impulseResponseBuffer !== null) {
        reverb.buffer = impulseResponseBuffer;
    } else {
        console.error("Impulse response buffer not loaded.");
    }

    // Apply default values
    wetGain.gain.value = defaults.mix;
    filter.frequency.value = defaults.tone;

    // Implement reverb chain (splitting in dry/wet to later recombine and filter)
    input.connect(boost); 
    boost.connect(filter); // Dry signal
    boost.connect(wetGain); // Wet signal
    wetGain.connect(reverb);
    reverb.connect(filter);
    filter.connect(output);

    // To update values dinamically, according to the user choice
    return {
        input,
        output,
        setMix(value) {
            // Assuring mix is between 0 and 1
            const mixValue = Math.max(0, Math.min(1, value));
            wetGain.gain.value = mixValue;
        },
        setTone(value) {
            filter.frequency.value = value;
        },
    };
};

const mixreverbKnob = document.getElementById("Knob-dryWet-reverb");
mixreverbKnob.addEventListener('input', (event) => {
  if (reverbNode) {
      const value = event.target.value / 100;
      reverbNode.setMix(value);
      updateKnobValues('Knob-dryWet-reverb', value);
  }
});

const tonereverbKnob = document.getElementById("Knob-decay-reverb");
tonereverbKnob.addEventListener('input', (event) => {
  if (reverbNode) {
      const value = event.target.value * 100;
      reverbNode.setTone(value);
      updateKnobValues('Knob-decay-reverb', value);
  }
});
