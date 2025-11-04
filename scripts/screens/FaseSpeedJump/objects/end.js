const TILE_SIZE = 60;
export default {
    x: TILE_SIZE * 250,
    y: TILE_SIZE * 18,
    w: 90,
    h: 90,
    color: "red",
    sprite: {
      src: "../assets/imgs/general.png", // Caminho para a imagem do sprite
      cutH: (32 * 5) * 2,
      cutW: (32 * 5) * 1,
      frame: 0, // Quadro atual do sprite
      frameMax: 1, // Total de quadros do sprite
      frameTime: 0, // Tempo por quadro (em frames de jogo)
      frameCounter: 0 // Contador de tempo para animação
    },
    onTouch: function(player) {
        const bgm = document.getElementById("msgFinal");
        bgm.volume = 1; // Ajusta o volume
        bgm.play();

        const bgm2 = document.getElementById("happybday");
        bgm2.volume = 0.2; // Ajusta o volume
        bgm2.play();
    },
    onTouchLeave: function(player) {
        // player.isMeditating = false;
        // const bgm = document.getElementById("meditation");
        // bgm.pause();
        // bgm.currentTime = 0;
    }
  }