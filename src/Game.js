import Renderer from './Renderer.js';
import Player from './Player.js';
import LevelManager from './LevelManager.js';
import AudioController from './Audio.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.player = new Player(canvas.width / 2, canvas.height - 100);
        this.levelManager = new LevelManager();
        this.audio = new AudioController();

        this.state = 'MENU';
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.particles = [];
        this.cookiesDestroyed = 0;
        this.enemySpawnTimer = 0;
        this.lives = 3;

        this.setupInputs();

        // UI Elements
        this.scoreEl = document.getElementById('score');
        this.levelEl = document.getElementById('level');
        this.healthEl = document.getElementById('health');
        this.gameOverEl = document.getElementById('game-over');
        this.victoryEl = document.getElementById('victory');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.ui = document.getElementById('ui');

        // Buttons
        const startBtn = document.getElementById('btn-play');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.state = 'PLAYING';
                this.menuOverlay.classList.add('hidden');
                this.ui.classList.remove('hidden');
                this.audio.ctx.resume(); // Ensure audio starts
                this.resetGame();
            });
        }

        document.getElementById('btn-restart').addEventListener('click', () => this.resetGame());
        document.getElementById('btn-restart-win').addEventListener('click', () => this.resetGame());
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => this.player.handleInput(e.key, true));
        window.addEventListener('keyup', (e) => this.player.handleInput(e.key, false));

        // Mobile Touch Controls
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            const key = btn.dataset.key;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent scrolling/zooming
                this.player.handleInput(key, true);
            }, { passive: false });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.player.handleInput(key, false);
            }, { passive: false });

            // Handle mouse events for testing on desktop without touch
            btn.addEventListener('mousedown', (e) => {
                this.player.handleInput(key, true);
            });
            btn.addEventListener('mouseup', (e) => {
                this.player.handleInput(key, false);
            });
            btn.addEventListener('mouseleave', (e) => {
                this.player.handleInput(key, false);
            });
        });
    }

    resetGame() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.enemies = [];
        this.particles = [];
        this.cookiesDestroyed = 0;
        this.lives = 3;
        this.levelManager.reset();

        this.state = 'PLAYING';
        this.gameOverEl.classList.add('hidden');
        this.victoryEl.classList.add('hidden');
        this.updateUI();
    }

    update(deltaTime) {
        this.renderer.update(deltaTime, this.levelManager.levels[this.levelManager.levelIndex].theme);

        // Particles
        this.particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= deltaTime;
            if (p.life <= 0) this.particles.splice(index, 1);
        });

        if (this.state !== 'PLAYING') return;

        const now = performance.now();

        // Player
        this.player.update(deltaTime, this.canvas.width, this.canvas.height);
        if (this.player.canShoot(now)) {
            this.projectiles.push({ x: this.player.x, y: this.player.y - 30, vy: -10 });
            this.audio.playShoot();
        }

        // Player Projectiles
        this.projectiles.forEach((p, index) => {
            p.y += p.vy;
            if (p.y < -10) this.projectiles.splice(index, 1);
        });

        // Enemy Projectiles
        this.enemyProjectiles.forEach((p, index) => {
            p.y += p.vy;
            if (p.y > this.canvas.height) this.enemyProjectiles.splice(index, 1);

            // Hit Player
            const dx = this.player.x - p.x;
            const dy = this.player.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                this.takeDamage();
                this.enemyProjectiles.splice(index, 1);
                this.createExplosion(p.x, p.y, '#00ff00');
            }
        });

        // Enemies
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer > this.levelManager.getSpawnRate()) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        this.enemies.forEach((e, eIndex) => {
            e.y += e.speed;

            // Virus Logic: Shoot
            if (e.type === 'virus') {
                e.shootTimer += deltaTime;
                if (e.shootTimer > 2000) { // Shoot every 2s
                    this.enemyProjectiles.push({ x: e.x, y: e.y + 20, vy: 5 });
                    e.shootTimer = 0;
                }
            }

            // Collision: Projectile -> Enemy
            this.projectiles.forEach((p, pIndex) => {
                const dx = p.x - e.x;
                const dy = p.y - e.y;
                if (Math.sqrt(dx * dx + dy * dy) < e.size / 2 + 5) {
                    this.destroyEnemy(e, eIndex, pIndex);
                }
            });

            // Collision: Player -> Enemy
            const dx = this.player.x - e.x;
            const dy = this.player.y - e.y;
            if (Math.sqrt(dx * dx + dy * dy) < 40) {
                this.takeDamage();
                this.enemies.splice(eIndex, 1);
                this.createExplosion(e.x, e.y, '#ff0000');
            }

            if (e.y > this.canvas.height + 50) this.enemies.splice(eIndex, 1);
        });

        this.updateUI();
    }

    destroyEnemy(enemy, enemyIndex, projectileIndex) {
        this.enemies.splice(enemyIndex, 1);
        if (projectileIndex !== undefined) this.projectiles.splice(projectileIndex, 1);

        this.cookiesDestroyed++;
        const color = enemy.type === 'virus' ? '#00ff00' : '#d2691e';
        this.createExplosion(enemy.x, enemy.y, color);
        this.audio.playExplosion();
        this.checkLevelProgress();
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 500,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    takeDamage() {
        this.lives--;
        this.audio.playDamage();
        this.renderer.shake(200);

        if (this.lives <= 0) {
            this.state = 'GAMEOVER';
            this.gameOverEl.classList.remove('hidden');
        }
    }

    spawnEnemy() {
        const level = this.levelManager.levels[this.levelManager.levelIndex];
        const isVirus = Math.random() < level.virusChance;

        this.enemies.push({
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: -50,
            speed: 2 + Math.random() * 2 + this.levelManager.levelIndex,
            size: 40 + Math.random() * 20,
            type: isVirus ? 'virus' : 'cookie',
            shootTimer: Math.random() * 1000 // Offset shooting
        });
    }

    checkLevelProgress() {
        if (this.cookiesDestroyed >= 15) {
            this.levelManager.nextLevel();
            this.cookiesDestroyed = 0;
            this.audio.playLevelUp();

            if (this.levelManager.levelIndex >= 5) {
                this.state = 'VICTORY';
                this.victoryEl.classList.remove('hidden');
            }
        }
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawParticles(this.particles);

        if (this.state === 'PLAYING') {
            this.renderer.drawPlayer(this.player);
            this.renderer.drawProjectiles(this.projectiles);
            this.renderer.drawEnemyProjectiles(this.enemyProjectiles);
            this.renderer.drawEnemies(this.enemies);
        }
    }

    updateUI() {
        if (this.scoreEl) this.scoreEl.innerText = `COOKIES: ${this.cookiesDestroyed} / 15`;
        if (this.levelEl) this.levelEl.innerText = `LEVEL: ${this.levelManager.levelIndex + 1}`;
        if (this.healthEl) this.healthEl.innerText = '❤️'.repeat(this.lives);
    }
}
