/**
 * @file sprites/warehouse.js
 * @description Raktár sprite rajzolása - pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Raktár épület rajzolása
 * - Szint alapján méret/díszítés változtatás
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 */

import { CONFIG } from '../config.js';

export function drawWarehouse(ctx, x, y, level = 1) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    
    // Alap - kő platform
    ctx.fillStyle = '#666666';
    ctx.fillRect(Math.floor(x + 2), Math.floor(y + tileSize - 6), tileSize - 4, 6);
    
    // Fő épület - fa raktár
    const buildingWidth = tileSize - 6;
    const buildingHeight = tileSize - 10;
    const buildingX = Math.floor(x + 3);
    const buildingY = Math.floor(y + 4);
    
    // Fal (barna fa)
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
    
    // Fal részletek (sötétebb csíkok - fa deszka hatás)
    ctx.fillStyle = '#7a5a37';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(buildingX, buildingY + i * 6, buildingWidth, 1);
    }
    
    // Tető (sötétbarna)
    ctx.fillStyle = '#5a4027';
    ctx.beginPath();
    ctx.moveTo(x, buildingY + 2);
    ctx.lineTo(centerX, y);
    ctx.lineTo(x + tileSize, buildingY + 2);
    ctx.closePath();
    ctx.fill();
    
    // Tető szélei (világosabb)
    ctx.fillStyle = '#6b5137';
    ctx.fillRect(Math.floor(x + 2), Math.floor(buildingY), tileSize - 4, 2);
    
    // Ajtó (sötét)
    ctx.fillStyle = '#3a2a17';
    const doorWidth = 8;
    const doorHeight = 12;
    const doorX = Math.floor(centerX - doorWidth / 2);
    const doorY = Math.floor(y + tileSize - 6 - doorHeight);
    ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
    
    // Ajtó kilincs
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(doorX + doorWidth - 3, doorY + doorHeight / 2, 2, 2);
    
    // Ablakok (szint alapján több ablak)
    ctx.fillStyle = '#87ceeb';
    if (level >= 1) {
        // Bal ablak
        ctx.fillRect(buildingX + 2, buildingY + 8, 4, 4);
    }
    if (level >= 2) {
        // Jobb ablak
        ctx.fillRect(buildingX + buildingWidth - 6, buildingY + 8, 4, 4);
    }
    if (level >= 3) {
        // Felső ablak
        ctx.fillRect(Math.floor(centerX - 2), buildingY + 2, 4, 4);
    }
    
    // Ablak kereszt (fehér)
    ctx.fillStyle = '#ffffff';
    if (level >= 1) {
        ctx.fillRect(buildingX + 3, buildingY + 8, 1, 4);
        ctx.fillRect(buildingX + 2, buildingY + 9, 4, 1);
    }
    if (level >= 2) {
        ctx.fillRect(buildingX + buildingWidth - 5, buildingY + 8, 1, 4);
        ctx.fillRect(buildingX + buildingWidth - 6, buildingY + 9, 4, 1);
    }
    
    // Ládák az épület előtt (díszítés)
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + tileSize - 10), 5, 4);
    ctx.fillRect(Math.floor(x + tileSize - 9), Math.floor(y + tileSize - 10), 5, 4);
    
    // Láda részletek
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(Math.floor(x + 5), Math.floor(y + tileSize - 9), 3, 1);
    ctx.fillRect(Math.floor(x + tileSize - 8), Math.floor(y + tileSize - 9), 3, 1);
    
    // Szint kijelzés (ha 2+)
    if (level > 1) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${level}`, x + tileSize - 2, y + tileSize - 2);
    }
    
    // Raktár ikon (📦) a tetőn
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📦', centerX, y + 10);
}


