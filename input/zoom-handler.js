/**
 * @file input/zoom-handler.js
 * @description Absztrakt zoom kezelés - beviteli eszköztől független
 * 
 * FELELŐSSÉGI KÖR:
 * - Zoom alkalmazása adott pontra (applyZoom)
 * - Kamera pozíció korrekció zoom után
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér specifikus → input/mouse-zoom.js
 * - Touch specifikus → input/touch-zoom.js
 * - Kamera logikával kapcsolatos → camera.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from '../gameState.js';
import { getZoomLevel, constrainCamera } from '../camera.js';

// Zoom alkalmazása egy adott pontra
export function applyZoom(canvas, centerX, centerY, newZoomLevel) {
    const oldZoom = gameState.camera.zoom;
    const worldX = (centerX - canvas.width / 2) / oldZoom + gameState.camera.x;
    const worldY = (centerY - canvas.height / 2) / oldZoom + gameState.camera.y;

    gameState.camera.zoomLevel = newZoomLevel;
    gameState.camera.zoom = getZoomLevel(newZoomLevel);

    const newWorldX = (centerX - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const newWorldY = (centerY - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;

    gameState.camera.x += worldX - newWorldX;
    gameState.camera.y += worldY - newWorldY;

    constrainCamera(canvas);
}

