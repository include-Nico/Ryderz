window.menuMusic = new Audio('audio/menu.mp3'); window.menuMusic.loop = true;
window.isAudioEnabled = false;

function toggleAudio() {
    window.isAudioEnabled = !window.isAudioEnabled;
    const btn = document.getElementById('global-audio-btn');
    btn.innerHTML = window.isAudioEnabled ? '🔊' : '🔇';
    if (window.isAudioEnabled) {
        if (document.getElementById('screen-game')) {
            if (window.engineSound && !window.isPaused) window.engineSound.play().catch(e=>{});
        } else { window.menuMusic.play().catch(e=>{}); }
    } else {
        window.menuMusic.pause(); if (window.engineSound) window.engineSound.pause();
    }
}

async function loadScreen(screenName, clickedTab = null) {
    const resp = await fetch(`screens/${screenName}.html`);
    document.getElementById('screens-area').innerHTML = await resp.text();
    if (clickedTab) {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        clickedTab.classList.add('active');
    }
    if (screenName === 'game') {
        document.getElementById('bottom-tabs').style.display = 'none';
        window.menuMusic.pause();
        setTimeout(() => { if (typeof initGame === "function") initGame(); }, 150);
    } else {
        document.getElementById('bottom-tabs').style.display = 'flex';
        if (typeof stopEngine === "function") stopEngine();
        if (window.isAudioEnabled) window.menuMusic.play().catch(e=>{});
    }
}
window.onload = () => loadScreen('home');
