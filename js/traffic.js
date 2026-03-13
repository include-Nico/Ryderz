// --- VARIABILI DEL TRAFFICO ---
let enemies = [];
let enemySpawnRate = 80; 
const enemyColors = ['#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0', '#FF9800'];
let liscioEffects = []; 

function resetTraffic() {
    enemies = [];
    liscioEffects = [];
    enemySpawnRate = 80; 
}

function increaseDifficulty() {
    if (frames % 600 === 0 && enemySpawnRate > 30) {
        enemySpawnRate -= 5; 
    }
}

function isContromano() {
    return (player.x + player.width / 2) < (canvas.width / 2);
}

function manageEnemies() {
    // 1. GENERAZIONE (Spawn)
    if (frames % enemySpawnRate === 0) {
        const lane = Math.floor(Math.random() * 4); 
        const laneWidth = canvas.width / 4;
        const isOncoming = lane < 2; 
        const absSpeed = isOncoming ? (Math.random() * 4 + 6) : (Math.random() * 3 + 4); 
        const relSpeed = isOncoming ? (player.speedZ + absSpeed) : (player.speedZ - absSpeed);
        
        // Blocca auto da dietro all'inizio del gioco
        if (!player.hasAcceleratedOnce && relSpeed < 0) {
            return;
        }

        const ey = relSpeed > 0 ? -100 : canvas.height + 150;

        enemies.push({
            x: (lane * laneWidth) + (laneWidth / 2) - 20, 
            y: ey, 
            width: 40, height: 70, 
            absSpeed: absSpeed, isOncoming: isOncoming, lane: lane,
            color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
            passed: false,
            isChanging: false, targetX: 0, 
            indicator: null, indicatorTimer: 0,
            isBastard: (score > 1000 && Math.random() < 0.15) 
        });
    }

    // 2. LOGICA E MOVIMENTO
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        
        // --- EVITAMENTO INCIDENTI TRA NEMICI ---
        // Controlla tutte le altre auto in strada
        for (let j = 0; j < enemies.length; j++) {
            if (i === j) continue;
            let other = enemies[j];
            
            // Se sono nella stessa corsia e direzione e non stanno cambiando corsia
            if (e.lane === other.lane && e.isOncoming === other.isOncoming && !e.isChanging && !other.isChanging) {
                if (!e.isOncoming) {
                    // Auto nello stesso senso: 'e' è dietro a 'other' se la sua Y è maggiore
                    let distance = e.y - (other.y + other.height);
                    if (distance > 0 && distance < 100 && e.absSpeed > other.absSpeed) {
                        e.absSpeed = other.absSpeed; // Rallenta alla velocità dell'auto davanti!
                    }
                } else {
                    // Auto contromano: 'e' è dietro a 'other' se la sua Y è minore
                    let distance = other.y - (e.y + e.height);
                    if (distance > 0 && distance < 100 && e.absSpeed > other.absSpeed) {
                        e.absSpeed = other.absSpeed; // Rallenta!
                    }
                }
            }
        }

        // Calcola movimento a schermo
        let relSpeed = e.isOncoming ? (player.speedZ + e.absSpeed) : (player.speedZ - e.absSpeed);
        e.y += relSpeed; 

        // --- LOGICA CAMBIO CORSIA INTELLIGENTE ---
        if (!e.isChanging && !e.isOncoming && Math.random() < 0.005) {
            let nextLane = e.lane + (Math.random() < 0.5 ? -1 : 1);
            if (nextLane >= 2 && nextLane <= 3) {
                
                // Controlla che la corsia di destinazione sia libera prima di girare
                let canChange = true;
                for (let j = 0; j < enemies.length; j++) {
                    if (i === j) continue;
                    let other = enemies[j];
                    if (other.lane === nextLane && Math.abs(e.y - other.y) < 120) {
                        canChange = false; // Spazio occupato, non gira
                        break;
                    }
                }

                if (canChange) {
                    e.isChanging = true;
                    e.targetX = (nextLane * (canvas.width / 4)) + (canvas.width / 8) - 20;
                    e.indicator = nextLane > e.lane ? 'right' : 'left';
                    e.indicatorTimer = 50; 
                    e.lane = nextLane;
                }
            }
        }

        if (e.isChanging) {
            if (e.indicatorTimer > 0) {
                e.indicatorTimer--; 
            } else {
                let diff = e.targetX - e.x;
                e.x += diff * 0.08; 
                if (Math.abs(diff) < 2) {
                    e.x = e.targetX;
                    e.isChanging = false;
                    e.indicator = null;
                }
            }
        }

        // --- DISEGNO AUTO E FRECCE ---
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        
        // Freccia Arancione Lampeggiante molto visibile
        if (e.indicator && !e.isBastard && Math.floor(frames / 8) % 2 === 0) {
            ctx.fillStyle = '#FF9800'; 
            let fx = e.indicator === 'left' ? e.x - 2 : e.x + e.width - 6;
            ctx.fillRect(fx, e.y + (e.isOncoming ? 0 : e.height - 8), 8, 8);
        }

        ctx.fillStyle = '#111';
        ctx.fillRect(e.x + 5, e.y + (e.isOncoming ? 45 : 10), e.width - 10, 15); 
        ctx.fillRect(e.x + 5, e.y + (e.isOncoming ? 10 : 45), e.width - 10, 15);

        // --- COLLISIONE (Game Over) ---
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            triggerGameOver(); 
        }

        // --- SORPASSO E LISCIO ---
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

        if ((relSpeed > 0 && e.y > canvas.height + 150) || (relSpeed < 0 && e.y < -150)) {
            enemies.splice(i, 1);
        }
    }
}

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
