import { alterarTela } from "../../../utils/eventBus.js";
const TILE_SIZE = 75;
export default {
    x: TILE_SIZE * 0,
    y: TILE_SIZE * 27.75,
    w: 70,
    h: 190,
    color: "transparent",
    onTouch: function(player) {
        alterarTela('Fase01', {playerStart: { x: TILE_SIZE * 71, y: TILE_SIZE * 6.2, direction: "L" }});
        // this.x = -1500; // Move o item para fora da tela
    }
}