import * as KeyCodes from "../const/keycodes";
import * as Keyboard from "../providers/Keyboard";
import { MersenneTwister } from "../random/MersenneTwister";
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

}
