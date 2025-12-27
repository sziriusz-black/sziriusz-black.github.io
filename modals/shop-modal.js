/**
 * @file modals/shop-modal.js
 * @description Bolt modal - valódi pénzért vásárolható termékek
 * 
 * FELELŐSSÉGI KÖR:
 * - Bolt modal megnyitása/bezárása
 * - Kategóriák kezelése (pénz, erőforrások, egyedi offerek)
 * - Termékek megjelenítése
 * - Vásárlás szimulálása
 */

import { gameState } from '../gameState.js';
import { saveGameState } from '../save-load.js';
import { updateUI } from '../ui.js';
import { playSound } from '../audio.js';

// Termék kategóriák és áruk
const SHOP_PRODUCTS = {
    money: [
        { id: 'money_small', name: '💰 100 Arany', amount: 100, type: 'money', price: '0.99€', priceValue: 0.99 },
        { id: 'money_medium', name: '💰 500 Arany', amount: 500, type: 'money', price: '3.99€', priceValue: 3.99, bonus: '+50 bónusz' },
        { id: 'money_large', name: '💰 1000 Arany', amount: 1000, type: 'money', price: '6.99€', priceValue: 6.99, bonus: '+200 bónusz' },
        { id: 'money_mega', name: '💎 5000 Arany', amount: 5000, type: 'money', price: '24.99€', priceValue: 24.99, bonus: '+1500 bónusz', featured: true }
    ],
    resources: [
        { id: 'planks_pack', name: '🪵 50 Deszka', amount: 50, type: 'planks', price: '1.99€', priceValue: 1.99 },
        { id: 'corn_pack', name: '🌽 50 Kukorica', amount: 50, type: 'corn', price: '1.99€', priceValue: 1.99 },
        { id: 'stone_pack', name: '🪨 30 Kő', amount: 30, type: 'stone', price: '2.49€', priceValue: 2.49 },
        { id: 'iron_pack', name: '🔩 20 Vas', amount: 20, type: 'iron', price: '3.99€', priceValue: 3.99 },
        { id: 'diamond_pack', name: '💎 5 Gyémánt', amount: 5, type: 'diamond', price: '4.99€', priceValue: 4.99, featured: true }
    ],
    special: [
        { id: 'starter_pack', name: '🎁 Kezdő Csomag', description: '500 Arany + 30 Deszka + 20 Kukorica', price: '4.99€', priceValue: 4.99, 
          rewards: { money: 500, planks: 30, corn: 20 }, featured: true },
        { id: 'worker_boost', name: '👷 Munkás Bónusz', description: '+5 Extra Munkás (permanens)', price: '9.99€', priceValue: 9.99,
          rewards: { workers: 5 } },
        { id: 'storage_upgrade', name: '📦 Raktár Bővítés', description: '+50 Raktár Hely (permanens)', price: '7.99€', priceValue: 7.99,
          rewards: { storage: 50 } },
        { id: 'mega_bundle', name: '🌟 Mega Csomag', description: '2000 Arany + 100 minden erőforrás + 10 munkás', price: '29.99€', priceValue: 29.99,
          rewards: { money: 2000, planks: 100, corn: 100, stone: 100, iron: 50, diamond: 10, workers: 10 }, featured: true }
    ]
};

let currentCategory = 'money';

export function openShopModal() {
    const modal = document.getElementById('shopModal');
    if (!modal) return;
    
    currentCategory = 'money';
    updateShopContent();
    setupCategoryListeners();
    modal.classList.remove('hidden');
}

export function closeShopModal() {
    const modal = document.getElementById('shopModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function updateShopContent() {
    const productsContainer = document.getElementById('shopProducts');
    if (!productsContainer) return;
    
    const products = SHOP_PRODUCTS[currentCategory] || [];
    
    let html = '';
    
    products.forEach(product => {
        const featuredClass = product.featured ? 'featured' : '';
        const bonusHtml = product.bonus ? `<div class="product-bonus">${product.bonus}</div>` : '';
        const descHtml = product.description ? `<div class="product-description">${product.description}</div>` : '';
        
        html += `
            <div class="shop-product ${featuredClass}" data-product-id="${product.id}">
                <div class="product-name">${product.name}</div>
                ${descHtml}
                ${bonusHtml}
                <div class="product-price">${product.price}</div>
                <button class="buy-button" onclick="window.purchaseProduct('${product.id}')">Vásárlás</button>
            </div>
        `;
    });
    
    productsContainer.innerHTML = html;
    
    // Kategória active állapot frissítése
    document.querySelectorAll('.shop-category').forEach(cat => {
        cat.classList.toggle('active', cat.dataset.category === currentCategory);
    });
}

function setupCategoryListeners() {
    document.querySelectorAll('.shop-category').forEach(cat => {
        cat.onclick = () => {
            currentCategory = cat.dataset.category;
            updateShopContent();
        };
    });
}

// Vásárlás szimulálása (valódi fizetés nincs implementálva)
window.purchaseProduct = function(productId) {
    // Keresés a kategóriákban
    let product = null;
    for (const category of Object.values(SHOP_PRODUCTS)) {
        product = category.find(p => p.id === productId);
        if (product) break;
    }
    
    if (!product) return;
    
    // Megerősítés kérése
    const confirmed = confirm(`Biztosan meg szeretnéd vásárolni?\n\n${product.name}\nÁr: ${product.price}\n\n⚠️ Ez egy demó - valódi fizetés nem történik.`);
    
    if (!confirmed) return;
    
    // Jutalom hozzáadása
    if (product.type === 'money') {
        gameState.money += product.amount;
    } else if (product.type === 'planks') {
        gameState.planks += product.amount;
    } else if (product.type === 'corn') {
        gameState.corn += product.amount;
    } else if (product.type === 'stone') {
        gameState.stone += product.amount;
    } else if (product.type === 'iron') {
        gameState.iron += product.amount;
    } else if (product.type === 'diamond') {
        gameState.diamond += product.amount;
    } else if (product.rewards) {
        // Speciális csomagok
        if (product.rewards.money) gameState.money += product.rewards.money;
        if (product.rewards.planks) gameState.planks += product.rewards.planks;
        if (product.rewards.corn) gameState.corn += product.rewards.corn;
        if (product.rewards.stone) gameState.stone += product.rewards.stone;
        if (product.rewards.iron) gameState.iron += product.rewards.iron;
        if (product.rewards.diamond) gameState.diamond += product.rewards.diamond;
        if (product.rewards.workers) {
            gameState.workers += product.rewards.workers;
            gameState.maxWorkers += product.rewards.workers;
        }
        if (product.rewards.storage) {
            gameState.warehouseCapacity += product.rewards.storage;
        }
    }
    
    playSound('purchase');
    updateUI();
    saveGameState();
    
    alert(`✅ Sikeres vásárlás!\n\n${product.name}\n\nKöszönjük a támogatást! 🎉`);
    
    closeShopModal();
};

// Eseménykezelők beállítása
export function setupShopModalEvents() {
    const closeBtn = document.getElementById('closeShopModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeShopModal);
    }
    
    const modal = document.getElementById('shopModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeShopModal();
            }
        });
    }
}

