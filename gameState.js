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
    // Új bánya erőforrások
    stone: 0,
    iron: 0,
    coal: 0,
    diamond: 0,
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
    // Bánya műveletek
    buildingMines: new Map(),    // Épülő bányák
    miningMines: new Map(),      // Aktívan bányászó bányák
    // Ház építés
    buildingHouses: new Map(),   // Épülő házak
    // Munkás rendszer
    workers: 3,    // Szabad munkások (kezdő ház ad 3-at)
    maxWorkers: 3, // Összes munkás
    // Raktár rendszer
    warehouseCapacity: 20,      // Raktár kapacitás (alapértelmezett)
    warehouseLevel: 1           // Raktár szint
};

// Raktár kapacitás kiszámítása (összes tárgy)
export function getUsedStorageSpace() {
    return gameState.planks + gameState.corn + gameState.stone + gameState.iron + gameState.coal + gameState.diamond;
}

// Van-e hely a raktárban
export function hasStorageSpace(amount = 1) {
    return getUsedStorageSpace() + amount <= gameState.warehouseCapacity;
}

// Szabad hely a raktárban
export function getFreeStorageSpace() {
    return Math.max(0, gameState.warehouseCapacity - getUsedStorageSpace());
}

