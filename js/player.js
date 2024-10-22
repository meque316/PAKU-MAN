class Player {
    constructor(x, y, canvas, ctx) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.direction = 'RIGHT';
        this.speed = 2;
        this.canvas = canvas;
        this.ctx = ctx;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 1.8 * Math.PI);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.arc(this.x + this.radius / 7, this.y - this.radius / 2, this.radius / 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.closePath();
    }

    move() {
        switch (this.direction) {
            case 'UP':
                this.y = Math.max(this.y - this.speed, 0);
                break;
            case 'DOWN':
                this.y = Math.min(this.y + this.speed, this.canvas.height);
                break;
            case 'LEFT':
                this.x = Math.max(this.x - this.speed, 0);
                break;
            case 'RIGHT':
                this.x = Math.min(this.x + this.speed, this.canvas.width);
                break;
        }
    }

    collidesWith(object) {
        if (object instanceof Food) {
            const dx = this.x - object.x;
            const dy = this.y - object.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (this.radius + object.size);
        } else if (object instanceof Wall) {
            return (
                this.x + this.radius > object.x &&
                this.x - this.radius < object.x + object.width &&
                this.y + this.radius > object.y &&
                this.y - this.radius < object.y + object.height
            );
        } else {
            return this.x === object.x && this.y === object.y;
        }
    }

    collidesWithWalls(walls) {
        for (let wall of walls) {
            if (this.collidesWith(wall)) {
                switch (this.direction) {
                    case 'UP':
                        this.y = wall.y + wall.height + this.radius;
                        break;
                    case 'DOWN':
                        this.y = wall.y - this.radius;
                        break;
                    case 'LEFT':
                        this.x = wall.x + wall.width + this.radius;
                        break;
                    case 'RIGHT':
                        this.x = wall.x - this.radius;
                        break;
                }
            }
        }
    }
}