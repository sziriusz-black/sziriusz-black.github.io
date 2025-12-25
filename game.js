import { CONFIG, TileType } from './config.js';
import { gameState } from './gameState.js';
import { getZoomLevel, constrainCamera } from './camera.js';
import { setupScroll } from './scroll.js';
import { setupZoom } from './zoom.js';
import { getCanvas, getContext, resizeCanvas, render } from './renderer.js';
import { findTile, isAdjacentToOwned, purchaseTile, cutTree, sellHouse, buildHouse, buildTree, buildStoneCutter, buildCornField, harvestCornField, replantCornField, sellCornField, updateTimers, saveGameState, loadGameState, calculateTilePrice, hasAvailableWorker, upgradeHouse, upgradeStoneCutter, sellStoneCutter } from './gameLogic.js';
import { playSound, startBackgroundMusic, toggleMute, loadMuteState, isMusicMuted } from './audio.js';
import { isNewPlayer, startTutorial, setupTutorialListeners, onTutorialEvent, updateTutorialArrow, isTutorialActive } from './tutorial.js';

// Canvas és kontextus
const canvas = getCanvas();
const ctx = getContext();

// Debug: gameState és mentés elérhetővé tétele konzolból
window.gameState = gameState;
window.saveGame = saveGameState;

// Kezdő állapot inicializálása
function initGame() {
    // Canvas méretezése
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        // Zoom újraszámítása ablak átméretezéskor (ha már inicializálva van)
        if (gameState.map.length > 0 && gameState.camera.zoomLevel) {
            gameState.camera.zoom = getZoomLevel(gameState.camera.zoomLevel);
            constrainCamera(canvas);
        }
    });

    // Local storage betöltése
    loadGameState(() => {
        createInitialMap();
        updateUI();
    }, updateUI);

    // Kezdő térkép létrehozása (ha nincs mentett állapot)
    if (gameState.map.length === 0) {
        createInitialMap();
        updateUI();
    }

    // Event listener-ek
    setupEventListeners();

    // Tutorial listener-ek
    setupTutorialListeners();

    // Háttérzene indítása
    startBackgroundMusic();

    // Tutorial indítása új játékosnak
    if (isNewPlayer()) {
        startTutorial();
    }

    // Renderelés indítása
    gameLoop();
}

function createInitialMap() {
    // 4 terület: 1 ház, 3 üres
    gameState.map = [
        { x: 0, y: 0, type: 'house' },
        { x: 1, y: 0, type: 'owned' },
        { x: 0, y: 1, type: 'owned' },
        { x: 1, y: 1, type: 'owned' }
    ];
    gameState.ownedTiles = 4;
    // Kezdő ház munkásai (3/3)
    gameState.workers = CONFIG.STARTER_HOUSE_WORKERS;
    gameState.maxWorkers = CONFIG.STARTER_HOUSE_WORKERS;
    // Kezdő kamera pozíció a középpontra
    gameState.camera.x = 0;
    gameState.camera.y = 0;
    // Kezdő zoom: 1-es level (maximális zoom, ház nagy)
    gameState.camera.zoomLevel = 1;
    gameState.camera.zoom = getZoomLevel(1);
}

function setupEventListeners() {
    // Zoom görgővel
    setupZoom(canvas, saveGameState);

    // Scrollozás húzással
    setupScroll(canvas, saveGameState, handleClick);

    // Buborék bezárás
    document.getElementById('closeBubble').addEventListener('click', closeBubble);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBubble();
            closeModal();
            closeCornModal();
            closeDiscordModal();
            closeUpgradeModal();
        }
    });

    // Deszka eladás modal - csak a deszka ikonra kattintva
    const statusItems = document.querySelectorAll('.status-item');
    statusItems[1].querySelector('.icon').addEventListener('click', () => {
        if (gameState.planks > 0) {
            openPlankModal();
        }
    });

    // Kukorica eladás modal - csak a kukorica ikonra kattintva
    statusItems[2].querySelector('.icon').addEventListener('click', () => {
        if (gameState.corn > 0) {
            openCornModal();
        }
    });

    document.getElementById('cancelSell').addEventListener('click', closeModal);
    document.getElementById('confirmSell').addEventListener('click', sellPlanks);
    document.getElementById('plankSlider').addEventListener('input', (e) => {
        document.getElementById('sellAmount').textContent = e.target.value;
        document.getElementById('plankSellPrice').textContent = e.target.value * CONFIG.PLANK_SELL_PRICE;
    });

    document.getElementById('cancelCornSell').addEventListener('click', closeCornModal);
    document.getElementById('confirmCornSell').addEventListener('click', sellCorn);
    document.getElementById('cornSlider').addEventListener('input', (e) => {
        document.getElementById('cornSellAmount').textContent = e.target.value;
        document.getElementById('cornSellTotalPrice').textContent = e.target.value * CONFIG.CORN_SELL_PRICE;
    });
    document.getElementById('cornModal').addEventListener('click', (e) => {
        if (e.target.id === 'cornModal') {
            closeCornModal();
        }
    });

    // Discord modal
    document.getElementById('closeDiscordModal').addEventListener('click', closeDiscordModal);
    document.getElementById('discordModal').addEventListener('click', (e) => {
        if (e.target.id === 'discordModal') {
            closeDiscordModal();
        }
    });
    
    // Upgrade modal
    document.getElementById('closeUpgradeModal').addEventListener('click', closeUpgradeModal);
    document.getElementById('upgradeModal').addEventListener('click', (e) => {
        if (e.target.id === 'upgradeModal') {
            closeUpgradeModal();
        }
    });
    
    // Settings dropdown
    document.getElementById('settingsIcon').addEventListener('click', toggleSettingsMenu);
    document.getElementById('soundMenuItem').addEventListener('click', handleSoundToggle);
    document.getElementById('discordMenuItem').addEventListener('click', () => {
        closeSettingsMenu();
        openDiscordModal();
    });
    
    // Kívülre kattintás - settings menü bezárása
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            closeSettingsMenu();
        }
    });
    
    // Hang állapot betöltése és ikon frissítése
    loadMuteState();
    updateSoundIcon();
}

export function handleClick(e) {
    // Ne kezeljük a kattintást ha buborék van
    if (gameState.activeBubble) {
        return;
    }

    // Ne kezeljük ha a buborékon vagy modalon kattintottunk
    const bubble = document.getElementById('bubble');
    const modal = document.getElementById('plankModal');
    const cornModal = document.getElementById('cornModal');
    const discordModal = document.getElementById('discordModal');
    const settingsDropdown = document.getElementById('settingsDropdown');
    if ((bubble && bubble.contains(e.target)) || 
        (modal && modal.contains(e.target)) ||
        (cornModal && cornModal.contains(e.target)) ||
        (discordModal && discordModal.contains(e.target)) ||
        (settingsDropdown && settingsDropdown.contains(e.target))) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const worldY = (mouseY - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;

    const tileX = Math.floor(worldX / CONFIG.TILE_SIZE);
    const tileY = Math.floor(worldY / CONFIG.TILE_SIZE);

    const tile = findTile(tileX, tileY);
    showBubble(e.clientX, e.clientY, tileX, tileY, tile);
}

function generateBubbleContent(tileX, tileY, tile) {
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

function showBubble(screenX, screenY, tileX, tileY, tile) {
    const bubble = document.getElementById('bubble');
    const content = document.getElementById('bubbleContent');
    
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

function setupBubbleButtons() {
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

function refreshActiveBubble() {
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

function updateBubblePosition(tileX, tileY) {
    const bubble = document.getElementById('bubble');
    if (!gameState.activeBubble) return;

    // Térkép koordináta -> képernyő koordináta
    const worldX = tileX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    const worldY = tileY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

    const screenX = (worldX - gameState.camera.x) * gameState.camera.zoom + canvas.width / 2;
    const screenY = (worldY - gameState.camera.y) * gameState.camera.zoom + canvas.height / 2;

    bubble.style.left = `${screenX + 10}px`;
    bubble.style.top = `${screenY + 10}px`;
}

function handleAction(action, x, y, type) {
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
        case 'upgradeHouse':
            upgradeHouse(x, y, updateUI, saveGameState);
            break;
        case 'upgradeStoneCutter':
            upgradeStoneCutter(x, y, updateUI, saveGameState);
            break;
        case 'sellStoneCutter':
            sellStoneCutter(x, y, updateUI, saveGameState);
            break;
        case 'openUpgrade':
            openUpgradeModal(x, y, type);
            return; // Ne zárjuk be a buborékot
    }
    closeBubble();
}

function closeBubble() {
    document.getElementById('bubble').classList.add('hidden');
    gameState.activeBubble = null;
}

function updateUI() {
    const moneyEl = document.getElementById('money');
    const planksEl = document.getElementById('planks');
    const cornEl = document.getElementById('corn');
    const workersEl = document.getElementById('workers');
    const maxWorkersEl = document.getElementById('maxWorkers');
    
    if (moneyEl) moneyEl.textContent = gameState.money;
    if (planksEl) planksEl.textContent = gameState.planks;
    if (cornEl) cornEl.textContent = gameState.corn;
    if (workersEl) workersEl.textContent = gameState.workers;
    if (maxWorkersEl) maxWorkersEl.textContent = gameState.maxWorkers;
    
    // Deszka eladás modal frissítése ha nyitva van
    const plankModal = document.getElementById('plankModal');
    if (plankModal && !plankModal.classList.contains('hidden')) {
        const slider = document.getElementById('plankSlider');
        const currentValue = parseInt(slider.value);
        slider.max = gameState.planks;
        // Ha a jelenlegi érték nagyobb mint az új max, csökkentsük
        if (currentValue > gameState.planks) {
            slider.value = gameState.planks;
        }
        document.getElementById('sellAmount').textContent = slider.value;
        document.getElementById('plankSellPrice').textContent = slider.value * CONFIG.PLANK_SELL_PRICE;
    }
    
    // Kukorica eladás modal frissítése ha nyitva van
    const cornModal = document.getElementById('cornModal');
    if (cornModal && !cornModal.classList.contains('hidden')) {
        const slider = document.getElementById('cornSlider');
        const currentValue = parseInt(slider.value);
        slider.max = gameState.corn;
        // Ha a jelenlegi érték nagyobb mint az új max, csökkentsük
        if (currentValue > gameState.corn) {
            slider.value = gameState.corn;
        }
        document.getElementById('cornSellAmount').textContent = slider.value;
        document.getElementById('cornSellTotalPrice').textContent = slider.value * CONFIG.CORN_SELL_PRICE;
    }
}

function openPlankModal() {
    const modal = document.getElementById('plankModal');
    const slider = document.getElementById('plankSlider');
    slider.max = gameState.planks;
    slider.value = Math.min(1, gameState.planks);
    document.getElementById('sellAmount').textContent = slider.value;
    document.getElementById('plankSellPrice').textContent = slider.value * CONFIG.PLANK_SELL_PRICE;
    modal.classList.remove('hidden');
    onTutorialEvent('sell_modal_open');
}

function closeModal() {
    document.getElementById('plankModal').classList.add('hidden');
}

function sellPlanks() {
    const amount = parseInt(document.getElementById('plankSlider').value);
    if (amount > 0 && amount <= gameState.planks) {
        gameState.planks -= amount;
        gameState.money += amount * CONFIG.PLANK_SELL_PRICE;
        updateUI();
        saveGameState();
        closeModal();
        playSound('sell');
        onTutorialEvent('plank_sold');
    }
}

function openCornModal() {
    const modal = document.getElementById('cornModal');
    const slider = document.getElementById('cornSlider');
    slider.max = gameState.corn;
    slider.value = Math.min(1, gameState.corn);
    document.getElementById('cornSellAmount').textContent = slider.value;
    document.getElementById('cornSellTotalPrice').textContent = slider.value * CONFIG.CORN_SELL_PRICE;
    modal.classList.remove('hidden');
}

function closeCornModal() {
    document.getElementById('cornModal').classList.add('hidden');
}

function sellCorn() {
    const amount = parseInt(document.getElementById('cornSlider').value);
    if (amount > 0 && amount <= gameState.corn) {
        gameState.corn -= amount;
        gameState.money += amount * CONFIG.CORN_SELL_PRICE;
        updateUI();
        saveGameState();
        closeCornModal();
        playSound('sell');
    }
}

function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => {
        errorMsg.classList.add('hidden');
    }, 3000);
}

function openDiscordModal() {
    const modal = document.getElementById('discordModal');
    modal.classList.remove('hidden');
}

function closeDiscordModal() {
    const modal = document.getElementById('discordModal');
    modal.classList.add('hidden');
}

// Upgrade modal változók
let currentUpgradeTileX = 0;
let currentUpgradeTileY = 0;
let currentUpgradeType = '';

function openUpgradeModal(x, y, type) {
    closeBubble();
    
    currentUpgradeTileX = x;
    currentUpgradeTileY = y;
    currentUpgradeType = type;
    
    const modal = document.getElementById('upgradeModal');
    const title = document.getElementById('upgradeTitle');
    const content = document.getElementById('upgradeContent');
    
    const tile = findTile(x, y);
    const level = tile ? (tile.level || 1) : 1;
    
    if (type === 'house') {
        const isStarter = (x === 0 && y === 0);
        const workers = isStarter ? CONFIG.STARTER_HOUSE_WORKERS + (level - 1) : CONFIG.NORMAL_HOUSE_WORKERS + (level - 1);
        const upgradePrice = CONFIG.UPGRADE_BASE_PRICE + (level - 1) * CONFIG.UPGRADE_INCREMENT;
        const canAfford = gameState.money >= upgradePrice;
        
        title.textContent = isStarter ? 'Kezdő Ház Upgrade' : 'Ház Upgrade';
        content.innerHTML = `
            <div class="current-level">
                Jelenlegi szint: <strong>${level}</strong> | Munkások: <strong>+${workers}</strong>
            </div>
            <div class="upgrade-item">
                <div class="upgrade-info">
                    <div class="upgrade-name">Szint ${level + 1}</div>
                    <div class="upgrade-desc">+1 extra munkás</div>
                    <div class="upgrade-price">${upgradePrice} 💰</div>
                </div>
                <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} id="doUpgrade">
                    Upgrade
                </button>
            </div>
        `;
    } else if (type === 'stonecutter') {
        const upgradePrice = CONFIG.UPGRADE_BASE_PRICE + (level - 1) * CONFIG.UPGRADE_INCREMENT;
        const canAfford = gameState.money >= upgradePrice;
        
        title.textContent = 'Kővágó Upgrade';
        content.innerHTML = `
            <div class="current-level">
                Jelenlegi szint: <strong>${level}</strong>
            </div>
            <div class="upgrade-item">
                <div class="upgrade-info">
                    <div class="upgrade-name">Szint ${level + 1}</div>
                    <div class="upgrade-desc">Gyorsabb kővágás</div>
                    <div class="upgrade-price">${upgradePrice} 💰</div>
                </div>
                <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} id="doUpgrade">
                    Upgrade
                </button>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    
    // Upgrade gomb esemény
    const upgradeBtn = document.getElementById('doUpgrade');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            if (currentUpgradeType === 'house') {
                upgradeHouse(currentUpgradeTileX, currentUpgradeTileY, updateUI, saveGameState);
            } else if (currentUpgradeType === 'stonecutter') {
                upgradeStoneCutter(currentUpgradeTileX, currentUpgradeTileY, updateUI, saveGameState);
            }
            closeUpgradeModal();
        });
    }
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    modal.classList.add('hidden');
}

function handleSoundToggle() {
    toggleMute();
    updateSoundIcon();
}

function toggleSettingsMenu() {
    const menu = document.getElementById('settingsMenu');
    const icon = document.getElementById('settingsIcon');
    menu.classList.toggle('hidden');
    icon.classList.toggle('open');
}

function closeSettingsMenu() {
    const menu = document.getElementById('settingsMenu');
    const icon = document.getElementById('settingsIcon');
    menu.classList.add('hidden');
    icon.classList.remove('open');
}

function updateSoundIcon() {
    const soundMenuItem = document.getElementById('soundMenuItem');
    const soundOnIcon = document.getElementById('soundOnIcon');
    const soundOffIcon = document.getElementById('soundOffIcon');
    
    if (isMusicMuted()) {
        soundMenuItem.classList.add('muted');
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    } else {
        soundMenuItem.classList.remove('muted');
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
    }
}

// Játék ciklus
function gameLoop() {
    updateTimers(updateUI, saveGameState, closeBubble);
    refreshActiveBubble();
    updateTutorialArrow();
    render(updateBubblePosition, findTile);
    requestAnimationFrame(gameLoop);
}

// Indítás
initGame();
