/**
 * @file zoom.js
 * @description Zoom kezelés - központi modul
 * 
 * FELELŐSSÉGI KÖR:
 * - Zoom rendszer inicializálása (setupZoom)
 * - Egér és touch zoom modulok összefogása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér zoom specifikus → input/mouse-zoom.js
 * - Touch zoom specifikus → input/touch-zoom.js
 * - Absztrakt zoom logika → input/zoom-handler.js
 * - Scroll-lal kapcsolatos → scroll.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { setupMouseZoom } from './input/mouse-zoom.js';
import { setupTouchZoom } from './input/touch-zoom.js';

// Zoom rendszer inicializálása
export function setupZoom(canvas, saveGameState) {
    setupMouseZoom(canvas, saveGameState);
    setupTouchZoom(canvas, saveGameState);
}
