import * as dimensions from "../const/dimensions";
import { getTileTexture, tiles } from "../providers/Tiles";
import { MersenneTwister } from "../random/MersenneTwister";
import * as perlin from "../random/Perlin";

function spiral(n: number): [number, number] {
    let k = Math.ceil((Math.sqrt(n) - 1) / 2);
    let t = 2 * k + 1;
    let m = t * t;
    t --;
    if (n >= m - t) return [k - (m - n), -k];
    m -= t;
    if (n >= m - t) return [-k, -k + (m - n)];
    m -= t;
    if (n >= m - t) return [-k + (m - n), k];
    return [k, k - (m - n - t)];
}

export class MapGenerator {

    public loadedBlocks: {[blockCoord: string]: Block} = {};

    private spiralStep: number = 1;
    private spiralCenter = { x: 0, y: 0 };
    private rootSeed: number;

    constructor(public seed: number) {
        let mt = new MersenneTwister(this.seed);
        this.rootSeed = mt.genrand_int32();
    }

    public getBlock(x: number, y: number) {
        let blockName = x + "," + y;
        if (this.loadedBlocks[blockName] !== undefined) return this.loadedBlocks[blockName];
        perlin.setSeed(this.rootSeed);
        let block = new Block(x, y);
        for (let i = 0; i < dimensions.BLOCK_WIDTH; i ++) {
            block.tiles[i] = this.getBlockColumn(x, y, i);
        }
        block.loaded = dimensions.BLOCK_HEIGHT;
        this.loadedBlocks[blockName] = block;
        return block;
    }

    public getBlockColumn(x: number, y: number, col: number) {
        perlin.setSeed(this.rootSeed);
        let tiles = [];
        for (let j = 0; j < dimensions.BLOCK_HEIGHT; j ++) {
            let X = x * dimensions.BLOCK_WIDTH + col;
            let Y = y * dimensions.BLOCK_HEIGHT + j;
            let cell = new Cell(X, Y);
            let [elevation, temperature] = perlin.multiChannelPerlin2d(X / 30, Y / 30, 3, 2, [1, 1 / 6]);
            if (elevation < -0.4) cell.type = "water";
            else if (elevation < -0.1) cell.type = "sand";
            else cell.type = "grass";
            cell.elevation = elevation;
            cell.temperature = temperature;
            cell.passable = cell.type !== "water";
            tiles[j] = cell;
        }
        return tiles;
    }

    public setCenter(x: number, y: number) {
        this.spiralStep = 1;
        this.spiralCenter = { x, y };
    }

    public passiveLoadStep() {
        let offX: number;
        let offY: number;
        let X: number;
        let Y: number;
        let blockName: string;
        this.spiralStep --;
        do {
             this.spiralStep ++;
             [offX, offY] = spiral(this.spiralStep);
             X = this.spiralCenter.x + offX;
             Y = this.spiralCenter.y + offY;
             blockName = X + "," + Y;
        } while (this.spiralStep < 50 && this.loadedBlocks[blockName] !== undefined && this.loadedBlocks[blockName].loaded === dimensions.BLOCK_HEIGHT);
        if (this.loadedBlocks[blockName] === undefined) this.loadedBlocks[blockName] = new Block(X, Y);
        let block = this.loadedBlocks[blockName];

    }

}

// tslint:disable-next-line:max-classes-per-file
export class Block {
    public tiles: Cell[][] = [];
    public loaded = 0;

    private layer: PIXI.Container;

    constructor(public x: number, public y: number) { }

    public get renderLayer(): PIXI.Container {
        if (this.layer !== undefined) return this.layer;
        this.layer = new PIXI.Container();
        for (let i = 0; i < dimensions.BLOCK_WIDTH; i ++) {
            for (let j = 0; j < dimensions.BLOCK_HEIGHT; j ++) {
                let tileSprite = new PIXI.Sprite(getTileTexture(this.tiles[i][j].type,
                                                                i + this.x * dimensions.BLOCK_WIDTH,
                                                                j + this.y * dimensions.BLOCK_HEIGHT));
                tileSprite.width = dimensions.TILE_WIDTH + 2;
                tileSprite.height = dimensions.TILE_HEIGHT + 2;
                tileSprite.x = i * dimensions.TILE_WIDTH;
                tileSprite.y = j * dimensions.TILE_HEIGHT;
                this.layer.addChild(tileSprite);
            }
        }
        return this.layer;
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
