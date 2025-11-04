import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: 5,
    y: TILE_SIZE * 11.5,
    w: 70,
    h: 270,
    color: "transparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('World', {playerStart: { x: TILE_SIZE * 85.5, y: TILE_SIZE * 28, direction: "L" }});
    }
}