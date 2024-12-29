

document.addEventListener('DOMContentLoaded', function () {

    // Funzione per aggiornare il valore della manopola
    function updateKnobValue(knob, valueDisplay) {
        knob.addEventListener('input', function () {
            // Aggiorna il valore visualizzato nel <span>
            valueDisplay.textContent = Math.round(knob.value);
        });
    }

    // Seleziona tutte le manopole e i rispettivi display
    const knobs = document.querySelectorAll('webaudio-knob');
    knobs.forEach(function (knob) {
        const valueDisplay = knob.nextElementSibling;
        updateKnobValue(knob, valueDisplay);
    });


    // Selezioniamo tutti i bottoni e i LED
    const buttons = document.querySelectorAll('.button');
    const leds = document.querySelectorAll('.led');


    buttons.forEach(function (button, index) {
        // Ogni pedale avrà il suo LED corrispondente
        const led = leds[index];

        // Funzione per aggiornare lo stato del LED in base al valore del bottone
        function updateLedState() {
            if (button.value == 1) {
                led.classList.add('led-on');
                led.classList.remove('led-off');
            } else {
                led.classList.remove('led-on');
                led.classList.add('led-off');
            }
        }

        // Imposta lo stato iniziale del LED
        updateLedState();

        // Aggiungiamo l'evento al bottone per alternare il valore e aggiornare lo stato del LED
        button.addEventListener('click', function () {

            // Aggiorna lo stato del LED
            updateLedState();
        });
    });





    const pedalsContainer = document.getElementById('bottom-row'); // Contenitore dei pedali
    const pedalSequenceList = document.getElementById('pedal-sequence'); // Elenco per visualizzare l'ordine

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

    // Aggiorna la sequenza all'inizio
    updatePedalSequence();

    // Inizializza SortableJS sul contenitore dei pedali
    new Sortable(pedalsContainer, {
        animation: 250, // Aggiunge un'animazione fluida
        ghostClass: 'ghostClass', // Aggiungi questa classe durante il drag per rendere l'elemento invisibile
        onEnd: function (evt) {
            // Quando l'utente termina il drag-and-drop, aggiorniamo l'ordine
            updatePedalSequence();
        }
    });




    //RESET

    // Memorizza i valori iniziali dei knob per fare il reset
    const initialKnobValues = {};

    // Seleziona tutte le manopole e i rispettivi display
    const allKnobs = document.querySelectorAll('webaudio-knob');
    allKnobs.forEach(function (knobElement) {
        // Memorizza il valore iniziale di ogni manopola
        initialKnobValues[knobElement.id] = knobElement.value;
    });


    // Funzione di reset
    const resetButton = document.getElementById('reset-pedals');
    resetButton.addEventListener('click', function () {
        // Ripristina l'ordine dei pedali
        const originalOrder = [
            'compressor-pedal-container',
            'overdrive-pedal-container',
            'chorus-pedal-container',
            'reverb-pedal-container',
            'delay-pedal-container'
        ];

        originalOrder.forEach(function (id) {
            const pedalContainer = document.getElementById(id);
            pedalsContainer.appendChild(pedalContainer); // Aggiunge ogni pedale all'ordine originale
        });

        // Ripristina i valori dei knob ai valori iniziali
        allKnobs.forEach(function (knobElement) {
            knobElement.value = initialKnobValues[knobElement.id] || 50; // Usa il valore iniziale memorizzato o 50 se non presente
            knobElement.dispatchEvent(new Event('input')); // Forza l'aggiornamento del valore visualizzato
        });

        // Ripristina lo stato dei LED
        leds.forEach(function (led, index) {
            const button = buttons[index]; // Seleziona il bottone corrispondente al LED

            // Controlla se il LED è acceso (se ha la classe 'led-on')
            if (led.classList.contains('led-on')) {
                // Se il LED è acceso, simula un clic sul bottone per spegnerlo
                button.value = 0;
                led.classList.remove('led-on');
                led.classList.add('led-off');
            
                // Log per verificare il cambiamento del valore del bottone
                console.log(`Bottone ${button.id} resettato a ${button.value}`);
            }
            // Se il LED è già spento, non fare nulla (lo stato è già corretto)
        });
        // Aggiorna la lista della sequenza dei pedali
        updatePedalSequence();

    });









});





