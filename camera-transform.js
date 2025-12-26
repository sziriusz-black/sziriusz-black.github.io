/**
 * @file camera-transform.js
 * @description Kamera transzformáció - canvas transzformáció alkalmazása
 * 
 * FELELŐSSÉGI KÖR:
 * - Kamera transzformáció alkalmazása (applyCameraTransform)
 * - Transzformáció visszaállítása (restoreCameraTransform)
 * - Látható terület számítása (getVisibleArea)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Kamera pozícióval kapcsolatos → camera.js
 * - Zoom-mal kapcsolatos → zoom.js
 * - Canvas-szal kapcsolatos → canvas.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { getCanvas, getContext } from './canvas.js';

// Kamera transzformáció alkalmazása
export function applyCameraTransform() {
    const ctx = getContext();
    const canvas = getCanvas();
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(gameState.camera.zoom, gameState.camera.zoom);
    ctx.translate(-gameState.camera.x, -gameState.camera.y);
}

// Kamera transzformáció visszaállítása
export function restoreCameraTransform() {
    const ctx = getContext();
    ctx.restore();
}

// Látható terület számítása
export function getVisibleArea() {
    const canvas = getCanvas();
    
    const viewLeft = (0 - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const viewTop = (0 - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;
    const viewRight = (canvas.width - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const viewBottom = (canvas.height - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;

    return {
        tileStartX: Math.floor(viewLeft / CONFIG.TILE_SIZE) - 1,
        tileEndX: Math.ceil(viewRight / CONFIG.TILE_SIZE) + 1,
        tileStartY: Math.floor(viewTop / CONFIG.TILE_SIZE) - 1,
        tileEndY: Math.ceil(viewBottom / CONFIG.TILE_SIZE) + 1
    };
}

