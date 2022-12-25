import Sprite from "./sprite.js";
import App from "./app.js";
import { SpriteOptions } from "./types.js";
import { Position } from "./types.js";
import { equal, randomNumber } from "./utility.js";

export default class Fruit {
    tile: Sprite;

    constructor(position: Position, sprite: SpriteOptions = App.sprites["fruit"]) {
        this.tile = new Sprite(position, { x: 0, y: -1 }, sprite);
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
