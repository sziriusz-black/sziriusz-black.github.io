/**
 * @file i18n.js
 * @description Többnyelvűség kezelése - magyar, angol, német
 * 
 * FELELŐSSÉGI KÖR:
 * - Fordítások tárolása (translations)
 * - Aktuális nyelv kezelése (currentLanguage)
 * - Nyelv váltás (setLanguage, cycleLanguage)
 * - Szöveg fordítása (t)
 * - Nyelv mentése/betöltése localStorage-ból
 * - DOM elemek fordítása (translateDOM)
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új szöveget adsz hozzá a játékhoz, ne felejtsd el
 * mindhárom nyelven hozzáadni a translations objektumhoz!
 */

// Támogatott nyelvek
export const LANGUAGES = ['hu', 'en', 'de'];

// Zászlók a nyelvekhez
export const FLAGS = {
    hu: '🇭🇺',
    en: '🇬🇧',
    de: '🇩🇪'
};

// Nyelv nevek
export const LANGUAGE_NAMES = {
    hu: 'Magyar',
    en: 'English',
    de: 'Deutsch'
};

// Aktuális nyelv
let currentLanguage = 'hu';

// Fordítások
const translations = {
    hu: {
        // Beállítások menü
        'settings.sound': 'Hang',
        'settings.discord': 'Discord',
        'settings.language': 'Nyelv',
        'settings.chat': 'Chat',
        'settings.credits': 'Credits',
        'settings.logout': 'Kijelentkezés',
        
        // Státusz panel
        'status.money': 'Pénz',
        'status.planks': 'Deszka',
        'status.corn': 'Kukorica',
        'status.workers': 'Munkások',
        
        // Buborék - terület vásárlás
        'bubble.buyTile': 'Terület vásárlása',
        'bubble.price': 'Ár: {0} pénz',
        'bubble.buy': 'Vásárlás',
        'bubble.needMoney': 'Még {0} pénz kell!',
        'bubble.onlyAdjacent': 'Csak a megvásárolt terület mellé lehet vásárolni!',
        
        // Buborék - fa
        'bubble.cutting': 'Fa kivágása folyamatban...',
        'bubble.timeLeft': 'Hátralévő idő: {0}s',
        'bubble.cut': 'Kivágás',
        'bubble.noWorker': '(nincs munkás)',
        
        // Buborék - ház
        'bubble.starterHouse': 'Kezdő ház (Szint {0})',
        'bubble.house': 'Ház (Szint {0})',
        'bubble.workers': 'Munkások: +{0}',
        'bubble.upgrade': 'Upgrade',
        'bubble.sell': 'Eladás ({0} pénz)',
        
        // Buborék - építés
        'bubble.build': 'Építés',
        'bubble.buildHouse': 'Ház építése ({0} pénz)',
        'bubble.plantTree': 'Fa ültetése ({0} pénz)',
        'bubble.buildCornField': 'Kukorica föld ({0} pénz)',
        'bubble.buildStoneCutter': 'Kővágó ({0} pénz)',
        
        // Buborék - kukoricaföld
        'bubble.cornfieldBuilding': 'Kukorica föld építése folyamatban...',
        'bubble.harvest': 'Learatás',
        'bubble.replanting': 'Kukorica újraültetése folyamatban...',
        'bubble.replant': 'Újraültetés',
        
        // Buborék - kővágó
        'bubble.stonecutter': 'Kővágó (Szint {0})',
        
        // Buborék - bánya
        'bubble.buildMine': 'Bánya építése ({0} pénz)',
        'bubble.mine': 'Bánya (Szint {0})',
        'bubble.mining': 'Bányászás folyamatban...',
        'bubble.startMining': 'Bányászás indítása',
        
        // Buborék - raktár
        'bubble.warehouse': 'Raktár (Szint {0})',
        'bubble.storage': 'Tárhely',
        'bubble.openWarehouse': 'Megnyitás',
        'bubble.storageFull': 'A raktár megtelt!',
        
        // Modalok - deszka eladás
        'modal.plankSell': 'Deszka Eladás',
        'modal.sellAmount': 'Eladandó deszkák:',
        'modal.cancel': 'Mégsem',
        'modal.sellFor': 'Eladás ({0} 💰)',
        
        // Modalok - kukorica eladás
        'modal.cornSell': 'Kukorica Eladás',
        'modal.cornSellAmount': 'Eladandó kukorica:',
        
        // Modalok - upgrade
        'modal.upgradeTitle': 'Upgrade',
        'modal.starterHouseUpgrade': 'Kezdő Ház Upgrade',
        'modal.houseUpgrade': 'Ház Upgrade',
        'modal.stonecutterUpgrade': 'Kővágó Upgrade',
        'modal.currentLevel': 'Jelenlegi szint:',
        'modal.workers': 'Munkások:',
        'modal.level': 'Szint {0}',
        'modal.extraWorker': '+1 extra munkás',
        'modal.fasterCutting': 'Gyorsabb kővágás',
        
        // Tutorial
        'tutorial.welcome.title': 'Üdvözöllek a Skyblock játékban!',
        'tutorial.welcome.content': 'Ez egy retro stílusú építős játék. Végigvezetlek az alapokon!',
        'tutorial.clickTile.title': 'Ültess egy fát!',
        'tutorial.clickTile.content': 'Kattints a zöld területre a házad mellett!',
        'tutorial.plantTree.title': 'Válaszd a fa ültetést!',
        'tutorial.plantTree.content': 'Kattints a "Fa ültetés" gombra!',
        'tutorial.clickTree.title': 'Vágd ki a fát!',
        'tutorial.clickTree.content': 'Kattints a fára!',
        'tutorial.cutTree.title': 'Kezdd el a kivágást!',
        'tutorial.cutTree.content': 'Kattints a "Kivágás" gombra!',
        'tutorial.waitCut.title': 'Várd meg amíg kivágódik!',
        'tutorial.waitCut.content': 'A fa kivágása időbe telik. Figyelj a folyamatra!',
        'tutorial.clickPlank.title': 'Add el a deszkát!',
        'tutorial.clickPlank.content': 'Kattints a 🪵 deszka ikonra a bal felső sarokban!',
        'tutorial.sellPlank.title': 'Adj el deszkát!',
        'tutorial.sellPlank.content': 'Állítsd be a mennyiséget és kattints az "Eladás" gombra!',
        'tutorial.complete.title': 'Gratulálok!',
        'tutorial.complete.content': 'Most már tudod az alapokat! 🎉<br><br>Folytasd az építkezést, vásárolj új területeket, és építsd fel a birodalmadat!<br><br>💡 <b>Tipp:</b> A játék automatikusan mentődik!',
        'tutorial.next': 'Következő',
        'tutorial.start': 'Kezdés!',
        'tutorial.skip': 'Kihagyás',
        
        // Játék
        'game.title': 'Retro Skyblock Játék'
    },
    
    en: {
        // Settings menu
        'settings.sound': 'Sound',
        'settings.discord': 'Discord',
        'settings.language': 'Language',
        'settings.chat': 'Chat',
        'settings.credits': 'Credits',
        'settings.logout': 'Logout',
        
        // Status panel
        'status.money': 'Money',
        'status.planks': 'Planks',
        'status.corn': 'Corn',
        'status.workers': 'Workers',
        
        // Bubble - tile purchase
        'bubble.buyTile': 'Buy Tile',
        'bubble.price': 'Price: {0} coins',
        'bubble.buy': 'Purchase',
        'bubble.needMoney': 'Need {0} more coins!',
        'bubble.onlyAdjacent': 'You can only buy tiles adjacent to owned ones!',
        
        // Bubble - tree
        'bubble.cutting': 'Cutting tree...',
        'bubble.timeLeft': 'Time left: {0}s',
        'bubble.cut': 'Cut',
        'bubble.noWorker': '(no worker)',
        
        // Bubble - house
        'bubble.starterHouse': 'Starter House (Level {0})',
        'bubble.house': 'House (Level {0})',
        'bubble.workers': 'Workers: +{0}',
        'bubble.upgrade': 'Upgrade',
        'bubble.sell': 'Sell ({0} coins)',
        
        // Bubble - build
        'bubble.build': 'Build',
        'bubble.buildHouse': 'Build House ({0} coins)',
        'bubble.plantTree': 'Plant Tree ({0} coins)',
        'bubble.buildCornField': 'Corn Field ({0} coins)',
        'bubble.buildStoneCutter': 'Stone Cutter ({0} coins)',
        
        // Bubble - cornfield
        'bubble.cornfieldBuilding': 'Building corn field...',
        'bubble.harvest': 'Harvest',
        'bubble.replanting': 'Replanting corn...',
        'bubble.replant': 'Replant',
        
        // Bubble - stonecutter
        'bubble.stonecutter': 'Stone Cutter (Level {0})',
        
        // Bubble - mine
        'bubble.buildMine': 'Build Mine ({0} coins)',
        'bubble.mine': 'Mine (Level {0})',
        'bubble.mining': 'Mining in progress...',
        'bubble.startMining': 'Start Mining',
        
        // Bubble - warehouse
        'bubble.warehouse': 'Warehouse (Level {0})',
        'bubble.storage': 'Storage',
        'bubble.openWarehouse': 'Open',
        'bubble.storageFull': 'Storage is full!',
        
        // Modals - plank sell
        'modal.plankSell': 'Sell Planks',
        'modal.sellAmount': 'Planks to sell:',
        'modal.cancel': 'Cancel',
        'modal.sellFor': 'Sell ({0} 💰)',
        
        // Modals - corn sell
        'modal.cornSell': 'Sell Corn',
        'modal.cornSellAmount': 'Corn to sell:',
        
        // Modals - upgrade
        'modal.upgradeTitle': 'Upgrade',
        'modal.starterHouseUpgrade': 'Starter House Upgrade',
        'modal.houseUpgrade': 'House Upgrade',
        'modal.stonecutterUpgrade': 'Stone Cutter Upgrade',
        'modal.currentLevel': 'Current level:',
        'modal.workers': 'Workers:',
        'modal.level': 'Level {0}',
        'modal.extraWorker': '+1 extra worker',
        'modal.fasterCutting': 'Faster stone cutting',
        
        // Tutorial
        'tutorial.welcome.title': 'Welcome to Skyblock!',
        'tutorial.welcome.content': 'This is a retro-style building game. Let me guide you through the basics!',
        'tutorial.clickTile.title': 'Plant a tree!',
        'tutorial.clickTile.content': 'Click on the green area next to your house!',
        'tutorial.plantTree.title': 'Choose tree planting!',
        'tutorial.plantTree.content': 'Click the "Plant Tree" button!',
        'tutorial.clickTree.title': 'Cut down the tree!',
        'tutorial.clickTree.content': 'Click on the tree!',
        'tutorial.cutTree.title': 'Start cutting!',
        'tutorial.cutTree.content': 'Click the "Cut" button!',
        'tutorial.waitCut.title': 'Wait for it to be cut!',
        'tutorial.waitCut.content': 'Cutting the tree takes time. Watch the progress!',
        'tutorial.clickPlank.title': 'Sell the plank!',
        'tutorial.clickPlank.content': 'Click the 🪵 plank icon in the top left corner!',
        'tutorial.sellPlank.title': 'Sell a plank!',
        'tutorial.sellPlank.content': 'Set the amount and click the "Sell" button!',
        'tutorial.complete.title': 'Congratulations!',
        'tutorial.complete.content': 'Now you know the basics! 🎉<br><br>Continue building, buy new tiles, and build your empire!<br><br>💡 <b>Tip:</b> The game saves automatically!',
        'tutorial.next': 'Next',
        'tutorial.start': 'Start!',
        'tutorial.skip': 'Skip',
        
        // Game
        'game.title': 'Retro Skyblock Game'
    },
    
    de: {
        // Settings menu
        'settings.sound': 'Ton',
        'settings.discord': 'Discord',
        'settings.language': 'Sprache',
        'settings.chat': 'Chat',
        'settings.credits': 'Credits',
        'settings.logout': 'Abmelden',
        
        // Status panel
        'status.money': 'Geld',
        'status.planks': 'Bretter',
        'status.corn': 'Mais',
        'status.workers': 'Arbeiter',
        
        // Bubble - tile purchase
        'bubble.buyTile': 'Feld kaufen',
        'bubble.price': 'Preis: {0} Münzen',
        'bubble.buy': 'Kaufen',
        'bubble.needMoney': 'Noch {0} Münzen nötig!',
        'bubble.onlyAdjacent': 'Du kannst nur angrenzende Felder kaufen!',
        
        // Bubble - tree
        'bubble.cutting': 'Baum wird gefällt...',
        'bubble.timeLeft': 'Verbleibende Zeit: {0}s',
        'bubble.cut': 'Fällen',
        'bubble.noWorker': '(kein Arbeiter)',
        
        // Bubble - house
        'bubble.starterHouse': 'Starthaus (Stufe {0})',
        'bubble.house': 'Haus (Stufe {0})',
        'bubble.workers': 'Arbeiter: +{0}',
        'bubble.upgrade': 'Upgrade',
        'bubble.sell': 'Verkaufen ({0} Münzen)',
        
        // Bubble - build
        'bubble.build': 'Bauen',
        'bubble.buildHouse': 'Haus bauen ({0} Münzen)',
        'bubble.plantTree': 'Baum pflanzen ({0} Münzen)',
        'bubble.buildCornField': 'Maisfeld ({0} Münzen)',
        'bubble.buildStoneCutter': 'Steinmetz ({0} Münzen)',
        
        // Bubble - cornfield
        'bubble.cornfieldBuilding': 'Maisfeld wird gebaut...',
        'bubble.harvest': 'Ernten',
        'bubble.replanting': 'Mais wird neu gepflanzt...',
        'bubble.replant': 'Neu pflanzen',
        
        // Bubble - stonecutter
        'bubble.stonecutter': 'Steinmetz (Stufe {0})',
        
        // Bubble - Mine
        'bubble.buildMine': 'Mine bauen ({0} Münzen)',
        'bubble.mine': 'Mine (Stufe {0})',
        'bubble.mining': 'Bergbau läuft...',
        'bubble.startMining': 'Bergbau starten',
        
        // Bubble - Lager
        'bubble.warehouse': 'Lager (Stufe {0})',
        'bubble.storage': 'Speicher',
        'bubble.openWarehouse': 'Öffnen',
        'bubble.storageFull': 'Lager ist voll!',
        
        // Modals - plank sell
        'modal.plankSell': 'Bretter verkaufen',
        'modal.sellAmount': 'Zu verkaufende Bretter:',
        'modal.cancel': 'Abbrechen',
        'modal.sellFor': 'Verkaufen ({0} 💰)',
        
        // Modals - corn sell
        'modal.cornSell': 'Mais verkaufen',
        'modal.cornSellAmount': 'Zu verkaufender Mais:',
        
        // Modals - upgrade
        'modal.upgradeTitle': 'Upgrade',
        'modal.starterHouseUpgrade': 'Starthaus Upgrade',
        'modal.houseUpgrade': 'Haus Upgrade',
        'modal.stonecutterUpgrade': 'Steinmetz Upgrade',
        'modal.currentLevel': 'Aktuelle Stufe:',
        'modal.workers': 'Arbeiter:',
        'modal.level': 'Stufe {0}',
        'modal.extraWorker': '+1 extra Arbeiter',
        'modal.fasterCutting': 'Schnelleres Steinschneiden',
        
        // Tutorial
        'tutorial.welcome.title': 'Willkommen bei Skyblock!',
        'tutorial.welcome.content': 'Dies ist ein Retro-Aufbauspiel. Ich führe dich durch die Grundlagen!',
        'tutorial.clickTile.title': 'Pflanze einen Baum!',
        'tutorial.clickTile.content': 'Klicke auf das grüne Feld neben deinem Haus!',
        'tutorial.plantTree.title': 'Wähle Baum pflanzen!',
        'tutorial.plantTree.content': 'Klicke auf "Baum pflanzen"!',
        'tutorial.clickTree.title': 'Fälle den Baum!',
        'tutorial.clickTree.content': 'Klicke auf den Baum!',
        'tutorial.cutTree.title': 'Starte das Fällen!',
        'tutorial.cutTree.content': 'Klicke auf "Fällen"!',
        'tutorial.waitCut.title': 'Warte auf das Fällen!',
        'tutorial.waitCut.content': 'Das Fällen dauert eine Weile. Beobachte den Fortschritt!',
        'tutorial.clickPlank.title': 'Verkaufe das Brett!',
        'tutorial.clickPlank.content': 'Klicke auf das 🪵 Brett-Symbol oben links!',
        'tutorial.sellPlank.title': 'Verkaufe ein Brett!',
        'tutorial.sellPlank.content': 'Stelle die Menge ein und klicke auf "Verkaufen"!',
        'tutorial.complete.title': 'Gratulation!',
        'tutorial.complete.content': 'Jetzt kennst du die Grundlagen! 🎉<br><br>Baue weiter, kaufe neue Felder und errichte dein Imperium!<br><br>💡 <b>Tipp:</b> Das Spiel speichert automatisch!',
        'tutorial.next': 'Weiter',
        'tutorial.start': 'Start!',
        'tutorial.skip': 'Überspringen',
        
        // Game
        'game.title': 'Retro Skyblock Spiel'
    }
};

/**
 * Nyelv beállítása
 * @param {string} lang - Nyelv kód (hu, en, de)
 */
export function setLanguage(lang) {
    if (LANGUAGES.includes(lang)) {
        currentLanguage = lang;
        localStorage.setItem('skyblockLanguage', lang);
        translateDOM();
        // Esemény kiváltása a nyelv váltásról
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
}

/**
 * Következő nyelvre váltás (ciklikusan)
 */
export function cycleLanguage() {
    const currentIndex = LANGUAGES.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    setLanguage(LANGUAGES[nextIndex]);
}

/**
 * Aktuális nyelv lekérdezése
 * @returns {string} Nyelv kód
 */
export function getLanguage() {
    return currentLanguage;
}

/**
 * Következő nyelv lekérdezése
 * @returns {string} Következő nyelv kód
 */
export function getNextLanguage() {
    const currentIndex = LANGUAGES.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    return LANGUAGES[nextIndex];
}

/**
 * Szöveg fordítása
 * @param {string} key - Fordítási kulcs
 * @param {...any} args - Helyettesítendő paraméterek ({0}, {1}, stb.)
 * @returns {string} Lefordított szöveg
 */
export function t(key, ...args) {
    let text = translations[currentLanguage]?.[key] || translations['hu']?.[key] || key;
    
    // Paraméterek behelyettesítése
    args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
    });
    
    return text;
}

/**
 * DOM elemek fordítása data-i18n attribútum alapján
 */
export function translateDOM() {
    // data-i18n attribútummal rendelkező elemek
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // data-i18n-title attribútummal rendelkező elemek (title)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
    
    // data-i18n-placeholder attribútummal rendelkező elemek
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Oldal címe
    document.title = t('game.title');
}

/**
 * Nyelv betöltése localStorage-ból
 */
export function loadLanguage() {
    const savedLanguage = localStorage.getItem('skyblockLanguage');
    if (savedLanguage && LANGUAGES.includes(savedLanguage)) {
        currentLanguage = savedLanguage;
    }
}

/**
 * Inicializálás - hívd meg az alkalmazás indításakor
 */
export function initI18n() {
    loadLanguage();
    translateDOM();
}

