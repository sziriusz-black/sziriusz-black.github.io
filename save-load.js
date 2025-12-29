/**
 * @file save-load.js
 * @description Játékállapot mentése és betöltése - localStorage kezelés
 * 
 * FELELŐSSÉGI KÖR:
 * - Játékállapot mentése localStorage-ba (saveGameState)
 * - Játékállapot betöltése localStorage-ból (loadGameState)
 * - Tutorial állapot megőrzése mentéskor
 * - Folyamatban lévő műveletek (Map) szerializálása/deszerializálása
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Játék állapottal kapcsolatos → gameState.js
 * - Kamera/zoom kezeléssel kapcsolatos → camera.js
 * - Időzítőkkel kapcsolatos → timers.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */
import { gameState } from './gameState.js';
import { getZoomLevel } from './camera.js';
import { getCurrentUser } from './auth.js';

const REPORTS_STORAGE_KEY = 'retroSkyblockChatReports';
const OWNER_USERNAMES = ['Szíriusz', 'Szirius', 'szíriusz', 'szirius'];
const SUSPICIOUS_MONEY_INCREASE = 1000;

// Tulajdonos-e a felhasználó
function isOwner(username) {
    if (!username) return false;
    return OWNER_USERNAMES.some(owner => 
        owner.toLowerCase() === username.toLowerCase()
    );
}

// Gyanús pénznövekedés jelentése
function reportSuspiciousMoney(username, previousMoney, currentMoney) {
    try {
        const reports = JSON.parse(localStorage.getItem(REPORTS_STORAGE_KEY) || '[]');
        reports.push({
            id: crypto.randomUUID(),
            username: username,
            message: `Gyanús pénznövekedés: ${previousMoney} → ${currentMoney} (+${currentMoney - previousMoney})`,
            detectedWord: 'SUSPICIOUS_MONEY',
            timestamp: Date.now(),
            seen: false
        });
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
        console.error('Jelentés mentése sikertelen:', e);
    }
}

// Játékállapot mentése
export function saveGameState() {
    try {
        // Előző mentés beolvasása a tutorialCompleted flag megőrzéséhez
        const previousSave = localStorage.getItem('skyblockGame');
        let tutorialCompleted = false;
        let previousMoney = 0;
        
        if (previousSave) {
            try {
                const prev = JSON.parse(previousSave);
                tutorialCompleted = prev.tutorialCompleted || false;
                previousMoney = prev.money || 0;
            } catch (e) {
                console.error('Előző mentés olvasási hiba:', e);
            }
        }
        
        // Gyanús pénznövekedés ellenőrzése
        const currentUser = getCurrentUser();
        const moneyIncrease = gameState.money - previousMoney;
        
        if (currentUser && !isOwner(currentUser.username) && moneyIncrease > SUSPICIOUS_MONEY_INCREASE) {
            // Jelentés küldése
            reportSuspiciousMoney(currentUser.username, previousMoney, gameState.money);
            // Pénz visszaállítása az előző értékre
            gameState.money = previousMoney;
        }
        
        const state = {
            money: gameState.money,
            planks: gameState.planks,
            corn: gameState.corn,
            // Bánya erőforrások
            stone: gameState.stone,
            iron: gameState.iron,
            coal: gameState.coal,
            diamond: gameState.diamond,
            ownedTiles: gameState.ownedTiles,
            map: gameState.map,
            camera: gameState.camera,
            // Folyamatban lévő műveletek mentése
            cuttingTrees: Object.fromEntries(gameState.cuttingTrees),
            buildingCornfields: Object.fromEntries(gameState.buildingCornfields),
            replantingCornfields: Object.fromEntries(gameState.replantingCornfields),
            buildingMines: Object.fromEntries(gameState.buildingMines),
            miningMines: Object.fromEntries(gameState.miningMines),
            buildingHouses: Object.fromEntries(gameState.buildingHouses),
            // Munkás rendszer
            workers: gameState.workers,
            maxWorkers: gameState.maxWorkers,
            // Raktár rendszer
            warehouseCapacity: gameState.warehouseCapacity,
            warehouseLevel: gameState.warehouseLevel,
            // Tutorial állapot megőrzése
            tutorialCompleted: tutorialCompleted
        };
        localStorage.setItem('skyblockGame', JSON.stringify(state));
    } catch (e) {
        console.error('Mentés hiba:', e);
    }
}

// Játékállapot betöltése
export function loadGameState(createInitialMap, updateUI) {
    try {
        // === GLOBÁLIS ÚJRAINDÍTÁS ELLENŐRZÉSE ===
        const pendingRestart = localStorage.getItem('retroSkyblockPendingRestart');
        if (pendingRestart === 'true') {
            // Töröljük a flaget (mentés megmarad!)
            localStorage.removeItem('retroSkyblockPendingRestart');
            // Csak értesítjük a játékost, az oldal már újratöltődött
            console.log('🔄 Admin által elrendelt oldal újratöltés megtörtént.');
        }
        
        const saved = localStorage.getItem('skyblockGame');
        if (saved) {
            const state = JSON.parse(saved);
            gameState.money = state.money || 10;
            gameState.planks = state.planks || 0;
            gameState.corn = state.corn || 0;
            // Bánya erőforrások
            gameState.stone = state.stone || 0;
            gameState.iron = state.iron || 0;
            gameState.coal = state.coal || 0;
            gameState.diamond = state.diamond || 0;
            gameState.ownedTiles = state.ownedTiles || 0;
            gameState.map = state.map || [];
            if (state.camera) {
                gameState.camera.x = state.camera.x || 0;
                gameState.camera.y = state.camera.y || 0;
                gameState.camera.zoomLevel = state.camera.zoomLevel || 1;
                gameState.camera.zoom = getZoomLevel(gameState.camera.zoomLevel);
            }
            // Folyamatban lévő műveletek visszaállítása
            if (state.cuttingTrees) {
                gameState.cuttingTrees = new Map(Object.entries(state.cuttingTrees));
            }
            if (state.buildingCornfields) {
                gameState.buildingCornfields = new Map(Object.entries(state.buildingCornfields));
            }
            if (state.replantingCornfields) {
                gameState.replantingCornfields = new Map(Object.entries(state.replantingCornfields));
            }
            if (state.buildingMines) {
                gameState.buildingMines = new Map(Object.entries(state.buildingMines));
            }
            if (state.miningMines) {
                gameState.miningMines = new Map(Object.entries(state.miningMines));
            }
            if (state.buildingHouses) {
                gameState.buildingHouses = new Map(Object.entries(state.buildingHouses));
            }
            // Munkás rendszer visszaállítása
            if (state.workers !== undefined) {
                gameState.workers = state.workers;
            }
            if (state.maxWorkers !== undefined) {
                gameState.maxWorkers = state.maxWorkers;
            }
            // Raktár rendszer visszaállítása
            if (state.warehouseCapacity !== undefined) {
                gameState.warehouseCapacity = state.warehouseCapacity;
            }
            if (state.warehouseLevel !== undefined) {
                gameState.warehouseLevel = state.warehouseLevel;
            }
            
            // Ellenőrizzük, hogy van-e már raktár a térképen
            const hasWarehouse = gameState.map.some(tile => tile.type === 'warehouse');
            if (!hasWarehouse) {
                // Keresünk egy üres földet a raktárnak
                const emptyTile = gameState.map.find(tile => tile.type === 'owned');
                if (emptyTile) {
                    emptyTile.type = 'warehouse';
                    emptyTile.level = 1;
                    gameState.warehouseCapacity = 20;
                    gameState.warehouseLevel = 1;
                    console.log(`Raktár hozzáadva: (${emptyTile.x}, ${emptyTile.y})`);
                }
            }
            
            // === MIGRÁCIÓ: Fejlesztett bányák törlése és pénz visszaadása ===
            // Ez egy egyszeri migráció ami törli a fejlesztett bányákat
            const MINE_MIGRATION_KEY = 'skyblockMineMigrationDone';
            if (!localStorage.getItem(MINE_MIGRATION_KEY)) {
                let refundedMoney = 0;
                let removedMines = 0;
                
                gameState.map.forEach(tile => {
                    if (tile.type === 'mine' && tile.level && tile.level > 1) {
                        // Számoljuk ki mennyi pénzt költött a játékos a fejlesztésekre
                        // Upgrade költség: UPGRADE_BASE_PRICE + (level - 1) * UPGRADE_INCREMENT minden szinthez
                        for (let i = 2; i <= tile.level; i++) {
                            refundedMoney += CONFIG.UPGRADE_BASE_PRICE + (i - 2) * CONFIG.UPGRADE_INCREMENT;
                        }
                        // Bánya ára is visszajár
                        refundedMoney += CONFIG.MINE_BUILD_PRICE;
                        
                        // Tile visszaállítása üres területre
                        tile.type = 'owned';
                        delete tile.level;
                        delete tile.lastMiningResult;
                        removedMines++;
                    }
                });
                
                if (removedMines > 0) {
                    gameState.money += refundedMoney;
                    console.log(`MIGRÁCIÓ: ${removedMines} fejlesztett bánya törölve, ${refundedMoney} pénz visszaadva.`);
                    alert(`⛏️ Bánya rendszer frissítés!\n\n${removedMines} fejlesztett bánya törölve lett.\n${refundedMoney} 💰 visszaadva.\n\nA gyémánt esélye mostantól fix 1% marad.`);
                }
                
                // Jelezzük hogy a migráció megtörtént
                localStorage.setItem(MINE_MIGRATION_KEY, 'true');
            }
            
            if (updateUI) updateUI();
        }
    } catch (e) {
        console.error('Betöltés hiba:', e);
        createInitialMap();
    }
}

