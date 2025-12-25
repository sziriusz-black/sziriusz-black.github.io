// Interaktív tutorial rendszer új játékosoknak
import { gameState } from './gameState.js';

// Tutorial állapot
export const tutorialState = {
    active: false,
    currentStep: 0,
    waitingForAction: null,
    highlightedElement: null
};

// Tutorial lépések definíciója
const tutorialSteps = [
    {
        id: 'welcome',
        title: "Üdvözöllek a Skyblock játékban!",
        content: "Ez egy retro stílusú építős játék. Végigvezetlek az alapokon!",
        type: 'modal',
        nextButton: true
    },
    {
        id: 'click_owned_tile',
        title: "Ültess egy fát!",
        content: "Kattints a zöld területre a házad mellett!",
        type: 'highlight_tile',
        targetTile: { x: 1, y: 0 },
        waitFor: 'bubble_open',
        arrow: true
    },
    {
        id: 'plant_tree',
        title: "Válaszd a fa ültetést!",
        content: "Kattints a \"Fa ültetés\" gombra!",
        type: 'highlight_button',
        targetAction: 'buildTree',
        waitFor: 'tree_planted',
        arrow: true
    },
    {
        id: 'click_tree',
        title: "Vágd ki a fát!",
        content: "Kattints a fára!",
        type: 'highlight_tile',
        targetTile: { x: 1, y: 0 },
        waitFor: 'bubble_open',
        arrow: true
    },
    {
        id: 'cut_tree',
        title: "Kezdd el a kivágást!",
        content: "Kattints a \"Kivágás\" gombra!",
        type: 'highlight_button',
        targetAction: 'cutTree',
        waitFor: 'tree_cutting',
        arrow: true
    },
    {
        id: 'wait_cut',
        title: "Várd meg amíg kivágódik!",
        content: "A fa kivágása időbe telik. Figyelj a folyamatra!",
        type: 'wait',
        waitFor: 'tree_cut',
        showOnTile: { x: 1, y: 0 }
    },
    {
        id: 'click_plank',
        title: "Add el a deszkát!",
        content: "Kattints a 🪵 deszka ikonra a bal felső sarokban!",
        type: 'highlight_element',
        targetElement: '#plankDisplay',
        waitFor: 'sell_modal_open',
        arrow: true
    },
    {
        id: 'sell_plank',
        title: "Adj el deszkát!",
        content: "Állítsd be a mennyiséget és kattints az \"Eladás\" gombra!",
        type: 'highlight_element',
        targetElement: '#sellModal',
        waitFor: 'plank_sold',
        arrow: false
    },
    {
        id: 'complete',
        title: "Gratulálok!",
        content: "Most már tudod az alapokat! 🎉<br><br>Folytasd az építkezést, vásárolj új területeket, és építsd fel a birodalmadat!<br><br>💡 <b>Tipp:</b> A játék automatikusan mentődik!",
        type: 'modal',
        nextButton: true,
        isLast: true
    }
];

let overlayElement = null;
let tooltipElement = null;
let arrowElement = null;

export function isNewPlayer() {
    const saved = localStorage.getItem('skyblockGame');
    if (!saved) return true;
    
    try {
        const state = JSON.parse(saved);
        return state.tutorialCompleted !== true;
    } catch (e) {
        console.error('Mentett állapot olvasási hiba:', e);
        return true;
    }
}

export function startTutorial() {
    tutorialState.active = true;
    tutorialState.currentStep = 0;
    createTutorialElements();
    showCurrentStep();
}

function createTutorialElements() {
    // Overlay létrehozása
    if (!overlayElement) {
        overlayElement = document.createElement('div');
        overlayElement.id = 'tutorialOverlay';
        overlayElement.className = 'tutorial-overlay hidden';
        document.body.appendChild(overlayElement);
    }
    
    // Tooltip létrehozása
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'tutorialTooltip';
        tooltipElement.className = 'tutorial-tooltip hidden';
        tooltipElement.innerHTML = `
            <div class="tutorial-tooltip-title"></div>
            <div class="tutorial-tooltip-content"></div>
            <button class="tutorial-tooltip-next hidden">Következő</button>
            <button class="tutorial-tooltip-skip">Kihagyás</button>
        `;
        document.body.appendChild(tooltipElement);
        
        tooltipElement.querySelector('.tutorial-tooltip-next').addEventListener('click', nextStep);
        tooltipElement.querySelector('.tutorial-tooltip-skip').addEventListener('click', skipTutorial);
    }
    
    // Nyíl létrehozása
    if (!arrowElement) {
        arrowElement = document.createElement('div');
        arrowElement.id = 'tutorialArrow';
        arrowElement.className = 'tutorial-arrow hidden';
        arrowElement.innerHTML = '➤';
        document.body.appendChild(arrowElement);
    }
}

function showCurrentStep() {
    const step = tutorialSteps[tutorialState.currentStep];
    if (!step) {
        completeTutorial();
        return;
    }
    
    tutorialState.waitingForAction = step.waitFor || null;
    
    const titleEl = tooltipElement.querySelector('.tutorial-tooltip-title');
    const contentEl = tooltipElement.querySelector('.tutorial-tooltip-content');
    const nextBtn = tooltipElement.querySelector('.tutorial-tooltip-next');
    const skipBtn = tooltipElement.querySelector('.tutorial-tooltip-skip');
    
    titleEl.textContent = step.title;
    contentEl.innerHTML = step.content;
    
    // Next gomb kezelése
    if (step.nextButton) {
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = step.isLast ? 'Kezdés!' : 'Következő';
    } else {
        nextBtn.classList.add('hidden');
    }
    
    // Skip gomb kezelése
    skipBtn.style.display = step.isLast ? 'none' : 'block';
    
    // Típus alapján megjelenítés
    switch (step.type) {
        case 'modal':
            showModalStep(step);
            break;
        case 'highlight_tile':
            showTileHighlight(step);
            break;
        case 'highlight_button':
            showButtonHighlight(step);
            break;
        case 'highlight_element':
            showElementHighlight(step);
            break;
        case 'wait':
            showWaitStep(step);
            break;
    }
}

function showModalStep(step) {
    overlayElement.classList.remove('hidden');
    overlayElement.classList.add('full');
    arrowElement.classList.add('hidden');
    
    tooltipElement.classList.remove('hidden');
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.left = '50%';
    tooltipElement.style.top = '50%';
    tooltipElement.style.transform = 'translate(-50%, -50%)';
}

function showTileHighlight(step) {
    overlayElement.classList.remove('hidden', 'full');
    tooltipElement.classList.remove('hidden');
    
    // Tooltip pozícionálása a képernyő tetejére
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.left = '50%';
    tooltipElement.style.top = '80px';
    tooltipElement.style.transform = 'translateX(-50%)';
    
    if (step.arrow) {
        positionArrowOnTile(step.targetTile);
    } else {
        arrowElement.classList.add('hidden');
    }
}

function showButtonHighlight(step) {
    overlayElement.classList.remove('hidden', 'full');
    tooltipElement.classList.remove('hidden');
    
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.left = '50%';
    tooltipElement.style.top = '80px';
    tooltipElement.style.transform = 'translateX(-50%)';
    
    // Nyíl a bubble gombra
    if (step.arrow) {
        setTimeout(() => {
            const button = document.querySelector(`[data-action="${step.targetAction}"]`);
            if (button) {
                positionArrowOnElement(button);
            }
        }, 100);
    } else {
        arrowElement.classList.add('hidden');
    }
}

function showElementHighlight(step) {
    overlayElement.classList.remove('hidden', 'full');
    tooltipElement.classList.remove('hidden');
    
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.left = '50%';
    tooltipElement.style.top = '50%';
    tooltipElement.style.transform = 'translate(-50%, -50%)';
    
    if (step.arrow && step.targetElement) {
        const element = document.querySelector(step.targetElement);
        if (element) {
            positionArrowOnElement(element);
        }
    } else {
        arrowElement.classList.add('hidden');
    }
}

function showWaitStep(step) {
    overlayElement.classList.add('hidden');
    tooltipElement.classList.remove('hidden');
    arrowElement.classList.add('hidden');
    
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.left = '50%';
    tooltipElement.style.top = '80px';
    tooltipElement.style.transform = 'translateX(-50%)';
}

function positionArrowOnTile(tile) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const camera = gameState.camera;
    const tileSize = 64 * camera.zoom;
    
    // Tile közepének kiszámítása képernyő koordinátákban
    const screenX = (tile.x * 64 + 32) * camera.zoom + camera.x + canvas.width / 2;
    const screenY = (tile.y * 64 + 32) * camera.zoom + camera.y + canvas.height / 2;
    
    arrowElement.classList.remove('hidden');
    arrowElement.style.left = (screenX - 40) + 'px';
    arrowElement.style.top = (screenY - 10) + 'px';
}

function positionArrowOnElement(element) {
    const rect = element.getBoundingClientRect();
    
    arrowElement.classList.remove('hidden');
    arrowElement.style.left = (rect.left - 35) + 'px';
    arrowElement.style.top = (rect.top + rect.height / 2 - 10) + 'px';
}

export function nextStep() {
    tutorialState.currentStep++;
    if (tutorialState.currentStep >= tutorialSteps.length) {
        completeTutorial();
    } else {
        showCurrentStep();
    }
}

export function skipTutorial() {
    completeTutorial();
}

function completeTutorial() {
    tutorialState.active = false;
    tutorialState.waitingForAction = null;
    
    if (overlayElement) overlayElement.classList.add('hidden');
    if (tooltipElement) tooltipElement.classList.add('hidden');
    if (arrowElement) arrowElement.classList.add('hidden');
    
    // Régi modal elrejtése is
    const oldModal = document.getElementById('tutorialModal');
    if (oldModal) oldModal.classList.add('hidden');
    
    // Mentjük, hogy a tutorial befejeződött
    try {
        const saved = localStorage.getItem('skyblockGame');
        let state = saved ? JSON.parse(saved) : {};
        state.tutorialCompleted = true;
        localStorage.setItem('skyblockGame', JSON.stringify(state));
    } catch (e) {
        console.error('Tutorial mentési hiba:', e);
    }
}

// Tutorial események kezelése - hívd meg amikor valami történik a játékban
export function onTutorialEvent(eventType, data = {}) {
    if (!tutorialState.active) return;
    
    const step = tutorialSteps[tutorialState.currentStep];
    if (!step || !step.waitFor) return;
    
    // Ellenőrizzük, hogy a várt esemény történt-e
    if (step.waitFor === eventType) {
        // Speciális ellenőrzések
        if (step.targetTile && data.x !== undefined && data.y !== undefined) {
            if (data.x !== step.targetTile.x || data.y !== step.targetTile.y) {
                return; // Nem a megfelelő tile
            }
        }
        
        // Továbblépés
        nextStep();
    }
}

// Ellenőrzi, hogy egy adott tile kattintható-e a tutorial alatt
export function isTileAllowedInTutorial(x, y) {
    if (!tutorialState.active) return true;
    
    const step = tutorialSteps[tutorialState.currentStep];
    if (!step || !step.targetTile) return true;
    
    return x === step.targetTile.x && y === step.targetTile.y;
}

// Ellenőrzi, hogy egy adott action engedélyezett-e
export function isActionAllowedInTutorial(action) {
    if (!tutorialState.active) return true;
    
    const step = tutorialSteps[tutorialState.currentStep];
    if (!step || !step.targetAction) return true;
    
    return action === step.targetAction;
}

// Nyíl pozíció frissítése (hívd a gameLoop-ból)
export function updateTutorialArrow() {
    if (!tutorialState.active) return;
    
    const step = tutorialSteps[tutorialState.currentStep];
    if (!step || step.type !== 'highlight_tile' || !step.targetTile) return;
    
    positionArrowOnTile(step.targetTile);
}

export function setupTutorialListeners() {
    // Régi modal gombok (ha még vannak)
    const nextBtn = document.getElementById('tutorialNext');
    const prevBtn = document.getElementById('tutorialPrev');
    const skipBtn = document.getElementById('tutorialSkip');
    
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (skipBtn) skipBtn.addEventListener('click', skipTutorial);
}

// Tutorial aktív állapot lekérdezése
export function isTutorialActive() {
    return tutorialState.active;
}

// Aktuális lépés lekérdezése
export function getCurrentTutorialStep() {
    if (!tutorialState.active) return null;
    return tutorialSteps[tutorialState.currentStep];
}
