window.player = {
    x: 0, y: 0,
    width: 40, height: 70,
    speedX:   5,
    dx:       0,
    speedZ:   0,
    maxSpeedZ: 15,
    accelRate: 0.04,
    isAccelerating: false,
    isStarting: false
};

window.playerSprite = new Image();

function resetPlayer() {
    const canvas = document.getElementById('gameCanvas');

    window.player.x  = canvas ? (canvas.width  / 2 - 20) : 180;
    window.player.y  = canvas ? (canvas.height - 120)     : 480;
    window.player.speedZ = 0;
    window.player.dx     = 0;
    window.player.isAccelerating = false;
    window.player.isStarting     = false;

    // Sicurezza: ricarica profilo
    if (!window.playerProfile) {
        window.playerProfile = JSON.parse(localStorage.getItem('ryderzProfileV4'));
    }

    const profile = window.playerProfile;
    if (!profile) return;

    const baseCar = (window.carCatalog || []).find(c => c.id === profile.equippedCarId)
                    || (window.carCatalog || [])[0];
    if (!baseCar) return;

    const up = (profile.upgrades && profile.upgrades[baseCar.id])
               ? profile.upgrades[baseCar.id]
               : { speed: 0, handling: 0, accel: 0 };

    // Calcolo statistiche con bonus officina (5% per livello)
    window.player.maxSpeedZ  = baseCar.baseStats.maxSpeed     * (1 + up.speed    * 0.05);
    window.player.speedX     = baseCar.baseStats.handling     * (1 + up.handling * 0.05);
    window.player.accelRate  = baseCar.baseStats.acceleration * (1 + up.accel    * 0.05);

    window.playerSprite.src = baseCar.imgGame;
}

function updatePlayer() {
    // Movimento laterale
    window.player.x += window.player.dx;

    // Limiti pista (canvas 400px, bordi ~14px)
    const minX = 14;
    const maxX = (canvas ? canvas.width : 400) - 14 - window.player.width;
    if (window.player.x < minX) window.player.x = minX;
    if (window.player.x > maxX) window.player.x = maxX;

    // Accelerazione / Attrito
    if (window.player.isAccelerating) {
        window.player.speedZ += window.player.accelRate;
        if (window.player.speedZ > window.player.maxSpeedZ) {
            window.player.speedZ = window.player.maxSpeedZ;
        }
    } else {
        window.player.speedZ *= 0.95;
        if (window.player.speedZ < 0.01) window.player.speedZ = 0;
    }
}

function drawPlayer() {
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (window.playerSprite.complete && window.playerSprite.naturalWidth > 0) {
        context.drawImage(window.playerSprite,
            window.player.x - 8,
            window.player.y - 14,
            56, 98
        );
    } else {
        // Fallback grafico se lo sprite non è ancora caricato
        context.fillStyle = '#00F0FF';
        context.beginPath();
        context.roundRect(window.player.x, window.player.y,
                          window.player.width, window.player.height, 6);
        context.fill();
    }
}
