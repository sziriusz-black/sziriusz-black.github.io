// Hangok (8-bites)
export function playSound(type) {
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
    
    // Speciális hang: Minecraft fa vágás (teljes kivágás)
    if (type === 'minecraftChop') {
        playMinecraftChopSound(audioContext);
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

// Minecraft fa vágás hang (teljes kivágás) - 3x ismétlés
function playMinecraftChopSound(audioContext) {
    const singleDuration = 0.12;
    const delayBetween = 0.05; // Késleltetés a hangok között
    
    // 3-szor ismétlés
    for (let i = 0; i < 3; i++) {
        const startTime = audioContext.currentTime + i * (singleDuration + delayBetween);
        
        // Minecraft stílusú "chop" hang - két részletből áll
        // 1. rész: rövid, éles "chop"
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        
        oscillator1.type = 'square';
        oscillator1.frequency.value = 150; // Közepes-mély frekvencia
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        
        // Gyors attack, gyors decay
        gainNode1.gain.setValueAtTime(0, startTime);
        gainNode1.gain.linearRampToValueAtTime(0.3, startTime + 0.005);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
        
        // 2. rész: mély rezonancia (fa hangja)
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.value = 60; // Mély rezonancia
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        // Lassabb attack, hosszabb decay
        gainNode2.gain.setValueAtTime(0, startTime);
        gainNode2.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, startTime + singleDuration);
        
        // Lowpass szűrő a Minecraft hangjához
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        filter.Q.value = 1.5;
        
        oscillator2.connect(filter);
        filter.connect(gainNode2);
        
        oscillator1.start(startTime);
        oscillator1.stop(startTime + 0.08);
        
        oscillator2.start(startTime);
        oscillator2.stop(startTime + singleDuration);
    }
}

