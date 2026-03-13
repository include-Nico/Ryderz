// Carica i dati salvati nel browser, oppure crea un profilo base per i nuovi giocatori
let playerProfile = JSON.parse(localStorage.getItem('ryderzProfile')) || {
    banknotes: 0,
    stats: {
        handling: 6,        // Sterzata
        acceleration: 0.2,  // Accelerazione
        maxSpeed: 18        // Velocità Massima
    }
};

// Funzione per salvare le modifiche
function saveProfile() {
    localStorage.setItem('ryderzProfile', JSON.stringify(playerProfile));
}

// Funzione per aggiungere soldi a fine partita
function addBanknotes(amount) {
    playerProfile.banknotes += amount;
    saveProfile();
}
