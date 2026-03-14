// --- L'AUTO DEL GIOCATORE ---
const player = {
    x: 0, y: 0, width: 40, height: 70, 
    speedX: 0, dx: 0, speedZ: 0, maxSpeedZ: 0, minSpeedZ: 1, 
    accelRate: 0, isAccelerating: false, hasAcceleratedOnce: false, 
    shiftDelay: 0, isIgniting: true, isStarting: false 
};

function resetPlayer() {
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
    player.speedZ = 0;
    player.minSpeedZ = 1; 
}

document.addEventListener('keydown', (e) => {
    if (isGameOver || (typeof isPaused !== 'undefined' && isPaused) || player.isIgniting || player.isStarting) return;
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') player.dx = -player.speedX;
    else if (key === 'd' || key === 'arrowright') player.dx = player.speedX;
    if (key === 'w' || key === 'arrowup') player.isAccelerating = true;
});

document.addEventListener('keyup', (e) => {
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
        isDragging = false;
        player.isAccelerating = false; 
    });
}

function updatePlayer() {
    if (player.isIgniting) return;

    if (player.isStarting) {
        player.speedZ += 0.015;
        if (player.speedZ > 0.4) player.x -= 0.6; 
        if (player.speedZ >= 1.0 && player.x <= canvas.width - 100) {
            player.speedZ = 1.0;
            player.isStarting = false;
        }
        return;
    }

    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    if (player.shiftDelay > 0) {
        player.shiftDelay--;
    } else {
        if (player.isAccelerating) {
            player.hasAcceleratedOnce = true; 
            // PROGRESSIONE DIFFICILE: L'accelerazione cala man mano che aumenti la velocità
            let resistance = player.speedZ / (player.maxSpeedZ * 1.2);
            player.speedZ += player.accelRate * (1 - resistance); 
            
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
