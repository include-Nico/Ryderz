// --- L'AUTO DEL GIOCATORE --
const player = {
    x: 0, 
    y: 0, 
    width: 40, 
    height: 70, 
    speedX: 6,      // Velocità di sterzata
    dx: 0,          // Direzione attuale sterzata
    speedZ: 3,      // Velocità frontale (acceleratore)
    maxSpeedZ: 18,  // Velocità massima
    minSpeedZ: 3,   // Velocità minima (quando non acceleri)
    isAccelerating: false // Stato dell'acceleratore
};

/**
 * Resetta la posizione del giocatore all'inizio di una partita
 */
function resetPlayer() {
    player.x = canvas.width / 2 + 10; 
    player.y = canvas.height - 120;
    player.dx = 0;
    player.speedZ = player.minSpeedZ;
    player.isAccelerating = false;
}

// --- COMANDI DA TASTIERA (PC) ---
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    
    // Sterzata
    if (key === 'a' || key === 'arrowleft') player.dx = -player.speedX;
    else if (key === 'd' || key === 'arrowright') player.dx = player.speedX;
    
    // Acceleratore
    if (key === 'w' || key === 'arrowup') player.isAccelerating = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    
    // Ferma la sterzata
    if (key === 'a' || key === 'arrowleft' || key === 'd' || key === 'arrowright') {
        player.dx = 0;
    }
    // Rilascia l'acceleratore
    else if (key === 'w' || key === 'arrowup') {
        player.isAccelerating = false;
    }
});

// --- COMANDI TOUCH (MOBILE) ---
function setupTouchControls() {
    let isDragging = false;
    let previousTouchX = 0;

    // Quando tocchi lo schermo: Inizi ad accelerare e a trascinare
    canvas.addEventListener('touchstart', (e) => {
        if (isGameOver) return;
        isDragging = true;
        player.isAccelerating = true; 
        previousTouchX = e.touches[0].clientX;
    }, { passive: false });

    // Mentre muovi il dito: Sterzi
    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || isGameOver) return;
        e.preventDefault(); 
        const currentTouchX = e.touches[0].clientX;
        player.x += (currentTouchX - previousTouchX); 
        
        // Non uscire dalla strada
        if (player.x < 10) player.x = 10;
        if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

        previousTouchX = currentTouchX;
    }, { passive: false });

    // Quando alzi il dito: Smetti di accelerare
    canvas.addEventListener('touchend', () => {
        isDragging = false;
        player.isAccelerating = false; 
    });
}

// --- FISICA E DISEGNO ---
function updatePlayer() {
    // 1. Spostamento laterale (solo tastiera, il touch è gestito sopra)
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    // 2. Calcolo Accelerazione / Decelerazione
    if (player.isAccelerating) {
        player.speedZ += 0.2; 
        if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
    } else {
        player.speedZ -= 0.4; // Frena più velocemente di quanto accelera
        if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
    }
}

function drawPlayer() {
    // Base auto
    ctx.fillStyle = '#ff2a2a'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Finestrini neri
    ctx.fillStyle = '#111';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15);
    ctx.fillRect(player.x + 5, player.y + 45, player.width - 10, 15);
}
