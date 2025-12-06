import { CONFIG } from './config.js';
import { gameState } from './gameState.js';

// Zoom értékek inicializálása
// 1-es zoom = ház szinte teljes képernyő (maximális zoom)
// 20-as zoom = kb 20x20 tile látszik (minimális zoom)
export function getZoomLevel(level) {
    // level 1 = maximális zoom (1 tile szinte teljes képernyő)
    // level 20 = minimális zoom (20x20 tile látszik)
    const minDimension = Math.min(window.innerWidth, window.innerHeight);
    const maxZoom = (minDimension / CONFIG.TILE_SIZE) * 0.9; // 1-es level
    const minZoom = maxZoom / 20; // 20-as level (20x nagyobb terület)
    return maxZoom - (maxZoom - minZoom) * (level - 1) / 19;
}

// Kamera korlátozás
export function constrainCamera(canvas) {
    // Kamerát úgy korlátozzuk, hogy a megvásárolt terület ne kerüljön teljesen a látómezőn kívülre
    if (gameState.map.length === 0) return;

    const ownedTiles = gameState.map.filter(t => 
        t.type === 'owned' || t.type === 'tree' || t.type === 'house' || t.type === 'cornfield' || t.type === 'emptycornfield'
    );
    
    if (ownedTiles.length === 0) return;

    const minX = Math.min(...ownedTiles.map(t => t.x)) * CONFIG.TILE_SIZE;
    const maxX = Math.max(...ownedTiles.map(t => t.x)) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE;
    const minY = Math.min(...ownedTiles.map(t => t.y)) * CONFIG.TILE_SIZE;
    const maxY = Math.max(...ownedTiles.map(t => t.y)) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE;

    const viewWidth = canvas.width / gameState.camera.zoom;
    const viewHeight = canvas.height / gameState.camera.zoom;

    const margin = CONFIG.MARGIN / gameState.camera.zoom;

    // A kamera középpontjának korlátai - legalább egy rész a megvásárolt területről látszódjon
    // Bal oldal: a kamera x nem lehet kisebb, mint hogy a bal szélén még látszódjon valami
    const minCameraX = minX - viewWidth / 2 + margin;
    // Jobb oldal: a kamera x nem lehet nagyobb, mint hogy a jobb szélén még látszódjon valami
    const maxCameraX = maxX - viewWidth / 2 - margin;
    
    // Felső oldal: a kamera y nem lehet kisebb, mint hogy a tetején még látszódjon valami
    const minCameraY = minY - viewHeight / 2 + margin;
    // Alsó oldal: a kamera y nem lehet nagyobb, mint hogy az alján még látszódjon valami
    const maxCameraY = maxY - viewHeight / 2 - margin;

    // Csak akkor korlátozzuk, ha a nézet szélesebb/magasabb mint a terület
    if (viewWidth < (maxX - minX) + 2 * margin) {
        gameState.camera.x = Math.max(minCameraX, Math.min(maxCameraX, gameState.camera.x));
    }
    if (viewHeight < (maxY - minY) + 2 * margin) {
        gameState.camera.y = Math.max(minCameraY, Math.min(maxCameraY, gameState.camera.y));
    }
}

