// Usiamo "V3" per resettare il salvataggio e forzare i nuovi parametri più lenti
let playerProfile = JSON.parse(localStorage.getItem('ryderzProfileV3')) || {
    banknotes: 0,
    stats: {
        handling: 5.5,      // Sterzata
        acceleration: 0.025, // DIMEZZATA: era 0.05, ora l'auto accelera in modo molto più graduale
        maxSpeed: 13        // Corrisponde a 130 km/h
    }
};

function saveProfile() {
    localStorage.setItem('ryderzProfileV3', JSON.stringify(playerProfile));
}

function addBanknotes(amount) {
    playerProfile.banknotes += amount;
    saveProfile();
}
