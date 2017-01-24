import nwgui = require("nw.gui");

let myWindow: NWJS_Helpers.win;
let myRenderer: PIXI.SystemRenderer;
let myStage: PIXI.Container;

export function Init(window: NWJS_Helpers.win, renderer: PIXI.SystemRenderer, stage: PIXI.Container) {
    myWindow = window;
    myRenderer = renderer;
    myStage = stage;
}

export function stage() {
    return myStage;
}

export function renderer() {
    return myRenderer;
}

export function window() {
    return myWindow;
}
