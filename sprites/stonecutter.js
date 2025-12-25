/**
 * @file sprites/stonecutter.js
 * @description Kővágó sprite rajzolása - pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Kő platform rajzolása
 * - Kő blokk rajzolása
 * - Fűrész/vágó eszköz rajzolása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Kővágó szint megjelenítéssel kapcsolatos → itt módosíts
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

export function drawStoneCutter(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    
    // Kő alap (szürke platform)
    ctx.fillStyle = '#666666';
    ctx.fillRect(Math.floor(x + 2), Math.floor(y + tileSize - 8), tileSize - 4, 8);
    
    // Sötétebb kő részletek
    ctx.fillStyle = '#555555';
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + tileSize - 6), 4, 4);
    ctx.fillRect(Math.floor(x + tileSize - 8), Math.floor(y + tileSize - 6), 4, 4);
    
    // Kő blokk (világosabb szürke)
    ctx.fillStyle = '#888888';
    const blockWidth = 16;
    const blockHeight = 12;
    const blockX = Math.floor(centerX - blockWidth / 2);
    const blockY = Math.floor(y + tileSize - 8 - blockHeight);
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
    
    // Kő részletek (repedések)
    ctx.fillStyle = '#666666';
    ctx.fillRect(blockX + 2, blockY + 2, 2, 4);
    ctx.fillRect(blockX + 8, blockY + 6, 3, 2);
    ctx.fillRect(blockX + 12, blockY + 3, 2, 3);
    
    // Világosabb foltok a kövön
    ctx.fillStyle = '#999999';
    ctx.fillRect(blockX + 5, blockY + 2, 3, 3);
    ctx.fillRect(blockX + 10, blockY + 7, 2, 2);
    
    // Fűrész / vágó eszköz (barna fa nyél + szürke penge)
    ctx.fillStyle = '#8b6f47'; // fa nyél
    const handleX = Math.floor(centerX + 6);
    const handleY = Math.floor(blockY - 4);
    ctx.fillRect(handleX, handleY, 3, 10);
    
    // Fém penge
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(Math.floor(centerX - 4), Math.floor(blockY - 2), 10, 2);
    
    // Penge éle (világosabb)
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(Math.floor(centerX - 4), Math.floor(blockY - 2), 10, 1);
}

