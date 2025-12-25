/**
 * @file ui/modal-updater.js
 * @description Nyitott modalok értékeinek frissítése
 * 
 * FELELŐSSÉGI KÖR:
 * - Deszka modal slider frissítése
 * - Kukorica modal slider frissítése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Modal logikával kapcsolatos → modals/*.js
 * - Státusz panellel kapcsolatos → ui/status-panel.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';
import { gameState } from '../gameState.js';

export function updateOpenModals() {
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

