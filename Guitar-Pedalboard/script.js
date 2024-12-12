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
});
