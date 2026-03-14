// --- VARIABILI GLOBALI DI GIOCO ---
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;
let isPaused = false; 
let roadOffset = 0;
let totalDistance = 0; // Nuova: Tiene traccia dello spazio percorso
let touchInitialized = false;
let currentGear = 1;
let pitchDrop = 0; 

// --- AUDIO DI GIOCO ---
const engineSound = new Audio('audio/engine.mp3');
engineSound.loop = true;
engineSound.volume = 0.5;
engineSound.preservesPitch = false; 

const crashSound = new Audio('audio/crash.mp3');
crashSound.volume = 1.0;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    frames = 0;
    score = 0;
    roadOffset = 0;
    totalDistance = 0; // Azzera la distanza per far riapparire l'area di sosta
    currentGear = 1;
    pitchDrop = 0;
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
    
    engineSound.playbackRate = 0.8;
    engineSound.play().catch(e => console.log("Audio bloccato dal browser all'avvio"));

    startEngine();
}

function togglePause() {
    if (isGameOver || player.isStarting) return; // Niente pausa durante il filmato iniziale
    
    isPaused = !isPaused; 
    const pauseMenu = document.getElementById('pause-menu');
    
    if (isPaused) {
        if (pauseMenu) pauseMenu.style.display = 'flex';
        player.dx = 0;
        player.isAccelerating = false;
        engineSound.pause(); 
    } else {
        if (pauseMenu) pauseMenu.style.display = 'none';
        engineSound.play(); 
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
    
    // Niente scritte mentre fai l'animazione di partenza
    if (isContromano() && !player.isStarting) {
        let alpha = 0.7 + Math.sin(frames * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ CONTROMANO: PUNTI X2 ⚠️", canvas.width / 2, 70);
        ctx.textAlign = "left"; 
    }

    updateScore();        

    totalDistance += player.speedZ; // Aumenta i metri percorsi

    // --- MODULA IL PITCH DEL MOTORE ---
    if (pitchDrop > 0) {
        pitchDrop -= 0.03; 
        if (pitchDrop < 0) pitchDrop = 0;
    }
    let pitch = 0.8 + (player.speedZ / playerProfile.stats.maxSpeed) * 1.5 - pitchDrop;
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

    // --- DISEGNO AREA DI SOSTA (Scompare man mano che si avanza) ---
    if (totalDistance < canvas.height + 800) {
        let sostaY = (canvas.height - 300) + totalDistance; // Scorre verso il basso
        
        ctx.fillStyle = '#222'; // Asfalto più scuro per l'emergenza
        ctx.fillRect(canvas.width - 60, sostaY, 60, 800);
        
        ctx.fillStyle = 'white'; // Linea tratteggiata di immissione
        for (let i = 0; i < 800; i += 40) {
            ctx.fillRect(canvas.width - 62, sostaY + i, 4, 20);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Scritta a terra
        ctx.font = "bold 24px Arial";
        ctx.fillText("SOS", canvas.width - 55, sostaY + 200);
    }
}

function updateScore() {
    // Il punteggio si ferma se la macchina sta partendo per evitare abusi
    if (frames % 10 === 0 && !player.isStarting && player.speedZ >= 3) {
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

        let newGear = 1;
        if (visualSpeed > 100) newGear = 5;
        else if (visualSpeed > 75) newGear = 4;
        else if (visualSpeed > 50) newGear = 3;
        else if (visualSpeed > 35) newGear = 2;

        if (newGear > currentGear) {
            engineSound.currentTime = 0; 
            player.shiftDelay = 15; 
            pitchDrop = 0.6; 
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
