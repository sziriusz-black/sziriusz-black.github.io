/**
 * @file input/touch-scroll.js
 * @description Touch scroll/drag kezelés mobilon
 * 
 * FELELŐSSÉGI KÖR:
 * - Touch touchstart esemény kezelése
 * - Touch touchmove esemény kezelése
 * - Touch touchend esemény kezelése
 * - Touch touchcancel esemény kezelése
 * - Tap (rövid érintés) felismerése
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér eseményekkel kapcsolatos → input/mouse-scroll.js
 * - Absztrakt scroll logikával kapcsolatos → scroll.js
 * - Pinch zoom-mal kapcsolatos → input/touch-zoom.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { gameState } from '../gameState.js';
import { isInsideUI } from './input-utils.js';
import { onDragStart, onDragMove, onDragEnd, onDragCancel } from './scroll-handler.js';

export function setupTouchScroll(canvas, saveGameState, handleClick) {
    let isTouchDragging = false;
    let lastX = 0;
    let lastY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let touchStartTime = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        // Csak egy ujj esetén kezeljük a húzást (pinch zoom külön van)
        if (e.touches.length === 1 && !isInsideUI(e.target) && !gameState.activeBubble) {
            isTouchDragging = true;
            const touch = e.touches[0];
            lastX = touch.clientX;
            lastY = touch.clientY;
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;
            touchStartTime = Date.now();
            e.preventDefault();
            
            onDragStart(touch.clientX, touch.clientY, canvas);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        // Csak egy ujj esetén húzás
        if (e.touches.length === 1 && isTouchDragging) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastX;
            const deltaY = touch.clientY - lastY;
            lastX = touch.clientX;
            lastY = touch.clientY;
            e.preventDefault();
            
            onDragMove(deltaX, deltaY, canvas);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (isTouchDragging) {
            const touchDuration = Date.now() - touchStartTime;
            const dragDistance = Math.sqrt(
                Math.pow(lastX - dragStartX, 2) + 
                Math.pow(lastY - dragStartY, 2)
            );
            
            onDragEnd(saveGameState);
            
            // Rövid érintés és kis mozgás = tap (kattintás)
            if (touchDuration < 300 && dragDistance < 10) {
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
            onDragCancel(saveGameState);
        }
        isTouchDragging = false;
    });
}

