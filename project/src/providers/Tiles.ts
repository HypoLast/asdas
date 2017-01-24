let size = 16;
let padding = 1;
let roguelike: PIXI.Texture;

export function Init() {
    roguelike = PIXI.Texture.fromImage("/res/img/roguelikeSheet_transparent.png");
}

export function getTile(tilePool: TilePool) {
    return new PIXI.Texture(roguelike);
}

class TilePool {
    public textureCache: PIXI.Texture[] = [];
    constructor(public tiles: [number, number][]) { }
}

function pool(...tiles: [number, number][]) {
    return new TilePool(tiles);
}

export function prand(x: number, y: number) {
    // tslint:disable-next-line:no-bitwise
    return Math.floor(Math.tan((x * 7817) % 6673) + Math.tan((y * 6337) % 7529)) ^ (x * y);
}

export function getTileTexture(batch: keyof typeof tiles, x: number = 0, y: number = 0) {
    let pool = tiles[batch];
    let index = Math.abs(prand(x, y)) % pool.tiles.length;
    if (pool.textureCache[index] !== undefined) return pool.textureCache[index];
    let coords = pool.tiles[index];
    let texture = new PIXI.Texture(roguelike, new PIXI.Rectangle(coords[0] * (size + padding),
                                                                 coords[1] * (size + padding),
                                                                 size, size));
    pool.textureCache[index] = texture;
    return texture;
}

const tiles = {
    grass: pool([5, 0], [5, 1]),
    water: pool([0, 0], [1, 0]),
};
