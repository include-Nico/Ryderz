// Variabili globali (le riempiremo quando il canvas viene caricato)
let canvas;
let ctx;
let frames = 0;
let gameLoopId;

// --- 1. CREIAMO IL GIOCATORE ---
const player = {
    x: 0,          // Posizione orizzontale
    y: 0,          // Posizione verticale
    width: 40,     // Larghezza dell'auto
    height: 70,    // Lunghezza dell'auto
    speed: 6,      // Velocità di spostamento laterale
    dx: 0          // Direzione attuale (0 = ferma, -speed = sinistra, +speed = destra)
};

// --- 2. GESTIONE DEI COMANDI (Tastiera) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.dx = -player.speed; // Muovi a sinistra
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.dx = player.speed;  // Muovi a destra
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || 
        e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.dx = 0; // Ferma l'auto se rilasci il tasto
    }
});

// --- 3. INIZIALIZZAZIONE DEL GIOCO (Chiamata da app.js) ---
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Posiziona il giocatore al centro, in basso
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 100;
    player.dx = 0;
    frames = 0;

    startEngine();
}

// --- 4. IL GAME LOOP (Il motore del gioco) ---
function runGameLoop() {
    // Pulisce lo schermo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna gli elementi
    drawRoad();
    updatePlayer(); // Calcola la nuova posizione
    drawPlayer();   // Disegna l'auto

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

// --- 5. LOGICA E DISEGNO ---
function drawRoad() {
    ctx.fillStyle = 'white';
    let offset = frames % 40; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 5, i + offset, 10, 20);
    }
}

function updatePlayer() {
    // Aggiorna la posizione in base al tasto premuto
    player.x += player.dx;

    // Impedisci all'auto di uscire fuori dalla strada
    if (player.x < 10) {
        player.x = 10;
    }
    if (player.x + player.width > canvas.width - 10) {
        player.x = canvas.width - player.width - 10;
    }
}

function drawPlayer() {
    // Per ora l'auto è un semplice blocco rosso (la sostituiremo con un'immagine)
    ctx.fillStyle = '#ff2a2a'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Disegniamo due finestrini neri per far capire il verso dell'auto
    ctx.fillStyle = '#111';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15); // Parabrezza
    ctx.fillRect(player.x + 5, player.y + 45, player.width - 10, 15); // Lunotto
}

// Accende e spegne il motore
function startEngine() {
    runGameLoop();
}

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
