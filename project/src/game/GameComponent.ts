export interface GameComponent {
    renderLayer: PIXI.Container;

    tick(): void;
    render(): void;
}
