// --- VARIABILI GLOBALI --
let canvas, ctx, frames = 0, gameLoopId, score = 0, isGameOver = false, isPaused = false, roadOffset = 0, totalDistance = 0, currentGear = 1, pitchDrop = 0; 

// --- AUDIO GLOBALE GIOCO ---
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
    
    // Ricarichiamo SEMPRE i controlli touch, altrimenti dalla seconda partita smettono di funzionare!
    setupTouchControls(); 

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
    // 1. Asfalto principale
    ctx.fillStyle = '#444'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    roadOffset = (roadOffset + player.speedZ) % 40; 
    
    // 2. Doppia striscia gialla centrale
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 3, i + roadOffset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 1, i + roadOffset, 2, 20);
    }
    
    // 3. Strisce corsie bianche tratteggiate
    ctx.fillStyle = 'white';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 4 - 2, i + roadOffset, 4, 20); 
        ctx.fillRect((canvas.width / 4) * 3 - 2, i + roadOffset, 4, 20); 
    }

    // 4. Bordi laterali stradali continui
    ctx.fillStyle = 'white'; 
    ctx.fillRect(0, 0, 4, canvas.height); 
    ctx.fillRect(canvas.width - 4, 0, 4, canvas.height); 

    // 5. AREA DI SOSTA - Chiusura morbida ad imbuto
    if (totalDistance < 1500) { 
        let sostaY = totalDistance - 200; 
        let areaWidth = 60;    
        let taperLength = 250; 
        
        ctx.fillStyle = '#2A2A2A'; 
        ctx.beginPath();
        ctx.moveTo(canvas.width, sostaY); 
        ctx.lineTo(canvas.width - areaWidth, sostaY + taperLength); 
        ctx.lineTo(canvas.width - areaWidth, sostaY + 1800); 
        ctx.lineTo(canvas.width, sostaY + 1800);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 2, sostaY);
        ctx.lineTo(canvas.width - areaWidth, sostaY + taperLength);
        ctx.lineTo(canvas.width - areaWidth, sostaY + 1800);
        ctx.stroke();

        let textY = sostaY + taperLength + 100;
        if (textY > -100 && textY < canvas.height + 200) {
            ctx.save();
            ctx.translate(canvas.width - (areaWidth / 2), textY);
            ctx.rotate(-Math.PI / 2); 
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; 
            ctx.font = "bold 22px 'Orbitron', Arial";
            ctx.textAlign = "center";
            ctx.fillText("AREA SOS", 0, 8); 
            ctx.restore();
        }
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
