import * as GameClock from "./GameClock";

let size = 16;
let padding = 0;
let spriteSheet: PIXI.Texture;

export const FRAME_RATE = 100;

export function Init() {
    spriteSheet = PIXI.Texture.fromImage("res/img/tiles/characters.png");
    spriteSheet.scaleMode = PIXI.SCALE_MODES.NEAREST;

    let accumulator: number = 0;
    GameClock.provider().do((o) => {
        accumulator += o.dt;
        let framesPassed = Math.floor(accumulator / FRAME_RATE);
        if (framesPassed > 0) {
            juggledAnimations.forEach((s) => s.frame += framesPassed);
            accumulator -= FRAME_RATE * framesPassed;
        }
    });
}

interface SpriteSetFrames {
    walk: PIXI.Texture[][];
    stand: PIXI.Texture[][];
}

export enum Direction {
    DOWN = 0,
    LEFT,
    RIGHT,
    UP,
}

export class AnimatedSprite extends PIXI.Sprite {

    private myAnimation: keyof SpriteSetFrames = "stand";
    private myDirection = Direction.DOWN;
    private myFrame = 0;

    constructor(public frames: SpriteSetFrames) {
        super();
        this.draw();
    }

    public set animation(animation: keyof SpriteSetFrames) {
        this.myAnimation = animation;
        this.draw();
    }
    public get animation() { return this.myAnimation; }

    public set direction(direction: Direction) {
        this.myDirection = direction;
        this.draw();
    }
    public get direction() { return this.myDirection; }

    public set frame(frame: number) {
        this.myFrame = frame;
        this.draw();
    }
    public get frame() { return this.myFrame; }

    public draw() {
        if (this.frame >= this.frames[this.animation][this.direction].length) this.myFrame = 0;
        this.texture = this.frames[this.animation][this.direction][this.frame];
    }
}

let frameCache: { [ name: string ]: PIXI.Texture } = {};

export function getFrame(x: number, y: number) {
    let frameId = x + "," + y;
    if (frameCache[frameId] !== undefined) return frameCache[frameId];
    let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(x * (size + padding),
                                                                 y * (size + padding),
                                                                 size, size));
    frameCache[frameId] = frame;
    return frame;
}

export function getCharacterSprite(name: keyof typeof characters) {
    let [x, y] = characters[name];
    let frames: SpriteSetFrames = {
        stand: [
            [getFrame(x + 1, y    )],
            [getFrame(x + 1, y + 1)],
            [getFrame(x + 1, y + 2)],
            [getFrame(x + 1, y + 3)],
        ],
        walk: [
            [getFrame(x, y    ), getFrame(x + 1, y    ), getFrame(x + 2, y    ), getFrame(x + 1, y    )],
            [getFrame(x, y + 1), getFrame(x + 1, y + 1), getFrame(x + 2, y + 1), getFrame(x + 1, y + 1)],
            [getFrame(x, y + 2), getFrame(x + 1, y + 2), getFrame(x + 2, y + 2), getFrame(x + 1, y + 2)],
            [getFrame(x, y + 3), getFrame(x + 1, y + 3), getFrame(x + 2, y + 3), getFrame(x + 1, y + 3)],
        ],
    };
    return new AnimatedSprite(frames);
}

export const characters = {
    girl: [6, 0],
    guy: [3, 0],
};

let juggledAnimations: AnimatedSprite[] = [];

export function juggle(sprite: AnimatedSprite) {
    if (juggledAnimations.indexOf(sprite) < 0) juggledAnimations.push(sprite);
}

export function drop(sprite: AnimatedSprite) {
    let idx = juggledAnimations.indexOf(sprite);
    if (idx < 0) return;
    juggledAnimations.splice(idx, 1);
}
