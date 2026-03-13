// Carica la Home all'avvio dell'app
window.onload = () => {
    loadScreen('home');
};

// Rileva se stiamo usando uno smartphone
function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
}

// Carica le varie sezioni HTML
async function loadScreen(screenName, clickedTab = null) {
    try {
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        
        document.getElementById('screens-area').innerHTML = html;

        // --- LOGICA ISTRUZIONI HOME ---
        if (screenName === 'home') {
            const instructionsElement = document.getElementById('instructions-text');
            if (instructionsElement) {
                if (isTouchDevice()) {
                    instructionsElement.innerHTML = "📱 <strong>Mobile:</strong> Tieni premuto per accelerare e trascina il dito per sterzare.";
                } else {
                    instructionsElement.innerHTML = "💻 <strong>PC:</strong> Tieni premuto <b>W</b> (o Freccia Su) per accelerare. Usa <b>A</b> e <b>D</b> per sterzare.";
                }
            }
        }

        // Gestione grafica dei tab in basso
        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        // Se apriamo il gioco, nascondiamo i menu e avviamo il motore
        const tabs = document.getElementById('bottom-tabs');
        if (screenName === 'game') {
            tabs.style.display = 'none';
            initGame(); // Questa funzione si trova in game.js
        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
        }

    } catch (error) {
        console.error("Errore nel caricamento della pagina:", error);
    }
}
