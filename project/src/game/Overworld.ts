import * as KeyCodes from "../const/keycodes";
import * as Keyboard from "../providers/Keyboard";
import { MersenneTwister } from "../random/MersenneTwister";
import * as perlin from "../random/Perlin";
import { GameComponent } from "./GameComponent";

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
    public playerCoord: { x: number, y: number };
    public mapSeed = -1;

    private timer = 0;

    private sand: [number, number, number] = [0xFF, 0xEE, 0xCC];
    private water: [number, number, number] = [0x00, 0x44, 0xFF];
    private grass: [number, number, number] = [0x00, 0xBB, 0x11];

    private cold: [number, number, number] = [0xCC, 0xFF, 0xFF];
    private hot: [number, number, number] = [0xFF, 0x99, 0x22];

    constructor(spriteLayer: PIXI.Container, backgroundLayer: PIXI.Container) {
        super(spriteLayer, backgroundLayer);
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
        let mt = new MersenneTwister(mapSeed);
        perlin.setSeed(mt.genrand_int32());
        let canvas = window.document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 1000;
        let ctx = canvas.getContext("2d");
        if (!ctx) return;
        for (let i = 0; i < canvas.width / 5; i ++) {
            for (let j = 0; j < canvas.height / 5; j ++) {
                let noise = perlin.multiChannelPerlin2d(i / 30, j / 30, 3, 2, [1, 1 / 6]);
                let pvals = noise.map((v) => (v + 1) / 2);
                let ground = pvals[0];
                let groundColor: [number, number, number];
                if (ground < 0.3) groundColor = this.gradient([0, 0, 0xFF], this.water, ground / 0.3);
                else if (ground < 0.4) groundColor = this.gradient(this.water, this.sand, (ground - 0.3) / 0.1);
                else if (ground < 0.6) groundColor = this.gradient(this.sand, this.grass, (ground - 0.4) / 0.2);
                else groundColor = this.gradient(this.grass, [0, 0xAA, 0], (ground - 0.6) / 0.4);
                let tempColor = this.gradient(this.cold, this.hot, pvals[1]);
                // pvals = pvals.map((v) => (v.length === 1 ? "0" : "") + v);
                ctx.fillStyle = "rgb(" + Math.round(groundColor[0] * 0.5 + tempColor[0] * 0.5) + "," +
                                         Math.round(groundColor[1] * 0.5 + tempColor[1] * 0.5) + "," +
                                         Math.round(groundColor[2] * 0.5 + tempColor[2] * 0.5) + ")";
                ctx.fillRect(i * 5, j * 5, 5, 5);
            }
        }
        let img = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
        this.spriteLayer.addChild(img);
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
