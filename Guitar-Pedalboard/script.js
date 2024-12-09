const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Seleziona gli input delle manopole
const timeKnob = document.getElementById('knob-time');
const feedbackKnob = document.getElementById('knob-feedback');
const levelKnob = document.getElementById('knob-level');

// Seleziona il LED per simulare l'attivazione del delay
const led = document.querySelector('.led-light');

// Variabili globali per gestire l'oscillatore, il delay e il timer di durata
let osc = null;
let delayNode = null;
let stopTimeout = null;

// Funzione per configurare l'effetto delay con feedback
function configureDelay() {
    // Crea un delay node
    delayNode = audioContext.createDelay();
    delayNode.delayTime.value = timeKnob.value / 100; // Imposta il tempo di ritardo in secondi

    // Crea un gain node per controllare il feedback (volume delle ripetizioni)
    const feedbackGain = audioContext.createGain();
    feedbackGain.gain.value = feedbackKnob.value / 100; // Controlla l'intensità delle ripetizioni

    // Crea un gain node per controllare il livello (volume finale) del segnale in uscita
    const outputGain = audioContext.createGain();
    outputGain.gain.value = levelKnob.value / 100; // Controlla il livello complessivo del delay

    // Configura il circuito di feedback: output del delay rimandato al suo ingresso
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode); // Collegamento di feedback

    // Connetti il delay al gain di uscita
    delayNode.connect(outputGain);

    // Connetti l'uscita del delay alla destinazione (uscita audio)
    outputGain.connect(audioContext.destination);
}

// Funzione per generare il suono con delay e feedback
function xray() {
    if (osc) {
        // Se è già in esecuzione, non fare nulla
        return;
    }

    // Crea un oscillatore
    osc = audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 440;

    // Crea un nodo gain per il volume iniziale dell'oscillatore
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.5, audioContext.currentTime); // Volume dell'oscillatore

    // Configura e ottieni il delay con feedback
    configureDelay();

    // Collegamenti: osc -> gain (volume) -> delay
    osc.connect(gain);
    gain.connect(delayNode); // L'oscillatore va direttamente all'uscita senza passare dal delay

    // Avvia l'oscillatore
    osc.start();

    // Imposta il LED per indicare che il suono è attivo
    led.style.opacity = 1;

    // Imposta un timeout per fermare automaticamente il suono dopo 1 secondo
    stopTimeout = setTimeout(stopSound, 2000);
}

// Funzione per fermare il suono e il delay
function stopSound() {
    if (osc) {
        osc.stop(); // Ferma l'oscillatore
        osc.disconnect(); // Disconnetti l'oscillatore dai nodi
        osc = null; // Reimposta la variabile

        if (delayNode) {
            delayNode.disconnect(); // Disconnetti anche il nodo delay
            delayNode = null; // Reimposta la variabile
        }

        // Spegni il LED
        led.style.opacity = 0;
    }

    // Cancella il timeout se esiste
    if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
    }
}

// Aggiungi i listener ai pulsanti
document.getElementById('startButton').addEventListener('click', xray);
document.getElementById('stopButton').addEventListener('click', stopSound);
