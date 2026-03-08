// js/renderer.js
export class Renderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.horizon = 0.4; // L'orizzonte è al 40% dell'altezza dello schermo
        this.roadColor = '#3b3b3b';
        this.grassColor = '#4caf50';
        this.laneColor = '#ffffff';
        this.timer = 0; // Serve per animare le linee della strada
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRoad(speed) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const horizonY = h * this.horizon;

        // 1. Disegna l'erba (sfondo)
        this.ctx.fillStyle = this.grassColor;
        this.ctx.fillRect(0, horizonY, w, h - horizonY);

        // 2. Disegna il trapezio della strada (prospettiva)
        this.ctx.fillStyle = this.roadColor;
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.45, horizonY); // Punto in alto a sx (stretto)
        this.ctx.lineTo(w * 0.55, horizonY); // Punto in alto a dx (stretto)
        this.ctx.lineTo(w * 1.2, h);        // Punto in basso a dx (largo)
        this.ctx.lineTo(w * -0.2, h);       // Punto in basso a sx (largo)
        this.ctx.fill();

        // 3. Linee delle corsie animate
        this.timer += speed * 0.2; // La velocità influenza il movimento delle linee
        this.drawLaneMarkers(w, h, horizonY);
    }

    drawLaneMarkers(w, h, horizonY) {
        this.ctx.strokeStyle = this.laneColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 30]); // Linea tratteggiata
        this.ctx.lineDashOffset = -this.timer;

        // Disegniamo 3 linee per dividere le 4 corsie
        for (let i = 1; i <= 3; i++) {
            const ratio = 0.25 * i;
            this.ctx.beginPath();
            // Calcolo prospettico per le linee interne
            const topX = w * 0.45 + (w * 0.1 * ratio);
            const bottomX = (w * -0.2) + (w * 1.4 * ratio);
            
            this.ctx.moveTo(topX, horizonY);
            this.ctx.lineTo(bottomX, h);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]); // Reset dash
    }
}