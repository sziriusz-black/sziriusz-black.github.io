import { CONFIG, TileType } from './config.js';
import { gameState } from './gameState.js';
import { getZoomLevel, constrainCamera } from './camera.js';
import { setupScroll } from './scroll.js';
import { setupZoom } from './zoom.js';
import { getCanvas, getContext, resizeCanvas, render } from './renderer.js';
import { findTile, isAdjacentToOwned, purchaseTile, cutTree, sellHouse, buildHouse, buildTree, buildCornField, harvestCornField, replantCornField, sellCornField, updateTimers, saveGameState, loadGameState } from './gameLogic.js';
import { playSound } from './audio.js';

// Canvas és kontextus
const canvas = getCanvas();
const ctx = getContext();

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
    loadGameState(createInitialMap, updateUI);

    // Kezdő térkép létrehozása (ha nincs mentett állapot)
    if (gameState.map.length === 0) {
        createInitialMap();
    }

    // Event listener-ek
    setupEventListeners();

    // Renderelés indítása
    gameLoop();
}

function createInitialMap() {
    // 4 terület: 1 ház, 3 üres
    gameState.map = [
        { x: 0, y: 0, type: 'house' },
        { x: 1, y: 0, type: 'owned' },
        { x: 0, y: 1, type: 'owned' },
        { x: -1, y: 0, type: 'owned' }
    ];
    gameState.ownedTiles = 4;
    // Kezdő kamera pozíció a középpontra
    gameState.camera.x = 0;
    gameState.camera.y = 0;
    // Kezdő zoom: 1-es level (maximális zoom, ház nagy)
    gameState.camera.zoomLevel = 1;
    gameState.camera.zoom = getZoomLevel(1);
    updateUI();
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
    });

    document.getElementById('cancelCornSell').addEventListener('click', closeCornModal);
    document.getElementById('confirmCornSell').addEventListener('click', sellCorn);
    document.getElementById('cornSlider').addEventListener('input', (e) => {
        document.getElementById('cornSellAmount').textContent = e.target.value;
    });
    document.getElementById('cornModal').addEventListener('click', (e) => {
        if (e.target.id === 'cornModal') {
            closeCornModal();
        }
    });

    // Discord modal
    document.getElementById('discordIcon').addEventListener('click', openDiscordModal);
    document.getElementById('closeDiscordModal').addEventListener('click', closeDiscordModal);
    document.getElementById('discordModal').addEventListener('click', (e) => {
        if (e.target.id === 'discordModal') {
            closeDiscordModal();
        }
    });
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
    const discordIcon = document.getElementById('discordIcon');
    if ((bubble && bubble.contains(e.target)) || 
        (modal && modal.contains(e.target)) ||
        (cornModal && cornModal.contains(e.target)) ||
        (discordModal && discordModal.contains(e.target)) ||
        (discordIcon && discordIcon.contains(e.target))) {
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

function showBubble(screenX, screenY, tileX, tileY, tile) {
    const bubble = document.getElementById('bubble');
    const content = document.getElementById('bubbleContent');
    content.innerHTML = '';
    
    // Alapértelmezett: nagy buborék
    bubble.classList.add('large');

    if (!tile) {
        // Meg nem vásárolt terület
        if (isAdjacentToOwned(tileX, tileY)) {
            const price = CONFIG.PURCHASE_PRICE;
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
            
            // Hibaüzenet csak ha nincs elég pénz, de a buborék mindig megjelenik
            if (!canAfford) {
                setTimeout(() => showError(`Még ${price - gameState.money} pénz kell!`), 100);
            }
        } else {
            content.innerHTML = '<div>Csak a megvásárolt terület mellé lehet vásárolni!</div>';
        }
    } else if (tile.type === 'tree') {
        // Fa kivágás
        const isCutting = gameState.cuttingTrees.has(`${tileX},${tileY}`);
        if (isCutting) {
            const timeLeft = gameState.cuttingTrees.get(`${tileX},${tileY}`).timeLeft;
            content.innerHTML = `
                <div>Fa kivágása folyamatban...</div>
                <div>Hátralévő idő: ${timeLeft}s</div>
            `;
        } else {
            content.innerHTML = `
                <button class="bubble-button" data-action="cut" data-x="${tileX}" data-y="${tileY}">
                    Kivágás
                </button>
            `;
        }
    } else if (tile.type === 'house') {
        // Ház eladása (kivéve a kezdő házat)
        if (tileX === 0 && tileY === 0) {
            content.innerHTML = '<div>Ez a kezdő ház, nem lehet eladni!</div>';
        } else {
            content.innerHTML = `
                <div style="margin-bottom: 10px;">Ház eladása</div>
                <div style="margin-bottom: 10px;">Ár: ${CONFIG.HOUSE_SELL_PRICE} pénz</div>
                <button class="bubble-button" data-action="sellHouse" data-x="${tileX}" data-y="${tileY}">
                    Eladás
                </button>
            `;
        }
    } else if (tile.type === 'owned') {
        // Üres terület - építés
        // Kis buborék építésnél
        bubble.classList.remove('large');
        
        content.innerHTML = `
            <div style="margin-bottom: 10px;">Építés</div>
            <button class="bubble-button" ${gameState.money < CONFIG.HOUSE_BUILD_PRICE ? 'disabled' : ''} data-action="buildHouse" data-x="${tileX}" data-y="${tileY}">
                Ház építése (${CONFIG.HOUSE_BUILD_PRICE} pénz)
            </button>
            <button class="bubble-button" ${gameState.money < CONFIG.TREE_BUILD_PRICE ? 'disabled' : ''} data-action="buildTree" data-x="${tileX}" data-y="${tileY}">
                Fa ültetése (${CONFIG.TREE_BUILD_PRICE} pénz)
            </button>
            <button class="bubble-button" ${gameState.money < CONFIG.CORNFIELD_BUILD_PRICE ? 'disabled' : ''} data-action="buildCornField" data-x="${tileX}" data-y="${tileY}">
                Kukorica föld (${CONFIG.CORNFIELD_BUILD_PRICE} pénz)
            </button>
        `;
        
        if (gameState.money < CONFIG.HOUSE_BUILD_PRICE && gameState.money < CONFIG.TREE_BUILD_PRICE && gameState.money < CONFIG.CORNFIELD_BUILD_PRICE) {
            const needed = Math.min(CONFIG.HOUSE_BUILD_PRICE, CONFIG.TREE_BUILD_PRICE, CONFIG.CORNFIELD_BUILD_PRICE) - gameState.money;
            showError(`Még ${needed} pénz kell!`);
        }
    } else if (tile.type === 'cornfield') {
        // Kukorica föld - learatás vagy eladás
        const isBuilding = gameState.buildingCornfields.has(`${tileX},${tileY}`);
        if (isBuilding) {
            const timeLeft = gameState.buildingCornfields.get(`${tileX},${tileY}`).timeLeft;
            content.innerHTML = `
                <div>Kukorica föld építése folyamatban...</div>
                <div>Hátralévő idő: ${timeLeft}s</div>
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
            const timeLeft = gameState.replantingCornfields.get(`${tileX},${tileY}`).timeLeft;
            content.innerHTML = `
                <div>Kukorica újraültetése folyamatban...</div>
                <div>Hátralévő idő: ${timeLeft}s</div>
            `;
        } else {
            content.innerHTML = `
                <button class="bubble-button" data-action="replantCornField" data-x="${tileX}" data-y="${tileY}">
                    Újraültetés
                </button>
                <button class="bubble-button" data-action="sellCornField" data-x="${tileX}" data-y="${tileY}">
                    Eladás (${CONFIG.CORNFIELD_SELL_PRICE} pénz)
                </button>
            `;
        }
    }

    // Buborék pozicionálása térkép koordinátához képest (scroll esetén együtt mozog)
    updateBubblePosition(tileX, tileY);
    bubble.classList.remove('hidden');
    gameState.activeBubble = { x: tileX, y: tileY };

    // Gomb események (beleértve a skip gombot is)
    content.querySelectorAll('.bubble-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const x = parseInt(btn.dataset.x);
            const y = parseInt(btn.dataset.y);
            handleAction(action, x, y);
        });
    });
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

function handleAction(action, x, y) {
    switch (action) {
        case 'purchase':
            purchaseTile(x, y, updateUI, saveGameState);
            break;
        case 'cut':
            cutTree(x, y);
            break;
        case 'sellHouse':
            sellHouse(x, y, updateUI, saveGameState);
            break;
        case 'buildHouse':
            buildHouse(x, y, updateUI, saveGameState);
            break;
        case 'buildTree':
            buildTree(x, y, updateUI, saveGameState);
            break;
        case 'buildCornField':
            buildCornField(x, y, updateUI, saveGameState);
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
    }
    closeBubble();
}

function closeBubble() {
    document.getElementById('bubble').classList.add('hidden');
    gameState.activeBubble = null;
}

function updateUI() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('planks').textContent = gameState.planks;
    document.getElementById('corn').textContent = gameState.corn;
}

function openPlankModal() {
    const modal = document.getElementById('plankModal');
    const slider = document.getElementById('plankSlider');
    slider.max = gameState.planks;
    slider.value = Math.min(1, gameState.planks);
    document.getElementById('sellAmount').textContent = slider.value;
    modal.classList.remove('hidden');
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
    }
}

function openCornModal() {
    const modal = document.getElementById('cornModal');
    const slider = document.getElementById('cornSlider');
    slider.max = gameState.corn;
    slider.value = Math.min(1, gameState.corn);
    document.getElementById('cornSellAmount').textContent = slider.value;
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

// Játék ciklus
function gameLoop() {
    updateTimers(updateUI, saveGameState, closeBubble);
    render(updateBubblePosition, findTile);
    requestAnimationFrame(gameLoop);
}

// Indítás
initGame();
