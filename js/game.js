window.isPaused = false;
window.isGameOver = false;
let canvas, ctx, frames = 0, score = 0, roadOffset = 0, totalDistance = 0, gameLoopId;

window.engineSound = new Audio('audio/engine.wav'); 
window.engineSound.loop = true;
window.crashSound = new Audio('audio/crash.mp3');

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
    runGameLoop();
}

function runGameLoop() {
    if (window.isGameOver || window.isPaused) return;

    // Controllo sicurezza caricamento player
    if (!window.player || window.player.maxSpeedZ === 0) {
        gameLoopId = requestAnimationFrame(runGameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer(); 
    drawRoad(); 
    manageEnemies(); 
    drawPlayer();
    
    totalDistance += player.speedZ;
    updateScore();

    // Pitch motore dinamico
    if (window.isAudioEnabled) {
        let pitch = 0.8 + (player.speedZ / player.maxSpeedZ) * 1.2;
        window.engineSound.playbackRate = Math.min(Math.max(pitch, 0.5), 2.0);
    }

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    // Asfalto
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    roadOffset = (roadOffset + player.speedZ) % 40;
    
    // Linee laterali
    ctx.fillStyle = '#555';
    ctx.fillRect(5, 0, 5, canvas.height);
    ctx.fillRect(canvas.width - 10, 0, 5, canvas.height);
    
    // Linea tratteggiata centrale
    ctx.fillStyle = '#AAA';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 2, i + roadOffset, 4, 20);
    }
}

function updateScore() {
    if (frames % 10 === 0 && !player.isStarting) {
        score += Math.floor(player.speedZ);
        document.getElementById('score').innerText = `Punti: ${score}`;
        document.getElementById('speedometer').innerText = `${Math.floor(player.speedZ * 10)} km/h`;
    }
}

function triggerGameOver() {
    window.isGameOver = true;
    stopEngine();
    if (window.isAudioEnabled) window.crashSound.play();
    
    window.lastScore = score;
    window.lastCash = Math.floor(score / 5);
    
    // Salva soldi nel profilo
    window.playerProfile.banknotes += window.lastCash;
    localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
    
    setTimeout(() => { loadScreen('result'); }, 1000);
}

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    window.engineSound.pause();
}

function togglePause() {
    window.isPaused = !window.isPaused;
    document.getElementById('pause-menu').style.display = window.isPaused ? 'flex' : 'none';
    if (window.isPaused) window.engineSound.pause();
    else if (window.isAudioEnabled) window.engineSound.play();
    if (!window.isPaused) runGameLoop();
}

function quitGame() {
    window.isGameOver = true;
    stopEngine();
    loadScreen('home');
}
