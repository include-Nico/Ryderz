// js/player.js
export class Player {
    constructor() {
        this.laneCount = 4;
        this.currentLane = 1.5; // Inizia tra le due corsie centrali
        this.targetLane = 1.5;
        
        this.x = 0; // Coordinata X reale sul canvas
        this.y = 0; // Coordinata Y (fissa in basso)
        this.w = 40;
        this.h = 80;

        this.speed = 5;       // Velocità attuale
        this.accel = 0.1;     // Forza di accelerazione
        this.friction = 0.05; // Decelerazione naturale
        this.maxSpeed = 15;
        
        this.laneSwitchSpeed = 0.15; // Fluidità dello sterzo
    }

    update(dt) {
        // 1. Interpolazione per il movimento laterale fluido
        // La posizione attuale 'scorre' verso la corsia bersaglio
        const laneDiff = this.targetLane - this.currentLane;
        this.currentLane += laneDiff * this.laneSwitchSpeed;

        // 2. Gestione della velocità (semplice inerzia)
        if (this.speed > 5) {
            this.speed -= this.friction; // Ritorna alla velocità base
        }
    }

    draw(ctx) {
        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;

        // Calcoliamo la X reale basandoci sulla corsia attuale (0-3)
        // Usiamo la stessa logica prospettica del renderer per la X
        const laneWidth = canvasW / 4;
        this.x = (this.currentLane * laneWidth) + (laneWidth / 2) - (this.w / 2);
        this.y = canvasH - 150;

        // Placeholder Moto (da sostituire con sprite)
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Piccolo dettaglio: luce posteriore
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(this.x + 5, this.y + this.h - 10, this.w - 10, 5);
    }

    moveLeft() {
        if (this.targetLane > 0) this.targetLane -= 1;
    }

    moveRight() {
        if (this.targetLane < this.laneCount - 1) this.targetLane += 1;
    }

    accelerate() {
        if (this.speed < this.maxSpeed) this.speed += this.accel;
    }
}