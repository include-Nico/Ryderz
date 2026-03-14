let enemies = [];
const enemyImagesSrc = ['img/cars/enemy_01.png', 'img/cars/enemy_02.png'];
let enemySprites = enemyImagesSrc.map(s => {
    let img = new Image();
    img.src = s;
    return img;
});

function resetTraffic() {
    enemies = [];
}

function manageEnemies() {
    // 'frames' è dichiarata in game.js, visibile globalmente
    if (frames % 80 === 0 && !window.player.isStarting) {
        // 4 corsie nella larghezza del canvas (400px)
        const laneCount = 4;
        const laneW     = canvas.width / laneCount;
        const lane      = Math.floor(Math.random() * laneCount);
        enemies.push({
            x:      lane * laneW + (laneW / 2) - 20,
            y:      -100,
            width:  40,
            height: 70,
            speed:  Math.random() * 3 + 5,
            sprite: enemySprites[Math.floor(Math.random() * enemySprites.length)]
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        // Muovi nemico: se il player va veloce i nemici sembrano rallentare
        e.y += (window.player.speedZ > 0)
            ? (e.speed - window.player.speedZ * 0.6)
            : e.speed;

        // Disegno
        if (e.sprite.complete && e.sprite.naturalWidth > 0) {
            ctx.drawImage(e.sprite, e.x - 8, e.y - 14, 56, 98);
        } else {
            ctx.fillStyle = '#1E90FF';
            ctx.beginPath();
            ctx.roundRect(e.x, e.y, e.width, e.height, 6);
            ctx.fill();
        }

        // Collisione AABB con piccolo margine di tolleranza
        const margin = 8;
        const p = window.player;
        if (
            p.x + margin         < e.x + e.width  &&
            p.x + p.width - margin > e.x           &&
            p.y + margin         < e.y + e.height  &&
            p.y + p.height - margin > e.y
        ) {
            triggerGameOver();
            return;
        }

        // Rimuovi se fuori schermo
        if (e.y > canvas.height + 150 || e.y < -300) {
            enemies.splice(i, 1);
        }
    }
}
