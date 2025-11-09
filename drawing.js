import { CONFIG } from './config.js';

export function drawTree(ctx, x, y) {
    // Minecraft stílusú fa rajzolása (blokkos, pixeles)
    const centerX = x + CONFIG.TILE_SIZE / 2;
    const tileCenterY = y + CONFIG.TILE_SIZE / 2;
    
    // Törzs (barna blokk a középen)
    ctx.fillStyle = '#6b4423'; // Minecraft fa törzs színe
    const trunkWidth = 4;
    const trunkHeight = 10;
    const trunkX = Math.floor(centerX - trunkWidth / 2);
    const trunkY = Math.floor(y + CONFIG.TILE_SIZE - trunkHeight);
    ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
    
    // Törzs sötétebb részletek (3D hatás)
    ctx.fillStyle = '#5a3419';
    ctx.fillRect(trunkX, trunkY, trunkWidth, 2);
    ctx.fillRect(trunkX, trunkY + trunkHeight - 2, trunkWidth, 2);
    
    // Korona (zöld blokkok/kockák a tetején) - Minecraft stílus
    ctx.fillStyle = '#4a7c4a'; // Minecraft levelek színe
    const leafSize = 3;
    const leafOffset = 2;
    
    // Felső réteg levelek (3x3 blokk)
    const topY = trunkY - leafOffset;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const leafX = Math.floor(centerX + i * leafSize - leafSize / 2);
            const leafY = Math.floor(topY + j * leafSize - leafSize / 2);
            ctx.fillRect(leafX, leafY, leafSize, leafSize);
        }
    }
    
    // Középső réteg levelek (2x2 blokk)
    ctx.fillStyle = '#3a6a3a'; // Sötétebb zöld
    const midY = topY + leafSize;
    for (let i = -1; i <= 0; i++) {
        for (let j = -1; j <= 0; j++) {
            const leafX = Math.floor(centerX + i * leafSize * 1.5 - leafSize / 2);
            const leafY = Math.floor(midY + j * leafSize * 1.5 - leafSize / 2);
            ctx.fillRect(leafX, leafY, leafSize, leafSize);
        }
    }
    
    // Vékony levelek a széleken (1x1 blokkok)
    ctx.fillStyle = '#5a8a5a'; // Világosabb zöld
    const edgeLeaves = [
        [centerX - leafSize * 2, topY],
        [centerX + leafSize * 2, topY],
        [centerX - leafSize * 2, topY + leafSize],
        [centerX + leafSize * 2, topY + leafSize]
    ];
    edgeLeaves.forEach(([lx, ly]) => {
        ctx.fillRect(Math.floor(lx - leafSize / 2), Math.floor(ly - leafSize / 2), leafSize, leafSize);
    });
}

export function drawHouse(ctx, x, y) {
    // 8-bites pixeles ház rajzolása (bőrszínű szélek, szürke közép, kerítés teteje)
    const baseY = y + CONFIG.TILE_SIZE - 12;
    const roofTopY = y + 8;
    const roofLeftX = x + 4;
    const roofRightX = x + CONFIG.TILE_SIZE - 4;
    const centerX = x + CONFIG.TILE_SIZE / 2;
    const tileWidth = CONFIG.TILE_SIZE;
    const tileHeight = CONFIG.TILE_SIZE;
    
    // Bőrszín (fakó barna)
    const leatherColor = '#8b6f47';
    const darkLeatherColor = '#7a5f37';
    const grayColor = '#666666';
    
    // Ház alap - bal szél (bőrszínű)
    ctx.fillStyle = leatherColor;
    ctx.fillRect(Math.floor(x), Math.floor(baseY), 4, 8);
    
    // Ház alap - jobb szél (bőrszínű)
    ctx.fillRect(Math.floor(x + tileWidth - 4), Math.floor(baseY), 4, 8);
    
    // Ház alap - közép (szürke)
    ctx.fillStyle = grayColor;
    ctx.fillRect(Math.floor(x + 4), Math.floor(baseY), tileWidth - 8, 8);
    
    // Felső csík (bőrszínű)
    ctx.fillStyle = leatherColor;
    ctx.fillRect(Math.floor(x), Math.floor(y + 2), tileWidth, 2);
    
    // Tető - bal oldal (bőrszínű)
    ctx.fillStyle = leatherColor;
    const steps = 5;
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const t2 = (i + 1) / steps;
        const x1 = Math.floor(roofLeftX + (centerX - roofLeftX) * t);
        const y1 = Math.floor(baseY + (roofTopY - baseY) * t);
        const x2 = Math.floor(roofLeftX + (centerX - roofLeftX) * t2);
        const y2 = Math.floor(baseY + (roofTopY - baseY) * t2);
        
        const height = Math.max(2, Math.ceil((y2 - y1) / 2));
        ctx.fillRect(x1, y1, x2 - x1 + 1, height);
    }
    
    // Tető - jobb oldal (bőrszínű)
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const t2 = (i + 1) / steps;
        const x1 = Math.floor(centerX + (roofRightX - centerX) * t);
        const y1 = Math.floor(roofTopY + (baseY - roofTopY) * t);
        const x2 = Math.floor(centerX + (roofRightX - centerX) * t2);
        const y2 = Math.floor(roofTopY + (baseY - roofTopY) * t2);
        
        const height = Math.max(2, Math.ceil((y2 - y1) / 2));
        ctx.fillRect(x1, y1, x2 - x1 + 1, height);
    }
    
    // Tető középső része (szürke)
    ctx.fillStyle = grayColor;
    const midRoofY = Math.floor((roofTopY + baseY) / 2);
    ctx.fillRect(Math.floor(centerX - 2), Math.floor(midRoofY - 1), 4, 2);
    
    // Kerítés rudak a tetején (vékony bőrszínű)
    ctx.fillStyle = darkLeatherColor;
    const fenceSpacing = 3;
    const fenceStartX = Math.floor(x + 2);
    const fenceEndX = Math.floor(x + tileWidth - 2);
    const fenceY = Math.floor(roofTopY);
    
    for (let fx = fenceStartX; fx < fenceEndX; fx += fenceSpacing) {
        ctx.fillRect(fx, fenceY, 1, 2);
    }
    
    // Ajtó (pixeles)
    ctx.fillStyle = '#4a2a1a';
    const doorX = Math.floor(centerX - 3);
    const doorY = Math.floor(y + CONFIG.TILE_SIZE - 10);
    ctx.fillRect(doorX, doorY, 6, 6);
    
    // Ablak (pixeles)
    ctx.fillStyle = '#4a9eff';
    const windowX = Math.floor(x + 6);
    const windowY = Math.floor(baseY - 4);
    ctx.fillRect(windowX, windowY, 4, 4);
    ctx.fillRect(Math.floor(x + CONFIG.TILE_SIZE - 10), windowY, 4, 4);
}

