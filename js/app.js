// --- GESTIONE AUDIO MENU GLOBALE ---
window.menuMusic = new Audio('audio/menu.mp3');
window.menuMusic.loop = true;
window.menuMusic.volume = 0.4; 

// L'audio parte disattivato come richiesto
window.isAudioEnabled = false; 

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const audioBtn = document.getElementById('global-audio-btn');
    
    if (window.isAudioEnabled) {
        audioBtn.innerHTML = '🔊'; 
        audioBtn.style.borderColor = '#00F0FF'; // Ciano se acceso
        audioBtn.style.boxShadow = '0 0 15px rgba(0,240,255,0.5)';
        
        // Verifica in che schermata siamo
        const screensArea = document.getElementById('screens-area').innerHTML;
        if (screensArea.includes('screen-game')) {
            // Se in gioco e non in pausa, fa partire il motore
            if (window.engineSound && typeof isPaused !== 'undefined' && !isPaused && typeof isGameOver !== 'undefined' && !isGameOver) {
                window.engineSound.play().catch(e=>{});
            }
        } else if (!screensArea.includes('screen-result')) {
            // Se nel menu, fa partire la musica
            window.menuMusic.play().catch(e => console.log(e));
        }
    } else {
        audioBtn.innerHTML = '🔇'; 
        audioBtn.style.borderColor = '#FF6A00'; // Arancione se spento
        audioBtn.style.boxShadow = '0 0 15px rgba(255,106,0,0.5)';
        
        // Ferma qualsiasi suono attivo
        window.menuMusic.pause(); 
        if (window.engineSound) window.engineSound.pause();
        if (window.ignitionSound) window.ignitionSound.pause();
        if (window.crashSound) window.crashSound.pause();
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
        
        // --- LOGICA CAMBIO SCHERMATE ---
        if (screenName === 'game' || screenName === 'result') {
            if (tabs) tabs.style.display = 'none';
            window.menuMusic.pause(); 
            if (screenName === 'game') initGame(); 
        } else {
            if (tabs) tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            
            // La musica riparte solo se l'utente ha attivato l'audio globale
            if (window.isAudioEnabled) {
                window.menuMusic.play().catch(e => console.log(e));
            }
        }
    } catch (error) { console.error("Errore:", error); }
}
