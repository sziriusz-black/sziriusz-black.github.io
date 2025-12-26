/**
 * @file chat.js
 * @description Chat funkciók kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Chat ablak megnyitása/bezárása
 * - Üzenetek megjelenítése
 * - Üzenet küldés (localStorage alapú demo)
 * - Admin parancsok kezelése
 */

import { getCurrentUser, getUsers } from './auth.js';
import { gameState } from './gameState.js';

const CHAT_STORAGE_KEY = 'retroSkyblockChat';
const REPORTS_STORAGE_KEY = 'retroSkyblockChatReports';
const MUTES_STORAGE_KEY = 'retroSkyblockChatMutes';
const MAX_MESSAGES = 50;
const ADMIN_USERNAMES = ['Szíriusz', 'Szirius', 'szíriusz', 'szirius'];

// Trágár szavak listája
const PROFANITY_LIST = [
    // Magyar
    'kurva', 'fasz', 'faszom', 'geci', 'gecis', 'pina', 'pinas', 'csöcs', 'segg', 'segges',
    'buzi', 'buzis', 'köcsög', 'ribanc', 'szar', 'szaros', 'baszd', 'basz', 'kibasz',
    'megbasz', 'anyad', 'anyád', 'picsa', 'picsába', 'fasza', 'bazmeg', 'baszdmeg',
    // Angol
    'fuck', 'shit', 'bitch', 'ass', 'asshole', 'dick', 'cock', 'pussy', 'cunt',
    'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut'
];

// Admin-e a felhasználó
function isAdmin(username) {
    return ADMIN_USERNAMES.some(admin => 
        admin.toLowerCase() === username.toLowerCase()
    );
}

// Trágár szó ellenőrzése
function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    for (const word of PROFANITY_LIST) {
        if (lowerText.includes(word)) {
            return word;
        }
    }
    return null;
}

// Jelentések betöltése
function getReports() {
    try {
        const reports = localStorage.getItem(REPORTS_STORAGE_KEY);
        return reports ? JSON.parse(reports) : [];
    } catch (error) {
        return [];
    }
}

// Jelentés mentése
function saveReport(username, message, detectedWord) {
    const reports = getReports();
    reports.push({
        id: crypto.randomUUID(),
        username: username,
        message: message,
        detectedWord: detectedWord,
        timestamp: Date.now(),
        seen: false
    });
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

// Olvasatlan jelentések száma
function getUnseenReportsCount() {
    return getReports().filter(r => !r.seen).
length;
}

// Jelentések megjelölése olvasottként
function markReportsAsSeen() {
    const reports = getReports();
    reports.forEach(r => r.seen = true);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

// === MUTE RENDSZER ===

// Mute-ok betöltése
function getMutes() {
    try {
        const mutes = localStorage.getItem(MUTES_STORAGE_KEY);
        return mutes ? JSON.parse(mutes) : [];
    } catch (error) {
        return [];
    }
}

// Mute mentése
function saveMutes(mutes) {
    localStorage.setItem(MUTES_STORAGE_KEY, JSON.stringify(mutes));
}

// Idő string parse-olása (pl. "1d", "2h", "30m")
function parseTimeString(timeStr) {
    const regex = /^(\d+)([dhm])$/i;
    const match = timeStr.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    let milliseconds = 0;
    switch (unit) {
        case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
        case 'h': milliseconds = value * 60 * 60 * 1000; break;
        case 'm': milliseconds = value * 60 * 1000; break;
    }
    
    return milliseconds;
}

// Mute hozzáadása
function addMute(username, durationMs) {
    const mutes = getMutes();
    const expiresAt = Date.now() + durationMs;
    
    // Ha már van mute, frissítjük
    const existingIndex = mutes.findIndex(m => m.username.toLowerCase() === username.toLowerCase());
    if (existingIndex >= 0) {
        mutes[existingIndex].expiresAt = expiresAt;
    } else {
        mutes.push({
            username: username,
            expiresAt: expiresAt
        });
    }
    
    saveMutes(mutes);
}

// Mute ellenőrzése - visszaadja a hátralévő időt ms-ben, vagy null ha nincs mute
function checkMute(username) {
    const mutes = getMutes();
    const mute = mutes.find(m => m.username.toLowerCase() === username.toLowerCase());
    
    if (!mute) return null;
    
    const remaining = mute.expiresAt - Date.now();
    
    if (remaining <= 0) {
        // Mute lejárt, töröljük
        const newMutes = mutes.filter(m => m.username.toLowerCase() !== username.toLowerCase());
        saveMutes(newMutes);
        return null;
    }
    
    return remaining;
}

// Hátralévő idő formázása
function formatRemainingTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} nap ${hours % 24} óra`;
    } else if (hours > 0) {
        return `${hours} óra ${minutes % 60} perc`;
    } else if (minutes > 0) {
        return `${minutes} perc`;
    } else {
        return `${seconds} másodperc`;
    }
}

// Chat üzenetek betöltése
function getChatMessages() {
    try {
        const messages = localStorage.getItem(CHAT_STORAGE_KEY);
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('Chat üzenetek betöltése sikertelen:', error.message);
        return [];
    }
}

// Chat üzenetek mentése
function saveChatMessages(messages) {
    try {
        // Csak az utolsó MAX_MESSAGES üzenetet tartjuk meg
        const trimmedMessages = messages.slice(-MAX_MESSAGES);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmedMessages));
    } catch (error) {
        console.error('Chat üzenetek mentése sikertelen:', error.message);
    }
}

// Rendszer üzenet hozzáadása
function addSystemMessage(text) {
    const messages = getChatMessages();
    messages.push({
        id: crypto.randomUUID(),
        userId: 'system',
        username: '⚙️ Rendszer',
        text: text,
        timestamp: Date.now(),
        type: 'system'
    });
    saveChatMessages(messages);
    renderMessages();
}

// Parancs feldolgozása
function processCommand(text, currentUser) {
    if (!text.startsWith('/')) return false;
    
    const parts = text.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Publikus parancsok (mindenki használhatja)
    if (command === 'player' || command === 'players') {
        window.open('player.html', '_blank');
        addSystemMessage('📋 Játékosok oldal megnyitva!');
        return true;
    }
    
    if (command === 'help') {
        if (isAdmin(currentUser.username)) {
            // Admin help - összes parancs
            addSystemMessage(
                '📋 Elérhető parancsok:\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '👥 Publikus:\n' +
                '/help - Parancsok listája\n' +
                '/player - Játékosok listája\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '👑 Admin:\n' +
                '/clear - Chat törlése\n' +
                '/broadcast [üzenet] - Rendszer üzenet\n' +
                '/reset - Játék újrakezdése\n' +
                '/reports - Jelentések\n' +
                '/mute [név] [idő] - Némítás\n' +
                '/unmute [név] - Némítás feloldása\n' +
                '/info [név] - Játékos adatai'
            );
        } else {
            // Normál help - csak publikus parancsok
            addSystemMessage(
                '📋 Elérhető parancsok:\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '/help - Parancsok listája\n' +
                '/player - Játékosok listája'
            );
        }
        return true;
    }
    
    // Admin ellenőrzés (a többi parancshoz)
    if (!isAdmin(currentUser.username)) {
        addSystemMessage('❌ Nincs jogosultságod ehhez a parancshoz!');
        return true;
    }
    
    switch (command) {
        case 'clear':
            saveChatMessages([]);
            addSystemMessage('🗑️ Chat törölve!');
            break;
            
        case 'broadcast':
            if (args.length === 0) {
                addSystemMessage('❌ Használat: /broadcast [üzenet]');
            } else {
                const broadcastText = args.join(' ');
                addSystemMessage(`📢 ${broadcastText}`);
            }
            break;
            
        case 'reset':
            if (confirm('Biztosan újra akarod kezdeni a játékot?')) {
                localStorage.removeItem('retroSkyblockSave');
                window.location.reload();
            }
            break;
            
        case 'reports':
            const reports = getReports();
            const unseenReports = reports.filter(r => !r.seen);
            if (reports.length === 0) {
                addSystemMessage('📋 Nincsenek jelentések.');
            } else {
                let reportText = `📋 Jelentések (${unseenReports.length} új):\n`;
                reports.slice(-10).forEach(r => {
                    const date = new Date(r.timestamp);
                    const timeStr = `${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;
                    const newMark = r.seen ? '' : '🆕 ';
                    reportText += `${newMark}[${timeStr}] ${r.username}: "${r.message}" (${r.detectedWord})\n`;
                });
                addSystemMessage(reportText);
                markReportsAsSeen();
            }
            break;
            
        case 'mute':
            if (args.length < 2) {
                addSystemMessage('❌ Használat: /mute [játékosnév] [idő]\nIdő formátum: 30m (perc), 2h (óra), 1d (nap)');
            } else {
                const muteUsername = args[0];
                const muteTimeStr = args[1];
                const muteDuration = parseTimeString(muteTimeStr);
                
                if (!muteDuration) {
                    addSystemMessage('❌ Érvénytelen idő formátum!\nPéldák: 30m (30 perc), 2h (2 óra), 1d (1 nap)');
                } else if (isAdmin(muteUsername)) {
                    addSystemMessage('❌ Admint nem lehet némítani!');
                } else {
                    addMute(muteUsername, muteDuration);
                    addSystemMessage(`🔇 ${muteUsername} némítva ${formatRemainingTime(muteDuration)} időtartamra!`);
                }
            }
            break;
            
        case 'unmute':
            if (args.length < 1) {
                addSystemMessage('❌ Használat: /unmute [játékosnév]');
            } else {
                const unmuteUsername = args[0];
                const mutes = getMutes();
                const muteIndex = mutes.findIndex(m => m.username.toLowerCase() === unmuteUsername.toLowerCase());
                
                if (muteIndex < 0) {
                    addSystemMessage(`❌ ${unmuteUsername} nincs némítva!`);
                } else {
                    mutes.splice(muteIndex, 1);
                    saveMutes(mutes);
                    addSystemMessage(`🔊 ${unmuteUsername} némítása feloldva!`);
                }
            }
            break;
            
        case 'info':
            const infoUsername = args.length > 0 ? args[0] : currentUser.username;
            const isSelf = infoUsername.toLowerCase() === currentUser.username.toLowerCase();
            
            // Regisztrált felhasználó keresése
            const users = getUsers();
            const targetUser = users.find(u => u.username.toLowerCase() === infoUsername.toLowerCase());
            
            if (!targetUser) {
                addSystemMessage(`❌ Nincs "${infoUsername}" nevű regisztrált játékos!`);
            } else {
                const regDate = new Date(targetUser.createdAt);
                const regDateStr = `${regDate.getFullYear()}.${(regDate.getMonth()+1).toString().padStart(2,'0')}.${regDate.getDate().toString().padStart(2,'0')} ${regDate.getHours().toString().padStart(2,'0')}:${regDate.getMinutes().toString().padStart(2,'0')}`;
                
                let infoText = `📊 ${targetUser.username} adatai:\n`;
                infoText += `━━━━━━━━━━━━━━━━━━━━\n`;
                infoText += `📅 Regisztráció: ${regDateStr}\n`;
                infoText += `👑 Admin: ${isAdmin(targetUser.username) ? 'Igen' : 'Nem'}\n`;
                
                // Mute állapot
                const targetMute = checkMute(targetUser.username);
                if (targetMute) {
                    infoText += `🔇 Némítva: ${formatRemainingTime(targetMute)}\n`;
                }
                
                // Saját játékadatok (csak ha saját magát nézi)
                if (isSelf) {
                    infoText += `━━━━━━━━━━━━━━━━━━━━\n`;
                    infoText += `💰 Arany: ${gameState.money.toLocaleString()}\n`;
                    infoText += `🪵 Deszka: ${gameState.planks.toLocaleString()}\n`;
                    infoText += `🌽 Kukorica: ${gameState.corn.toLocaleString()}\n`;
                    infoText += `👷 Munkások: ${gameState.workers}/${gameState.maxWorkers}\n`;
                    infoText += `🗺️ Területek: ${gameState.map.length} db\n`;
                    
                    // Épületek számolása
                    const houses = gameState.map.filter(t => t.type === 'house').length;
                    const trees = gameState.map.filter(t => t.type === 'tree').length;
                    const stonecutters = gameState.map.filter(t => t.type === 'stoneCutter').length;
                    const cornfields = gameState.map.filter(t => t.type === 'corn' || t.type === 'cornEmpty').length;
                    
                    infoText += `━━━━━━━━━━━━━━━━━━━━\n`;
                    infoText += `🏠 Házak: ${houses}\n`;
                    infoText += `🌲 Fák: ${trees}\n`;
                    infoText += `⛏️ Kővágók: ${stonecutters}\n`;
                    infoText += `🌾 Kukoricaföldek: ${cornfields}`;
                } else {
                    infoText += `\n⚠️ Részletes játékadatok csak saját profilnál láthatók.`;
                }
                
                addSystemMessage(infoText);
            }
            break;
            
        default:
            addSystemMessage(`❌ Ismeretlen parancs: /${command}\nÍrd be /help a parancsok listájához.`);
    }
    
    return true;
}

// Idő formázása
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Üzenetek megjelenítése
function renderMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    const messages = getChatMessages();
    const currentUser = getCurrentUser();
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="chat-empty">Még nincsenek üzenetek.<br>Légy te az első!</div>';
        return;
    }
    
    messagesContainer.innerHTML = messages.map(msg => {
        const isOwn = currentUser && msg.userId === currentUser.id;
        const isSystem = msg.type === 'system';
        const isAdminUser = msg.type === 'user' && isAdmin(msg.username);
        
        let messageClass = 'chat-message';
        if (isOwn) messageClass += ' own';
        if (isSystem) messageClass += ' system';
        if (isAdminUser) messageClass += ' admin';
        
        const adminBadge = isAdminUser ? ' <span class="admin-badge">👑</span>' : '';
        
        return `
            <div class="${messageClass}">
                <div class="chat-message-header">
                    <span class="chat-message-user">${escapeHtml(msg.username)}${adminBadge}</span>
                    <span class="chat-message-time">${formatTime(msg.timestamp)}</span>
                </div>
                <div class="chat-message-text">${escapeHtml(msg.text).replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }).join('');
    
    // Görgetés az aljára
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Üzenet küldése
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('Nincs bejelentkezett felhasználó a chat küldéshez');
        return;
    }
    
    input.value = '';
    
    // Parancs ellenőrzése
    if (text.startsWith('/')) {
        processCommand(text, currentUser);
        return;
    }
    
    // Mute ellenőrzése
    const muteRemaining = checkMute(currentUser.username);
    if (muteRemaining) {
        addSystemMessage(`🔇 Le vagy némítva! Hátralévő idő: ${formatRemainingTime(muteRemaining)}`);
        return;
    }
    
    // Trágár szó ellenőrzése (admin kivételével)
    if (!isAdmin(currentUser.username)) {
        const detectedWord = containsProfanity(text);
        if (detectedWord) {
            // Jelentés mentése az adminnak
            saveReport(currentUser.username, text, detectedWord);
            
            // Figyelmeztetés a felhasználónak
            addSystemMessage(`⚠️ ${currentUser.username}, a káromkodás nem megengedett! Az üzeneted nem lett elküldve és jelentve lett az adminnak.`);
            return;
        }
    }
    
    const messages = getChatMessages();
    const newMessage = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        username: currentUser.username,
        text: text,
        timestamp: Date.now(),
        type: 'user'
    };
    
    messages.push(newMessage);
    saveChatMessages(messages);
    renderMessages();
}

// Chat megnyitása
function openChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.remove('hidden');
    renderMessages();
    
    // Input fókuszálása
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 100);
}

// Chat bezárása
function closeChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.add('hidden');
}

// Chat nyitva van-e
function isChatOpen() {
    const chatWindow = document.getElementById('chatWindow');
    return chatWindow && !chatWindow.classList.contains('hidden');
}

// Chat inicializálása
function initChat() {
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    
    if (chatClose) {
        chatClose.addEventListener('click', closeChat);
    }
    
    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Escape gomb kezelése
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isChatOpen()) {
            closeChat();
        }
    });
    
    // Kívülre kattintás kezelése
    document.addEventListener('click', (e) => {
        const chatWindow = document.getElementById('chatWindow');
        const chatMenuItem = document.getElementById('chatMenuItem');
        
        if (isChatOpen() && 
            chatWindow && 
            !chatWindow.contains(e.target) && 
            chatMenuItem && 
            !chatMenuItem.contains(e.target)) {
            closeChat();
        }
    });
}

export { openChat, closeChat, initChat };
