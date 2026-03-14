// --- IL CATALOGO DELLE AUTO ---
const carCatalog = [
    { 
        id: 1, name: "STREET RUNNER", price: 0, 
        stats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 },
        imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png"
    },
    { 
        id: 2, name: "NEON VIPER", price: 800, 
        stats: { handling: 6.0, acceleration: 0.05, maxSpeed: 17 },
        imgGarage: "img/cars/car_02_garage.png", imgGame: "img/cars/car_02_game.png"
    },
    { 
        id: 3, name: "VOID BEAST", price: 2500, 
        stats: { handling: 6.8, acceleration: 0.06, maxSpeed: 21 },
        imgGarage: "img/cars/car_03_garage.png", imgGame: "img/cars/car_03_game.png"
    }
];

// Caricamento del profilo (V3 per supportare il nuovo sistema auto)
let playerProfile = JSON.parse(localStorage.getItem('ryderzProfileV3')) || {
    banknotes: 0,
    unlockedCars: [1], 
    equippedCarId: 1
};

function saveProfile() {
    localStorage.setItem('ryderzProfileV3', JSON.stringify(playerProfile));
}

function addBanknotes(amount) {
    playerProfile.banknotes += amount;
    saveProfile();
}

let currentViewIndex = 0;

function initGarage() {
    currentViewIndex = carCatalog.findIndex(c => c.id === playerProfile.equippedCarId);
    if(currentViewIndex === -1) currentViewIndex = 0;
    updateGarageUI();
}

function changeCar(direction) {
    currentViewIndex += direction;
    if (currentViewIndex < 0) currentViewIndex = carCatalog.length - 1;
    if (currentViewIndex >= carCatalog.length) currentViewIndex = 0;
    updateGarageUI();
}

function updateGarageUI() {
    const car = carCatalog[currentViewIndex];
    const isUnlocked = playerProfile.unlockedCars.includes(car.id);
    const isEquipped = playerProfile.equippedCarId === car.id;

    // Aggiorna l'immagine e i testi
    const imgEl = document.getElementById('g-car-img');
    if (imgEl) imgEl.src = car.imgGarage;
    
    document.getElementById('g-car-name').innerText = car.name;
    document.getElementById('g-stat-speed').innerText = (car.stats.maxSpeed * 10) + " km/h";
    document.getElementById('g-stat-handling').innerText = car.stats.handling;

    const actionBtn = document.getElementById('g-action-btn');
    const statusText = document.getElementById('g-car-status');

    if (isEquipped) {
        statusText.innerText = "IN USO";
        statusText.style.color = "var(--neon-cyan)";
        actionBtn.style.display = "none";
    } else if (isUnlocked) {
        statusText.innerText = "SBLOCCATA";
        statusText.style.color = "white";
        actionBtn.style.display = "block";
        actionBtn.className = "play-btn secondary";
        actionBtn.innerText = "SELEZIONA";
        actionBtn.onclick = () => equipCar(car.id);
    } else {
        statusText.innerText = "IN VENDITA";
        statusText.style.color = "var(--text-muted)";
        actionBtn.style.display = "block";
        actionBtn.className = "play-btn success";
        actionBtn.innerHTML = `COMPRA 💵 ${car.price}`;
        actionBtn.onclick = () => buyCar(car.id, car.price);
    }
}

function equipCar(carId) {
    playerProfile.equippedCarId = carId;
    saveProfile();
    updateGarageUI();
}

function buyCar(carId, price) {
    if (playerProfile.banknotes >= price) {
        playerProfile.banknotes -= price;
        playerProfile.unlockedCars.push(carId);
        equipCar(carId);
        const moneyEl = document.getElementById('home-banknotes');
        if (moneyEl) moneyEl.innerText = playerProfile.banknotes;
    } else {
        alert("💵 Soldi insufficienti!");
    }
}
