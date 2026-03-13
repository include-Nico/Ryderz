const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let frames = 0;
let gameLoopId;

// Il Game Loop: la funzione che si ripete 60 volte al secondo
function runGameLoop() {
    // Pulisce il frame precedente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna la strada animata
    drawRoad();

    frames++;
    // Richiede il frame successivo all'infinito
    gameLoopId = requestAnimationFrame(runGameLoop);
}

// Disegna le linee di mezzeria della strada
function drawRoad() {
    ctx.fillStyle = 'white';
    let offset = frames % 40; // L'offset crea il movimento verso il basso
    
    // Disegna i rettangoli bianchi al centro
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 5, i + offset, 10, 20);
    }
}

// Accende il motore (chiamata da app.js)
function startEngine() {
    frames = 0;
    runGameLoop();
}

// Spegne il motore (chiamata da app.js)
function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    // Pulisce lo schermo quando esci
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
