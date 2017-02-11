let roguelike: Atlas;
let ice: Atlas;

export function Init() {
    roguelike = new Atlas("res/img/tiles/roguelikeSheet_transparent.png", 16, 1);
    ice = new Atlas("res/img/tiles/ice.png", 16, 0);
}

class Atlas {
    public texture: PIXI.Texture;

    constructor(public source: string, public size: number, public padding: number) {
        this.texture = PIXI.Texture.fromImage(source);
        this.texture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
}

class TilePool {
    public textureCache: PIXI.Texture[] = [];
    constructor(public map: number, public tiles: [number, number][]) { }
}

function pool(map: number, ...tiles: [number, number][]) {
    return new TilePool(map, tiles);
}

export function prand(x: number, y: number) {
    // tslint:disable-next-line:no-bitwise
    return Math.abs(Math.floor(Math.tan((x * 7817) % 6673) * 6337 % 7529 + Math.tan((y * 6337) % 7529) * 7817 % 6673)) % 1000;
}

export function getTileTexture(batch: keyof typeof tiles, x: number = 0, y: number = 0) {
    let pool = tiles[batch];
    let index = Math.abs(prand(x, y)) % pool.tiles.length;
    if (pool.textureCache[index] !== undefined) return pool.textureCache[index];
    let coords = pool.tiles[index];
    let atlas: Atlas;
    switch (pool.map) {
       case 0: atlas = roguelike; break;
       case 1: atlas = ice; break;
       default: throw "no such atlas";
    }

    let texture = new PIXI.Texture(atlas.texture, new PIXI.Rectangle(coords[0] * (atlas.size + atlas.padding),
                                                                     coords[1] * (atlas.size + atlas.padding),
                                                                     atlas.size, atlas.size));
    pool.textureCache[index] = texture;
    return texture;
}

// tslint:disable:object-literal-sort-keys
export const tiles = {
    grass: pool(0, [5, 0], [5, 1]),
    sand: pool(0, [8, 0], [8, 1]),
    water: pool(0, [0, 0], [1, 0]),
    treeBase: pool(0, [13, 11], [16, 11]),
    hotTreeBase: pool(0, [14, 11], [17, 11]),
    coldTreeBase: pool(0, [15, 11], [18, 11]),
    treeTop: pool(0, [13, 10], [16, 10]),
    hotTreeTop: pool(0, [14, 10], [17, 10]),
    coldTreeTop: pool(0, [15, 10], [18, 10]),

    snow: pool(1, [8, 5]),
    ice: pool(1, [6, 8]),
    snowTreeBase: pool(1, [0, 6], [1, 6]),
    snowTreeTop: pool(1, [0, 5], [1, 5]),
};
