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
const BROADCAST_STORAGE_KEY = 'retroSkyblockBroadcast';
const REPORTS_STORAGE_KEY = 'retroSkyblockChatReports';
const MUTES_STORAGE_KEY = 'retroSkyblockChatMutes';
const PENDING_GIFTS_KEY = 'retroSkyblockPendingGifts';
const MAX_MESSAGES = 50;
const ADMIN_USERNAMES = ['Szíriusz', 'Szirius', 'szíriusz', 'szirius'];
const MESSAGE_COOLDOWN_MS = 5000; // 5 másodperc cooldown

let lastMessageTime = 0;
let autocompleteSelectedIndex = -1;

// === PARANCS ELŐZMÉNYEK ===
const commandHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50; // Maximum 50 parancs tárolása

// === PARANCS DEFINÍCIÓK (autocomplete-hez) ===
const COMMANDS = [
    { name: 'help', description: 'Parancsok listája', adminOnly: false },
    { name: 'player', description: 'Játékosok oldal megnyitása', adminOnly: false },
    { name: 'gift', description: 'Ajándék küldése: /gift [kinek] [mit] [mennyit]', adminOnly: false },
    { name: 'ah', description: 'Aukciós ház megnyitása', adminOnly: false },
    { name: 'auctionhouse', description: 'Aukciós ház megnyitása', adminOnly: false },
    { name: 'clear', description: 'Chat törlése', adminOnly: true },
    { name: 'broadcast', description: 'Kiemelt üzenet mindenkinek: /broadcast [üzenet]', adminOnly: true },
    { name: 'clearbroadcast', description: 'Broadcast üzenetek törlése', adminOnly: true },
    { name: 'give', description: 'Erőforrás hozzáadása: /give [mit] [mennyit]', adminOnly: true },
    { name: 'lose', description: 'Erőforrás levonása: /lose [kitől] [mit] [mennyit]', adminOnly: true },
    { name: 'reset', description: 'Játék újrakezdése', adminOnly: true },
    { name: 'reports', description: 'Jelentések megtekintése', adminOnly: true },
    { name: 'mute', description: 'Játékos némítása: /mute [név] [idő]', adminOnly: true },
    { name: 'unmute', description: 'Némítás feloldása: /unmute [név]', adminOnly: true },
    { name: 'info', description: 'Játékos adatai: /info [név]', adminOnly: true }
];

// === PENDING GIFTS RENDSZER ===

// Pending gifts betöltése
function getPendingGifts() {
    try {
        const gifts = localStorage.getItem(PENDING_GIFTS_KEY);
        return gifts ? JSON.parse(gifts) : [];
    } catch (error) {
        return [];
    }
}

// Pending gifts mentése
function savePendingGifts(gifts) {
    localStorage.setItem(PENDING_GIFTS_KEY, JSON.stringify(gifts));
}

// Ajándék hozzáadása a pending listához
function addPendingGift(recipientUsername, resourceType, amount, senderUsername) {
    const gifts = getPendingGifts();
    gifts.push({
        id: crypto.randomUUID(),
        recipientUsername: recipientUsername.toLowerCase(),
        resourceType: resourceType,
        amount: amount,
        senderUsername: senderUsername,
        timestamp: Date.now()
    });
    savePendingGifts(gifts);
}

// Pending ajándékok feldolgozása a jelenlegi felhasználó számára
function processPendingGifts(currentUser) {
    if (!currentUser) return;
    
    const gifts = getPendingGifts();
    const myGifts = gifts.filter(g => g.recipientUsername === currentUser.username.toLowerCase());
    const otherGifts = gifts.filter(g => g.recipientUsername !== currentUser.username.toLowerCase());
    
    if (myGifts.length === 0) return;
    
    // Ajándékok feldolgozása
    myGifts.forEach(gift => {
        switch (gift.resourceType) {
            case 'arany':
                gameState.money += gift.amount;
                break;
            case 'deszka':
                gameState.planks += gift.amount;
                break;
            case 'kukorica':
                gameState.corn += gift.amount;
                break;
        }
    });
    
    // Feldolgozott ajándékok törlése
    savePendingGifts(otherGifts);
    
    // Játék mentése
    if (typeof window.saveGame === 'function') {
        window.saveGame();
    }
}

// Függő veszteségek (losses) feldolgozása
const PENDING_LOSSES_KEY = 'retroSkyblockPendingLosses';

function processPendingLosses(currentUser) {
    if (!currentUser) return;
    
    const losses = JSON.parse(localStorage.getItem(PENDING_LOSSES_KEY) || '[]');
    const myLosses = losses.filter(l => l.targetUsername.toLowerCase() === currentUser.username.toLowerCase());
    const otherLosses = losses.filter(l => l.targetUsername.toLowerCase() !== currentUser.username.toLowerCase());
    
    if (myLosses.length === 0) return;
    
    // Veszteségek feldolgozása
    myLosses.forEach(loss => {
        const resourceKey = loss.resourceKey;
        const amount = loss.amount;
        
        if (resourceKey === 'workers') {
            gameState.workers = Math.max(0, gameState.workers - amount);
            gameState.maxWorkers = Math.max(0, gameState.maxWorkers - amount);
        } else if (resourceKey === 'storage') {
            gameState.warehouseCapacity = Math.max(20, gameState.warehouseCapacity - amount);
        } else if (gameState[resourceKey] !== undefined) {
            gameState[resourceKey] = Math.max(0, gameState[resourceKey] - amount);
        }
        
        // Csendben feldolgozzuk, nem értesítjük a játékost
    });
    
    // Feldolgozott veszteségek törlése
    localStorage.setItem(PENDING_LOSSES_KEY, JSON.stringify(otherLosses));
    
    // UI frissítése és játék mentése
    import('./ui.js').then(({ updateUI }) => updateUI());
    import('./save-load.js').then(({ saveGameState }) => saveGameState());
}

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
    // Rendszer üzenetek csak Szíriusznak látszanak
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.username !== 'Szíriusz') {
        // Nem Szíriusz, nem jelenítjük meg a rendszer üzenetet
        return;
    }
    
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

// === BROADCAST RENDSZER ===
// A broadcast üzenetek NEM törlődnek frissítéskor, mindenki látja

function getBroadcasts() {
    try {
        const broadcasts = localStorage.getItem(BROADCAST_STORAGE_KEY);
        return broadcasts ? JSON.parse(broadcasts) : [];
    } catch (error) {
        return [];
    }
}

function saveBroadcasts(broadcasts) {
    // Csak az utolsó 10 broadcast-ot tartjuk meg
    const trimmed = broadcasts.slice(-10);
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(trimmed));
}

function addBroadcast(text, senderUsername) {
    const broadcasts = getBroadcasts();
    broadcasts.push({
        id: crypto.randomUUID(),
        text: text,
        senderUsername: senderUsername,
        timestamp: Date.now()
    });
    saveBroadcasts(broadcasts);
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
    
    if (command === 'ah' || command === 'auctionhouse') {
        openAuctionHouse();
        return true;
    }
    
    if (command === 'gift') {
        if (args.length < 3) {
            addSystemMessage('❌ Használat: /gift [kinek] [mit] [mennyit]\nPélda: /gift Teszt arany 100\nLehetséges típusok: arany, deszka, kukorica');
        } else {
            const recipientName = args[0];
            const resourceType = args[1].toLowerCase();
            const amount = parseInt(args[2]);
            
            // Ellenőrzések
            const users = getUsers();
            const recipient = users.find(u => u.username.toLowerCase() === recipientName.toLowerCase());
            
            if (!recipient) {
                addSystemMessage(`❌ Nincs "${recipientName}" nevű regisztrált játékos!`);
            } else if (isNaN(amount) || amount <= 0) {
                addSystemMessage('❌ Érvénytelen mennyiség! Pozitív számot adj meg.');
            } else {
                // Erőforrás típus ellenőrzése és levonása
                let resourceName = '';
                let hasEnough = false;
                
                switch (resourceType) {
                    case 'arany':
                    case 'gold':
                    case 'pénz':
                    case 'money':
                        resourceName = 'arany';
                        hasEnough = gameState.money >= amount;
                        if (hasEnough) gameState.money -= amount;
                        break;
                    case 'deszka':
                    case 'fa':
                    case 'planks':
                    case 'wood':
                        resourceName = 'deszka';
                        hasEnough = gameState.planks >= amount;
                        if (hasEnough) gameState.planks -= amount;
                        break;
                    case 'kukorica':
                    case 'corn':
                        resourceName = 'kukorica';
                        hasEnough = gameState.corn >= amount;
                        if (hasEnough) gameState.corn -= amount;
                        break;
                    default:
                        addSystemMessage('❌ Ismeretlen erőforrás típus!\nLehetséges típusok: arany, deszka, kukorica');
                        return true;
                }
                
                if (!hasEnough) {
                    addSystemMessage(`❌ Nincs elég ${resourceName} készleted! (Szükséges: ${amount})`);
                } else {
                    // Pending gift hozzáadása (a fogadó majd megkapja amikor megnyitja a chatot)
                    addPendingGift(recipient.username, resourceName, amount, currentUser.username);
                    
                    // Ajándék üzenet mentése
                    const messages = getChatMessages();
                    messages.push({
                        id: crypto.randomUUID(),
                        userId: currentUser.id,
                        username: currentUser.username,
                        recipientId: recipient.id,
                        recipientUsername: recipient.username,
                        resourceType: resourceName,
                        amount: amount,
                        timestamp: Date.now(),
                        type: 'gift'
                    });
                    saveChatMessages(messages);
                    
                    // Megerősítés a küldőnek
                    addSystemMessage(`🎁 Sikeresen küldtél ${amount} ${resourceName}t ${recipient.username} számára!`);
                    
                    // Játék mentése (a küldő készletéből már le lett vonva)
                    if (typeof window.saveGame === 'function') {
                        window.saveGame();
                    }
                }
            }
        }
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
                '/gift [kinek] [mit] [mennyit] - Ajándék küldése\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '👑 Admin:\n' +
                '/clear - Chat törlése\n' +
                '/broadcast [üzenet] - Kiemelt üzenet mindenkinek\n' +
                '/clearbroadcast - Broadcast üzenetek törlése\n' +
                '/give [mit] [mennyit] - Erőforrás hozzáadása\n' +
                '/lose [kitől] [mit] [mennyit] - Erőforrás levonása\n' +
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
                '/player - Játékosok listája\n' +
                '/gift [kinek] [mit] [mennyit] - Ajándék küldése'
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
                // Broadcast mentése - ez NEM törlődik frissítéskor
                addBroadcast(broadcastText, currentUser.username);
                addSystemMessage(`✅ Broadcast elküldve: "${broadcastText}"`);
                renderMessages(); // Frissítjük a megjelenítést
            }
            break;
            
        case 'clearbroadcast':
            localStorage.removeItem(BROADCAST_STORAGE_KEY);
            addSystemMessage('🗑️ Broadcast üzenetek törölve!');
            renderMessages();
            break;
            
        case 'give':
            handleGiveCommand(args);
            break;
            
        case 'lose':
            handleLoseCommand(args);
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
    const broadcasts = getBroadcasts();
    const currentUser = getCurrentUser();
    
    // Broadcast üzenetek HTML-je (ezek mindig felül jelennek meg)
    let broadcastsHtml = '';
    if (broadcasts.length > 0) {
        broadcastsHtml = broadcasts.map(broadcast => {
            const date = new Date(broadcast.timestamp);
            const timeStr = `${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;
            return `
                <div class="chat-message broadcast">
                    <div class="chat-message-header">
                        <span class="chat-message-user">📢 Rendszer</span>
                        <span class="chat-message-time">${timeStr}</span>
                    </div>
                    <div class="chat-message-text">${escapeHtml(broadcast.text)}</div>
                </div>
            `;
        }).join('');
    }
    
    if (messages.length === 0 && broadcasts.length === 0) {
        messagesContainer.innerHTML = '<div class="chat-empty">Még nincsenek üzenetek.<br>Légy te az első!</div>';
        return;
    }
    
    // Normál üzenetek
    const messagesHtml = messages.map(msg => {
        // Gift üzenetek csak a fogadónak jelennek meg
        if (msg.type === 'gift') {
            // Ha én vagyok a fogadó
            if (currentUser && msg.recipientUsername.toLowerCase() === currentUser.username.toLowerCase()) {
                return `
                    <div class="chat-message gift">
                        <div class="chat-message-header">
                            <span class="chat-message-user">🎁 Ajándék!</span>
                            <span class="chat-message-time">${formatTime(msg.timestamp)}</span>
                        </div>
                        <div class="chat-message-text">Ajándékot kaptál tőle: <strong>${escapeHtml(msg.username)}</strong><br>💎 ${msg.amount} ${msg.resourceType}</div>
                    </div>
                `;
            }
            // Ha nem nekem szól, nem jelenítjük meg
            return '';
        }
        
        // Rendszer üzenetek csak Szíriusznak jelennek meg
        if (msg.type === 'system') {
            if (!currentUser || currentUser.username !== 'Szíriusz') {
                return '';
            }
        }
        
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
    
    // Broadcast üzenetek felül, normál üzenetek alatta
    messagesContainer.innerHTML = broadcastsHtml + messagesHtml;
    
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
    
    // Parancs ellenőrzése (parancsokra nem vonatkozik a cooldown)
    if (text.startsWith('/')) {
        processCommand(text, currentUser);
        return;
    }
    
    // Cooldown ellenőrzése
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime;
    
    if (timeSinceLastMessage < MESSAGE_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((MESSAGE_COOLDOWN_MS - timeSinceLastMessage) / 1000);
        addSystemMessage(`⏳ Várj még ${remainingSeconds} másodpercet a következő üzenet előtt!`);
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
    
    // Cooldown frissítése
    lastMessageTime = Date.now();
}

// Chat megnyitása
function openChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.remove('hidden');
    
    // Pending ajándékok és büntetések feldolgozása
    const currentUser = getCurrentUser();
    if (currentUser) {
        processPendingGifts(currentUser);
        processPendingLosses(currentUser);
    }
    
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

// === AUTOCOMPLETE FUNKCIÓK ===

// Elérhető parancsok szűrése a felhasználó jogosultsága alapján
function getAvailableCommands() {
    const currentUser = getCurrentUser();
    const userIsAdmin = currentUser && isAdmin(currentUser.username);
    
    return COMMANDS.filter(cmd => !cmd.adminOnly || userIsAdmin);
}

// Parancsok szűrése a beírt szöveg alapján
function filterCommands(query) {
    const availableCommands = getAvailableCommands();
    const searchTerm = query.toLowerCase().slice(1); // "/" eltávolítása
    
    if (searchTerm === '') {
        return availableCommands;
    }
    
    return availableCommands.filter(cmd => 
        cmd.name.toLowerCase().startsWith(searchTerm)
    );
}

// Autocomplete menü megjelenítése
function showAutocomplete(filteredCommands) {
    let autocompleteMenu = document.getElementById('chatAutocomplete');
    
    if (!autocompleteMenu) {
        autocompleteMenu = document.createElement('div');
        autocompleteMenu.id = 'chatAutocomplete';
        autocompleteMenu.className = 'chat-autocomplete';
        const chatInputContainer = document.querySelector('.chat-input-container');
        if (chatInputContainer) {
            chatInputContainer.appendChild(autocompleteMenu);
        }
    }
    
    if (filteredCommands.length === 0) {
        hideAutocomplete();
        return;
    }
    
    autocompleteMenu.innerHTML = filteredCommands.map((cmd, index) => `
        <div class="chat-autocomplete-item ${index === autocompleteSelectedIndex ? 'selected' : ''}" 
             data-command="${cmd.name}"
             data-index="${index}">
            <span class="autocomplete-command">/${cmd.name}</span>
            <span class="autocomplete-desc">${cmd.description}</span>
            ${cmd.adminOnly ? '<span class="autocomplete-admin">👑</span>' : ''}
        </div>
    `).join('');
    
    autocompleteMenu.classList.remove('hidden');
    
    // Kattintás esemény az autocomplete elemekre
    autocompleteMenu.querySelectorAll('.chat-autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            selectAutocompleteCommand(item.dataset.command);
        });
        item.addEventListener('mouseenter', () => {
            autocompleteSelectedIndex = parseInt(item.dataset.index);
            updateAutocompleteSelection();
        });
    });
}

// Autocomplete menü elrejtése
function hideAutocomplete() {
    const autocompleteMenu = document.getElementById('chatAutocomplete');
    if (autocompleteMenu) {
        autocompleteMenu.classList.add('hidden');
    }
    autocompleteSelectedIndex = -1;
}

// Autocomplete kijelölés frissítése
function updateAutocompleteSelection() {
    const items = document.querySelectorAll('.chat-autocomplete-item');
    items.forEach((item, index) => {
        if (index === autocompleteSelectedIndex) {
            item.classList.add('selected');
            // Görgetés a látható területre
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Parancs kiválasztása az autocomplete-ből
function selectAutocompleteCommand(commandName) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = `/${commandName} `;
        chatInput.focus();
        hideAutocomplete();
    }
}

// Autocomplete kezelése input eseménykor
function handleAutocompleteInput(inputValue) {
    if (inputValue.startsWith('/')) {
        const filteredCommands = filterCommands(inputValue);
        autocompleteSelectedIndex = filteredCommands.length > 0 ? 0 : -1;
        showAutocomplete(filteredCommands);
    } else {
        hideAutocomplete();
    }
}

// Autocomplete navigáció billentyűzettel
function handleAutocompleteKeydown(event, inputValue) {
    const autocompleteMenu = document.getElementById('chatAutocomplete');
    const isAutocompleteVisible = autocompleteMenu && !autocompleteMenu.classList.contains('hidden');
    
    if (!isAutocompleteVisible) {
        return false; // Nem kezeltük az eseményt
    }
    
    const items = document.querySelectorAll('.chat-autocomplete-item');
    const itemCount = items.length;
    
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            autocompleteSelectedIndex = (autocompleteSelectedIndex + 1) % itemCount;
            updateAutocompleteSelection();
            return true;
            
        case 'ArrowUp':
            event.preventDefault();
            autocompleteSelectedIndex = (autocompleteSelectedIndex - 1 + itemCount) % itemCount;
            updateAutocompleteSelection();
            return true;
            
        case 'Tab':
            event.preventDefault();
            if (autocompleteSelectedIndex >= 0 && autocompleteSelectedIndex < itemCount) {
                const selectedItem = items[autocompleteSelectedIndex];
                selectAutocompleteCommand(selectedItem.dataset.command);
            }
            return true;
            
        case 'Escape':
            hideAutocomplete();
            return true;
            
        case 'Enter':
            if (autocompleteSelectedIndex >= 0 && autocompleteSelectedIndex < itemCount) {
                event.preventDefault();
                const selectedItem = items[autocompleteSelectedIndex];
                selectAutocompleteCommand(selectedItem.dataset.command);
                return true;
            }
            return false;
    }
    
    return false;
}

// Chat inicializálása
function initChat() {
    // Chat törlése oldal frissítéskor
    localStorage.removeItem(CHAT_STORAGE_KEY);
    
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
        // Input esemény az autocomplete-hez
        chatInput.addEventListener('input', (e) => {
            handleAutocompleteInput(e.target.value);
        });
        
        // Billentyűzet események
        chatInput.addEventListener('keydown', (e) => {
            // Először próbáljuk az autocomplete-tel kezelni
            const handled = handleAutocompleteKeydown(e, chatInput.value);
            
            // Ha nem kezelte az autocomplete és Enter volt, akkor üzenet küldés
            if (!handled && e.key === 'Enter') {
                hideAutocomplete();
                sendMessage();
            }
        });
        
        // Focus elvesztésekor elrejtjük az autocomplete-t (kis késleltetéssel a kattintás miatt)
        chatInput.addEventListener('blur', () => {
            setTimeout(hideAutocomplete, 150);
        });
    }
    
    // Escape gomb kezelése
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isChatOpen()) {
            hideAutocomplete();
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

// === ADMIN PARANCSOK: /give és /lose ===

// Erőforrás típusok
const RESOURCE_TYPES = {
    'penz': 'money', 'pénz': 'money', 'money': 'money', 'arany': 'money', 'gold': 'money',
    'deszka': 'planks', 'planks': 'planks', 'fa': 'planks', 'wood': 'planks',
    'kukorica': 'corn', 'corn': 'corn',
    'ko': 'stone', 'kő': 'stone', 'stone': 'stone',
    'vas': 'iron', 'iron': 'iron',
    'szen': 'coal', 'szén': 'coal', 'coal': 'coal',
    'gyemant': 'diamond', 'gyémánt': 'diamond', 'diamond': 'diamond',
    'munkas': 'workers', 'munkás': 'workers', 'workers': 'workers', 'worker': 'workers',
    'raktar': 'storage', 'raktár': 'storage', 'storage': 'storage'
};

const RESOURCE_ICONS = {
    'money': '💰',
    'planks': '🪵',
    'corn': '🌽',
    'stone': '🪨',
    'iron': '🔩',
    'coal': '⚫',
    'diamond': '💎',
    'workers': '👷',
    'storage': '📦'
};

// /give [mit] [mennyit] - Admin parancs erőforrás hozzáadásához
function handleGiveCommand(args) {
    if (args.length < 2) {
        addSystemMessage('❌ Használat: /give [mit] [mennyit]\nPéldák: /give pénz 100, /give deszka 50');
        return;
    }
    
    const resourceInput = args[0].toLowerCase();
    const amount = parseInt(args[1]);
    
    if (isNaN(amount) || amount <= 0) {
        addSystemMessage('❌ A mennyiségnek pozitív számnak kell lennie!');
        return;
    }
    
    const resourceKey = RESOURCE_TYPES[resourceInput];
    if (!resourceKey) {
        addSystemMessage(`❌ Ismeretlen erőforrás: "${args[0]}"\nElérhető: pénz, deszka, kukorica, kő, vas, szén, gyémánt, munkás, raktár`);
        return;
    }
    
    const icon = RESOURCE_ICONS[resourceKey];
    
    // Erőforrás hozzáadása
    if (resourceKey === 'workers') {
        gameState.workers += amount;
        gameState.maxWorkers += amount;
    } else if (resourceKey === 'storage') {
        gameState.warehouseCapacity += amount;
    } else {
        gameState[resourceKey] += amount;
    }
    
    // UI frissítése és mentés
    import('./ui.js').then(({ updateUI }) => updateUI());
    import('./save-load.js').then(({ saveGameState }) => saveGameState());
    
    addSystemMessage(`✅ ${icon} +${amount} ${resourceInput} hozzáadva!`);
}

// /lose [kitől] [mit] [mennyit] - Admin parancs erőforrás elvételéhez
function handleLoseCommand(args) {
    if (args.length < 3) {
        addSystemMessage('❌ Használat: /lose [kitől] [mit] [mennyit]\nPéldák: /lose Szíriusz pénz 100, /lose JátékosNév deszka 50');
        return;
    }
    
    const targetUsername = args[0];
    const resourceInput = args[1].toLowerCase();
    const amount = parseInt(args[2]);
    
    // Ellenőrizzük, hogy a célpont létezik-e
    const users = getUsers();
    const targetUser = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    
    if (!targetUser) {
        addSystemMessage(`❌ Nincs "${targetUsername}" nevű regisztrált játékos!`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        addSystemMessage('❌ A mennyiségnek pozitív számnak kell lennie!');
        return;
    }
    
    const resourceKey = RESOURCE_TYPES[resourceInput];
    if (!resourceKey) {
        addSystemMessage(`❌ Ismeretlen erőforrás: "${args[1]}"\nElérhető: pénz, deszka, kukorica, kő, vas, szén, gyémánt, munkás, raktár`);
        return;
    }
    
    const currentUser = getCurrentUser();
    
    // Ellenőrizzük, hogy saját magunkról van-e szó
    const isSelf = targetUser.username.toLowerCase() === currentUser.username.toLowerCase();
    
    if (isSelf) {
        // Saját erőforrás levonása - csendben
        if (resourceKey === 'workers') {
            gameState.workers = Math.max(0, gameState.workers - amount);
            gameState.maxWorkers = Math.max(0, gameState.maxWorkers - amount);
        } else if (resourceKey === 'storage') {
            gameState.warehouseCapacity = Math.max(20, gameState.warehouseCapacity - amount);
        } else {
            gameState[resourceKey] = Math.max(0, gameState[resourceKey] - amount);
        }
        
        // UI frissítése és mentés - nincs üzenet
        import('./ui.js').then(({ updateUI }) => updateUI());
        import('./save-load.js').then(({ saveGameState }) => saveGameState());
    } else {
        // Más játékos erőforrásának levonása - csendben pending loss-ként
        const pendingLosses = JSON.parse(localStorage.getItem('retroSkyblockPendingLosses') || '[]');
        pendingLosses.push({
            id: crypto.randomUUID(),
            targetUsername: targetUser.username,
            resourceKey: resourceKey,
            resourceName: resourceInput,
            amount: amount,
            fromAdmin: currentUser.username,
            timestamp: Date.now()
        });
        localStorage.setItem('retroSkyblockPendingLosses', JSON.stringify(pendingLosses));
    }
}

// === AUKCIÓS HÁZ ===

const AUCTION_STORAGE_KEY = 'retroSkyblockAuctions';

function getAuctions() {
    return JSON.parse(localStorage.getItem(AUCTION_STORAGE_KEY) || '[]');
}

function saveAuctions(auctions) {
    localStorage.setItem(AUCTION_STORAGE_KEY, JSON.stringify(auctions));
}

// Üzenet megjelenítése az aukciós házon belül
function showAuctionMessage(message, type = 'error') {
    const messageEl = document.getElementById('auctionMessage');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `auction-message show ${type}`;
    
    // 5 másodperc után eltűnik
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

// Aukciós ház megnyitása
function openAuctionHouse() {
    const modal = document.getElementById('auctionModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderAuctions();
        closeChat();
    }
}

// Aukciós ház bezárása
function closeAuctionHouse() {
    const modal = document.getElementById('auctionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Aukciók megjelenítése
function renderAuctions() {
    const container = document.getElementById('auctionList');
    if (!container) return;
    
    const auctions = getAuctions();
    const currentUser = getCurrentUser();
    const now = Date.now();
    
    // Lejárt aukciók szűrése és visszaadás a tulajdonosnak
    const activeAuctions = auctions.filter(auction => {
        if (auction.expiresAt < now) {
            // Lejárt - visszaadjuk az eladónak (pending gift)
            const pendingGifts = JSON.parse(localStorage.getItem(PENDING_GIFTS_KEY) || '[]');
            pendingGifts.push({
                id: crypto.randomUUID(),
                senderUsername: 'Aukciós Ház',
                recipientUsername: auction.sellerUsername.toLowerCase(),
                resourceType: auction.resourceType,
                amount: auction.amount,
                timestamp: Date.now()
            });
            localStorage.setItem(PENDING_GIFTS_KEY, JSON.stringify(pendingGifts));
            return false;
        }
        return true;
    });
    
    // Mentjük a szűrt listát
    if (activeAuctions.length !== auctions.length) {
        saveAuctions(activeAuctions);
    }
    
    if (activeAuctions.length === 0) {
        container.innerHTML = '<div class="auction-empty">🏪 Jelenleg nincsenek aktív aukciók.</div>';
        return;
    }
    
    container.innerHTML = activeAuctions.map(auction => {
        const timeLeft = Math.max(0, auction.expiresAt - now);
        const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / 60000);
        
        let timeDisplay;
        if (days > 0) {
            timeDisplay = `${days}n ${hours}ó`;
        } else if (hours > 0) {
            timeDisplay = `${hours}ó ${minutes}p`;
        } else {
            timeDisplay = `${minutes}p`;
        }
        
        const isOwn = currentUser && auction.sellerUsername.toLowerCase() === currentUser.username.toLowerCase();
        
        const resourceIcons = {
            'arany': '💰',
            'deszka': '🪵',
            'kukorica': '🌽',
            'kő': '🪨',
            'vas': '🔩',
            'szén': '⚫',
            'gyémánt': '💎'
        };
        const icon = resourceIcons[auction.resourceType] || '📦';
        
        return `
            <div class="auction-item ${isOwn ? 'own-auction' : ''}">
                <div class="auction-resource">
                    <span class="auction-icon">${icon}</span>
                    <span class="auction-amount">${auction.amount}x ${auction.resourceType}</span>
                </div>
                <div class="auction-seller">Eladó: ${auction.sellerUsername}</div>
                <div class="auction-price">💰 ${auction.price} arany</div>
                <div class="auction-time">⏱️ ${timeDisplay}</div>
                ${isOwn 
                    ? `<button class="auction-cancel-btn" data-id="${auction.id}">Visszavonás</button>`
                    : `<button class="auction-buy-btn" data-id="${auction.id}">Megvásárlás</button>`
                }
            </div>
        `;
    }).join('');
    
    // Gombok eseménykezelői
    container.querySelectorAll('.auction-buy-btn').forEach(btn => {
        btn.addEventListener('click', () => buyAuction(btn.dataset.id));
    });
    container.querySelectorAll('.auction-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => cancelAuction(btn.dataset.id));
    });
}

// Új aukció létrehozása
function createAuction(resourceType, amount, price) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuctionMessage('❌ Be kell jelentkezned az aukciózáshoz!', 'error');
        return false;
    }
    
    // Erőforrás ellenőrzése és levonása
    const resourceMap = {
        'arany': 'money',
        'deszka': 'planks',
        'kukorica': 'corn',
        'kő': 'stone',
        'vas': 'iron',
        'szén': 'coal',
        'gyémánt': 'diamond'
    };
    
    const stateKey = resourceMap[resourceType];
    if (!stateKey) {
        showAuctionMessage('❌ Ismeretlen erőforrás típus!', 'error');
        return false;
    }
    
    if (gameState[stateKey] < amount) {
        showAuctionMessage(`❌ Nincs elég ${resourceType}! (Van: ${gameState[stateKey]})`, 'error');
        return false;
    }
    
    // Levonás
    gameState[stateKey] -= amount;
    
    // Aukció létrehozása (30 perc lejárat)
    const auctions = getAuctions();
    auctions.push({
        id: crypto.randomUUID(),
        sellerUsername: currentUser.username,
        resourceType: resourceType,
        amount: amount,
        price: price,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 hét
    });
    saveAuctions(auctions);
    
    // UI frissítése
    import('./ui.js').then(({ updateUI }) => updateUI());
    import('./save-load.js').then(({ saveGameState }) => saveGameState());
    
    renderAuctions();
    return true;
}

// Aukció megvásárlása
function buyAuction(auctionId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const auctions = getAuctions();
    const auctionIndex = auctions.findIndex(a => a.id === auctionId);
    
    if (auctionIndex === -1) {
        showAuctionMessage('❌ Ez az aukció már nem elérhető!', 'error');
        renderAuctions();
        return;
    }
    
    const auction = auctions[auctionIndex];
    
    // Saját aukció ellenőrzése
    if (auction.sellerUsername.toLowerCase() === currentUser.username.toLowerCase()) {
        showAuctionMessage('❌ Nem vásárolhatod meg a saját aukciódat!', 'error');
        return;
    }
    
    // Pénz ellenőrzése
    if (gameState.money < auction.price) {
        showAuctionMessage(`❌ Nincs elég aranyad! (Kell: ${auction.price}, Van: ${gameState.money})`, 'error');
        return;
    }
    
    // Pénz levonása
    gameState.money -= auction.price;
    
    // Erőforrás hozzáadása
    const resourceMap = {
        'arany': 'money',
        'deszka': 'planks',
        'kukorica': 'corn',
        'kő': 'stone',
        'vas': 'iron',
        'szén': 'coal',
        'gyémánt': 'diamond'
    };
    const stateKey = resourceMap[auction.resourceType];
    if (stateKey) {
        gameState[stateKey] += auction.amount;
    }
    
    // Eladónak pénz küldése (pending gift)
    const pendingGifts = JSON.parse(localStorage.getItem(PENDING_GIFTS_KEY) || '[]');
    pendingGifts.push({
        id: crypto.randomUUID(),
        senderUsername: currentUser.username,
        recipientUsername: auction.sellerUsername.toLowerCase(),
        resourceType: 'arany',
        amount: auction.price,
        timestamp: Date.now()
    });
    localStorage.setItem(PENDING_GIFTS_KEY, JSON.stringify(pendingGifts));
    
    // Aukció eltávolítása
    auctions.splice(auctionIndex, 1);
    saveAuctions(auctions);
    
    // UI frissítése
    import('./ui.js').then(({ updateUI }) => updateUI());
    import('./save-load.js').then(({ saveGameState }) => saveGameState());
    
    showAuctionMessage(`✅ Sikeresen megvásároltad: ${auction.amount}x ${auction.resourceType} ${auction.price} aranyért!`, 'success');
    renderAuctions();
}

// Aukció visszavonása
function cancelAuction(auctionId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const auctions = getAuctions();
    const auctionIndex = auctions.findIndex(a => a.id === auctionId);
    
    if (auctionIndex === -1) {
        showAuctionMessage('❌ Ez az aukció már nem elérhető!', 'error');
        renderAuctions();
        return;
    }
    
    const auction = auctions[auctionIndex];
    
    // Tulajdonos ellenőrzése
    if (auction.sellerUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
        showAuctionMessage('❌ Csak a saját aukciódat vonhatod vissza!', 'error');
        return;
    }
    
    // Erőforrás visszaadása
    const resourceMap = {
        'arany': 'money',
        'deszka': 'planks',
        'kukorica': 'corn',
        'kő': 'stone',
        'vas': 'iron',
        'szén': 'coal',
        'gyémánt': 'diamond'
    };
    const stateKey = resourceMap[auction.resourceType];
    if (stateKey) {
        gameState[stateKey] += auction.amount;
    }
    
    // Aukció eltávolítása
    auctions.splice(auctionIndex, 1);
    saveAuctions(auctions);
    
    // UI frissítése
    import('./ui.js').then(({ updateUI }) => updateUI());
    import('./save-load.js').then(({ saveGameState }) => saveGameState());
    
    showAuctionMessage(`✅ Aukció visszavonva! ${auction.amount}x ${auction.resourceType} visszaadva.`, 'success');
    renderAuctions();
}

// Aukció létrehozása form kezelése
function handleCreateAuction() {
    const resourceSelect = document.getElementById('auctionResourceType');
    const amountInput = document.getElementById('auctionAmount');
    const priceInput = document.getElementById('auctionPrice');
    
    if (!resourceSelect || !amountInput || !priceInput) return;
    
    const resourceType = resourceSelect.value;
    const amount = parseInt(amountInput.value);
    const price = parseInt(priceInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showAuctionMessage('❌ Érvénytelen mennyiség!', 'error');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        showAuctionMessage('❌ Érvénytelen ár!', 'error');
        return;
    }
    
    if (createAuction(resourceType, amount, price)) {
        showAuctionMessage(`✅ Aukció létrehozva: ${amount}x ${resourceType} - ${price} aranyért!`, 'success');
        amountInput.value = '';
        priceInput.value = '';
    }
}

// Aukciós ház események beállítása
function setupAuctionEvents() {
    const closeBtn = document.getElementById('closeAuctionModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuctionHouse);
    }
    
    const createBtn = document.getElementById('createAuctionBtn');
    if (createBtn) {
        createBtn.addEventListener('click', handleCreateAuction);
    }
    
    // Modal kívülre kattintás
    const modal = document.getElementById('auctionModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAuctionHouse();
            }
        });
    }
    
    // Escape billentyűvel bezárás
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('auctionModal');
            if (modal && !modal.classList.contains('hidden')) {
                closeAuctionHouse();
            }
        }
    });
    
    // Frissítés időzítő az aukciókhoz
    setInterval(() => {
        const modal = document.getElementById('auctionModal');
        if (modal && !modal.classList.contains('hidden')) {
            renderAuctions();
        }
    }, 1000);
}

export { openChat, closeChat, initChat, openAuctionHouse, closeAuctionHouse, setupAuctionEvents };
