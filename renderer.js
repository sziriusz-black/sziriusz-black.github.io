/**
 * @file renderer.js
 * @description Renderelés - fő render modul (újra-export és render függvény)
 * 
 * FELELŐSSÉGI KÖR:
 * - Canvas függvények újra-exportálása
 * - Fő render függvény koordinálása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Canvas inicializálással kapcsolatos → canvas.js
 * - Kamera transzformációval kapcsolatos → camera-transform.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Buborék pozícióval kapcsolatos → bubble-position.js
 * - Sprite rajzolással kapcsolatos → sprites/*.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

// Canvas függvények újra-exportálása
export { getCanvas, getContext, resizeCanvas, clearCanvas } from './canvas.js';

// Kamera transzformáció
import { applyCameraTransform, restoreCameraTransform, getVisibleArea } from './camera-transform.js';

// Tile renderelés
import { renderGrid, renderTiles } from './tile-renderer.js';

// Buborék pozíció
import { updateBubblePositionIfActive } from './bubble-position.js';

// Canvas törlés
import { clearCanvas } from './canvas.js';

// Fő render függvény
export function render(updateBubblePosition, findTile) {
    // Canvas törlése
    clearCanvas();
    
    // Buborék pozíció frissítése ha aktív
    updateBubblePositionIfActive(updateBubblePosition);
    
    // Kamera transzformáció alkalmazása
    applyCameraTransform();
    
    // Látható terület számítása
    const visibleArea = getVisibleArea();
    
    // Grid renderelése (meg nem vásárolt területek)
    renderGrid(visibleArea, findTile);
    
    // Tile-ok renderelése
    renderTiles();
    
    // Kamera transzformáció visszaállítása
    restoreCameraTransform();
}
