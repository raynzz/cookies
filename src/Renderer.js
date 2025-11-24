export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Starfield
        this.stars = [];
        this.initStars();
    }

    initStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 3 + 0.5
            });
        }
    }

    update(deltaTime, theme) {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.theme = theme || { bg: '#000022', star: '#ffffff' };

        // Screen Shake decay
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
        }

        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed * (deltaTime / 16); // Move down
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }

    shake(duration) {
        this.shakeTimer = duration;
    }

    clear() {
        this.ctx.save();

        // Apply shake
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * 10;
            const dy = (Math.random() - 0.5) * 10;
            this.ctx.translate(dx, dy);
        }

        this.ctx.fillStyle = this.theme ? this.theme.bg : '#000022'; // Dark blue to see if renderer is working
        this.ctx.fillRect(-10, -10, this.width + 20, this.height + 20); // Oversize clear for shake
    }

    drawBackground() {
        this.ctx.fillStyle = this.theme ? this.theme.star : '#ffffff';
        this.stars.forEach(star => {
            this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }

    drawParticles(particles) {
        particles.forEach(p => {
            this.ctx.globalAlpha = p.life / 500;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1.0;

        // Restore context after shake
        if (this.shakeTimer > 0) {
            this.ctx.restore();
        } else {
            this.ctx.restore(); // Always restore the save() from clear()
        }
    }

    drawPlayer(player) {
        this.drawEmoji(player.x, player.y, '🚀', 60);
    }

    drawProjectiles(projectiles) {
        projectiles.forEach(p => {
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ffaa00';
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }

    drawEnemyProjectiles(projectiles) {
        projectiles.forEach(p => {
            this.ctx.fillStyle = '#00ff00'; // Toxic Green
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#00ff00';
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }

    drawEnemies(enemies) {
        enemies.forEach(enemy => {
            const emoji = enemy.type === 'virus' ? '🦠' : '🍪';
            this.drawEmoji(enemy.x, enemy.y, emoji, enemy.size);
        });
    }

    drawEmoji(x, y, emoji, size) {
        this.ctx.font = `${size}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, x, y);
    }
}
