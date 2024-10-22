class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
    }
}

