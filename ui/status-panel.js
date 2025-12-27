/**
 * @file ui/status-panel.js
 * @description Státusz panel frissítése - pénz, deszka, kukorica, munkások
 * 
 * FELELŐSSÉGI KÖR:
 * - Státusz értékek frissítése
 * - DOM elemek frissítése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Hibaüzenettel kapcsolatos → ui/error-message.js
 * - Modal frissítéssel kapcsolatos → ui/modal-updater.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from '../gameState.js';

export function updateStatusPanel() {
    const moneyEl = document.getElementById('money');
    const planksEl = document.getElementById('planks');
    const cornEl = document.getElementById('corn');
    const workersEl = document.getElementById('workers');
    const maxWorkersEl = document.getElementById('maxWorkers');
    
    // Bánya erőforrások
    const stoneEl = document.getElementById('stone');
    const ironEl = document.getElementById('iron');
    const coalEl = document.getElementById('coal');
    const diamondEl = document.getElementById('diamond');
    
    if (moneyEl) moneyEl.textContent = gameState.money;
    if (planksEl) planksEl.textContent = gameState.planks;
    if (cornEl) cornEl.textContent = gameState.corn;
    if (workersEl) workersEl.textContent = gameState.workers;
    if (maxWorkersEl) maxWorkersEl.textContent = gameState.maxWorkers;
    
    // Bánya erőforrások frissítése
    if (stoneEl) stoneEl.textContent = gameState.stone;
    if (ironEl) ironEl.textContent = gameState.iron;
    if (coalEl) coalEl.textContent = gameState.coal;
    if (diamondEl) diamondEl.textContent = gameState.diamond;
}

