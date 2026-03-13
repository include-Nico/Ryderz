// Usiamo "V2" per forzare il gioco a caricare queste nuove statistiche abbassate
let playerProfile = JSON.parse(localStorage.getItem('ryderzProfileV2')) || {
    banknotes: 0,
    stats: {
        handling: 5.5,      // Sterzata leggermente più rigida
        acceleration: 0.05, // Molto più lenta (prima era 0.2)
        maxSpeed: 13        // Corrisponde a 130 km/h (prima era 18)
    }
};

function saveProfile() {
    localStorage.setItem('ryderzProfileV2', JSON.stringify(playerProfile));
}

function addBanknotes(amount) {
    playerProfile.banknotes += amount;
    saveProfile();
}
