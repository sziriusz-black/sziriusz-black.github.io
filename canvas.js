/**
 * @file canvas.js
 * @description Canvas kezelés - inicializálás és méretezés
 * 
 * FELELŐSSÉGI KÖR:
 * - Canvas elem lekérése (getCanvas)
 * - Context lekérése (getContext)
 * - Canvas méretezése (resizeCanvas)
 * - Pixeles renderelés beállítása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Renderelésssel kapcsolatos → render.js
 * - Tile rajzolással kapcsolatos → tile-renderer.js
 * - Kamera transzformációval kapcsolatos → camera-transform.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

let canvas = null;
let ctx = null;

function initCanvas() {
    if (!canvas) {
        canvas = document.getElementById('gameCanvas');
        if (canvas) {
            ctx = canvas.getContext('2d', { 
                imageSmoothingEnabled: false,
                pixelated: true
            });
            ctx.imageSmoothingEnabled = false;
        }
    }
    return canvas && ctx;
}

export function getCanvas() {
    if (!canvas) {
        initCanvas();
    }
    return canvas;
}

export function getContext() {
    if (!ctx) {
        initCanvas();
    }
    return ctx;
}

export function resizeCanvas() {
    if (!initCanvas()) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Canvas pixeles renderelés beállítása
    ctx.imageSmoothingEnabled = false;
}

export function clearCanvas() {
    if (!initCanvas()) return;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

