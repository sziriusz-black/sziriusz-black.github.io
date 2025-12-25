/**
 * @file modals/modal-sliders.js
 * @description Modal slider-ek eseménykezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Deszka slider frissítése
 * - Kukorica slider frissítése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Deszka modal-lal kapcsolatos → modals/plank-modal.js
 * - Kukorica modal-lal kapcsolatos → modals/corn-modal.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

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

