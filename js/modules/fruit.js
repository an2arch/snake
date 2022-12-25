import Sprite from "./sprite.js";
import App from "./app.js";
import { equal, randomNumber } from "./utility.js";
export default class Fruit {
    constructor(position, sprite = App.sprites["fruit"]) {
        this.tile = new Sprite(position, { x: 0, y: -1 }, sprite);
    }
    newPosition(maxX, maxY, exclude) {
        let randomPoint = { x: randomNumber(0, maxX), y: randomNumber(0, maxY) };
        if (exclude) {
            while (!exclude.every((pos) => !equal(pos, randomPoint))) {
                randomPoint = { x: randomNumber(0, maxX), y: randomNumber(0, maxY) };
            }
        }
        this.tile.position = randomPoint;
    }
    update(dt) {
        this.tile.update(dt);
    }
    render(ctx) {
        this.tile.render(ctx);
    }
}
