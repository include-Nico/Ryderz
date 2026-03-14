// --- GESTIONE AUDIO MENU --
let menuMusic = new Audio('audio/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.4; 

// Variabile globale che dice se l'audio è attivo (spento di default)
window.isAudioEnabled = false; 

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const audioBtn = document.getElementById('global-audio-btn');
    
    if (window.isAudioEnabled) {
        audioBtn.innerText = '🔊'; // Cambia icona
        
        // Se non siamo in gioco o nel risultato, fai partire la musica del menu
        const screensArea = document.getElementById('screens-area').innerHTML;
        if (!screensArea.includes('screen-game') && !screensArea.includes('screen-result')) {
            menuMusic.play().catch(e => console.log(e));
        }
        // Se siamo in gioco e in pausa, riattiva il motore
        if (typeof engineSound !== 'undefined' && typeof isPaused !== 'undefined' && !isPaused && typeof isGameOver !== 'undefined' && !isGameOver) {
            engineSound.play().catch(e=>{});
        }
    } else {
        audioBtn.innerText = '🔇'; // Cambia icona in Muto
        menuMusic.pause(); // Stoppa la musica
        // Stoppa anche il motore in gioco se presente
        if (typeof engineSound !== 'undefined') engineSound.pause();
    }
}

window.onload = () => {
    loadScreen('home');
};

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
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
        
        // --- LOGICA AUDIO: Stop musica menu se si gioca ---
        if (screenName === 'game' || screenName === 'result') {
            tabs.style.display = 'none';
            menuMusic.pause(); 
            if (screenName === 'game') initGame(); 
        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            
            // La musica riparte solo se l'utente ha attivato l'audio globale
            if (window.isAudioEnabled) {
                menuMusic.play().catch(e => console.log("Audio in attesa di interazione"));
            }
        }
    } catch (error) { console.error("Errore:", error); }
}
