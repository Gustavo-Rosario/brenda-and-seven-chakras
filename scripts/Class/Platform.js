import { Sprite } from "./Sprite.js";

class Platform extends Sprite {
    constructor(x, y, width, height, color, debug = false) {
        super(x, y, width, height, color, debug);
    }

    update() {
        // Update logic for the sprite
    }

    render() {
        // Constroi sprite
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export { Platform };