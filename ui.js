/**
 * @file ui.js
 * @description UI kezelés - központi modul
 * 
 * FELELŐSSÉGI KÖR:
 * - UI függvények újra-exportálása
 * - Fő updateUI függvény koordinálása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Hibaüzenettel kapcsolatos → ui/error-message.js
 * - Státusz panellel kapcsolatos → ui/status-panel.js
 * - Modal frissítéssel kapcsolatos → ui/modal-updater.js
 * - Modal logikával kapcsolatos → modals/*.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { updateStatusPanel } from './ui/status-panel.js';
import { updateOpenModals } from './ui/modal-updater.js';

// Újra-exportálás
export { showError } from './ui/error-message.js';

// Fő UI frissítés - mindent frissít
export function updateUI() {
    updateStatusPanel();
    updateOpenModals();
}
