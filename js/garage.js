// --- IL CATALOGO DELLE AUTO ---
const carCatalog = [
    { 
        id: 1, name: "STREET RUNNER", price: 0, 
        baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 },
        imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png"
    },
    { 
        id: 2, name: "NEON VIPER", price: 800, 
        baseStats: { handling: 6.0, acceleration: 0.05, maxSpeed: 17 },
        imgGarage: "img/cars/car_02_garage.png", imgGame: "img/cars/car_02_game.png"
    },
    { 
        id: 3, name: "VOID BEAST", price: 2500, 
        baseStats: { handling: 6.8, acceleration: 0.06, maxSpeed: 21 },
        imgGarage: "img/cars/car_03_garage.png", imgGame: "img/cars/car_03_game.png"
    }
];

// Inizializzazione profilo V4 per supportare i livelli officina
function getProfile() {
    let profile = JSON.parse(localStorage.getItem('ryderzProfileV4'));
    if (!profile) {
        profile = {
            banknotes: 0,
            unlockedCars: [1], 
            equippedCarId: 1,
            upgrades: {} // Struttura: { carId: { speed: 0, handling: 0, accel: 0 } }
        };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(profile));
    }
    return profile;
}

window.playerProfile = getProfile();

function saveProfile() {
    localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
}

let currentViewIndex = 0;
const BASE_UPGRADE_COST = 1000;
const MAX_LEVEL = 5;

function initGarage() {
    window.playerProfile = getProfile();
    currentViewIndex = carCatalog.findIndex(c => c.id === window.playerProfile.equippedCarId);
    if(currentViewIndex === -1) currentViewIndex = 0;
    updateGarageUI();
}

function changeCar(direction) {
    currentViewIndex += direction;
    if (currentViewIndex < 0) currentViewIndex = carCatalog.length - 1;
    if (currentViewIndex >= carCatalog.length) currentViewIndex = 0;
    updateGarageUI();
}

function getUpgradeInfo(carId, type) {
    if (!window.playerProfile.upgrades[carId]) {
        window.playerProfile.upgrades[carId] = { speed: 0, handling: 0, accel: 0 };
    }
    const level = window.playerProfile.upgrades[carId][type];
    const cost = Math.floor(BASE_UPGRADE_COST * Math.pow(1.25, level));
    return { level, cost };
}

function updateGarageUI() {
    const car = carCatalog[currentViewIndex];
    const profile = window.playerProfile;
    const isUnlocked = profile.unlockedCars.includes(car.id);
    const isEquipped = profile.equippedCarId === car.id;

    document.getElementById('g-car-img').src = car.imgGarage;
    document.getElementById('g-car-name').innerText = car.name;
    document.getElementById('home-banknotes').innerText = profile.banknotes;

    // Gestione sezioni (Acquisto vs Officina)
    const buySection = document.getElementById('g-buy-section');
    const workshopSection = document.getElementById('g-workshop-section');
    const statusText = document.getElementById('g-car-status');

    if (isUnlocked) {
        buySection.style.display = "none";
        workshopSection.style.display = "block";
        statusText.innerText = isEquipped ? "IN USO" : "SBLOCCATA";
        statusText.style.color = isEquipped ? "var(--neon-cyan)" : "white";
        
        // Aggiorna statistiche e bottoni Officina
        updateWorkshopUI(car);
    } else {
        buySection.style.display = "block";
        workshopSection.style.display = "none";
        statusText.innerText = "NON ACQUISTATA";
        statusText.style.color = "var(--text-muted)";
        document.getElementById('g-buy-btn').innerHTML = `ACQUISTA 💵 ${car.price}`;
        document.getElementById('g-buy-btn').onclick = () => buyCar(car.id, car.price);
    }
}

function updateWorkshopUI(car) {
    const types = ['speed', 'handling', 'accel'];
    types.forEach(type => {
        const info = getUpgradeInfo(car.id, type);
        const btn = document.getElementById(`btn-up-${type}`);
        const levelText = document.getElementById(`lvl-${type}`);
        
        levelText.innerText = `Lvl ${info.level}/${MAX_LEVEL}`;
        
        if (info.level >= MAX_LEVEL) {
            btn.innerText = "MAX";
            btn.disabled = true;
            btn.style.opacity = "0.5";
        } else {
            btn.innerText = `UP 💵 ${info.cost}`;
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.onclick = () => applyUpgrade(car.id, type, info.cost);
        }
    });

    const equipBtn = document.getElementById('g-equip-btn');
    equipBtn.style.display = (window.playerProfile.equippedCarId === car.id) ? "none" : "block";
}

function applyUpgrade(carId, type, cost) {
    if (window.playerProfile.banknotes >= cost) {
        window.playerProfile.banknotes -= cost;
        window.playerProfile.upgrades[carId][type]++;
        saveProfile();
        updateGarageUI();
    } else {
        alert("💵 Banconote insufficienti!");
    }
}

function buyCar(carId, price) {
    if (window.playerProfile.banknotes >= price) {
        window.playerProfile.banknotes -= price;
        window.playerProfile.unlockedCars.push(carId);
        saveProfile();
        updateGarageUI();
    } else {
        alert("💵 Soldi insufficienti!");
    }
}

function equipCar() {
    const car = carCatalog[currentViewIndex];
    window.playerProfile.equippedCarId = car.id;
    saveProfile();
    updateGarageUI();
}
