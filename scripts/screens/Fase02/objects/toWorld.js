import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 72,
    y: TILE_SIZE * 5,
    w: 70,
    h: 350,
    color: "transparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('World', {playerStart: { x: TILE_SIZE * 2, y: TILE_SIZE * 19, direction: "R" }});
    }
}