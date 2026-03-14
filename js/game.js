// --- VARIABILI GLOBALI --
let canvas, ctx, frames = 0, gameLoopId, score = 0, isGameOver = false, isPaused = false, roadOffset = 0, totalDistance = 0, touchInitialized = false, currentGear = 1, pitchDrop = 0; 

// --- AUDIO GLOBALE (Così comunicano senza errori con app.js) ---
window.ignitionSound = new Audio('audio/ignition.mp3');
window.engineSound = new Audio('audio/engine.wav'); 
window.engineSound.loop = true;
window.engineSound.preservesPitch = false; 
window.crashSound = new Audio('audio/crash.mp3');

window.engineSound.addEventListener('timeupdate', function() {
    if (this.duration && this.currentTime >= this.duration - 0.15) this.currentTime = 0; 
});

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    frames = 0; score = 0; roadOffset = 0; totalDistance = 0; currentGear = 1; pitchDrop = 0; isGameOver = false; isPaused = false; 
    resetPlayer();  
    resetTraffic(); 
    if (!touchInitialized) { setupTouchControls(); touchInitialized = true; }

    // Controllo Audio per l'accensione
    if (window.isAudioEnabled) {
        window.ignitionSound.currentTime = 0;
        window.ignitionSound.play().catch(e => console.log(e));
        window.ignitionSound.onended = () => {
            player.isIgniting = false;
            player.isStarting = true;
            window.engineSound.play().catch(e => console.log(e));
        };
    } else {
        // Se mutato, salta il suono d'accensione e fai partire subito l'auto
        player.isIgniting = false;
        player.isStarting = true;
    }
    
    startEngine();
}

function togglePause() {
    if (isGameOver || player.isStarting) return; 
    isPaused = !isPaused; 
    const pauseMenu = document.getElementById('pause-menu');
    if (isPaused) {
        if (pauseMenu) pauseMenu.style.display = 'flex';
        window.engineSound.pause(); 
    } else {
        if (pauseMenu) pauseMenu.style.display = 'none';
        if (window.isAudioEnabled) {
            window.engineSound.play().catch(e => console.log(e)); 
        }
        runGameLoop(); 
    }
}

function quitGame() {
    isGameOver = true;
    isPaused = false;
    stopEngine();
    window.engineSound.pause();
    window.engineSound.currentTime = 0;
    loadScreen('home'); 
}

function runGameLoop() {
    if (isGameOver || isPaused) return; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();       
    increaseDifficulty(); 
    drawRoad();           
    manageEnemies();      
    drawPlayer();         
    drawLiscioEffects();  
    
    if (isContromano() && !player.isStarting && !player.isIgniting) {
        let alpha = 0.7 + Math.sin(frames * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ CONTROMANO: PUNTI X2 ⚠️", canvas.width / 2, 70);
        ctx.textAlign = "left"; 
    }
    updateScore();        
    totalDistance += player.speedZ; 

    // Regolazione dinamica del pitch del motore
    if (pitchDrop > 0) { pitchDrop -= 0.03; if (pitchDrop < 0) pitchDrop = 0; }
    let pitch = 0.8 + (player.speedZ / playerProfile.stats.maxSpeed) * 1.5 - pitchDrop;
    window.engineSound.playbackRate = Math.max(0.5, Math.min(pitch, 2.5));

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    ctx.fillStyle = '#444'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    roadOffset = (roadOffset + player.speedZ) % 40; 
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 3, i + roadOffset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 1, i + roadOffset, 2, 20);
    }
    ctx.fillStyle = 'white';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 4 - 2, i + roadOffset, 4, 20); 
        ctx.fillRect((canvas.width / 4) * 3 - 2, i + roadOffset, 4, 20); 
    }
    if (totalDistance < canvas.height + 1000) {
        let sostaY = (canvas.height - 300) + totalDistance; 
        ctx.fillStyle = '#222'; ctx.fillRect(canvas.width - 50, sostaY, 50, 900);
        ctx.fillStyle = 'white'; ctx.fillRect(canvas.width - 52, 0, 2, canvas.height); 
        ctx.fillStyle = '#444'; ctx.fillRect(canvas.width - 52, sostaY + 100, 2, 700);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.font = "bold 20px Arial";
        ctx.fillText("AREA SOS", canvas.width - 48, sostaY + 300);
    } else {
        ctx.fillStyle = 'white'; ctx.fillRect(canvas.width - 5, 0, 5, canvas.height);
        ctx.fillRect(0, 0, 5, canvas.height);
    }
}

function updateScore() {
    if (frames % 10 === 0 && !player.isStarting && !player.isIgniting && player.speedZ >= 1) {
        let basePoints = Math.floor(player.speedZ / 3);
        if (basePoints < 1) basePoints = 1;
        score += isContromano() ? (basePoints * 2) : basePoints;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: ${score}`;
    const speedElement = document.getElementById('speedometer');
    if (speedElement) speedElement.innerText = `${Math.floor(player.speedZ * 10)} km/h`;
    
    let visualSpeed = Math.floor(player.speedZ * 10);
    
    // --- LOGICA 6 MARCE ---
    let newGear = 1;
    if (visualSpeed > 125) newGear = 6;      
    else if (visualSpeed > 100) newGear = 5;
    else if (visualSpeed > 75) newGear = 4;
    else if (visualSpeed > 50) newGear = 3;
    else if (visualSpeed > 30) newGear = 2;

    if (newGear > currentGear) {
        player.shiftDelay = 18; 
        pitchDrop = 0.6; 
    }
    currentGear = newGear;
    const gearElement = document.getElementById('gear-display');
    if (gearElement) gearElement.innerText = `Marcia: ${currentGear}`;
}

function triggerGameOver() {
    isGameOver = true;
    window.engineSound.pause(); 
    if (window.isAudioEnabled) {
        window.crashSound.currentTime = 0;
        window.crashSound.play().catch(e => console.log(e));
    }
    stopEngine();
    addBanknotes(Math.floor(score / 5)); 
    window.lastScore = score; window.lastCash = Math.floor(score / 5);
    setTimeout(() => { loadScreen('result'); }, 800);
}

function startEngine() { runGameLoop(); }
function stopEngine() { cancelAnimationFrame(gameLoopId); window.engineSound.pause(); }
