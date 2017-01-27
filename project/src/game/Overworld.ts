import * as KeyCodes from "../const/keycodes";
import * as Keyboard from "../providers/Keyboard";
import { MersenneTwister } from "../random/MersenneTwister";
import * as perlin from "../random/Perlin";
import { GameComponent } from "./GameComponent";
import { Block, MapGenerator } from "./MapGenerator";

function blockIdx(x: number, y: number) {
    return (x + 1) + (y + 1) * 3;
}

interface Controls {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    interact: boolean;
    back: boolean;
}

export class Overworld extends GameComponent {

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
    public playerCoord: { x: number, y: number } = { x: 0, y: 0 };
    public mapSeed = -1;
    public tileLayer: PIXI.Container = new PIXI.Container();

    private timer = 0;

    private blocks: Block[];
    private generator: MapGenerator;

    private sand: [number, number, number] = [0xFF, 0xEE, 0xCC];
    private water: [number, number, number] = [0x00, 0x44, 0xFF];
    private grass: [number, number, number] = [0x00, 0xBB, 0x11];

    private cold: [number, number, number] = [0xCC, 0xFF, 0xFF];
    private hot: [number, number, number] = [0xFF, 0x99, 0x22];

    constructor(spriteLayer: PIXI.Container, backgroundLayer: PIXI.Container) {
        super(spriteLayer, backgroundLayer);
        backgroundLayer.addChild(this.tileLayer);
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
    }

    public loadMap(mapSeed: number) {
        this.mapSeed = mapSeed;
        this.generator = new MapGenerator(mapSeed);
        this.blocks = [];
        let blockX = this.playerCoord.x;
        let blockY = this.playerCoord.y;
        let blockOffX = this.playerCoord.x % 64;
        let blockOffY = this.playerCoord.y % 64;

        for (let i = -1; i <= 1; i ++) {
            for (let j = -1; j <= 1; j ++) {
                let block = this.blocks[blockIdx(i, j)] = this.generator.getBlock(i + blockX, j + blockY);
                let blockGraphic = block.getRenderLayer();
                blockGraphic.x = 64 * 20 * i;
                blockGraphic.y = 64 * 20 * j;
                this.tileLayer.addChild(blockGraphic);
            }
        }
    }

    public tick() {
        if (this.mapSeed < 0) return;
        this.timer ++;
        if (!this.canMove) {
            if (this.moveStart >= 0 && this.timer > this.moveStart + 15) {
                this.canMove = true;
            }
        }
        if (this.canMove) {
            if (this.controls.left || this.controls.right || this.controls.up || this.controls.down) {
                this.moveStart = this.timer;
                this.canMove = false;
            }
        }
    }

    public render() {
        if (this.mapSeed < 0) return;
    }

    private gradient(from: [number, number, number],
                     to: [number, number, number],
                     amount: number): [number, number, number] {
        amount = perlin.fade(amount);
        return [perlin.lerp(amount, from[0], to[0]),
                perlin.lerp(amount, from[1], to[1]),
                perlin.lerp(amount, from[2], to[2])];
    }

}
