/**
 * @file scroll.js
 * @description Térkép görgetés/húzás - központi modul
 * 
 * FELELŐSSÉGI KÖR:
 * - Scroll rendszer inicializálása (setupScroll)
 * - Egér és touch scroll modulok összefogása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér specifikus → input/mouse-scroll.js
 * - Touch specifikus → input/touch-scroll.js
 * - Absztrakt scroll logika → input/scroll-handler.js
 * - Zoom-mal kapcsolatos → zoom.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { setupMouseScroll } from './input/mouse-scroll.js';
import { setupTouchScroll } from './input/touch-scroll.js';

// Scroll rendszer inicializálása
export function setupScroll(canvas, saveGameState, handleClick) {
    setupMouseScroll(canvas, saveGameState, handleClick);
    setupTouchScroll(canvas, saveGameState, handleClick);
}
