/**
 * @file ui.js
 * @description UI frissítés és hibaüzenetek kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Státusz panel frissítése (updateUI) - pénz, deszka, kukorica, munkások
 * - Hibaüzenetek megjelenítése (showError)
 * - Nyitott modalok értékeinek frissítése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Modal ablakokkal kapcsolatos → modals.js
 * - Buborék kezeléssel kapcsolatos → bubble.js
 * - Beállítások menüvel kapcsolatos → settings.js
 * - Játék állapottal kapcsolatos → gameState.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { CONFIG } from './config.js';
import { gameState } from './gameState.js';

export function updateUI() {
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

export function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => {
        errorMsg.classList.add('hidden');
    }, 3000);
}

