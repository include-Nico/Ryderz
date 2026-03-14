// --- L'AUTO DEL GIOCATORE ---
const player = {
    x: 0, y: 0, width: 40, height: 70, // HITBOX TECNICA
    speedX: 0, dx: 0, speedZ: 0, maxSpeedZ: 0, minSpeedZ: 1, 
    accelRate: 0, isAccelerating: false, hasAcceleratedOnce: false, 
    shiftDelay: 0, isIgniting: true, isStarting: false 
};

let playerSprite = new Image();

function resetPlayer() {
    player.x = canvas.width - 45; 
    player.y = canvas.height - 120;
    player.dx = 0;
    player.isAccelerating = false;
    player.hasAcceleratedOnce = false; 
    player.shiftDelay = 0; 
    player.isIgniting = true; 
    player.isStarting = false;
    
    // 1. Recupera l'auto equipaggiata dal catalogo
    const profile = window.playerProfile;
    let baseCar = carCatalog.find(c => c.id === profile.equippedCarId) || carCatalog[0];
    
    // 2. Recupera i livelli di potenziamento (Officina)
    let upgrades = profile.upgrades[baseCar.id] || { speed: 0, handling: 0, accel: 0 };

    // 3. Calcola statistiche finali (Base + 5% bonus per ogni livello raggiunto)
    player.maxSpeedZ = baseCar.baseStats.maxSpeed * (1 + (upgrades.speed * 0.05));
    player.speedX = baseCar.baseStats.handling * (1 + (upgrades.handling * 0.05));
    player.accelRate = baseCar.baseStats.acceleration * (1 + (upgrades.accel * 0.05));
    
    // 4. Carica l'immagine corretta
    playerSprite.src = baseCar.imgGame;
    player.speedZ = 0;
    player.minSpeedZ = 1; 
}

// Gestione Input (Tastiera)
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

// Gestione Input (Touch Mobile)
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
        
        // Limiti laterali della strada
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

    // Animazione di immissione dall'Area SOS
    if (player.isStarting) {
        player.speedZ += 0.015;
        if (player.speedZ > 0.4) player.x -= 0.6; 
        if (player.speedZ >= 1.0 && player.x <= canvas.width - 100) {
            player.speedZ = 1.0;
            player.isStarting = false;
        }
        return;
    }

    // Movimento laterale
    player.x += player.dx;
    if (player.x < 10) player.x = 10;
    if (player.x + player.width > canvas.width - 10) player.x = canvas.width - player.width - 10;

    // Gestione accelerazione e cambio marcia
    if (player.shiftDelay > 0) {
        player.shiftDelay--;
    } else {
        if (player.isAccelerating) {
            player.hasAcceleratedOnce = true; 
            // Resistenza all'aria: l'accelerazione diminuisce avvicinandosi alla velocità massima
            let resistance = player.speedZ / (player.maxSpeedZ * 1.2);
            player.speedZ += player.accelRate * (1 - resistance); 
            if (player.speedZ > player.maxSpeedZ) player.speedZ = player.maxSpeedZ;
        } else {
            player.speedZ -= 0.1; // Attrito/Freno motore
            if (player.speedZ < player.minSpeedZ) player.speedZ = player.minSpeedZ;
        }
    }
}

function drawPlayer() {
    if (playerSprite.complete && playerSprite.naturalHeight !== 0) {
        // Disegno con dimensioni maggiorate (56x98) per coprire meglio la hitbox (40x70)
        let drawW = player.width + 16;
        let drawH = player.height + 28;
        ctx.drawImage(playerSprite, player.x - 8, player.y - 14, drawW, drawH);
    } else {
        // Rettangolo di backup (se l'immagine non carica)
        ctx.fillStyle = '#ff2a2a'; 
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Freccia lampeggiante durante l'immissione
    if (player.isStarting && typeof frames !== 'undefined' && Math.floor(frames / 8) % 2 === 0) {
        ctx.fillStyle = '#FF9800'; 
        ctx.fillRect(player.x - 2, player.y + 2, 8, 8);
        ctx.fillRect(player.x - 2, player.y + player.height - 10, 8, 8);
    }
}
