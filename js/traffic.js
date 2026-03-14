let enemies = [];
const enemyImagesSrc = ['img/cars/enemy_01.png', 'img/cars/enemy_02.png'];
let enemySprites = enemyImagesSrc.map(s => { let i = new Image(); i.src = s; return i; });

function resetTraffic() { enemies = []; }

function manageEnemies() {
    if (frames % 80 === 0 && !player.isStarting) {
        let lane = Math.floor(Math.random() * 4);
        enemies.push({
            x: lane * (canvas.width/4) + 10,
            y: -100,
            width: 40, height: 70,
            speed: Math.random() * 3 + 5,
            sprite: enemySprites[Math.floor(Math.random() * enemySprites.length)]
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += (player.speedZ > 0) ? (e.speed - player.speedZ) : e.speed;
        
        // Disegno
        if(e.sprite.complete) ctx.drawImage(e.sprite, e.x-8, e.y-14, 56, 98);
        else { ctx.fillStyle='blue'; ctx.fillRect(e.x, e.y, e.width, e.height); }

        // Collisione
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            triggerGameOver();
        }

        if (e.y > canvas.height + 100 || e.y < -200) enemies.splice(i, 1);
    }
}

function drawLiscioEffects() {}
