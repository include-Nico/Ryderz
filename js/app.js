// --- PROFILO E DATI ---
window.carCatalog = [
    { id: 1, name: "Maggiorlino Race", price: 0, baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 }, imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png" },
    { id: 2, name: "Ford Mustang", price: 18000, baseStats: { handling: 6.2, acceleration: 0.05, maxSpeed: 18 }, imgGarage: "img/cars/car_02_garage.png", imgGame: "img/cars/car_02_game.png" }
];

function getProfile() {
    let p = JSON.parse(localStorage.getItem('ryderzProfileV4'));
    if (!p) {
        p = { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(p));
    }
    return p;
}
window.playerProfile = getProfile();

// --- AUDIO ---
window.menuMusic = new Audio('audio/menu.mp3'); window.menuMusic.loop = true;
window.isAudioEnabled = false;

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    document.getElementById('global-audio-btn').innerText = window.isAudioEnabled ? '🔊' : '🔇';
    if (window.isAudioEnabled) {
        if (!document.getElementById('gameCanvas')) window.menuMusic.play().catch(e=>{});
    } else {
        window.menuMusic.pause();
        if (window.engineSound) window.engineSound.pause();
    }
}

// --- NAVIGAZIONE ---
async function loadScreen(name, btn = null) {
    try {
        const r = await fetch(`screens/${name}.html`);
        const h = await r.text();
        document.getElementById('screens-area').innerHTML = h;
        
        if(btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        if (name === 'game') {
            document.getElementById('bottom-tabs').style.display = 'none';
            window.menuMusic.pause();
            // Inizializza il gioco con un piccolo delay per il canvas
            setTimeout(() => { if(typeof initGame === 'function') initGame(); }, 200);
        } else {
            document.getElementById('bottom-tabs').style.display = 'flex';
            if(typeof stopEngine === 'function') stopEngine();
            if (window.isAudioEnabled) window.menuMusic.play().catch(e=>{});
            if (name === 'garage' && typeof initGarage === 'function') initGarage();
        }
    } catch(e) { console.error("Errore caricamento schermo:", e); }
}

window.onload = () => loadScreen('home');
