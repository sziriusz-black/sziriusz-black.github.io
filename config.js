/**
 * @file config.js
 * @description Játék konfiguráció - konstansok és beállítások
 * 
 * FELELŐSSÉGI KÖR:
 * - Zoom beállítások (MAX_ZOOM, MIN_ZOOM, ZOOM_STEP)
 * - Tile méret (TILE_SIZE)
 * - Árak (PURCHASE_PRICE, BUILD_PRICE, SELL_PRICE, stb.)
 * - Időzítések (TREE_CUT_TIME, CORNFIELD_BUILD_TIME, stb.)
 * - Munkás rendszer (STARTER_HOUSE_WORKERS, NORMAL_HOUSE_WORKERS, stb.)
 * - Upgrade árak (UPGRADE_BASE_PRICE, UPGRADE_INCREMENT)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ez a fájl CSAK konstansokat és konfigurációs értékeket tartalmaz!
 * NE írj ide logikát! A logika a megfelelő modulba tartozik.
 */

// Játék konfiguráció
export const CONFIG = {
    MAX_ZOOM: 20,
    MIN_ZOOM: 1,
    ZOOM_STEP: 0.1,
    TILE_SIZE: 32,
    MARGIN: 10,
    TREE_CUT_TIME: 30,
    PURCHASE_PRICE: 100,
    HOUSE_BUILD_PRICE: 50,
    TREE_BUILD_PRICE: 10,
    HOUSE_SELL_PRICE: 25,
    PLANK_SELL_PRICE: 12,
    SKIP_TIME_THRESHOLD: 30, // Ha a hátralévő idő kisebb ennél, megjelenik a skip gomb
    CORNFIELD_BUILD_PRICE: 30,
    CORNFIELD_BUILD_TIME: 60,
    CORNFIELD_SELL_PRICE: 10,
    CORNFIELD_REPLANT_TIME: 20,
    CORN_SELL_PRICE: 5,
    STONECUTTER_BUILD_PRICE: 50,
    STONECUTTER_SELL_PRICE: 25,
    // Upgrade árak (alapár + szint * növekmény)
    UPGRADE_BASE_PRICE: 100,        // Alapár (első upgrade)
    UPGRADE_INCREMENT: 50,          // Növekmény szintenként
    // Munkás rendszer
    STARTER_HOUSE_WORKERS: 3,  // Kezdő ház munkásai
    NORMAL_HOUSE_WORKERS: 2,   // Normál ház munkásai
    WORKER_COST_PER_ACTION: 1  // Műveletenkénti munkás költség
};

// Térkép típusok
export const TileType = {
    EMPTY: 'empty',
    TREE: 'tree',
    HOUSE: 'house',
    OWNED: 'owned',
    CORNFIELD: 'cornfield',
    EMPTY_CORNFIELD: 'emptycornfield',
    STONECUTTER: 'stonecutter'
};

