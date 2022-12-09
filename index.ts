type Position = { x: number; y: number };
type SpriteOptions = {
    width: number;
    height: number;
    image: HTMLImageElement;
    numberOfFrames: number;
    msPerFrame: number;
};

function randomNumber(from: number, to: number) {
    return Math.floor(Math.random() * (to - from) + from);
}

function equal(p1: Position, p2: Position) {
    return p1.x == p2.x && p1.y == p2.y;
}

function add(p1: Position, p2: Position) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

class KeyBuf {
    lastKeys: Array<string> = [];
    constructor() {}

    pushKey(key: string) {
        if (this.lastKeys[this.lastKeys.length - 1] != key) {
            this.lastKeys.push(key);
        }
    }

    empty() {
        return this.lastKeys.length == 0;
    }

    getKey() {
        if (this.lastKeys.length > 0) {
            return this.lastKeys.shift();
        }
        return undefined;
    }
}

class App {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    static fonts: { [key: string]: FontFace } = {};
    static sprites: { [key: string]: SpriteOptions } = {};

    game: Game;
    lastTime: number | undefined = undefined;

    constructor(canvas: HTMLCanvasElement) {
        this.loadResources();

        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;

        let gameWidth = 800;
        let gameHeight = 800;
        let gameCols = 10;
        let gameRows = 10;

        Tile.width = Math.floor(gameWidth / gameCols);
        Tile.height = Math.floor(gameHeight / gameRows);
        this.game = new Game(this.ctx, gameCols, gameRows, gameWidth, gameHeight);

        window.onkeydown = (ev: KeyboardEvent) => {
            this.game.keyBuffer.pushKey(ev.code);
        };

        this.game.initGame();
    }

    loadResources() {
        let font = new FontFace("Arcade", "url(font/ARCADE.TTF)");
        font.load().then(() => {
            App.fonts["Arcade"] = font;
            document.fonts.add(font);
        });

        let error = new Image();
        error.src = "./sprites/error.png";
        App.sprites["error"] = {
            width: 32 * 8,
            height: 32,
            image: error.cloneNode() as HTMLImageElement,
            numberOfFrames: 8,
            msPerFrame: Game.STEP_TIME_MS / 8,
        };

        let fruit = new Image();
        fruit.src = "./sprites/fruit.png";
        App.sprites["fruit"] = {
            width: 32 * 8,
            height: 32,
            image: fruit.cloneNode() as HTMLImageElement,
            numberOfFrames: 8,
            msPerFrame: Game.STEP_TIME_MS / 8,
        };

        let snake_head = new Image();
        snake_head.src = "./sprites/snake_head.png";
        App.sprites["snake_head"] = {
            width: 32 * 15,
            height: 32,
            image: snake_head.cloneNode() as HTMLImageElement,
            numberOfFrames: 15,
            msPerFrame: Game.STEP_TIME_MS / 15,
        };

        let snake_head_eat = new Image();
        snake_head_eat.src = "./sprites/snake_head_eat.png";
        App.sprites["snake_head_eat"] = {
            width: 32 * 15,
            height: 32,
            image: snake_head_eat.cloneNode() as HTMLImageElement,
            numberOfFrames: 15,
            msPerFrame: Game.STEP_TIME_MS / 15,
        };

        let snake_body = new Image();
        snake_body.src = "./sprites/snake_body.png";
        App.sprites["snake_body"] = {
            width: 32,
            height: 32,
            image: snake_body.cloneNode() as HTMLImageElement,
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };

        let snake_body_down_right = new Image();
        snake_body_down_right.src = "./sprites/snake_body_down_right.png";
        App.sprites["snake_body_down_right"] = {
            width: 32,
            height: 32,
            image: snake_body_down_right.cloneNode() as HTMLImageElement,
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };

        let snake_body_down_left = new Image();
        snake_body_down_left.src = "./sprites/snake_body_down_left.png";
        App.sprites["snake_body_down_left"] = {
            width: 32,
            height: 32,
            image: snake_body_down_left.cloneNode() as HTMLImageElement,
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };

        let snake_tail = new Image();
        snake_tail.src = "./sprites/snake_tail.png";
        App.sprites["snake_tail"] = {
            width: 32 * 11,
            height: 32,
            image: snake_tail.cloneNode() as HTMLImageElement,
            numberOfFrames: 11,
            msPerFrame: Game.STEP_TIME_MS / 11,
        };

        let snake_tail_down_right = new Image();
        snake_tail_down_right.src = "./sprites/snake_tail_down_right.png";
        App.sprites["snake_tail_down_right"] = {
            width: 32 * 10,
            height: 32,
            image: snake_tail_down_right.cloneNode() as HTMLImageElement,
            numberOfFrames: 10,
            msPerFrame: Game.STEP_TIME_MS / 10,
        };

        let snake_tail_down_left = new Image();
        snake_tail_down_left.src = "./sprites/snake_tail_down_left.png";
        App.sprites["snake_tail_down_left"] = {
            width: 32 * 10,
            height: 32,
            image: snake_tail_down_left.cloneNode() as HTMLImageElement,
            numberOfFrames: 10,
            msPerFrame: Game.STEP_TIME_MS / 10,
        };
    }

    update() {
        let timeNow = Date.now();
        if (this.lastTime) {
            let dt = timeNow - this.lastTime;
            this.game.update(dt);
        }
        this.lastTime = timeNow;
    }

    render() {
        this.ctx.save();
        this.ctx.translate((this.canvas.width - 800) / 2, (this.canvas.height - 800) / 2);
        this.game.render();
        this.ctx.restore();
    }
}

enum GameState {
    Started,
    Running,
    Pause,
    Over,
}

class Game {
    snake: Snake = new Snake({ x: 0, y: 0 });
    velocity: Position = { x: 0, y: 0 };
    fruit: Fruit = new Fruit({ x: 0, y: 0 });
    score: number = 0;
    state: GameState = GameState.Started;

    private ctx: CanvasRenderingContext2D;
    private cols: number;
    private rows: number;
    private width: number;
    private height: number;

    private time: number = 0;
    static readonly STEP_TIME_MS = 250;
    keyBuffer: KeyBuf = new KeyBuf();

    constructor(ctx: CanvasRenderingContext2D, cols: number, rows: number, width: number, height: number) {
        this.ctx = ctx;
        this.cols = cols;
        this.rows = rows;
        this.width = width;
        this.height = height;
    }

    initGame() {
        this.score = 0;
        this.velocity = { x: 1, y: 0 };
        this.snake = new Snake({ x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) });
        this.fruit.newPosition(this.cols, this.rows);
    }

    // TODO: call every game.update()
    private dispatchKey(key: string) {
        let delta = { x: 0, y: 0 };
        switch (key) {
            case "Space":
                if (this.state == GameState.Running) {
                    this.state = GameState.Pause;
                } else if (this.state == GameState.Pause) {
                    this.state = GameState.Running;
                } else if (this.state == GameState.Started) {
                    this.state = GameState.Running;
                } else if (this.state == GameState.Over) {
                    this.state = GameState.Running;
                    this.initGame();
                }
                break;
            case "KeyW":
            case "ArrowUp":
                delta = { x: 0, y: -1 };
                break;
            case "KeyS":
            case "ArrowDown":
                delta = { x: 0, y: 1 };
                break;
            case "KeyA":
            case "ArrowLeft":
                delta = { x: -1, y: 0 };
                break;
            case "KeyD":
            case "ArrowRight":
                delta = { x: 1, y: 0 };
                break;
        }
        return delta;
    }

    checkWallsCollision(head: Position) {
        return !(head.x < this.cols && head.x >= 0 && head.y < this.rows && head.y >= 0);
    }

    checkSelfCollision() {
        let headPos = this.snake.getHeadPosition();
        for (let i = 1; i < this.snake.tiles.length; ++i) {
            if (equal(headPos, this.snake.tiles[i].position)) {
                return { eat: true, idx: i };
            }
        }
        return { eat: false, idx: null };
    }

    checkFruit() {
        return equal(this.snake.getHeadPosition(), this.fruit.tile.position);
    }

    update(dt: number) {
        this.time += dt;

        if (this.time >= Game.STEP_TIME_MS) {
            // TODO: here is bug: in pause move sideway and then backwards
            // snake will turn in opposite dir
            if (!this.keyBuffer.empty()) {
                let newDelta = this.dispatchKey(this.keyBuffer.getKey() as string);
                if (newDelta.x != this.velocity.x && newDelta.y != this.velocity.y) {
                    this.velocity = newDelta;
                }
            }

            if (this.state == GameState.Running) {
                if (!this.checkWallsCollision(add(this.snake.getHeadPosition(), this.velocity))) {
                    if (this.snake.eatingFruit) {
                        this.score += 1;
                        this.snake.pushTile();
                    }

                    this.snake.moveByDirection(this.velocity);

                    if (this.checkFruit()) {
                        this.fruit.newPosition(
                            this.cols,
                            this.rows,
                            this.snake.tiles.map((tile) => tile.position)
                        );
                        this.snake.eatFruit();
                    }

                    let selfCollision = this.checkSelfCollision();
                    if (selfCollision.eat) {
                        this.snake.tiles.splice(
                            selfCollision.idx as number,
                            this.snake.tiles.length - (selfCollision.idx as number) + 1
                        );
                        this.snake.tiles[this.snake.tiles.length - 1].setOptions(App.sprites["snake_tail"]);
                        this.score -= this.snake.tiles.length - (selfCollision.idx as number) + 1;
                    }
                } else {
                    this.state = GameState.Over;
                }
            }

            this.time = 0;
        }

        if (this.state == GameState.Running) {
            this.snake.update(dt);
            this.fruit.update(dt);
        }
    }

    showText(header: string, text?: string) {
        this.ctx.fillStyle = "#202020A0";
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = "#FFFFFFFF";
        this.ctx.textBaseline = "middle";

        this.ctx.font = "64px Arcade";
        let headerMeasure = this.ctx.measureText(header);
        this.ctx.fillText(header, (this.width - headerMeasure.width) / 2, this.height / 2 - 24);

        if (text) {
            this.ctx.font = "48px Arcade";
            let textMeasure = this.ctx.measureText(text);
            this.ctx.fillText(text, (this.width - textMeasure.width) / 2, this.height / 2 + 24);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.fill_cells();
        this.snake.render(this.ctx);
        this.fruit.render(this.ctx);

        switch (this.state) {
            case GameState.Started:
                this.showText("SNAKE", "To start press SPACE");
                break;
            case GameState.Pause:
                this.showText("PAUSE", "To continue press SPACE");
                break;
            case GameState.Running:
                break;
            case GameState.Over:
                this.showText("GAME OVER", "To start again press SPACE");
                break;
            default:
                break;
        }
    }

    private fill_cells() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        for (let x = 0; x <= this.width; x += Tile.width) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        for (let y = 0; y <= this.height; y += Tile.height) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.strokeStyle = "#00000050";
        this.ctx.stroke();
    }
}

class Sprite {
    position: Position;
    orientation: Position;
    options: SpriteOptions;

    private frameIndex: number = 0;
    private time: number = 0;

    constructor(position: Position, orientation: Position, options: SpriteOptions) {
        this.position = position;
        this.orientation = orientation;
        this.options = options;
    }

    setOptions(newOptions: SpriteOptions) {
        this.options = { ...newOptions };
    }

    resetAnimation() {
        this.frameIndex = 0;
        this.time = 0;
    }

    update(dt: number): boolean {
        this.time += dt;
        if (this.options) {
            if (this.time >= this.options.msPerFrame) {
                this.time = 0;
                if (this.frameIndex < this.options.numberOfFrames - 1) {
                    this.frameIndex += 1;
                } else {
                    this.frameIndex = 0;
                }
                return true;
            }
        }
        return false;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.options && "image" in this.options) {
            ctx.save();
            ctx.translate(this.position.x * Tile.width, this.position.y * Tile.height);

            if (equal(this.orientation, { x: 1, y: 0 })) {
                // right
                ctx.translate(Tile.width, 0);
                ctx.rotate(Math.PI / 2);
            } else if (equal(this.orientation, { x: -1, y: 0 })) {
                // left
                ctx.translate(0, Tile.height);
                ctx.rotate((3 * Math.PI) / 2);
            } else if (equal(this.orientation, { x: 0, y: 1 })) {
                // down
                ctx.translate(Tile.width, Tile.height);
                ctx.rotate(Math.PI);
            }

            ctx.drawImage(
                this.options.image,
                (this.frameIndex * this.options.width) / this.options.numberOfFrames,
                0,
                this.options.width / this.options.numberOfFrames,
                this.options.height,
                0,
                0,
                Tile.width,
                Tile.height
            );
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(this.position.x * Tile.width, this.position.y * Tile.height);
            let sprite = App.sprites["error"];
            ctx.drawImage(
                sprite.image,
                (this.frameIndex * sprite.width) / sprite.numberOfFrames,
                0,
                sprite.width / sprite.numberOfFrames,
                sprite.height,
                0,
                0,
                Tile.width,
                Tile.height
            );
            ctx.restore();
        }
    }
}

class Tile {
    static width: number = 32;
    static height: number = 32;
    position: Position;

    constructor(position: Position) {
        this.position = position;
    }

    render(ctx: CanvasRenderingContext2D, color: string = "#000000FF") {
        ctx.fillStyle = color;
        ctx.fillRect(this.position.x * Tile.width, this.position.y * Tile.height, Tile.width, Tile.height);
    }
}

class Fruit {
    tile: Sprite;

    constructor(position: Position) {
        this.tile = new Sprite(position, { x: 0, y: -1 }, App.sprites["fruit"]);
    }

    newPosition(maxX: number, maxY: number, exclude?: Array<Position>) {
        let randomPoint = { x: randomNumber(0, maxX), y: randomNumber(0, maxY) };
        if (exclude) {
            while (!exclude.every((pos) => !equal(pos, randomPoint))) {
                randomPoint = { x: randomNumber(0, maxX), y: randomNumber(0, maxY) };
            }
        }
        this.tile.position = randomPoint;
    }

    update(dt: number) {
        this.tile.update(dt);
    }

    render(ctx: CanvasRenderingContext2D) {
        this.tile.render(ctx);
    }
}

class Snake {
    tiles: Array<Sprite> = [];
    eatingFruit: boolean = false;

    constructor(pos: Position) {
        this.tiles.push(new Sprite(pos, { x: 1, y: 0 }, App.sprites["snake_head"]));
        this.tiles.push(new Sprite({ x: pos.x - 1, y: pos.y }, { x: 1, y: 0 }, App.sprites["snake_body"]));
        this.tiles.push(new Sprite({ x: pos.x - 2, y: pos.y }, { x: 1, y: 0 }, App.sprites["snake_tail"]));
    }

    pushTile() {
        let lastTile = this.tiles[this.tiles.length - 1];
        lastTile.options = App.sprites["snake_body"];
        this.tiles.push(new Sprite(lastTile.position, lastTile.orientation, App.sprites["snake_tail"]));
    }

    getHeadPosition() {
        return this.tiles[0].position;
    }

    getHeadOrientation() {
        return this.tiles[0].orientation;
    }

    moveByDirection(dir: Position) {
        for (let i = this.tiles.length - 1; i > 0; --i) {
            this.tiles[i].position = { ...this.tiles[i - 1].position };
            this.tiles[i].orientation = { ...this.tiles[i - 1].orientation };
            this.tiles[i].resetAnimation();
        }
        this.tiles[0].position = add(this.tiles[0].position, dir);
        this.tiles[0].orientation = { ...dir };
        this.tiles[0].resetAnimation();
        this.eatingFruit = false;
    }

    updateSprites() {
        if (this.eatingFruit) {
            this.tiles[0].setOptions(App.sprites["snake_head_eat"]);
        } else {
            this.tiles[0].setOptions(App.sprites["snake_head"]);
        }

        for (let i = 0; i < this.tiles.length - 1; ++i) {
            let nextTile = this.tiles[i];
            let prevTile = this.tiles[i + 1];
            if (equal(nextTile.orientation, prevTile.orientation)) {
                if (i + 1 == this.tiles.length - 1) {
                    prevTile.setOptions(App.sprites["snake_tail"]);
                } else {
                    prevTile.setOptions(App.sprites["snake_body"]);
                }
            } else if (
                (equal(nextTile.orientation, { x: 1, y: 0 }) && equal(prevTile.orientation, { x: 0, y: -1 })) ||
                (equal(nextTile.orientation, { x: 0, y: 1 }) && equal(prevTile.orientation, { x: 1, y: 0 })) ||
                (equal(nextTile.orientation, { x: -1, y: 0 }) && equal(prevTile.orientation, { x: 0, y: 1 })) ||
                (equal(nextTile.orientation, { x: 0, y: -1 }) && equal(prevTile.orientation, { x: -1, y: 0 }))
            ) {
                if (i + 1 == this.tiles.length - 1) {
                    prevTile.setOptions(App.sprites["snake_tail_down_right"]);
                } else {
                    prevTile.setOptions(App.sprites["snake_body_down_right"]);
                }
            } else if (
                (equal(prevTile.orientation, { x: 1, y: 0 }) && equal(nextTile.orientation, { x: 0, y: -1 })) ||
                (equal(prevTile.orientation, { x: 0, y: 1 }) && equal(nextTile.orientation, { x: 1, y: 0 })) ||
                (equal(prevTile.orientation, { x: -1, y: 0 }) && equal(nextTile.orientation, { x: 0, y: 1 })) ||
                (equal(prevTile.orientation, { x: 0, y: -1 }) && equal(nextTile.orientation, { x: -1, y: 0 }))
            ) {
                if (i + 1 == this.tiles.length - 1) {
                    prevTile.setOptions(App.sprites["snake_tail_down_left"]);
                } else {
                    prevTile.setOptions(App.sprites["snake_body_down_left"]);
                }
            }
        }
    }

    eatFruit() {
        this.eatingFruit = true;
    }

    update(dt: number) {
        if (this.tiles.map((tile) => tile.update(dt)).some((v) => v)) {
            this.updateSprites();
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.tiles.length; ++i) {
            this.tiles[i].render(ctx);
        }
    }
}

window.onload = () => {
    let canvas = document.getElementById("app") as HTMLCanvasElement;
    const app = new App(canvas);
    function gameLoop() {
        app.update();
        app.render();
        window.requestAnimationFrame(gameLoop);
    }
    window.requestAnimationFrame(gameLoop);
};
