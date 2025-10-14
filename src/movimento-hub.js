document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos do HTML ---
  const canvasWrapper = document.querySelector(".canvas-wrapper");
  const canvas = document.getElementById("pixi-canvas");

  // --- Configuração do PIXI ---
  const app = new PIXI.Application({
    view: canvas,
    resizeTo: canvasWrapper,
    backgroundColor: 0x1099bb, // Cor de fundo de fallback
    antialias: true,
  });

  // --- Variáveis do Jogo ---
  const playerSpeed = 5;
  const keys = {};
  let player;
  let worldContainer;
  let isDragging = false;
  
  // --- CAMINHOS DOS ASSETS ---
  const backgroundAssets = [
      'assets/backgrounds/laboratorio-biologia-1.png',
      'assets/backgrounds/laboratorio-biologia-2.png',
      'assets/backgrounds/laboratorio-biologia-3.png'
  ];

  const playerAsset = 'assets/characters/julia/julia-idle.png';

  // --- Função Principal de Configuração ---
  async function setup() {
    const allAssetsToLoad = [...backgroundAssets, playerAsset];
    const textures = await PIXI.Assets.load(allAssetsToLoad);

    // Cria o contêiner que vai guardar tudo (fundo e jogador)
    worldContainer = new PIXI.Container();
    app.stage.addChild(worldContainer);

    // Monta o panorama
    let currentX = 0;
    for (const path of backgroundAssets) {
        const bgSprite = new PIXI.Sprite(textures[path]);
        bgSprite.anchor.set(0, 0);
        bgSprite.x = currentX;
        bgSprite.y = 0;
        bgSprite.height = app.screen.height;
        bgSprite.scale.x = bgSprite.scale.y;
        worldContainer.addChild(bgSprite);
        currentX += bgSprite.width;
    }
    
    // Cria e adiciona o jogador AO CONTÊINER DO MUNDO, passando as texturas
    setupPlayer(textures);
    worldContainer.addChild(player);
  }

  // --- Configuração do Personagem ---
  function setupPlayer(textures) {
    player = new PIXI.Sprite(textures[playerAsset]);

    // Define o ponto de ancoragem para o centro do sprite.
    player.anchor.set(0.5);

    // Ajusta o tamanho do sprite
    player.height = 200;
    player.scale.x = player.scale.y;
    
    // Posição inicial dentro do mundo
    player.x = 300; 
    player.y = app.screen.height / 2;

    // Lógica de Drag and Drop
    player.eventMode = 'static';
    player.cursor = 'grab';
    player.on('pointerdown', onDragStart);

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerup', onDragEnd);
    app.stage.on('pointerupoutside', onDragEnd);
    app.stage.on('pointermove', onDragMove);
  }

  // --- Funções de Movimento (Drag and Drop) ---
  function onDragStart(event) {
    isDragging = true;
    player.cursor = 'grabbing';
    player.alpha = 0.8;
    worldContainer.toLocal(event.global, null, player.position);
  }

  function onDragEnd() {
    if (isDragging) {
        isDragging = false;
        player.cursor = 'grab';
        player.alpha = 1.0;
    }
  }

  function onDragMove(event) {
    if (isDragging) {
      worldContainer.toLocal(event.global, null, player.position);
    }
  }

  // --- Funções de Movimento (Teclado) ---
  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  function handleKeyboardMovement() {
    if (keys['arrowup'] || keys['w']) { player.y -= playerSpeed; }
    if (keys['arrowdown'] || keys['s']) { player.y += playerSpeed; }
    if (keys['arrowleft'] || keys['a']) { player.x -= playerSpeed; }
    if (keys['arrowright'] || keys['d']) { player.x += playerSpeed; }
  }
  
  // --- Verificação de Limites do MUNDO ---
  function enforceBounds() {
    // A lógica funciona perfeitamente com anchor, não precisa mudar nada aqui
    const halfWidth = player.width / 2;
    const halfHeight = player.height / 2;

    player.x = Math.max(halfWidth, player.x);
    player.x = Math.min(worldContainer.width - halfWidth, player.x);

    player.y = Math.max(halfHeight, player.y);
    player.y = Math.min(app.screen.height - halfHeight, player.y);
  }

  // --- LÓGICA DA CÂMERA ---
  function updateCamera() {
      const targetX = -player.x + app.screen.width / 2;
      const minCameraX = -(worldContainer.width - app.screen.width);
      const maxCameraX = 0;
      const clampedX = Math.max(minCameraX, Math.min(targetX, maxCameraX));
      worldContainer.x += (clampedX - worldContainer.x) * 0.08;
  }


  // --- Loop Principal do Jogo ---
  app.ticker.add(() => {
    if (!worldContainer) return;

    if (!isDragging) {
      handleKeyboardMovement();
    }
    
    enforceBounds();
    updateCamera();
  });

  // --- Iniciar ---
  setup();
});