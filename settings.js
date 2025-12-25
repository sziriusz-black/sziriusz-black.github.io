/**
 * @file settings.js
 * @description Beállítások menü kezelése - fogaskerék dropdown
 * 
 * FELELŐSSÉGI KÖR:
 * - Settings menü nyitás/zárás (toggleSettingsMenu, closeSettingsMenu)
 * - Hang ki/be kapcsolás (handleSoundToggle)
 * - Hang ikon állapot frissítése (updateSoundIcon)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Hangkezeléssel kapcsolatos (lejátszás, stb.) → audio.js
 * - Modal ablakokkal kapcsolatos → modals.js
 * - UI frissítéssel kapcsolatos → ui.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { toggleMute, isMusicMuted } from './audio.js';

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

