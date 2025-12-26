/**
 * @file secret-access.js
 * @description Titkos hozzáférés kezelése - visszaszámláló vagy játék megjelenítése
 * 
 * FELELŐSSÉGI KÖR:
 * - URL paraméter ellenőrzése (secret=67)
 * - Visszaszámláló megjelenítése és frissítése
 * - Játék tartalom megjelenítése/elrejtése
 */

// A céldátum amire visszaszámolunk (módosítható)
const TARGET_DATE = new Date('2025-01-01T00:00:00');

// Titkos kód ellenőrzése
function hasSecretAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('secret') === '67';
}

// Visszaszámláló frissítése
function updateCountdown() {
    const now = new Date();
    const difference = TARGET_DATE - now;

    const countdownElement = document.getElementById('countdownTimer');
    if (!countdownElement) return;

    if (difference <= 0) {
        countdownElement.textContent = '🎮 Hamarosan...';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Inicializálás
function initSecretAccess() {
    const gameContent = document.getElementById('gameContent');
    const countdownOverlay = document.getElementById('countdownOverlay');

    if (hasSecretAccess()) {
        // Van titkos hozzáférés - játék megjelenítése
        if (gameContent) gameContent.classList.remove('hidden');
        if (countdownOverlay) countdownOverlay.classList.add('hidden');
        return true;
    } else {
        // Nincs titkos hozzáférés - visszaszámláló megjelenítése
        if (gameContent) gameContent.classList.add('hidden');
        if (countdownOverlay) countdownOverlay.classList.remove('hidden');
        
        // Visszaszámláló indítása
        updateCountdown();
        setInterval(updateCountdown, 1000);
        return false;
    }
}

export { initSecretAccess, hasSecretAccess };

