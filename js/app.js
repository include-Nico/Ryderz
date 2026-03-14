// Caricamento profilo immediato
function initProfile() {
    let p = localStorage.getItem('ryderzProfileV4');
    if (!p) {
        window.playerProfile = { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
    } else {
        window.playerProfile = JSON.parse(p);
    }
}
initProfile();

window.isAudioEnabled = false;
window.menuMusic = new Audio('audio/menu.mp3');
window.menuMusic.loop = true;

async function loadScreen(name, btn = null) {
    const container = document.getElementById('screens-area');
    const tabs = document.getElementById('bottom-tabs');
    
    try {
        const response = await fetch(`screens/${name}.html`);
        const html = await response.text();
        container.innerHTML = html;

        // Gestione classi active
        if (btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        if (name === 'game') {
            tabs.style.display = 'none';
            window.menuMusic.pause();
            // Assicuriamoci che il canvas esista prima di initGame
            setTimeout(() => { if(typeof initGame === 'function') initGame(); }, 150);
        } else {
            tabs.style.display = 'flex';
            if(typeof stopEngine === 'function') stopEngine();
            if (name === 'garage') setTimeout(initGarage, 50);
            if (window.isAudioEnabled) window.menuMusic.play().catch(e=>{});
        }
    } catch(e) { console.error("Errore caricamento schermo:", e); }
}

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const btn = document.getElementById('global-audio-btn');
    if(btn) btn.innerText = window.isAudioEnabled ? '🔊' : '🔇';
    if(!window.isAudioEnabled) {
        window.menuMusic.pause();
        if(window.engineSound) window.engineSound.pause();
    } else {
        if(!document.getElementById('gameCanvas')) window.menuMusic.play();
    }
}

window.onload = () => loadScreen('home');
