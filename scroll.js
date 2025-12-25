import { gameState } from './gameState.js';
import { constrainCamera } from './camera.js';

let isDragging = false;
let lastX = 0;
let lastY = 0;
let dragStartX = 0;
let dragStartY = 0;

// Touch és mouse közös kezelése
function getEventPosition(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function isInsideUI(target) {
    const bubble = document.getElementById('bubble');
    const modal = document.getElementById('plankModal');
    const cornModal = document.getElementById('cornModal');
    const discordModal = document.getElementById('discordModal');
    const tutorialModal = document.getElementById('tutorialModal');
    const statusPanel = document.getElementById('statusPanel');
    const settingsDropdown = document.getElementById('settingsDropdown');
    
    return (bubble && bubble.contains(target)) ||
           (modal && modal.contains(target)) ||
           (cornModal && cornModal.contains(target)) ||
           (discordModal && discordModal.contains(target)) ||
           (tutorialModal && tutorialModal.contains(target)) ||
           (statusPanel && statusPanel.contains(target)) ||
           (settingsDropdown && settingsDropdown.contains(target));
}

export function setupScroll(canvas, saveGameState, handleClick) {
    // === MOUSE ESEMÉNYEK ===
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && !isInsideUI(e.target) && !gameState.activeBubble) {
            isDragging = true;
            const pos = getEventPosition(e);
            lastX = pos.x;
            lastY = pos.y;
            dragStartX = pos.x;
            dragStartY = pos.y;
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const pos = getEventPosition(e);
            const deltaX = (pos.x - lastX) / gameState.camera.zoom;
            const deltaY = (pos.y - lastY) / gameState.camera.zoom;
            gameState.camera.x -= deltaX;
            gameState.camera.y -= deltaY;
            constrainCamera(canvas);
            lastX = pos.x;
            lastY = pos.y;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        const wasDragging = isDragging;
        let dragDistance = 0;
        
        if (isDragging) {
            const pos = getEventPosition(e);
            dragDistance = Math.sqrt(
                Math.pow(pos.x - dragStartX, 2) + 
                Math.pow(pos.y - dragStartY, 2)
            );
            saveGameState();
        }
        
        isDragging = false;
        canvas.style.cursor = 'crosshair';
        
        if (!wasDragging || dragDistance < 3) {
            setTimeout(() => handleClick(e), 10);
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            saveGameState();
        }
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });

    // === TOUCH ESEMÉNYEK ===
    let touchStartTime = 0;
    let isTouchDragging = false;
    
    canvas.addEventListener('touchstart', (e) => {
        // Csak egy ujj esetén kezeljük a húzást (pinch zoom külön van)
        if (e.touches.length === 1 && !isInsideUI(e.target) && !gameState.activeBubble) {
            isTouchDragging = true;
            const pos = getEventPosition(e);
            lastX = pos.x;
            lastY = pos.y;
            dragStartX = pos.x;
            dragStartY = pos.y;
            touchStartTime = Date.now();
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        // Csak egy ujj esetén húzás
        if (e.touches.length === 1 && isTouchDragging) {
            const pos = getEventPosition(e);
            const deltaX = (pos.x - lastX) / gameState.camera.zoom;
            const deltaY = (pos.y - lastY) / gameState.camera.zoom;
            gameState.camera.x -= deltaX;
            gameState.camera.y -= deltaY;
            constrainCamera(canvas);
            lastX = pos.x;
            lastY = pos.y;
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (isTouchDragging) {
            const touchDuration = Date.now() - touchStartTime;
            const dragDistance = Math.sqrt(
                Math.pow(lastX - dragStartX, 2) + 
                Math.pow(lastY - dragStartY, 2)
            );
            
            saveGameState();
            
            // Rövid érintés és kis mozgás = tap (kattintás)
            if (touchDuration < 300 && dragDistance < 10) {
                // Szimulálunk egy click eseményt
                const fakeEvent = {
                    clientX: dragStartX,
                    clientY: dragStartY,
                    target: e.target
                };
                setTimeout(() => handleClick(fakeEvent), 10);
            }
        }
        
        isTouchDragging = false;
    });

    canvas.addEventListener('touchcancel', () => {
        if (isTouchDragging) {
            saveGameState();
        }
        isTouchDragging = false;
    });
}
