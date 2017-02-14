// calculates the proper positive modulo of m % n
export function pMod(m: number, n: number) {
    return ((m % n) + n) % n;
}
