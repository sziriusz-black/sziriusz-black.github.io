/**
 * @file input/input-utils.js
 * @description Input segédfüggvények - közös utility-k
 * 
 * FELELŐSSÉGI KÖR:
 * - UI elem ellenőrzés (isInsideUI)
 * - Közös segédfüggvények egér és touch kezeléshez
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Egér eseményekkel kapcsolatos → input/mouse-scroll.js
 * - Touch eseményekkel kapcsolatos → input/touch-scroll.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

// Ellenőrzi, hogy a target elem UI elem-e (nem a canvas)
export function isInsideUI(target) {
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

