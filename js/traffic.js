// --- VARIABILI DEL TRAFFICO ---
let enemies = [];
let enemySpawnRate = 80; 
const enemyColors = ['#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0', '#FF9800'];
let liscioEffects = []; 

// Reset del traffico (chiamato da game.js)
function resetTraffic() {
    enemies = [];
    liscioEffects = [];
    enemySpawnRate = 80; 
}

// Aumenta la difficoltà nel tempo
function increaseDifficulty() {
    if (frames % 600 === 0 && enemySpawnRate > 30) {
        enemySpawnRate -= 5; 
    }
}

// Capisce se stiamo guidando in contromano
function isContromano() {
    return (player.x + player.width / 2) < (canvas.width / 2);
}

// Gestisce creazione e movimento nemici
function manageEnemies() {
    if (frames % enemySpawnRate === 0) {
        const lane = Math.floor(Math.random() * 4);
        const laneWidth = canvas.width / 4;
        const ex = (lane * laneWidth) + (laneWidth / 2) - (40 / 2);
        
        const isOncoming = lane < 2;
        const absSpeed = isOncoming ? (Math.random() * 4 + 6) : (Math.random() * 3 + 5); 
        const initialRelSpeed = isOncoming ? (player.speedZ + absSpeed) : (player.speedZ - absSpeed);
        
        const ey = initialRelSpeed > 0 ? -100 : canvas.height + 150;

        enemies.push({
            x: ex, y: ey, width: 40, height: 70, 
            absSpeed: absSpeed, isOncoming: isOncoming,
            color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
            passed: false 
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let relSpeed = e.isOncoming ? (player.speedZ + e.absSpeed) : (player.speedZ - e.absSpeed);
        e.y += relSpeed; 

        // Disegna nemico
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = '#111';
        ctx.fillRect(e.x + 5, e.y + (e.isOncoming ? 45 : 10), e.width - 10, 15); 
        ctx.fillRect(e.x + 5, e.y + (e.isOncoming ? 10 : 45), e.width - 10, 15);

        // Collisione
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            triggerGameOver();
        }

        // Calcolo sorpasso e LISCIO
        if (!e.passed && relSpeed > 0 && e.y > player.y + player.height) {
            e.passed = true;
            let multiplier = isContromano() ? 2 : 1;
            score += 10 * multiplier; 

            const centerPlayer = player.x + player.width / 2;
            const centerEnemy = e.x + e.width / 2;
            const distance = Math.abs(centerPlayer - centerEnemy);

            if (distance > 40 && distance < 65) {
                let liscioPoints = 50 * multiplier;
                score += liscioPoints; 
                liscioEffects.push({ x: player.x, y: player.y, alpha: 1.0, points: liscioPoints }); 
            }
            updateScoreDisplay();
        } 
        else if (!e.passed && relSpeed < 0 && e.y + e.height < player.y) {
            e.passed = true;
        }

        if ((relSpeed > 0 && e.y > canvas.height + 100) || (relSpeed < 0 && e.y < -150)) {
            enemies.splice(i, 1);
        }
    }
}

// Anima le scritte "LISCIO!"
function drawLiscioEffects() {
    for (let i = liscioEffects.length - 1; i >= 0; i--) {
        let effect = liscioEffects[i];
        ctx.fillStyle = effect.points >= 100 ? `rgba(255, 50, 50, ${effect.alpha})` : `rgba(255, 215, 0, ${effect.alpha})`; 
        ctx.font = "bold 22px Arial";
        ctx.fillText(`LISCIO! +${effect.points}`, effect.x - 30, effect.y - 20);
        
        effect.y -= 2; 
        effect.alpha -= 0.03; 
        
        if (effect.alpha <= 0) liscioEffects.splice(i, 1);
    }
}
