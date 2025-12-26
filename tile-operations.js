/**
 * @file tile-operations.js
 * @description Tile műveletek - keresés, szomszédság, ár számítás
 * 
 * FELELŐSSÉGI KÖR:
 * - Tile keresése koordináták alapján (findTile)
 * - Szomszédos tile ellenőrzése (isAdjacentToOwned)
 * - Terület ár kiszámítása (calculateTilePrice)
 * - Munkás elérhetőség ellenőrzése (hasAvailableWorker)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Építéssel/eladással kapcsolatos → building-actions.js
 * - Időzítőkkel kapcsolatos → timers.js
 * - Mentéssel/betöltéssel kapcsolatos → save-load.js
 * - Játék állapottal kapcsolatos → gameState.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState } from './gameState.js';

// Tile keresése koordináták alapján
export function findTile(x, y) {
    return gameState.map.find(t => t.x === x && t.y === y);
}

// Ellenőrzi, hogy a terület szomszédos-e egy megvásárolt területtel
export function isAdjacentToOwned(x, y) {
    // 8 irány: 4 él + 4 sarok (átlós szomszédok)
    const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],  // él menti szomszédok
        [-1, -1], [-1, 1], [1, -1], [1, 1]  // átlós szomszédok (sarkok)
    ];
    return directions.some(([dx, dy]) => {
        const adjacent = findTile(x + dx, y + dy);
        return adjacent && (adjacent.type === 'owned' || adjacent.type === 'tree' || adjacent.type === 'house' || adjacent.type === 'cornfield' || adjacent.type === 'emptycornfield' || adjacent.type === 'stonecutter');
    });
}

// Terület ár kiszámítása - 14 terület felett 5%-kal nő minden vásárlásnál
export function calculateTilePrice() {
    const basePrice = CONFIG.PURCHASE_PRICE;
    const threshold = 14;
    
    if (gameState.ownedTiles < threshold) {
        return basePrice;
    }
    
    // 14-től kezdve minden terület 5%-kal drágább az előzőnél
    const multiplier = Math.pow(1.05, gameState.ownedTiles - threshold + 1);
    return Math.floor(basePrice * multiplier);
}

// Ellenőrzi, hogy van-e szabad munkás
export function hasAvailableWorker() {
    return gameState.workers >= CONFIG.WORKER_COST_PER_ACTION;
}

