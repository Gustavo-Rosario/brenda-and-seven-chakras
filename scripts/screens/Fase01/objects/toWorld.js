import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: 5400,
    y: 320,
    w: 70,
    h: 270,
    color: "transparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('World', {playerStart: { x: TILE_SIZE * 2, y: TILE_SIZE * 29, direction: "R" }});
    }
}