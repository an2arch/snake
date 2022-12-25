import { add, equal } from "./utility.js";
import App from "./app.js";
import Sprite from "./sprite.js";
export default class Snake {
    constructor(pos) {
        this.tiles = [];
        this.eatingFruit = false;
        this.eatingBad = false;
        this.tiles.push(new Sprite(pos, { x: 1, y: 0 }, App.sprites["snake_head"]));
        this.tiles.push(new Sprite({ x: pos.x - 1, y: pos.y }, { x: 1, y: 0 }, App.sprites["snake_body"]));
        this.tiles.push(new Sprite({ x: pos.x - 2, y: pos.y }, { x: 1, y: 0 }, App.sprites["snake_tail"]));
    }
    popTile() {
        this.tiles.pop();
        this.tiles[this.tiles.length - 1].options = App.sprites["snake_tail"];
    }
    removeTiles(start, end) {
        if (0 <= start && start < end && end <= this.tiles.length) {
            this.tiles.splice(start, end - start + 1);
        }
    }
    pushTile() {
        let lastTile = this.tiles[this.tiles.length - 1];
        lastTile.options = App.sprites["snake_body"];
        this.tiles.push(new Sprite(lastTile.position, lastTile.orientation, App.sprites["snake_tail"]));
    }
    getHeadPosition() {
        return this.tiles[0].position;
    }
    getPositions() {
        return this.tiles.map((tile) => tile.position);
    }
    getHeadOrientation() {
        return this.tiles[0].orientation;
    }
    moveByDirection(dir) {
        for (let i = this.tiles.length - 1; i > 0; --i) {
            this.tiles[i].position = { ...this.tiles[i - 1].position };
            this.tiles[i].orientation = { ...this.tiles[i - 1].orientation };
            this.tiles[i].resetAnimation();
        }
        this.tiles[0].position = add(this.tiles[0].position, dir);
        this.tiles[0].orientation = { ...dir };
        this.tiles[0].resetAnimation();
        this.eatingFruit = false;
        this.eatingBad = false;
    }
    updateSprites() {
        if (this.eatingFruit) {
            this.tiles[0].setOptions(App.sprites["snake_head_eat"]);
        }
        else if (this.eatingBad) {
            this.tiles[0].setOptions(App.sprites["snake_head_eat_bad"]);
        }
        else {
            this.tiles[0].setOptions(App.sprites["snake_head"]);
        }
        for (let i = 0; i < this.tiles.length - 1; ++i) {
            let nextTile = this.tiles[i];
            let prevTile = this.tiles[i + 1];
            if (equal(nextTile.orientation, prevTile.orientation)) {
                if (i + 1 == this.tiles.length - 1) {
                    prevTile.setOptions(App.sprites["snake_tail"]);
                }
                else {
                    prevTile.setOptions(App.sprites["snake_body"]);
                }
            }
            else if ((equal(nextTile.orientation, { x: 1, y: 0 }) && equal(prevTile.orientation, { x: 0, y: -1 })) ||
                (equal(nextTile.orientation, { x: 0, y: 1 }) && equal(prevTile.orientation, { x: 1, y: 0 })) ||
                (equal(nextTile.orientation, { x: -1, y: 0 }) && equal(prevTile.orientation, { x: 0, y: 1 })) ||
                (equal(nextTile.orientation, { x: 0, y: -1 }) && equal(prevTile.orientation, { x: -1, y: 0 }))) {
                if (i + 1 == this.tiles.length - 1) {
                    prevTile.setOptions(App.sprites["snake_tail_down_right"]);
                }
                else {
                    prevTile.setOptions(App.sprites["snake_body_down_right"]);
                }
            }
            else if ((equal(prevTile.orientation, { x: 1, y: 0 }) && equal(nextTile.orientation, { x: 0, y: -1 })) ||
                (equal(prevTile.orientation, { x: 0, y: 1 }) && equal(nextTile.orientation, { x: 1, y: 0 })) ||
                (equal(prevTile.orientation, { x: -1, y: 0 }) && equal(nextTile.orientation, { x: 0, y: 1 })) ||
                (equal(prevTile.orientation, { x: 0, y: -1 }) && equal(nextTile.orientation, { x: -1, y: 0 }))) {
                if (i + 1 == this.tiles.length - 1) {
                    prevTile.setOptions(App.sprites["snake_tail_down_left"]);
                }
                else {
                    prevTile.setOptions(App.sprites["snake_body_down_left"]);
                }
            }
        }
    }
    eatFruit() {
        this.eatingFruit = true;
    }
    eatBadFruit() {
        this.eatingBad = true;
    }
    update(dt) {
        this.tiles.forEach((tile) => tile.update(dt));
    }
    render(ctx) {
        for (let i = 0; i < this.tiles.length; ++i) {
            this.tiles[i].render(ctx);
        }
    }
}
