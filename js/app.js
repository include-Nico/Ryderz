// --- DATI E PROFILO ---
window.carCatalog = [
    { id: 1, name: "STREET RUNNER", price: 0, baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 }, imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png" },
    { id: 2, name: "NEON VIPER", price: 800, baseStats: { handling: 6.2, acceleration: 0.05, maxSpeed: 18 }, imgGarage: "img/cars/car_02_garage.png", imgGame: "img/cars/car_02_game.png" }
];

function loadProfile() {
    let p = JSON.parse(localStorage.getItem('ryderzProfileV4'));
    if (!p) {
        p = { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(p));
    }
    window.playerProfile = p;
}
loadProfile(); // Carica subito!

// --- AUDIO ---
window.menuMusic = new Audio('audio/menu.mp3'); window.menuMusic.loop = true;
window.isAudioEnabled = false;

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const btn = document.getElementById('global-audio-btn');
    if(btn) btn.innerText = window.isAudioEnabled ? '🔊' : '🔇';
    if (window.isAudioEnabled) {
        if (!document.getElementById('gameCanvas')) window.menuMusic.play().catch(e=>{});
    } else {
        window.menuMusic.pause();
        if (window.engineSound) window.engineSound.pause();
    }
}

// --- NAVIGAZIONE ---
async function loadScreen(name, btn = null) {
    const container = document.getElementById('screens-area');
    const tabs = document.getElementById('bottom-tabs');
    
    try {
        const r = await fetch(`screens/${name}.html`);
        container.innerHTML = await r.text();
        
        if(btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        if (name === 'game') {
            tabs.style.display = 'none';
            window.menuMusic.pause();
            setTimeout(() => { if(typeof initGame === 'function') initGame(); }, 200);
        } else {
            tabs.style.display = 'flex';
            if(typeof stopEngine === 'function') stopEngine();
            if (window.isAudioEnabled) window.menuMusic.play().catch(e=>{});
            if (name === 'garage') setTimeout(initGarage, 50);
        }
    } catch(e) { console.error("Errore:", e); }
}

window.onload = () => loadScreen('home');
