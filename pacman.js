const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Game {
    constructor() {
        this.player = new Player(canvas.width / 2, canvas.height / 2);
        this.ghosts = [
            new Ghost(0, 0),
            new Ghost(canvas.width - 20, 0),
            new Ghost(0, canvas.height - 20),
            new Ghost(canvas.width - 20, canvas.height - 20)
        ];
        this.walls = this.generateWalls(); // Genera las murallas para el juego
        this.food = this.generateFood();   // Genera la comida, asegurando que no se superponga con las murallas
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = this.gameLoop.bind(this);
        this.startGhostMovement();
    }

    // Genera la comida y se asegura de que no aparezca en el mismo lugar que las murallas
    generateFood() {
        const food = [];
        const gap = 50;
        for (let x = gap; x < canvas.width; x += gap) {
            for (let y = gap; y < canvas.height; y += gap) {
                const newFood = new Food(x, y);
                if (!this.isPositionOccupied(newFood)) {
                    food.push(newFood); 
                }
            }
        }
        return food;
    }

    // Verifica si una posición está ocupada por alguna muralla
    isPositionOccupied(object) {
        return this.walls.some(wall => this.checkCollisionWithWall(object, wall));
    }

    // Determina si un objeto choca con una muralla específica
    checkCollisionWithWall(object, wall) {
        return (
        object.x + object.size > wall.x &&
        object.x - object.size < wall.x + wall.width &&
        object.y + object.size > wall.y &&
        object.y - object.size < wall.y + wall.height
        );
    }

    // Las Murallas:
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    draw() {
        this.player.draw(ctx);
        for (let food of this.food) {
            food.draw(ctx);
        }
        for (let ghost of this.ghosts) {
            ghost.draw(ctx);
        }
        for (let wall of this.walls) {
            wall.draw(ctx);
        }
        ctx.font = '20px Impact';
        ctx.fillStyle = 'White';
        ctx.fillText(`Puntaje: ${this.score}`, 10, 20);
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

        // Colisiones con murallas
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

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.direction = 'RIGHT';
        this.speed = 2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(this.x, this.y);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        // El Ojo
        ctx.beginPath();
        ctx.arc(this.x + this.radius / 7, this.y - this.radius / 2, this.radius / 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
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

    // Verifica si el jugador choca con un objeto (comida, muralla, etc.)
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

    // Verifica colisiones con las murallas
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

    // Verifica colisiones con las murallas
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

class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const game = new Game();

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
