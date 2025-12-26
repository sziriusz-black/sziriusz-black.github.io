/**
 * @file input/scroll-handler.js
 * @description Absztrakt scroll kezelés - beviteli eszköztől független
 * 
 * FELELŐSSÉGI KÖR:
 * - Drag indítás kezelése (onDragStart)
 * - Drag mozgatás kezelése (onDragMove)
 * - Drag befejezés kezelése (onDragEnd)
 * - Drag megszakítás kezelése (onDragCancel)
 * - Kamera pozíció frissítése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér specifikus → input/mouse-scroll.js
 * - Touch specifikus → input/touch-scroll.js
 * - Kamera logikával kapcsolatos → camera.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from '../gameState.js';
import { constrainCamera } from '../camera.js';

// Drag indítás
export function onDragStart(x, y, canvas) {
    // A kamera állapotát nem változtatjuk meg indításkor
    // Az egér/touch modulok tárolják a kezdő pozíciót
}

// Drag mozgatás - kamera pozíció frissítése
export function onDragMove(deltaX, deltaY, canvas) {
    gameState.camera.x -= deltaX / gameState.camera.zoom;
    gameState.camera.y -= deltaY / gameState.camera.zoom;
    constrainCamera(canvas);
}

// Drag befejezés - mentés
export function onDragEnd(saveGameState) {
    saveGameState();
}

// Drag megszakítás - mentés
export function onDragCancel(saveGameState) {
    saveGameState();
}

