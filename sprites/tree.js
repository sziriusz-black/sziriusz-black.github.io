/**
 * @file sprites/tree.js
 * @description Fa sprite rajzolása - Minecraft stílusú pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Fa törzs rajzolása
 * - Fa korona (levelek) rajzolása
 * - Minecraft stílusú blokkos megjelenés
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Animációval kapcsolatos → külön animation modul javasolt
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

export function drawTree(ctx, x, y) {
    // Minecraft stílusú fa rajzolása (blokkos, pixeles)
    const centerX = x + CONFIG.TILE_SIZE / 2;
    
    // Törzs (barna blokk a középen)
    ctx.fillStyle = '#6b4423'; // Minecraft fa törzs színe
    const trunkWidth = 4;
    const trunkHeight = 10;
    const trunkX = Math.floor(centerX - trunkWidth / 2);
    const trunkY = Math.floor(y + CONFIG.TILE_SIZE - trunkHeight);
    ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
    
    // Törzs sötétebb részletek (3D hatás)
    ctx.fillStyle = '#5a3419';
    ctx.fillRect(trunkX, trunkY, trunkWidth, 2);
    ctx.fillRect(trunkX, trunkY + trunkHeight - 2, trunkWidth, 2);
    
    // Korona (zöld blokkok/kockák a tetején) - Minecraft stílus
    ctx.fillStyle = '#4a7c4a'; // Minecraft levelek színe
    const leafSize = 3;
    const leafOffset = 2;
    
    // Felső réteg levelek (3x3 blokk)
    const topY = trunkY - leafOffset;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const leafX = Math.floor(centerX + i * leafSize - leafSize / 2);
            const leafY = Math.floor(topY + j * leafSize - leafSize / 2);
            ctx.fillRect(leafX, leafY, leafSize, leafSize);
        }
    }
    
    // Középső réteg levelek (2x2 blokk)
    ctx.fillStyle = '#3a6a3a'; // Sötétebb zöld
    const midY = topY + leafSize;
    for (let i = -1; i <= 0; i++) {
        for (let j = -1; j <= 0; j++) {
            const leafX = Math.floor(centerX + i * leafSize * 1.5 - leafSize / 2);
            const leafY = Math.floor(midY + j * leafSize * 1.5 - leafSize / 2);
            ctx.fillRect(leafX, leafY, leafSize, leafSize);
        }
    }
    
    // Vékony levelek a széleken (1x1 blokkok)
    ctx.fillStyle = '#5a8a5a'; // Világosabb zöld
    const edgeLeaves = [
        [centerX - leafSize * 2, topY],
        [centerX + leafSize * 2, topY],
        [centerX - leafSize * 2, topY + leafSize],
        [centerX + leafSize * 2, topY + leafSize]
    ];
    edgeLeaves.forEach(([lx, ly]) => {
        ctx.fillRect(Math.floor(lx - leafSize / 2), Math.floor(ly - leafSize / 2), leafSize, leafSize);
    });
}

