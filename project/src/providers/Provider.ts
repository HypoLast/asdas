function always(...rest: any[]) { return true; };

export class Provider<I> {

    private callbacks: { condition: (o: I) => boolean, action: (o: I) => any }[] = [];

    public do(fn: (o: I) => any, when?: (o: I) => boolean) {
        this.callbacks.push({ condition: when || always, action: fn });
    }

    public dont(fn: (o: I) => any) {
        this.callbacks = this.callbacks.filter((c) => c.action !== fn);
    }

    public removeAllSubscribers() {
        this.callbacks = [];
    }

    public provide(resource: I) {
        this.callbacks.forEach((c) => { if (c.condition(resource)) c.action(resource); });
    }

}
