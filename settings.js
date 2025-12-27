/**
 * @file settings.js
 * @description Beállítások menü kezelése - fogaskerék dropdown
 * 
 * FELELŐSSÉGI KÖR:
 * - Settings menü nyitás/zárás (toggleSettingsMenu, closeSettingsMenu)
 * - Hang ki/be kapcsolás (handleSoundToggle)
 * - Hang ikon állapot frissítése (updateSoundIcon)
 * - Nyelvváltás kezelése (handleLanguageToggle, updateLanguageFlag)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Hangkezeléssel kapcsolatos (lejátszás, stb.) → audio.js
 * - Modal ablakokkal kapcsolatos → modals.js
 * - UI frissítéssel kapcsolatos → ui.js
 * - Fordításokkal kapcsolatos → i18n.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { toggleMute, isMusicMuted } from './audio.js';
import { cycleLanguage, getLanguage, FLAGS, LANGUAGE_NAMES, getNextLanguage, t } from './i18n.js';
import { logout } from './auth.js';
import { openShopModal } from './modals.js';

// === THEME KEZELÉS ===
const THEME_STORAGE_KEY = 'retroSkyblockTheme';

export function getTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

export function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
}

export function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    updateThemeUI(theme);
}

export function updateThemeUI(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const themeMenuItem = document.getElementById('themeMenuItem');
    
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    }
    
    if (themeText) {
        themeText.textContent = theme === 'light' ? 'Téma: Világos' : 'Téma: Sötét';
    }
    
    if (themeMenuItem) {
        themeMenuItem.title = theme === 'light' ? 'Váltás sötét témára' : 'Váltás világos témára';
    }
}

export function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

export function initTheme() {
    const savedTheme = getTheme();
    applyTheme(savedTheme);
}

export function toggleSettingsMenu() {
    const menu = document.getElementById('settingsMenu');
    const icon = document.getElementById('settingsIcon');
    menu.classList.toggle('hidden');
    icon.classList.toggle('open');
}

export function closeSettingsMenu() {
    const menu = document.getElementById('settingsMenu');
    const icon = document.getElementById('settingsIcon');
    menu.classList.add('hidden');
    icon.classList.remove('open');
}

export function handleSoundToggle() {
    toggleMute();
    updateSoundIcon();
}

export function updateSoundIcon() {
    const soundMenuItem = document.getElementById('soundMenuItem');
    const soundOnIcon = document.getElementById('soundOnIcon');
    const soundOffIcon = document.getElementById('soundOffIcon');
    
    if (isMusicMuted()) {
        soundMenuItem.classList.add('muted');
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    } else {
        soundMenuItem.classList.remove('muted');
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
    }
}

export function handleLanguageToggle() {
    cycleLanguage();
    updateLanguageFlag();
}

export function updateLanguageFlag() {
    const languageFlag = document.getElementById('languageFlag');
    const languageText = document.getElementById('languageText');
    const languageMenuItem = document.getElementById('languageMenuItem');
    const currentLang = getLanguage();
    
    if (languageFlag) {
        languageFlag.textContent = FLAGS[currentLang];
    }
    
    if (languageText) {
        languageText.textContent = `${t('settings.language')}: ${LANGUAGE_NAMES[currentLang]}`;
    }
    
    if (languageMenuItem) {
        languageMenuItem.title = `${t('settings.language')}: ${LANGUAGE_NAMES[currentLang]}`;
    }
}

export function handleLogout() {
    logout();
    window.location.reload();
}

export function handleCredits() {
    window.open('https://sziriusz-black.github.io/credits', '_blank');
}

export function handleThemeToggle() {
    toggleTheme();
}

export function handleShop() {
    closeSettingsMenu();
    openShopModal();
}

