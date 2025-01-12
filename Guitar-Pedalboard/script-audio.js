// AUDIO SCRIPT (Getting input + updating sequence according to user interaction)

// Global Variables: 
// - Audionodes to be set to null 
// - Buttons that will vary in value during computation

let audioContext = null;
let lineInSource = null;
let compressorNode = null;
let overdriveNode = null;
let tremoloNode = null;
let reverbNode = null;
let delayNode = null;
let button1 = document.getElementById('button_compressor');
let button2 = document.getElementById('button_overdrive');
let button3 = document.getElementById('button_reverb');
let button4 = document.getElementById('button_tremolo');
let button5 = document.getElementById('button_delay');

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

// Fuction for updating knob values
function updateKnobValues(id, value) {
    const valueElement = document.getElementById(`${id}-value`);
    if (valueElement) {
      valueElement.textContent = value;
    }
}

// Main Part
document.getElementById('play-audio').addEventListener('click', async function () {
  const statusDiv = document.getElementById('status');
  const buttonplay = this;

  // If there isn't already an active audioContext, create one
  if (!audioContext) {
    // Activate Audio
    try {
      // Create an AudioContext using latency 'interactive', since we're dealing with
      // real time processing, sample rate at 48kHz
      audioContext = new AudioContext({ latencyHint: 'interactive', sampleRate: 48000 });
      console.log('Base latency:', audioContext.baseLatency, 'seconds');

      // Resume AudioContext if it's suspended, this is done to avoid Chrome errors
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Request audio flux from the audio interface with getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          latency: { ideal: 0.001 }, // Objective: very low latency
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1, // Mono
          sampleRate: 48000, // Sampling frequency
        }
      });

      // Create a source node from the audio flux
      lineInSource = audioContext.createMediaStreamSource(stream);

      // Loading Reverb Impulse-Response (IR)
      loadImpulseResponse('impulse-response.wav');

      // Since the guitar line input is quite low
      input = audioContext.createGain();
      input.gain.value = 2;

      lineInSource.connect(input);

      // Firstly connect the input to the output
      updateChain(audioContext, input);

      // Check for all the possible active connections to implement
      const switches = document.querySelectorAll('webaudio-switch');
      switches.forEach(function (button) {
        button.addEventListener('click', function(){
           updateChain(audioContext, input);
        })
      });

      // If the user wants reset, adjourn pedalboard
      document.getElementById('reset-pedals').addEventListener('click', async function () {
        updateChain(audioContext, input);
      });

      // If the user switches preset, adjourn pedalboard
      document.getElementById('preset-menu').addEventListener('click', async function () {
        updateChain(audioContext, input);
      });

      document.getElementById('rec-button').addEventListener('click', async function () {
        const buttonrec = this;
        if(audioContext){
          if (!mediaRecorder) {
            try {
              // Creating a MediaStreamDestination to capture the output of the signal chain 
              const destination = audioContext.createMediaStreamDestination();
          
              // Link the last node of the audio chain to MediaStreamDestination
              updateRecord(audioContext, input, destination);
          
              // SetUp the MediaRecorder with the generated stream
              mediaRecorder = new MediaRecorder(destination.stream);
              mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  recordedChunks.push(event.data);
                }
              };
              
              mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recordedChunks, { type: "audio/wav" });
                recordedChunks = [];
          
                // Creating and URL for the registered audio 
                const audioURL = URL.createObjectURL(audioBlob);
                console.log("Available recorded audio here:", audioURL);
          
                // Create automatically a download link and start the download 
                const downloadLink = document.createElement("a");
                downloadLink.href = audioURL;
                downloadLink.download = "Recording.wav"; // File name
          
                // Start automatically the download
                downloadLink.click();
          
                // Release temporary URL
                URL.revokeObjectURL(audioURL);
              };
          
            } catch (error) {
              console.error("Error during recorder configuration:", error);
              statusDiv.textContent = "Error: Recording Configuration Impossible.";
              return;
            }
          }    
          // Start or Stop the recording
          if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            statusDiv.textContent = "Recording Interrupted.";
            console.log("Recording Interrupted.");
            buttonrec.textContent = 'REC';
            buttonrec.classList.remove('record'); // Add class to make the button green
          } else {
            recordedChunks = [];
            mediaRecorder.start();
            isRecording = true;
            statusDiv.textContent = "Recording Started.";
            console.log("Recording Started.");
            buttonrec.textContent = 'ON';
            buttonrec.classList.add('record'); // Add class to make the button green
          }          
        }
      });
    
      // Adjourn User Interface
      buttonplay.textContent = 'Disconnect Audio Input';
      buttonplay.classList.add('disconnect'); // Add class to make the button red
      statusDiv.textContent = 'Status: Audio Active';

    } catch (error) {
      console.error('Error during audio activation:', error);
      statusDiv.textContent = 'Error: Failed Audio Activation';
    }
  } else {
    // Disactivate audio
    try {
      // Disconnect and close AudioContext
      if (lineInSource) {
        lineInSource.disconnect();
        lineInSource = null;
      }
      await audioContext.close();
      audioContext = null;

      // Adjourn UI
      buttonplay.textContent = 'Connect Audio Input';
      buttonplay.classList.remove('disconnect'); // Remove class to bring the button to the original color
      statusDiv.textContent = 'Status: Audio Inactive';

    } catch (error) {
      console.error('Error during audio disactivation:', error);
      statusDiv.textContent = 'Error: Failed Audio Disactivation';
    }
  }
});

// Function to fetch and decode the impulse response
function loadImpulseResponse(url) {
  return fetch(url)
    .then(response => response.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => {
      impulseResponseBuffer = buffer; // Store the buffer for later use
      console.log('Impulse response loaded successfully.');
    })
    .catch(error => console.error('Error loading the impulse response:', error));
}

// Update Chain Function
function updateChain(audioContext, input){

  // Disconnect everything
  if(input){
    input.disconnect();
  }
  if(compressorNode){
    compressorNode.output.disconnect();
    compressorNode = null;
  }
  if(overdriveNode){
    overdriveNode.output.disconnect();
    overdriveNode = null;
  }
  if(tremoloNode){
    tremoloNode.output.disconnect();
    tremoloNode = null;
  }
  if(reverbNode){
    reverbNode.output.disconnect();
    reverbNode = null;
  }
  if(delayNode){
    delayNode.output.disconnect();
    delayNode = null;
  }

  // Begin the dynamic list processing
  let currentNode = input;

  // If i see a pedal on, i visit that specific node
  if(button1.value === 1){
    compressorNode = compressorPedal(audioContext, currentNode);
    currentNode = compressorNode.output;
  }
  if(button2.value === 1){
    overdriveNode = overdrivePedal(audioContext, currentNode);
    currentNode = overdriveNode.output;
  }
  if(button3.value === 1){
    reverbNode = reverbPedal(audioContext, currentNode);
    currentNode = reverbNode.output;
  }
  if(button4.value === 1){
    tremoloNode = tremoloPedal(audioContext, currentNode);
    currentNode = tremoloNode.output;
  }
  if(button5.value === 1){
    delayNode = delayPedal(audioContext, currentNode);
    currentNode = delayNode.output;
  }

  // To hear a final stereo sound
  const merger = audioContext.createChannelMerger(2);
  currentNode.connect(merger, 0, 0); // Left
  currentNode.connect(merger, 0, 1); // Right
  merger.connect(audioContext.destination);

}

// Update for Recording Function
function updateRecord(audioContext, input, destination){

  // Disconnect everything
  if(input){
    input.disconnect();
  }
  if(compressorNode){
    compressorNode.output.disconnect();
    compressorNode = null;
  }
  if(overdriveNode){
    overdriveNode.output.disconnect();
    overdriveNode = null;
  }
  if(tremoloNode){
    tremoloNode.output.disconnect();
    tremoloNode = null;
  }
  if(reverbNode){
    reverbNode.output.disconnect();
    reverbNode = null;
  }
  if(delayNode){
    delayNode.output.disconnect();
    delayNode = null;
  }

  // Begin the dynamic list processing
  let currentNode = input;

  // If i see a pedal on, i visit that specific node
  if(button1.value === 1){
    compressorNode = compressorPedal(audioContext, currentNode);
    currentNode = compressorNode.output;
  }
  if(button2.value === 1){
    overdriveNode = overdrivePedal(audioContext, currentNode);
    currentNode = overdriveNode.output;
  }
  if(button3.value === 1){
    reverbNode = reverbPedal(audioContext, currentNode);
    currentNode = reverbNode.output;
  }
  if(button4.value === 1){
    tremoloNode = tremoloPedal(audioContext, currentNode);
    currentNode = tremoloNode.output;
  }
  if(button5.value === 1){
    delayNode = delayPedal(audioContext, currentNode);
    currentNode = delayNode.output;
  }

  // To hear a final stereo sound
  const merger = audioContext.createChannelMerger(2);
  currentNode.connect(merger, 0, 0); // Left
  currentNode.connect(merger, 0, 1); // Right
  merger.connect(audioContext.destination);

  // If a destination exist also connect it (this is to have stereo output)
  if(destination){
    merger.connect(destination);
  }
}


document.getElementById('rec-button').addEventListener('click', async function () {
  const statusDiv = document.getElementById('status');
  if(!audioContext){
    statusDiv.textContent = 'Nothing to be recorded yet!';
  }
});

//////////////////////////////////////////////////

// Pedal Section

//////////////////////////////////////////////////

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
  if (tremoloNode) {
      const value = event.target.value / 5;
      tremoloNode.setRate(value);
      updateKnobValues('Knob-rate-tremolo', value);
  }
});

const depthKnob = document.getElementById('Knob-depth-tremolo');
depthKnob.addEventListener('input', (event) => {
  if (tremoloNode) {
      const value = event.target.value / 100;
      tremoloNode.setDepth(value);
      updateKnobValues('Knob-depth-tremolo', value);
  }
});

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
