import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 10,
    y: TILE_SIZE * 0,
    w: 360,
    h: 20,
    color: "trasparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('Fase02', {playerStart: { x: TILE_SIZE * 6, y: TILE_SIZE * 15}});
    }
}