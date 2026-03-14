/* ─── STATO GLOBALE ──────────────────────────── */
let canvas, ctx, gameLoopId, roadOffset = 0;
let frames = 0;
let score   = 0;

window.isPaused  = false;
window.isGameOver = false;

window.engineSound = new Audio('audio/engine.wav');
window.engineSound.loop = true;

/* ─── INIT ───────────────────────────────────── */
function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Reset stato
    frames        = 0;
    score         = 0;
    roadOffset    = 0;
    window.isPaused   = false;
    window.isGameOver = false;

    resetPlayer();
    if (typeof resetTraffic === 'function') resetTraffic();

    // ── Controlli touch ──────────────────────
    let touchStartX = null;

    canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        window.player.isAccelerating = true;
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
        if (touchStartX === null) return;
        const dx = e.touches[0].clientX - touchStartX;
        window.player.dx = (Math.abs(dx) > 10)
            ? Math.sign(dx) * window.player.speedX
            : 0;
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        window.player.isAccelerating = false;
        window.player.dx = 0;
        touchStartX = null;
    });

    // ── Controlli tastiera ───────────────────
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup',   handleKeyUp);

    if (window.isAudioEnabled) window.engineSound.play().catch(() => {});
    runGameLoop();
}

function handleKeyDown(e) {
    if (window.isGameOver) return;
    switch (e.key) {
        case 'ArrowLeft':  case 'a': window.player.dx = -window.player.speedX; break;
        case 'ArrowRight': case 'd': window.player.dx =  window.player.speedX; break;
        case 'ArrowUp':    case 'w': window.player.isAccelerating = true;       break;
        case ' ': togglePause(); break;
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case 'ArrowLeft':  case 'a':
        case 'ArrowRight': case 'd': window.player.dx = 0;     break;
        case 'ArrowUp':    case 'w': window.player.isAccelerating = false; break;
    }
}

/* ─── GAME LOOP ──────────────────────────────── */
function runGameLoop() {
    if (window.isGameOver || window.isPaused) return;
    if (!window.player || window.player.maxSpeedZ === undefined) {
        gameLoopId = requestAnimationFrame(runGameLoop);
        return;
    }

    frames++;
    score += Math.floor(window.player.speedZ * 0.1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();
    updatePlayer();
    if (typeof manageEnemies === 'function') manageEnemies();
    drawPlayer();
    updateHUD();

    // Pitch motore dinamico
    if (window.isAudioEnabled && window.engineSound) {
        const pitch = 0.8 + (window.player.speedZ / window.player.maxSpeedZ) * 1.2;
        window.engineSound.playbackRate = Math.min(Math.max(pitch, 0.5), 2.0);
    }

    gameLoopId = requestAnimationFrame(runGameLoop);
}

/* ─── HUD ────────────────────────────────────── */
function updateHUD() {
    const kmh   = Math.round(window.player.speedZ * 20);
    const gear  = Math.min(6, Math.ceil(window.player.speedZ / (window.player.maxSpeedZ / 6)) || 1);
    const scoreEl = document.getElementById('score');
    const speedEl = document.getElementById('speedometer');
    const gearEl  = document.getElementById('gear-display');
    if (scoreEl) scoreEl.textContent = `Punti: ${score}`;
    if (speedEl) speedEl.textContent = `${kmh} km/h`;
    if (gearEl)  gearEl.textContent  = `M: ${gear}`;
}

/* ─── DISEGNO STRADA ─────────────────────────── */
function drawRoad() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    roadOffset = (roadOffset + window.player.speedZ) % 40;

    // Strisce centrali tratteggiate
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 0.6;
    for (let y = -40 + roadOffset; y < canvas.height; y += 40) {
        ctx.fillRect(canvas.width / 2 - 3, y, 6, 24);
    }
    ctx.globalAlpha = 1;

    // Bordi corsia
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(10,  0, 4, canvas.height);
    ctx.fillRect(canvas.width - 14, 0, 4, canvas.height);
    ctx.globalAlpha = 1;
}

/* ─── PAUSA ──────────────────────────────────── */
function togglePause() {
    if (window.isGameOver) return;
    window.isPaused = !window.isPaused;

    const menu = document.getElementById('pause-menu');
    if (menu) menu.style.display = window.isPaused ? 'flex' : 'none';

    if (window.isPaused) {
        cancelAnimationFrame(gameLoopId);
        if (window.isAudioEnabled && window.engineSound) window.engineSound.pause();
    } else {
        if (window.isAudioEnabled && window.engineSound) window.engineSound.play().catch(() => {});
        runGameLoop();
    }
}

/* ─── GAME OVER ──────────────────────────────── */
function triggerGameOver() {
    if (window.isGameOver) return;
    window.isGameOver = true;
    cancelAnimationFrame(gameLoopId);

    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup',   handleKeyUp);

    if (window.engineSound) window.engineSound.pause();

    // Calcola guadagno e salva
    const earned = Math.floor(score * 0.5);
    if (typeof addBanknotes === 'function') addBanknotes(earned);

    // Vai alla schermata risultati
    setTimeout(() => {
        loadScreen('result').then(() => {
            const rScore = document.getElementById('result-score');
            const rCash  = document.getElementById('result-cash');
            if (rScore) rScore.textContent = score;
            if (rCash)  rCash.textContent  = earned;
        });
    }, 600);
}

/* ─── QUIT ───────────────────────────────────── */
function quitGame() {
    window.isGameOver = true;
    cancelAnimationFrame(gameLoopId);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup',   handleKeyUp);
    if (window.engineSound) window.engineSound.pause();
    loadScreen('home');
}

/* ─── STOP ENGINE (chiamato da app.js) ───────── */
function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    if (window.engineSound) window.engineSound.pause();
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup',   handleKeyUp);
}
