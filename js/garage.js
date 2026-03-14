function initGarage() {
    window.playerProfile = JSON.parse(localStorage.getItem('ryderzProfileV4'));
    updateGarageUI();
}

function updateGarageUI() {
    const profile = window.playerProfile;
    const car = window.carCatalog[currentViewIndex || 0];
    const isUnlocked = profile.unlockedCars.includes(car.id);
    const isEquipped = profile.equippedCarId === car.id;

    document.getElementById('g-car-img').src = car.imgGarage;
    document.getElementById('g-car-name').innerText = car.name;
    document.getElementById('home-banknotes').innerText = profile.banknotes;

    const workshop = document.getElementById('g-workshop-section');
    const buySec = document.getElementById('g-buy-section');

    if (isUnlocked) {
        buySec.style.display = "none";
        workshop.style.display = "block";
        document.getElementById('g-car-status').innerText = isEquipped ? "EQUIPAGGIATA" : "POSSEDUTA";
        updateWorkshopStats(car);
    } else {
        buySec.style.display = "block";
        workshop.style.display = "none";
        document.getElementById('g-buy-btn').innerText = `COMPRA 💵 ${car.price}`;
    }
}

function updateWorkshopStats(car) {
    const up = window.playerProfile.upgrades[car.id] || { speed: 0, handling: 0, accel: 0 };
    const stats = ['speed', 'handling', 'accel'];

    stats.forEach(s => {
        const lvl = up[s] || 0;
        const cost = Math.floor(1000 * Math.pow(1.25, lvl));
        document.getElementById(`lvl-${s}`).innerText = `${lvl}/5`;
        document.getElementById(`bar-${s}`).style.width = (lvl * 20) + "%";
        
        const btn = document.getElementById(`btn-up-${s}`);
        if (lvl >= 5) {
            btn.innerText = "MAX";
            btn.disabled = true;
        } else {
            btn.innerText = `UP 💵 ${cost}`;
            btn.onclick = () => buyUpgrade(car.id, s, cost);
        }
    });
}

function buyUpgrade(carId, type, cost) {
    if (window.playerProfile.banknotes >= cost) {
        window.playerProfile.banknotes -= cost;
        if (!window.playerProfile.upgrades[carId]) window.playerProfile.upgrades[carId] = { speed:0, handling:0, accel:0 };
        window.playerProfile.upgrades[carId][type]++;
        
        localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
        
        // Animazione Flash
        const ws = document.getElementById('g-workshop-section');
        ws.classList.remove('flash-upgrade');
        void ws.offsetWidth; 
        ws.classList.add('flash-upgrade');
        
        updateGarageUI();
    }
}

function equipCar() {
    window.playerProfile.equippedCarId = window.carCatalog[currentViewIndex].id;
    localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
    updateGarageUI();
}
