import { baseInfo } from "../utils/baseInfo.js";
import { getPixelColor } from "../utils/getPixelColor.js";
import { Sprite } from "./Sprite.js";

class Character extends Sprite {
    constructor(x, y, width, height, color, debug = false) {
        super(x, y, width, height, color, debug);
        
        // Define velocidade de movimento
        this.runningBoost = baseInfo.RUNNING_SPEED;

        this.isPressed = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Run: false,
            Jump: false
        }

        this.isRunning = false; // Flag para verificar se o personagem está correndo
        this.isJumping = false; // Flag para verificar se o personagem está pulando
        this.isFalling = false; // Flag para verificar se o personagem está caindo
    }

    update() {

        // Verifica ações
        this._verifyActions();

        // Aplica gravidade
        if (!this.isGround()) {
            // Simula gravidade, ajustando a velocidade conforme necessário
            this.applyAcceleration(0, baseInfo.GRAVITY);
        }else{
            // Limpa a velocidade vertical quando está no chão
            if(this.speed.y > 0) this.speed.y = 0; // Reseta a velocidade vertical quando está no chão


            this.isGrounded = true;
            this.isJumping = false; // Reseta o estado de pulo quando está no chão
        }


        // Verifica colisão lateral
        this.verifyWall();

        // Aplica desaceleração para quando o botao é solto
        if (!this.isPressed.ArrowLeft && !this.isPressed.ArrowRight){
            if(this.speed.x < 0) {
                this.applyAcceleration(baseInfo.DESACELERATION, 0); // Desacelera na direção horizontal
            }else if(this.speed.x > 0){
                this.applyAcceleration(-baseInfo.DESACELERATION, 0); // Desacelera na direção horizontal
            }
        }

        // Limpa estado
        this.isRunning = false; // Reseta o estado de corrida
        this.isGrounded = false; // Reseta o estado de estar no chão
    }

    render() {
        // Calcula posição do personagem
        this.x += this.speed.x;
        this.y += this.speed.y;
        super.render(); // Chama o método render da classe base
    }

    // Auxiliar
    applyAcceleration(x, y) {
        let {x: [maxX, minX], y: [maxY, minY], WALK} = baseInfo.ACCELERATION_LIMIT;

        // Se não estiver correndo, limita a aceleração horizontal
        if(!this.isPressed.Run){
            maxX = WALK[0];
            minX = WALK[1];
        }
        // Aplica uma força ao personagem
        if(x > 0){
            this.speed.x = this.speed.x + x > maxX ? maxX : this.speed.x + x;
        }else if(x < 0){
            this.speed.x = this.speed.x + x < minX ? minX : this.speed.x + x;
        }

        if(y > 0){
            this.speed.y = this.speed.y + y > maxY ? maxY : this.speed.y + y;
        }else if(y < 0){
            this.speed.y = this.speed.y + y < minY ? minY : this.speed.y + y;
        }
    }

    verifyWall() {
        // Verifica colisão lateral
        const { TILEMAP, TILE_SIZE } = baseInfo;

        // Verifica se o personagem está sobre um tile sólido
        const isWall = this.isSolid(this.x, this.y) || this.isSolid(this.x + this.width, this.y) ||
        this.isSolid(this.x, this.y + this.height) || this.isSolid(this.x + this.width, this.y + this.height);

        if(isWall){
            this.speed.x = 0;
        }
    }

    verifyWallOld(){
        // Verifica lado esquerdo
        const leftColor = getPixelColor(this.x - 1, this.y + (this.height /2));
        const leftWall = leftColor.g > 100 && leftColor.r < 100 && leftColor.b < 100;

        if(leftWall && this.speed.x < 0){
            this.speed.x = 0;
            return;
        }

        const rightColor = getPixelColor(this.x + this.width + 1, this.y + (this.height /2));
        const rightWall = rightColor.g > 100 && rightColor.r < 100 && rightColor.b < 100;

        if(rightWall && this.speed.x > 0){
            this.speed.x = 0;
            return;
        }


    }

    // Ações
    Jump() {
        // Jump

        // Esta no ar
        if(this.isGround() || !this.isFalling) {
            // console.log("JUMP FORCE NO AR: ", this.speed.y, this.speed.y > -20);
            const jumpLimit = baseInfo.ACCELERATION_LIMIT.y[1] + 10; // Limite de aceleração vertical para pulo
            // console.log("JUMP Force: ", this.speed.y);
            // console.log("Jump Limit: ", jumpLimit);
            if(this.speed.y > jumpLimit) { 
                console.log("Pulando");
                // Calcula força do pulo
                this.applyAcceleration(0, -baseInfo.PLAYER_SPEED * 10); // Aplica uma força negativa na direção vertical
                this.isJumping = true;
                this.isFalling = false;
            }else if(this.speed.y <= jumpLimit ) {
                // Se já está pulando, não faz nada
                console.log("ATINGIU O LIMITE");
                this.isFalling = true; // Define que o personagem está caindo
            }
        }

        
    }
    ArrowDown() {
        // if(!this.isGround()){
        //     this.y += this.speed;
        // }
    }
    ArrowLeft() {
        this.applyAcceleration(-this.getFinalSpeed(), 0);
    }
    ArrowRight() {
        this.applyAcceleration(this.getFinalSpeed(), 0);
    }

    Run(){  
        console.log("Run");
        this.isRunning = true; // Define que o personagem está correndo
    }

    getFinalSpeed() {
        // Retorna a velocidade final do personagem
        const finalSpeed = this.isPressed.Run ? baseInfo.PLAYER_SPEED + this.runningBoost : baseInfo.PLAYER_SPEED;

        console.log(`Final Speed: ${finalSpeed}`);
        return finalSpeed;
    }

    _verifyActions(){
        if (this.isPressed.ArrowUp || this.isPressed.Jump) {
            this.Jump(); // Chama o método de pulo 
        }
        if (this.isPressed.ArrowDown) {
            this.ArrowDown(); // Chama o método de descida
        }
        if (this.isPressed.ArrowLeft) {
            this.ArrowLeft(); // Chama o método de movimento para a esquerda
        }
        if (this.isPressed.ArrowRight) {
            this.ArrowRight(); // Chama o método de movimento para a direita
        }

        if(this.isPressed.Run) {
            this.Run(); // Chama o método de corrida
        }
    }

    debugLog(){
        // console.log(`Spedd x: ${this.speed.x}, y: ${this.speed.y}`);
        // Exibir informações de debug
        // this.context.strokeStyle = 'red';
        // this.context.strokeRect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = 'red';
        this.context.fillText(`${this.isPressed.Run ? 'RUN' : 'WALK'} | x: ${this.x}, y: ${this.y}`, this.x, this.y - 10);
        this.context.fillText(`w: ${this.width}, h: ${this.height}`, this.x, this.y + this.height + 10); 

    }

}

export { Character };