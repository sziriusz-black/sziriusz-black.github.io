/**
 * @file sprites/mine.js
 * @description Bánya sprite rajzolása - pixelgrafika
 * 
 * FELELŐSSÉGI KÖR:
 * - Bánya bejárat rajzolása
 * - Szikla háttér rajzolása
 * - Csákány eszköz rajzolása
 * - Szint megjelenítés
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Más sprite-tal kapcsolatos → sprites/*.js
 * - Tile renderelésssel kapcsolatos → tile-renderer.js
 * - Bánya szint megjelenítéssel kapcsolatos → itt módosíts
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

import { CONFIG } from '../config.js';

export function drawMine(ctx, x, y, level = 1) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    
    // Szikla háttér (sötétszürke domb)
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + tileSize - 2);
    ctx.lineTo(x + 6, y + 8);
    ctx.lineTo(centerX, y + 4);
    ctx.lineTo(x + tileSize - 6, y + 8);
    ctx.lineTo(x + tileSize - 2, y + tileSize - 2);
    ctx.closePath();
    ctx.fill();
    
    // Szikla részletek (világosabb foltok)
    ctx.fillStyle = '#666666';
    ctx.fillRect(Math.floor(x + 8), Math.floor(y + 10), 4, 3);
    ctx.fillRect(Math.floor(x + 20), Math.floor(y + 12), 3, 2);
    ctx.fillRect(Math.floor(x + 14), Math.floor(y + 6), 3, 2);
    
    // Sötétebb szikla részletek
    ctx.fillStyle = '#444444';
    ctx.fillRect(Math.floor(x + 6), Math.floor(y + 16), 3, 4);
    ctx.fillRect(Math.floor(x + 22), Math.floor(y + 8), 2, 3);
    
    // Bánya bejárat (sötét lyuk)
    ctx.fillStyle = '#1a1a1a';
    const entranceWidth = 14;
    const entranceHeight = 16;
    const entranceX = Math.floor(centerX - entranceWidth / 2);
    const entranceY = Math.floor(y + tileSize - entranceHeight - 2);
    
    // Ívelt bejárat felső része
    ctx.beginPath();
    ctx.arc(centerX, entranceY + 4, entranceWidth / 2, Math.PI, 0, false);
    ctx.lineTo(entranceX + entranceWidth, y + tileSize - 2);
    ctx.lineTo(entranceX, y + tileSize - 2);
    ctx.closePath();
    ctx.fill();
    
    // Bejárat keret (fából)
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(entranceX - 2, entranceY + 2, 3, entranceHeight);
    ctx.fillRect(entranceX + entranceWidth - 1, entranceY + 2, 3, entranceHeight);
    
    // Felső gerenda
    ctx.fillStyle = '#7a5533';
    ctx.fillRect(entranceX - 2, entranceY, entranceWidth + 4, 3);
    
    // Csákány (jobb oldalon)
    // Fa nyél
    ctx.fillStyle = '#8b6f47';
    ctx.save();
    ctx.translate(x + tileSize - 8, y + 8);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-1, 0, 3, 12);
    ctx.restore();
    
    // Csákány fej (fém)
    ctx.fillStyle = '#888888';
    ctx.fillRect(Math.floor(x + tileSize - 12), Math.floor(y + 6), 8, 3);
    
    // Csákány éle (világosabb)
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(Math.floor(x + tileSize - 12), Math.floor(y + 6), 2, 3);
    ctx.fillRect(Math.floor(x + tileSize - 6), Math.floor(y + 6), 2, 3);
    
    // Drágakő jelzések szint alapján (minél magasabb szint, annál több)
    if (level >= 2) {
        // Kék drágakő
        ctx.fillStyle = '#4a9eff';
        ctx.fillRect(Math.floor(x + 6), Math.floor(y + 12), 3, 3);
    }
    if (level >= 3) {
        // Piros drágakő
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(Math.floor(x + 22), Math.floor(y + 10), 3, 3);
    }
    if (level >= 4) {
        // Zöld drágakő
        ctx.fillStyle = '#6bff6b';
        ctx.fillRect(Math.floor(x + 4), Math.floor(y + 18), 2, 2);
    }
    if (level >= 5) {
        // Gyémánt csillogás
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(Math.floor(x + 24), Math.floor(y + 16), 2, 2);
    }
    
    // Szint kijelzés (ha 2+)
    if (level > 1) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${level}`, x + tileSize - 2, y + tileSize - 2);
    }
}

// Építés alatt lévő bánya
export function drawBuildingMine(ctx, x, y) {
    const tileSize = CONFIG.TILE_SIZE;
    const centerX = x + tileSize / 2;
    
    // Félig kész szikla (halványabb)
    ctx.fillStyle = 'rgba(85, 85, 85, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + tileSize - 2);
    ctx.lineTo(x + 6, y + 12);
    ctx.lineTo(centerX, y + 8);
    ctx.lineTo(x + tileSize - 6, y + 12);
    ctx.lineTo(x + tileSize - 2, y + tileSize - 2);
    ctx.closePath();
    ctx.fill();
    
    // Építési állvány
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + tileSize - 20), 2, 18);
    ctx.fillRect(Math.floor(x + tileSize - 6), Math.floor(y + tileSize - 20), 2, 18);
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + tileSize - 20), tileSize - 8, 2);
    
    // Építés ikon
    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⛏️', centerX, y + tileSize / 2);
}


