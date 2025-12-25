/**
 * @file building-actions.js
 * @description Építési, eladási és fejlesztési műveletek
 * 
 * FELELŐSSÉGI KÖR:
 * - Terület vásárlása (purchaseTile)
 * - Fa műveletek (cutTree, buildTree, skipTreeCut)
 * - Ház műveletek (buildHouse, sellHouse, upgradeHouse)
 * - Kukoricaföld műveletek (buildCornField, harvestCornField, replantCornField, sellCornField)
 * - Kővágó műveletek (buildStoneCutter, upgradeStoneCutter, sellStoneCutter)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Tile kereséssel/szomszédsággal kapcsolatos → tile-operations.js
 * - Időzítőkkel kapcsolatos → timers.js
 * - Mentéssel/betöltéssel kapcsolatos → save-load.js
 * - UI frissítéssel kapcsolatos → ui.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { playSound } from './audio.js';
import { findTile, isAdjacentToOwned, calculateTilePrice, hasAvailableWorker } from './tile-operations.js';

// Terület vásárlása
export function purchaseTile(x, y, updateUI, saveGameState) {
    const price = calculateTilePrice();
    if (gameState.money >= price && isAdjacentToOwned(x, y)) {
        gameState.map.push({ x, y, type: 'owned' });
        gameState.money -= price;
        gameState.ownedTiles++;
        updateUI();
        saveGameState();
        playSound('purchase');
    }
}

// Fa kivágás indítása
export function cutTree(x, y, updateUI, saveGameStateFn) {
    const tile = findTile(x, y);
    // Ellenőrizzük, hogy van-e szabad munkás
    if (tile && tile.type === 'tree' && !gameState.cuttingTrees.has(`${x},${y}`) && gameState.workers >= CONFIG.WORKER_COST_PER_ACTION) {
        // Munkás foglalása
        gameState.workers -= CONFIG.WORKER_COST_PER_ACTION;
        gameState.cuttingTrees.set(`${x},${y}`, {
            timeLeft: CONFIG.TREE_CUT_TIME,
            startTime: Date.now()
        });
        playSound('cut');
        if (updateUI) updateUI();
        if (saveGameStateFn) saveGameStateFn();
    }
}

// Ház eladása
export function sellHouse(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'house' && !(x === 0 && y === 0)) {
        tile.type = 'owned';
        gameState.money += CONFIG.HOUSE_SELL_PRICE;
        // Munkások csökkentése (normál ház)
        gameState.maxWorkers -= CONFIG.NORMAL_HOUSE_WORKERS;
        // Ha több munkás van használatban mint a max, csökkentsük a szabadokat
        if (gameState.workers > gameState.maxWorkers) {
            gameState.workers = gameState.maxWorkers;
        }
        updateUI();
        saveGameState();
        playSound('sell');
    }
}

// Ház építése
export function buildHouse(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'owned' && gameState.money >= CONFIG.HOUSE_BUILD_PRICE) {
        tile.type = 'house';
        gameState.money -= CONFIG.HOUSE_BUILD_PRICE;
        // Munkások növelése (normál ház)
        gameState.maxWorkers += CONFIG.NORMAL_HOUSE_WORKERS;
        gameState.workers += CONFIG.NORMAL_HOUSE_WORKERS;
        updateUI();
        saveGameState();
        playSound('build');
    }
}

// Fa ültetése
export function buildTree(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    // Fa ültetéshez is kell munkás
    if (tile && tile.type === 'owned' && gameState.money >= CONFIG.TREE_BUILD_PRICE && gameState.workers >= CONFIG.WORKER_COST_PER_ACTION) {
        tile.type = 'tree';
        gameState.money -= CONFIG.TREE_BUILD_PRICE;
        // Fa ültetés azonnali, nem foglal munkást hosszú távra
        updateUI();
        saveGameState();
        playSound('plantTree');
    }
}

// Kővágó építése
export function buildStoneCutter(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'owned' && gameState.money >= CONFIG.STONECUTTER_BUILD_PRICE) {
        tile.type = 'stonecutter';
        gameState.money -= CONFIG.STONECUTTER_BUILD_PRICE;
        updateUI();
        saveGameState();
        playSound('build');
    }
}

// Kukoricaföld építése
export function buildCornField(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'owned' && gameState.money >= CONFIG.CORNFIELD_BUILD_PRICE && !gameState.buildingCornfields.has(`${x},${y}`) && gameState.workers >= CONFIG.WORKER_COST_PER_ACTION) {
        // Munkás foglalása
        gameState.workers -= CONFIG.WORKER_COST_PER_ACTION;
        // Azonnal változtassuk üres kukorica földre, hogy látható legyen
        tile.type = 'emptycornfield';
        gameState.buildingCornfields.set(`${x},${y}`, {
            timeLeft: CONFIG.CORNFIELD_BUILD_TIME,
            startTime: Date.now()
        });
        gameState.money -= CONFIG.CORNFIELD_BUILD_PRICE;
        updateUI();
        saveGameState();
        playSound('build');
    }
}

// Kukorica learatása
export function harvestCornField(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'cornfield') {
        tile.type = 'emptycornfield';
        gameState.corn++;
        updateUI();
        saveGameState();
        playSound('sell');
    }
}

// Kukorica újraültetése
export function replantCornField(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'emptycornfield' && !gameState.replantingCornfields.has(`${x},${y}`) && gameState.workers >= CONFIG.WORKER_COST_PER_ACTION) {
        // Munkás foglalása
        gameState.workers -= CONFIG.WORKER_COST_PER_ACTION;
        gameState.replantingCornfields.set(`${x},${y}`, {
            timeLeft: CONFIG.CORNFIELD_REPLANT_TIME,
            startTime: Date.now()
        });
        playSound('plantTree');
        if (updateUI) updateUI();
        if (saveGameState) saveGameState();
    }
}

// Kukoricaföld eladása
export function sellCornField(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && (tile.type === 'cornfield' || tile.type === 'emptycornfield')) {
        tile.type = 'owned';
        gameState.money += CONFIG.CORNFIELD_SELL_PRICE;
        updateUI();
        saveGameState();
        playSound('sell');
    }
}

// Ház fejlesztése - +1 munkás szintenként
export function upgradeHouse(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'house') {
        const currentLevel = tile.level || 1;
        const upgradePrice = CONFIG.UPGRADE_BASE_PRICE + (currentLevel - 1) * CONFIG.UPGRADE_INCREMENT;
        
        if (gameState.money >= upgradePrice) {
            tile.level = currentLevel + 1;
            gameState.money -= upgradePrice;
            // +1 munkás a fejlesztésért
            gameState.maxWorkers += 1;
            gameState.workers += 1;
            updateUI();
            saveGameState();
            playSound('build');
        }
    }
}

// Kővágó fejlesztése
export function upgradeStoneCutter(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'stonecutter') {
        const currentLevel = tile.level || 1;
        const upgradePrice = CONFIG.UPGRADE_BASE_PRICE + (currentLevel - 1) * CONFIG.UPGRADE_INCREMENT;
        
        if (gameState.money >= upgradePrice) {
            tile.level = currentLevel + 1;
            gameState.money -= upgradePrice;
            updateUI();
            saveGameState();
            playSound('build');
        }
    }
}

// Kővágó eladása
export function sellStoneCutter(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'stonecutter') {
        tile.type = 'owned';
        gameState.money += CONFIG.STONECUTTER_SELL_PRICE;
        updateUI();
        saveGameState();
        playSound('sell');
    }
}

// Fa kivágás átugrása (skip)
export function skipTreeCut(x, y, updateUI, saveGameState) {
    const key = `${x},${y}`;
    if (gameState.cuttingTrees.has(key)) {
        // Azonnal befejezzük a fa kivágását
        const tile = findTile(x, y);
        if (tile && tile.type === 'tree') {
            tile.type = 'owned';
            gameState.planks++;
            if (updateUI) updateUI();
            if (saveGameState) saveGameState();
            playSound('minecraftChop');
        }
        gameState.cuttingTrees.delete(key);
    }
}

