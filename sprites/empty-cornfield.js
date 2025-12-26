/**
 * @file sprites/empty-cornfield.js
 * @description Üres kukoricaföld sprite rajzolása - pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Föld háttér rajzolása (barna)
 * - Üres föld (nincs növény)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Növénnyel rendelkező kukoricaföld → sprites/cornfield.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

export function drawEmptyCornField(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    
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
    
    // Üres föld - nincs növény, csak a föld
}

