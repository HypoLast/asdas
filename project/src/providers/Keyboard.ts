import { Provider } from "./Provider";

let keys: boolean[] = [];
let myProvider: Provider<KeyObject>;

export function Init(screen: HTMLElement) {
    if (myProvider) throw new Error("Keyboard already initialized");
    myProvider = new Provider();
    screen.addEventListener("keydown", handleKeyDown);
    screen.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e: KeyboardEvent) {
    keys[e.keyCode] = true;
    provider().provide({
        keyCode: e.keyCode,
        pressed: true,
    });
}

function handleKeyUp(e: KeyboardEvent) {
    keys[e.keyCode] = false;
    provider().provide({
        keyCode: e.keyCode,
        pressed: false,
    });
}

export function isKeyDown(keycode: number) {
    return keys[keycode] || false;
}

export function provider() {
    return myProvider;
}

export interface KeyObject {
    pressed: boolean;
    keyCode: number;
}
