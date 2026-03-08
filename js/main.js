// js/main.js
import { Player } from './player.js';
import { Renderer } from './renderer.js';

export class Game {
    constructor(canvasId) {
        // 1. Setup del Canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas con id ${canvasId} non trovato!`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        // 2. Inizializzazione Moduli
        this.renderer = new Renderer(this.ctx, this.canvas);
        this.player = new Player();
        
        // 3. Stato del Loop
        this.lastTime = 0;
        this.isRunning = false;
        
        // 4. Gestione Input (Tastiera e Touch)
        this.keys = {};
        this.initResize();
        this.initInputs();
    }

    // Gestisce il ridimensionamento della finestra per mantenere il gioco responsive
    initResize() {
        const resize = () => {
            // Impostiamo la risoluzione interna del canvas pari a quella visualizzata
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            // Notifichiamo il renderer se necessario (es. ricalcolo orizzonte)
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initInputs() {
        // Tastiera (Desktop)
        window.addEventListener('keydown', e => {
            if (e.code === 'ArrowLeft')  this.player.moveLeft();
            if (e.code === 'ArrowRight') this.player.moveRight();
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Touch/Mouse (Mobile - Facciamo puntare ai bottoni nell'HTML)
        // Usiamo delegazione degli eventi per semplicità
        document.addEventListener('touchstart', e => {
            const id = e.target.id;
            if (id === 'btn-left')  this.player.moveLeft();
            if (id === 'btn-right') this.player.moveRight();
            if (id === 'btn-accel') this.keys['Accel'] = true;
        });

        document.addEventListener('touchend', e => {
            const id = e.target.id;
            if (id === 'btn-accel') this.keys['Accel'] = false;
        });
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
        console.log("Game Started");
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        // Delta Time: tempo trascorso dall'ultimo frame (in secondi)
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(dt);
        this.draw();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        // Gestione accelerazione continua
        if (this.keys['ArrowUp'] || this.keys['Accel'] || this.keys['Space']) {
            this.player.accelerate();
        }

        // Update logica giocatore
        this.player.update(dt);

        // TODO: Update traffico e collisioni
        // this.traffic.update(dt, this.player.speed);
    }

    draw() {
        // Pulizia totale
        this.renderer.clear();

        // Disegno strada con prospettiva
        this.renderer.drawRoad(this.player.speed);

        // Disegno giocatore
        this.player.draw(this.ctx);
    }
}

// Auto-partenza se questo file è caricato come modulo principale
const game = new Game('gameCanvas');
game.start();