/**
 * @file game-loop.js
 * @description Fő játék ciklus - frame-enkénti frissítés
 * 
 * FELELŐSSÉGI KÖR:
 * - Játék ciklus futtatása (gameLoop, startGameLoop)
 * - Időzítők frissítése
 * - Buborék frissítése
 * - Tutorial nyíl frissítése
 * - Renderelés hívása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Időzítőkkel kapcsolatos → timers.js
 * - Renderelésssel kapcsolatos → renderer.js
 * - Tutorial-lal kapcsolatos → tutorial.js
 * - Buborékkal kapcsolatos → bubble.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { updateTimers } from './timers.js';
import { render } from './renderer.js';
import { updateTutorialArrow } from './tutorial.js';
import { refreshActiveBubble, updateBubblePosition } from './bubble.js';
import { updateUI } from './ui.js';
import { saveGameState } from './save-load.js';
import { closeBubble } from './bubble.js';
import { findTile } from './tile-operations.js';

// Játék ciklus
function gameLoop() {
    updateTimers(updateUI, saveGameState, closeBubble);
    refreshActiveBubble();
    updateTutorialArrow();
    render(updateBubblePosition, findTile);
    requestAnimationFrame(gameLoop);
}

// Játék ciklus indítása
export function startGameLoop() {
    gameLoop();
}

