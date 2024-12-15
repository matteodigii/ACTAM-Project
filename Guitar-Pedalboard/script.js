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

        // Impostiamo lo stato iniziale del LED (spento)
        let isLedOn = false;

        // Aggiungiamo l'evento al bottone per alternare lo stato del LED
        button.addEventListener('click', function () {
            // Cambia lo stato del LED
            isLedOn = !isLedOn;

            // Se il LED deve essere acceso
            if (isLedOn) {
                led.style.backgroundColor = 'white';  // LED acceso
                led.style.boxShadow = '0 0 10px 2px rgba(255, 255, 255, 0.8)';
            } else {
                led.style.backgroundColor = 'black';   // LED spento
                led.style.boxShadow = 'none';
            }
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

    // Inizializza SortableJS sul contenitore dei pedali
    new Sortable(pedalsContainer, {
        animation: 250, // Aggiunge un'animazione fluida
        ghostClass: 'ghostClass', // Aggiungi questa classe durante il drag per rendere l'elemento invisibile
        onEnd: function (evt) {
            // Quando l'utente termina il drag-and-drop, aggiorniamo l'ordine
            updatePedalSequence();
        }
    });

    // Aggiorna la sequenza all'inizio
    updatePedalSequence();
    







});





