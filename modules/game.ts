import { Position } from "./types.js";
import { KeyBuf, add, equal, randomNumber } from "./utility.js";

import Sprite from "./sprite.js";
import App from "./app.js";
import Snake from "./snake.js";
import Fruit from "./fruit.js";

enum GameState {
    Started,
    Running,
    Pause,
    Over,
}

export default class Game {
    background: Array<Array<Sprite>> | undefined = undefined;
    snake: Snake = new Snake({ x: 0, y: 0 });
    velocity: Position = { x: 0, y: 0 };

    fruit: Fruit = new Fruit({ x: 0, y: 0 });
    badFruit: Fruit | undefined = undefined;
    stepsIdx: number = 0;
    stepsToCreateBadFruit: number;

    score: number = 0;
    state: GameState = GameState.Started;

    private ctx: CanvasRenderingContext2D;
    private cols: number;
    private rows: number;
    width: number;
    height: number;

    private time: number = 0;
    static readonly STEP_TIME_MS = 250;
    keyBuffer: KeyBuf = new KeyBuf();

    constructor(ctx: CanvasRenderingContext2D, cols: number, rows: number, width: number, height: number) {
        this.ctx = ctx;
        this.cols = cols;
        this.rows = rows;
        this.width = width;
        this.height = height;
        this.stepsToCreateBadFruit = randomNumber(20, 50);

        window.onkeydown = (ev: KeyboardEvent) => {
            this.keyBuffer.pushKey(ev.code);
        };
    }

    initGame() {
        this.stepsIdx = 0;
        this.score = 0;
        this.velocity = { x: 1, y: 0 };

        this.snake = new Snake({ x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) });
        if (this.badFruit) {
            this.fruit.newPosition(this.cols, this.rows, [...this.snake.getPositions(), this.badFruit.tile.position]);
        } else {
            this.fruit.newPosition(this.cols, this.rows, this.snake.getPositions());
        }

        this.stepsToCreateBadFruit = randomNumber(5, 10);
    }

    randomPoint() {
        return { x: randomNumber(0, this.width), y: randomNumber(0, this.height) };
    }

    private dispatchState() {
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
    }

    private dispatchVelocity(key: string) {
        let delta = this.velocity;

        switch (key) {
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

        if (this.checkVelocity(delta)) {
            this.velocity = delta;
        }
    }

    private checkWallsCollision(head: Position) {
        return !(head.x < this.cols && head.x >= 0 && head.y < this.rows && head.y >= 0);
    }

    private checkSelfCollision() {
        let headPos = this.snake.getHeadPosition();
        for (let i = 1; i < this.snake.tiles.length; ++i) {
            if (equal(headPos, this.snake.tiles[i].position)) {
                return { eat: true, idx: i };
            }
        }
        return { eat: false, idx: -1 };
    }

    private checkVelocity(velocity: Position) {
        return velocity.x != this.velocity.x && velocity.y != this.velocity.y;
    }

    private checkFruit(fruit: Fruit) {
        return equal(this.snake.getHeadPosition(), fruit.tile.position);
    }

    private toggleBadFruit() {
        if (!this.badFruit && this.snake.tiles.length > 3) {
            this.badFruit = new Fruit({ x: 0, y: 0 }, App.sprites["bad_fruit"]);
            this.badFruit.newPosition(this.cols, this.rows, [...this.snake.getPositions(), this.fruit.tile.position]);
            this.stepsToCreateBadFruit = randomNumber(20, 50);
        } else {
            this.badFruit = undefined;
        }
    }

    update(dt: number) {
        this.time += dt;
        if (!this.keyBuffer.empty()) {
            if (this.keyBuffer.lastKeys.includes("Space")) {
                this.dispatchState();
                this.keyBuffer.clean();
            }
        }

        if (this.time >= Game.STEP_TIME_MS) {
            if (this.stepsIdx >= this.stepsToCreateBadFruit) {
                this.toggleBadFruit();
                this.stepsIdx = 0;
            }

            if (this.state == GameState.Running) {
                if (!this.keyBuffer.empty()) {
                    this.dispatchVelocity(this.keyBuffer.getKey() as string);
                }

                if (!this.checkWallsCollision(add(this.snake.getHeadPosition(), this.velocity))) {
                    if (this.snake.eatingFruit) {
                        this.score += 1;
                        this.snake.pushTile();
                    } else if (this.snake.eatingBad) {
                        this.score -= 1;
                        this.snake.popTile();
                    }

                    this.snake.moveByDirection(this.velocity);

                    if (this.checkFruit(this.fruit)) {
                        this.fruit.newPosition(
                            this.cols,
                            this.rows,
                            this.snake.tiles.map((tile) => tile.position)
                        );
                        this.snake.eatFruit();
                    } else if (this.badFruit && this.checkFruit(this.badFruit)) {
                        this.badFruit = undefined;
                        this.stepsToCreateBadFruit = randomNumber(20, 50);
                        this.snake.eatBadFruit();
                    }

                    let selfCollision = this.checkSelfCollision();
                    if (selfCollision.eat) {
                        this.snake.removeTiles(selfCollision.idx, this.snake.tiles.length);
                        this.score = this.snake.tiles.length - 3;
                    }

                    this.snake.updateSprites();
                } else {
                    this.state = GameState.Over;
                }

                this.stepsIdx += 1;
            }

            this.time = 0;
        }

        if (this.state == GameState.Running) {
            this.fruit.update(dt);
            if (this.badFruit) {
                this.badFruit.update(dt);
            }
            this.snake.update(dt);
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

        this.fruit.render(this.ctx);
        if (this.badFruit) {
            this.badFruit.render(this.ctx);
        }
        this.snake.render(this.ctx);

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
                console.log("unreachable");
                break;
        }
    }

    private fill_cells() {
        if (!this.background) {
            this.background = [];
            let grassSprite = App.sprites["grass"];

            this.background = Array(this.cols);
            for (let x = 0; x < this.cols; x += 1) {
                this.background[x] = new Array(this.rows);
                for (let y = 0; y < this.rows; y += 1) {
                    let idx = randomNumber(0, 12);
                    this.background[x][y] = new Sprite(
                        { x: x * Sprite.width, y: y * Sprite.height },
                        { x: 0, y: -1 },
                        grassSprite
                    );
                    this.background[x][y].setFrame(idx);
                }
            }
        }

        this.ctx.save();
        for (let row of this.background) {
            this.ctx.save();
            for (let sprite of row) {
                sprite.renderFrame(this.ctx);
                this.ctx.translate(Sprite.width, 0);
            }
            this.ctx.restore();
            this.ctx.translate(0, Sprite.height);
        }
        this.ctx.restore();
    }
}
