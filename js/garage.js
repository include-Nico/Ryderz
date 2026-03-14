window.carCatalog = [
    { id: 1, name: "Maggiolino Race", price: 0, baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 }, imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png" },
    { id: 2, name: "Ford Mustang", price: 18000, baseStats: { handling: 6.2, acceleration: 0.05, maxSpeed: 18 }, imgGarage: "img/cars/car_02_garage.png", imgGame: "img/cars/car_02_game.png" }
];

function getProfile() {
    let p = JSON.parse(localStorage.getItem('ryderzProfileV4'));
    if (!p) {
        p = { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(p));
    }
    return p;
}
window.playerProfile = getProfile();

function saveProfile() {
    localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
}

function addBanknotes(amt) {
    window.playerProfile.banknotes += amt;
    saveProfile();
}

let currentViewIndex = 0;

function initGarage() {
    window.playerProfile = getProfile();
    currentViewIndex = carCatalog.findIndex(c => c.id === window.playerProfile.equippedCarId);
    updateGarageUI();
}

function changeCar(dir) {
    currentViewIndex = (currentViewIndex + dir + carCatalog.length) % carCatalog.length;
    updateGarageUI();
}

function updateGarageUI() {
    const car = carCatalog[currentViewIndex];
    const profile = window.playerProfile;
    const isUnlocked = profile.unlockedCars.includes(car.id);
    
    document.getElementById('g-car-img').src = car.imgGarage;
    document.getElementById('g-car-name').innerText = car.name;
    document.getElementById('home-banknotes').innerText = profile.banknotes;

    if (isUnlocked) {
        document.getElementById('g-buy-section').style.display = 'none';
        document.getElementById('g-workshop-section').style.display = 'block';
        updateWorkshopUI(car);
    } else {
        document.getElementById('g-buy-section').style.display = 'block';
        document.getElementById('g-workshop-section').style.display = 'none';
        document.getElementById('g-buy-btn').innerText = `COMPRA 💵 ${car.price}`;
        document.getElementById('g-buy-btn').onclick = () => {
            if(profile.banknotes >= car.price) {
                profile.banknotes -= car.price;
                profile.unlockedCars.push(car.id);
                saveProfile(); updateGarageUI();
            }
        };
    }
}

function updateWorkshopUI(car) {
    if (!window.playerProfile.upgrades[car.id]) window.playerProfile.upgrades[car.id] = { speed: 0, handling: 0, accel: 0 };
    const up = window.playerProfile.upgrades[car.id];
    
    ['speed', 'handling', 'accel'].forEach(type => {
        let lvl = up[type];
        let cost = Math.floor(1000 * Math.pow(1.25, lvl));
        document.getElementById(`lvl-${type}`).innerText = `${lvl}/5`;
        document.getElementById(`bar-${type}`).style.width = (lvl * 20) + "%";
        let btn = document.getElementById(`btn-up-${type}`);
        if(lvl >= 5) btn.disabled = true;
        else {
            btn.onclick = () => {
                if(window.playerProfile.banknotes >= cost) {
                    window.playerProfile.banknotes -= cost;
                    window.playerProfile.upgrades[car.id][type]++;
                    saveProfile(); updateGarageUI();
                    const ws = document.getElementById('g-workshop-section');
                    ws.classList.remove('flash-upgrade'); void ws.offsetWidth; ws.classList.add('flash-upgrade');
                }
            };
        }
    });
}

function equipCar() {
    window.playerProfile.equippedCarId = carCatalog[currentViewIndex].id;
    saveProfile(); updateGarageUI();
}
