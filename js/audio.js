const Sound = (() => {
    let ctx = null;
    let master = null;
    let muted = false;
    let droneNodes = null;

    function init() {
        if (ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
    }

    function tone(freq, dur, type = 'sine', vol = 0.3, delay = 0, slideTo = null) {
        if (!ctx || muted) return;
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    function noise(dur, vol = 0.5, filterFreq = 1000, delay = 0, filterEnd = 100) {
        if (!ctx || muted) return;
        const t = ctx.currentTime + delay;
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, t);
        filter.frequency.exponentialRampToValueAtTime(filterEnd, t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(filter).connect(g).connect(master);
        src.start(t);
    }

    const sfx = {
        click: () => tone(880, 0.06, 'square', 0.08),
        hover: () => tone(1400, 0.03, 'sine', 0.03),
        cash: () => { tone(1318, 0.08, 'square', 0.12); tone(1760, 0.25, 'square', 0.12, 0.08); },
        coin: () => { tone(988, 0.07, 'square', 0.1); tone(1319, 0.2, 'square', 0.1, 0.07); },
        error: () => { tone(200, 0.15, 'sawtooth', 0.15); tone(150, 0.25, 'sawtooth', 0.15, 0.12); },
        whoosh: () => noise(1.2, 0.25, 3000, 0, 200),
        takeoff: () => { tone(120, 1.2, 'sawtooth', 0.08, 0, 400); noise(1.2, 0.15, 2000, 0, 300); },
        explosion: (big = false) => {
            noise(big ? 3.5 : 1.4, big ? 1.0 : 0.6, big ? 1200 : 2000, 0, 40);
            tone(big ? 60 : 90, big ? 2.5 : 0.8, 'sine', 0.5, 0, 25);
        },
        siren: () => {
            for (let i = 0; i < 3; i++) {
                tone(440, 0.6, 'sawtooth', 0.09, i * 1.0, 880);
                tone(880, 0.4, 'sawtooth', 0.09, i * 1.0 + 0.6, 440);
            }
        },
        dice: () => { for (let i = 0; i < 8; i++) tone(300 + Math.random() * 500, 0.04, 'square', 0.06, i * 0.07); },
        win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.18, i * 0.12)),
        lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.35, 'triangle', 0.18, i * 0.15)),
        card: () => { noise(0.15, 0.2, 5000, 0, 1000); tone(660, 0.15, 'triangle', 0.1, 0.05); },
        build: () => { for (let i = 0; i < 3; i++) { noise(0.08, 0.4, 3000, i * 0.15, 500); tone(180, 0.08, 'square', 0.1, i * 0.15); } },
        pickup: () => [880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.12, 'sine', 0.12, i * 0.05)),
        alarm: () => { for (let i = 0; i < 4; i++) tone(1000, 0.12, 'square', 0.1, i * 0.25); },
        police: () => { for (let i = 0; i < 4; i++) { tone(700, 0.2, 'square', 0.08, i * 0.4); tone(1000, 0.2, 'square', 0.08, i * 0.4 + 0.2); } },
    };

    function startDrone() {
        if (!ctx || droneNodes) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = 55;
        osc2.frequency.value = 55.4;
        filter.type = 'lowpass';
        filter.frequency.value = 180;
        g.gain.value = muted ? 0 : 0.05;
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(g).connect(master);
        osc1.start();
        osc2.start();
        droneNodes = { osc1, osc2, g, filter };
    }

    function setTension(level) {
        if (!droneNodes) return;
        const t = ctx.currentTime;
        droneNodes.filter.frequency.linearRampToValueAtTime(180 + level * 500, t + 2);
        droneNodes.osc2.frequency.linearRampToValueAtTime(55.4 + level * 3, t + 2);
        droneNodes.g.gain.linearRampToValueAtTime(muted ? 0 : 0.04 + level * 0.05, t + 2);
    }

    function stopDrone() {
        if (!droneNodes) return;
        droneNodes.osc1.stop();
        droneNodes.osc2.stop();
        droneNodes = null;
    }

    function toggleMute() {
        muted = !muted;
        if (droneNodes) droneNodes.g.gain.value = muted ? 0 : 0.05;
        return muted;
    }

    function play(name, ...args) {
        if (sfx[name]) sfx[name](...args);
    }

    return { init, play, startDrone, stopDrone, setTension, toggleMute, isMuted: () => muted };
})();
