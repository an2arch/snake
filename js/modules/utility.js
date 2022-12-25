export function randomNumber(from, to) {
    return Math.floor(Math.random() * (to - from) + from);
}
export function equal(p1, p2) {
    return p1.x == p2.x && p1.y == p2.y;
}
export function add(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}
export class KeyBuf {
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
    clean() {
        this.lastKeys = [];
    }
    getKey() {
        if (this.lastKeys.length > 0) {
            return this.lastKeys.shift();
        }
        return undefined;
    }
    seekKey() {
        if (this.lastKeys.length > 0) {
            return this.lastKeys[0];
        }
        return undefined;
    }
}
