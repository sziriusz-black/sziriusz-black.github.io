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
    const tileSize = CONFIG.TILE_SIZE;
    const borderWidth = 2; // barna keret szélessége
    const centerX = x + tileSize / 2;
    
    // Színek
    const brownColor = '#8b6f47'; // barna keret
    const grayColor = '#666666'; // szürke belseje
    const blackColor = '#000000'; // fekete téglalapok
    const redColor = '#ff0000'; // piros háromszög
    const lightBlueColor = '#87ceeb'; // világoskék kör
    
    // Piros háromszög a tetején (először ezt rajzoljuk)
    const triangleTopY = y;
    const triangleLeftX = x;
    const triangleRightX = x + tileSize;
    const triangleBottomY = y + tileSize / 3; // háromszög magassága
    
    ctx.fillStyle = redColor;
    ctx.beginPath();
    ctx.moveTo(Math.floor(centerX), Math.floor(triangleTopY));
    ctx.lineTo(Math.floor(triangleLeftX), Math.floor(triangleBottomY));
    ctx.lineTo(Math.floor(triangleRightX), Math.floor(triangleBottomY));
    ctx.closePath();
    ctx.fill();
    
    // Szürke belseje - a háromszög alsó vonala után kezdődik
    ctx.fillStyle = grayColor;
    const innerX = x + borderWidth;
    const innerY = triangleBottomY + borderWidth; // a háromszög alsó vonala után kezdődik
    const innerWidth = tileSize - borderWidth * 2;
    const innerHeight = (y + tileSize - borderWidth) - innerY; // az alsó barna keretig
    ctx.fillRect(Math.floor(innerX), Math.floor(innerY), innerWidth, innerHeight);
    
    // Fekete téglalapok - a szürke téglalap függőleges felénél (közepén) mindkét irányba 20px
    // A fekete téglalap alja a barna kerethez ér, teteje a szürke téglalap tetejéig ér
    ctx.fillStyle = blackColor;
    const blackRectWidth = 20;
    const blackRectTopY = innerY; // szürke téglalap teteje
    const blackRectBottomY = y + tileSize - borderWidth; // barna keret alja
    const blackRectHeight = blackRectBottomY - blackRectTopY;
    
    // Bal oldali fekete téglalap (a szürke téglalap közepétől balra 20px)
    const leftBlackX = innerX - blackRectWidth;
    ctx.fillRect(Math.floor(leftBlackX), Math.floor(blackRectTopY), blackRectWidth, Math.floor(blackRectHeight));
    
    // Jobb oldali fekete téglalap (a szürke téglalap közepétől jobbra 20px)
    const rightBlackX = innerX + innerWidth;
    ctx.fillRect(Math.floor(rightBlackX), Math.floor(blackRectTopY), blackRectWidth, Math.floor(blackRectHeight));
    
    // Fekete ajtó a szürke téglalapon
    ctx.fillStyle = blackColor;
    const doorWidth = 8;
    const doorHeight = 12;
    const doorX = centerX - doorWidth / 2; // középre igazítva
    const doorY = (y + tileSize - borderWidth) - doorHeight; // az alsó barna keret fölött
    ctx.fillRect(Math.floor(doorX), Math.floor(doorY), doorWidth, doorHeight);
    
    // Barna keretek
    ctx.fillStyle = brownColor;
    // Felső vonal - a háromszög alsó vonalához igazítva
    ctx.fillRect(Math.floor(x), Math.floor(triangleBottomY), tileSize, borderWidth);
    // Alsó vonal
    ctx.fillRect(Math.floor(x), Math.floor(y + tileSize - borderWidth), tileSize, borderWidth);
    // Bal oldal - a háromszög alsó vonalától kezdődik
    ctx.fillRect(Math.floor(x), Math.floor(triangleBottomY), borderWidth, tileSize - (triangleBottomY - y));
    // Jobb oldal - a háromszög alsó vonalától kezdődik
    ctx.fillRect(Math.floor(x + tileSize - borderWidth), Math.floor(triangleBottomY), borderWidth, tileSize - (triangleBottomY - y));
    
    // Világoskék kör a háromszög közepén (a háromszög után rajzoljuk, hogy a barna keret alatt legyen)
    ctx.fillStyle = lightBlueColor;
    const circleRadius = 3;
    const circleY = triangleTopY + (triangleBottomY - triangleTopY) / 2;
    ctx.beginPath();
    ctx.arc(Math.floor(centerX), Math.floor(circleY), circleRadius, 0, Math.PI * 2);
    ctx.fill();
}

export function drawCornField(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    const centerY = y + tileSize / 2;
    
    // Föld háttér (barna)
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(Math.floor(x), Math.floor(y), tileSize, tileSize);
    
    // Föld sötétebb részletek
    ctx.fillStyle = '#7a5f37';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(
                    Math.floor(x + i * tileSize / 4),
                    Math.floor(y + j * tileSize / 4),
                    Math.floor(tileSize / 4),
                    Math.floor(tileSize / 4)
                );
            }
        }
    }
    
    // Kukorica növény (sárga/zöld)
    ctx.fillStyle = '#ffd700'; // Sárga kukorica
    const cornWidth = 4;
    const cornHeight = 12;
    const cornX = Math.floor(centerX - cornWidth / 2);
    const cornY = Math.floor(y + tileSize - cornHeight - 4);
    ctx.fillRect(cornX, cornY, cornWidth, cornHeight);
    
    // Kukorica levelek (zöld)
    ctx.fillStyle = '#4a7c4a';
    ctx.fillRect(Math.floor(cornX - 2), Math.floor(cornY + 2), 2, 6);
    ctx.fillRect(Math.floor(cornX + cornWidth), Math.floor(cornY + 2), 2, 6);
}

export function drawEmptyCornField(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    
    // Föld háttér (barna)
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(Math.floor(x), Math.floor(y), tileSize, tileSize);
    
    // Föld sötétebb részletek
    ctx.fillStyle = '#7a5f37';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(
                    Math.floor(x + i * tileSize / 4),
                    Math.floor(y + j * tileSize / 4),
                    Math.floor(tileSize / 4),
                    Math.floor(tileSize / 4)
                );
            }
        }
    }
    
    // Üres föld - nincs növény, csak a föld
}

