window.menuMusic = new Audio('audio/menu.mp3'); 
window.menuMusic.loop = true;
window.isAudioEnabled = false;

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    document.getElementById('global-audio-btn').innerText = window.isAudioEnabled ? '🔊' : '🔇';
    if (window.isAudioEnabled) {
        if (!document.getElementById('gameCanvas')) window.menuMusic.play().catch(e=>{});
    } else {
        window.menuMusic.pause();
        if (window.engineSound) window.engineSound.pause();
    }
}

async function loadScreen(name, btn = null) {
    const r = await fetch(`screens/${name}.html`);
    const h = await r.text();
    document.getElementById('screens-area').innerHTML = h;
    
    if(btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (name === 'game') {
        document.getElementById('bottom-tabs').style.display = 'none';
        window.menuMusic.pause();
        setTimeout(initGame, 100);
    } else {
        document.getElementById('bottom-tabs').style.display = 'flex';
        stopEngine();
        if (window.isAudioEnabled) window.menuMusic.play().catch(e=>{});
    }
}

window.onload = () => loadScreen('home');
