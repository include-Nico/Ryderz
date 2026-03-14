// --- L'AUTO DEL GIOCATORE ---
window.player = {
    x: 0, y: 0, width: 40, height: 70,
    speedX: 0, dx: 0, speedZ: 0, maxSpeedZ: 0,
    accelRate: 0, isAccelerating: false, isStarting: false, isIgniting: false
};

window.playerSprite = new Image();

function resetPlayer() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    // Posizione iniziale (Area SOS)
    player.x = canvas.width - 60;
    player.y = canvas.height - 120;
    player.speedZ = 0;
    player.dx = 0;
    player.isStarting = true;
    player.isIgniting = false;

    // Recupero auto e potenziamenti dal profilo globale
    const profile = window.playerProfile;
    const carData = window.carCatalog.find(c => c.id === profile.equippedCarId) || window.carCatalog[0];
    const up = profile.upgrades[carData.id] || { speed: 0, handling: 0, accel: 0 };

    // Applica Bonus (+5% per ogni livello dell'officina)
    player.maxSpeedZ = carData.baseStats.maxSpeed * (1 + (up.speed * 0.05));
    player.speedX = carData.baseStats.handling * (1 + (up.handling * 0.05));
    player.accelRate = carData.baseStats.acceleration * (1 + (up.accel * 0.05));
    
    playerSprite.src = carData.imgGame;
}

function updatePlayer() {
    if (player.isStarting) {
        player.speedZ += 0.02;
        if (player.speedZ > 0.5) player.x -= 0.8; 
        if (player.x <= canvas.width / 2 + 20) player.isStarting = false;
        return;
    }

    player.x += player.dx;
    
    // Limiti carreggiata
    if (player.x < 10) player.x = 10;
    if (player.x > canvas.width - 50) player.x = canvas.width - 50;

    if (player.isAccelerating) {
        player.speedZ += player.accelRate;
        if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
    } else {
        player.speedZ *= 0.97; // Attrito
    }
}

function drawPlayer() {
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    if (playerSprite.complete) {
        // Disegno maggiorato (56x98) per coprire bene la hitbox
        ctx.drawImage(playerSprite, player.x - 8, player.y - 14, 56, 98);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function setupTouchControls() {
    const cvs = document.getElementById('gameCanvas');
    cvs.addEventListener('touchstart', (e) => { 
        player.isAccelerating = true; 
    }, {passive: false});
    cvs.addEventListener('touchend', () => { 
        player.isAccelerating = false; 
        player.dx = 0;
    }, {passive: false});
    cvs.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX - cvs.offsetLeft;
        if (touchX < player.x + player.width/2) player.dx = -player.speedX;
        else player.dx = player.speedX;
    }, {passive: false});
}
