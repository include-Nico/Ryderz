// --- VARIABILI GLOBALI DI GIOCO ---
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;
let roadOffset = 0;
let touchInitialized = false;

/**
 * Inizializza il canvas e resetta tutti i parametri.
 * Viene chiamata da app.js quando carichi la schermata 'game'.
 */
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Reset dello stato globale
    frames = 0;
    score = 0;
    roadOffset = 0;
    isGameOver = false;
    
    // Reset dell'interfaccia punti
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: 0`;

    // --- RESET DEGLI ALTRI MODULI ---
    resetPlayer();  // Funzione definita in player.js
    resetTraffic(); // Funzione definita in traffic.js

    // Inizializza i controlli touch solo la prima volta
    if (!touchInitialized) {
        setupTouchControls(); // Funzione definita in player.js
        touchInitialized = true;
    }
    
    startEngine();
}

/**
 * Il Game Loop principale: viene eseguito 60 volte al secondo.
 */
function runGameLoop() {
    if (isGameOver) return; 

    // 1. Pulisce il frame precedente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Aggiorna la logica (chiamando i vari file)
    updatePlayer();       // Da player.js: gestisce accelerazione e sterzo
    increaseDifficulty(); // Da traffic.js: rende il gioco più difficile nel tempo
    
    // 3. Disegna gli elementi a schermo
    drawRoad();           // Locale: disegna l'asfalto che scorre
    manageEnemies();      // Da traffic.js: muove, disegna nemici e gestisce collisioni/lisci
    drawPlayer();         // Da player.js: disegna l'auto del giocatore
    drawLiscioEffects();  // Da traffic.js: disegna le scritte dorate dei sorpassi millimetrici
    
    // 4. Aggiorna il punteggio di sopravvivenza
    updateScore();        

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

/**
 * Disegna la strada. 
 * L'acceleratore è qui: roadOffset aumenta in base a player.speedZ.
 */
function drawRoad() {
    // Sfondo asfalto
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // La strada scorre in base alla velocità 'speedZ' calcolata in player.js
    roadOffset = (roadOffset + player.speedZ) % 40; 
    
    // Linea centrale doppia gialla (spartitraffico)
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 3, i + roadOffset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 1, i + roadOffset, 2, 20);
    }
    
    // Linee tratteggiate bianche (divisione corsie)
    ctx.fillStyle = 'white';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 4 - 2, i + roadOffset, 4, 20); 
        ctx.fillRect((canvas.width / 4) * 3 - 2, i + roadOffset, 4, 20); 
    }
}

/**
 * Calcola il punteggio passivo.
 * Più vai veloce (speedZ), più punti accumuli. Raddoppiano in contromano.
 */
function updateScore() {
    if (frames % 10 === 0) {
        let basePoints = Math.floor(player.speedZ / 3);
        score += isContromano() ? (basePoints * 2) : basePoints;
        updateScoreDisplay();
    }
}

// ... (tutto il codice in alto di game.js rimane identico fino a updateScoreDisplay) ...

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: ${score}`;

    const speedElement = document.getElementById('speedometer');
    const gearElement = document.getElementById('gear-display');

    if (speedElement && gearElement) {
        // La velocità del motore (speedZ) va da 3 a 13. Moltiplicata x10 ci dà i km/h esatti.
        let visualSpeed = Math.floor(player.speedZ * 10); 
        speedElement.innerText = `${visualSpeed} km/h`;

        // Logica del cambio marcia in base ai km/h
        let gear = 1;
        if (visualSpeed > 100) gear = 5;
        else if (visualSpeed > 75) gear = 4;
        else if (visualSpeed > 50) gear = 3;
        else if (visualSpeed > 35) gear = 2;

        gearElement.innerText = `Marcia: ${gear}`;
    }
}
// --- GAME OVER MODIFICATO ---
function triggerGameOver() {
    isGameOver = true;
    stopEngine();
    
    // 1. Calcola le banconote guadagnate (es. 1 dollaro ogni 5 punti)
    let cashEarned = Math.floor(score / 5); 
    addBanknotes(cashEarned); // Salva nel garage
    
    // 2. Passa i valori in memoria per leggerli nella schermata dei risultati
    window.lastScore = score;
    window.lastCash = cashEarned;
    
    // 3. Carica la schermata dei risultati (con un leggero ritardo per far vedere lo schianto)
    setTimeout(() => {
        loadScreen('result');
    }, 800);
}

function startEngine() { runGameLoop(); }
function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
