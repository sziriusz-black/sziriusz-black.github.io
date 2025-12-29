/**
 * @file initialization.js
 * @description Játék inicializálása - kezdő állapot beállítása
 * 
 * FELELŐSSÉGI KÖR:
 * - Kezdő térkép létrehozása (createInitialMap)
 * - Kezdő értékek beállítása (pénz, munkások, kamera)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Játék állapottal kapcsolatos → gameState.js
 * - Konfigurációval kapcsolatos → config.js
 * - Mentés/betöltéssel kapcsolatos → save-load.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { getZoomLevel } from './camera.js';

// Kezdő térkép létrehozása
export function createInitialMap() {
    // 5 terület: 1 ház, 1 raktár, 3 üres
    gameState.map = [
        { x: 0, y: 0, type: 'house' },
        { x: 1, y: 0, type: 'owned' },
        { x: 2, y: 0, type: 'owned' },
        { x: 0, y: 1, type: 'owned' },
        { x: 1, y: 1, type: 'warehouse', level: 1 }  // Kezdő raktár
    ];
    gameState.ownedTiles = 5;
    // Kezdő ház munkásai (3/3)
    gameState.workers = CONFIG.STARTER_HOUSE_WORKERS;
    gameState.maxWorkers = CONFIG.STARTER_HOUSE_WORKERS;
    // Kezdő raktár kapacitás
    gameState.warehouseCapacity = CONFIG.WAREHOUSE_BASE_CAPACITY;
    gameState.warehouseLevel = 1;
    // Kezdő kamera pozíció a középpontra
    gameState.camera.x = 0;
    gameState.camera.y = 0;
    // Kezdő zoom: 1-es level (maximális zoom, ház nagy)
    gameState.camera.zoomLevel = 1;
    gameState.camera.zoom = getZoomLevel(1);
}

