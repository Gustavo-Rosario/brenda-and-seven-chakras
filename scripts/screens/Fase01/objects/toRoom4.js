import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 15,
    y: TILE_SIZE * 27.5,
    w: 270,
    h: 70,
    color: "trasparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('Fase04', {playerStart: { x: TILE_SIZE * 8, y: TILE_SIZE * 0.7}});
    }
}