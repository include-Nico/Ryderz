// Carica la Home all'avvio
window.onload = () => { loadScreen('home'); };

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
}

async function loadScreen(screenName, clickedTab = null) {
    try {
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        document.getElementById('screens-area').innerHTML = html;

        if (screenName === 'home') {
            const instructionsElement = document.getElementById('instructions-text');
            if (instructionsElement) {
                if (isTouchDevice()) {
                    instructionsElement.innerHTML = "📱 <b>Mobile:</b> Tieni premuto per accelerare e trascina per sterzare.";
                } else {
                    instructionsElement.innerHTML = "💻 <b>PC:</b> Tieni premuto <b>W</b> (o Su) per accelerare. Usa <b>A</b> e <b>D</b> per sterzare.";
                }
            }
        }

        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        const tabs = document.getElementById('bottom-tabs');
        if (screenName === 'game') {
            tabs.style.display = 'none';
            initGame(); 
        } else {
            tabs.style.display = 'flex';
            if (typeof stopEngine === "function") stopEngine(); 
        }
    } catch (e) { console.error("Errore:", e); }
}
