function manageEnemies() {
    if (frames % enemySpawnRate === 0) {
        const lane = Math.floor(Math.random() * 4);
        const isOncoming = lane < 2;
        const absSpeed = isOncoming ? (Math.random() * 4 + 6) : (Math.random() * 3 + 4); 
        
        // Se vai piano, le auto della tua corsia possono spawnare da dietro (Y alta)
        const relSpeed = isOncoming ? (player.speedZ + absSpeed) : (player.speedZ - absSpeed);
        const ey = relSpeed > 0 ? -100 : canvas.height + 50;

        enemies.push({
            x: (lane * (canvas.width / 4)) + 5, y: ey, width: 40, height: 70, 
            absSpeed: absSpeed, isOncoming: isOncoming, passed: false 
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let relSpeed = e.isOncoming ? (player.speedZ + e.absSpeed) : (player.speedZ - e.absSpeed);
        e.y += relSpeed; // MOVIMENTO RELATIVO

        // Disegno nemico
        ctx.fillStyle = e.isOncoming ? '#2196F3' : '#4CAF50';
        ctx.fillRect(e.x, e.y, e.width, e.height);

        // Se l'auto nemica ti supera "al contrario" (va verso l'alto), resettiamo 'passed'
        if (e.passed && e.y + e.height < player.y) {
            e.passed = false; 
        }

        // Collisione
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            triggerGameOver();
        }

        // Punteggio sorpasso
        if (!e.passed && relSpeed > 0 && e.y > player.y + player.height) {
            e.passed = true;
            score += isContromano() ? 20 : 10;
            updateScoreDisplay();
        }

        if (e.y > canvas.height + 200 || e.y < -200) enemies.splice(i, 1);
    }
}
