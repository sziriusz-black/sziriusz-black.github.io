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

import { getCurrentUser } from './auth.js';
import { gameState } from './gameState.js';
import { saveGameState } from './save-load.js';
import { updateUI } from './ui.js';

const CHAT_STORAGE_KEY = 'retroSkyblockChat';
const MAX_MESSAGES = 50;
const ADMIN_USERNAMES = ['Szíriusz', 'Szirius', 'szíriusz', 'szirius'];

// Admin-e a felhasználó
function isAdmin(username) {
    return ADMIN_USERNAMES.some(admin => 
        admin.toLowerCase() === username.toLowerCase()
    );
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
    
    // Admin ellenőrzés
    if (!isAdmin(currentUser.username)) {
        addSystemMessage('❌ Nincs jogosultságod parancsok használatához!');
        return true;
    }
    
    switch (command) {
        case 'help':
            addSystemMessage(
                '📋 Elérhető parancsok:\n' +
                '/help - Parancsok listája\n' +
                '/clear - Chat törlése\n' +
                '/gold [mennyiség] - Arany hozzáadása\n' +
                '/wood [mennyiség] - Deszka hozzáadása\n' +
                '/stone [mennyiség] - Kő hozzáadása\n' +
                '/corn [mennyiség] - Kukorica hozzáadása\n' +
                '/workers [mennyiség] - Munkás hozzáadása\n' +
                '/broadcast [üzenet] - Rendszer üzenet küldése\n' +
                '/reset - Játék újrakezdése\n' +
                '/god - Végtelen erőforrások'
            );
            break;
            
        case 'clear':
            saveChatMessages([]);
            addSystemMessage('🗑️ Chat törölve!');
            break;
            
        case 'gold':
            const goldAmount = parseInt(args[0]) || 1000;
            gameState.gold += goldAmount;
            updateUI();
            saveGameState();
            addSystemMessage(`💰 +${goldAmount} arany hozzáadva!`);
            break;
            
        case 'wood':
            const woodAmount = parseInt(args[0]) || 100;
            gameState.wood += woodAmount;
            updateUI();
            saveGameState();
            addSystemMessage(`🪵 +${woodAmount} deszka hozzáadva!`);
            break;
            
        case 'stone':
            const stoneAmount = parseInt(args[0]) || 100;
            gameState.stone += stoneAmount;
            updateUI();
            saveGameState();
            addSystemMessage(`🪨 +${stoneAmount} kő hozzáadva!`);
            break;
            
        case 'corn':
            const cornAmount = parseInt(args[0]) || 100;
            gameState.corn += cornAmount;
            updateUI();
            saveGameState();
            addSystemMessage(`🌽 +${cornAmount} kukorica hozzáadva!`);
            break;
            
        case 'workers':
            const workersAmount = parseInt(args[0]) || 10;
            gameState.workers += workersAmount;
            updateUI();
            saveGameState();
            addSystemMessage(`👷 +${workersAmount} munkás hozzáadva!`);
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
            
        case 'god':
            gameState.gold += 999999;
            gameState.wood += 99999;
            gameState.stone += 99999;
            gameState.corn += 99999;
            gameState.workers += 999;
            updateUI();
            saveGameState();
            addSystemMessage('⚡ GOD MODE aktiválva! Végtelen erőforrások!');
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
                <div class="chat-message-text">${escapeHtml(msg.text)}</div>
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
