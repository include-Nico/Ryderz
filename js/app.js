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

        // --- AGGIORNAMENTO SOLDI NEL MENU ---
        if (screenName === 'home') {
            const moneyEl = document.getElementById('home-banknotes');
            if (moneyEl) moneyEl.innerText = playerProfile.banknotes;
            
            const instructionsElement = document.getElementById('instructions-text');
            if (instructionsElement) {
                if (isTouchDevice()) instructionsElement.innerHTML = "📱 <b>Mobile:</b> Tieni premuto per accelerare e trascina per sterzare.";
                else instructionsElement.innerHTML = "💻 <b>PC:</b> Tieni premuto <b>W</b> (o Su) per accelerare. Usa <b>A</b> e <b>D</b> per sterzare.";
            }
        }

        // --- STAMPA I DATI SULLA SCHERMATA DEI RISULTATI ---
        if (screenName === 'result') {
            document.getElementById('result-score').innerText = window.lastScore || 0;
            document.getElementById('result-cash').innerText = window.lastCash || 0;
        }

        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        const tabs = document.getElementById('bottom-tabs');
        if (screenName === 'game') {
            tabs.style.display = 'none';
            initGame(); 
        } else {
            // Mostriamo i tab ovunque, TRANNE che nel gioco e nei risultati post-incidente
            if (screenName === 'result') {
                tabs.style.display = 'none';
            } else {
                tabs.style.display = 'flex';
            }
            if (typeof stopEngine === "function") stopEngine(); 
        }

    } catch (error) { console.error("Errore:", error); }
}
