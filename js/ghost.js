class Ghost {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.direction = 'LEFT';
        this.speed = 5;
    }

    move() {
        switch (this.direction) {
            case 'UP':
                this.y = Math.max(this.y - this.speed, 0);
                break;
            case 'DOWN':
                this.y = Math.min(this.y + this.speed, canvas.height);
                break;
            case 'LEFT':
                this.x = Math.max(this.x - this.speed, 0);
                break;
            case 'RIGHT':
                this.x = Math.min(this.x + this.speed, canvas.width);
                break;
        }
    }

    setDirection(direction) {
        this.direction = direction;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    collidesWithWalls(walls) {
        for (let wall of walls) {
            if (
                this.x + this.size > wall.x &&
                this.x - this.size < wall.x + wall.width &&
                this.y + this.size > wall.y &&
                this.y - this.size < wall.y + wall.height
            ) {
                switch (this.direction) {
                    case 'UP':
                        this.y = wall.y + wall.height + this.size;
                        break;
                    case 'DOWN':
                        this.y = wall.y - this.size;
                        break;
                    case 'LEFT':
                        this.x = wall.x + wall.width + this.size;
                        break;
                    case 'RIGHT':
                        this.x = wall.x - this.size;
                        break;
                }
            }
        }
    }
}
