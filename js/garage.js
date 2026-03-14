const carCatalog = [
    { id: 1, name: "STREET RUNNER", price: 0, baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 }, imgGarage: "img/cars/car_01_garage.png", imgGame: "img/cars/car_01_game.png" }
];

function getProfile() {
    let p = JSON.parse(localStorage.getItem('ryderzProfileV4')) || { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
    return p;
}
window.playerProfile = getProfile();

function updateWorkshopUI(car) {
    ['speed', 'handling', 'accel'].forEach(type => {
        if (!window.playerProfile.upgrades[car.id]) window.playerProfile.upgrades[car.id] = { speed: 0, handling: 0, accel: 0 };
        let lvl = window.playerProfile.upgrades[car.id][type];
        let cost = Math.floor(1000 * Math.pow(1.25, lvl));
        document.getElementById(`lvl-${type}`).innerText = `${lvl}/5`;
        document.getElementById(`bar-${type}`).style.width = (lvl * 20) + "%";
        let btn = document.getElementById(`btn-up-${type}`);
        if (lvl >= 5) { btn.innerText = "MAX"; btn.disabled = true; }
        else { btn.innerText = `UP 💵 ${cost}`; btn.onclick = () => applyUpgrade(car.id, type, cost); }
    });
}

function applyUpgrade(carId, type, cost) {
    if (window.playerProfile.banknotes >= cost) {
        window.playerProfile.banknotes -= cost;
        window.playerProfile.upgrades[carId][type]++;
        localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
        const workshop = document.getElementById('g-workshop-section');
        workshop.classList.remove('flash-upgrade'); void workshop.offsetWidth; workshop.classList.add('flash-upgrade');
        updateGarageUI();
    }
}
