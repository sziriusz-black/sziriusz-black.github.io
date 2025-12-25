/**
 * @file game.js
 * @description Fő játék modul - a játék belépési pontja
 * 
 * FELELŐSSÉGI KÖR:
 * - Játék indítása (initGame)
 * - Modulok összefogása
 * - Debug eszközök elérhetővé tétele
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Inicializálással kapcsolatos → initialization.js
 * - Eseménykezelőkkel kapcsolatos → event-listeners.js
 * - Kattintás kezeléssel kapcsolatos → click-handler.js
 * - Game loop-pal kapcsolatos → game-loop.js
 * - Buborékkal kapcsolatos → bubble.js
 * - Modalokkal kapcsolatos → modals.js
 * - UI-jal kapcsolatos → ui.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from './gameState.js';
import { resizeCanvas } from './renderer.js';
import { loadGameState, saveGameState } from './save-load.js';
import { startBackgroundMusic } from './audio.js';
import { isNewPlayer, startTutorial, setupTutorialListeners } from './tutorial.js';
import { updateUI } from './ui.js';
import { initBubble } from './bubble.js';
import { getCanvas } from './renderer.js';

// Modulok
import { createInitialMap } from './initialization.js';
import { setupAllEventListeners } from './event-listeners.js';
import { startGameLoop } from './game-loop.js';

// Debug: gameState és mentés elérhetővé tétele konzolból
window.gameState = gameState;
window.saveGame = saveGameState;

// Játék inicializálása
function initGame() {
    const canvas = getCanvas();
    
    // Canvas méretezése
    resizeCanvas();
    
    // Bubble inicializálás
    initBubble(canvas);

    // Local storage betöltése
    loadGameState(() => {
        createInitialMap();
        updateUI();
    }, updateUI);

    // Kezdő térkép létrehozása (ha nincs mentett állapot)
    if (gameState.map.length === 0) {
        createInitialMap();
        updateUI();
    }

    // Event listener-ek beállítása
    setupAllEventListeners();

    // Tutorial listener-ek
    setupTutorialListeners();

    // Háttérzene indítása
    startBackgroundMusic();

    // Tutorial indítása új játékosnak
    if (isNewPlayer()) {
        startTutorial();
    }

    // Játék ciklus indítása
    startGameLoop();
}

// Indítás
initGame();
