import { Provider } from "./Provider";

export interface IPoint {
    x: number;
    y: number;
}

let clicks: boolean[] = [];
let mouse: MouseState = { buttons: [], position: { x: 0, y: 0 } };
let myProvider: Provider<MouseObject>;
let myScreen: HTMLCanvasElement;

export function Init(window: Window, screen: HTMLCanvasElement) {
    if (myProvider !== undefined) throw new Error("Already initialized");
    myProvider = new Provider();
    myScreen = screen;
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousewheel", handleMouseWheel);
}

function getRelativePosition(p: IPoint): IPoint {
    let rect = myScreen.getBoundingClientRect();
    return {
        x: (p.x - rect.left) / (rect.width / myScreen.width),
        y: (p.y - rect.top) / (rect.height / myScreen.height),
    };
}

function handleMouseDown(e: MouseEvent) {
    let adjPos = getRelativePosition(e);
    mouse.buttons[e.button] = true;
    provider().provide({ position: adjPos, state: MOUSE_DOWN, button: e.button });
}

function handleMouseUp(e: MouseEvent) {
    let adjPos = getRelativePosition(e);
    mouse.buttons[e.button] = false;
    provider().provide({ position: adjPos, state: MOUSE_UP, button: e.button });
}

function handleMouseMove(e: MouseEvent) {
    let adjPos = getRelativePosition(e);
    mouse.position = adjPos;
    provider().provide({ position: adjPos, state: MOUSE_MOVE });
}

function handleMouseWheel(e: WheelEvent) {
    let adjPos = getRelativePosition(e);
    mouse.position = adjPos;
    provider().provide({ position: adjPos, state: MOUSE_WHEEL, scrollOffset: e.deltaY });
}

export function provider() {
    return myProvider;
}

export function isButtonDown(button: number) {
    return mouse.buttons[button] || false;
}

export function position() {
    return { x: mouse.position.x, y: mouse.position.y };
}

export const MOUSE_MOVE = "MOUSE_MOVE";
export const MOUSE_UP = "MOUSE_UP";
export const MOUSE_DOWN = "MOUSE_DOWN";
export const MOUSE_WHEEL = "MOUSE_WHEEL";

export const LEFT_BUTTON = 0;
export const MIDDLE_BUTTON = 1;
export const RIGHT_BUTTON = 2;

export interface MouseState {
    buttons: boolean[];
    position: IPoint;
}

export interface MouseObject {
    position: IPoint;
    state: string;
    button?: number;
    scrollOffset?: number;
}
