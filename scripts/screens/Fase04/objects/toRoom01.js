import { alterarTela } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 6.9,
    y: TILE_SIZE * 0,
    w: 270,
    h: 50,
    color: "transparent",
    onTouch: function(player) {
        // Volta para mapa do mundo
        // player.vy = -20;
        alterarTela('Fase01', {playerStart: { x: TILE_SIZE * 15, y: TILE_SIZE * 25}});
    }
}