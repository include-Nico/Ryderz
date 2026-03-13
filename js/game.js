// Variabili globali
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;

// Gestione traffico
let enemies = [];
let enemySpawnRate = 100; // Un nemico ogni 100 frame all'inizio
const enemyColors = ['#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0', '#FF9800'];
let liscioEffects = []; // Per le scritte a schermo

// --- 1. L'AUTO DEL GIOCATORE ---
const player = {
    x: 0, y: 0, width: 40, height: 70, speed: 6, dx: 0
};

// --- 2. COMANDI DA COMPUTER ---
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') player.dx = -player.speed;
    else if (key === 'd' || key === 'arrowright') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft' || key === 'd' || key === 'arrowright') {
        player.dx = 0;
    }
});

// --- 3. INIZIALIZZAZIONE ---
let touchInitialized = false;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Reset variabili di gioco
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 100;
    player.dx = 0;
    frames = 0;
    score = 0;
    enemies = [];
    liscioEffects = [];
    enemySpawnRate = 90; // Difficoltà iniziale
    isGameOver = false;
    
    // Resetta il testo dello score
    document.getElementById('score').innerText = `Punti: 0`;

    if (!touchInitialized) {
        setupTouchControls();
        touchInitialized = true;
    }

    startEngine();
}

// --- 4. COMANDI TOUCH ---
function setupTouchControls() {
    let isDragging = false;
    let previousTouchX = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (isGameOver) return;
        isDragging = true;
        previousTouchX = e.touches[0].clientX;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || isGameOver) return;
        e.preventDefault(); 
        const currentTouchX = e.touches[0].clientX;
        player.x += (currentTouchX - previousTouchX); 
        
        // Bordi della strada
        if (player.x < 10) player.x = 10;
        if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

        previousTouchX = currentTouchX;
    }, { passive: false });

    canvas.addEventListener('touchend', () => isDragging = false);
}

// --- 5. IL LOOP PRINCIPALE ---
function runGameLoop() {
    if (isGameOver) return; // Se hai perso, blocca tutto

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();
    updatePlayer();
    manageEnemies(); // Gestisce il traffico, le collisioni e i lisci
    drawPlayer();
    updateScore();

    frames++;

    // Aumenta la difficoltà progressivamente (i nemici spawnano più in fretta)
    if (frames % 600 === 0 && enemySpawnRate > 30) {
        enemySpawnRate -= 10;
    }

    gameLoopId = requestAnimationFrame(runGameLoop);
}

// --- 6. MOTORE GRAFICO E FISICO ---
function drawRoad() {
    // Sfondo asfalto
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    let offset = frames % 40; 
    
    // Linea centrale doppia (spartitraffico)
    ctx.fillStyle = '#FFEB3B'; // Gialla
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 4, i + offset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 2, i + offset, 2, 20);
    }
    
    // Linee tratteggiate bianche che dividono le corsie
    ctx.fillStyle = 'white';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 4 - 2, i + offset, 4, 20); // Corsia di sx
        ctx.fillRect((canvas.width / 4) * 3 - 2, i + offset, 4, 20); // Corsia di dx
    }
}

function updatePlayer() {
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;
}

function manageEnemies() {
    // 1. GENERAZIONE NEMICI
    if (frames % enemySpawnRate === 0) {
        // Scegli a caso una delle 4 corsie (0 e 1 sono a sinistra, 2 e 3 a destra)
        const lane = Math.floor(Math.random() * 4);
        const laneWidth = canvas.width / 4;
        
        // Centra il nemico nella sua corsia
        const ex = (lane * laneWidth) + (laneWidth / 2) - (40 / 2);
        let espeed;

        // Se è a sinistra (senso di marcia opposto) viene giù velocissimo
        if (lane < 2) {
            espeed = Math.random() * 4 + 8; // Velocità tra 8 e 12
        } 
        // Se è a destra (tuo senso di marcia) viene giù lentamente (lo superi)
        else {
            espeed = Math.random() * 2 + 2; // Velocità tra 2 e 4
        }

        enemies.push({
            x: ex, y: -100, width: 40, height: 70, speed: espeed,
            color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
            passed: false // Serve a capire se lo hai già superato per dare il punteggio
        });
    }

    // 2. MOVIMENTO E LOGICA NEMICI
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed; // Muovi in basso

        // Disegna nemico
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        // Parabrezza
        ctx.fillStyle = '#111';
        ctx.fillRect(e.x + 5, e.y + (e.speed > 5 ? 45 : 10), e.width - 10, 15); 
        ctx.fillRect(e.x + 5, e.y + (e.speed > 5 ? 10 : 45), e.width - 10, 15);

        // --- COLLISIONE (Game Over) ---
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            triggerGameOver();
        }

        // --- CALCOLO "LISCIO" E PUNTI SORPASSO ---
        if (!e.passed && e.y > player.y + player.height) {
            e.passed = true;
            score += 10; // Punti per aver superato un'auto

            // Calcoliamo la distanza orizzontale dal centro delle auto
            const centerPlayer = player.x + player.width / 2;
            const centerEnemy = e.x + e.width / 2;
            const distance = Math.abs(centerPlayer - centerEnemy);

            // Se la distanza è appena maggiore della collisione (circa 40px è botto, 41-65px è liscio)
            if (distance > 40 && distance < 65) {
                score += 50; // Bonus liscio!
                liscioEffects.push({ x: player.x, y: player.y, alpha: 1.0 }); // Fa apparire la scritta
            }
            updateScoreDisplay();
        }

        // Elimina auto uscite dallo schermo per non appesantire il gioco
        if (e.y > canvas.height + 50) {
            enemies.splice(i, 1);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#ff2a2a'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15);
    ctx.fillRect(player.x + 5, player.y + 45, player.width - 10, 15);

    // Disegna scritte "LISCIO!" animate
    for (let i = liscioEffects.length - 1; i >= 0; i--) {
        let effect = liscioEffects[i];
        ctx.fillStyle = `rgba(255, 215, 0, ${effect.alpha})`; // Oro trasparente
        ctx.font = "bold 22px Arial";
        ctx.fillText("LISCIO! +50", effect.x - 30, effect.y - 20);
        
        effect.y -= 2; // Fa salire la scritta
        effect.alpha -= 0.03; // Fa svanire la scritta
        
        if (effect.alpha <= 0) liscioEffects.splice(i, 1);
    }
}

function updateScore() {
    // Guadagni 1 punto costantemente ogni tot frame solo sopravvivendo
    if (frames % 10 === 0) {
        score += 1;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: ${score}`;
}

// --- 7. GAME OVER ---
function triggerGameOver() {
    isGameOver = true;
    stopEngine();
    
    // Mostra l'alert e torna al menu dopo un millisecondo per far disegnare l'impatto a schermo
    setTimeout(() => {
        alert(`💥 INCIDENTE! 💥\nHai totalizzato: ${score} punti.\nRitenta, sarai più fortunato!`);
        loadScreen('home');
    }, 50);
}

function startEngine() {
    runGameLoop();
}

function stopEngine() {
    cancelAnimationFrame(gameLoopId);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
}
