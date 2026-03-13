// --- VARIABILI GLOBALI DI GIOCO ---
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;
let roadOffset = 0;
let touchInitialized = false;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    frames = 0;
    score = 0;
    roadOffset = 0;
    isGameOver = false;
    
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: 0`;

    resetPlayer();  
    resetTraffic(); 

    if (!touchInitialized) {
        setupTouchControls(); 
        touchInitialized = true;
    }
    
    startEngine();
}

function runGameLoop() {
    if (isGameOver) return; 

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
