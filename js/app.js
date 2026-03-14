// --- GESTIONE AUDIO MENU ---
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
        audioBtn.style.borderColor = '#00F0FF';
        audioBtn.style.boxShadow = '0 0 15px rgba(0,240,255,0.5)';
        
        // Controlliamo in che schermata siamo per attivare l'audio giusto
        const screensArea = document.getElementById('screens-area').innerHTML;
        if (screensArea.includes('screen-game')) {
            // Se siamo in gioco e non in pausa, fai partire il motore
            if (window.engineSound && typeof isPaused !== 'undefined' && !isPaused && typeof isGameOver !== 'undefined' && !isGameOver) {
                window.engineSound.play().catch(e=>{});
            }
        } else if (!screensArea.includes('screen-result')) {
            // Se siamo nel menu o nel garage, fai partire la musica del menu
            window.menuMusic.play().catch(e => console.log(e));
        }
    } else {
        audioBtn.innerHTML = '🔇'; 
        audioBtn.style.borderColor = '#FF6A00';
        audioBtn.style.boxShadow = '0 0 15px rgba(255,106,0,0.5)';
        
        // Muta tutto
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
        
        // --- LOGICA AUDIO NEL CARICAMENTO SCHERMATE ---
        if (screenName === 'game' || screenName === 'result') {
            if (tabs) tabs.style.display = 'none';
            window.menuMusic.pause(); 
            if (screenName === 'game') initGame(); 
        } else {
            if (tabs) tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            
            // La musica riparte solo se l'utente l'ha attivata dal pulsante globale
            if (window.isAudioEnabled) {
                window.menuMusic.play().catch(e => console.log(e));
            }
        }
    } catch (error) { console.error("Errore:", error); }
}
