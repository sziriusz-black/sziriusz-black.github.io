/**
 * @file modals/discord-modal.js
 * @description Discord modal kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Modal nyitás (openDiscordModal)
 * - Modal zárás (closeDiscordModal)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más modal-lal kapcsolatos → modals/*.js
 * - Settings menüvel kapcsolatos → settings.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

export function openDiscordModal() {
    const modal = document.getElementById('discordModal');
    modal.classList.remove('hidden');
}

export function closeDiscordModal() {
    const modal = document.getElementById('discordModal');
    modal.classList.add('hidden');
}

