/**
 * @file modals/upgrade-modal.js
 * @description Upgrade modal kezelése - ház és kővágó fejlesztés
 * 
 * FELELŐSSÉGI KÖR:
 * - Modal nyitás (openUpgradeModal)
 * - Modal zárás (closeUpgradeModal)
 * - Upgrade tartalom generálása
 * - Upgrade gomb eseménykezelés
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más modal-lal kapcsolatos → modals/*.js
 * - Építés/upgrade logikával kapcsolatos → building-actions.js
 * - UI frissítéssel kapcsolatos → ui.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';
import { gameState } from '../gameState.js';
import { findTile } from '../tile-operations.js';
import { upgradeHouse, upgradeStoneCutter } from '../building-actions.js';
import { saveGameState } from '../save-load.js';
import { updateUI } from '../ui.js';
import { t } from '../i18n.js';

// Aktuális upgrade állapot
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
        
        title.textContent = isStarter ? t('modal.starterHouseUpgrade') : t('modal.houseUpgrade');
        content.innerHTML = `
            <div class="current-level">
                ${t('modal.currentLevel')} <strong>${level}</strong> | ${t('modal.workers')} <strong>+${workers}</strong>
            </div>
            <div class="upgrade-item">
                <div class="upgrade-info">
                    <div class="upgrade-name">${t('modal.level', level + 1)}</div>
                    <div class="upgrade-desc">${t('modal.extraWorker')}</div>
                    <div class="upgrade-price">${upgradePrice} 💰</div>
                </div>
                <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} id="doUpgrade">
                    ${t('bubble.upgrade')}
                </button>
            </div>
        `;
    } else if (type === 'stonecutter') {
        const upgradePrice = CONFIG.UPGRADE_BASE_PRICE + (level - 1) * CONFIG.UPGRADE_INCREMENT;
        const canAfford = gameState.money >= upgradePrice;
        
        title.textContent = t('modal.stonecutterUpgrade');
        content.innerHTML = `
            <div class="current-level">
                ${t('modal.currentLevel')} <strong>${level}</strong>
            </div>
            <div class="upgrade-item">
                <div class="upgrade-info">
                    <div class="upgrade-name">${t('modal.level', level + 1)}</div>
                    <div class="upgrade-desc">${t('modal.fasterCutting')}</div>
                    <div class="upgrade-price">${upgradePrice} 💰</div>
                </div>
                <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} id="doUpgrade">
                    ${t('bubble.upgrade')}
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

