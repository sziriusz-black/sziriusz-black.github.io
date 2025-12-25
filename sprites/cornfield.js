/**
 * @file sprites/cornfield.js
 * @description Kukoricaföld sprite rajzolása - pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Föld háttér rajzolása (barna)
 * - Kukorica növény rajzolása (sárga/zöld)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Üres kukoricaföld → sprites/empty-cornfield.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

export function drawCornField(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    
    // Föld háttér (barna)
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(Math.floor(x), Math.floor(y), tileSize, tileSize);
    
    // Föld sötétebb részletek
    ctx.fillStyle = '#7a5f37';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(
                    Math.floor(x + i * tileSize / 4),
                    Math.floor(y + j * tileSize / 4),
                    Math.floor(tileSize / 4),
                    Math.floor(tileSize / 4)
                );
            }
        }
    }
    
    // Kukorica növény (sárga/zöld)
    ctx.fillStyle = '#ffd700'; // Sárga kukorica
    const cornWidth = 4;
    const cornHeight = 12;
    const cornX = Math.floor(centerX - cornWidth / 2);
    const cornY = Math.floor(y + tileSize - cornHeight - 4);
    ctx.fillRect(cornX, cornY, cornWidth, cornHeight);
    
    // Kukorica levelek (zöld)
    ctx.fillStyle = '#4a7c4a';
    ctx.fillRect(Math.floor(cornX - 2), Math.floor(cornY + 2), 2, 6);
    ctx.fillRect(Math.floor(cornX + cornWidth), Math.floor(cornY + 2), 2, 6);
}

