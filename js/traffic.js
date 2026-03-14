// --- VARIABILI DEL TRAFFICO ---
let enemies = [];
let enemySpawnRate = 80; 
let liscioEffects = []; 

// Metti qui i nomi delle tue immagini dei nemici
const enemyImagesSrc = [
    'img/cars/enemy_01.png', 
    'img/cars/enemy_02.png', 
    'img/cars/enemy_03.png'
];

// Pre-carichiamo le immagini in memoria
const enemySprites = enemyImagesSrc.map(src => {
    let img = new Image();
    img.src = src;
    return img;
});

// Colori di backup se l'immagine non carica
const enemyColors = ['#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0', '#FF9800'];

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
    if (frames % enemySpawnRate === 0 && !player.isStarting) {
        const lane = Math.floor(Math.random() * 4); 
        const laneWidth = canvas.width / 4;
        const isOncoming = lane < 2; 
        const absSpeed = isOncoming ? (Math.random() * 4 + 6) : (Math.random() * 3 + 4); 
        const relSpeed = isOncoming ? (player.speedZ + absSpeed) : (player.speedZ - absSpeed);
        
        if (!player.hasAcceleratedOnce && relSpeed < 0) return;

        const ey = relSpeed > 0 ? -100 : canvas.height + 150;

        let canSpawn = true;
        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j].lane === lane && Math.abs(enemies[j].y - ey) < 180) {
                canSpawn = false;
                break;
            }
        }

        if (canSpawn) {
            // Assegna uno sprite casuale
            let randomSprite = enemySprites[Math.floor(Math.random() * enemySprites.length)];
            let randomColor = enemyColors[Math.floor(Math.random() * enemyColors.length)];

            enemies.push({
                x: (lane * laneWidth) + (laneWidth / 2) - 20, 
                y: ey, 
                width: 40, height: 70, 
                absSpeed: absSpeed, isOncoming: isOncoming, lane: lane,
                sprite: randomSprite,
                colorBackup: randomColor,
                passed: false,
                isChanging: false, targetX: 0, 
                indicator: null, indicatorTimer: 0,
                isBastard: (score > 1000 && Math.random() < 0.15) 
            });
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        
        // Evitamento incidenti tra nemici
        for (let j = 0; j < enemies.length; j++) {
            if (i === j) continue;
            let other = enemies[j];
            if (e.lane === other.lane && e.isOncoming === other.isOncoming && !e.isChanging && !other.isChanging) {
                if (!e.isOncoming) {
                    let distance = e.y - other.y;
                    if (distance > 0 && distance < 140) {
                        if (distance < 80) e.absSpeed = Math.max(1, other.absSpeed - 0.5); 
                        else if (e.absSpeed > other.absSpeed) e.absSpeed = other.absSpeed;
                    }
                } else {
                    let distance = other.y - e.y;
                    if (distance > 0 && distance < 140) {
                        if (distance < 80) e.absSpeed = Math.max(1, other.absSpeed - 0.5);
                        else if (e.absSpeed > other.absSpeed) e.absSpeed = other.absSpeed;
                    }
                }
            }
        }

        // Evitamento incidenti con giocatore
        if (!e.isOncoming && !e.isChanging) {
            if (Math.abs((e.x + e.width/2) - (player.x + player.width/2)) < 35) {
                let distanceToPlayer = e.y - (player.y + player.height);
                if (distanceToPlayer > 0 && distanceToPlayer < 120 && e.absSpeed > player.speedZ) {
                    e.absSpeed = player.speedZ; 
                }
            }
        }

        let relSpeed = e.isOncoming ? (player.speedZ + e.absSpeed) : (player.speedZ - e.absSpeed);
        e.y += relSpeed; 

        // Cambio corsia
        if (!e.isChanging && !e.isOncoming && Math.random() < 0.005) {
            let nextLane = e.lane + (Math.random() < 0.5 ? -1 : 1);
            if (nextLane >= 2 && nextLane <= 3) {
                let canChange = true;
                for (let j = 0; j < enemies.length; j++) {
                    if (i === j) continue;
                    let other = enemies[j];
                    if (other.lane === nextLane && Math.abs(e.y - other.y) < 160) {
                        canChange = false;
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
            if (e.indicatorTimer > 0) e.indicatorTimer--; 
            else {
                let diff = e.targetX - e.x;
                e.x += diff * 0.08; 
                if (Math.abs(diff) < 2) {
                    e.x = e.targetX;
                    e.isChanging = false;
                    e.indicator = null;
                }
            }
        }

        // DISEGNO AUTO NEMICA (Immagine se caricata, altrimenti colore backup)
        if (e.sprite && e.sprite.complete && e.sprite.naturalHeight !== 0) {
            // Se l'auto viene in senso opposto, potremmo ruotarla, ma per semplicità assumiamo 
            // che hai sprites orientati bene o che si girino col ctx
            if (e.isOncoming) {
                ctx.save();
                ctx.translate(e.x + e.width/2, e.y + e.height/2);
                ctx.rotate(Math.PI); // Gira l'immagine di 180 gradi
                ctx.drawImage(e.sprite, -e.width/2, -e.height/2, e.width, e.height);
                ctx.restore();
            } else {
                ctx.drawImage(e.sprite, e.x, e.y, e.width, e.height);
            }
        } else {
            // Backup grafico se l'immagine manca
            ctx.fillStyle = e.colorBackup;
            ctx.fillRect(e.x, e.y, e.width, e.height);
            ctx.fillStyle = '#111';
            ctx.fillRect(e.x + 5, e.y + (e.isOncoming ? 45 : 10), e.width - 10, 15); 
            ctx.fillRect(e.x + 5, e.y + (e.isOncoming ? 10 : 45), e.width - 10, 15);
        }
        
        // Frecce direzionali dei nemici
        if (e.indicator && !e.isBastard && Math.floor(frames / 8) % 2 === 0) {
            ctx.fillStyle = '#FF9800'; 
            let fx = e.indicator === 'left' ? e.x - 2 : e.x + e.width - 6;
            ctx.fillRect(fx, e.y + (e.isOncoming ? 0 : e.height - 8), 8, 8);
        }

        if (!player.isStarting) {
            if (player.x < e.x + e.width && player.x + player.width > e.x &&
                player.y < e.y + e.height && player.y + player.height > e.y) {
                triggerGameOver(); 
            }
        }

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
