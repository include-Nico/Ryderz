window.enemies = [];
const enemyFiles = ['img/cars/enemy_01.png', 'img/cars/enemy_02.png', 'img/cars/enemy_03.png'];
window.enemySprites = enemyFiles.map(src => {
    let img = new Image(); img.src = src; return img;
});

function resetTraffic() { window.enemies = []; }

function manageEnemies() {
    // Spawn casuale
    if (frames % 100 === 0) {
        const lane = Math.floor(Math.random() * 4);
        const isOncoming = lane < 2;
        const speed = isOncoming ? (Math.random() * 2 + 7) : (Math.random() * 2 + 4);
        
        window.enemies.push({
            x: lane * (canvas.width / 4) + 15,
            y: isOncoming ? -150 : canvas.height + 150,
            width: 40, height: 70,
            speed: speed,
            isOncoming: isOncoming,
            sprite: enemySprites[Math.floor(Math.random() * enemySprites.length)]
        });
    }

    const ctx = canvas.getContext('2d');

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let relSpeed = e.isOncoming ? (player.speedZ + e.speed) : (e.speed - player.speedZ);
        e.y += relSpeed;

        // Disegno nemico (ruotato se contromano)
        ctx.save();
        if (e.isOncoming) {
            ctx.translate(e.x + 20, e.y + 35);
            ctx.rotate(Math.PI);
            ctx.drawImage(e.sprite, -28, -49, 56, 98);
        } else {
            ctx.drawImage(e.sprite, e.x - 8, e.y - 14, 56, 98);
        }
        ctx.restore();

        // Collisione
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            if (!player.isStarting) triggerGameOver();
        }

        // Rimuovi se fuori schermo
        if (e.y > canvas.height + 200 || e.y < -200) enemies.splice(i, 1);
    }
}
