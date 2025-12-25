// Játékállapot
export const gameState = {
    money: 10,
    planks: 0,
    corn: 0,
    ownedTiles: 0,
    map: [],
    camera: {
        x: 0,
        y: 0,
        zoom: 5
    },
    activeBubble: null,
    cuttingTrees: new Map(),
    buildingCornfields: new Map(),
    replantingCornfields: new Map(),
    // Munkás rendszer
    workers: 3,    // Szabad munkások (kezdő ház ad 3-at)
    maxWorkers: 3  // Összes munkás
};

