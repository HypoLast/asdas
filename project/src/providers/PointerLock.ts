import * as Mouse from "./Mouse";
import { Provider } from "./Provider";
import * as Stage from "./Stage";

let myProvider: Provider<PointerMovement>;
let locked = false;
let lockPointerOnFocus: () => void;
let myBounds: { width: number, height: number };
let simulatedPointerPosition: Mouse.IPoint;
let myElement: Element;
let updateCB: (e: MouseEvent) => void;

export function Init(bounds: { width: number, height: number }) {
    if (myProvider !== undefined) throw new Error("Already initialized");
    myProvider = new Provider();
    myBounds = { width: bounds.width, height: bounds.height };
}

export function lock(element: Element) {
    if (locked) throw new Error("Pointer already locked");
    locked = true;
    myElement = element;
    element.requestPointerLock();
    lockPointerOnFocus = () => {
        element.requestPointerLock();
    };
    Stage.window().on("focus", lockPointerOnFocus);
    simulatedPointerPosition = Mouse.position();
    element.addEventListener("mousemove", updateCB = (e: MouseEvent) => {
        simulatedPointerPosition.x += e.movementX;
        simulatedPointerPosition.y += e.movementY;
        if (simulatedPointerPosition.x < 0) simulatedPointerPosition.x = 0;
        if (simulatedPointerPosition.x > myBounds.width) simulatedPointerPosition.x = myBounds.width;
        if (simulatedPointerPosition.y < 0) simulatedPointerPosition.y = 0;
        if (simulatedPointerPosition.y > myBounds.height) simulatedPointerPosition.y = myBounds.height;
        myProvider.provide({
            movement: { x: e.movementX, y: e.movementY },
            position: {
                x: simulatedPointerPosition.x,
                y: simulatedPointerPosition.y,
            },
        });
    });
    myProvider.provide({
        movement: { x: 0, y: 0 },
        position: {
            x: simulatedPointerPosition.x,
            y: simulatedPointerPosition.y,
        },
    });
}

export function unlock() {
    if (!locked) return;
    locked = false;
    myElement.removeEventListener("mousemove", updateCB);
    window.document.exitPointerLock();
    Stage.window().removeListener("focus", lockPointerOnFocus);
}

export function isLocked() {
    return locked;
}

export function isLockActive() {
    return window.document.pointerLockElement === myElement;
}

export function provider() {
    return myProvider;
}

export interface PointerMovement {
    movement: Mouse.IPoint;
    position: Mouse.IPoint;
}
