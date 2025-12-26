/**
 * @file gameLogic.js
 * @description Játék logika - központi újra-export modul (backward compatibility)
 * 
 * FELELŐSSÉGI KÖR:
 * - Összes játéklogikai függvény újra-exportálása egy helyről
 * - Visszafelé kompatibilitás biztosítása régebbi importokhoz
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ez a fájl CSAK újra-exportálásra szolgál!
 * NE írj ide új logikát! Használd helyette:
 * - tile-operations.js - tile műveletek
 * - building-actions.js - építés, eladás, fejlesztés
 * - timers.js - időzített műveletek
 * - save-load.js - mentés és betöltés
 */

// Tile műveletek
export { findTile, isAdjacentToOwned, calculateTilePrice, hasAvailableWorker } from './tile-operations.js';

// Építési műveletek
export { 
    purchaseTile, 
    cutTree, 
    sellHouse, 
    buildHouse, 
    buildTree, 
    buildStoneCutter, 
    buildCornField, 
    harvestCornField, 
    replantCornField, 
    sellCornField, 
    upgradeHouse, 
    upgradeStoneCutter, 
    sellStoneCutter, 
    skipTreeCut 
} from './building-actions.js';

// Időzítők
export { updateTimers } from './timers.js';

// Mentés/betöltés
export { saveGameState, loadGameState } from './save-load.js';
