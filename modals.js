/**
 * @file modals.js
 * @description Modal ablakok - központi újra-export modul
 * 
 * FELELŐSSÉGI KÖR:
 * - Modal függvények újra-exportálása egy helyről
 * - Visszafelé kompatibilitás biztosítása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ez a fájl CSAK újra-exportálásra szolgál!
 * NE írj ide modal logikát! Használd helyette:
 * - modals/plank-modal.js - deszka eladás
 * - modals/corn-modal.js - kukorica eladás
 * - modals/discord-modal.js - discord
 * - modals/upgrade-modal.js - upgrade
 * - modals/modal-sliders.js - slider események
 */

// Deszka modal
export { openPlankModal, closeModal, sellPlanks } from './modals/plank-modal.js';

// Kukorica modal
export { openCornModal, closeCornModal, sellCorn } from './modals/corn-modal.js';

// Discord modal
export { openDiscordModal, closeDiscordModal } from './modals/discord-modal.js';

// Upgrade modal
export { openUpgradeModal, closeUpgradeModal } from './modals/upgrade-modal.js';

// Raktár modal
export { openWarehouseModal, closeWarehouseModal, setupWarehouseModalEvents } from './modals/warehouse-modal.js';

// Bolt modal
export { openShopModal, closeShopModal, setupShopModalEvents } from './modals/shop-modal.js';

// Slider események
export { setupModalSliders } from './modals/modal-sliders.js';
