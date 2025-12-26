/**
 * @file ui/error-message.js
 * @description Hibaüzenet megjelenítése
 * 
 * FELELŐSSÉGI KÖR:
 * - Hibaüzenet megjelenítése (showError)
 * - Hibaüzenet automatikus elrejtése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Státusz panellel kapcsolatos → ui/status-panel.js
 * - Modal frissítéssel kapcsolatos → ui/modal-updater.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

export function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => {
        errorMsg.classList.add('hidden');
    }, 3000);
}

