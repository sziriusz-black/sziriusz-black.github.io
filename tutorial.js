// Tutorial rendszer új játékosoknak
import { gameState } from './gameState.js';

const tutorialSteps = [
    {
        title: "Üdvözöllek a Skyblock játékban!",
        content: "Ez egy retro stílusú építős játék, ahol a semmiből kell felépítened a birodalmadat. Kattints a \"Következő\" gombra a folytatáshoz!"
    },
    {
        title: "Erőforrások",
        content: "A bal felső sarokban láthatod az erőforrásaidat:<br><br>💰 <b>Pénz</b> - ezzel tudsz vásárolni<br>🪵 <b>Deszka</b> - fák kivágásából szerzed<br>🌽 <b>Kukorica</b> - kukoricaföldről arathatod"
    },
    {
        title: "Területvásárlás",
        content: "Kattints egy szürke mezőre a saját területed mellett, hogy új területet vásárolj. A sarkoknál érintkező területeket is megveheted!"
    },
    {
        title: "Építkezés",
        content: "A zöld (megvásárolt) területekre kattintva különböző dolgokat építhetsz:<br><br>🏠 <b>Ház</b> - lakóépület<br>🌲 <b>Fa</b> - kivághatod deszkáért<br>🌽 <b>Kukoricaföld</b> - kukoricát termelhetsz<br>⛏️ <b>Kővágó</b> - követ bányászhatsz"
    },
    {
        title: "Fák és deszkák",
        content: "Ha fát ültetsz, később kivághatod. A kivágás időbe telik, de utána deszkát kapsz. A deszkákat eladhatod pénzért - kattints a 🪵 ikonra!"
    },
    {
        title: "Mozgás a térképen",
        content: "A térképen mozogni az egér húzásával tudsz. A nagyítást az egér görgőjével tudod állítani."
    },
    {
        title: "Készen állsz!",
        content: "Most már tudod az alapokat! Építsd fel a birodalmadat és jó szórakozást!<br><br>💡 <b>Tipp:</b> A játék automatikusan mentődik, így bármikor folytathatod!"
    }
];

let currentStep = 0;

export function isNewPlayer() {
    const saved = localStorage.getItem('skyblockGame');
    if (!saved) return true;
    
    try {
        const state = JSON.parse(saved);
        return state.tutorialCompleted !== true;
    } catch (e) {
        return true;
    }
}

export function startTutorial() {
    currentStep = 0;
    showTutorialStep();
    document.getElementById('tutorialModal').classList.remove('hidden');
}

function showTutorialStep() {
    const step = tutorialSteps[currentStep];
    const titleEl = document.getElementById('tutorialTitle');
    const contentEl = document.getElementById('tutorialContent');
    const prevBtn = document.getElementById('tutorialPrev');
    const nextBtn = document.getElementById('tutorialNext');
    const skipBtn = document.getElementById('tutorialSkip');
    const stepIndicator = document.getElementById('tutorialStepIndicator');
    
    titleEl.textContent = step.title;
    contentEl.innerHTML = step.content;
    stepIndicator.textContent = `${currentStep + 1} / ${tutorialSteps.length}`;
    
    // Gombok láthatósága
    prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
    
    if (currentStep === tutorialSteps.length - 1) {
        nextBtn.textContent = 'Kezdés!';
    } else {
        nextBtn.textContent = 'Következő';
    }
}

export function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showTutorialStep();
    } else {
        completeTutorial();
    }
}

export function prevTutorialStep() {
    if (currentStep > 0) {
        currentStep--;
        showTutorialStep();
    }
}

export function skipTutorial() {
    completeTutorial();
}

function completeTutorial() {
    document.getElementById('tutorialModal').classList.add('hidden');
    
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

export function setupTutorialListeners() {
    document.getElementById('tutorialNext').addEventListener('click', nextTutorialStep);
    document.getElementById('tutorialPrev').addEventListener('click', prevTutorialStep);
    document.getElementById('tutorialSkip').addEventListener('click', skipTutorial);
}


