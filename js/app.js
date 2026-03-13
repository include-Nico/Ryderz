// Carica la Home all'avvio dell'app
window.onload = () => {
    loadScreen('home');
};

// Funzione che carica i file HTML esterni
async function loadScreen(screenName, clickedTab = null) {
    try {
        // 1. Va a pescare il file HTML
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        
        // 2. Lo inserisce nell'area dello schermo
        document.getElementById('screens-area').innerHTML = html;

        // 3. Gestisce i tab in basso
        if (clickedTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');
        }

        // 4. Logica speciale: se carichiamo il gioco, nascondiamo i tab e avviamo il motore
        const tabs = document.getElementById('bottom-tabs');
        if (screenName === 'game') {
            tabs.style.display = 'none';
            // Inizializza il canvas DOPO che è stato caricato nell'HTML
            initGame(); 
        } else {
            tabs.style.display = 'flex';
            // Ferma il gioco se torniamo al menu
            if (typeof stopEngine === "function") stopEngine(); 
        }

    } catch (error) {
        console.error("Errore nel caricamento della pagina:", error);
    }
}
