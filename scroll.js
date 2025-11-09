import { gameState } from './gameState.js';
import { constrainCamera } from './camera.js';

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let dragStartX = 0;
let dragStartY = 0;

export function setupScroll(canvas, saveGameState, handleClick) {
    canvas.addEventListener('mousedown', (e) => {
        // Csak akkor kezdjünk el húzni, ha nincs buborék és nem a buborékon kattintottunk
        const bubble = document.getElementById('bubble');
        const modal = document.getElementById('plankModal');
        const cornModal = document.getElementById('cornModal');
        if (e.button === 0 && 
            !bubble.contains(e.target) && 
            !modal.contains(e.target) &&
            !cornModal.contains(e.target) &&
            !gameState.activeBubble) {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = (e.clientX - lastMouseX) / gameState.camera.zoom;
            const deltaY = (e.clientY - lastMouseY) / gameState.camera.zoom;
            // Ha balra húzok (egér balra megy, deltaX negatív), a térkép balra mozog (kamera x nő)
            // Ha jobbra húzok (egér jobbra megy, deltaX pozitív), a térkép jobbra mozog (kamera x csökken)
            gameState.camera.x -= deltaX;
            gameState.camera.y -= deltaY;
            constrainCamera(canvas);
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        const wasDragging = isDragging;
        let dragDistance = 0;
        
        if (isDragging) {
            // Számoljuk a húzás távolságát
            dragDistance = Math.sqrt(
                Math.pow(e.clientX - dragStartX, 2) + 
                Math.pow(e.clientY - dragStartY, 2)
            );
            saveGameState();
        }
        
        isDragging = false;
        canvas.style.cursor = 'crosshair';
        
        // Csak akkor kezeljük kattintásnak, ha nem volt húzás VAGY nagyon rövid volt (< 3px)
        if (!wasDragging || dragDistance < 3) {
            // Rövid húzás vagy nincs húzás = kattintás
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
}

