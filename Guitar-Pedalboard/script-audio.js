// Getting Guitar Input
let audioContext = null;
let lineInSource = null;

document.getElementById('play-audio').addEventListener('click', async function () {
  const statusDiv = document.getElementById('status');
  const button = this;

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

      // Create a ChannelMergerNode to convert the mono signal in a stereo one,
      // otherwise you would hear just on the left channel
      const merger = audioContext.createChannelMerger(2);

      // Connect the mono signal on both channels
      lineInSource.connect(merger, 0, 0); // Left
      lineInSource.connect(merger, 0, 1); // Right

      // Connect merger node to audio destination (output speakers)
      merger.connect(audioContext.destination);

      // Adjourn User Interface
      button.textContent = 'Disconnect Audio Input';
      button.classList.add('disconnect'); // Add class to make the button red
      statusDiv.textContent = 'Status: audio active';

    } catch (error) {
      console.error('Error during audio activation:', error);
      statusDiv.textContent = 'Error: failed audio activation';
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
      button.textContent = 'Connect Audio Input';
      button.classList.remove('disconnect'); // Remove class to bring the button to the original color
      statusDiv.textContent = 'Status: audio inactive';

    } catch (error) {
      console.error('Error during audio disactivation:', error);
      statusDiv.textContent = 'Error: failed audio disactivation';
    }
  }
});
