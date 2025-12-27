/**
 * @file timers.js
 * @description Időzített műveletek kezelése - fa kivágás, kukorica építés/újraültetés
 * 
 * FELELŐSSÉGI KÖR:
 * - Fa kivágás időzítő (cuttingTrees)
 * - Kukoricaföld építés időzítő (buildingCornfields)
 * - Kukorica újraültetés időzítő (replantingCornfields)
 * - Munkás visszaadása művelet befejezésekor
 * - Buborék tartalom frissítése időzítő alatt
 * - updateTimers() fő függvény a game loop-hoz
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Tile kereséssel kapcsolatos → tile-operations.js
 * - Építéssel/eladással kapcsolatos → building-actions.js
 * - Mentéssel/betöltéssel kapcsolatos → save-load.js
 * - Hangokkal kapcsolatos → audio.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState, hasStorageSpace } from './gameState.js';
import { playSound } from './audio.js';
import { findTile } from './tile-operations.js';
import { onTutorialEvent } from './tutorial.js';
import { calculateMiningResult } from './building-actions.js';
import { showError } from './ui.js';

// Timer frissítés - fa kivágás, kukorica építés/újraültetés
export function updateTimers(updateUI, saveGameState, closeBubble) {
    const now = Date.now();
    const toRemove = [];

    // Fa kivágás időzítés
    gameState.cuttingTrees.forEach((data, key) => {
        const elapsed = (now - data.startTime) / 1000;
        const timeLeft = Math.max(0, CONFIG.TREE_CUT_TIME - elapsed);
        
        if (timeLeft <= 0) {
            // Fa kivágva - munkás visszaadása
            gameState.workers += CONFIG.WORKER_COST_PER_ACTION;
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            if (tile && tile.type === 'tree') {
                // Raktár kapacitás ellenőrzés
                if (hasStorageSpace(1)) {
                    tile.type = 'owned';
                    gameState.planks++;
                    updateUI();
                    saveGameState();
                    playSound('minecraftChop'); // Minecraft fa vágás hang
                    onTutorialEvent('tree_cut', { x, y });
                } else {
                    // Raktár tele - deszka elvész, de fa kivágva
                    tile.type = 'owned';
                    showError('⚠️ A raktár megtelt! A deszka elveszett.');
                    updateUI();
                    saveGameState();
                }
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
    
    // === BÁNYA IDŐZÍTŐK ===
    
    // Bánya építés időzítés (10 perc)
    const mineBuildsToRemove = [];
    gameState.buildingMines.forEach((data, key) => {
        const elapsed = (now - data.startTime) / 1000;
        const timeLeft = Math.max(0, CONFIG.MINE_BUILD_TIME - elapsed);
        
        if (timeLeft <= 0) {
            // Bánya kész - munkások visszaadása
            gameState.workers += CONFIG.MINE_BUILD_WORKERS;
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            if (tile && tile.type === 'buildingmine') {
                tile.type = 'mine';
                tile.level = 1;
                updateUI();
                saveGameState();
                playSound('complete');
            }
            mineBuildsToRemove.push(key);
            
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
                    const minutes = Math.floor(data.timeLeft / 60);
                    const seconds = data.timeLeft % 60;
                    content.innerHTML = `
                        <div>⛏️ Bánya építése folyamatban...</div>
                        <div>Hátralévő idő: ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    `;
                }
            }
        }
    });
    mineBuildsToRemove.forEach(key => gameState.buildingMines.delete(key));
    
    // Bányászás időzítés (5 perc)
    const miningToRemove = [];
    gameState.miningMines.forEach((data, key) => {
        const elapsed = (now - data.startTime) / 1000;
        const timeLeft = Math.max(0, CONFIG.MINE_MINING_TIME - elapsed);
        
        if (timeLeft <= 0) {
            // Bányászás kész - munkások visszaadása
            gameState.workers += CONFIG.MINE_MINING_WORKERS;
            const [x, y] = key.split(',').map(Number);
            const tile = findTile(x, y);
            
            if (tile && tile.type === 'mine') {
                // Nyersanyag kiszámítása esély alapján (fejlesztés figyelembevételével)
                const mineLevel = tile.level || 1;
                const result = calculateMiningResult(mineLevel);
                
                // Raktár kapacitás ellenőrzés
                if (hasStorageSpace(1)) {
                    // Nyersanyag hozzáadása
                    switch (result.type) {
                        case 'diamond':
                            gameState.diamond++;
                            break;
                        case 'coal':
                            gameState.coal++;
                            break;
                        case 'iron':
                            gameState.iron++;
                            break;
                        case 'stone':
                            gameState.stone++;
                            break;
                    }
                    
                    // Értesítés a játékosnak (tároljuk az utolsó eredményt)
                    tile.lastMiningResult = result;
                    playSound('complete');
                } else {
                    // Raktár tele - nyersanyag elvész
                    showError(`⚠️ A raktár megtelt! ${result.name} elveszett.`);
                    tile.lastMiningResult = { type: 'lost', name: '❌ Elveszett (tele raktár)' };
                }
                
                updateUI();
                saveGameState();
            }
            miningToRemove.push(key);
            
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
                    const minutes = Math.floor(data.timeLeft / 60);
                    const seconds = data.timeLeft % 60;
                    content.innerHTML = `
                        <div>⛏️ Bányászás folyamatban...</div>
                        <div>Hátralévő idő: ${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    `;
                }
            }
        }
    });
    miningToRemove.forEach(key => gameState.miningMines.delete(key));
}

