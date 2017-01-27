import * as dimensions from "../const/dimensions";
import { getTileTexture, tiles } from "../providers/Tiles";
import { MersenneTwister } from "../random/MersenneTwister";
import * as perlin from "../random/Perlin";

export class MapGenerator {

    public loadedBlocks: {[blockCoord: string]: Block} = {};

    constructor(public seed: number) { }

    public getBlock(x: number, y: number) {
        let blockName = x + "," + y;
        if (this.loadedBlocks[blockName] !== undefined) return this.loadedBlocks[blockName];
        let mt = new MersenneTwister(this.seed);
        perlin.setSeed(mt.genrand_int32());
        let block = new Block(x, y);
        for (let i = 0; i < 64; i ++) {
            block.tiles[i] = [];
            for (let j = 0; j < 64; j ++) {
                let X = x * 64 + i;
                let Y = y * 64 + j;
                let cell = new Cell(X, Y);
                let [elevation, temperature] = perlin.multiChannelPerlin2d(X / 30, Y / 30, 3, 2, [1, 1 / 6]);
                if (elevation < -0.4) cell.type = "water";
                else if (elevation < -0.1) cell.type = "sand";
                else cell.type = "grass";
                cell.elevation = elevation;
                cell.temperature = temperature;
                cell.passable = cell.type !== "water";
                block.tiles[i][j] = cell;
            }
        }
        this.loadedBlocks[blockName] = block;
        return block;
    }

}

// tslint:disable-next-line:max-classes-per-file
export class Block {
    public tiles: Cell[][] = [];

    constructor(public x: number, public y: number) { }

    public getRenderLayer(): PIXI.Container {
        let layer = new PIXI.Container();
        for (let i = 0; i < 64; i ++) {
            for (let j = 0; j < 64; j ++) {
                let tileSprite = new PIXI.Sprite(getTileTexture(this.tiles[i][j].type,
                                                                i + this.x * 64,
                                                                j + this.y * 64));
                tileSprite.width = dimensions.TILE_WIDTH;
                tileSprite.height = dimensions.TILE_HEIGHT;
                tileSprite.x = i * dimensions.TILE_WIDTH;
                tileSprite.y = j * dimensions.TILE_HEIGHT;
                layer.addChild(tileSprite);
            }
        }
        return layer;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Cell {
    public type: keyof typeof tiles;
    public elevation: number;
    public temperature: number;
    public passable: boolean;

    constructor(public x: number, public y: number) { }
}
