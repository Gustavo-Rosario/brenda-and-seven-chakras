class Controller {

    constructor(target = null) {
        this.target = target; // Alvo do controle

        this.keyPressed = {}; // Armazena as teclas pressionadas

        this.allowedActions = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Space', 'Enter', 'Run', 'Jump']; // Ações permitidas
    }

    setTarget(target){
        this.target = target;
    }

    /**
     * Inicia o controle de eventos do jogo
     */
    start(){
        window.addEventListener('keydown', (event) => {
            const action = event.key;

            // this.keyPressed[action] = true; // Marca a tecla como pressionada

            // Verifica se a ação é permitida
            if (this.allowedActions.includes(action)) {
                // Se houver um alvo, chama o método de ação correspondente
                if (this.target && this.target.isPressed && this.target.isPressed[action] !== undefined) {
                    this.target.isPressed[action] = true;
                } else {
                    console.warn(`Ação "${action}" não está definida no alvo.`);
                }
            } else {
                console.warn(`Ação "${action}" não é permitida.`);
            }
        });

        window.addEventListener('keyup', (event) => {
            const action = event.key;

            // this.keyPressed[action] = false; // Marca a tecla como não pressionada

            // Verifica se a ação é permitida
            if (this.allowedActions.includes(action)) {
                if (this.target && this.target.isPressed && this.target.isPressed[action] !== undefined) {
                    this.target.isPressed[action] = false;
                } else {
                    console.warn(`Ação "${action}" não está definida no alvo.`);
                }
            } else {
                console.warn(`Ação "${action}" não é permitida.`);
            }
        });



        window.addEventListener("gamepadconnected", (event) => {
            console.log("Controle conectado:", event.gamepad);
            this.startGamepadPolling();
        });
          
        window.addEventListener("gamepaddisconnected", (event) => {
            console.log("Controle desconectado:", event.gamepad);
        });
          
        
    }

    startGamepadPolling() {
        const _this = this;
        function checkGamepad() {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        
            for (let gp of gamepads) {
            if (!gp) continue;
        
                for (let index = 0; index < gp.buttons.length; index++){
                    const button = gp.buttons[index];
                    const action = _this.deParaGamepad(index);
                    if (button.pressed) {
                        // console.log(`Botão ${index} pressionado`);
                        _this.target.isPressed[action] = true
                    }else{
                        _this.target.isPressed[action] = false
                    }
                }
            }
        
            requestAnimationFrame(checkGamepad);
        }
        
        requestAnimationFrame(checkGamepad);
    }

    deParaGamepad(button){
        // Mapeia os botões do gamepad para ações
        const buttonMap = {
            0: 'Jump',    // Botão UP
            13: 'ArrowDown',  // Botão DOWN
            14: 'ArrowLeft',  // Botão LEFT
            15: 'ArrowRight', // Botão RIGHT
            2: 'Run'       // Botão Y
        };

        return buttonMap[button] || null; // Retorna a ação correspondente ou null se não houver mapeamento
    }
}

export { Controller };