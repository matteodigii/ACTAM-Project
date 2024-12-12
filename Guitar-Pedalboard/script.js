function toggleImage(event) {
    // Seleziona l'immagine all'interno del pulsante cliccato
    const img = event.currentTarget.querySelector('img');

    // Verifica se l'immagine è "ON", se sì, cambia a "OFF", altrimenti a "ON"
    if (img.src.includes("ON")) {
        img.src = "img/OFF.png";  // Cambia immagine a OFF
    } else {
        img.src = "img/ON.png";  // Cambia immagine a ON
    }
}


