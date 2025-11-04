import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 51.5,
    y: TILE_SIZE * 0,
    w: 50,
    h: 520,
    color: "transparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        alterarTela('Fase01', {playerStart: { x: TILE_SIZE * 2.5, y: TILE_SIZE * 9}});
    }
}