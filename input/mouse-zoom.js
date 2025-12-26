/**
 * @file input/mouse-zoom.js
 * @description Egér görgő zoom kezelés
 * 
 * FELELŐSSÉGI KÖR:
 * - Egér wheel esemény kezelése
 * - Zoom irány meghatározása (be/ki)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Touch zoom-mal kapcsolatos → input/touch-zoom.js
 * - Absztrakt zoom logikával kapcsolatos → input/zoom-handler.js
 * - Egér scroll-lal kapcsolatos → input/mouse-scroll.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';
import { gameState } from '../gameState.js';
import { applyZoom } from './zoom-handler.js';

export function setupMouseZoom(canvas, saveGameState) {
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let newZoomLevel = gameState.camera.zoomLevel || 1;
        
        if (e.deltaY > 0) {
            newZoomLevel = Math.min(CONFIG.MAX_ZOOM, newZoomLevel + 1);
        } else {
            newZoomLevel = Math.max(CONFIG.MIN_ZOOM, newZoomLevel - 1);
        }

        if (newZoomLevel === gameState.camera.zoomLevel) {
            return;
        }

        applyZoom(canvas, mouseX, mouseY, newZoomLevel);
        saveGameState();
    }, { passive: false });
}

