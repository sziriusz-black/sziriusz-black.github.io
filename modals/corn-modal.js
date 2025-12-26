/**
 * @file modals/corn-modal.js
 * @description Kukorica eladás modal kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Modal nyitás (openCornModal)
 * - Modal zárás (closeCornModal)
 * - Kukorica eladás (sellCorn)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más modal-lal kapcsolatos → modals/*.js
 * - UI frissítéssel kapcsolatos → ui.js
 * - Játék állapottal kapcsolatos → gameState.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';
import { gameState } from '../gameState.js';
import { playSound } from '../audio.js';
import { saveGameState } from '../save-load.js';
import { updateUI } from '../ui.js';

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

