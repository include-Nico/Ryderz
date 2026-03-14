window.isPaused = false;
window.isGameOver = false;
let canvas, ctx, frames = 0, score = 0, roadOffset = 0, totalDistance = 0, gameLoopId;
window.engineSound = new Audio('audio/engine.wav'); window.engineSound.loop = true;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    frames = 0; score = 0; roadOffset = 0; totalDistance = 0;
    window.isGameOver = false; window.isPaused = false;
    
    // Assicuriamoci che il player sia resettato prima del loop
    if(typeof resetPlayer === 'function') resetPlayer(); 
    if(typeof resetTraffic === 'function') resetTraffic();
    if(typeof setupTouchControls === 'function') setupTouchControls();
    
    if (window.isAudioEnabled) window.engineSound.play().catch(e=>{});
    
    runGameLoop();
}

function runGameLoop() {
    if (window.isGameOver || window.isPaused) return;
    
    // FIX CRITICO: Se il player non è ancora caricato, esci e riprova al prossimo frame
    if (!window.player || !window.player.maxSpeedZ) {
        gameLoopId = requestAnimationFrame(runGameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if(typeof updatePlayer === 'function') updatePlayer(); 
    drawRoad(); 
    if(typeof manageEnemies === 'function') manageEnemies(); 
    if(typeof drawPlayer === 'function') drawPlayer();
    
    totalDistance += window.player.speedZ;
    
    if (window.isAudioEnabled && window.player.maxSpeedZ > 0) {
        let pitch = 0.8 + (window.player.speedZ / window.player.maxSpeedZ) * 1.2;
        window.engineSound.playbackRate = Math.min(Math.max(pitch, 0.5), 2.0);
    }

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    ctx.fillStyle = '#333'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    roadOffset = (roadOffset + (window.player ? window.player.speedZ : 0)) % 40;
    ctx.fillStyle = '#FFF';
    for(let i=-40; i<canvas.height; i+=40) {
        ctx.fillRect(canvas.width/2-2, i+roadOffset, 4, 20);
    }
}

function stopEngine() {
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    if(window.engineSound) window.engineSound.pause();
}

function triggerGameOver() {
    window.isGameOver = true;
    stopEngine();
    window.lastScore = score;
    window.lastCash = Math.floor(score / 5);
    
    // Aggiorna banconote nel profilo globale
    if(window.playerProfile) {
        window.playerProfile.banknotes += window.lastCash;
        localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
    }
    
    setTimeout(() => { loadScreen('result'); }, 1000);
}
