import { Position } from "./types.js";

export function randomNumber(from: number, to: number) {
    return Math.floor(Math.random() * (to - from) + from);
}

export function equal(p1: Position, p2: Position) {
    return p1.x == p2.x && p1.y == p2.y;
}

export function add(p1: Position, p2: Position) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export class KeyBuf {
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
