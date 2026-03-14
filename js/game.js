window.isPaused = false; window.isGameOver = false;
let canvas, ctx, frames = 0, score = 0, totalDistance = 0, gameLoopId;
window.engineSound = new Audio('audio/engine.wav'); window.engineSound.loop = true;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    frames = 0; score = 0; totalDistance = 0;
    window.isGameOver = false; window.isPaused = false;
    resetPlayer(); resetTraffic(); setupTouchControls();
    if (window.isAudioEnabled) window.engineSound.play().catch(e=>{});
    runGameLoop();
}

function runGameLoop() {
    if (window.isGameOver || window.isPaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer(); drawRoad(); manageEnemies(); drawPlayer();
    totalDistance += player.speedZ;
    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function stopEngine() { cancelAnimationFrame(gameLoopId); window.engineSound.pause(); }

function togglePause() {
    window.isPaused = !window.isPaused;
    document.getElementById('pause-menu').style.display = window.isPaused ? 'flex' : 'none';
    if (window.isPaused) window.engineSound.pause();
    else { if (window.isAudioEnabled) window.engineSound.play(); runGameLoop(); }
}
