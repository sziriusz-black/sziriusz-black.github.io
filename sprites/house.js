/**
 * @file sprites/house.js
 * @description Ház sprite rajzolása - pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Ház tető rajzolása (piros háromszög)
 * - Ház fal rajzolása (szürke)
 * - Ajtó és ablak rajzolása
 * - Barna keret
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Ház szint megjelenítéssel kapcsolatos → itt módosíts
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

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

// Épülő ház - építési állványzattal és burkolattal
export function drawBuildingHouse(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    
    // Alap struktúra (halványabb, félig kész ház)
    ctx.fillStyle = 'rgba(102, 102, 102, 0.5)';
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + tileSize / 3), tileSize - 8, tileSize * 2 / 3 - 4);
    
    // Félig kész tető körvonal
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.floor(centerX), Math.floor(y + 2));
    ctx.lineTo(Math.floor(x + 2), Math.floor(y + tileSize / 3));
    ctx.lineTo(Math.floor(x + tileSize - 2), Math.floor(y + tileSize / 3));
    ctx.closePath();
    ctx.stroke();
    
    // Építési állványzat - fa gerendák
    ctx.fillStyle = '#8b6f47';
    
    // Bal oldali függőleges gerenda
    ctx.fillRect(Math.floor(x), Math.floor(y + 2), 3, tileSize - 4);
    // Jobb oldali függőleges gerenda
    ctx.fillRect(Math.floor(x + tileSize - 3), Math.floor(y + 2), 3, tileSize - 4);
    
    // Vízszintes gerendák
    ctx.fillRect(Math.floor(x), Math.floor(y + 2), tileSize, 2);
    ctx.fillRect(Math.floor(x), Math.floor(y + tileSize / 2), tileSize, 2);
    ctx.fillRect(Math.floor(x), Math.floor(y + tileSize - 4), tileSize, 2);
    
    // Kereszt gerendák (X minta)
    ctx.strokeStyle = '#6b5137';
    ctx.lineWidth = 2;
    // Bal felső - jobb alsó
    ctx.beginPath();
    ctx.moveTo(Math.floor(x + 3), Math.floor(y + 4));
    ctx.lineTo(Math.floor(x + tileSize - 3), Math.floor(y + tileSize / 2 - 2));
    ctx.stroke();
    // Jobb felső - bal alsó
    ctx.beginPath();
    ctx.moveTo(Math.floor(x + tileSize - 3), Math.floor(y + 4));
    ctx.lineTo(Math.floor(x + 3), Math.floor(y + tileSize / 2 - 2));
    ctx.stroke();
    
    // Narancssárga építési háló/fólia (sarkokban)
    ctx.fillStyle = 'rgba(255, 165, 0, 0.4)';
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + tileSize / 3 + 4), 6, 8);
    ctx.fillRect(Math.floor(x + tileSize - 10), Math.floor(y + tileSize / 3 + 4), 6, 8);
    
    // Építés alatt ikon
    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔨', centerX, y + tileSize - 8);
}

