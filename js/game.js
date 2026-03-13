// --- VARIABILI GLOBALI DI GIOCO ---
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;
let isPaused = false; // Nuova variabile per la pausa
let roadOffset = 0;
let touchInitialized = false;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    frames = 0;
    score = 0;
    roadOffset = 0;
    isGameOver = false;
    isPaused = false; 
    
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: 0`;

    // Assicuriamoci che il menu di pausa sia invisibile quando inizia una nuova partita
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.style.display = 'none';

    resetPlayer();  
    resetTraffic(); 

    if (!touchInitialized) {
        setupTouchControls(); 
        touchInitialized = true;
    }
    
    startEngine();
}

// --- LOGICA DELLA PAUSA ---
function togglePause() {
    if (isGameOver) return; // Se sei già morto, non puoi mettere in pausa
    
    isPaused = !isPaused; // Inverte lo stato (da falso a vero, o da vero a falso)
    const pauseMenu = document.getElementById('pause-menu');
    
    if (isPaused) {
        // MOSTRA IL MENU PAUSA
        if (pauseMenu) pauseMenu.style.display = 'flex';
        
        // Per sicurezza, azzeriamo gli input del giocatore così l'auto non sbanda alla ripresa
        player.dx = 0;
        player.isAccelerating = false;
        
    } else {
        // NASCONDI IL MENU E RIPRENDI A GIOCARE
        if (pauseMenu) pauseMenu.style.display = 'none';
        runGameLoop(); // Fai ripartire il motore!
    }
}

// --- ABBANDONO PARTITA ---
function quitGame() {
    isGameOver = true;
    isPaused = false;
    stopEngine();
    loadScreen('home'); // Ritorna al menu usando la funzione in app.js
}

// --- LOOP PRINCIPALE ---
function runGameLoop() {
    if (isGameOver || isPaused) return; // Se è in pausa, il loop si "congela" qui!

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

        let gear = 1;
        if (visualSpeed > 100) gear = 5;
        else if (visualSpeed > 75) gear = 4;
        else if (visualSpeed > 50) gear = 3;
        else if (visualSpeed > 35) gear = 2;

        gearElement.innerText = `Marcia: ${gear}`;
    }
}

function triggerGameOver() {
    isGameOver = true;
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
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
