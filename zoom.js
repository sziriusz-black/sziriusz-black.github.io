import { CONFIG } from './config.js';
import { gameState } from './gameState.js';
import { getZoomLevel, constrainCamera } from './camera.js';

// Pinch zoom változók
let initialPinchDistance = 0;
let initialZoomLevel = 1;
let isPinching = false;

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getPinchCenter(touch1, touch2, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((touch1.clientX + touch2.clientX) / 2) - rect.left,
        y: ((touch1.clientY + touch2.clientY) / 2) - rect.top
    };
}

export function setupZoom(canvas, saveGameState) {
    // === MOUSE WHEEL ZOOM ===
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let newZoomLevel = gameState.camera.zoomLevel || 1;
        
        if (e.deltaY > 0) {
            newZoomLevel = Math.min(CONFIG.MAX_ZOOM, newZoomLevel + 1);
        } else {
            newZoomLevel = Math.max(CONFIG.MIN_ZOOM, newZoomLevel - 1);
        }

        if (newZoomLevel === gameState.camera.zoomLevel) {
            return;
        }

        applyZoom(canvas, mouseX, mouseY, newZoomLevel);
        saveGameState();
    }, { passive: false });

    // === TOUCH PINCH ZOOM ===
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isPinching = true;
            initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoomLevel = gameState.camera.zoomLevel || 1;
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && isPinching) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const center = getPinchCenter(e.touches[0], e.touches[1], canvas);
            
            // Számoljuk ki az új zoom szintet a távolság arányából
            const scale = currentDistance / initialPinchDistance;
            
            // Fordított logika: nagyobb távolság = kisebb zoomLevel = közelebbi nézet
            let newZoomLevel = Math.round(initialZoomLevel / scale);
            newZoomLevel = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, newZoomLevel));
            
            if (newZoomLevel !== gameState.camera.zoomLevel) {
                applyZoom(canvas, center.x, center.y, newZoomLevel);
            }
            
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (isPinching && e.touches.length < 2) {
            isPinching = false;
            saveGameState();
        }
    });

    canvas.addEventListener('touchcancel', () => {
        isPinching = false;
    });
}

function applyZoom(canvas, centerX, centerY, newZoomLevel) {
    const oldZoom = gameState.camera.zoom;
    const worldX = (centerX - canvas.width / 2) / oldZoom + gameState.camera.x;
    const worldY = (centerY - canvas.height / 2) / oldZoom + gameState.camera.y;

    gameState.camera.zoomLevel = newZoomLevel;
    gameState.camera.zoom = getZoomLevel(newZoomLevel);

    const newWorldX = (centerX - canvas.width / 2) / gameState.camera.zoom + gameState.camera.x;
    const newWorldY = (centerY - canvas.height / 2) / gameState.camera.zoom + gameState.camera.y;

    gameState.camera.x += worldX - newWorldX;
    gameState.camera.y += worldY - newWorldY;

    constrainCamera(canvas);
}
