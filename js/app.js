// --- GESTIONE AUDIO MENU ---
let menuMusic = new Audio('audio/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.4; 

window.onload = () => {
    loadScreen('home');
};

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
}

async function loadScreen(screenName, clickedTab = null) {
    try {
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        document.getElementById('screens-area').innerHTML = html;

        if (screenName === 'home') {
            const moneyEl = document.getElementById('home-banknotes');
            if (moneyEl) moneyEl.innerText = playerProfile.banknotes;
            
            const instructionsElement = document.getElementById('instructions-text');
            if (instructionsElement) {
                if (isTouchDevice()) instructionsElement.innerHTML = "📱 <b>Mobile:</b> Tieni premuto per accelerare e trascina per sterzare.";
                else instructionsElement.innerHTML = "💻 <b>PC:</b> Tieni premuto <b>W</b> (o Su) per accelerare. Usa <b>A</b> e <b>D</b> per sterzare.";
            }
        }

        if (screenName === 'result') {
            document.getElementById('result-score').innerText = window.lastScore || 0;
            document.getElementById('result-cash').innerText = window.lastCash || 0;
        }

        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        const tabs = document.getElementById('bottom-tabs');
        
        // --- LOGICA AUDIO: Stop musica menu se si gioca ---
        if (screenName === 'game' || screenName === 'result') {
            tabs.style.display = 'none';
            menuMusic.pause(); 
            if (screenName === 'game') initGame(); 
        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
            // La musica riparte al primo click dell'utente
            menuMusic.play().catch(e => console.log("Audio in attesa di interazione"));
        }
    } catch (error) { console.error("Errore:", error); }
}
