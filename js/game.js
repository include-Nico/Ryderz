// --- VARIABILI GLOBALI DI GIOCO ---
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;
let isPaused = false; 
let roadOffset = 0;
let touchInitialized = false;
let currentGear = 1;

// --- AUDIO DI GIOCO ---
const engineSound = new Audio('audio/engine.mp3');
engineSound.loop = true;
engineSound.volume = 0.5;
engineSound.preservesPitch = false; // Fondamentale: permette al pitch di salire e scendere!

const crashSound = new Audio('audio/crash.mp3');
crashSound.volume = 1.0;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    frames = 0;
    score = 0;
    roadOffset = 0;
    currentGear = 1;
    isGameOver = false;
    isPaused = false; 
    
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: 0`;

    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.style.display = 'none';

    resetPlayer();  
    resetTraffic(); 

    if (!touchInitialized) {
        setupTouchControls(); 
        touchInitialized = true;
    }
    
    // Fai partire il rumore del motore al minimo
    engineSound.playbackRate = 0.8;
    engineSound.play().catch(e => console.log("Audio bloccato dal browser all'avvio"));

    startEngine();
}

function togglePause() {
    if (isGameOver) return; 
    
    isPaused = !isPaused; 
    const pauseMenu = document.getElementById('pause-menu');
    
    if (isPaused) {
        if (pauseMenu) pauseMenu.style.display = 'flex';
        player.dx = 0;
        player.isAccelerating = false;
        engineSound.pause(); // Metti in pausa il motore
    } else {
        if (pauseMenu) pauseMenu.style.display = 'none';
        engineSound.play(); // Riprendi il motore
        runGameLoop(); 
    }
}

function quitGame() {
    isGameOver = true;
    isPaused = false;
    stopEngine();
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
    
    if (isContromano()) {
        let alpha = 0.7 + Math.sin(frames * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ CONTROMANO: PUNTI X2 ⚠️", canvas.width / 2, 70);
        ctx.textAlign = "left"; 
    }

    updateScore();        

    // --- MODULA IL PITCH DEL MOTORE ---
    let pitch = 0.8 + (player.speedZ / playerProfile.stats.maxSpeed) * 1.5;
    engineSound.playbackRate = Math.max(0.5, Math.min(pitch, 2.5));

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
}

function updateScore() {
    if (frames % 10 === 0) {
        let basePoints = Math.floor(player.speedZ / 3);
        score += isContromano() ? (basePoints * 2) : basePoints;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: ${score}`;

    const speedElement = document.getElementById('speedometer');
    const gearElement = document.getElementById('gear-display');

    if (speedElement && gearElement) {
        let visualSpeed = Math.floor(player.speedZ * 10); 
        speedElement.innerText = `${visualSpeed} km/h`;

        // Calcolo della marcia
        let newGear = 1;
        if (visualSpeed > 100) newGear = 5;
        else if (visualSpeed > 75) newGear = 4;
        else if (visualSpeed > 50) newGear = 3;
        else if (visualSpeed > 35) newGear = 2;

        // --- SIMULAZIONE CAMBIO MARCIA ---
        if (newGear > currentGear) {
            // 1. Resetta l'audio all'inizio del file
            engineSound.currentTime = 0; 
            
            // 2. Togli un po' di velocità per simulare la frizione e far calare il pitch del motore
            player.speedZ -= 0.8; 
            if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
        }
        currentGear = newGear; 

        gearElement.innerText = `Marcia: ${currentGear}`;
    }
}

function triggerGameOver() {
    isGameOver = true;
    
    engineSound.pause(); 
    crashSound.currentTime = 0;
    crashSound.play().catch(e => {});

    stopEngine();
    
    let cashEarned = Math.floor(score / 5); 
    addBanknotes(cashEarned); 
    
    window.lastScore = score;
    window.lastCash = cashEarned;
    
    setTimeout(() => {
        loadScreen('result');
    }, 800);
}

function startEngine() { runGameLoop(); }

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    engineSound.pause(); 
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
