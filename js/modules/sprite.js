import { equal } from "./utility.js";
import App from "./app.js";
export default class Sprite {
    constructor(position, orientation, options) {
        this.frameIndex = 0;
        this.time = 0;
        this.position = position;
        this.orientation = orientation;
        this.options = options;
    }
    setOptions(newOptions) {
        this.options = newOptions;
    }
    setFrame(newFrameIdx) {
        if (0 <= newFrameIdx && newFrameIdx < this.options.numberOfFrames) {
            this.frameIndex = newFrameIdx;
        }
    }
    resetAnimation() {
        this.frameIndex = 0;
        this.time = 0;
    }
    update(dt) {
        this.time += dt;
        if (this.options) {
            if (this.time >= this.options.msPerFrame) {
                this.time = 0;
                if (this.frameIndex < this.options.numberOfFrames - 1) {
                    this.frameIndex += 1;
                }
                else {
                    this.frameIndex = 0;
                }
            }
        }
    }
    renderFrame(ctx) {
        let sprite = this.options;
        ctx.drawImage(sprite.image, (this.frameIndex * sprite.width) / sprite.numberOfFrames, 0, sprite.width / sprite.numberOfFrames, sprite.height, 0, 0, Sprite.width, Sprite.height);
    }
    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x * Sprite.width, this.position.y * Sprite.height);
        let sprite = App.sprites["error"];
        if (this.options && "image" in this.options) {
            sprite = this.options;
            if (equal(this.orientation, { x: 1, y: 0 })) {
                // right
                ctx.translate(Sprite.width, 0);
                ctx.rotate(Math.PI / 2);
            }
            else if (equal(this.orientation, { x: -1, y: 0 })) {
                // left
                ctx.translate(0, Sprite.height);
                ctx.rotate((3 * Math.PI) / 2);
            }
            else if (equal(this.orientation, { x: 0, y: 1 })) {
                // down
                ctx.translate(Sprite.width, Sprite.height);
                ctx.rotate(Math.PI);
            }
        }
        if (sprite) {
            this.renderFrame(ctx);
        }
        ctx.restore();
    }
}
Sprite.width = 32;
Sprite.height = 32;
