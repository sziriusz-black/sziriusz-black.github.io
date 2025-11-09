// Játék konfiguráció
export const CONFIG = {
    MAX_ZOOM: 20,
    MIN_ZOOM: 1,
    ZOOM_STEP: 0.1,
    TILE_SIZE: 32,
    MARGIN: 10,
    TREE_CUT_TIME: 30,
    PURCHASE_PRICE: 100,
    HOUSE_BUILD_PRICE: 50,
    TREE_BUILD_PRICE: 10,
    HOUSE_SELL_PRICE: 25,
    PLANK_SELL_PRICE: 12,
    SKIP_TIME_THRESHOLD: 30, // Ha a hátralévő idő kisebb ennél, megjelenik a skip gomb
    CORNFIELD_BUILD_PRICE: 30,
    CORNFIELD_BUILD_TIME: 60,
    CORNFIELD_SELL_PRICE: 10,
    CORNFIELD_REPLANT_TIME: 20,
    CORN_SELL_PRICE:5
};

// Térkép típusok
export const TileType = {
    EMPTY: 'empty',
    TREE: 'tree',
    HOUSE: 'house',
    OWNED: 'owned',
    CORNFIELD: 'cornfield',
    EMPTY_CORNFIELD: 'emptycornfield'
};

