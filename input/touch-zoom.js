/**
 * @file input/touch-zoom.js
 * @description Touch pinch zoom kezelés mobilon
 * 
 * FELELŐSSÉGI KÖR:
 * - Pinch gesztus felismerése (2 ujj)
 * - Pinch távolság számítása
 * - Pinch közép számítása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér zoom-mal kapcsolatos → input/mouse-zoom.js
 * - Absztrakt zoom logikával kapcsolatos → input/zoom-handler.js
 * - Touch scroll-lal kapcsolatos → input/touch-scroll.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';
import { gameState } from '../gameState.js';
import { applyZoom } from './zoom-handler.js';

// Pinch zoom állapot
let initialPinchDistance = 0;
let initialZoomLevel = 1;
let isPinching = false;

// Két ujj közötti távolság számítása
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Pinch középpont számítása
function getPinchCenter(touch1, touch2, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((touch1.clientX + touch2.clientX) / 2) - rect.left,
        y: ((touch1.clientY + touch2.clientY) / 2) - rect.top
    };
}

export function setupTouchZoom(canvas, saveGameState) {
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isPinching = true;
            initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoomLevel = gameState.camera.zoomLevel || 1;
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && isPinching) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const center = getPinchCenter(e.touches[0], e.touches[1], canvas);
            
            // Számoljuk ki az új zoom szintet a távolság arányából
            const scale = currentDistance / initialPinchDistance;
            
            // Fordított logika: nagyobb távolság = kisebb zoomLevel = közelebbi nézet
            let newZoomLevel = Math.round(initialZoomLevel / scale);
            newZoomLevel = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, newZoomLevel));
            
            if (newZoomLevel !== gameState.camera.zoomLevel) {
                applyZoom(canvas, center.x, center.y, newZoomLevel);
            }
            
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (isPinching && e.touches.length < 2) {
            isPinching = false;
            saveGameState();
        }
    });

    canvas.addEventListener('touchcancel', () => {
        isPinching = false;
    });
}

