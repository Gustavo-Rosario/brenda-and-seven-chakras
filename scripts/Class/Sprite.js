import { baseInfo } from "../utils/baseInfo.js";
import { getCanvasContext } from "../utils/getCanvasContext.js";
import { getPixelColor } from "../utils/getPixelColor.js";

class Sprite {
    constructor(x, y, width, height, color, debug = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.debug = debug;

        this.mass = 1; // Massa do personagem, pode ser usada para calcular a força do pulo
        this.speed = {
            x: 0,
            y: 0
        };

        this.isGrounded = false; // Flag para verificar se o personagem está no chão

        const { canvas, context} = getCanvasContext();

        this.canvas = canvas;
        this.context = context;
    }

    update() {
        // Aplica gravidade
        if (!this.isGround()) {
            this.speed.y += baseInfo.GRAVITY; // Simula gravidade, ajustando a velocidade conforme necessário
        }else{
            this.isGrounded = true;
        }
    }

    render() {
        // Constroi sprite
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);

        if(this.debug) this.debugLog();
    }

    debugLog() {
        // Exibir informações de debug
        this.context.strokeStyle = 'black';
        this.context.strokeRect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = 'black';
        this.context.fillText(`x: ${this.x}, y: ${this.y}`, this.x, this.y - 10);
        this.context.fillText(`w: ${this.width}, h: ${this.height}`, this.x, this.y + this.height + 10);
    }

    isGround(){
        // Verifica se o personagem está no chão
        const { TILEMAP, TILE_SIZE } = baseInfo;

        // Verifica se o personagem está sobre um tile sólido
        const tileX = Math.floor(this.x / TILE_SIZE);
        const tileY = Math.floor((this.y + this.height) / TILE_SIZE);

        if (tileY < 0 || tileY >= TILEMAP.length || tileX < 0 || tileX >= TILEMAP[tileY].length) {
            return false; // Fora dos limites do mapa
        }

        return TILEMAP[tileY][tileX] === 1; // Retorna true se o tile for sólido (1)
    }

    isGroundOld(){
        // Verifica se o personagem está no chão
        
        // Inicio do personagem
        const colorStart = getPixelColor(this.x, this.y + this.height + 1); // Obtém a cor do pixel logo abaixo do personagem
        const isGreenS = colorStart.g > 100 && colorStart.r < 100 && colorStart.b < 100; // Verifica se a cor é verde (chão)
        // Meio do personagem
        const colorMid = getPixelColor(this.x + (this.width / 2), this.y + this.height + 1); // Obtém a cor do pixel logo abaixo do personagem
        const isGreenM = colorMid.g > 100 && colorMid.r < 100 && colorMid.b < 100; // Verifica se a cor é verde (chão)
        // Fim do personagem
        const colorEnd = getPixelColor(this.x + this.width - 1, this.y + this.height + 1); // Obtém a cor do pixel logo abaixo do personagem
        const isGreenE = colorEnd.g > 100 && colorEnd.r < 100 && colorEnd.b < 100; // Verifica se a cor é verde (chão)

        return isGreenS || isGreenM || isGreenE;
    }

    isSolid(x, y) {
        const { TILEMAP, TILE_SIZE } = baseInfo;

        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        return TILEMAP[tileY]?.[tileX] === 1;
    }

}

export { Sprite };