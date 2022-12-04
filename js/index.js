"use strict";
class KeyBuf {
    constructor() {
        this.lastKeys = [];
    }
    pushKey(key) {
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
class Game {
    constructor(canvas) {
        this.time = 0;
        this.keyBuffer = new KeyBuf();
        this.pause = true;
        this.fontReady = false;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = 800;
        this.canvas.height = 800;
        this.CELL_WIDTH = canvas.width / Game.COLS;
        this.CELL_HEIGHT = canvas.height / Game.ROWS;
        this.delta_pos = { x: this.CELL_WIDTH, y: 0 };
        this.snake = new Snake({ x: 12 * this.CELL_WIDTH, y: 12 * this.CELL_HEIGHT }, this.CELL_WIDTH, this.CELL_HEIGHT);
    }
    setup() {
        let font = new FontFace("Arcade", "url(font/ARCADE.TTF)");
        font.load().then(() => {
            document.fonts.add(font);
            this.fontReady = true;
        });
        window.onkeydown = (ev) => {
            if (ev.defaultPrevented) {
                return;
            }
            this.keyBuffer.pushKey(ev.code);
            ev.preventDefault();
        };
    }
    dispatchKey(key) {
        let delta = { x: 0, y: 0 };
        switch (key) {
            case "Space":
                this.pause = !this.pause;
                break;
            case "KeyW":
            case "ArrowUp":
                delta = { x: 0, y: -this.CELL_HEIGHT };
                break;
            case "KeyS":
            case "ArrowDown":
                delta = { x: 0, y: this.CELL_HEIGHT };
                break;
            case "KeyA":
            case "ArrowLeft":
                delta = { x: -this.CELL_WIDTH, y: 0 };
                break;
            case "KeyD":
            case "ArrowRight":
                delta = { x: this.CELL_WIDTH, y: 0 };
                break;
        }
        return delta;
    }
    update(dt) {
        this.time += dt;
        if (this.time >= Game.STEP_TIME) {
            if (!this.keyBuffer.empty()) {
                let newDelta = this.dispatchKey(this.keyBuffer.getKey());
                if (newDelta.x != this.delta_pos.x && newDelta.y != this.delta_pos.y) {
                    this.delta_pos = newDelta;
                }
            }
            if (!this.pause) {
                this.snake.update(this.delta_pos);
            }
            let headPos = this.snake.getHeadPosition();
            if (headPos.x >= this.canvas.width || headPos.x < 0) {
                this.snake.setHeadPosition({ x: this.canvas.width - Math.abs(headPos.x), y: headPos.y });
            }
            if (headPos.y >= this.canvas.height || headPos.y < 0) {
                this.snake.setHeadPosition({ x: headPos.x, y: this.canvas.height - Math.abs(headPos.y) });
            }
            this.time = 0;
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fill_cells(this.canvas.width, this.canvas.height);
        this.snake.render(this.ctx);
        if (this.pause && this.fontReady) {
            this.ctx.fillStyle = "#20202080";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            let pauseText = "Pause"; // .split("").join(String.fromCharCode(8202));
            let pressSpaceText = "Press SPACE to continue"; // .split("").join(String.fromCharCode(8202));
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.textBaseline = "middle";
            this.ctx.font = "64px Arcade";
            let pauseMeasure = this.ctx.measureText(pauseText);
            this.ctx.fillText(pauseText, (this.canvas.width - pauseMeasure.width) / 2, this.canvas.height / 2 - 32);
            this.ctx.font = "48px Arcade";
            let pressSpaceMeasure = this.ctx.measureText(pressSpaceText);
            this.ctx.fillText(pressSpaceText, (this.canvas.width - pressSpaceMeasure.width) / 2, this.canvas.height / 2 + 32);
        }
    }
    fill_cells(width, height) {
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.beginPath();
        for (let x = 0; x <= width; x += this.CELL_WIDTH) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += this.CELL_HEIGHT) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
        }
        this.ctx.strokeStyle = "#00000050";
        this.ctx.stroke();
    }
}
Game.ROWS = 25;
Game.COLS = 25;
Game.STEP_TIME = 250;
class Tile {
    constructor(position) {
        this.position = position;
    }
    render(ctx, color = "#000000FF") {
        ctx.fillStyle = color;
        ctx.fillRect(this.position.x, this.position.y, Tile.width, Tile.height);
    }
}
class Snake {
    constructor(pos, tile_width, tile_height) {
        this.tiles = [];
        Tile.width = tile_width;
        Tile.height = tile_height;
        this.tiles.push(new Tile(pos));
        this.tiles.push(new Tile({ x: pos.x - tile_width, y: pos.y }));
        this.tiles.push(new Tile({ x: pos.x - tile_width * 2, y: pos.y }));
        this.tile_width = tile_width;
        this.tile_height = tile_height;
    }
    setHeadPosition(pos) {
        this.tiles[0].position = { ...pos };
    }
    getHeadPosition() {
        return this.tiles[0].position;
    }
    update(dpos) {
        for (let i = this.tiles.length - 1; i > 0; --i) {
            this.tiles[i].position = { ...this.tiles[i - 1].position };
        }
        this.tiles[0].position.x += dpos.x;
        this.tiles[0].position.y += dpos.y;
    }
    render(ctx) {
        this.tiles[0].render(ctx, "#FF0000FF");
        for (let i = 1; i < this.tiles.length; ++i) {
            this.tiles[i].render(ctx);
        }
    }
}
let canvas = document.getElementById("app");
const game = new Game(canvas);
game.setup();
let lastTime = Date.now();
function render() {
    let time = Date.now();
    let dt = time - lastTime;
    game.update(dt);
    game.render();
    lastTime = time;
    window.requestAnimationFrame(render);
}
render();
