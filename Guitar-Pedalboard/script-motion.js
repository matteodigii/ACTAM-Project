// Motion script
document.addEventListener('DOMContentLoaded', function () {

    // To adjust knob values
    function updateKnobValue(knob, valueDisplay) {
        knob.addEventListener('input', function () {
            // Update visualized value in <span>
            valueDisplay.textContent = Math.round(knob.value);
        });
    }

    // Select all knobs and their display
    const knobs = document.querySelectorAll('webaudio-knob');
    knobs.forEach(function (knob) {
        const valueDisplay = knob.nextElementSibling;
        updateKnobValue(knob, valueDisplay);
    });

    // Select all buttons and LEDs
    const buttons = document.querySelectorAll('.button');
    const leds = document.querySelectorAll('.led');

    buttons.forEach(function (button, index) {
        // Each pedal will have its corresponding LED
        const led = leds[index];

        // Function to adjourn LED status focusing on button value
        function updateLedState() {
            if (button.value == 1) {
                led.classList.add('led-on');
                led.classList.remove('led-off');
            } else {
                led.classList.remove('led-on');
                led.classList.add('led-off');
            }
        }

        // Initialize LED status
        updateLedState();

        // Add the click event to the button an update LED status
        button.addEventListener('click', function () {

            // Update LED Status
            updateLedState();
        });
    });

    const pedalsContainer = document.getElementById('bottom-row'); // Pedals container
    const pedalSequenceList = document.getElementById('pedal-sequence'); // List to visualize the order

    // Function to update pedals' order 
    function updatePedalSequence() {
        const pedals = pedalsContainer.children; // Acquire all pedals
        pedalSequenceList.innerHTML = ''; // Clean the existing list
        Array.from(pedals).forEach(pedal => {
            const listItem = document.createElement('li');
            listItem.textContent = pedal.querySelector('header h2').textContent; // Pedal name
            pedalSequenceList.appendChild(listItem); // Add to the list
        });
    }

    // Update sequence
    updatePedalSequence();

    // Initialize SortableJS on the pedals container
    new Sortable(pedalsContainer, {
        animation: 250, // Smooth animation
        ghostClass: 'ghostClass', // Add this class during drag to make the element invisible
        onEnd: function (evt) {
            // When the user stops the drag-and-drop, update the order
            updatePedalSequence();
        }
    });

    //RESET

    // Memorize initial values of the knobs to do the reset
    const initialKnobValues = {};
    const presetMenu = document.getElementById('preset-menu');

    // Select all knobs and their display
    const allKnobs = document.querySelectorAll('webaudio-knob');
    allKnobs.forEach(function (knobElement) {
        // Memorize initial value of each knob 
        initialKnobValues[knobElement.id] = knobElement.value;
    });

    // Reset function
    function resetPedalOrder(originalOrder) {
        originalOrder.forEach(function (id) {
            const pedalContainer = document.getElementById(id);
            pedalsContainer.appendChild(pedalContainer); // Bring back all pedals to the original order
        });
    }

    function resetKnobValues(allKnobs, initialKnobValues) {
        allKnobs.forEach(function (knobElement) {
            knobElement.value = initialKnobValues[knobElement.id] || 50; // Use the initial memorized value or 50 as fallback
            knobElement.dispatchEvent(new Event('input')); // Update visualized value
        });
    }

    function resetLedStates(leds, buttons) {
        leds.forEach(function (led, index) {
            const button = buttons[index]; // Select the button corresponding to the LED
            if (led.classList.contains('led-on')) {
                button.value = 0; // Set the button to 0
                led.classList.remove('led-on');
                led.classList.add('led-off');
            }
        });
    }

    function resetPresetMenu(presetMenu) {
        presetMenu.value = ""; // Deselect the preset
       
    }

    function initializeResetButton() {
        const resetButton = document.getElementById('reset-pedals');
        resetButton.addEventListener('click', function () {
            const originalOrder = [
                'compressor-pedal-container',
                'overdrive-pedal-container',
                'chorus-pedal-container',
                'reverb-pedal-container',
                'delay-pedal-container'
            ];

            resetPedalOrder(originalOrder);
            resetKnobValues(allKnobs, initialKnobValues);
            resetLedStates(leds, buttons);
            updatePedalSequence(); // Update pedal sequence list
            resetPresetMenu(presetMenu); // Reset preset menu
        });
    }

    // Initialize reset button
    initializeResetButton();

});





