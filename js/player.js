window.player = {
    x: 0, y: 0, width: 40, height: 70,
    speedX: 0, dx: 0, speedZ: 0, maxSpeedZ: 15, minSpeedZ: 1, 
    accelRate: 0.04, isAccelerating: false, hasAcceleratedOnce: false, 
    shiftDelay: 0, isIgniting: true, isStarting: false 
};

window.playerSprite = new Image();

function resetPlayer() {
    // Posizione iniziale nell'area SOS
    player.x = canvas.width - 45; 
    player.y = canvas.height - 120;
    player.dx = 0;
    player.speedZ = 0;
    player.isAccelerating = false;
    player.hasAcceleratedOnce = false; 
    player.isIgniting = true; 
    player.isStarting = false;
    
    // Recupero dati dal profilo e catalogo
    const profile = window.playerProfile;
    const baseCar = carCatalog.find(c => c.id === profile.equippedCarId) || carCatalog[0];
    const upgrades = (profile.upgrades && profile.upgrades[baseCar.id]) ? profile.upgrades[baseCar.id] : { speed: 0, handling: 0, accel: 0 };

    // Applica Bonus (+5% per livello)
    player.maxSpeedZ = baseCar.baseStats.maxSpeed * (1 + (upgrades.speed * 0.05));
    player.speedX = baseCar.baseStats.handling * (1 + (upgrades.handling * 0.05));
    player.accelRate = baseCar.baseStats.acceleration * (1 + (upgrades.accel * 0.05));
    
    playerSprite.src = baseCar.imgGame;
}

function updatePlayer() {
    if (player.isIgniting) return;
    if (player.isStarting) {
        player.speedZ += 0.015;
        if (player.speedZ > 0.4) player.x -= 0.6; 
        if (player.speedZ >= 1.0 && player.x <= canvas.width - 100) {
            player.speedZ = 1.0; player.isStarting = false;
        }
        return;
    }
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    if (player.isAccelerating) {
        player.hasAcceleratedOnce = true;
        let resistance = player.speedZ / (player.maxSpeedZ * 1.2);
        player.speedZ += player.accelRate * (1 - resistance);
        if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
    } else {
        player.speedZ -= 0.1;
        if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
    }
}

function drawPlayer() {
    let drawW = player.width + 16;
    let drawH = player.height + 28;
    if (playerSprite.complete && playerSprite.naturalHeight !== 0) {
        ctx.drawImage(playerSprite, player.x - 8, player.y - 14, drawW, drawH);
    } else {
        ctx.fillStyle = 'red'; ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function setupTouchControls() {
    canvas.addEventListener('touchstart', () => { player.isAccelerating = true; }, {passive:false});
    canvas.addEventListener('touchend', () => { player.isAccelerating = false; }, {passive:false});
    canvas.addEventListener('touchmove', (e) => {
        let touchX = e.touches[0].clientX - canvas.offsetLeft;
        player.x = touchX - player.width / 2;
    }, {passive:false});
}
