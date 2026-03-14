window.player = {
    x: 0, y: 0, width: 40, height: 70,
    speedX: 5, dx: 0, speedZ: 0, maxSpeedZ: 15, accelRate: 0.04,
    isAccelerating: false, isStarting: false, isIgniting: false
};

window.playerSprite = new Image();

function resetPlayer() {
    const canvas = document.getElementById('gameCanvas');
    window.player.x = canvas ? (canvas.width / 2 - 20) : 180;
    window.player.y = canvas ? (canvas.height - 120) : 480;
    window.player.speedZ = 0;
    window.player.dx = 0;
    
    const profile = window.playerProfile;
    const baseCar = window.carCatalog.find(c => c.id === profile.equippedCarId) || window.carCatalog[0];
    const up = (profile.upgrades && profile.upgrades[baseCar.id]) ? profile.upgrades[baseCar.id] : { speed: 0, handling: 0, accel: 0 };

    // Statistiche calcolate
    window.player.maxSpeedZ = baseCar.baseStats.maxSpeed * (1 + (up.speed * 0.05));
    window.player.speedX = baseCar.baseStats.handling * (1 + (up.handling * 0.05));
    window.player.accelRate = baseCar.baseStats.acceleration * (1 + (up.accel * 0.05));
    
    window.playerSprite.src = baseCar.imgGame;
}

function updatePlayer() {
    window.player.x += window.player.dx;
    
    if (window.player.isAccelerating) {
        window.player.speedZ += window.player.accelRate;
        if (window.player.speedZ > window.player.maxSpeedZ) window.player.speedZ = window.player.maxSpeedZ;
    } else {
        window.player.speedZ *= 0.98;
        if (window.player.speedZ < 0.1) window.player.speedZ = 0;
    }
}

function drawPlayer() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    if (window.playerSprite.complete) {
        ctx.drawImage(window.playerSprite, window.player.x - 8, window.player.y - 14, 56, 98);
    } else {
        ctx.fillStyle = 'orange';
        ctx.fillRect(window.player.x, window.player.y, window.player.width, window.player.height);
    }
}

function setupTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('touchstart', () => { window.player.isAccelerating = true; });
    canvas.addEventListener('touchend', () => { window.player.isAccelerating = false; });
}
