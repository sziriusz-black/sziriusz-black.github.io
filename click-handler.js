/**
 * @file click-handler.js
 * @description Kattintás kezelés - tile koordináta számítás
 * 
 * FELELŐSSÉGI KÖR:
 * - Tile kattintás kezelése (handleClick)
 * - Képernyő koordináta → világ koordináta konverzió
 * - UI elemek kizárása a kattintásból
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Buborékkal kapcsolatos → bubble.js
 * - Tile műveletekkel kapcsolatos → tile-operations.js
 * - Kamera transzformációval kapcsolatos → camera.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { findTile } from './tile-operations.js';
import { showBubble } from './bubble.js';
import { getCanvas } from './renderer.js';

// Kattintás kezelése
export function handleClick(e) {
    const canvas = getCanvas();
    
    // Ne kezeljük a kattintást ha buborék van
    if (gameState.activeBubble) {
        return;
    }

    // Ne kezeljük ha a buborékon vagy modalon kattintottunk
    const bubble = document.getElementById('bubble');
    const modal = document.getElementById('plankModal');
    const cornModal = document.getElementById('cornModal');
    const discordModal = document.getElementById('discordModal');
    const settingsDropdown = document.getElementById('settingsDropdown');
    if ((bubble && bubble.contains(e.target)) || 
        (modal && modal.contains(e.target)) ||
        (cornModal && cornModal.contains(e.target)) ||
        (discordModal && discordModal.contains(e.target)) ||
        (settingsDropdown && settingsDropdown.contains(e.target))) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const worldY = (mouseY - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;

    const tileX = Math.floor(worldX / CONFIG.TILE_SIZE);
    const tileY = Math.floor(worldY / CONFIG.TILE_SIZE);

    const tile = findTile(tileX, tileY);
    showBubble(e.clientX, e.clientY, tileX, tileY, tile);
}

