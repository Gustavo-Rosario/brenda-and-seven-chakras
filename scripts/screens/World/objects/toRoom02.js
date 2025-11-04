import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 0,
    y: TILE_SIZE * 15.5,
    w: 70,
    h: 350,
    color: "transparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('Fase02', {playerStart: { x: TILE_SIZE * 70, y: TILE_SIZE * 8, direction: "L" }});
    }
}