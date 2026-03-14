// Usiamo "V2" per forzare il gioco a caricare queste nuove statistiche
let playerProfile = JSON.parse(localStorage.getItem('ryderzProfileV2')) || {
    banknotes: 0,
    stats: {
        handling: 5.5,      
        acceleration: 0.04, // Accelerazione base ridotta (era 0.05)
        maxSpeed: 15        // Corrisponde a 150 km/h potenziali (era 13)
    }
};

function saveProfile() {
    localStorage.setItem('ryderzProfileV2', JSON.stringify(playerProfile));
}

function addBanknotes(amount) {
    playerProfile.banknotes += amount;
    saveProfile();
}
