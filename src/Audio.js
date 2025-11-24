export default class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Lower volume
        this.masterGain.connect(this.ctx.destination);
    }

    playTone(freq, type, duration) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playShoot() {
        // Pew!
        this.playTone(600, 'square', 0.1);
    }

    playExplosion() {
        // Boom! (Noise simulation with low freq saw)
        this.playTone(100, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(50, 'square', 0.2), 50);
    }

    playLevelUp() {
        // Ding!
        this.playTone(800, 'sine', 0.3);
        setTimeout(() => this.playTone(1200, 'sine', 0.4), 100);
    }

    playDamage() {
        // Ouch!
        this.playTone(150, 'sawtooth', 0.3);
        this.playTone(100, 'sawtooth', 0.3);
    }
}
