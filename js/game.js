// Modifica la funzione initGame per rispettare lo stato dell'audio
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    frames = 0; score = 0; roadOffset = 0; totalDistance = 0; currentGear = 1; pitchDrop = 0; isGameOver = false; isPaused = false; 
    resetPlayer();  
    resetTraffic(); 
    if (!touchInitialized) { setupTouchControls(); touchInitialized = true; }

    if (isAudioEnabled) {
        ignitionSound.currentTime = 0;
        ignitionSound.play().catch(e => {});
        ignitionSound.onended = () => {
            player.isIgniting = false;
            player.isStarting = true;
            engineSound.play();
        };
    } else {
        // Se l'audio è spento, salta l'attesa dell'audio ignition
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
        if (isAudioEnabled) engineSound.pause(); 
    } else {
        if (pauseMenu) pauseMenu.style.display = 'none';
        if (isAudioEnabled) engineSound.play(); 
        runGameLoop(); 
    }
}

function triggerGameOver() {
    isGameOver = true;
    if (isAudioEnabled) {
        engineSound.pause(); 
        crashSound.currentTime = 0;
        crashSound.play().catch(e => {});
    }
    stopEngine();
    addBanknotes(Math.floor(score / 5)); 
    window.lastScore = score; window.lastCash = Math.floor(score / 5);
    setTimeout(() => { loadScreen('result'); }, 800);
}
