import { mostrarDialogo } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;
export default{
    x: TILE_SIZE * 14,
    y: TILE_SIZE * 10,
    w: 90,
    h: 90,
    condition: (player) => player.haveBall === false,
    color: "red",
    sprite: {
      src: "../assets/imgs/general.png", // Caminho para a imagem do sprite
      cutH: (32 * 5) * 0,
      cutW: (32 * 5) * 4,
      frame: 0, // Quadro atual do sprite
      frameMax: 1, // Total de quadros do sprite
      frameTime: 5, // Tempo por quadro (em frames de jogo)
      frameCounter: 0 // Contador de tempo para animação
    },
    onTouch: function(player) {
      player.getItem = true;

      const bgm = document.getElementById("foundItem");
      bgm.volume = 0.5; // Ajusta o volume
      bgm.play();

      setTimeout(() => {
          player.getItem = false;
          player.haveBall = true; // Libera corrida
          mostrarDialogo ({ color: 'yellow', text: "Agachamento"}, "Aperte o botão de agachar ( Baixo ) enquanto está parado para passar por lugares estreitos!");
          this.x = -1500; // Move o item para fora da tela
      }, 2000);

    //   const risada = document.getElementById("risada");
    //   risada.volume = 0.5; // Ajusta o volume
    //   risada.play();
    }
  }