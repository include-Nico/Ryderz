// --- VARIABILI GLOBALI DI GIOCO ---
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;
let roadOffset = 0;
let touchInitialized = false;

// --- INIZIALIZZAZIONE ---
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Resetta lo stato globale
    frames = 0;
    score = 0;
    roadOffset = 0;
    isGameOver = false;
    document.getElementById('score').innerText = `Punti: 0`;

    // Resetta le variabili dagli altri file
    resetPlayer();  // Chiama funzione in player.js
    resetTraffic(); // Chiama funzione in traffic.js

    if (!touchInitialized) {
        setupTouchControls(); // Chiama funzione in player.js
        touchInitialized = true;
    }
    
    startEngine();
}

// --- LOOP PRINCIPALE (Il Cuore del Gioco) ---
function runGameLoop() {
    if (isGameOver) return; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();       // Da player.js
    drawRoad();           // Locale
    manageEnemies();      // Da traffic.js
    drawPlayer();         // Da player.js
    drawLiscioEffects();  // Da traffic.js
    updateScore();        // Locale

    frames++;
    increaseDifficulty(); // Da traffic.js

    gameLoopId = requestAnimationFrame(runGameLoop);
}

// --- AMBIENTE E PUNTEGGIO ---
function drawRoad() {
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    roadOffset = (roadOffset + player.speedZ) % 40; 
    
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 4, i + roadOffset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 2, i + roadOffset, 2, 20);
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
}

// --- GESTIONE STATO ---
function triggerGameOver() {
    isGameOver = true;
    stopEngine();
    
    setTimeout(() => {
        alert(`💥 INCIDENTE! 💥\nHai totalizzato: ${score} punti.\nRitenta, sarai più fortunato!`);
        loadScreen('home'); // Ritorna al menu usando la funzione in app.js
    }, 50);
}

function startEngine() {
    runGameLoop();
}

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
