// --- GESTIONE AUDIO MENU GLOBALE ---
window.menuMusic = new Audio('audio/menu.mp3');
window.menuMusic.loop = true;
window.menuMusic.volume = 0.4; 

window.isAudioEnabled = false; 

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const audioBtn = document.getElementById('global-audio-btn');
    if (!audioBtn) return;

    if (window.isAudioEnabled) {
        audioBtn.innerHTML = '🔊'; 
        audioBtn.style.borderColor = 'var(--neon-cyan)';
        audioBtn.style.boxShadow = 'var(--glow-cyan)';
        
        const screensArea = document.getElementById('screens-area');
        if (screensArea && screensArea.querySelector('#screen-game')) {
            if (window.engineSound && !window.isPaused && !window.isGameOver) {
                window.engineSound.play().catch(e=>{});
            }
        } else if (screensArea && !screensArea.querySelector('#screen-result')) {
            window.menuMusic.play().catch(e => {});
        }
    } else {
        audioBtn.innerHTML = '🔇'; 
        audioBtn.style.borderColor = 'var(--neon-orange)';
        audioBtn.style.boxShadow = 'var(--glow-orange)';
        window.menuMusic.pause(); 
        if (window.engineSound) window.engineSound.pause();
    }
}

window.onload = () => { loadScreen('home'); };

async function loadScreen(screenName, clickedTab = null) {
    try {
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        document.getElementById('screens-area').innerHTML = html;

        if (screenName === 'home') {
            const moneyEl = document.getElementById('home-banknotes');
            if (moneyEl) moneyEl.innerText = window.playerProfile ? window.playerProfile.banknotes : 0;
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
            if (tabs) tabs.style.display = 'none';
            window.menuMusic.pause(); 
            if (screenName === 'game') {
                // Aspetta che il DOM sia pronto per il canvas
                setTimeout(() => { if (typeof initGame === "function") initGame(); }, 100);
            }
        } else {
            if (tabs) tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            if (window.isAudioEnabled) window.menuMusic.play().catch(e => {});
        }
    } catch (error) { console.error("Errore Caricamento:", error); }
}
