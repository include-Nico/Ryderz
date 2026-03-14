// --- VARIABILI GLOBALI --
window.isPaused = false;
window.isGameOver = false;
let canvas, ctx, frames = 0, gameLoopId, score = 0, roadOffset = 0, totalDistance = 0, touchInitialized = false, currentGear = 1, pitchDrop = 0; 

window.ignitionSound = new Audio('audio/ignition.mp3');
window.engineSound = new Audio('audio/engine.wav'); 
window.engineSound.loop = true;
window.crashSound = new Audio('audio/crash.mp3');

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    frames = 0; score = 0; roadOffset = 0; totalDistance = 0; currentGear = 1; 
    window.isGameOver = false; window.isPaused = false; 
    
    resetPlayer();  
    resetTraffic(); 
    setupTouchControls(); 

    if (window.isAudioEnabled) {
        window.ignitionSound.currentTime = 0;
        window.ignitionSound.play().catch(e => {});
        window.ignitionSound.onended = () => {
            player.isIgniting = false;
            player.isStarting = true;
            window.engineSound.play().catch(e => {});
        };
    } else {
        player.isIgniting = false;
        player.isStarting = true;
    }
    startEngine();
}

function runGameLoop() {
    if (window.isGameOver || window.isPaused) return; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();       
    increaseDifficulty(); 
    drawRoad();           
    manageEnemies();      
    drawPlayer();         
    drawLiscioEffects();  
    
    totalDistance += player.speedZ; 
    let pitch = 0.8 + (player.speedZ / player.maxSpeedZ) * 1.5;
    window.engineSound.playbackRate = Math.max(0.5, Math.min(pitch, 2.5));

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function startEngine() { runGameLoop(); }
function stopEngine() { cancelAnimationFrame(gameLoopId); window.engineSound.pause(); }

function togglePause() {
    window.isPaused = !window.isPaused;
    const menu = document.getElementById('pause-menu');
    if (window.isPaused) {
        if (menu) menu.style.display = 'flex';
        window.engineSound.pause();
    } else {
        if (menu) menu.style.display = 'none';
        if (window.isAudioEnabled) window.engineSound.play();
        runGameLoop();
    }
}

function quitGame() {
    window.isGameOver = true;
    stopEngine();
    loadScreen('home');
}
// ... (Mantieni drawRoad, updateScore e triggerGameOver come le avevamo definite)
