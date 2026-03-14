// --- GESTIONE AUDIO MENU ---
let menuMusic = new Audio('audio/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.4; 
let isAudioEnabled = false; // Stato globale dell'audio

window.onload = () => {
    loadScreen('home');
};

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
}

// Nuova funzione per attivare l'audio tramite click dell'utente
function enableAudio() {
    isAudioEnabled = true;
    menuMusic.play().catch(e => console.log("Audio sbloccato"));
    
    // Aggiorna l'interfaccia se necessario
    const btn = document.getElementById('btn-audio-toggle');
    if (btn) btn.style.display = 'none'; // Nascondi il tasto dopo l'attivazione
}

async function loadScreen(screenName, clickedTab = null) {
    try {
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        document.getElementById('screens-area').innerHTML = html;

        if (screenName === 'home') {
            const moneyEl = document.getElementById('home-banknotes');
            if (moneyEl) moneyEl.innerText = playerProfile.banknotes;
            
            const instructionsElement = document.getElementById('instructions-text');
            if (instructionsElement) {
                if (isTouchDevice()) instructionsElement.innerHTML = "📱 <b>Mobile:</b> Tieni premuto per accelerare e trascina per sterzare.";
                else instructionsElement.innerHTML = "💻 <b>PC:</b> Tieni premuto <b>W</b> (o Su) per accelerare. Usa <b>A</b> e <b>D</b> per sterzare.";
            }

            // Mostra il tasto audio solo se non è ancora stato attivato
            const btn = document.getElementById('btn-audio-toggle');
            if (btn && isAudioEnabled) btn.style.display = 'none';
        }

        if (screenName === 'result') {
            document.getElementById('result-score').innerText = window.lastScore || 0;
            document.getElementById('result-cash').innerText = window.lastCash || 0;
        }

        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        const tabs = document.getElementById('bottom-tabs');
        
        if (screenName === 'game' || screenName === 'result') {
            tabs.style.display = 'none';
            menuMusic.pause(); 
            if (screenName === 'game') initGame(); 
        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            
            // Riproduci solo se l'utente ha già attivato l'audio
            if (isAudioEnabled) {
                menuMusic.play().catch(e => console.log("Audio in attesa"));
            }
        }
    } catch (error) { console.error("Errore:", error); }
}
