/**
 * @file event-listeners.js
 * @description Eseménykezelők beállítása - DOM események
 * 
 * FELELŐSSÉGI KÖR:
 * - Ablak átméretezés kezelése
 * - Billentyű események (Escape)
 * - Modal gombok eseményei
 * - Settings menü események
 * - Státusz panel ikon kattintások
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Scroll/húzással kapcsolatos → scroll.js
 * - Zoom-mal kapcsolatos → zoom.js
 * - Modal logikával kapcsolatos → modals/*.js
 * - Beállításokkal kapcsolatos → settings.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from './gameState.js';
import { getZoomLevel, constrainCamera } from './camera.js';
import { getCanvas, resizeCanvas } from './renderer.js';
import { setupScroll } from './scroll.js';
import { setupZoom } from './zoom.js';
import { saveGameState } from './save-load.js';
import { loadMuteState } from './audio.js';
import { closeBubble } from './bubble.js';
import { updateSoundIcon, handleSoundToggle, toggleSettingsMenu, closeSettingsMenu, handleLanguageToggle, updateLanguageFlag, handleLogout, handleCredits, handleThemeToggle, initTheme, handleShop } from './settings.js';
import { translateDOM } from './i18n.js';
import { openChat, initChat } from './chat.js';

// Chat megnyitása
function handleChat() {
    closeSettingsMenu();
    openChat();
}
import { handleClick } from './click-handler.js';
import { 
    openPlankModal, closeModal, sellPlanks, 
    openCornModal, closeCornModal, sellCorn, 
    openDiscordModal, closeDiscordModal, 
    closeUpgradeModal, setupModalSliders,
    closeWarehouseModal, setupWarehouseModalEvents,
    openShopModal, closeShopModal, setupShopModalEvents
} from './modals.js';

// Ablak átméretezés kezelése
export function setupWindowEvents() {
    const canvas = getCanvas();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        // Zoom újraszámítása ablak átméretezéskor (ha már inicializálva van)
        if (gameState.map.length > 0 && gameState.camera.zoomLevel) {
            gameState.camera.zoom = getZoomLevel(gameState.camera.zoomLevel);
            constrainCamera(canvas);
        }
    });
}

// Billentyű események
export function setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBubble();
            closeModal();
            closeCornModal();
            closeDiscordModal();
            closeUpgradeModal();
        }
    });
}

// Input események (scroll, zoom)
export function setupInputEvents() {
    const canvas = getCanvas();
    setupZoom(canvas, saveGameState);
    setupScroll(canvas, saveGameState, handleClick);
}

// Buborék események
export function setupBubbleEvents() {
    document.getElementById('closeBubble').addEventListener('click', closeBubble);
    
    // Kívülre kattintás - buborék bezárása
    document.addEventListener('click', (e) => {
        const bubble = document.getElementById('bubble');
        const canvas = document.getElementById('gameCanvas');
        
        // Ha a buborék látható és nem a buborékon belül kattintottak
        if (bubble && !bubble.classList.contains('hidden')) {
            // Ha a canvas-on kattintottak (új tile kiválasztás), azt a click-handler kezeli
            if (canvas && canvas.contains(e.target)) {
                return;
            }
            // Ha a buborékon kívül kattintottak (de nem a canvas-on)
            if (!bubble.contains(e.target)) {
                closeBubble();
            }
        }
    });
}

// Modal események
export function setupModalEvents() {
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
    setupWarehouseModalEvents();
    setupShopModalEvents();

    // Modal kívülre kattintás
    document.getElementById('cornModal').addEventListener('click', (e) => {
        if (e.target.id === 'cornModal') {
            closeCornModal();
        }
    });

    // Raktár modal
    document.getElementById('warehouseModal').addEventListener('click', (e) => {
        if (e.target.id === 'warehouseModal') {
            closeWarehouseModal();
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
}

// Settings események
export function setupSettingsEvents() {
    document.getElementById('settingsIcon').addEventListener('click', toggleSettingsMenu);
    document.getElementById('soundMenuItem').addEventListener('click', handleSoundToggle);
    document.getElementById('discordMenuItem').addEventListener('click', () => {
        closeSettingsMenu();
        openDiscordModal();
    });
    document.getElementById('languageMenuItem').addEventListener('click', handleLanguageToggle);
    document.getElementById('themeMenuItem').addEventListener('click', handleThemeToggle);
    document.getElementById('chatMenuItem').addEventListener('click', handleChat);
    document.getElementById('creditsMenuItem').addEventListener('click', handleCredits);
    document.getElementById('shopMenuItem').addEventListener('click', handleShop);
    document.getElementById('logoutMenuItem').addEventListener('click', handleLogout);
    
    // Kívülre kattintás - settings menü bezárása
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            closeSettingsMenu();
        }
    });
    
    // Verzió kattintás - update oldal megnyitása
    document.getElementById('version').addEventListener('click', () => {
        window.open('update.html', '_blank');
    });
    
    // Hang állapot betöltése és ikon frissítése
    loadMuteState();
    
    // Téma inicializálása
    initTheme();
    
    // Chat inicializálása
    initChat();
    updateSoundIcon();
    updateLanguageFlag();
    
    // Nyelvváltás esemény - UI frissítése
    window.addEventListener('languageChanged', () => {
        translateDOM();
        updateLanguageFlag();
        closeBubble(); // Bezárjuk a buborékot, mert a szövegek változtak
    });
}

// Minden eseménykezelő beállítása egyben
export function setupAllEventListeners() {
    setupWindowEvents();
    setupKeyboardEvents();
    setupInputEvents();
    setupBubbleEvents();
    setupModalEvents();
    setupSettingsEvents();
}

