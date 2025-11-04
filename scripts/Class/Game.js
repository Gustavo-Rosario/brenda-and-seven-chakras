import { getCanvasContext } from "../utils/getCanvasContext.js";

class Game {


    constructor(sprites = []){
        const { canvas, context} = getCanvasContext();

        this.context = context;
        this.canvas = canvas;

        this.sprites = sprites;

    }

    /**
     * Loop de jogo
     * Atualiza os sprites e renderiza
     * 
    */
    gameLoop(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update(){
        // Atualiza os sprites
        this.sprites.forEach(sprite => sprite.update());
    }

    render(){
        // Limpa a tela
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Renderiza os sprites
        this.sprites.forEach(sprite => sprite.render());
    }

}

export { Game };