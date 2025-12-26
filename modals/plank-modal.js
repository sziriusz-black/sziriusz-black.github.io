/**
 * @file modals/plank-modal.js
 * @description Deszka eladás modal kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Modal nyitás (openPlankModal)
 * - Modal zárás (closeModal)
 * - Deszka eladás (sellPlanks)
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
import { onTutorialEvent } from '../tutorial.js';
import { saveGameState } from '../save-load.js';
import { updateUI } from '../ui.js';

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

