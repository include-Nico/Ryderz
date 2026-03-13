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
    minSpeedZ: 3,   
    accelRate: 0,
    isAccelerating: false,
    hasAcceleratedOnce: false // Capisce se hai iniziato a correre
};

function resetPlayer() {
    player.x = canvas.width / 2 + 10; 
    player.y = canvas.height - 120;
    player.dx = 0;
    player.isAccelerating = false;
    player.hasAcceleratedOnce = false; 
    
    // Legge le statistiche dal garage
    player.speedX = playerProfile.stats.handling;
    player.accelRate = playerProfile.stats.acceleration;
    player.maxSpeedZ = playerProfile.stats.maxSpeed;
    player.speedZ = player.minSpeedZ; 
}

// --- COMANDI DA TASTIERA (PC) ---
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    
    if (key === 'a' || key === 'arrowleft') player.dx = -player.speedX;
    else if (key === 'd' || key === 'arrowright') player.dx = player.speedX;
    
    if (key === 'w' || key === 'arrowup') player.isAccelerating = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    
    if (key === 'a' || key === 'arrowleft' || key === 'd' || key === 'arrowright') {
        player.dx = 0;
    }
    else if (key === 'w' || key === 'arrowup') {
        player.isAccelerating = false;
    }
});

// --- COMANDI TOUCH (MOBILE) ---
function setupTouchControls() {
    let isDragging = false;
    let previousTouchX = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (isGameOver) return;
        isDragging = true;
        player.isAccelerating = true; 
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

    canvas.addEventListener('touchend', () => {
        isDragging = false;
        player.isAccelerating = false; 
    });
}

// --- FISICA E DISEGNO ---
function updatePlayer() {
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    if (player.isAccelerating) {
        player.hasAcceleratedOnce = true; 
        player.speedZ += player.accelRate; 
        if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
    } else {
        player.speedZ -= 0.1; 
        if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
    }
}

function drawPlayer() {
    ctx.fillStyle = '#ff2a2a'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15);
    ctx.fillRect(player.x + 5, player.y + 45, player.width - 10, 15);
}
