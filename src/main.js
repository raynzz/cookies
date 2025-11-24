import Game from './Game.js';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Initialize Game
let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new Game(canvas);
    requestAnimationFrame(loop);
});

// Game Loop
let lastTime = 0;
function loop(timestamp) {
    if (!game) {
        requestAnimationFrame(loop);
        return;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    game.update(deltaTime);
    game.draw();

    requestAnimationFrame(loop);
}
