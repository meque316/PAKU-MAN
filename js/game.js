// Obtener el canvas y el contexto de dibujo
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = new Player(canvas.width / 2, canvas.height / 2, this.canvas, this.ctx);
        this.ghosts = [
            new Ghost(0, 0, this.canvas, this.ctx),
            new Ghost(canvas.width - 20, 0, this.canvas, this.ctx),
            new Ghost(0, canvas.height - 20, this.canvas, this.ctx),
            new Ghost(canvas.width - 20, canvas.height - 20, this.canvas, this.ctx)
        ];
        this.walls = this.generateWalls();
        this.food = this.generateFood();
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = this.gameLoop.bind(this);
        this.startGhostMovement();
    }

    generateFood() {
        const food = [];
        const gap = 50;
        for (let x = gap; x < this.canvas.width; x += gap) {
            for (let y = gap; y < this.canvas.height; y += gap) {
                const newFood = new Food(x, y);
                if (!this.isPositionOccupied(newFood)) {
                    food.push(newFood);
                }
            }
        }
        return food;
    }

    isPositionOccupied(object) {
        return this.walls.some(wall => this.checkCollisionWithWall(object, wall));
    }

    checkCollisionWithWall(object, wall) {
        return (
            object.x + object.size > wall.x &&
            object.x - object.size < wall.x + wall.width &&
            object.y + object.size > wall.y &&
            object.y - object.size < wall.y + wall.height
        );
    }

    generateWalls() {
        const walls = [];
        walls.push(new Wall(100, 100, 200, 20));
        walls.push(new Wall(300, 200, 20, 200));
        walls.push(new Wall(150, 300, 100, 20));
        walls.push(new Wall(400, 100, 20, 150));
        return walls;
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    update() {
        this.clearCanvas();
        this.draw();
        this.checkCollisions();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.player.draw();
        for (let food of this.food) {
            food.draw(this.ctx);
        }
        for (let ghost of this.ghosts) {
            ghost.draw(this.ctx);
        }
        for (let wall of this.walls) {
            wall.draw(this.ctx);
        }
        this.ctx.font = '20px Impact';
        this.ctx.fillStyle = 'White';
        this.ctx.fillText(`Puntaje: ${this.score}`, 10, 20);
    }

    checkCollisions() {
        this.food = this.food.filter(food => {
            if (this.player.collidesWith(food)) {
                this.score++;
                if (this.score >= 61) {
                    this.endGame('¡ Wena Ganaste!');
                }
                return false;
            }
            return true;
        });

        for (let ghost of this.ghosts) {
            if (this.player.collidesWith(ghost)) {
                this.endGame('¡Perdiste!');
                return;
            }
        }

        this.player.collidesWithWalls(this.walls);
        this.ghosts.forEach(ghost => ghost.collidesWithWalls(this.walls));
    }

    endGame(message) {
        this.isRunning = false;
        alert(message);
    }

    gameLoop() {
        if (this.isRunning) {
            this.update();
            requestAnimationFrame(this.gameLoop);
        }
    }

    startGhostMovement() {
        this.ghosts.forEach(ghost => {
            ghost.setDirection('LEFT');
            setInterval(() => {
                ghost.setDirection(
                    ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)]
                );
            }, 500);
        });
    }
}

// Iniciar el juego
const game = new Game(canvas, ctx);

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        game.start();
    }
    if (game.isRunning) {
        switch (event.key) {
            case 'ArrowUp':
                game.player.direction = 'UP';
                break;
            case 'ArrowLeft':
                game.player.direction = 'LEFT';
                break;
            case 'ArrowRight':
                game.player.direction = 'RIGHT';
                break;
            case 'ArrowDown':
                game.player.direction = 'DOWN';
                break;
        }
    }
});

setInterval(() => {
    if (game.isRunning) {
        game.player.move();
        game.ghosts.forEach(ghost => ghost.move());
        game.update();
    }
}, 500 / 60);
