document.addEventListener('DOMContentLoaded', function () {
    // Funzione per aggiornare il valore della manopola
    function updateKnobValue(knob, valueDisplay) {
        knob.addEventListener('input', function() {
            // Aggiorna il valore visualizzato nel <span>
            valueDisplay.textContent = Math.round(knob.value);
        });
    }

    // Seleziona tutte le manopole e i rispettivi display
    const knobs = document.querySelectorAll('webaudio-knob');
    knobs.forEach(function(knob) {
        const valueDisplay = knob.nextElementSibling;
        updateKnobValue(knob, valueDisplay);
    });







    // Selezioniamo tutti i bottoni e i LED
    const buttons = document.querySelectorAll('.button');
    const leds = document.querySelectorAll('.led');

    buttons.forEach(function(button, index) {
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
});