import * as nwgui from "nw.gui";
import * as dimensions from "./const/dimensions";
import * as Keycodes from "./const/Keycodes";
import * as debug from "./debug/debug";
import * as GameClock from "./providers/GameClock";
import * as Keyboard from "./providers/Keyboard";
import * as Mouse from "./providers/Mouse";
import * as PointerLock from "./providers/PointerLock";
import * as Stage from "./providers/Stage";
import * as Tiles from "./providers/Tiles";

import { Game } from "./game/Game";

// tslint:disable-next-line:interface-name
interface Window extends NWJS_Helpers.win {
    reload: (arg?: number) => void;
}

function main() {
    let win = <Window> nwgui.Window.get();

    // win.enterFullscreen();
    let renderer: PIXI.SystemRenderer = new PIXI.WebGLRenderer(dimensions.WIDTH,
                                                               dimensions.HEIGHT,
                                                               { backgroundColor : 0x1099bb });
    renderer.view.classList.add("scaling");
    renderer.view.id = "stage";
    (document.querySelector("#canvas-screen") || new Element()).appendChild(renderer.view);
    let stage: PIXI.Container = new PIXI.Container();
    // win.addListener("focus", e => renderer.view.requestPointerLock());
    // renderer.view.requestPointerLock();
    // renderer.view.addEventListener("mousemove", e => console.log(e.movementX, e.movementY));

    Mouse.Init(window, renderer.view);
    GameClock.Init(30);
    Keyboard.Init(document.body);
    PointerLock.Init({ width: dimensions.WIDTH, height: dimensions.HEIGHT });
    Stage.Init(win, renderer, stage);
    Tiles.Init();

    // global hotkeys
    // escape closes the window
    Keyboard.provider().do(() => win.close(), (key) => key.pressed && key.keyCode === Keycodes.ESCAPE);
    // F12 opens dev tools
    Keyboard.provider().do(() => win.showDevTools(), (key) => key.pressed && key.keyCode === Keycodes.F12);
    // F11 reloads the window
    Keyboard.provider().do(() => win.reload(3), (key) => !key.pressed && key.keyCode === Keycodes.F11);
    // ALT + F toggles fullscreen
    Keyboard.provider().do(() => win.toggleFullscreen(), (key) => key.pressed && key.keyCode === Keycodes.F &&
                                                                Keyboard.isKeyDown(Keycodes.ALT));
    let debugVisible = true;
    // F10 toggles debug info
    Keyboard.provider().do(() => (<HTMLParagraphElement> document.querySelector("#info")).style.visibility =
                                                            (debugVisible = !debugVisible) ? "visible" : "hidden",
        (key) => key.pressed && key.keyCode === Keycodes.F10);
    // F9 toggles pointerlock
    // Keyboard.provider().do(() => document.pointerLockElement === renderer.view ?
    //                                             document.exitPointerLock() : renderer.view.requestPointerLock(),
    //     (key) => key.pressed && key.keyCode === Keycodes.F9);

    let game = new Game();
    stage.addChild(game.display);

    // frame rendering uses requestAnimationFrame for acceleration
    let frameTimes: number[] = [];
    let tick: () => void;
    requestAnimationFrame(tick = () => {
        frameTimes.push(Date.now());
        game.render();
        renderer.render(stage);
        requestAnimationFrame(tick);
    });

    // game timer uses setInterval for data manipulation and standard code execution
    let tickTimes: number[] = [];
    let total = 0;
    GameClock.provider().do((f) => {
        if (!f) return;
        tickTimes.push(f.dt);
        total += f.dt;
        if (tickTimes.length > 30) total -= tickTimes.shift();
        let time = Date.now();
        while (frameTimes[0] < time - 1000) frameTimes.shift();
        let tpsInv = total / tickTimes.length;
        debug.update((1 / (tpsInv / 1000)).toFixed(0) + " TPS\n" +
                    frameTimes.length + " FPS");
    });

}
