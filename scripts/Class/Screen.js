class Screen {
    constructor({ map, playerStart, objects }) {
        this.map = map;
        this.playerStart = playerStart;
        this.objects = objects || [];
    }
}

export { Screen };