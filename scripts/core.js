import { eventBus } from './utils/eventBus.js';

// =========================== GLOBALS ===========================
const GAME_TITLE = "Adventure";
const GAME_SUBTITLE = "The Seven Chakras";
const GAME_VERSION = "v1.0.0";
const TILE_SIZE = 65;
const SPRITE_SHEET_SIZE = 32 * 5;
const DEBUG = false;
const MAX_GRAVITY = 25;

const TILES_BG = [0,30,31,32,33, 46];

var SCREEN_NAME = "World";
var SCREEN_MODULE = null;
var ACTUAL_SCREEN = null;
var DIAOLOG_CALLBACK = null;

var mapWidth = 0;
var mapHeight = 0;

var last = performance.now();
var load = 0;

const init = async () => {

    // =========================== CANVAS ===========================
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    // =========================== PLAYER ===========================
    const player = {
        x: 0,
        y: 0,
        w: 58,
        h: 120,
        vx: 0,
        vy: 0,
        lives: 3,
        spriteSheet: {
            src: '../assets/imgs/player-spritesheet.png',
            actions: {
                stand: { row: 0, frames: 8 },
                walk: { row: 1, frames: 6 },
                run: { row: 2, frames: 8 },
                crouch: { row: 3, frames: 4 },
                jump: { row: 4, frames: 1 },
                falling: { row: 3, frames: 5 }
            }
        },
        jumpForce: 10, // Força do pulo
        walkForce: 5, // Força de andar
        isRunning: false, // Modo correr
        isWalking: false, // Modo andar
        direction: "R", // Direção do personagem
        grounded: false,
        // Itens
        haveBall: false,
        haveDoubleJump: false,
        haveSpringBall: false,
        haveSpeedBooster: false,

        keys: {
            green: false,
            blue: false,
            red: false,
            yellow: false
        },

        isBall: false, // Modo bola
        inWall: false,
        frame: 0,             // quadro atual
        frameMax: 8,          // total de quadros
        frameTime: 10,        // tempo por quadro (em frames de jogo)
        frameCounter: 0       // contador de tempo
    };

    const reloadScreen = async (NEW_SCREEN, options) => {

        // Carrega tela atual
        SCREEN_MODULE = await import(`./screens/${NEW_SCREEN || SCREEN_NAME}/index.js`);
        ACTUAL_SCREEN = SCREEN_MODULE.default;

        mapWidth = SCREEN_MODULE.default.map[0].length;
        mapHeight = SCREEN_MODULE.default.map.length;
        
        //Efeito de loading - ESTA QUEBRANDO O VERIFICAR  DE PLAYER FORA DA TELA
        // if(!options || !options.noLoad) await loadingScreen(0); 

        resizeCanvas();
        
        
        // Revisar posição do jogador
        if(options.playerStart){
            player.x = options.playerStart.x;
            player.y = options.playerStart.y;
            player.direction = options.playerStart.direction || "R";
        }else{
            player.x = SCREEN_MODULE.default.playerStart.x;
            player.y = SCREEN_MODULE.default.playerStart.y;
        }
    }

    // Carrega a tela inicial
    await reloadScreen(SCREEN_NAME, {noLoad: true});

    // Revisa mudanças de tela
    eventBus.addEventListener('changeScreen', async (e) => {        
        const { newScreen, options } = e.detail;

        SCREEN_NAME = newScreen;
        await reloadScreen(newScreen, options);
    });

    const jumpSong = document.getElementById("jump");


    const general_tiles = new Image();
    general_tiles.src = '../assets/imgs/general.png';

    const tileset = new Image();
    tileset.src = '../assets/imgs/tiles.png';

    // const arteFinal = new Image();
    // arteFinal.src = '/assets/imgs/arteFinal.png'; // Caminho para a imagem do sprite

    const fontePersonalizada = new FontFace("PixelFont", "url('../fonts/PixelifySans-VariableFont_wght.ttf')");

    fontePersonalizada.load().then(function (font) {
        document.fonts.add(font);
        console.log("Fonte carregada!");
    });


    const personagemImg = new Image();
    personagemImg.src = player.spriteSheet.src;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // =========================== MAPA ===========================
    mapWidth = ACTUAL_SCREEN.map[0].length;
    mapHeight = ACTUAL_SCREEN.map.length;

    // CAIXA DE DIALOGO
    const dialogBox = {
        ativo: false,
        title: {
            color: null,
            text: "",
        },
        body: {
            color: null,
            text: "",
        },
        alpha: 0,      // Para animar a entrada (fade-in)
        animando: false
    };

    function mostrarDialogo(titulo, texto, exibirFim = false, callback = null) {
        dialogBox.ativo = true;
        dialogBox.title = typeof titulo == 'object' ? titulo : { color: "#fff", text: titulo };
        dialogBox.body = typeof texto == 'object' ? texto : { color: "#fff", text: texto };
        dialogBox.alpha = 0;        // Começa invisível
        dialogBox.animando = true;  // Começa a animação
        dialogBox.exibirFim = exibirFim; // Flag para exibir o fim do jogo

        if (callback) DIAOLOG_CALLBACK = callback;
    }

    function fecharDialogo() {
        dialogBox.ativo = false;

        if (DIAOLOG_CALLBACK) {
            DIAOLOG_CALLBACK();
            DIAOLOG_CALLBACK = null; // Reseta o callback
        }
    }

    eventBus.addEventListener('showDialog', (e) => {
        const { color, text, fullText, n, callback } = e.detail;
        mostrarDialogo({ color, text }, fullText, n, callback);
    });

    // =========================== ITEMS ===========================
    let jumpPressedTime = 0;
    const maxJumpTime = 15; // frames (~0.25s)
    let isJumping = false;

    function getCameraOffset() {
        let offsetX = player.x - canvas.width / 2 + player.w / 2;
        let offsetY = player.y - canvas.height / 1.5 + player.h / 2;

        // limitar aos limites do mapa
        offsetX = Math.max(0, Math.min(offsetX, mapWidth * TILE_SIZE - canvas.width));
        offsetY = Math.max(0, Math.min(offsetY, mapHeight * TILE_SIZE - canvas.height));

        return { offsetX, offsetY };
    }

    const deParaTeclado = {
        "ArrowUp": "ArrowUp",
        "ArrowDown": "ArrowDown",
        "ArrowLeft": "ArrowLeft",
        "ArrowRight": "ArrowRight",
        "w": "ArrowUp",
        "s": "ArrowDown",
        "a": "ArrowLeft",
        "d": "ArrowRight",
        " ": "Jump", // Espaço para pular
        "Enter": "OK", // Enter para confirmar
        "Shift": "Run" // Shift para correr
    };

    const keys = {};
    document.addEventListener("keydown", e => {
        const saida = deParaTeclado[e.key];
        // console.log("KEY: ", e.key, "\nSaida: ", saida);
        keys[saida] = true
    });
    document.addEventListener("keyup", e => keys[deParaTeclado[e.key]] = false);


    window.addEventListener("gamepadconnected", e => startGamepadPolling());

    function startGamepadPolling() {
        function checkGamepad() {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

            for (let gp of gamepads) {
                if (!gp) continue;

                for (let index = 0; index < gp.buttons.length; index++) {
                    const button = gp.buttons[index];
                    const action = deParaGamepad(index);
                    if (button.pressed) {
                        keys[action] = true
                    } else {
                        keys[action] = false
                    }
                }
            }

            requestAnimationFrame(checkGamepad);
        }

        requestAnimationFrame(checkGamepad);
    }

    function deParaGamepad(button) {
        // Mapeia os botões do gamepad para ações
        const buttonMap = {
            12: 'ArrowUp',   // Botão UP
            13: 'ArrowDown',  // Botão DOWN
            14: 'ArrowLeft',  // Botão LEFT
            15: 'ArrowRight', // Botão RIGHT
            2: 'Run',       // Botão Y   
            1: 'OK',        // Botão A         
            0: 'Jump'    // Botão B
        };

        return buttonMap[button] || null; // Retorna a ação correspondente ou null se não houver mapeamento
    }

    function getTileXY(x, y) {
        return {
            tileX: Math.floor(x / TILE_SIZE),
            tileY: Math.floor(y / TILE_SIZE)
        };
    }

    function isSolid(x, y, ignoreY = false) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        const tile = ACTUAL_SCREEN.map[tileY]?.[tileX];
        // Tiles inexistentes contam como sólidos (evita cair fora do mapa)
        if (tile === undefined) return true;

        // Tile 0 = ar (não sólido)
        if (TILES_BG.includes(tile)) return false;

        return true;
    }

    // =========================== LÓGICA DO JOGO ===========================
    function update() {
        
        if (dialogBox.ativo) {
            if (keys["OK"]) fecharDialogo(); // Fecha o diálogo se pressionar OK
            return; // pausa o jogo
        }
        if(player.getItem){
            return; // pausa o jogo
        }

        // Controles horizontais
        if (keys["ArrowLeft"]) {
            player.direction = "L";
            player.vx = keys["Run"] && player.haveSpeedBooster && !player.isBall ? -(player.walkForce * 3.5) : -player.walkForce;
            player.isWalking = true;
        } else if (keys["ArrowRight"]) {
            player.direction = "R";
            player.vx = keys["Run"] && player.haveSpeedBooster && !player.isBall ? player.walkForce * 3.5 : player.walkForce;
            player.isWalking = true;
        } else {
            player.vx = 0;
            player.isWalking = false;
        }

        player.isRunning = keys["Run"] && player.haveSpeedBooster && !player.isBall;

        if (player.haveBall) {
            if (keys["ArrowDown"]) player.isBall = true;
            if (keys["ArrowUp"]) player.isBall = false;
        }

        // JUMP
        if (keys["Jump"] && (!player.isBall || (player.isBall && player.haveSpringBall))) {
            if (player.grounded) {
                jumpSong.currentTime = 0.0;
                jumpSong.volume = 0.1;
                jumpSong.play();
                isJumping = true;
                jumpPressedTime = 0;
                player.vy = -6;
                player.grounded = false;
            } else if (isJumping && jumpPressedTime < maxJumpTime) {
                const finalJump = player.haveDoubleJump ? player.jumpForce * 1.7 : player.jumpForce;
                player.vy = -(finalJump);
            }
            jumpPressedTime++;
        } else {
            isJumping = false;
        }

        // Gravidade
        if (player.vy < MAX_GRAVITY) player.vy += 0.5;

        // Movimento horizontal
        player.x += player.vx;

        // Verifica colisão horizontal (mantive sua lógica, usando isSolid atualizado)
        checkPlayerCollision();

        // Se o jogador sair do mapa, faz respawn
        
        // player.x + player.w < 0 || // Saiu pela esquerda
        // player.x > mapWidth ||     // Saiu pela direita
        // player.y + player.h < 0    // Saiu por cima (opcional)
        if (
            player.y > mapHeight * TILE_SIZE +10   // Caiu pra fora por baixo
        ) {
            respawnPlayer();
        }

        atualizarAnimacao();
    }

    function atualizarAnimacao() {
        player.frameCounter++;

        let ACTION_NAME = 'stand';

        // Checa frameMax da animação atual
        if (isJumping) {
            ACTION_NAME = 'jump';
        } else if (!isJumping && !player.grounded) {
            ACTION_NAME = 'falling';
        } else if (player.isRunning && player.isWalking) {
            ACTION_NAME = 'run';
        } else if (player.isBall && player.isWalking) {
            ACTION_NAME = 'crouch';
        } else if (player.isBall && !player.isWalking) {
            ACTION_NAME = 'crouch';
        } else if (player.isWalking) {
            ACTION_NAME = 'walk';
        }

        const FRAME_TIME = ACTION_NAME == 'run' ? 3 : player.frameTime;

        if (player.frameCounter >= FRAME_TIME) {
            player.frame = (player.frame + 1) % player.spriteSheet.actions[ACTION_NAME].frames;
            player.frameCounter = 0;
        }
    }

    function respawnPlayer() {
        player.x = ACTUAL_SCREEN.playerStart.x;
        player.y = ACTUAL_SCREEN.playerStart.y;
        player.vx = 0;
        player.vy = 0;

        player.isBall = false;
        player.inWall = false;
        player.isJumping = false;

        // Perde uma vida
        player.lives--;

        if (player.lives <= 0) {
            // Game Over
            gameOver();
        }
    }

    function gameOver() {
        mostrarDialogo("Game Over", "Não foi dessa vez minha cara...", false, async () => {
            // Reinicia o jogo
            player.lives = 3;
            player.haveBall = false;
            player.haveDoubleJump = false;
            player.haveSpringBall = false;
            player.haveSpeedBooster = false;

            await reloadScreen("World", {noLoad: true});
            player.direction = "R";
        });
    }


    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Adiciona background
        ctx.fillStyle = ACTUAL_SCREEN.background || "#b2b3c8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { offsetX, offsetY } = getCameraOffset();

        const startCol = Math.floor(offsetX / TILE_SIZE);
        const endCol = Math.ceil((offsetX + canvas.width) / TILE_SIZE);
        const startRow = Math.floor(offsetY / TILE_SIZE);
        const endRow = Math.ceil((offsetY + canvas.height) / TILE_SIZE);

        // Desenha mapa que estiver atras (tiles com índice >= 10 no seu esquema original)
        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                if (ACTUAL_SCREEN.map[y] && ACTUAL_SCREEN.map[y][x] === undefined) continue;
                if (!ACTUAL_SCREEN.map[y] || !ACTUAL_SCREEN.map[y][x]) continue;
                const tileIndex = ACTUAL_SCREEN.map[y][x];
                if (!TILES_BG.includes(tileIndex)) continue;

                // ctx.strokeStyle = "gray";
                // ctx.strokeRect(x * TILE_SIZE -offsetX, y * TILE_SIZE -offsetY, TILE_SIZE, TILE_SIZE);

                //if (tileIndex === 0) continue; // Pula tiles vazios

                // índice na spritesheet
                const sx = 32 * (tileIndex - 1) + 0.3;
                const sy = 0;

                // Nao mexer
                const dx = x * TILE_SIZE - offsetX;
                const dy = y * TILE_SIZE - offsetY;

                ctx.drawImage(
                    tileset,
                    sx, sy, 32, 32, // src
                    dx, dy, TILE_SIZE, TILE_SIZE  // dest
                );
            }
        }

        // Desenha objetos da tela
        ACTUAL_SCREEN.objects
        .filter(obj => {
            if(obj.condition) return obj.condition(player);
            return true;
        })
        .forEach(obj => {
            if (obj.sprite) {
                const spriteImg = new Image();
                spriteImg.src = obj.sprite.src; // Caminho para a imagem do sprite

                obj.sprite.frameCounter++;
                if (obj.sprite.frameCounter >= obj.sprite.frameTime) {
                    obj.sprite.frame = (obj.sprite.frame + 1) % obj.sprite.frameMax;
                    obj.sprite.frameCounter = 0;
                }

                const spriteWidth = obj.sprite.width || SPRITE_SHEET_SIZE;
                const spriteHeight = obj.sprite.height || SPRITE_SHEET_SIZE;

                ctx.drawImage(
                    spriteImg,
                    (obj.sprite.frame * SPRITE_SHEET_SIZE) + (obj.sprite.cutW||0), obj.sprite.cutH,
                    spriteWidth, spriteHeight,
                    obj.x - offsetX, obj.y - offsetY,
                    obj.w, obj.h
                );

            } else {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x - offsetX, obj.y - offsetY, obj.w, obj.h);
            }

            if (isColliding(player, obj)) {
                obj.onTouch(player);

                if (obj.isSolid) {
                    // Verifica se há sobreposição (colisão)
                    const overlapX = player.x < obj.x + obj.w && player.x + player.w > obj.x;
                    const overlapY = player.y < obj.y + obj.h && player.y + player.h > obj.y;

                    if (overlapX && overlapY) {
                        // Calcula o quanto o player invadiu o objeto em cada eixo
                        const overlapLeft = player.x + player.w - obj.x;
                        const overlapRight = obj.x + obj.w - player.x;
                        const overlapTop = player.y + player.h - obj.y;
                        const overlapBottom = obj.y + obj.h - player.y;

                        // Determina o menor deslocamento necessário
                        const minOverlapX = Math.min(overlapLeft, overlapRight);
                        const minOverlapY = Math.min(overlapTop, overlapBottom);

                        // Corrige a posição do jogador empurrando-o para fora
                        if (minOverlapX < minOverlapY) {
                            if (overlapLeft < overlapRight) {
                                // bateu pela esquerda
                                player.x -= overlapLeft;
                            } else {
                                // bateu pela direita
                                player.x += overlapRight;
                            }
                        } else {
                            if (overlapTop < overlapBottom) {
                                // bateu por cima
                                player.y -= overlapTop;
                                player.grounded = true;
                                player.vy = 0;
                            } else {
                                // bateu por baixo
                                player.y += overlapBottom;
                            }
                        }
                    }
                }

            }else{
                if(obj.onTouchLeave){
                    obj.onTouchLeave(player);
                }
            }
        });

        // Desenha hitbox
        // ctx.strokeStyle = "red";
        // ctx.strokeRect(player.x - offsetX, getPosY() - offsetY, player.w, getPlayerHeight());

        // SPRITE
        const { spriteX, spriteY } = getSprite();

        ctx.save();

        if (player.direction === "L") {
            ctx.scale(-1, 1);
            ctx.translate(-70 - player.x, getPosY());

            ctx.drawImage(
                personagemImg,
                spriteX, spriteY, SPRITE_SHEET_SIZE, SPRITE_SHEET_SIZE,
                offsetX - (player.w * .5), - offsetY - (getPlayerHeight() *.2),
                player.w * 2.5, getPlayerHeight() + (getPlayerHeight() *.2)
            );
        } else {
            ctx.drawImage(
                personagemImg,
                spriteX, spriteY, SPRITE_SHEET_SIZE, SPRITE_SHEET_SIZE,
                player.x - offsetX - (player.w * .65), getPosY() - offsetY - (getPlayerHeight() *.2),
                player.w * 2.5, getPlayerHeight() + (getPlayerHeight() *.2)
            );
        }

        ctx.restore();

        // Desenha mapa que estiver na frente (tiles com índice < 10)
        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                if (ACTUAL_SCREEN.map[y] && ACTUAL_SCREEN.map[y][x] === undefined) continue;                
                if (!ACTUAL_SCREEN.map[y] || !ACTUAL_SCREEN.map[y][x]) continue;
                const tileIndex = ACTUAL_SCREEN.map[y][x];

                if(TILES_BG.includes(tileIndex)) continue;

                // ctx.strokeStyle = "gray";
                // ctx.strokeRect(x * TILE_SIZE -offsetX, y * TILE_SIZE -offsetY, TILE_SIZE, TILE_SIZE);

                if (tileIndex === 0) continue; // Pula tiles vazios

                const dx = x * TILE_SIZE - offsetX;
                const dy = y * TILE_SIZE - offsetY;

                drawTile(dx, dy, tileIndex);
            }
        }

        function drawTile(x, y, tileIndex) {
            // ctx.beginPath();

            const tileSize = 16 * 2; // Tamanho total da spritesheet

            // índice na spritesheet
            const sx = tileSize * (tileIndex - 1);
            const sy = 0;

            ctx.drawImage(
                tileset,
                sx, sy, tileSize, tileSize, // src
                x, y, TILE_SIZE, TILE_SIZE  // dest
            );
        }

        // DIALOGO
        if (dialogBox.ativo) desenharDialogo();

        
        // PLAYER INFO
        exibirHUD();       

    }

    function desenharDialogo() {
        if (!dialogBox.ativo && dialogBox.alpha <= 0) return;

        // Animação de fade-in
        if (dialogBox.animando) {
            dialogBox.alpha += 0.05;
            if (dialogBox.alpha >= 1) {
                dialogBox.alpha = 1;
                dialogBox.animando = false;
            }
        }

        const largura = 600;
        const altura = 200;
        const x = (canvas.width - largura) / 2;
        const y = (canvas.height - altura) / 2;

        ctx.save();
        ctx.globalAlpha = dialogBox.alpha;

        // Caixa
        ctx.fillStyle = dialogBox.bgColor || "#202035ff";
        ctx.fillRect(x, y, largura, altura);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(x, y, largura, altura);

        // Título
        ctx.fillStyle = dialogBox.title.color || "#fff";
        ctx.font = "bold 30px PixelFont";
        ctx.fillText(dialogBox.title.text, x + (largura / 2) - (dialogBox.title.text.length * 7), y + 30);

        // Texto
        ctx.fillStyle = dialogBox.body.color || "#fff";
        ctx.font = "20px PixelFont";
        const linhas = quebrarTexto(ctx, dialogBox.body.text, largura - 40);
        linhas.forEach((linha, i) => {
            ctx.fillText(linha, x + 20, y + 90 + i * 20);
        });

        // Botao OK
        ctx.fillStyle = dialogBox.body.color || "#fff";
        ctx.font = "20px PixelFont";
        ctx.fillText("Fechar (A)", x + largura - 120, y + 180);


        if (dialogBox.exibirFim) {
            // Desenha a imagem final
            // ctx.drawImage(arteFinal, x - 40, y + 150, 1680 / 2.5, 560 / 2.5);
        }


        ctx.restore();
    }

    function getSprite() {
        let spriteX = 0;
        let spriteY = 0;

        if(player.getItem){
            spriteX = 0; 
            spriteY = SPRITE_SHEET_SIZE * 4;
        }else{

            if (isJumping) {
                // JUMP
                spriteX = 0;
                spriteY = SPRITE_SHEET_SIZE * 3.05;
            } else if (!isJumping && !player.grounded) {
                // FALLING
                spriteX = ((player.frame - 1) * SPRITE_SHEET_SIZE) + SPRITE_SHEET_SIZE;
                spriteY = SPRITE_SHEET_SIZE * 3.05;

            } else if (player.isRunning && player.isWalking) {
                // RUNNING
                spriteX = player.frame * SPRITE_SHEET_SIZE;
                spriteY = SPRITE_SHEET_SIZE * 2;

            } else if (player.isBall && player.isWalking) {
                // CROUNCH WALKING
                spriteX = player.frame * SPRITE_SHEET_SIZE;
                spriteY = SPRITE_SHEET_SIZE * 5;

            } else if (player.isBall && !player.isWalking) {
                // CROUNCH
                spriteX = 0;
                spriteY = SPRITE_SHEET_SIZE * 5;

            } else if (player.isWalking) {
                // WALKING
                spriteX = player.frame * SPRITE_SHEET_SIZE;
                spriteY = SPRITE_SHEET_SIZE * 1;
            } else if (false) {
                // MID
                // spriteX = 570 + 30;
                // spriteY = 90;

            } else if (player.isMeditating) {
                // MEDITATING
                spriteX = player.frame * SPRITE_SHEET_SIZE;
                spriteY = SPRITE_SHEET_SIZE * 6;
            } else {
                // STAND
                spriteX = player.frame * SPRITE_SHEET_SIZE; 
                spriteY = SPRITE_SHEET_SIZE * 0;
            }
        }

        return { spriteX, spriteY };
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    document.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(`Clicou em: (${x}, ${y})`);
        changeMap(y, x); // Chama a função para mudar o mapa
    });

    function changeMap(x, y) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        console.log(`Mudando o mapa no tile: (${tileX}, ${tileY})`);
        // Exemplo de mudança de mapa
        // map[tileX][tileY] = 2;
        ACTUAL_SCREEN.map[tileX][tileY] == 1 ? 0 : 1; // Muda um tile específico para bloco
    }

    function getPosY() {
        return player.y;
    }

    function getPlayerHeight() {
        return player.isBall ? player.h / 2 : player.h;
    }

    function isColliding(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }

    function quebrarTexto(ctx, texto, larguraMax) {
        const palavras = texto.split(' ');
        const linhas = [];
        let linhaAtual = '';

        for (let palavra of palavras) {
            const testeLinha = linhaAtual + palavra + ' ';
            const largura = ctx.measureText(testeLinha).width;
            if (largura > larguraMax) {
                linhas.push(linhaAtual);
                linhaAtual = palavra + ' ';
            } else {
                linhaAtual = testeLinha;
            }
        }
        linhas.push(linhaAtual);
        return linhas;
    }


    loop();


    function loadingScreen(duration) {
        return new Promise((resolve) => {
            const fadeTime = 200; // tempo de fade-in/out em ms
            const totalTime = duration + fadeTime * 2; // inclui entrada e saída
            const startTime = performance.now();

            function drawLoading() {
                const currentTime = performance.now();
                const elapsed = currentTime - startTime;
                let alpha = 1;

                // Calcula o alpha (transparência)
                if (elapsed < fadeTime) {
                    // Fade-in
                    alpha = elapsed / fadeTime;
                } else if (elapsed > totalTime - fadeTime) {
                    // Fade-out
                    alpha = 1 - (elapsed - (totalTime - fadeTime)) / fadeTime;
                }

                // Limpa tela
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Desenha fundo e texto com o alpha calculado
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.font = "bold 40px PixelFont";
                ctx.fillText("Carregando...", canvas.width / 2 - 100, canvas.height / 2);

                if (elapsed < totalTime) {
                    requestAnimationFrame(drawLoading);
                } else {
                    resolve();
                }
            }

            drawLoading();
        });
    }


    function exibirHUD() {
        ctx.save();

        // ====== VIDAS ======
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(canvas.width - 400, 0, 400, 120);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.drawImage(general_tiles,
            0, 0, 32 * 5, 32 * 5,
            10, 10, 100, 100
        );
        ctx.fillStyle = "#fff";
        ctx.font = "bold 35px PixelFont";
        ctx.fillText(Math.round(player.lives), 85, 65);

        if(DEBUG){
            ctx.font = "bold 20px PixelFont";
            ctx.fillText(updateStats(), 150, 65);
            ctx.fillText(measureCPU(), 150, 95);
        }


        // ====== ITENS ======
        if (player.haveBall) {
            ctx.drawImage(general_tiles,
                (32*5)*4, 0,32 * 5, 32 * 5,
                canvas.width - 370, 20, 60, 60
            );
        }
        if (player.haveDoubleJump) {
            ctx.drawImage(general_tiles,
                (32*5)*3, 0, 32 * 5, 32 * 5,
                canvas.width - 280, 20, 60, 60
            );
        }
        if (player.haveSpringBall) {
            ctx.drawImage(general_tiles,
                (32*5)*5, 0, 32 * 5, 32 * 5,
                canvas.width - 190, 20, 60, 60
            );
        }
        if (player.haveSpeedBooster) {
            ctx.drawImage(general_tiles,
                (32*5)*2, 0, 32 * 5, 32 * 5,
                canvas.width - 100, 20, 60, 60
            );
        }

        // ====== KEYS ======
        if(player.keys.green){
            ctx.drawImage(general_tiles,
                (32*5)*6, 0, 32 * 5, 32 * 5,
                canvas.width - 370, 70, 60, 60
            );
        }
        if(player.keys.yellow){
            ctx.drawImage(general_tiles,
                (32*5)*9, 0, 32 * 5, 32 * 5,
                canvas.width - 280, 70, 60, 60
            );
        }
        if(player.keys.blue){
            ctx.drawImage(general_tiles,
                (32*5)*7, 0, 32 * 5, 32 * 5,
                canvas.width - 190, 70, 60, 60
            );
        }
        if(player.keys.red){
            ctx.drawImage(general_tiles,
                (32*5)*8, 0, 32 * 5, 32 * 5,
                canvas.width - 100, 70, 60, 60
            );
        }


        ctx.restore();
    }
    
    function checkPlayerCollision() {
        const topY = getPosY();
        const midY = getPosY() + getPlayerHeight() / 2;
        const botY = getPosY() + getPlayerHeight() - 1;

        if (player.vx > 0
            && (
                isSolid(player.x + player.w, midY)
                || isSolid(player.x + player.w, topY)
                || isSolid(player.x + player.w, botY)
            ))
        {
            // Colidiu com a parede direita
            player.x = Math.floor((player.x + player.w) / TILE_SIZE) * TILE_SIZE - player.w - 0.01;
            player.inWall = true;
        } else {
            player.inWall = false;
        }
        if (player.vx < 0
            && (
                isSolid(player.x, midY)
                || isSolid(player.x, topY)
                || isSolid(player.x, botY)
            ))
        {
            // Colidiu com a parede esquerda 
            player.x = Math.floor((player.x) / TILE_SIZE + 1) * TILE_SIZE + 0.01;
            player.inWall = true;
        } else {
            player.inWall = false;
        }

        // Movimento vertical
        player.y += player.vy;

        // --- NOVA LÓGICA DE COLISÃO VERTICAL COM SUPORTE A RAMPAS ---
        // Vamos checar a posição dos "pés" em 3 pontos: esquerda, centro, direita
        const feetY = getPosY() + getPlayerHeight();
        const sampleXs = [
            player.x + 2, // pequeno offset para evitar bordas exatas
            player.x + player.w / 2,
            player.x + player.w - 2
        ];

        let snappedToGround = false;

        for (let sx of sampleXs) {
            const { tileX, tileY } = getTileXY(sx, feetY + 1);
            const tile = ACTUAL_SCREEN.map[tileY]?.[tileX];

            if (!tile || TILES_BG.includes(tile)) {
                continue;
            }
            // tile sólido normal (ex: 1)
            // se houver um tile sólido logo abaixo dos pés, snap ao topo do tile
            const tileTopY = tileY * TILE_SIZE;
            if (feetY > tileTopY) {
                player.y = tileTopY - getPlayerHeight();
                player.vy = 0;
                player.grounded = true;
                snappedToGround = true;
                break;
            }
        }

        if (!snappedToGround) {
            // checar se colidiu com teto (mantive sua lógica)
            if (
                isSolid(player.x, getPosY()) // Canto superior esquerdo
                || isSolid(player.x + player.w, getPosY()) // Canto superior direito
            ) {
                player.y = Math.floor(getPosY() / TILE_SIZE + 1) * TILE_SIZE + 0.01;
                player.vy = 0;
                player.grounded = false;
            } else {
                player.grounded = false;
            }
        }
    }


    function formatBytes(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }

    function updateStats() {
        if (performance.memory) {
            const mem = performance.memory;
            const used = formatBytes(mem.usedJSHeapSize);
            const total = formatBytes(mem.totalJSHeapSize);
            const limit = formatBytes(mem.jsHeapSizeLimit);

            return `Memória usada: ${used}\nHeap total: ${total}\nLimite: ${limit}`;
        } else {
            return "performance.memory não suportado neste navegador.";
        }
    }

    

    function measureCPU() {
        const start = performance.now();

        // Faz um pequeno trabalho artificial
        for (let i = 0; i < 1e6; i++) Math.sqrt(i);

        const end = performance.now();
        const delta = end - start;
        const elapsed = end - last;

        // Quanto maior delta, maior o "uso"
        load = (delta / elapsed * 100).toFixed(1);
        last = end;

        return `\nCPU estimada: ${load}%`;
    }
}

init();