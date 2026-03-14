let canvas, ctx, gameLoopId, roadOffset = 0;
window.engineSound = new Audio('audio/engine.wav'); 
window.engineSound.loop = true;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    resetPlayer(); 
    if(typeof resetTraffic === 'function') resetTraffic();
    
    // Controlli touch semplici
    canvas.ontouchstart = () => { window.player.isAccelerating = true; };
    canvas.ontouchend = () => { window.player.isAccelerating = false; };

    if (window.isAudioEnabled) window.engineSound.play().catch(e=>{});
    runGameLoop();
}

function runGameLoop() {
    if (window.isGameOver || window.isPaused) return;

    // CONTROLLO SICUREZZA
    if (!window.player || window.player.maxSpeedZ === undefined) {
        gameLoopId = requestAnimationFrame(runGameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer(); 
    drawRoad(); 
    if(typeof manageEnemies === 'function') manageEnemies(); 
    drawPlayer();
    
    // Pitch motore dinamico
    if (window.isAudioEnabled) {
        let pitch = 0.8 + (window.player.speedZ / window.player.maxSpeedZ) * 1.2;
        window.engineSound.playbackRate = Math.min(Math.max(pitch, 0.5), 2.0);
    }

    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    ctx.fillStyle = '#222'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    roadOffset = (roadOffset + window.player.speedZ) % 40;
    ctx.fillStyle = '#555';
    ctx.fillRect(10, 0, 5, canvas.height); ctx.fillRect(canvas.width-15, 0, 5, canvas.height);
}

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    window.engineSound.pause();
}
