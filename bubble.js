/**
 * @file bubble.js
 * @description Buborék (bubble) kezelés - tile kattintás utáni interakciós menü
 * 
 * FELELŐSSÉGI KÖR:
 * - Buborék tartalom generálása tile típus alapján (generateBubbleContent)
 * - Buborék megjelenítése és pozícionálása (showBubble, updateBubblePosition)
 * - Buborék bezárása (closeBubble)
 * - Buborék gombok eseménykezelése (setupBubbleButtons)
 * - Aktív buborék frissítése időzített műveleteknél (refreshActiveBubble)
 * - Akció kezelés a gombokra kattintáskor (handleAction)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Modal ablakokkal kapcsolatos → modals.js
 * - UI frissítéssel kapcsolatos → ui.js
 * - Tile műveletekkel kapcsolatos → tile-operations.js
 * - Építéssel/eladással kapcsolatos → building-actions.js
 * - Időzítőkkel kapcsolatos → timers.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { findTile, isAdjacentToOwned, calculateTilePrice, hasAvailableWorker } from './tile-operations.js';
import { purchaseTile, cutTree, sellHouse, buildHouse, buildTree, buildStoneCutter, buildCornField, harvestCornField, replantCornField, sellCornField, sellStoneCutter } from './building-actions.js';
import { saveGameState } from './save-load.js';
import { onTutorialEvent } from './tutorial.js';
import { showError, updateUI } from './ui.js';
import { openUpgradeModal } from './modals.js';

let canvas = null;

export function initBubble(canvasElement) {
    canvas = canvasElement;
}

export function generateBubbleContent(tileX, tileY, tile) {
    const bubble = document.getElementById('bubble');
    const content = document.getElementById('bubbleContent');
    content.innerHTML = '';
    
    // Alapértelmezett: nagy buborék
    bubble.classList.add('large');

    if (!tile) {
        // Meg nem vásárolt terület
        if (isAdjacentToOwned(tileX, tileY)) {
            const price = calculateTilePrice();
            const canAfford = gameState.money >= price;
            
            // Kis buborék terület vásárlásnál
            bubble.classList.remove('large');
            
            content.innerHTML = `
                <div style="margin-bottom: 10px;">Terület vásárlása</div>
                <div style="margin-bottom: 10px;">Ár: ${price} pénz</div>
                <button class="bubble-button" ${!canAfford ? 'disabled' : ''} data-action="purchase" data-x="${tileX}" data-y="${tileY}">
                    Vásárlás
                </button>
            `;
            
            return { showError: !canAfford ? `Még ${price - gameState.money} pénz kell!` : null };
        } else {
            content.innerHTML = '<div>Csak a megvásárolt terület mellé lehet vásárolni!</div>';
        }
    } else if (tile.type === 'tree') {
        // Fa kivágás
        const isCutting = gameState.cuttingTrees.has(`${tileX},${tileY}`);
        if (isCutting) {
            const data = gameState.cuttingTrees.get(`${tileX},${tileY}`);
            const now = Date.now();
            const elapsed = (now - data.startTime) / 1000;
            const timeLeft = Math.max(0, CONFIG.TREE_CUT_TIME - elapsed);
            content.innerHTML = `
                <div>Fa kivágása folyamatban...</div>
                <div>Hátralévő idő: ${Math.ceil(timeLeft)}s</div>
            `;
        } else {
            const canCut = hasAvailableWorker();
            content.innerHTML = `
                <button class="bubble-button" ${!canCut ? 'disabled' : ''} data-action="cut" data-x="${tileX}" data-y="${tileY}">
                    Kivágás ${!canCut ? '(nincs munkás)' : ''}
                </button>
            `;
        }
    } else if (tile.type === 'house') {
        // Ház - upgrade és eladás
        const houseLevel = tile.level || 1;
        
        if (tileX === 0 && tileY === 0) {
            // Kezdő ház - upgrade lehet, de eladni nem
            content.innerHTML = `
                <div style="margin-bottom: 10px;">Kezdő ház (Szint ${houseLevel})</div>
                <div style="margin-bottom: 5px;">Munkások: +${houseLevel === 1 ? CONFIG.STARTER_HOUSE_WORKERS : CONFIG.STARTER_HOUSE_WORKERS + (houseLevel - 1)}</div>
                <button class="bubble-button" data-action="openUpgrade" data-x="${tileX}" data-y="${tileY}" data-type="house">
                    Upgrade
                </button>
            `;
        } else {
            content.innerHTML = `
                <div style="margin-bottom: 10px;">Ház (Szint ${houseLevel})</div>
                <div style="margin-bottom: 5px;">Munkások: +${CONFIG.NORMAL_HOUSE_WORKERS + (houseLevel - 1)}</div>
                <button class="bubble-button" data-action="openUpgrade" data-x="${tileX}" data-y="${tileY}" data-type="house">
                    Upgrade
                </button>
                <button class="bubble-button" data-action="sellHouse" data-x="${tileX}" data-y="${tileY}">
                    Eladás (${CONFIG.HOUSE_SELL_PRICE} pénz)
                </button>
            `;
        }
    } else if (tile.type === 'owned') {
        // Üres terület - építés
        // Kis buborék építésnél
        bubble.classList.remove('large');
        
        const noWorker = !hasAvailableWorker();
        const workerWarning = noWorker ? ' (nincs munkás)' : '';
        content.innerHTML = `
            <div style="margin-bottom: 10px;">Építés</div>
            <button class="bubble-button" ${gameState.money < CONFIG.HOUSE_BUILD_PRICE ? 'disabled' : ''} data-action="buildHouse" data-x="${tileX}" data-y="${tileY}">
                Ház építése (${CONFIG.HOUSE_BUILD_PRICE} pénz)
            </button>
            <button class="bubble-button" ${gameState.money < CONFIG.TREE_BUILD_PRICE || noWorker ? 'disabled' : ''} data-action="buildTree" data-x="${tileX}" data-y="${tileY}">
                Fa ültetése (${CONFIG.TREE_BUILD_PRICE} pénz)${workerWarning}
            </button>
            <button class="bubble-button" ${gameState.money < CONFIG.CORNFIELD_BUILD_PRICE || noWorker ? 'disabled' : ''} data-action="buildCornField" data-x="${tileX}" data-y="${tileY}">
                Kukorica föld (${CONFIG.CORNFIELD_BUILD_PRICE} pénz)${workerWarning}
            </button>
            <button class="bubble-button" ${gameState.money < CONFIG.STONECUTTER_BUILD_PRICE ? 'disabled' : ''} data-action="buildStoneCutter" data-x="${tileX}" data-y="${tileY}">
                Kővágó (${CONFIG.STONECUTTER_BUILD_PRICE} pénz)
            </button>
        `;
        
        if (gameState.money < CONFIG.HOUSE_BUILD_PRICE && gameState.money < CONFIG.TREE_BUILD_PRICE && gameState.money < CONFIG.CORNFIELD_BUILD_PRICE && gameState.money < CONFIG.STONECUTTER_BUILD_PRICE) {
            const needed = Math.min(CONFIG.HOUSE_BUILD_PRICE, CONFIG.TREE_BUILD_PRICE, CONFIG.CORNFIELD_BUILD_PRICE, CONFIG.STONECUTTER_BUILD_PRICE) - gameState.money;
            return { showError: `Még ${needed} pénz kell!` };
        }
    } else if (tile.type === 'cornfield') {
        // Kukorica föld - learatás vagy eladás
        const isBuilding = gameState.buildingCornfields.has(`${tileX},${tileY}`);
        if (isBuilding) {
            const data = gameState.buildingCornfields.get(`${tileX},${tileY}`);
            const now = Date.now();
            const elapsed = (now - data.startTime) / 1000;
            const timeLeft = Math.max(0, CONFIG.CORNFIELD_BUILD_TIME - elapsed);
            content.innerHTML = `
                <div>Kukorica föld építése folyamatban...</div>
                <div>Hátralévő idő: ${Math.ceil(timeLeft)}s</div>
            `;
        } else {
            content.innerHTML = `
                <button class="bubble-button" data-action="harvestCornField" data-x="${tileX}" data-y="${tileY}">
                    Learatás
                </button>
                <button class="bubble-button" data-action="sellCornField" data-x="${tileX}" data-y="${tileY}">
                    Eladás (${CONFIG.CORNFIELD_SELL_PRICE} pénz)
                </button>
            `;
        }
    } else if (tile.type === 'emptycornfield') {
        // Üres kukorica föld - újraültetés vagy eladás
        const isReplanting = gameState.replantingCornfields.has(`${tileX},${tileY}`);
        if (isReplanting) {
            const data = gameState.replantingCornfields.get(`${tileX},${tileY}`);
            const now = Date.now();
            const elapsed = (now - data.startTime) / 1000;
            const timeLeft = Math.max(0, CONFIG.CORNFIELD_REPLANT_TIME - elapsed);
            content.innerHTML = `
                <div>Kukorica újraültetése folyamatban...</div>
                <div>Hátralévő idő: ${Math.ceil(timeLeft)}s</div>
            `;
        } else {
            const canReplant = hasAvailableWorker();
            content.innerHTML = `
                <button class="bubble-button" ${!canReplant ? 'disabled' : ''} data-action="replantCornField" data-x="${tileX}" data-y="${tileY}">
                    Újraültetés ${!canReplant ? '(nincs munkás)' : ''}
                </button>
                <button class="bubble-button" data-action="sellCornField" data-x="${tileX}" data-y="${tileY}">
                    Eladás (${CONFIG.CORNFIELD_SELL_PRICE} pénz)
                </button>
            `;
        }
    } else if (tile.type === 'stonecutter') {
        // Kővágó - upgrade és eladás
        const stonecutterLevel = tile.level || 1;
        
        content.innerHTML = `
            <div style="margin-bottom: 10px;">Kővágó (Szint ${stonecutterLevel})</div>
            <button class="bubble-button" data-action="openUpgrade" data-x="${tileX}" data-y="${tileY}" data-type="stonecutter">
                Upgrade
            </button>
            <button class="bubble-button" data-action="sellStoneCutter" data-x="${tileX}" data-y="${tileY}">
                Eladás (${CONFIG.STONECUTTER_SELL_PRICE} pénz)
            </button>
        `;
    }
    
    return { showError: null };
}

export function showBubble(screenX, screenY, tileX, tileY, tile) {
    const bubble = document.getElementById('bubble');
    
    const result = generateBubbleContent(tileX, tileY, tile);
    
    if (result.showError) {
        setTimeout(() => showError(result.showError), 100);
    }

    // Buborék pozicionálása térkép koordinátához képest (scroll esetén együtt mozog)
    updateBubblePosition(tileX, tileY);
    bubble.classList.remove('hidden');
    gameState.activeBubble = { x: tileX, y: tileY };

    // Gomb események (beleértve a skip gombot is)
    setupBubbleButtons();
    
    // Tutorial értesítés
    onTutorialEvent('bubble_open', { x: tileX, y: tileY, type: tile ? tile.type : null });
}

export function setupBubbleButtons() {
    const content = document.getElementById('bubbleContent');
    content.querySelectorAll('.bubble-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const x = parseInt(btn.dataset.x);
            const y = parseInt(btn.dataset.y);
            const type = btn.dataset.type;
            handleAction(action, x, y, type);
        });
    });
}

export function refreshActiveBubble() {
    if (!gameState.activeBubble) return;
    
    try {
        const tileX = gameState.activeBubble.x;
        const tileY = gameState.activeBubble.y;
        const tile = findTile(tileX, tileY);
        
        // Ellenőrizzük, hogy a tile még mindig létezik és megfelelő típusú
        // Ha a fa kivágódott (owned lett), bezárjuk a buborékot
        const key = `${tileX},${tileY}`;
        const isCuttingTree = gameState.cuttingTrees.has(key);
        const isBuildingCornfield = gameState.buildingCornfields.has(key);
        const isReplantingCornfield = gameState.replantingCornfields.has(key);
        
        // Csak akkor frissítjük, ha folyamatban van valami időzített művelet
        if (isCuttingTree || isBuildingCornfield || isReplantingCornfield) {
            generateBubbleContent(tileX, tileY, tile);
        }
    } catch (error) {
        console.error('refreshActiveBubble hiba:', error);
    }
}

export function updateBubblePosition(tileX, tileY) {
    const bubble = document.getElementById('bubble');
    if (!gameState.activeBubble || !canvas) return;

    // Térkép koordináta -> képernyő koordináta
    const worldX = tileX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    const worldY = tileY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

    const screenX = (worldX - gameState.camera.x) * gameState.camera.zoom + canvas.width / 2;
    const screenY = (worldY - gameState.camera.y) * gameState.camera.zoom + canvas.height / 2;

    bubble.style.left = `${screenX + 10}px`;
    bubble.style.top = `${screenY + 10}px`;
}

export function handleAction(action, x, y, type) {
    switch (action) {
        case 'purchase':
            purchaseTile(x, y, updateUI, saveGameState);
            break;
        case 'cut':
            cutTree(x, y, updateUI, saveGameState);
            onTutorialEvent('tree_cutting', { x, y });
            break;
        case 'sellHouse':
            sellHouse(x, y, updateUI, saveGameState);
            break;
        case 'buildHouse':
            buildHouse(x, y, updateUI, saveGameState);
            break;
        case 'buildTree':
            buildTree(x, y, updateUI, saveGameState);
            onTutorialEvent('tree_planted', { x, y });
            break;
        case 'buildCornField':
            buildCornField(x, y, updateUI, saveGameState);
            break;
        case 'buildStoneCutter':
            buildStoneCutter(x, y, updateUI, saveGameState);
            break;
        case 'harvestCornField':
            harvestCornField(x, y, updateUI, saveGameState);
            break;
        case 'replantCornField':
            replantCornField(x, y, updateUI, saveGameState);
            break;
        case 'sellCornField':
            sellCornField(x, y, updateUI, saveGameState);
            break;
        case 'sellStoneCutter':
            sellStoneCutter(x, y, updateUI, saveGameState);
            break;
        case 'openUpgrade':
            openUpgradeModal(x, y, type, closeBubble);
            return; // Ne zárjuk be a buborékot
    }
    closeBubble();
}

export function closeBubble() {
    document.getElementById('bubble').classList.add('hidden');
    gameState.activeBubble = null;
}

