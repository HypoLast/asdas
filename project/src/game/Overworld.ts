import * as dimensions from "../const/dimensions";
import * as KeyCodes from "../const/keycodes";
import * as timings from "../const/timings";
import * as Keyboard from "../providers/Keyboard";
import { MersenneTwister } from "../random/MersenneTwister";
import { lerp } from "../random/Perlin";
import * as perlin from "../random/Perlin";
import { GameComponent } from "./GameComponent";
import { Block, MapGenerator } from "./MapGenerator";

function blockIdx(x: number, y: number) {
    return (x + 1) + (y + 1) * 3;
}

function pMod(m: number, n: number) {
    return ((m % n) + n) % n;
}

interface Controls {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    interact: boolean;
    back: boolean;
}

export class Overworld implements GameComponent {

    public controls: Controls = {
        back: false,
        down: false,
        interact: false,
        left: false,
        right: false,
        up: false,
    };
    public canMove: boolean = true;
    public moveStart = -1;
    public playerCoord: { x: number, y: number } = { x: Math.floor(dimensions.BLOCK_WIDTH / 2), y: Math.floor(dimensions.BLOCK_HEIGHT / 2) };
    public movingCoord?: { x: number, y: number };
    public mapSeed = -1;
    public tileLayer: PIXI.Container = new PIXI.Container();

    public renderLayer: PIXI.Container = new PIXI.Container();
    private backgroundLayer: PIXI.Container = new PIXI.Container();
    private spriteLayer: PIXI.Container = new PIXI.Container();

    private timer = 0;

    private blocks: Block[] = [];
    private generator: MapGenerator;

    private playerSprite: PIXI.Graphics;

    constructor() {
        this.renderLayer.addChild(this.backgroundLayer);
        this.renderLayer.addChild(this.spriteLayer);

        this.backgroundLayer.addChild(this.tileLayer);
        Keyboard.provider().do((o) => {
            switch (o.keyCode) {
                case KeyCodes.ARROW_UP: this.controls.up = o.pressed; break;
                case KeyCodes.ARROW_DOWN: this.controls.down = o.pressed; break;
                case KeyCodes.ARROW_LEFT: this.controls.left = o.pressed; break;
                case KeyCodes.ARROW_RIGHT: this.controls.right = o.pressed; break;
                case KeyCodes.Z: this.controls.interact = o.pressed; break;
                case KeyCodes.X: this.controls.back = o.pressed; break;
                default: break;
            }
        });

        this.playerSprite = new PIXI.Graphics();
        this.playerSprite.beginFill(0xFF0000);
        this.playerSprite.drawCircle(dimensions.TILE_WIDTH / 2, dimensions.TILE_HEIGHT / 2, dimensions.TILE_WIDTH / 2);
        this.playerSprite.endFill();

        this.spriteLayer.addChild(this.playerSprite);
    }

    public loadMap(mapSeed: number) {
        this.mapSeed = mapSeed;
        this.generator = new MapGenerator(mapSeed);
        this.loadChunk();
    }

    public loadChunk() {
        while (this.blocks.length > 0) this.tileLayer.removeChild((<Block> this.blocks.pop()).renderLayer);
        let coord = this.movingCoord || this.playerCoord;
        let blockX = Math.floor(coord.x / dimensions.BLOCK_WIDTH);
        let blockY = Math.floor(coord.y / dimensions.BLOCK_HEIGHT);

        for (let i = -1; i <= 1; i ++) {
            for (let j = -1; j <= 1; j ++) {
                let block = this.blocks[blockIdx(i, j)] = this.generator.getBlock(i + blockX, j + blockY);
                let blockGraphic = block.renderLayer;
                blockGraphic.x = dimensions.BLOCK_WIDTH * block.x * dimensions.TILE_WIDTH;
                blockGraphic.y = dimensions.BLOCK_HEIGHT * block.y * dimensions.TILE_HEIGHT;
                this.tileLayer.addChild(blockGraphic);
            }
        }
    }

    public tileIsWalkable(x: number, y: number): boolean;
    public tileIsWalkable(coord: { x: number, y: number }): boolean;
    public tileIsWalkable(a: { x: number, y: number } | number, y?: number): boolean {
        let coord: { x: number, y: number };
        if (y !== undefined && typeof a === "number") {
            coord = { x: a, y };
        } else if (typeof a === "object") {
            coord = a;
        } else {
            throw "illegal parameters";
        }
        let blockX = Math.floor(coord.x / dimensions.BLOCK_WIDTH);
        let blockY = Math.floor(coord.y / dimensions.BLOCK_HEIGHT);
        let block = this.generator.getBlock(blockX, blockY);
        let cell = block.tiles[pMod(coord.x, dimensions.BLOCK_WIDTH)][pMod(coord.y, dimensions.BLOCK_HEIGHT)];
        return cell.passable;
    }

    public tick() {
        if (this.mapSeed < 0) return;
        this.timer ++;
        if (!this.canMove) {
            if (this.moveStart >= 0 && this.timer >= this.moveStart + timings.STEP) {
                this.canMove = true;
                if (this.movingCoord) {
                    if (Math.floor(this.movingCoord.x / dimensions.BLOCK_WIDTH) !== Math.floor(this.playerCoord.x / dimensions.BLOCK_WIDTH) ||
                        Math.floor(this.movingCoord.y / dimensions.BLOCK_HEIGHT) !== Math.floor(this.playerCoord.y / dimensions.BLOCK_HEIGHT)) {
                        this.loadChunk();
                    }
                    this.playerCoord = this.movingCoord;
                    this.movingCoord = undefined;
                }
            }
        }
        if (this.canMove) {
            if (this.controls.left || this.controls.right || this.controls.up || this.controls.down) {
                let newCoord = { x: this.playerCoord.x, y: this.playerCoord.y };
                if (this.controls.left) {
                    newCoord.x --;
                } else if (this.controls.right) {
                    newCoord.x ++;
                } else if (this.controls.up) {
                    newCoord.y --;
                } else if (this.controls.down) {
                    newCoord.y ++;
                }
                if (this.tileIsWalkable(newCoord)) {
                    this.movingCoord = newCoord;
                    this.moveStart = this.timer;
                    this.canMove = false;
                }
            }
        }
    }

    public render() {
        if (this.mapSeed < 0) return;
        let visualPlayerPosition: { x: number, y: number };
        if (this.movingCoord !== undefined) {
            let dt = (this.timer - this.moveStart) / timings.STEP;
            visualPlayerPosition = {
                x: lerp(dt, this.playerCoord.x, this.movingCoord.x) * dimensions.TILE_WIDTH,
                y: lerp(dt, this.playerCoord.y, this.movingCoord.y) * dimensions.TILE_HEIGHT,
            };
        } else {
            visualPlayerPosition = { x: this.playerCoord.x * dimensions.TILE_WIDTH, y: this.playerCoord.y * dimensions.TILE_HEIGHT };
        }

        this.backgroundLayer.x = this.spriteLayer.x = -visualPlayerPosition.x + dimensions.SCREEN_WIDTH / 2;
        this.backgroundLayer.y = this.spriteLayer.y = -visualPlayerPosition.y + dimensions.SCREEN_HEIGHT / 2;

        this.playerSprite.x = visualPlayerPosition.x;
        this.playerSprite.y = visualPlayerPosition.y;
    }

}
