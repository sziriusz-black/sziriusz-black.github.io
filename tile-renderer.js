/**
 * @file tile-renderer.js
 * @description Tile renderelés - tile-ok rajzolása típus szerint
 * 
 * FELELŐSSÉGI KÖR:
 * - Grid renderelése (renderGrid)
 * - Tile-ok renderelése (renderTiles)
 * - Tile típus alapján megfelelő sprite hívása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egyedi sprite rajzolással kapcsolatos → sprites/*.js
 * - Kamera transzformációval kapcsolatos → camera-transform.js
 * - Canvas-szal kapcsolatos → canvas.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { getContext } from './canvas.js';
import { drawTree, drawHouse, drawBuildingHouse, drawCornField, drawEmptyCornField, drawStoneCutter, drawMine, drawBuildingMine, drawWarehouse } from './drawing.js';

// Grid renderelése (meg nem vásárolt területek)
export function renderGrid(visibleArea, findTile) {
    const ctx = getContext();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = Math.max(1, 1 / gameState.camera.zoom);
    
    for (let x = visibleArea.tileStartX; x <= visibleArea.tileEndX; x++) {
        for (let y = visibleArea.tileStartY; y <= visibleArea.tileEndY; y++) {
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
}

// Tile-ok renderelése
export function renderTiles() {
    const ctx = getContext();
    
    gameState.map.forEach(tile => {
        const x = Math.floor(tile.x * CONFIG.TILE_SIZE);
        const y = Math.floor(tile.y * CONFIG.TILE_SIZE);

        // Alapértelmezett zöld háttér minden tile-hoz
        ctx.fillStyle = '#2a5a2a';
        ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // Tile típus alapján sprite rajzolása
        switch (tile.type) {
            case 'tree':
                drawTree(ctx, x, y);
                break;
            case 'house':
                drawHouse(ctx, x, y);
                break;
            case 'buildinghouse':
                drawBuildingHouse(ctx, x, y);
                break;
            case 'cornfield':
                drawCornField(ctx, x, y);
                break;
            case 'emptycornfield':
                drawEmptyCornField(ctx, x, y);
                // Ha építés alatt van, jelenjen meg valami jelzés
                if (gameState.buildingCornfields.has(`${tile.x},${tile.y}`)) {
                    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                    ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                }
                break;
            case 'stonecutter':
                drawStoneCutter(ctx, x, y);
                break;
            case 'mine':
                drawMine(ctx, x, y, tile.level || 1);
                break;
            case 'buildingmine':
                drawBuildingMine(ctx, x, y);
                break;
            case 'warehouse':
                drawWarehouse(ctx, x, y, tile.level || 1);
                break;
            // 'owned' típus: csak zöld háttér, nincs sprite
        }

        // Grid vonalak (pixeles)
        ctx.strokeStyle = '#555';
        ctx.lineWidth = Math.max(1, 1 / gameState.camera.zoom);
        ctx.strokeRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    });
}

