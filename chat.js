/**
 * @file chat.js
 * @description Chat funkciók kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Chat ablak megnyitása/bezárása
 * - Üzenetek megjelenítése
 * - Üzenet küldés (localStorage alapú demo)
 */

import { getCurrentUser } from './auth.js';

const CHAT_STORAGE_KEY = 'retroSkyblockChat';
const MAX_MESSAGES = 50;

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
        
        let messageClass = 'chat-message';
        if (isOwn) messageClass += ' own';
        if (isSystem) messageClass += ' system';
        
        return `
            <div class="${messageClass}">
                <div class="chat-message-header">
                    <span class="chat-message-user">${escapeHtml(msg.username)}</span>
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
    
    input.value = '';
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

