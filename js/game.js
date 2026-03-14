// ─── VARIABILI GLOBALI ───────────────────────────────────────────────────────
let canvas, ctx;
let animationId  = null;
let isGameOver   = false;
let isPaused     = false;
let frames       = 0;
let score        = 0;
let roadOffset   = 0;

// ─── INIT ────────────────────────────────────────────────────────────────────
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx    = canvas.getContext('2d');

    isGameOver = false;
    isPaused   = false;
    frames     = 0;
    score      = 0;
    roadOffset = 0;

    resetPlayer();
    resetTraffic();
    setupTouchControls();

    // Sequenza avvio: accensione → burnout → partenza
    setTimeout(() => {
        player.isIgniting = false;
        player.isStarting = true;
    }, 900);

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

// Chiamato da app.js quando si esce dal gioco
function stopEngine() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// ─── PAUSA ───────────────────────────────────────────────────────────────────
function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    const menu = document.getElementById('pause-menu');
    if (menu) menu.style.display = isPaused ? 'flex' : 'none';
    if (!isPaused) gameLoop();   // riprende il loop
}

function quitGame() {
    stopEngine();
    loadScreen('home');
}

// ─── GAME OVER ───────────────────────────────────────────────────────────────
function triggerGameOver() {
    if (isGameOver) return;
    isGameOver = true;
    stopEngine();

    const cash = Math.floor(score / 10);
    addBanknotes(cash);
    window.lastScore = score;
    window.lastCash  = cash;

    // Flash rosso poi vai alla schermata risultato
    ctx.fillStyle = 'rgba(255,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setTimeout(() => loadScreen('result'), 700);
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function updateScoreDisplay() {
    const el = document.getElementById('score');
    if (el) el.innerText = 'Punti: ' + score;
}

function updateHUD() {
    const kmh = Math.floor(player.speedZ * 10);

    const speedEl = document.getElementById('speedometer');
    if (speedEl) speedEl.innerText = kmh + ' km/h';

    let gear = 1;
    if      (kmh > 130) gear = 6;
    else if (kmh > 100) gear = 5;
    else if (kmh > 70)  gear = 4;
    else if (kmh > 45)  gear = 3;
    else if (kmh > 20)  gear = 2;

    const gearEl = document.getElementById('gear-display');
    if (gearEl) gearEl.innerText = 'Marcia: ' + gear;

    updateScoreDisplay();
}

// ─── DISEGNO STRADA ──────────────────────────────────────────────────────────
function drawRoad() {
    // Sfondo asfalto
    ctx.fillStyle = '#3A3A3A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animazione offset basato sulla velocità
    roadOffset = (roadOffset + player.speedZ * 0.8) % 50;

    const W = canvas.width;
    const H = canvas.height;

    // ── Linee tratteggiate corsie ─────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([35, 15]);
    ctx.lineDashOffset = -roadOffset;

    // corsia 1/4 (sinistra contromano)
    ctx.beginPath();
    ctx.moveTo(W / 4, 0);
    ctx.lineTo(W / 4, H);
    ctx.stroke();

    // corsia 3/4 (destra senso di marcia)
    ctx.beginPath();
    ctx.moveTo((W * 3) / 4, 0);
    ctx.lineTo((W * 3) / 4, H);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();

    // ── Mezzeria doppia gialla ────────────────────────────────────────────────
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(W / 2 - 4, 0, 3, H);
    ctx.fillRect(W / 2 + 2, 0, 3, H);
}

// ─── GAME LOOP ────────────────────────────────────────────────────────────────
function gameLoop() {
    if (isGameOver || isPaused) return;

    frames++;

    // Disegna road
    drawRoad();

    // Aggiorna e disegna player
    updatePlayer();
    drawPlayer();

    // Traffico (aggiorna, controlla collisioni, disegna)
    manageEnemies();

    // Effetti "liscio"
    drawLiscioEffects();

    // Punteggio passivo (ogni 60 frame, basato sulla velocità)
    if (player.hasAcceleratedOnce && !player.isStarting && frames % 60 === 0) {
        score += Math.floor(player.speedZ * 0.5);
        updateScoreDisplay();
    }

    // Difficoltà crescente
    if (!player.isStarting) increaseDifficulty();

    // Aggiorna HUD
    updateHUD();

    animationId = requestAnimationFrame(gameLoop);
}
