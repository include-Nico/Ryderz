// --- VARIABILI GLOBALI ---
let canvas, ctx, frames = 0, gameLoopId, score = 0, isGameOver = false, isPaused = false, roadOffset = 0, totalDistance = 0, touchInitialized = false, currentGear = 1, pitchDrop = 0; 

// --- AUDIO ---
const ignitionSound = new Audio('audio/ignition.mp3');
ignitionSound.volume = 1.0;

const engineSound = new Audio('audio/engine.wav'); // Consigliato .wav o .ogg per loop
engineSound.loop = true;
engineSound.volume = 0.5;
engineSound.preservesPitch = false; 

const crashSound = new Audio('audio/crash.mp3');
crashSound.volume = 1.0;

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    frames = 0; score = 0; roadOffset = 0; totalDistance = 0; currentGear = 1; pitchDrop = 0; isGameOver = false; isPaused = false; 
    
    resetPlayer();  
    resetTraffic(); 
    if (!touchInitialized) { setupTouchControls(); touchInitialized = true; }

    // --- SEQUENZA ACCENSIONE ---
    ignitionSound.currentTime = 0;
    ignitionSound.play().catch(e => console.log("Audio bloccato"));

    // Quando finisce il suono dell'accensione, la macchina inizia a muoversi
    ignitionSound.onended = () => {
        player.isIgniting = false;
        player.isStarting = true; // Inizia l'animazione da 0 a 10 km/h
        engineSound.play();
    };

    startEngine();
}

function runGameLoop() {
    if (isGameOver || isPaused) return; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();       
    increaseDifficulty(); 
    drawRoad();           
    manageEnemies();      
    drawPlayer();         
    drawLiscioEffects();  
    
    if (isContromano() && !player.isStarting && !player.isIgniting) {
        let alpha = 0.7 + Math.sin(frames * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ CONTROMANO: PUNTI X2 ⚠️", canvas.width / 2, 70);
        ctx.textAlign = "left"; 
    }

    updateScore();        
    totalDistance += player.speedZ; 

    // Pitch motore
    if (pitchDrop > 0) { pitchDrop -= 0.03; if (pitchDrop < 0) pitchDrop = 0; }
    let pitch = 0.8 + (player.speedZ / playerProfile.stats.maxSpeed) * 1.5 - pitchDrop;
    engineSound.playbackRate = Math.max(0.5, Math.min(pitch, 2.5));

    frames++;
    gameLoopId = requestAnimationFrame(runGameLoop);
}

function drawRoad() {
    // Asfalto principale
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    roadOffset = (roadOffset + player.speedZ) % 40; 
    
    // Spartitraffico centrale
    ctx.fillStyle = '#FFEB3B'; 
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 3, i + roadOffset, 2, 20);
        ctx.fillRect(canvas.width / 2 + 1, i + roadOffset, 2, 20);
    }
    
    // Linee corsie
    ctx.fillStyle = 'white';
    for (let i = -40; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 4 - 2, i + roadOffset, 4, 20); 
        ctx.fillRect((canvas.width / 4) * 3 - 2, i + roadOffset, 4, 20); 
    }

    // --- DISEGNO AREA SOS (FUORI DALLA STRADA) ---
    // Appare solo all'inizio
    if (totalDistance < canvas.height + 1000) {
        let sostaY = (canvas.height - 300) + totalDistance; 
        
        // Erba/Ghiaia esterna
        ctx.fillStyle = '#222'; 
        ctx.fillRect(canvas.width - 50, sostaY, 50, 900);
        
        // Linea bianca continua che delimita la strada (interrotta nella sosta)
        ctx.fillStyle = 'white';
        ctx.fillRect(canvas.width - 52, 0, 2, canvas.height); // Linea fissa
        
        // Copre la linea bianca dove c'è la piazzola per farla sembrare un'entrata
        ctx.fillStyle = '#444';
        ctx.fillRect(canvas.width - 52, sostaY + 100, 2, 700);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; 
        ctx.font = "bold 20px Arial";
        ctx.fillText("AREA SOS", canvas.width - 48, sostaY + 300);
    } else {
        // Linea bianca laterale fissa quando la sosta è passata
        ctx.fillStyle = 'white';
        ctx.fillRect(canvas.width - 5, 0, 5, canvas.height);
        ctx.fillRect(0, 0, 5, canvas.height);
    }
}

// Altre funzioni rimangono identiche (updateScore, triggerGameOver, etc.)
function updateScore() {
    if (frames % 10 === 0 && !player.isStarting && !player.isIgniting && player.speedZ >= 3) {
        let basePoints = Math.floor(player.speedZ / 3);
        score += isContromano() ? (basePoints * 2) : basePoints;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = `Punti: ${score}`;
    const speedElement = document.getElementById('speedometer');
    if (speedElement) speedElement.innerText = `${Math.floor(player.speedZ * 10)} km/h`;
    
    let visualSpeed = Math.floor(player.speedZ * 10);
    let newGear = 1;
    if (visualSpeed > 100) newGear = 5;
    else if (visualSpeed > 75) newGear = 4;
    else if (visualSpeed > 50) newGear = 3;
    else if (visualSpeed > 35) newGear = 2;

    if (newGear > currentGear) {
        player.shiftDelay = 15; 
        pitchDrop = 0.6; 
    }
    currentGear = newGear;
    const gearElement = document.getElementById('gear-display');
    if (gearElement) gearElement.innerText = `Marcia: ${currentGear}`;
}

function togglePause() {
    if (isGameOver || player.isStarting || player.isIgniting) return;
    isPaused = !isPaused;
    const pm = document.getElementById('pause-menu');
    if (isPaused) { pm.style.display = 'flex'; engineSound.pause(); }
    else { pm.style.display = 'none'; engineSound.play(); runGameLoop(); }
}

function triggerGameOver() {
    isGameOver = true;
    engineSound.pause(); 
    crashSound.currentTime = 0;
    crashSound.play().catch(e => {});
    stopEngine();
    addBanknotes(Math.floor(score / 5)); 
    window.lastScore = score; window.lastCash = Math.floor(score / 5);
    setTimeout(() => { loadScreen('result'); }, 800);
}

function startEngine() { runGameLoop(); }
function stopEngine() { cancelAnimationFrame(gameLoopId); engineSound.pause(); }
