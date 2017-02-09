let size = 16;
let padding = 0;
let spriteSheet: PIXI.Texture;

export function Init() {
    spriteSheet = PIXI.Texture.fromImage("res/img/tiles/characters.png");
}

interface SpriteSetFrames {
    walk: PIXI.Texture[][];
    stand: PIXI.Texture[][];
}

export enum Direction {
    UP = 0,
    DOWN,
    LEFT,
    RIGHT,
}

class AnimatedSprite extends PIXI.Sprite {

    public frames: SpriteSetFrames;
    public myFrame = 0;
    public myDirection = Direction.LEFT;
    public myAnimation: keyof SpriteSetFrames = "stand";

    constructor() {
        super();
    }

    public set animation(state: keyof SpriteSetFrames) {
        //
    }

    public set direction(direction: Direction) {
        //
    }

    public set frame(frame: number) {
        //
    }
}

export function getCharacterSprite(name: keyof typeof characters) {
    //
}

export const characters = {
    girl: [6, 0],
    guy: [3, 0],
};

export function juggle(sprite: AnimatedSprite) {
    //
}

export function drop(sprite: AnimatedSprite) {
    //
}
