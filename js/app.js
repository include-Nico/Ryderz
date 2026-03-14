/* ─── PROFILO ────────────────────────────────── */
function initProfile() {
    let p = localStorage.getItem('ryderzProfileV4');
    if (!p) {
        window.playerProfile = {
            banknotes: 0,
            unlockedCars: [1],
            equippedCarId: 1,
            upgrades: {}
        };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
    } else {
        window.playerProfile = JSON.parse(p);
    }
}
initProfile();

/* ─── AUDIO ──────────────────────────────────── */
window.isAudioEnabled = false;
window.menuMusic = new Audio('audio/menu.mp3');
window.menuMusic.loop = true;

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const btn = document.getElementById('global-audio-btn');
    if (btn) btn.innerText = window.isAudioEnabled ? '🔊' : '🔇';

    if (!window.isAudioEnabled) {
        window.menuMusic.pause();
        if (window.engineSound) window.engineSound.pause();
    } else {
        if (!document.getElementById('gameCanvas')) {
            window.menuMusic.play().catch(() => {});
        }
    }
}

/* ─── ROUTER SCHERMATE ───────────────────────── */
async function loadScreen(name, btn = null) {
    const container = document.getElementById('screens-area');
    const tabs      = document.getElementById('bottom-tabs');

    try {
        const response = await fetch(`screens/${name}.html`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;

        // Tab attivo
        if (btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        if (name === 'game') {
            tabs.style.display = 'none';
            window.menuMusic.pause();
            // Piccolo delay per assicurarsi che il canvas sia nel DOM
            setTimeout(() => {
                if (typeof initGame === 'function') initGame();
            }, 150);

        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === 'function') stopEngine();

            if (name === 'garage') {
                // initGarage viene chiamato UNA SOLA VOLTA qui
                setTimeout(() => {
                    if (typeof initGarage === 'function') initGarage();
                }, 50);
            }

            if (name === 'home') populateInstructions();

            if (window.isAudioEnabled) window.menuMusic.play().catch(() => {});
        }
    } catch (e) {
        console.error('Errore caricamento schermata:', e);
    }
}

/* ─── ISTRUZIONI HOME ────────────────────────── */
function populateInstructions() {
    const el = document.getElementById('instructions-text');
    if (!el) return;
    el.innerHTML = `
        📱 <strong>Touch:</strong> Tocca per accelerare · Scorri sinistra/destra per sterzare<br>
        ⌨️ <strong>Tastiera:</strong> W / ↑ per accelerare · A ← / D → per sterzare · Spazio per pausa
    `;
}

/* ─── AVVIO ──────────────────────────────────── */
window.onload = () => loadScreen('home');
