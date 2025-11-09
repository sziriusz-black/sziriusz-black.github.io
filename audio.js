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

    const frequencies = {
        purchase: 440,
        cut: 220,
        sell: 330,
        build: 550,
        complete: 660
    };

    // Hang hosszúságok (másodpercben)
    const durations = {
        purchase: 0.3,
        cut: 0.4,
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
    const duration = 0.2;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fehér zaj generálása (suhogó hatás)
    for (let i = 0; i < buffer.length; i++) {
        // Fehér zaj + gyors frekvencia változás
        const noise = (Math.random() * 2 - 1) * 0.3;
        const freqMod = Math.sin(i * 0.1) * 0.2;
        data[i] = noise + freqMod;
    }
    
    // Szűrés (magas frekvenciák kiemelése - levelek hangja)
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(filter);
    
    const gainNode = audioContext.createGain();
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    source.start(audioContext.currentTime);
    source.stop(audioContext.currentTime + duration);
}

