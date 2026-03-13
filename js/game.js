// Variabili globali
let canvas;
let ctx;
let frames = 0;
let gameLoopId;
let score = 0;
let isGameOver = false;

// Gestione traffico
let enemies = [];
let enemySpawnRate = 100; 
const enemyColors = ['#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0', '#FF9800'];
let liscioEffects = []; 

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
    
    player.x = canvas.width / 2 + 10; // Fai nascere l'auto nella corsia di destra (sicura)
    player.y = canvas.height - 100;
    player.dx = 0;
    frames = 0;
    score = 0;
    enemies = [];
    liscioEffects = [];
    enemySpawnRate = 90; 
    isGameOver = false;
    
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
        
        if (player.x < 10) player.x = 10;
        if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

        previousTouchX = currentTouchX;
    }, { passive: false });

    canvas.addEventListener('touchend', () => isDragging = false);
}

// --- 5. IL LOOP PRINCIPALE ---
function runGameLoop() {
    if (isGameOver) return; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();
    updatePlayer();
    manageEnemies(); 
    drawPlayer();
    updateScore();

    frames++;

    if (frames % 600 === 0 && enemySpawnRate > 30) {
        enemySpawnRate -= 10;
    }

    gameLoopId = requestAnimationFrame(runGameLoop);
}

// --- 6. MOTORE GRAFICO E FISICO ---
function drawRoad() {
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    let offset = frames % 40; 
    
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 4, i + offset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 2, i + offset, 2, 20);
    }
    
    ctx.fillStyle = 'white';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 4 - 2, i + offset, 4, 20); 
        ctx.fillRect((canvas.width / 4) * 3 - 2, i + offset, 4, 20); 
    }
}

function updatePlayer() {
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;
}

// Funzione di supporto per capire se siamo contromano
function isContromano() {
    // Se il centro della nostra auto è a sinistra della striscia gialla centrale
    return (player.x + player.width / 2) < (canvas.width / 2);
}

function manageEnemies() {
    if (frames % enemySpawnRate === 0) {
        const lane = Math.floor(Math.random() * 4);
        const laneWidth = canvas.width / 4;
        
        const ex = (lane * laneWidth) + (laneWidth / 2) - (40 / 2);
        let espeed = (lane < 2) ? (Math.random() * 4 + 8) : (Math.random() * 2 + 2);

        enemies.push({
            x: ex, y: -100, width: 40, height: 70, speed: espeed,
            color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
            passed: false 
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed; 

        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = '#111';
        ctx.fillRect(e.x + 5, e.y + (e.speed > 5 ? 45 : 10), e.width - 10, 15); 
        ctx.fillRect(e.x + 5, e.y + (e.speed > 5 ? 10 : 45), e.width - 10, 15);

        // Collisione
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            triggerGameOver();
        }

        // Calcolo sorpasso e liscio
        if (!e.passed && e.y > player.y + player.height) {
            e.passed = true;
            
            // Moltiplicatore attivo se siamo contromano
            let multiplier = isContromano() ? 2 : 1;
            
            score += 10 * multiplier; 

            const centerPlayer = player.x + player.width / 2;
            const centerEnemy = e.x + e.width / 2;
            const distance = Math.abs(centerPlayer - centerEnemy);

            if (distance > 40 && distance < 65) {
                let liscioPoints = 50 * multiplier;
                score += liscioPoints; 
                // Salviamo anche quanti punti abbiamo fatto per scriverlo a schermo
                liscioEffects.push({ x: player.x, y: player.y, alpha: 1.0, points: liscioPoints }); 
            }
            updateScoreDisplay();
        }

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
        
        // Se i punti sono 100 (moltiplicati), facciamo la scritta rossa, altrimenti oro
        ctx.fillStyle = effect.points >= 100 ? `rgba(255, 50, 50, ${effect.alpha})` : `rgba(255, 215, 0, ${effect.alpha})`; 
        ctx.font = "bold 22px Arial";
        ctx.fillText(`LISCIO! +${effect.points}`, effect.x - 30, effect.y - 20);
        
        effect.y -= 2; 
        effect.alpha -= 0.03; 
        
        if (effect.alpha <= 0) liscioEffects.splice(i, 1);
    }
}

function updateScore() {
    if (frames % 10 === 0) {
        // Se sei contromano prendi 2 punti di sopravvivenza, altrimenti 1
        score += isContromano() ? 2 : 1;
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
