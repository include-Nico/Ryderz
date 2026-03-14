window.carCatalog = [
    {
        id: 1,
        name: "Maggiolino Race",
        price: 0,
        baseStats: { handling: 5.5, acceleration: 0.04, maxSpeed: 15 },
        imgGarage: "img/cars/car_01_garage.png",
        imgGame:   "img/cars/car_01_game.png"
    },
    {
        id: 2,
        name: "Ford Mustang",
        price: 18000,
        baseStats: { handling: 6.2, acceleration: 0.05, maxSpeed: 18 },
        imgGarage: "img/cars/car_02_garage.png",
        imgGame:   "img/cars/car_02_game.png"
    }
];

/* ─── PROFILO ────────────────────────────────── */
function getProfile() {
    let p = localStorage.getItem('ryderzProfileV4');
    if (!p) {
        const fresh = { banknotes: 0, unlockedCars: [1], equippedCarId: 1, upgrades: {} };
        localStorage.setItem('ryderzProfileV4', JSON.stringify(fresh));
        return fresh;
    }
    return JSON.parse(p);
}
window.playerProfile = getProfile();

function saveProfile() {
    localStorage.setItem('ryderzProfileV4', JSON.stringify(window.playerProfile));
}

function addBanknotes(amt) {
    window.playerProfile.banknotes += amt;
    saveProfile();
}

/* ─── GARAGE UI ──────────────────────────────── */
let currentViewIndex = 0;

function initGarage() {
    window.playerProfile = getProfile();
    currentViewIndex = window.carCatalog.findIndex(c => c.id === window.playerProfile.equippedCarId);
    if (currentViewIndex < 0) currentViewIndex = 0;
    updateGarageUI();
}

function changeCar(dir) {
    currentViewIndex = (currentViewIndex + dir + window.carCatalog.length) % window.carCatalog.length;
    updateGarageUI();
}

function updateGarageUI() {
    const car      = window.carCatalog[currentViewIndex];
    const profile  = window.playerProfile;
    const isUnlocked = profile.unlockedCars.includes(car.id);
    const isEquipped = profile.equippedCarId === car.id;

    const carImg  = document.getElementById('g-car-img');
    const carName = document.getElementById('g-car-name');
    const carStat = document.getElementById('g-car-status');
    const bankEl  = document.getElementById('home-banknotes');

    if (carImg)  carImg.src = car.imgGarage;
    if (carName) carName.textContent = car.name;
    if (bankEl)  bankEl.textContent  = profile.banknotes;

    if (carStat) {
        carStat.textContent  = isEquipped  ? '✅ EQUIPAGGIATA' :
                               isUnlocked  ? 'SBLOCCATA'       : '🔒 BLOCCATA';
        carStat.style.color  = isEquipped  ? 'var(--neon-orange)' :
                               isUnlocked  ? 'var(--neon-cyan)'   : 'var(--text-muted)';
    }

    const buySection      = document.getElementById('g-buy-section');
    const workshopSection = document.getElementById('g-workshop-section');
    const equipBtn        = document.getElementById('g-equip-btn');

    if (isUnlocked) {
        if (buySection)      buySection.style.display      = 'none';
        if (workshopSection) workshopSection.style.display = 'block';
        if (equipBtn)        equipBtn.style.display        = isEquipped ? 'none' : 'block';
        updateWorkshopUI(car);
    } else {
        if (buySection)      buySection.style.display      = 'block';
        if (workshopSection) workshopSection.style.display = 'none';

        const buyBtn = document.getElementById('g-buy-btn');
        if (buyBtn) {
            const canAfford = profile.banknotes >= car.price;
            buyBtn.textContent = `COMPRA 💵 ${car.price.toLocaleString()}`;
            buyBtn.disabled    = !canAfford;
            buyBtn.style.opacity = canAfford ? '1' : '0.45';
            buyBtn.onclick = () => {
                if (profile.banknotes >= car.price) {
                    profile.banknotes -= car.price;
                    profile.unlockedCars.push(car.id);
                    saveProfile();
                    updateGarageUI();
                }
            };
        }
    }
}

/* ─── OFFICINA ───────────────────────────────── */
function updateWorkshopUI(car) {
    if (!window.playerProfile.upgrades[car.id]) {
        window.playerProfile.upgrades[car.id] = { speed: 0, handling: 0, accel: 0 };
    }
    const up = window.playerProfile.upgrades[car.id];

    ['speed', 'handling', 'accel'].forEach(type => {
        const lvl  = up[type];
        const cost = Math.floor(1000 * Math.pow(1.25, lvl));

        const lvlEl = document.getElementById(`lvl-${type}`);
        const barEl = document.getElementById(`bar-${type}`);
        const btn   = document.getElementById(`btn-up-${type}`);

        if (lvlEl) lvlEl.textContent    = `${lvl}/5`;
        if (barEl) barEl.style.width    = (lvl * 20) + '%';

        if (!btn) return;

        if (lvl >= 5) {
            btn.disabled    = true;
            btn.textContent = 'MAX';
            btn.style.opacity = '0.5';
        } else {
            const canAfford = window.playerProfile.banknotes >= cost;
            btn.disabled    = false;
            btn.textContent = `⬆ ${cost.toLocaleString()}💵`;
            btn.style.opacity = canAfford ? '1' : '0.5';
            btn.onclick = () => {
                if (window.playerProfile.banknotes >= cost) {
                    window.playerProfile.banknotes -= cost;
                    window.playerProfile.upgrades[car.id][type]++;
                    saveProfile();
                    updateGarageUI();
                    // Flash animazione
                    const ws = document.getElementById('g-workshop-section');
                    if (ws) {
                        ws.classList.remove('flash-upgrade');
                        void ws.offsetWidth;
                        ws.classList.add('flash-upgrade');
                    }
                }
            };
        }
    });
}

function equipCar() {
    window.playerProfile.equippedCarId = window.carCatalog[currentViewIndex].id;
    saveProfile();
    updateGarageUI();
}
