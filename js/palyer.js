const player = {
    x: 0, y: 0, width: 40, height: 70, 
    speedX: 6, dx: 0, 
    speedZ: 3, maxSpeedZ: 18, minSpeedZ: 3, 
    isAccelerating: false
};

function resetPlayer() {
    player.x = canvas.width / 2 + 10; 
    player.y = canvas.height - 120;
    player.speedZ = player.minSpeedZ;
    player.isAccelerating = false;
}

// Comandi PC
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') player.dx = -player.speedX;
    if (key === 'd' || key === 'arrowright') player.dx = player.speedX;
    if (key === 'w' || key === 'arrowup') player.isAccelerating = true; // ACCELERA
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft' || key === 'd' || key === 'arrowright') player.dx = 0;
    if (key === 'w' || key === 'arrowup') player.isAccelerating = false; // DECELERA
});

// Comandi Mobile
function setupTouchControls() {
    canvas.addEventListener('touchstart', (e) => {
        if (isGameOver) return;
        player.isAccelerating = true; // ACCELERA AL TOCCO
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); 
        let touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        player.x = touchX - player.width / 2;
    }, { passive: false });

    canvas.addEventListener('touchend', () => { player.isAccelerating = false; });
}

function updatePlayer() {
    player.x += player.dx;
    // Limiti laterali
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    // Gestione velocità frontale
    if (player.isAccelerating) {
        player.speedZ += 0.25; 
        if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
    } else {
        player.speedZ -= 0.35; 
        if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
    }
}

function drawPlayer() {
    ctx.fillStyle = '#ff2a2a'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
}
