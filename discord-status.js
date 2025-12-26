/**
 * @file discord-status.js
 * @description Discord szerver online státusz ellenőrzése
 * 
 * FELELŐSSÉGI KÖR:
 * - Discord widget API lekérése
 * - Online jelző megjelenítése/elrejtése
 */

const DISCORD_WIDGET_URL = 'https://discord.com/api/guilds/1437007225230196788/widget.json';

// Discord online státusz ellenőrzése
async function checkDiscordOnlineStatus() {
    try {
        const response = await fetch(DISCORD_WIDGET_URL);
        
        if (!response.ok) {
            console.error('Discord widget API hiba:', response.status);
            return;
        }
        
        const data = await response.json();
        const onlineIndicator = document.getElementById('discordOnlineIndicator');
        
        if (onlineIndicator) {
            // Ha van online felhasználó, megjelenítjük a zöld pöttyöt
            if (data.presence_count && data.presence_count > 0) {
                onlineIndicator.classList.remove('hidden');
                onlineIndicator.title = `${data.presence_count} online`;
            } else {
                onlineIndicator.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Discord státusz lekérés hiba:', error.message);
    }
}

// Inicializálás és periodikus frissítés
function initDiscordStatus() {
    // Első ellenőrzés
    checkDiscordOnlineStatus();
    
    // Frissítés 60 másodpercenként
    setInterval(checkDiscordOnlineStatus, 60000);
}

export { initDiscordStatus };

