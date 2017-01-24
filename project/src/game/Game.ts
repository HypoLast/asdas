import * as dimensions from "../const/dimensions";
import * as keycodes from "../const/keycodes";
import * as GameClock from "../providers/GameClock";
import * as Keyboard from "../providers/Keyboard";
import { Overworld } from "./Overworld";

export class Game {

    public root: PIXI.Container;

    public drawingLayer: PIXI.Container;
    public UILayer: PIXI.Container;

    public backgroundLayer: PIXI.Container;
    public spriteLayer: PIXI.Container;

    public mode: "overworld" | "conversation" | "combat" = "overworld";

    public overworld: Overworld;

    constructor() {
        this.root = new PIXI.Container();

        this.drawingLayer = new PIXI.Container();
        this.UILayer = new PIXI.Container();
        this.root.addChild(this.drawingLayer);
        this.root.addChild(this.UILayer);

        this.backgroundLayer = new PIXI.Container();
        this.spriteLayer = new PIXI.Container();
        this.drawingLayer.addChild(this.backgroundLayer);
        this.drawingLayer.addChild(this.spriteLayer);

        this.overworld = new Overworld(this.spriteLayer, this.backgroundLayer);
    }

    public tick() {
        switch (this.mode) {
            case "overworld": this.overworld.tick(); break;
            default: console.log("no method for ticking " + this.mode);
        }
    }

    public render() {
        switch (this.mode) {
            case "overworld": this.overworld.render(); break;
            default: console.log("no method for rendering " + this.mode);
        }
     }

    get display() {
        return this.root;
    }

}
