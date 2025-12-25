/**
 * @file bubble-position.js
 * @description Buborék pozíció frissítése rendereléskor
 * 
 * FELELŐSSÉGI KÖR:
 * - Buborék pozíció frissítése aktív buborék esetén
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Buborék tartalommal kapcsolatos → bubble.js
 * - Kamera transzformációval kapcsolatos → camera-transform.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from './gameState.js';

// Buborék pozíció frissítése ha aktív
export function updateBubblePositionIfActive(updateBubblePositionFn) {
    if (gameState.activeBubble) {
        updateBubblePositionFn(gameState.activeBubble.x, gameState.activeBubble.y);
    }
}

