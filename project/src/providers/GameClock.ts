import { Provider } from "./Provider";

let timer: NodeJS.Timer;
let myProvider: Provider<Tick>;
let startTime: number;

export function Init(fps: number) {
    if (myProvider !== undefined) throw new Error("Already initialized");
    myProvider = new Provider();
    startTime = Date.now();
    let lastTime = Date.now();
    timer = setInterval(() => {
        let time = Date.now();
        let dt = time - lastTime;
        lastTime = time;
        provider().provide({ time: time - startTime, dt });
    }, 1000 / fps);
}

export function provider() {
    return myProvider;
}

export interface Tick {
    time: number;
    dt: number;
}
