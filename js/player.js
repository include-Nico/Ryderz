// --- L'AUTO DEL GIOCATORE ---
const player = {
    x: 0, 
    y: 0, 
    width: 40, 
    height: 70, 
    speedX: 0,      
    dx: 0,          
    speedZ: 0,      
    maxSpeedZ: 0,  
    minSpeedZ: 1,   // <--- CORRETTO: Velocità minima a 10 km/h
    accelRate: 0,
    isAccelerating: false,
    hasAcceleratedOnce: false, 
    shiftDelay: 0, 
    isIgniting: true, 
    isStarting: false 
};

function resetPlayer() {
    // Parte fuori dalla strada, nell'area SOS a destra
    player.x = canvas.width - 45; 
    player.y = canvas.height - 120;
    player.dx = 0;
    player.isAccelerating = false;
    player.hasAcceleratedOnce = false; 
    player.shiftDelay = 0; 
    player.isIgniting = true; 
    player.isStarting = false;
    
    player.speedX = playerProfile.stats.handling;
    player.accelRate = playerProfile.stats.acceleration;
    player.maxSpeedZ = playerProfile.stats.maxSpeed;
    player.speedZ = 0; // Parte da zero assoluto
    player.minSpeedZ = 1; // <--- CORRETTO: Minimo a 10 km/h
}

// --- COMANDI BLOCCATI DURANTE L'AVVIO ---
document.addEventListener('keydown', (e) => {
    if (isGameOver || (typeof isPaused !== 'undefined' && isPaused) || player.isIgniting || player.isStarting) return;
    
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') player.dx = -player.speedX;
    else if (key === 'd' || key === 'arrowright') player.dx = player.speedX;
    if (key === 'w' || key === 'arrowup') player.isAccelerating = true;
});

document.addEventListener('keyup', (e) => {
    if (player.isIgniting || player.isStarting) return;
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft' || key === 'd' || key === 'arrowright') player.dx = 0;
    else if (key === 'w' || key === 'arrowup') player.isAccelerating = false;
});

function setupTouchControls() {
    let isDragging = false;
    let previousTouchX = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (isGameOver || (typeof isPaused !== 'undefined' && isPaused) || player.isIgniting || player.isStarting) return;
        isDragging = true;
        player.isAccelerating = true; 
        previousTouchX = e.touches[0].clientX;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || isGameOver || (typeof isPaused !== 'undefined' && isPaused) || player.isIgniting || player.isStarting) return;
        e.preventDefault(); 
        const currentTouchX = e.touches[0].clientX;
        player.x += (currentTouchX - previousTouchX); 
        if (player.x < 10) player.x = 10;
        if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;
        previousTouchX = currentTouchX;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        if (player.isIgniting || player.isStarting) return;
        isDragging = false;
        player.isAccelerating = false; 
    });
}

// --- FISICA DELL'ACCENSIONE E IMMISSIONE ---
function updatePlayer() {
    // FASE 1: Accensione (Macchina immobile)
    if (player.isIgniting) {
        player.speedZ = 0;
        return;
    }

    // FASE 2: Partenza automatica (0 a 10 km/h)
    if (player.isStarting) {
        player.speedZ += 0.015; // Accelerazione dolce iniziale
        
        // Inizia a sterzare a sinistra dopo i primi metri
        if (player.speedZ > 0.4) {
            player.x -= 0.6; 
        }

        // Una volta raggiunti i 10 km/h (speedZ = 1.0) e rientrato in corsia
        if (player.speedZ >= 1.0 && player.x <= canvas.width - 100) {
            player.speedZ = 1.0; // Fissa la velocità a 10 esatti
            player.isStarting = false; // Restituisce i comandi
        }
        return;
    }

    // LOGICA DI GIOCO NORMALE
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    if (player.shiftDelay > 0) {
        player.shiftDelay--;
    } else {
        if (player.isAccelerating) {
            player.hasAcceleratedOnce = true; 
            player.speedZ += player.accelRate; 
            if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
        } else {
            player.speedZ -= 0.1; 
            if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#ff2a2a'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15);
    ctx.fillRect(player.x + 5, player.y + 45, player.width - 10, 15);
}
