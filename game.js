/**
 * @file game.js
 * @description Fő játék modul - a játék belépési pontja
 * 
 * FELELŐSSÉGI KÖR:
 * - Játék inicializálása (initGame)
 * - Kezdő térkép létrehozása (createInitialMap)
 * - Event listener-ek beállítása (setupEventListeners)
 * - Kattintás kezelés és tile koordináta számítás (handleClick)
 * - Fő játék ciklus (gameLoop)
 * - Canvas és ablak események
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Buborék/bubble kezeléssel kapcsolatos → bubble.js
 * - Modal ablakokkal kapcsolatos → modals.js
 * - UI frissítéssel kapcsolatos → ui.js
 * - Beállítások menüvel kapcsolatos → settings.js
 * - Tile műveletekkel kapcsolatos → tile-operations.js
 * - Építéssel/eladással kapcsolatos → building-actions.js
 * - Időzítőkkel kapcsolatos → timers.js
 * - Mentéssel/betöltéssel kapcsolatos → save-load.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { getZoomLevel, constrainCamera } from './camera.js';
import { setupScroll } from './scroll.js';
import { setupZoom } from './zoom.js';
import { getCanvas, getContext, resizeCanvas, render } from './renderer.js';
import { findTile } from './tile-operations.js';
import { updateTimers } from './timers.js';
import { saveGameState, loadGameState } from './save-load.js';
import { startBackgroundMusic, loadMuteState } from './audio.js';
import { isNewPlayer, startTutorial, setupTutorialListeners, updateTutorialArrow } from './tutorial.js';

// UI modulok
import { updateUI } from './ui.js';
import { updateSoundIcon, handleSoundToggle, toggleSettingsMenu, closeSettingsMenu } from './settings.js';
import { openPlankModal, closeModal, sellPlanks, openCornModal, closeCornModal, sellCorn, openDiscordModal, closeDiscordModal, closeUpgradeModal, setupModalSliders } from './modals.js';
import { showBubble, closeBubble, updateBubblePosition, refreshActiveBubble, initBubble } from './bubble.js';

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

    // Bubble inicializálás
    initBubble(canvas);

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

    // Modal gombok
    document.getElementById('cancelSell').addEventListener('click', closeModal);
    document.getElementById('confirmSell').addEventListener('click', sellPlanks);
    document.getElementById('cancelCornSell').addEventListener('click', closeCornModal);
    document.getElementById('confirmCornSell').addEventListener('click', sellCorn);
    
    // Modal slider-ek
    setupModalSliders();

    // Modal kívülre kattintás
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
