window.isPaused = false;
window.isGameOver = false;
let canvas, ctx, frames = 0, score = 0, roadOffset = 0, totalDistance = 0, gameLoopId;

window.engineSound = new Audio('audio/engine.wav'); 
window.engineSound.loop = true;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    frames = 0; score = 0; roadOffset = 0; totalDistance = 0;
    window.isGameOver = false; window.isPaused = false;
    
    resetPlayer(); 
    resetTraffic(); 
    setupTouchControls();
    
    if (window.isAudioEnabled) window.engineSound.play().catch(e=>{});
    
    player.isIgniting = false;
    player.isStarting = true;
    
    runGameLoop();
}

function runGameLoop() {
    if (window.isGameOver || window.isPaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer(); 
    drawRoad(); 
    manageEnemies(); 
    drawPlayer();
    
    totalDistance += player.speedZ;
    
    // Pitch del motore basato sulla velocità
    if (window.isAudioEnabled && player.maxSpeedZ > 0) {
        let pitch = 0.8 + (player.speedZ / player.maxSpeedZ) * 1.2;
        window.engineSound.playbackRate = Math.min(Math.max(pitch, 0.5), 2.0);
    }

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    ctx.fillStyle = '#444'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    roadOffset = (roadOffset + player.speedZ) % 40;
    ctx.fillStyle = 'white';
    for(let i=-40; i<canvas.height; i+=40) {
        ctx.fillRect(canvas.width/2-2, i+roadOffset, 4, 20);
    }
}

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    window.engineSound.pause();
}

function triggerGameOver() {
    window.isGameOver = true;
    stopEngine();
    window.lastScore = score;
    window.lastCash = Math.floor(score / 5);
    addBanknotes(window.lastCash);
    setTimeout(() => { loadScreen('result'); }, 1000);
}
