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
import { gameState, hasStorageSpace } from './gameState.js';
import { playSound } from './audio.js';
import { findTile, isAdjacentToOwned, calculateTilePrice, hasAvailableWorker } from './tile-operations.js';
import { showError } from './ui.js';

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

// Ház építése (3 munkás, 2 perc)
export function buildHouse(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    const key = `${x},${y}`;
    
    if (tile && tile.type === 'owned' && 
        gameState.money >= CONFIG.HOUSE_BUILD_PRICE && 
        gameState.workers >= CONFIG.HOUSE_BUILD_WORKERS &&
        !gameState.buildingHouses.has(key)) {
        
        // Munkások foglalása
        gameState.workers -= CONFIG.HOUSE_BUILD_WORKERS;
        gameState.money -= CONFIG.HOUSE_BUILD_PRICE;
        
        // Tile típus változtatása épülő házra
        tile.type = 'buildinghouse';
        
        // Építési folyamat indítása
        gameState.buildingHouses.set(key, {
            timeLeft: CONFIG.HOUSE_BUILD_TIME,
            startTime: Date.now()
        });
        
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
        // Raktár kapacitás ellenőrzés
        if (!hasStorageSpace(1)) {
            showError('⚠️ A raktár megtelt! Adj el valamit először.');
            return;
        }
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

// === BÁNYA MŰVELETEK ===

// Bánya építése (3 munkás, 10 perc)
export function buildMine(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'owned' && 
        gameState.money >= CONFIG.MINE_BUILD_PRICE && 
        gameState.workers >= CONFIG.MINE_BUILD_WORKERS &&
        !gameState.buildingMines.has(`${x},${y}`)) {
        
        // Munkások foglalása
        gameState.workers -= CONFIG.MINE_BUILD_WORKERS;
        gameState.money -= CONFIG.MINE_BUILD_PRICE;
        
        // Tile típus változtatása épülő bányára
        tile.type = 'buildingmine';
        
        // Építési folyamat indítása
        gameState.buildingMines.set(`${x},${y}`, {
            timeLeft: CONFIG.MINE_BUILD_TIME,
            startTime: Date.now()
        });
        
        updateUI();
        saveGameState();
        playSound('build');
    }
}

// Bányászás indítása (2 munkás, 5 perc)
export function startMining(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    const key = `${x},${y}`;
    
    if (tile && tile.type === 'mine' && 
        gameState.workers >= CONFIG.MINE_MINING_WORKERS &&
        !gameState.miningMines.has(key)) {
        
        // Munkások foglalása
        gameState.workers -= CONFIG.MINE_MINING_WORKERS;
        
        // Bányászási folyamat indítása
        gameState.miningMines.set(key, {
            timeLeft: CONFIG.MINE_MINING_TIME,
            startTime: Date.now()
        });
        
        updateUI();
        saveGameState();
        playSound('cut');
    }
}

// Bánya eladása
export function sellMine(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'mine') {
        tile.type = 'owned';
        gameState.money += CONFIG.MINE_SELL_PRICE;
        updateUI();
        saveGameState();
        playSound('sell');
    }
}

// Bányászat eredményének kiszámítása esély alapján (fejlesztés növeli az esélyeket)
export function calculateMiningResult(mineLevel = 1) {
    const roll = Math.random() * 100;
    
    // Fejlesztés bónusz: +1% vas és szén szintenként (gyémánt és kő fix!)
    const levelBonus = (mineLevel - 1) * 1;
    
    // Fix esélyek (nem változnak)
    const diamondChance = CONFIG.MINE_DIAMOND_CHANCE; // 1% fix
    
    // Növekvő esélyek fejlesztéssel
    const coalChance = CONFIG.MINE_COAL_CHANCE + levelBonus;    // 4% + bónusz
    const ironChance = CONFIG.MINE_IRON_CHANCE + levelBonus;    // 5% + bónusz
    
    // Kő esélye = ami marad (100% - többi), de minimum 0%
    const stoneChance = Math.max(0, 100 - diamondChance - coalChance - ironChance);
    
    if (roll < diamondChance) {
        return { type: 'diamond', name: '💎 Gyémánt' };
    } else if (roll < diamondChance + coalChance) {
        return { type: 'coal', name: '⚫ Szén' };
    } else if (roll < diamondChance + coalChance + ironChance) {
        return { type: 'iron', name: '🔩 Vas' };
    } else {
        return { type: 'stone', name: '🪨 Kő' };
    }
}

// Bánya fejlesztése - +0.5% esély minden ritka nyersanyagra
export function upgradeMine(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'mine') {
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

// === RAKTÁR MŰVELETEK ===

// Raktár fejlesztése - +10 hely szintenként
export function upgradeWarehouse(updateUI, saveGameState) {
    const currentLevel = gameState.warehouseLevel || 1;
    const upgradePrice = CONFIG.WAREHOUSE_UPGRADE_PRICE * currentLevel;
    
    if (gameState.money >= upgradePrice) {
        gameState.warehouseLevel = currentLevel + 1;
        gameState.warehouseCapacity += CONFIG.WAREHOUSE_UPGRADE_CAPACITY;
        gameState.money -= upgradePrice;
        
        // Frissítsük a tile szintjét is
        const warehouseTile = gameState.map.find(t => t.type === 'warehouse');
        if (warehouseTile) {
            warehouseTile.level = gameState.warehouseLevel;
        }
        
        updateUI();
        saveGameState();
        playSound('build');
    }
}

