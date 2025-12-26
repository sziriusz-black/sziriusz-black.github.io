/**
 * @file audio.js
 * @description Hangkezelés - háttérzene és hangeffektek
 * 
 * FELELŐSSÉGI KÖR:
 * - Háttérzene generálása és lejátszása (startBackgroundMusic)
 * - Hangeffektek lejátszása (playSound)
 * - Hang némítás kezelése (toggleMute, isMusicMuted, loadMuteState)
 * - Web Audio API kezelés
 * 
 * ⚠️ FIGYELMEZTETÉS:
 * Ha új funkcionalitásra van szükség, amely:
 * - Beállítások menüvel kapcsolatos → settings.js
 * - UI elemekkel kapcsolatos → ui.js
 * 
 * Kérjük, a megfelelő modulba fejlessz!
 */

// Háttérzene - Western stílus generálva
let audioContext = null;
let isPlaying = false;
let musicVolume = 0.3;
let nextNoteTime = 0;
let currentChord = 0;
let schedulerTimer = null;
let isMuted = false;

// Western akkordmenet (Am - G - F - E)
const westernChords = [
    [220, 277, 330],      // Am
    [196, 247, 294],      // G
    [175, 220, 262],      // F
    [165, 208, 247]       // E
];

// Western basszus hangok
const bassNotes = [110, 98, 87, 82];

let musicListenersAdded = false;

export function startBackgroundMusic() {
    if (musicListenersAdded) return;
    musicListenersAdded = true;
    
    const tryStart = () => {
        if (isPlaying) return true;
        
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Ha suspended állapotban van, resume-olni kell
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    if (!isPlaying) {
                        isPlaying = true;
                        nextNoteTime = audioContext.currentTime;
                        scheduleMusic();
                    }
                }).catch(err => {
                    console.error('Western zene resume hiba:', err);
                });
                return false;
            } else {
                isPlaying = true;
                nextNoteTime = audioContext.currentTime;
                scheduleMusic();
                return true;
            }
        } catch (err) {
            console.error('Western zene indítási hiba:', err);
            return false;
        }
    };
    
    // Interakcióra indul (böngésző korlátozás miatt)
    const startOnInteraction = () => {
        if (tryStart()) {
            // Csak akkor töröljük a listenereket, ha sikeresen elindult
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
        }
    };
    
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
}

function scheduleMusic() {
    if (!isPlaying || !audioContext) return;
    
    while (nextNoteTime < audioContext.currentTime + 0.2) {
        playWesternBeat(nextNoteTime);
        nextNoteTime += 0.5; // Fél másodperces ütem
    }
    
    schedulerTimer = setTimeout(scheduleMusic, 100);
}

function playWesternBeat(time) {
    if (!audioContext || isMuted) return;
    
    const chord = westernChords[currentChord];
    const bass = bassNotes[currentChord];
    
    // Basszus hang (mély, rövid)
    playNote(bass, time, 0.4, 'triangle', musicVolume * 0.5);
    
    // Akkord hangok (gitár-szerű twang)
    chord.forEach((freq, i) => {
        playNote(freq, time + 0.05 + i * 0.02, 0.3, 'sawtooth', musicVolume * 0.2);
    });
    
    // Következő akkord (4 ütem után vált)
    if (Math.random() < 0.25) {
        currentChord = (currentChord + 1) % westernChords.length;
    }
}

function playNote(frequency, time, duration, waveType, volume) {
    if (!audioContext || isMuted || volume <= 0) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, time);
    
    // Gitár-szerű hangszín
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, time);
    filter.Q.setValueAtTime(1, time);
    
    // Western "twang" - gyors attack, lassú decay
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, time + duration * 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(time);
    oscillator.stop(time + duration);
}

export function stopBackgroundMusic() {
    isPlaying = false;
    if (schedulerTimer) {
        clearTimeout(schedulerTimer);
        schedulerTimer = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}

export function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
}

export function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
        musicVolume = 0;
    } else {
        musicVolume = 0.3;
    }
    // Mentés localStorage-ba
    saveMuteState();
    return isMuted;
}

export function setMuted(muted) {
    isMuted = muted;
    if (isMuted) {
        musicVolume = 0;
    } else {
        musicVolume = 0.3;
    }
}

export function isMusicMuted() {
    return isMuted;
}

// Zene állapot mentése
function saveMuteState() {
    try {
        localStorage.setItem('skyblockMusicMuted', isMuted ? 'true' : 'false');
    } catch (e) {
        console.error('Zene állapot mentési hiba:', e);
    }
}

// Zene állapot betöltése
export function loadMuteState() {
    try {
        const saved = localStorage.getItem('skyblockMusicMuted');
        if (saved === 'true') {
            isMuted = true;
            musicVolume = 0;
            return true;
        }
    } catch (e) {
        console.error('Zene állapot betöltési hiba:', e);
    }
    return false;
}

// Hangok (8-bites)
export function playSound(type) {
    // Ha le van némítva, nem játszunk le semmit
    if (isMuted) return;
    
    // Speciális hang: Minecraft fa vágás (teljes kivágás) - először ellenőrizzük
    if (type === 'minecraftChop') {
        playMinecraftChopMP3();
        return;
    }
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Speciális hang: levelek suhogása (fa ültetés)
    if (type === 'plantTree' || type === 'rustle') {
        playRustleSound(audioContext);
        return;
    }
    
    // Egyszerű beep hangok generálása
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Speciális hang: fa vágás (téli sufniban)
    if (type === 'cut') {
        playChopSound(audioContext);
        return;
    }

    const frequencies = {
        purchase: 440,
        sell: 330,
        build: 550,
        complete: 660
    };

    // Hang hosszúságok (másodpercben)
    const durations = {
        purchase: 0.3,
        sell: 0.25,
        build: 0.35,
        complete: 0.5
    };

    const duration = durations[type] || 0.3;

    oscillator.frequency.value = frequencies[type] || 440;
    oscillator.type = 'square'; // 8-bites hang
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Levelek suhogása (rugdosás hangja)
function playRustleSound(audioContext) {
    const duration = 0.4; // Hosszabb hang
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fehér zaj generálása (suhogó hatás)
    for (let i = 0; i < buffer.length; i++) {
        const progress = i / buffer.length;
        // Fehér zaj + gyors frekvencia változás
        const noise = (Math.random() * 2 - 1) * 0.3;
        const freqMod = Math.sin(i * 0.1) * 0.15;
        // Fokozatosan csökkenő amplitúdó (nincs fémes hang a végén)
        const fadeOut = 1 - (progress * 0.8);
        data[i] = (noise + freqMod) * fadeOut;
    }
    
    // Szűrés (magas frekvenciák kiemelése - levelek hangja)
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800; // Kicsit alacsonyabb, hogy ne legyen fémes
    filter.Q.value = 0.8; // Lágyabb szűrés
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(filter);
    
    const gainNode = audioContext.createGain();
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Lágy fade out (nincs hirtelen lecsengés)
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    source.start(audioContext.currentTime);
    source.stop(audioContext.currentTime + duration);
}

// Fa vágás hang (téli sufniban)
function playChopSound(audioContext) {
    const duration = 0.15;
    
    // Mély, kemény "thunk" hang
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Mély frekvencia (fa vágás)
    oscillator.frequency.value = 80; // Nagyon mély hang
    oscillator.type = 'sawtooth'; // Keményebb, durvább hang
    
    // Gyors attack, lassú decay (thunk hatás)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01); // Gyors fel
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.08); // Lassú le
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    // Alacsony frekvenciás rezonancia (fa hangja)
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 2;
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Minecraft fa vágás hang (teljes kivágás) - MP3 fájl lejátszása 2 másodperc alatt
function playMinecraftChopMP3() {
    try {
        const audio = new Audio('Breaking a Wood Sound Effect [Minecraft].mp3');
        audio.volume = 0.7;
        let stopTimeout = null;
        
        // 2 másodperc után leállítjuk a lejátszást
        const setupStopTimeout = () => {
            if (stopTimeout) clearTimeout(stopTimeout);
            stopTimeout = setTimeout(() => {
                if (audio && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            }, 2000);
        };
        
        // Ha a hang véget ér 2 másodperc előtt, akkor töröljük a timeout-ot
        audio.addEventListener('ended', () => {
            if (stopTimeout) {
                clearTimeout(stopTimeout);
                stopTimeout = null;
            }
        });
        
        // Lejátszás - várjuk meg, amíg a fájl betöltődik
        const playAudio = () => {
            audio.play().then(() => {
                setupStopTimeout();
            }).catch(err => {
                console.error('Hang lejátszási hiba:', err);
                if (stopTimeout) {
                    clearTimeout(stopTimeout);
                    stopTimeout = null;
                }
            });
        };
        
        // Ha már betöltődött, azonnal lejátszás
        if (audio.readyState >= 2) {
            playAudio();
        } else {
            // Várjuk meg, amíg betöltődik
            audio.addEventListener('canplaythrough', playAudio, { once: true });
            audio.addEventListener('loadeddata', playAudio, { once: true });
            // Betöltés indítása
            audio.load();
        }
    } catch (err) {
        console.error('MP3 lejátszás hiba:', err);
    }
}

