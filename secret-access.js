/**
 * @file secret-access.js
 * @description Titkos hozzáférés és auth kezelése - visszaszámláló vagy játék megjelenítése
 * 
 * FELELŐSSÉGI KÖR:
 * - URL paraméter ellenőrzése (secret=67)
 * - Auth állapot ellenőrzése
 * - Visszaszámláló megjelenítése és frissítése
 * - Játék tartalom megjelenítése/elrejtése
 */

import { isLoggedIn, initAuthUI } from './auth.js';

// Téma inicializálása (hogy az auth és countdown képernyőn is működjön)
function initThemeEarly() {
    const savedTheme = localStorage.getItem('retroSkyblockTheme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// A céldátum amire visszaszámolunk (módosítható)
const TARGET_DATE = new Date('2026-01-17T12:00:00');

// Titkos kód ellenőrzése
function hasSecretAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('secret') === '67';
}

// Átirányítás a fő weboldalra
function redirectToMainSite() {
    window.location.href = 'https://sziriusz-black.hu';
}

// Ellenőrzi, hogy túl vagyunk-e az időponton
function isPastTargetDate() {
    return new Date() >= TARGET_DATE;
}

// Visszaszámláló frissítése
function updateCountdown() {
    const now = new Date();
    const difference = TARGET_DATE - now;

    const countdownElement = document.getElementById('countdownTimer');
    if (!countdownElement) return;

    if (difference <= 0) {
        // Túl vagyunk az időponton - átirányítás
        redirectToMainSite();
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
    // Téma korai inicializálása (mielőtt bármi megjelenne)
    initThemeEarly();
    
    const authOverlay = document.getElementById('authOverlay');
    const gameContent = document.getElementById('gameContent');
    const countdownOverlay = document.getElementById('countdownOverlay');

    // Ha nincs bejelentkezve, auth form megjelenítése
    if (!isLoggedIn()) {
        if (authOverlay) authOverlay.classList.remove('hidden');
        if (gameContent) gameContent.classList.add('hidden');
        if (countdownOverlay) countdownOverlay.classList.add('hidden');
        
        // Auth UI inicializálása
        initAuthUI();
        return false;
    }

    // Bejelentkezett felhasználó
    if (authOverlay) authOverlay.classList.add('hidden');

    if (hasSecretAccess()) {
        // Van titkos hozzáférés - játék megjelenítése
        if (gameContent) gameContent.classList.remove('hidden');
        if (countdownOverlay) countdownOverlay.classList.add('hidden');
        return true;
    } else {
        // Nincs titkos hozzáférés
        // Ha már túl vagyunk az időponton, rögtön átirányítunk
        if (isPastTargetDate()) {
            redirectToMainSite();
            return false;
        }
        
        // Visszaszámláló megjelenítése
        if (gameContent) gameContent.classList.add('hidden');
        if (countdownOverlay) countdownOverlay.classList.remove('hidden');
        
        // Visszaszámláló indítása
        updateCountdown();
        setInterval(updateCountdown, 1000);
        return false;
    }
}

export { initSecretAccess, hasSecretAccess };
