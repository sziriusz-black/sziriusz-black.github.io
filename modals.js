/**
 * @file modals.js
 * @description Modal ablakok kezelése - eladás, discord, upgrade
 * 
 * FELELŐSSÉGI KÖR:
 * - Deszka eladás modal (openPlankModal, closeModal, sellPlanks)
 * - Kukorica eladás modal (openCornModal, closeCornModal, sellCorn)
 * - Discord modal (openDiscordModal, closeDiscordModal)
 * - Upgrade modal (openUpgradeModal, closeUpgradeModal)
 * - Modal slider-ek beállítása (setupModalSliders)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Buborék kezeléssel kapcsolatos → bubble.js
 * - UI frissítéssel kapcsolatos → ui.js
 * - Beállítások menüvel kapcsolatos → settings.js
 * - Építéssel/eladással kapcsolatos → building-actions.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { playSound } from './audio.js';
import { onTutorialEvent } from './tutorial.js';
import { findTile } from './tile-operations.js';
import { upgradeHouse, upgradeStoneCutter } from './building-actions.js';
import { saveGameState } from './save-load.js';
import { updateUI } from './ui.js';

// Deszka eladás
export function openPlankModal() {
    const modal = document.getElementById('plankModal');
    const slider = document.getElementById('plankSlider');
    slider.max = gameState.planks;
    slider.value = Math.min(1, gameState.planks);
    document.getElementById('sellAmount').textContent = slider.value;
    document.getElementById('plankSellPrice').textContent = slider.value * CONFIG.PLANK_SELL_PRICE;
    modal.classList.remove('hidden');
    onTutorialEvent('sell_modal_open');
}

export function closeModal() {
    document.getElementById('plankModal').classList.add('hidden');
}

export function sellPlanks() {
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

// Kukorica eladás
export function openCornModal() {
    const modal = document.getElementById('cornModal');
    const slider = document.getElementById('cornSlider');
    slider.max = gameState.corn;
    slider.value = Math.min(1, gameState.corn);
    document.getElementById('cornSellAmount').textContent = slider.value;
    document.getElementById('cornSellTotalPrice').textContent = slider.value * CONFIG.CORN_SELL_PRICE;
    modal.classList.remove('hidden');
}

export function closeCornModal() {
    document.getElementById('cornModal').classList.add('hidden');
}

export function sellCorn() {
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

// Discord modal
export function openDiscordModal() {
    const modal = document.getElementById('discordModal');
    modal.classList.remove('hidden');
}

export function closeDiscordModal() {
    const modal = document.getElementById('discordModal');
    modal.classList.add('hidden');
}

// Upgrade modal
let currentUpgradeTileX = 0;
let currentUpgradeTileY = 0;
let currentUpgradeType = '';

export function openUpgradeModal(x, y, type, closeBubbleFn) {
    if (closeBubbleFn) closeBubbleFn();
    
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

export function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    modal.classList.add('hidden');
}

// Slider események beállítása
export function setupModalSliders() {
    document.getElementById('plankSlider').addEventListener('input', (e) => {
        document.getElementById('sellAmount').textContent = e.target.value;
        document.getElementById('plankSellPrice').textContent = e.target.value * CONFIG.PLANK_SELL_PRICE;
    });

    document.getElementById('cornSlider').addEventListener('input', (e) => {
        document.getElementById('cornSellAmount').textContent = e.target.value;
        document.getElementById('cornSellTotalPrice').textContent = e.target.value * CONFIG.CORN_SELL_PRICE;
    });
}

