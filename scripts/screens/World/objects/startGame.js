import { mostrarDialogo } from "../../../utils/eventBus.js";

const TILE_SIZE = 75;

export default {
    x: TILE_SIZE * 34,
    y: TILE_SIZE * 23,
    w: 70,
    h: 70,
    color: "transparent",
    onTouch: function(player) {
      mostrarDialogo({ color: 'yellow', text: "Em busca do Chakras"},
        {
          text:"Encontre a harmonia dos chakras e evolua seu espírito para anvaçar até o final                                                                             Controles: (B) - Pular              (Setas) - Direção"
          ,color: "white"
        });
      this.x = -1500; // Move o item para fora da tela

      // Inicia a música de fundo
      const bgm = document.getElementById("bgm");
      bgm.volume = 0.1; // Ajusta o volume
      bgm.play();
    }
  }