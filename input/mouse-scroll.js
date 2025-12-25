/**
 * @file input/mouse-scroll.js
 * @description Egér scroll/drag kezelés
 * 
 * FELELŐSSÉGI KÖR:
 * - Egér mousedown esemény kezelése
 * - Egér mousemove esemény kezelése
 * - Egér mouseup esemény kezelése
 * - Egér mouseleave esemény kezelése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Touch eseményekkel kapcsolatos → input/touch-scroll.js
 * - Absztrakt scroll logikával kapcsolatos → scroll.js
 * - Zoom-mal kapcsolatos → input/mouse-zoom.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from '../gameState.js';
import { isInsideUI } from './input-utils.js';
import { onDragStart, onDragMove, onDragEnd, onDragCancel } from './scroll-handler.js';

export function setupMouseScroll(canvas, saveGameState, handleClick) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && !isInsideUI(e.target) && !gameState.activeBubble) {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
            
            onDragStart(e.clientX, e.clientY, canvas);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            
            onDragMove(deltaX, deltaY, canvas);
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        const wasDragging = isDragging;
        let dragDistance = 0;
        
        if (isDragging) {
            dragDistance = Math.sqrt(
                Math.pow(e.clientX - dragStartX, 2) + 
                Math.pow(e.clientY - dragStartY, 2)
            );
        }
        
        isDragging = false;
        canvas.style.cursor = 'crosshair';
        
        onDragEnd(saveGameState);
        
        // Ha nem volt valódi húzás, akkor kattintás
        if (!wasDragging || dragDistance < 3) {
            setTimeout(() => handleClick(e), 10);
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            onDragCancel(saveGameState);
        }
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });
}

