// Carica la Home all'avvio dell'app
window.onload = () => {
    loadScreen('home');
};

// Funzione per rilevare se il dispositivo supporta il touch
function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
}

// Funzione che carica i file HTML esterni
async function loadScreen(screenName, clickedTab = null) {
    try {
        // 1. Va a pescare il file HTML (nella cartella 'screen')
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        
        // 2. Lo inserisce nell'area dello schermo
        document.getElementById('screens-area').innerHTML = html;

        // --- LOGICA DELLE ISTRUZIONI: controlla il dispositivo ---
        if (screenName === 'home') {
            const instructionsElement = document.getElementById('instructions-text');
            if (instructionsElement) {
                if (isTouchDevice()) {
                    // Testo per Smartphone / Tablet
                    instructionsElement.innerHTML = "📱 <strong>Mobile:</strong> Trascina il dito a destra e sinistra sulla strada.";
                } else {
                    // Testo per Computer
                    instructionsElement.innerHTML = "💻 <strong>PC:</strong> Usa i tasti <b>A</b> e <b>D</b> (o le frecce) per sterzare.";
                }
            }
        }

        // 3. Gestisce i tab in basso
        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        // 4. Logica speciale: se carichiamo il gioco, nascondiamo i tab e avviamo il motore
        const tabs = document.getElementById('bottom-tabs');
        if (screenName === 'game') {
            tabs.style.display = 'none';
            // Inizializza il canvas DOPO che è stato caricato nell'HTML
            initGame(); 
        } else {
            tabs.style.display = 'flex';
            // Ferma il gioco se torniamo al menu
            if (typeof stopEngine === "function") stopEngine(); 
        }

    } catch (error) {
        console.error("Errore nel caricamento della pagina:", error);
    }
}
