/**
 * @file gameState.js
 * @description Játékállapot - központi állapot objektum
 * 
 * FELELŐSSÉGI KÖR:
 * - Játék állapot tárolása (money, planks, corn, workers, stb.)
 * - Térkép adatok (map, ownedTiles)
 * - Kamera állapot (camera)
 * - Folyamatban lévő műveletek (cuttingTrees, buildingCornfields, stb.)
 * - Aktív buborék állapot (activeBubble)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ez a fájl CSAK az állapot objektumot tartalmazza!
 * NE írj ide logikát! Az állapot módosítása:
 * - building-actions.js - építés, eladás műveletekhez
 * - timers.js - időzített műveletekhez
 * - save-load.js - mentés/betöltéshez
 */

// Játékállapot
export const gameState = {
    money: 10,
    planks: 0,
    corn: 0,
    ownedTiles: 0,
    map: [],
    camera: {
        x: 0,
        y: 0,
        zoom: 5
    },
    activeBubble: null,
    cuttingTrees: new Map(),
    buildingCornfields: new Map(),
    replantingCornfields: new Map(),
    // Munkás rendszer
    workers: 3,    // Szabad munkások (kezdő ház ad 3-at)
    maxWorkers: 3  // Összes munkás
};

