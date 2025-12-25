import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { playSound } from './audio.js';
import { getZoomLevel } from './camera.js';
import { onTutorialEvent } from './tutorial.js';

// Térkép műveletek
export function findTile(x, y) {
    return gameState.map.find(t => t.x === x && t.y === y);
}

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

// Terület ár kiszámítása - 14 terület felett 25%-kal nő minden vásárlásnál
export function calculateTilePrice() {
    const basePrice = CONFIG.PURCHASE_PRICE;
    const threshold = 14;
    
    if (gameState.ownedTiles < threshold) {
        return basePrice;
    }
    
    // 14-től kezdve minden terület 25%-kal drágább az előzőnél
    const multiplier = Math.pow(1.25, gameState.ownedTiles - threshold + 1);
    return Math.floor(basePrice * multiplier);
}

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

// Ellenőrzi, hogy van-e szabad munkás
export function hasAvailableWorker() {
    return gameState.workers >= CONFIG.WORKER_COST_PER_ACTION;
}

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

// Timer frissítés
export function updateTimers(updateUI, saveGameState, closeBubble) {
    const now = Date.now();
    const toRemove = [];

    gameState.cuttingTrees.forEach((data, key) => {
        const elapsed = (now - data.startTime) / 1000;
        const timeLeft = Math.max(0, CONFIG.TREE_CUT_TIME - elapsed);
        
        if (timeLeft <= 0) {
            // Fa kivágva - munkás visszaadása
            gameState.workers += CONFIG.WORKER_COST_PER_ACTION;
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            if (tile && tile.type === 'tree') {
                tile.type = 'owned';
                gameState.planks++;
                updateUI();
                saveGameState();
                playSound('minecraftChop'); // Minecraft fa vágás hang
                onTutorialEvent('tree_cut', { x, y });
            }
            toRemove.push(key);
            
            // Buborék bezárása ha a fa kivágva lett
            if (gameState.activeBubble) {
                const [bubbleX, bubbleY] = key.split(',').map(Number);
                if (gameState.activeBubble.x === bubbleX && gameState.activeBubble.y === bubbleY) {
                    closeBubble();
                }
            }
        } else {
            data.timeLeft = Math.ceil(timeLeft);
            
            // Buborék frissítése ha aktív
            if (gameState.activeBubble) {
                const [x, y] = key.split(',').map(Number);
                if (gameState.activeBubble.x === x && gameState.activeBubble.y === y) {
                    const content = document.getElementById('bubbleContent');
                    content.innerHTML = `
                        <div>Fa kivágása folyamatban...</div>
                        <div>Hátralévő idő: ${data.timeLeft}s</div>
                    `;
                }
            }
        }
    });

    toRemove.forEach(key => gameState.cuttingTrees.delete(key));
    
    // Kukorica föld építés időzítés
    const cornToRemove = [];
    gameState.buildingCornfields.forEach((data, key) => {
        const elapsed = (now - data.startTime) / 1000;
        const timeLeft = Math.max(0, CONFIG.CORNFIELD_BUILD_TIME - elapsed);
        
        if (timeLeft <= 0) {
            // Kukorica föld kész - munkás visszaadása
            gameState.workers += CONFIG.WORKER_COST_PER_ACTION;
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            if (tile && tile.type === 'emptycornfield') {
                tile.type = 'cornfield';
                updateUI();
                saveGameState();
                playSound('complete');
            }
            cornToRemove.push(key);
            
            if (gameState.activeBubble) {
                const [bubbleX, bubbleY] = key.split(',').map(Number);
                if (gameState.activeBubble.x === bubbleX && gameState.activeBubble.y === bubbleY) {
                    closeBubble();
                }
            }
        } else {
            data.timeLeft = Math.ceil(timeLeft);
            
            if (gameState.activeBubble) {
                const [x, y] = key.split(',').map(Number);
                if (gameState.activeBubble.x === x && gameState.activeBubble.y === y) {
                    const content = document.getElementById('bubbleContent');
                    content.innerHTML = `
                        <div>Kukorica föld építése folyamatban...</div>
                        <div>Hátralévő idő: ${data.timeLeft}s</div>
                    `;
                }
            }
        }
    });
    cornToRemove.forEach(key => gameState.buildingCornfields.delete(key));
    
    // Kukorica újraültetés időzítés
    const replantToRemove = [];
    gameState.replantingCornfields.forEach((data, key) => {
        const elapsed = (now - data.startTime) / 1000;
        const timeLeft = Math.max(0, CONFIG.CORNFIELD_REPLANT_TIME - elapsed);
        
        if (timeLeft <= 0) {
            // Kukorica újraültetve - munkás visszaadása
            gameState.workers += CONFIG.WORKER_COST_PER_ACTION;
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            if (tile && tile.type === 'emptycornfield') {
                tile.type = 'cornfield';
                updateUI();
                saveGameState();
                playSound('complete');
            }
            replantToRemove.push(key);
            
            if (gameState.activeBubble) {
                const [bubbleX, bubbleY] = key.split(',').map(Number);
                if (gameState.activeBubble.x === bubbleX && gameState.activeBubble.y === bubbleY) {
                    closeBubble();
                }
            }
        } else {
            data.timeLeft = Math.ceil(timeLeft);
            
            if (gameState.activeBubble) {
                const [x, y] = key.split(',').map(Number);
                if (gameState.activeBubble.x === x && gameState.activeBubble.y === y) {
                    const content = document.getElementById('bubbleContent');
                    content.innerHTML = `
                        <div>Kukorica újraültetése folyamatban...</div>
                        <div>Hátralévő idő: ${data.timeLeft}s</div>
                    `;
                }
            }
        }
    });
    replantToRemove.forEach(key => gameState.replantingCornfields.delete(key));
}

// Local storage
export function saveGameState() {
    try {
        // Előző mentés beolvasása a tutorialCompleted flag megőrzéséhez
        const previousSave = localStorage.getItem('skyblockGame');
        let tutorialCompleted = false;
        if (previousSave) {
            try {
                const prev = JSON.parse(previousSave);
                tutorialCompleted = prev.tutorialCompleted || false;
            } catch (e) {
                console.error('Tutorial állapot olvasási hiba:', e);
            }
        }
        
        const state = {
            money: gameState.money,
            planks: gameState.planks,
            corn: gameState.corn,
            ownedTiles: gameState.ownedTiles,
            map: gameState.map,
            camera: gameState.camera,
            // Folyamatban lévő műveletek mentése
            cuttingTrees: Object.fromEntries(gameState.cuttingTrees),
            buildingCornfields: Object.fromEntries(gameState.buildingCornfields),
            replantingCornfields: Object.fromEntries(gameState.replantingCornfields),
            // Munkás rendszer
            workers: gameState.workers,
            maxWorkers: gameState.maxWorkers,
            // Tutorial állapot megőrzése
            tutorialCompleted: tutorialCompleted
        };
        localStorage.setItem('skyblockGame', JSON.stringify(state));
    } catch (e) {
        console.error('Mentés hiba:', e);
    }
}

export function loadGameState(createInitialMap, updateUI) {
    try {
        const saved = localStorage.getItem('skyblockGame');
        if (saved) {
            const state = JSON.parse(saved);
            gameState.money = state.money || 10;
            gameState.planks = state.planks || 0;
            gameState.corn = state.corn || 0;
            gameState.ownedTiles = state.ownedTiles || 0;
            gameState.map = state.map || [];
            if (state.camera) {
                gameState.camera.x = state.camera.x || 0;
                gameState.camera.y = state.camera.y || 0;
                gameState.camera.zoomLevel = state.camera.zoomLevel || 1;
                gameState.camera.zoom = getZoomLevel(gameState.camera.zoomLevel);
            }
            // Folyamatban lévő műveletek visszaállítása
            if (state.cuttingTrees) {
                gameState.cuttingTrees = new Map(Object.entries(state.cuttingTrees));
            }
            if (state.buildingCornfields) {
                gameState.buildingCornfields = new Map(Object.entries(state.buildingCornfields));
            }
            if (state.replantingCornfields) {
                gameState.replantingCornfields = new Map(Object.entries(state.replantingCornfields));
            }
            // Munkás rendszer visszaállítása
            if (state.workers !== undefined) {
                gameState.workers = state.workers;
            }
            if (state.maxWorkers !== undefined) {
                gameState.maxWorkers = state.maxWorkers;
            }
            if (updateUI) updateUI();
        }
    } catch (e) {
        console.error('Betöltés hiba:', e);
        createInitialMap();
    }
}

