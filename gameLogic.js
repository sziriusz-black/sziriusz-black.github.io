import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { playSound } from './audio.js';
import { getZoomLevel } from './camera.js';

// Térkép műveletek
export function findTile(x, y) {
    return gameState.map.find(t => t.x === x && t.y === y);
}

export function isAdjacentToOwned(x, y) {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    return directions.some(([dx, dy]) => {
        const adjacent = findTile(x + dx, y + dy);
        return adjacent && (adjacent.type === 'owned' || adjacent.type === 'tree' || adjacent.type === 'house' || adjacent.type === 'cornfield' || adjacent.type === 'emptycornfield');
    });
}

export function purchaseTile(x, y, updateUI, saveGameState) {
    if (gameState.money >= CONFIG.PURCHASE_PRICE && isAdjacentToOwned(x, y)) {
        gameState.map.push({ x, y, type: 'owned' });
        gameState.money -= CONFIG.PURCHASE_PRICE;
        gameState.ownedTiles++;
        updateUI();
        saveGameState();
        playSound('purchase');
    }
}

export function cutTree(x, y) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'tree' && !gameState.cuttingTrees.has(`${x},${y}`)) {
        gameState.cuttingTrees.set(`${x},${y}`, {
            timeLeft: CONFIG.TREE_CUT_TIME,
            startTime: Date.now()
        });
        playSound('cut');
    }
}

export function sellHouse(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'house' && !(x === 0 && y === 0)) {
        tile.type = 'owned';
        gameState.money += CONFIG.HOUSE_SELL_PRICE;
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
        updateUI();
        saveGameState();
        playSound('build');
    }
}

export function buildTree(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'owned' && gameState.money >= CONFIG.TREE_BUILD_PRICE) {
        tile.type = 'tree';
        gameState.money -= CONFIG.TREE_BUILD_PRICE;
        updateUI();
        saveGameState();
        playSound('plantTree');
    }
}

export function buildCornField(x, y, updateUI, saveGameState) {
    const tile = findTile(x, y);
    if (tile && tile.type === 'owned' && gameState.money >= CONFIG.CORNFIELD_BUILD_PRICE && !gameState.buildingCornfields.has(`${x},${y}`)) {
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
    if (tile && tile.type === 'emptycornfield' && !gameState.replantingCornfields.has(`${x},${y}`)) {
        gameState.replantingCornfields.set(`${x},${y}`, {
            timeLeft: CONFIG.CORNFIELD_REPLANT_TIME,
            startTime: Date.now()
        });
        playSound('plantTree');
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
            // Fa kivágva
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            if (tile && tile.type === 'tree') {
                tile.type = 'owned';
                gameState.planks++;
                updateUI();
                saveGameState();
                playSound('minecraftChop'); // Minecraft fa vágás hang
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
        const state = {
            money: gameState.money,
            planks: gameState.planks,
            corn: gameState.corn,
            ownedTiles: gameState.ownedTiles,
            map: gameState.map,
            camera: gameState.camera
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
            updateUI();
        }
    } catch (e) {
        console.error('Betöltés hiba:', e);
        createInitialMap();
    }
}

