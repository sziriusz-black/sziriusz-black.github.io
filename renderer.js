import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { drawTree, drawHouse, drawCornField, drawEmptyCornField } from './drawing.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { 
    imageSmoothingEnabled: false,
    pixelated: true
});
ctx.imageSmoothingEnabled = false;

export function getCanvas() {
    return canvas;
}

export function getContext() {
    return ctx;
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Canvas pixeles renderelés beállítása
    ctx.imageSmoothingEnabled = false;
}

export function render(updateBubblePosition, findTile) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Buborék pozíció frissítése ha aktív
    if (gameState.activeBubble) {
        updateBubblePosition(gameState.activeBubble.x, gameState.activeBubble.y);
    }
    
    // Kamera transzformáció
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(gameState.camera.zoom, gameState.camera.zoom);
    ctx.translate(-gameState.camera.x, -gameState.camera.y);

    // Látható terület számítása
    const viewLeft = (0 - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const viewTop = (0 - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;
    const viewRight = (canvas.width - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const viewBottom = (canvas.height - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;

    const tileStartX = Math.floor(viewLeft / CONFIG.TILE_SIZE) - 1;
    const tileEndX = Math.ceil(viewRight / CONFIG.TILE_SIZE) + 1;
    const tileStartY = Math.floor(viewTop / CONFIG.TILE_SIZE) - 1;
    const tileEndY = Math.ceil(viewBottom / CONFIG.TILE_SIZE) + 1;

    // Grid renderelése (meg nem vásárolt területek) - pixeles
    ctx.strokeStyle = '#333';
    ctx.lineWidth = Math.max(1, 1 / gameState.camera.zoom);
    for (let x = tileStartX; x <= tileEndX; x++) {
        for (let y = tileStartY; y <= tileEndY; y++) {
            const tile = findTile(x, y);
            if (!tile) {
                // Meg nem vásárolt terület - szürke (pixeles)
                ctx.fillStyle = '#444';
                const tileX = Math.floor(x * CONFIG.TILE_SIZE);
                const tileY = Math.floor(y * CONFIG.TILE_SIZE);
                ctx.fillRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }
    }

    // Térkép pontok renderelése - pixeles
    gameState.map.forEach(tile => {
        const x = Math.floor(tile.x * CONFIG.TILE_SIZE);
        const y = Math.floor(tile.y * CONFIG.TILE_SIZE);

        if (tile.type === 'owned') {
            // Üres megvásárolt terület - zöld (pixeles)
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        } else if (tile.type === 'tree') {
            // Fa
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            drawTree(ctx, x, y);
        } else if (tile.type === 'house') {
            // Ház
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            drawHouse(ctx, x, y);
        } else if (tile.type === 'cornfield') {
            // Kukorica föld
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            drawCornField(ctx, x, y);
        } else if (tile.type === 'emptycornfield') {
            // Üres kukorica föld
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            drawEmptyCornField(ctx, x, y);
            
            // Ha építés alatt van, jelenjen meg valami jelzés
            const isBuilding = gameState.buildingCornfields.has(`${tile.x},${tile.y}`);
            if (isBuilding) {
                // Féláttetsző szürke réteg az építés jelzésére
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }

        // Grid vonalak (pixeles)
        ctx.strokeStyle = '#555';
        ctx.lineWidth = Math.max(1, 1 / gameState.camera.zoom);
        ctx.strokeRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    });

    ctx.restore();
}

