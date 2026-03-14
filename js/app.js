// --- DATI GLOBALI ---
window.carCatalog = [
    { id: 1, name: "STREET RUNNER", price: 0, baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 }, imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png" },
    { id: 2, name: "NEON VIPER", price: 800, baseStats: { handling: 6.2, acceleration: 0.05, maxSpeed: 18 }, imgGarage: "img/cars/car_02_garage.png", imgGame: "img/cars/car_02_game.png" },
    { id: 3, name: "VOID BEAST", price: 2500, baseStats: { handling: 6.8, acceleration: 0.06, maxSpeed: 21 }, imgGarage: "img/cars/car_03_garage.png", imgGame: "img/cars/car_03_game.png" }
];

// Inizializzazione Profilo Immediata
function initProfile() {
    let saved = localStorage.getItem('ryderzProfileV4');
    if (saved) {
        window.playerProfile = JSON.parse(saved);
    } else {
        window.playerProfile = { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
    }
}
initProfile();

window.isAudioEnabled = false;
window.menuMusic = new Audio('audio/menu.mp3');
window.menuMusic.loop = true;

async function loadScreen(name, btn = null) {
    try {
        const response = await fetch(`screens/${name}.html`);
        const html = await response.text();
        const area = document.getElementById('screens-area');
        area.innerHTML = html;

        // Gestione classi active nel DOM
        const screenSection = area.querySelector('section');
        if (screenSection) screenSection.classList.add('active');

        if (btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        const tabs = document.getElementById('bottom-tabs');
        if (name === 'game') {
            tabs.style.display = 'none';
            window.menuMusic.pause();
            setTimeout(() => { if(typeof initGame === 'function') initGame(); }, 200);
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
    btn.innerText = window.isAudioEnabled ? '🔊' : '🔇';
    if (!window.isAudioEnabled) {
        window.menuMusic.pause();
        if(window.engineSound) window.engineSound.pause();
    } else {
        if(!document.getElementById('gameCanvas')) window.menuMusic.play();
    }
}

window.onload = () => loadScreen('home');
