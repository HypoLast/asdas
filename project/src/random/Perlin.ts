/* tslint:disable no-bitwise */

import { MersenneTwister } from "./MersenneTwister";

export let seed = 1;
let p = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62,
63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103,
104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137,
138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154,
155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188,
189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205,
206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255,
];

let pCache = {};
export function setSeed(newSeed: number) {
    seed = newSeed;
    if (pCache[seed] !== undefined) p = pCache[seed];
    else {
        let mt = new MersenneTwister(seed);
        p = pCache[seed] = p.slice().sort((a, b) => a - b).sort((a, b) => mt.random() - 0.5);
    }
}

setSeed(1);

export function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
}

export function grad(hash: number, x: number, y: number, z: number) {
    let h = hash & 15;
    let u = h < 8 ? x : y;
    let v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function perlin3d(x: number, y: number, z: number) {
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    let Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    let u = fade(x);
    let v = fade(y);
    let w = fade(z);
    let A = p[X % 256] + Y;
    let AA = (p[A % 256] + Z) % 256;
    let AB = (p[(A + 1) % 256] + Z) % 256;
    let B = p[(X + 1) % 256] + Y;
    let BA = (p[B % 256] + Z) % 256;
    let BB = (p[(B + 1) % 256] + Z) % 256;

    return lerp(w, lerp(v, lerp(u, grad(p[AA    ], x    , y    , z    ),
                                   grad(p[BA    ], x - 1, y    , z    )),
                           lerp(u, grad(p[AB    ], x    , y - 1, z    ),
                                   grad(p[BB    ], x - 1, y - 1, z    ))),
                   lerp(v, lerp(u, grad(p[(AA + 1) % 256], x    , y    , z - 1),
                                   grad(p[(BA + 1) % 256], x - 1, y    , z - 1)),
                           lerp(u, grad(p[(AB + 1) % 256], x    , y - 1, z - 1),
                                   grad(p[(BB + 1) % 256], x - 1, y - 1, z - 1))));
}

export function perlin2d(x: number, y: number) {
    return perlin3d(x, y, seed / 1000);
}

export function composedPerlin2d(x: number, y: number, bands: number) {
    if (bands < 1) return 0;
    let tempSeed = seed;
    let mt = new MersenneTwister(seed);
    let v = 0;
    for (let i = 0; i < bands; i ++) {
        setSeed(mt.genrand_int32());
        v += perlin2d(x * (i + 1), y * (i + 1)) / (i + 1);
    }
    setSeed(tempSeed);
    return Math.min(0.9999999999999, Math.max(-1, v));
}

export function multiChannelPerlin2d(x: number, y: number, bands: number, channels: number, channelSizes?: number[]) {
    if (channels < 1) return [];
    let tempSeed = seed;
    let mt = new MersenneTwister(seed);
    let vs = [];
    if (channelSizes === undefined) channelSizes = [];
    while (channelSizes.length < channels) channelSizes.push(1);
    for (let i = 0; i < channels; i ++) {
        setSeed(mt.genrand_int32());
        vs.push(composedPerlin2d(x * channelSizes[i], y * channelSizes[i], bands));
    }
    setSeed(tempSeed);
    return vs;
}
