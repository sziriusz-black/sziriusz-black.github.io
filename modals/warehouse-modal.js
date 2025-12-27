/**
 * @file modals/warehouse-modal.js
 * @description Raktár modal - tárgyak listázása és eladása
 * 
 * FELELŐSSÉGI KÖR:
 * - Raktár modal megnyitása/bezárása
 * - Tárgyak listázása kapacitással
 * - Tárgy kiválasztása és eladása
 */

import { gameState, getUsedStorageSpace, getFreeStorageSpace } from '../gameState.js';
import { CONFIG } from '../config.js';
import { saveGameState } from '../save-load.js';
import { updateUI } from '../ui.js';
import { playSound } from '../audio.js';
import { t } from '../i18n.js';

// Tárgy típusok és adataik
const ITEM_TYPES = [
    { key: 'planks', icon: '🪵', name: 'Deszka', price: CONFIG.PLANK_SELL_PRICE },
    { key: 'corn', icon: '🌽', name: 'Kukorica', price: CONFIG.CORN_SELL_PRICE },
    { key: 'stone', icon: '🪨', name: 'Kő', price: CONFIG.STONE_SELL_PRICE },
    { key: 'iron', icon: '🔩', name: 'Vas', price: CONFIG.IRON_SELL_PRICE },
    { key: 'coal', icon: '⚫', name: 'Szén', price: CONFIG.COAL_SELL_PRICE },
    { key: 'diamond', icon: '💎', name: 'Gyémánt', price: CONFIG.DIAMOND_SELL_PRICE }
];

let selectedItem = null;
let sellAmount = 0;

export function openWarehouseModal() {
    const modal = document.getElementById('warehouseModal');
    if (!modal) return;
    
    selectedItem = null;
    sellAmount = 0;
    
    updateWarehouseModalContent();
    modal.classList.remove('hidden');
}

export function closeWarehouseModal() {
    const modal = document.getElementById('warehouseModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    selectedItem = null;
    sellAmount = 0;
}

function updateWarehouseModalContent() {
    const itemsContainer = document.getElementById('warehouseItems');
    const sellSection = document.getElementById('warehouseSellSection');
    const capacityBar = document.getElementById('warehouseCapacityBar');
    const capacityText = document.getElementById('warehouseCapacityText');
    
    if (!itemsContainer) return;
    
    const usedSpace = getUsedStorageSpace();
    const totalSpace = gameState.warehouseCapacity;
    const freeSpace = getFreeStorageSpace();
    
    // Kapacitás kijelzés
    if (capacityText) {
        capacityText.textContent = `${usedSpace}/${totalSpace} (${freeSpace} szabad)`;
    }
    if (capacityBar) {
        const fill = capacityBar.querySelector('.capacity-fill');
        if (fill) {
            fill.style.width = `${(usedSpace / totalSpace) * 100}%`;
            fill.style.background = freeSpace === 0 ? '#ff4444' : '#4caf50';
        }
    }
    
    // Tárgyak listázása
    let itemsHtml = '<div class="warehouse-grid">';
    
    ITEM_TYPES.forEach(item => {
        const amount = gameState[item.key] || 0;
        const isSelected = selectedItem === item.key;
        const isEmpty = amount === 0;
        
        itemsHtml += `
            <div class="warehouse-item ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : ''}" 
                 data-item="${item.key}" 
                 ${isEmpty ? '' : `onclick="window.selectWarehouseItem('${item.key}')"`}>
                <div class="warehouse-item-icon">${item.icon}</div>
                <div class="warehouse-item-name">${item.name}</div>
                <div class="warehouse-item-amount">${amount}</div>
                <div class="warehouse-item-price">${item.price} 💰/db</div>
            </div>
        `;
    });
    
    itemsHtml += '</div>';
    itemsContainer.innerHTML = itemsHtml;
    
    // Eladás szekció
    if (sellSection) {
        if (selectedItem) {
            const item = ITEM_TYPES.find(i => i.key === selectedItem);
            const maxAmount = gameState[selectedItem] || 0;
            const totalPrice = sellAmount * (item?.price || 0);
            
            sellSection.innerHTML = `
                <div class="sell-section-header">
                    <span>${item?.icon} ${item?.name} eladása</span>
                </div>
                <div class="sell-slider-container">
                    <input type="range" id="warehouseSellSlider" min="1" max="${maxAmount}" value="${sellAmount}" 
                           onchange="window.updateWarehouseSellAmount(this.value)"
                           oninput="window.updateWarehouseSellAmount(this.value)">
                    <div class="sell-amount-display">
                        <span id="warehouseSellAmountText">${sellAmount}</span> / ${maxAmount}
                    </div>
                </div>
                <div class="sell-total">Összesen: <span id="warehouseSellTotal">${totalPrice}</span> 💰</div>
                <div class="sell-buttons">
                    <button class="bubble-button" onclick="window.cancelWarehouseSell()">Mégsem</button>
                    <button class="bubble-button sell-btn" onclick="window.confirmWarehouseSell()">Eladás</button>
                </div>
            `;
            sellSection.classList.remove('hidden');
        } else {
            sellSection.innerHTML = '<div class="sell-hint">Kattints egy tárgyra az eladáshoz!</div>';
            sellSection.classList.remove('hidden');
        }
    }
}

// Tárgy kiválasztása
window.selectWarehouseItem = function(itemKey) {
    const amount = gameState[itemKey] || 0;
    if (amount === 0) return;
    
    selectedItem = itemKey;
    sellAmount = 1;
    updateWarehouseModalContent();
};

// Eladási mennyiség frissítése
window.updateWarehouseSellAmount = function(value) {
    sellAmount = parseInt(value) || 1;
    const item = ITEM_TYPES.find(i => i.key === selectedItem);
    const totalPrice = sellAmount * (item?.price || 0);
    
    const amountText = document.getElementById('warehouseSellAmountText');
    const totalText = document.getElementById('warehouseSellTotal');
    
    if (amountText) amountText.textContent = sellAmount;
    if (totalText) totalText.textContent = totalPrice;
};

// Eladás megerősítése
window.confirmWarehouseSell = function() {
    if (!selectedItem || sellAmount <= 0) return;
    
    const item = ITEM_TYPES.find(i => i.key === selectedItem);
    if (!item) return;
    
    const currentAmount = gameState[selectedItem] || 0;
    if (sellAmount > currentAmount) {
        sellAmount = currentAmount;
    }
    
    const totalPrice = sellAmount * item.price;
    
    // Tárgy levonása és pénz hozzáadása
    gameState[selectedItem] -= sellAmount;
    gameState.money += totalPrice;
    
    playSound('sell');
    updateUI();
    saveGameState();
    
    // Frissítjük a modal tartalmát
    selectedItem = null;
    sellAmount = 0;
    updateWarehouseModalContent();
};

// Eladás visszavonása
window.cancelWarehouseSell = function() {
    selectedItem = null;
    sellAmount = 0;
    updateWarehouseModalContent();
};

// Eseménykezelők beállítása
export function setupWarehouseModalEvents() {
    const closeBtn = document.getElementById('closeWarehouseModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWarehouseModal);
    }
    
    // Modal háttérre kattintás bezárja
    const modal = document.getElementById('warehouseModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeWarehouseModal();
            }
        });
    }
}


