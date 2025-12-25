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

