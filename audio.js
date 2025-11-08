// Hangok (8-bites)
export function playSound(type) {
    // Egyszerű beep hangok generálása
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

