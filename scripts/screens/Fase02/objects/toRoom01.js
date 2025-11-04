import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 6,
    y: TILE_SIZE * 16.9,
    w: 300,
    h: 70,
    color: "trasparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('Fase01', {playerStart: { x: TILE_SIZE * 12, y: TILE_SIZE * 0.3 }});
    }
}