// Preset Script
const pedalsContainer = document.getElementById('bottom-row'); // Pedals Container
const pedalSequenceList = document.getElementById('pedal-sequence'); // List to visualize the order
const bottomRow = document.getElementById('bottom-row');
const presetMenu = document.getElementById('preset-menu');
const buttons = document.querySelectorAll('.button');

// Function to update pedals order
function updatePedalSequence() {
    const pedals = pedalsContainer.children; // Acquire all pedals
    pedalSequenceList.innerHTML = ''; // Clear existing list
    Array.from(pedals).forEach(pedal => {
        const listItem = document.createElement('li');
        listItem.textContent = pedal.querySelector('header h2').textContent; // Pedal's name 
        pedalSequenceList.appendChild(listItem); // Add to list
    });
}

// Default Presets, included in the WebApp
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

// Load presets saved by the user in localStorage
const userPresets = JSON.parse(localStorage.getItem('userPresets')) || {};

// Apply selected preset
function applyPreset() {
    const selectedPreset = presetMenu.value;
    const presets = { ...defaultPresets, ...userPresets };

    if (presets[selectedPreset]) {
        const { order, values } = presets[selectedPreset];

        // Change pedals order in DOM
        updatePedalOrder(order);

        // Set knob value for each pedal
        updatePedalSettings(values);
    }

    updatePedalSequence();  // Keep updated the pedal sequence
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
        const button = document.getElementById(`button_${pedal}`); // Find the corresponding button
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
            button.value = 1; // Set button value to 1
            console.log(`Bottone ${button.id} impostato su 1`); // Log to verify
        } else {
            led.classList.remove('led-on');
            led.classList.add('led-off');
            button.value = 0; // Set button value to 0
            console.log(`Bottone ${button.id} impostato su 0`); // Log to verify
        }
    }
}

// Save Preset Function
function savePreset() {
    const newPresetName = prompt("Inserisci il nome del nuovo preset:");
    // Verify if it already exists a preset with the same name in userPresets or defaultPresets
    if (userPresets[newPresetName] || defaultPresets[newPresetName]) {
        if (confirm(`Il preset "${newPresetName}" esiste già. Vuoi sostituirlo?`)) {
            // If yes (in userPresets), replace it
            if (userPresets[newPresetName]) {
                userPresets[newPresetName] = createPresetData();
            } else {
                // If yes (in defaultPresets), add it to userPresets
                userPresets[newPresetName] = defaultPresets[newPresetName];
            }
        } else {
            // If the user does not wish to replace it, exit the function
            return;
        }
    } else {
        // If not, create it normally
        userPresets[newPresetName] = createPresetData();
    }

    // Save the preset in the object userPresets
    localStorage.setItem('userPresets', JSON.stringify(userPresets)); // Aggiorna localStorage

    // Update preset menu
    updatePresetMenu(newPresetName);

    alert(`Preset "${newPresetName}" salvato con successo!`);
}

// Create Preset Data Function (pedals order and knobs value)
function createPresetData() {
    const order = Array.from(pedalsContainer.children).map(pedal => pedal.id); // Pedals order

    const values = {};
    order.forEach(pedalId => {
        const pedal = pedalId.replace('-pedal-container', ''); // Pedal name
        const knobs = document.querySelectorAll(`#${pedalId} webaudio-knob`); // Get all webaudio-knob elements
        const button = document.getElementById(`button_${pedal}`);
        const isOn = button.value == 1;

        values[pedal] = {};

        // Add knob values
        knobs.forEach(knob => {
            const knobName = knob.id.replace(`Knob-`, '').replace(`-${pedal}`, ''); // Knob name
            values[pedal][knobName] = parseInt(knob.value, 10); // Knob value
        });

        values[pedal].isOn = isOn; // On/Off status
    });

    return { order, values };
}

// Update Preset Menu Function
function updatePresetMenu(newPresetName) {
    // Check if the option already exists
    let optionExists = false;
    Array.from(presetMenu.options).forEach(option => {
        if (option.value === newPresetName) {
            optionExists = true;
        }
    });

    // If not, add a new one
    if (!optionExists) {
        const newOption = document.createElement('option');
        newOption.value = newPresetName;
        newOption.textContent = newPresetName;
        presetMenu.appendChild(newOption);
    }

    // Select the newly created option
    presetMenu.value = newPresetName;
}

// Loading user presets from localStorage and populating the menu Function
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
    initializePresetMenu(); // Load saved presets
});


function deletePreset() {
    const selectedPreset = presetMenu.value; // Ottiene il preset selezionato

    if (!selectedPreset || (!userPresets[selectedPreset] && !defaultPresets[selectedPreset])) {
        alert("Seleziona un preset valido da eliminare.");
        return;
    }

    if (defaultPresets[selectedPreset]) {
        alert(`Il preset \"${selectedPreset}\" è un preset di default e non può essere eliminato.`);
        return;
    }

    if (confirm(`Sei sicuro di voler eliminare il preset \"${selectedPreset}\"?`)) {
        // Rimuove il preset da userPresets
        delete userPresets[selectedPreset];

        // Aggiorna il localStorage
        localStorage.setItem('userPresets', JSON.stringify(userPresets));

        // Rimuove l'opzione dal menu a tendina
        const optionToRemove = presetMenu.querySelector(`option[value="${selectedPreset}"]`);
        if (optionToRemove) {
            optionToRemove.remove();
        }

        // Deseleziona il menu a tendina
        presetMenu.value = "";

        alert(`Il preset \"${selectedPreset}\" è stato eliminato con successo!`);
    }
}
