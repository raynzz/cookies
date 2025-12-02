export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.sensitivityMultiplier = 1.2; // Configurable sensitivity
        this.speed = 400 * this.sensitivityMultiplier;
        this.friction = 0.85; // Reduced friction for snappier control
        this.width = 40; // Hitbox size
        this.height = 40;

        this.keys = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            w: false, s: false, a: false, d: false,
            ' ': false
        };

        this.lastShot = 0;
        this.shootDelay = 250; // ms
    }

    handleInput(key, isPressed) {
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = isPressed;
        }
    }

    update(deltaTime, boundsX, boundsY) {
        const dt = deltaTime / 1000;

        if (this.keys.ArrowUp || this.keys.w) this.vy -= this.speed * dt;
        if (this.keys.ArrowDown || this.keys.s) this.vy += this.speed * dt;
        if (this.keys.ArrowLeft || this.keys.a) this.vx -= this.speed * dt;
        if (this.keys.ArrowRight || this.keys.d) this.vx += this.speed * dt;

        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;

        // Bounds
        if (this.x < 30) this.x = 30;
        if (this.x > boundsX - 30) this.x = boundsX - 30;
        if (this.y < 30) this.y = 30;
        if (this.y > boundsY - 30) this.y = boundsY - 30;
    }

    canShoot(time) {
        if (this.keys[' '] && time - this.lastShot > this.shootDelay) {
            this.lastShot = time;
            return true;
        }
        return false;
    }
}
