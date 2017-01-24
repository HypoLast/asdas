export abstract class GameComponent {
    constructor(public spriteLayer: PIXI.Container, public backgroundLayer: PIXI.Container) { }

    public abstract tick(): void;
    public abstract render(): void;
}
