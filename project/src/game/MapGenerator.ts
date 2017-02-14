import * as dimensions from "../const/dimensions";
import { pMod } from "../math";
import { getTileTexture, prand, tiles } from "../providers/Tiles";
import { MersenneTwister } from "../random/MersenneTwister";
import * as perlin from "../random/Perlin";

type FeatureType = "none" | "hotTree" | "coldTree" | "tree" | "snowTree";

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

    private passiveLoadTimer: NodeJS.Timer;
    private passiveUnloadTimer: NodeJS.Timer;

    constructor(public seed: number) {
        let mt = new MersenneTwister(this.seed);
        this.rootSeed = mt.genrand_int32();

        this.passiveLoadTimer = setInterval(() => this.passiveLoadStep(), 5);
        // this.passiveUnloadTimer = setInterval(() => this.unloadOutOfRangeBlocks(), 5000);
    }

    public dispose() {
        clearInterval(this.passiveLoadTimer);
        clearInterval(this.passiveUnloadTimer);
    }

    public getBlock(x: number, y: number) {
        let blockName = x + "," + y;
        let block = this.loadedBlocks[blockName] || new Block(x, y);
        perlin.setSeed(this.rootSeed);
        for (block.loaded; block.loaded < dimensions.BLOCK_WIDTH; block.loaded ++) {
            block.tiles[block.loaded] = this.getBlockColumn(x, y, block.loaded);
        }
        this.loadedBlocks[blockName] = block;
        block.resolve();
        return block;
    }

    public unloadOutOfRangeBlocks() {
        for (let blockName in this.loadedBlocks) {
            if (!this.loadedBlocks.hasOwnProperty(blockName)) continue;
            let [x, y] = blockName.split(",").map((e) => parseInt(e, 10));
            let dx = x - this.spiralCenter.x;
            let dy = y - this.spiralCenter.y;
            if (Math.sqrt(dx * dx + dy * dy) > 40) {
                delete this.loadedBlocks[blockName];
            }
        }
    }

    public getCell(x: number, y: number) {
        let blockX = Math.floor(x / dimensions.BLOCK_WIDTH);
        let blockY = Math.floor(y / dimensions.BLOCK_HEIGHT);
        let blockName = blockX + "," + blockY;
        if (this.loadedBlocks[blockName] !== undefined) {
            let block = this.loadedBlocks[blockName];
            let cellX = pMod(x, dimensions.BLOCK_WIDTH);
            let cellY = pMod(y, dimensions.BLOCK_HEIGHT);
            if (block.loaded > cellX) {
                return block.tiles[cellX][cellY];
            }
        }
        return new Cell(x, y, this.getCellParameters(x, y));
    }

    public getCellParameters(x: number, y: number) {
        let blockX = Math.floor(x / dimensions.BLOCK_WIDTH);
        let blockY = Math.floor(y / dimensions.BLOCK_HEIGHT);
        let blockName = blockX + "," + blockY;
        if (this.loadedBlocks[blockName] !== undefined) {
            let block = this.loadedBlocks[blockName];
            let cellX = pMod(x, dimensions.BLOCK_WIDTH);
            let cellY = pMod(y, dimensions.BLOCK_HEIGHT);
            if (block.loaded > cellX) {
                return block.tiles[cellX][cellY].params;
            }
        }
        return perlin.multiChannelPerlin2d(x / 80, y / 80, 3, 3, [1, 3 / 13, 5 / 43]);
    }

    public getBlockColumn(x: number, y: number, col: number) {
        perlin.setSeed(this.rootSeed);
        let tiles = [];
        for (let j = 0; j < dimensions.BLOCK_HEIGHT; j ++) {
            let X = x * dimensions.BLOCK_WIDTH + col;
            let Y = y * dimensions.BLOCK_HEIGHT + j;
            // tiles[j] = new Cell(X, Y, perlin.multiChannelPerlin2d(X / 30, Y / 30, 3, 2, [1, 1 / 6]));
            tiles[j] = this.getCell(X, Y);
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
        } while (this.spiralStep < 400 && this.loadedBlocks[blockName] !== undefined && this.loadedBlocks[blockName].loaded >= dimensions.BLOCK_WIDTH);
        if (this.spiralStep >= 400) return;
        if (this.loadedBlocks[blockName] === undefined) this.loadedBlocks[blockName] = new Block(X, Y);
        let block = this.loadedBlocks[blockName];
        block.tiles[block.loaded] = this.getBlockColumn(X, Y, block.loaded);
        block.loaded ++;
        if (block.loaded >= dimensions.BLOCK_WIDTH) {
            console.log("loaded block " + blockName);
            // renderlayers are going to be non-trivial to get, hold off on this
            // let dummy = block.renderLayer; // for caching so that we aren't drawing a bunch of renderlayers at once
        }
    }

}

// tslint:disable-next-line:max-classes-per-file
export class Block {
    public tiles: Cell[][] = [];
    public loaded = 0;

    private layers: [PIXI.Container, PIXI.Container];

    constructor(public x: number, public y: number) { }

    public get renderLayers(): [PIXI.Container, PIXI.Container] {
        if (this.layers !== undefined) return this.layers;
        this.layers = [new PIXI.Container(), new PIXI.Container()];
        for (let i = 0; i < dimensions.BLOCK_WIDTH; i ++) {
            for (let j = 0; j < dimensions.BLOCK_HEIGHT; j ++) {
                let tileSprite = this.tiles[i][j].getTileSprite();
                tileSprite.x = i * dimensions.TILE_WIDTH;
                tileSprite.y = j * dimensions.TILE_WIDTH;
                this.layers[0].addChild(tileSprite);

                let tileOverhead = this.tiles[i][j].getTileOverhead();
                if (tileOverhead) {
                    tileOverhead.x = i * dimensions.TILE_WIDTH;
                    tileOverhead.y = j * dimensions.TILE_HEIGHT;
                    this.layers[1].addChild(tileOverhead);
                }
            }
        }
        return this.layers;
    }

    public resolve() {
        // 
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Cell {
    public type: keyof typeof tiles = "water";
    public elevation: number = 0;
    public temperature: number = 0;
    public passable: boolean = false;
    public feature: FeatureType = "none";

    constructor(public x: number, public y: number, public params: number[]) {
        [this.elevation, this.temperature] = params;
        this.eval();
    }

    public eval() {
        if (this.elevation < -0.3) {
            this.type = "water";
        } else if (this.elevation < -0.20) {
            this.type = "sand";
        } else {
            this.type = "grass";
        }

        if (this.type === "water" && this.temperature > 0.5 && this.elevation > -this.temperature) {
            this.type = "sand";
        }

        if (this.type === "water") {
            this.passable = false;
        } else {
            this.passable = true;
        }

        let mt = new MersenneTwister(prand(this.x, this.y));

        if (this.type === "grass" && mt.random() * 0.05 + 0.5 < this.temperature) {
            this.type = "sand";
        }

        if (mt.random() * 0.05 - 0.5 > this.temperature) {
            if (this.type === "grass" || this.type === "sand") {
                this.type = "snow";
            }
            if (this.type === "water") {
                this.type = "ice";
                this.passable = true;
            }
        }

        if (this.elevation > 0 &&
                mt.random() * (14 - this.elevation * 12) < -Math.abs((this.temperature + 0.9) / 1.6 * 2 - 1) + 1) {
            this.passable = false;
            if (this.type === "sand") {
                this.feature = "hotTree";
            } else if (this.type === "snow") {
                this.feature = "snowTree";
            } else {
                let rnd = mt.random() + (this.temperature + 0.4) / 1.4;
                if (rnd < 0.4) this.feature = "coldTree";
                else if (rnd < 1.4) this.feature = "tree";
                else this.feature = "hotTree";
            }
        }
    }

    public getTileSprite() {
        let sprite = new PIXI.Sprite(getTileTexture(this.type, this.x, this.y));
        sprite.width = dimensions.TILE_WIDTH;
        sprite.height = dimensions.TILE_HEIGHT;
        if (this.feature === "tree" || this.feature === "hotTree" || this.feature === "coldTree" || this.feature === "snowTree") {
            sprite.addChild(new PIXI.Sprite(getTileTexture(<keyof typeof tiles> (this.feature + "Base"), this.x, this.y)));
        }
        return sprite;
    }

    public getTileOverhead(): PIXI.Sprite | undefined {
        if (this.feature === "none") return;
        let sprite = new PIXI.Sprite();
        if (this.feature === "tree" || this.feature === "hotTree" || this.feature === "coldTree" || this.feature === "snowTree") {
            let treetop = new PIXI.Sprite(getTileTexture(<keyof typeof tiles> (this.feature + "Top"), this.x, this.y));
            treetop.width = dimensions.TILE_WIDTH;
            treetop.height = dimensions.TILE_HEIGHT;
            treetop.y = -dimensions.TILE_HEIGHT;
            sprite.addChild(treetop);
        }
        return sprite;
    }
}
