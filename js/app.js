// --- GESTIONE AUDIO MENU ---
let menuMusic = new Audio('audio/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.4; // Volume al 40% per non assordare

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

        // Gestione bottoni in basso
        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        const tabs = document.getElementById('bottom-tabs');
        
        // --- LOGICA AUDIO E SCHERMATE ---
        if (screenName === 'game' || screenName === 'result') {
            tabs.style.display = 'none';
            menuMusic.pause(); // Ferma la musica del menu
            
            if (screenName === 'game') {
                initGame(); 
            }
        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            
            // Fai partire la musica del menu (il catch evita errori se il browser blocca l'autoplay iniziale)
            menuMusic.play().catch(e => console.log("In attesa del primo click dell'utente per l'audio..."));
        }

    } catch (error) { console.error("Errore:", error); }
}
