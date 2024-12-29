

const pedalsContainer = document.getElementById('bottom-row'); // Contenitore dei pedali
const pedalSequenceList = document.getElementById('pedal-sequence'); // Elenco per visualizzare l'ordine
const bottomRow = document.getElementById('bottom-row');
const presetMenu = document.getElementById('preset-menu');
const buttons = document.querySelectorAll('.button');

// Funzione per aggiornare l'ordine dei pedali
function updatePedalSequence() {
    const pedals = pedalsContainer.children; // Ottieni tutti i pedali
    pedalSequenceList.innerHTML = ''; // Pulisce la lista esistente
    Array.from(pedals).forEach(pedal => {
        const listItem = document.createElement('li');
        listItem.textContent = pedal.querySelector('header h2').textContent; // Nome del pedale
        pedalSequenceList.appendChild(listItem); // Aggiungi alla lista
    });
}





const defaultPresets = {
    preset1: {
        order: ['compressor-pedal-container', 'overdrive-pedal-container', 'chorus-pedal-container', 'reverb-pedal-container', 'delay-pedal-container'],
        values: {
            compressor: { attack: 30, release: 40, threshold: 50, isOn: true },
            overdrive: { drive: 50, tone: 60, isOn: false },
            chorus: { mix: 70, rate: 50, depth: 40, isOn: true },
            reverb: { dryWet: 60, decay: 50, isOn: true },
            delay: { mix: 80, feedback: 40, time: 50, isOn: false }
        }
    },

    preset2: {
        order: ['delay-pedal-container', 'reverb-pedal-container', 'chorus-pedal-container', 'overdrive-pedal-container', 'compressor-pedal-container'],
        values: {
            compressor: { attack: 70, release: 60, threshold: 40, isOn: true },
            overdrive: { drive: 40, tone: 50, isOn: false },
            chorus: { mix: 50, rate: 60, depth: 70, isOn: true },
            reverb: { dryWet: 40, decay: 30, isOn: false },
            delay: { mix: 60, feedback: 70, time: 80, isOn: true }
        }
    }
};




// Carica i preset salvati dall'utente da localStorage
const userPresets = JSON.parse(localStorage.getItem('userPresets')) || {};

// Applica un preset selezionato
function applyPreset() {
    const selectedPreset = presetMenu.value;
    const presets = { ...defaultPresets, ...userPresets };

    if (presets[selectedPreset]) {
        const { order, values } = presets[selectedPreset];

        // Cambia l'ordine dei pedali nel DOM
        updatePedalOrder(order);

        // Imposta i valori dei knob per ogni pedale
        updatePedalSettings(values);
    }

    updatePedalSequence();  // Mantieni l'aggiornamento della sequenza dei pedali
}

function updatePedalOrder(order) {
    order.forEach(pedalId => {
        const pedal = document.getElementById(pedalId);
        if (pedal) pedalsContainer.appendChild(pedal);
    });
}

function updatePedalSettings(values) {
    Object.entries(values).forEach(([pedal, knobs]) => {
        const pedalContainer = document.getElementById(`${pedal}-pedal-container`);
        const led = document.getElementById(`led-${pedal}`);
        const button = document.getElementById(`button_${pedal}`); // Trova il bottone corrispondente
        Object.entries(knobs).forEach(([knob, value]) => {
            updateKnob(knob, pedal, value);
        });

        updatePedalState(pedalContainer, led, button, knobs.isOn);
    });
}

function updateKnob(knob, pedal, value) {
    const knobElement = document.getElementById(`Knob-${knob}-${pedal}`);
    const valueElement = document.getElementById(`Knob-${knob}-${pedal}-value`);
    if (knobElement && valueElement) {
        knobElement.value = value;
        valueElement.textContent = value;
    }
}


function updatePedalState(pedalContainer, led, button, isOn) {
    if (pedalContainer) {
        if (isOn) {
            led.classList.add('led-on');
            led.classList.remove('led-off');
            button.value = 1; // Imposta il valore del bottone a 1
            console.log(`Bottone ${button.id} impostato su 1`); // Log per verificare
        } else {
            led.classList.remove('led-on');
            led.classList.add('led-off');
            button.value = 0; // Imposta il valore del bottone a 0
            console.log(`Bottone ${button.id} impostato su 0`); // Log per verificare
        }
    }
}






function savePreset() {
    const newPresetName = prompt("Inserisci il nome del nuovo preset:");
    // Verifica se esiste già un preset con lo stesso nome nei userPresets o defaultPresets
    if (userPresets[newPresetName] || defaultPresets[newPresetName]) {
        if (confirm(`Il preset "${newPresetName}" esiste già. Vuoi sostituirlo?`)) {
            // Se esiste già nel userPresets, sostituiscilo
            if (userPresets[newPresetName]) {
                userPresets[newPresetName] = createPresetData();
            } else {
                // Se esiste nei defaultPresets, aggiungilo a userPresets
                userPresets[newPresetName] = defaultPresets[newPresetName];
            }
        } else {
            // Se l'utente non vuole sostituirlo, esci dalla funzione
            return;
        }
    } else {
        // Se il preset non esiste, crealo normalmente
        userPresets[newPresetName] = createPresetData();
    }

    // Salva il preset nell'oggetto userPresets
    localStorage.setItem('userPresets', JSON.stringify(userPresets)); // Aggiorna localStorage

    // Aggiorna il menu dei preset
    updatePresetMenu(newPresetName);

    alert(`Preset "${newPresetName}" salvato con successo!`);
}

// Funzione per creare i dati del preset (ordine dei pedali e valori dei knob)
function createPresetData() {
    const order = Array.from(pedalsContainer.children).map(pedal => pedal.id); // Ordine dei pedali

    const values = {};
    order.forEach(pedalId => {
        const pedal = pedalId.replace('-pedal-container', ''); // Nome del pedale
        const knobs = document.querySelectorAll(`#${pedalId} webaudio-knob`); // Recupera tutti gli elementi webaudio-knob
        const button = document.getElementById(`button_${pedal}`);
        const isOn = button.value == 1;

        values[pedal] = {};

        // Aggiungi i valori dei knob
        knobs.forEach(knob => {
            const knobName = knob.id.replace(`Knob-`, '').replace(`-${pedal}`, ''); // Nome del knob
            values[pedal][knobName] = parseInt(knob.value, 10); // Valore del knob
        });

        values[pedal].isOn = isOn; // Stato on/off
    });

    return { order, values };
}

// Funzione per aggiornare il menu dei preset
function updatePresetMenu(newPresetName) {
    // Controlla se l'option esiste già
    let optionExists = false;
    Array.from(presetMenu.options).forEach(option => {
        if (option.value === newPresetName) {
            optionExists = true;
        }
    });

    // Se non esiste, aggiungi una nuova option
    if (!optionExists) {
        const newOption = document.createElement('option');
        newOption.value = newPresetName;
        newOption.textContent = newPresetName;
        presetMenu.appendChild(newOption);
    }

    // Seleziona l'option appena creata
    presetMenu.value = newPresetName;
}


// Funzione per caricare i preset salvati dall'utente da localStorage e popolare il menu
function initializePresetMenu() {
    const savedUserPresets = JSON.parse(localStorage.getItem('userPresets')) || {};
    Object.keys(savedUserPresets).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        presetMenu.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initializePresetMenu(); // Carica i preset salvati
});