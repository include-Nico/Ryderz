// --- VARIABILI GLOBALI E AUDIO ---
let canvas, ctx, frames = 0, gameLoopId, score = 0, isGameOver = false, isPaused = false, roadOffset = 0, touchInitialized = false;
let currentGear = 1;

const engineSound = new Audio('audio/engine.mp3');
engineSound.loop = true;
engineSound.volume = 0.5;

const shiftSound = new Audio('audio/shift.mp3');
const crashSound = new Audio('audio/crash.mp3');

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    frames = 0; score = 0; roadOffset = 0; currentGear = 1; isGameOver = false; isPaused = false;
    
    resetPlayer();  
    resetTraffic(); 
    if (!touchInitialized) { setupTouchControls(); touchInitialized = true; }
    
    // Avvio motore
    engineSound.playbackRate = 0.8;
    engineSound.play().catch(e => {});
    startEngine();
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
    
    if (isContromano()) {
        let alpha = 0.7 + Math.sin(frames * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ CONTROMANO: PUNTI X2 ⚠️", canvas.width / 2, 70);
        ctx.textAlign = "left"; 
    }

    updateScore();        

    // --- COLLEGAMENTO VELOCITÀ -> SUONO MOTORE ---
    // Calcola il pitch in base alla velocità attuale rispetto alla massima
    let pitch = 0.8 + (player.speedZ / playerProfile.stats.maxSpeed) * 1.5;
    engineSound.playbackRate = Math.max(0.5, Math.min(pitch, 2.5));

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: ${score}`;

    let visualSpeed = Math.floor(player.speedZ * 10); 
    const speedElement = document.getElementById('speedometer');
    if (speedElement) speedElement.innerText = `${visualSpeed} km/h`;

    // --- LOGICA CAMBIO MARCIA E SUONO ---
    let newGear = 1;
    if (visualSpeed > 100) newGear = 5;
    else if (visualSpeed > 75) newGear = 4;
    else if (visualSpeed > 50) newGear = 3;
    else if (visualSpeed > 35) newGear = 2;

    if (newGear > currentGear) {
        shiftSound.currentTime = 0;
        shiftSound.play().catch(e => {});
    }
    currentGear = newGear;
    const gearElement = document.getElementById('gear-display');
    if (gearElement) gearElement.innerText = `Marcia: ${currentGear}`;
}

function triggerGameOver() {
    isGameOver = true;
    engineSound.pause(); 
    crashSound.play().catch(e => {}); // Suono incidente
    stopEngine();
    addBanknotes(Math.floor(score / 5)); 
    window.lastScore = score; window.lastCash = Math.floor(score / 5);
    setTimeout(() => { loadScreen('result'); }, 800);
}

// Funzioni di supporto (Pausa, Road, Engine) come nelle versioni precedenti
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) { engineSound.pause(); document.getElementById('pause-menu').style.display = 'flex'; }
    else { engineSound.play(); document.getElementById('pause-menu').style.display = 'none'; runGameLoop(); }
}
function quitGame() { isGameOver = true; stopEngine(); loadScreen('home'); }
function drawRoad() {
    ctx.fillStyle = '#444'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    roadOffset = (roadOffset + player.speedZ) % 40; 
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 3, i + roadOffset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 1, i + roadOffset, 2, 20);
    }
}
function updateScore() { if (frames % 10 === 0) { score += isContromano() ? (Math.floor(player.speedZ / 3) * 2) : Math.floor(player.speedZ / 3); updateScoreDisplay(); } }
function startEngine() { runGameLoop(); }
function stopEngine() { cancelAnimationFrame(gameLoopId); engineSound.pause(); }
