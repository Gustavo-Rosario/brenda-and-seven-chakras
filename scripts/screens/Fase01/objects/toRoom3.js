import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 0,
    y: TILE_SIZE * 6.1,
    w: 70,
    h: 320,
    color: "trasparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('Fase03', {playerStart: { x: TILE_SIZE * 50, y: TILE_SIZE * 3}});
    }
}