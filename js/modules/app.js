import Sprite from "./sprite.js";
import Game from "./game.js";
export default class App {
    constructor(canvas) {
        this.lastTime = undefined;
        this.loadResources();
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        let gameWidth = 960;
        let gameHeight = 960;
        let gameCols = 15;
        let gameRows = 15;
        Sprite.width = Math.floor(gameWidth / gameCols);
        Sprite.height = Math.floor(gameHeight / gameRows);
        this.game = new Game(this.ctx, gameCols, gameRows, gameWidth, gameHeight);
        this.game.initGame();
    }
    loadResources() {
        let font = new FontFace("Arcade", "url(font/ARCADE.TTF)");
        font.load().then(() => {
            App.fonts["Arcade"] = font;
            document.fonts.add(font);
        });
        let grass = new Image();
        grass.src = "./sprites/grass.png";
        App.sprites["grass"] = {
            width: 32 * 12,
            height: 32,
            image: grass.cloneNode(),
            numberOfFrames: 12,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };
        let error = new Image();
        error.src = "./sprites/error.png";
        App.sprites["error"] = {
            width: 32 * 1,
            height: 32,
            image: error.cloneNode(),
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };
        let fruit = new Image();
        fruit.src = "./sprites/fruit.png";
        App.sprites["fruit"] = {
            width: 32 * 8,
            height: 32,
            image: fruit.cloneNode(),
            numberOfFrames: 8,
            msPerFrame: Game.STEP_TIME_MS / 8,
        };
        let bad_fruit = new Image();
        bad_fruit.src = "./sprites/bad_fruit.png";
        App.sprites["bad_fruit"] = {
            width: 32 * 8,
            height: 32,
            image: bad_fruit.cloneNode(),
            numberOfFrames: 8,
            msPerFrame: Game.STEP_TIME_MS / 8,
        };
        let snake_head = new Image();
        snake_head.src = "./sprites/snake_head.png";
        App.sprites["snake_head"] = {
            width: 32 * 15,
            height: 32,
            image: snake_head.cloneNode(),
            numberOfFrames: 15,
            msPerFrame: Game.STEP_TIME_MS / 15,
        };
        let snake_head_eat = new Image();
        snake_head_eat.src = "./sprites/snake_head_eat.png";
        App.sprites["snake_head_eat"] = {
            width: 32 * 15,
            height: 32,
            image: snake_head_eat.cloneNode(),
            numberOfFrames: 15,
            msPerFrame: Game.STEP_TIME_MS / 15,
        };
        let snake_head_eat_bad = new Image();
        snake_head_eat_bad.src = "./sprites/snake_head_eat_bad.png";
        App.sprites["snake_head_eat_bad"] = {
            width: 32 * 15,
            height: 32,
            image: snake_head_eat_bad.cloneNode(),
            numberOfFrames: 15,
            msPerFrame: Game.STEP_TIME_MS / 15,
        };
        let snake_body = new Image();
        snake_body.src = "./sprites/snake_body.png";
        App.sprites["snake_body"] = {
            width: 32,
            height: 32,
            image: snake_body.cloneNode(),
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };
        let snake_body_down_right = new Image();
        snake_body_down_right.src = "./sprites/snake_body_down_right.png";
        App.sprites["snake_body_down_right"] = {
            width: 32,
            height: 32,
            image: snake_body_down_right.cloneNode(),
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };
        let snake_body_down_left = new Image();
        snake_body_down_left.src = "./sprites/snake_body_down_left.png";
        App.sprites["snake_body_down_left"] = {
            width: 32,
            height: 32,
            image: snake_body_down_left.cloneNode(),
            numberOfFrames: 1,
            msPerFrame: Game.STEP_TIME_MS / 1,
        };
        let snake_tail = new Image();
        snake_tail.src = "./sprites/snake_tail.png";
        App.sprites["snake_tail"] = {
            width: 32 * 11,
            height: 32,
            image: snake_tail.cloneNode(),
            numberOfFrames: 11,
            msPerFrame: Game.STEP_TIME_MS / 11,
        };
        let snake_tail_down_right = new Image();
        snake_tail_down_right.src = "./sprites/snake_tail_down_right.png";
        App.sprites["snake_tail_down_right"] = {
            width: 32 * 10,
            height: 32,
            image: snake_tail_down_right.cloneNode(),
            numberOfFrames: 10,
            msPerFrame: Game.STEP_TIME_MS / 10,
        };
        let snake_tail_down_left = new Image();
        snake_tail_down_left.src = "./sprites/snake_tail_down_left.png";
        App.sprites["snake_tail_down_left"] = {
            width: 32 * 10,
            height: 32,
            image: snake_tail_down_left.cloneNode(),
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#000";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "64px Arcade";
        let scoreText = "SCORE " + this.game.score;
        let headerMeasure = this.ctx.measureText(scoreText);
        this.ctx.fillText(scoreText, (this.canvas.width + this.game.width) / 2 + 20, 64, (this.canvas.width - this.game.width - headerMeasure.width) / 2 - 20);
        this.ctx.save();
        this.ctx.translate((this.canvas.width - this.game.width) / 2, (this.canvas.height - this.game.width) / 2);
        this.game.render();
        this.ctx.restore();
    }
}
App.fonts = {};
App.sprites = {};
