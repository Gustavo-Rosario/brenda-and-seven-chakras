const TILE_SIZE = 75;
const SPRITE_SHEET_SIZE = 32 * 5;
export default {
    x: TILE_SIZE * 59,
    y: TILE_SIZE * 26.8,
    w: 200,
    h: 200,
    color: "transparent",
    isSolid: true,
    condition: (player) => !player.keys.green || !player.keys.blue || !player.keys.red || !player.keys.yellow,
    sprite: {
        src: "../assets/imgs/general.png", // Caminho para a imagem do sprite
        width: SPRITE_SHEET_SIZE,
        height: SPRITE_SHEET_SIZE,
        cutH: SPRITE_SHEET_SIZE * 2,
        cutW: SPRITE_SHEET_SIZE * 0,
        frame: 0, // Quadro atual do sprite
        frameMax: 1, // Total de quadros do sprite
        frameTime: 0, // Tempo por quadro (em frames de jogo)
        frameCounter: 0 // Contador de tempo para animação
    },
    onTouch: function(player) {
        // if(player.keys.green
        //     && player.keys.blue
        //     && player.keys.red
        //     && player.keys.yellow
        // ){
        //     this.isSolid = false;
        // }else{
        //     this.isSolid = true;
        // }
        // alterarTela('Fase01', {playerStart: { x: TILE_SIZE * 71, y: TILE_SIZE * 6.2, direction: "L" }});
        // this.x = -1500; // Move o item para fora da tela
    }
}