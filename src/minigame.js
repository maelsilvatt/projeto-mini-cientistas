document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos do HTML ---
  const canvasWrapper = document.querySelector(".canvas-wrapper");
  const canvas = document.getElementById("pixi-canvas");
  const controlsPanel = document.getElementById("controlsPanel");
  const dialogoFalha = document.getElementById("dialogoFalha");
  const btnReiniciar = document.getElementById("btnReiniciar");
  const forcaSlider = document.getElementById("forcaSlider");
  const gravidadeSlider = document.getElementById("gravidadeSlider");
  const massaSlider = document.getElementById("massaSlider");

  // --- Configuração do Jogo ---
  const app = new PIXI.Application({
    view: canvas,
    resizeTo: canvasWrapper,
    antialias: true,
    backgroundAlpha: 0,
  });

  // --- Constantes e Variáveis Globais ---
  const POUSO_SEGURO_VELOCIDADE = 2.5;
  const caminhos = {
    nave: "assets/characters/nave/nave.png",
    base: "assets/characters/nave/base.png",
  };
  let gravidade = 1.6;
  const keys = {};
  let nivelAtual = 0;
  let base = null;
  let obstaculos = [];
  let particulas = [];
  let texturasCarregadas = {};

  // Configurações das partículas
  const CONFIG_PARTICULAS = {
    tamanho: 4,       
    velocidade: 2,
    tempoDeVida: 0.5, 
    cor: 0x87ceeb     // Cor de fogo (laranja)
  };

  // --- Definição dos Níveis (Estrutura de dados) ---
  const niveis = [
    { // Nível 0 (Tutorial)
      basePos: { x: 0.5, y: 0.9 },
      obstaculos: []
    },
    { // Nível 1
      basePos: { x: 0.75, y: 0.9 },
      obstaculos: [ { x: 0.5, y: 0.5, w: 200, h: 20 } ]
    },
    { // Nível 2
      basePos: { x: 0.25, y: 0.9 },
      obstaculos: [ { x: 0.6, y: 0.6, w: 300, h: 20 } ]
    },
    { // Nível 3
      basePos: { x: 0.8, y: 0.9 },
      obstaculos: [
        { x: 0.3, y: 0.4, w: 20, h: 150 },
        { x: 0.6, y: 0.7, w: 20, h: 150 }
      ]
    }
  ];

  // --- Objeto da Nave (Física) ---
  const nave = {
    posicao: { x: 0, y: 0 },
    velocidade: { x: 0, y: 0 },
    massa: 150,
    forcaPropulsor: 300,
    sprite: null,
    pousou: false,

    aplicarForca(fx, fy) {
        this.velocidade.x += fx / this.massa;
        this.velocidade.y += fy / this.massa;
    },

    update(dt) {
        if (this.pousou) return;

        // Física
        this.velocidade.y += gravidade * dt;
        this.posicao.x += this.velocidade.x * dt;
        this.posicao.y += this.velocidade.y * dt;

        // Colisão com bordas da tela
        if (this.posicao.x < 15 || this.posicao.x > app.screen.width - 15) {
            return falhar("Cuidado com as bordas!");
        }
        if (this.posicao.y < 15) { // Teto
            return falhar("Muito alto!");
        }

        // Colisão com obstáculos
        for (const obs of obstaculos) {
            if (this.sprite.getBounds().intersects(obs.getBounds())) {
                return falhar("Cuidado com os obstáculos!");
            }
        }
        
        // Colisão com chão (fora da base)
        if (this.posicao.y > app.screen.height - nave.sprite.height / 2) {
            return falhar("Pouse na base!");
        }

        // Colisão com a base
        if (base && this.sprite.getBounds().intersects(base.getBounds())) {
            const dentroHorizontal = Math.abs(this.posicao.x - base.x) < base.width / 2.5;
            if (dentroHorizontal) {
                this.pousou = true;
                const forcaImpacto = this.velocidade.y;
                this.velocidade = { x: 0, y: 0 };
                this.posicao.y = base.y - nave.sprite.height / 2;

                if (forcaImpacto < POUSO_SEGURO_VELOCIDADE) {
                    showMessage("Pouso Perfeito!", "#2ecc71");
                    setTimeout(proximoNivel, 1500);
                } else {
                    showMessage(`Pouso Brusco! (Força: ${forcaImpacto.toFixed(1)})`, "#e74c3c");
                    setTimeout(() => falhar("Impacto forte demais!"), 1500);
                }
            } else {
                return falhar("Pouse no meio da base!");
            }
        }

        this.sprite.position.copyFrom(this.posicao);
    },
  };
  
  // --- Funções do Jogo ---
  function reiniciar() {
    nave.posicao = { x: app.screen.width / 2, y: 50 };
    nave.velocidade = { x: 0, y: 0 };
    nave.pousou = false;
    dialogoFalha.classList.add("hidden");
  }
  
  function falhar(motivo) {
    nave.pousou = true;
    mostrarDialogo(motivo);
  }
  
  function proximoNivel() {
    nivelAtual++;
    if (nivelAtual >= niveis.length) {
        showMessage("Parabéns, você completou o treinamento!", "#3498db");
        controlsPanel.classList.remove("hidden"); // Mostra os sliders
    } else {
        showMessage(`Nível ${nivelAtual + 1}!`, "#3498db");
        carregarNivel(nivelAtual);
    }
  }

  function carregarNivel(n) {
    obstaculos.forEach((o) => o.destroy());
    obstaculos = [];
    if (base) base.destroy();

    const dadosNivel = niveis[n];
    
    // Cria a base
    base = new PIXI.Sprite(texturasCarregadas[caminhos.base]);
    base.anchor.set(0.5, 1);
    base.scale.set(0.2);
    base.x = app.screen.width * dadosNivel.basePos.x;
    base.y = app.screen.height * dadosNivel.basePos.y;
    app.stage.addChild(base);

    // Cria os obstáculos
    dadosNivel.obstaculos.forEach(obsData => {
        const obstaculo = criarObstaculo(
            app.screen.width * obsData.x,
            app.screen.height * obsData.y,
            obsData.w,
            obsData.h
        );
        obstaculos.push(obstaculo);
        app.stage.addChild(obstaculo);
    });

    reiniciar();
  }

  function criarObstaculo(x, y, w, h) {
      const g = new PIXI.Graphics();
      g.lineStyle({ width: 2, color: 0xffffff, alpha: 0.8 });
      g.beginFill(0xff0000, 0.1);
      g.drawRect(0, 0, w, h);
      g.endFill();
      // Desenha a linha tracejada
      for (let i = 0; i < w; i += 10) g.moveTo(i, 0).lineTo(i + 5, 0);
      for (let i = 0; i < w; i += 10) g.moveTo(i, h).lineTo(i + 5, h);
      for (let i = 0; i < h; i += 10) g.moveTo(0, i).lineTo(0, i + 5);
      for (let i = 0; i < h; i += 10) g.moveTo(w, i).lineTo(w, i + 5);
      g.pivot.set(w/2, h/2);
      g.position.set(x, y);
      return g;
  }

  function criarParticula(x, y, dirX, dirY) {
    const p = new PIXI.Graphics();
    p.beginFill(CONFIG_PARTICULAS.cor);    
    p.drawCircle(0, 0, CONFIG_PARTICULAS.tamanho); 
    p.endFill();
    p.x = x;
    p.y = y;

    // Adiciona aleatoriedade para um efeito de "spray"
    const angulo = Math.atan2(dirY, dirX);
    const spread = Math.PI / 4; // Espalhamento de 45 graus
    const novoAngulo = angulo + (Math.random() - 0.5) * spread;
    
    const velocidadeFinal = CONFIG_PARTICULAS.velocidade * (1 + Math.random());

    // Propriedades para a física da partícula
    p.vx = Math.cos(novoAngulo) * velocidadeFinal;
    p.vy = Math.sin(novoAngulo) * velocidadeFinal;
    p.vida = CONFIG_PARTICULAS.tempoDeVida;

    particulas.push(p);
    app.stage.addChild(p);
  }
  
  // --- Funções de UI ---

  function mostrarDialogo(texto) {
    dialogoFalha.querySelector("p").textContent = texto;
    dialogoFalha.classList.remove("hidden");
  }
  btnReiniciar.addEventListener("click", reiniciar);

  function showMessage(text, color = "#FFFFFF") {
    const feedbackText = new PIXI.Text(text, {
      fontFamily: "Fredoka", fontSize: 32, fill: color,
      stroke: 0x000000, strokeThickness: 5, align: "center",
    });
    feedbackText.anchor.set(0.5);
    feedbackText.x = app.screen.width / 2;
    feedbackText.y = 80;
    app.stage.addChild(feedbackText);
    setTimeout(() => feedbackText.destroy(), 2000);
  }

  // --- Loop Principal (Ticker) ---
  app.ticker.add((delta) => {
    const dt = delta / 60; // Delta time em segundos

    if (!nave.pousou) {
        const deslocamentoY = 18; // ajuste vertical da partícula

        if (keys["arrowup"] || keys["w"]) {
        nave.aplicarForca(0, -nave.forcaPropulsor);          
        criarParticula(nave.posicao.x, nave.posicao.y + deslocamentoY, 0, 1); 
        }
        if (keys["arrowdown"] || keys["s"]) {
        nave.aplicarForca(0, nave.forcaPropulsor);          
        criarParticula(nave.posicao.x, nave.posicao.y - deslocamentoY, 0, -1);
        }
        if (keys["arrowleft"] || keys["a"]) {
        nave.aplicarForca(-nave.forcaPropulsor, 0);          
        criarParticula(nave.posicao.x + deslocamentoY, nave.posicao.y, 1, 0);
        }
        if (keys["arrowright"] || keys["d"]) {
        nave.aplicarForca(nave.forcaPropulsor, 0);          
        criarParticula(nave.posicao.x - deslocamentoY, nave.posicao.y, -1, 0);
        }
    }
    nave.update(dt);

    // Loop de atualização das partículas 
    for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        
        p.vida -= dt; // Diminui o tempo de vida

        // Se a partícula morreu
        if (p.vida <= 0) {
            p.destroy(); 
            particulas.splice(i, 1); // Remove do array
        } else {
            // Atualiza a posição e o fade-out
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = p.vida / CONFIG_PARTICULAS.tempoDeVida;
        }
    }
  });
  
  // --- Sliders e Teclado ---
  window.addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = true));
  window.addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));
  forcaSlider.addEventListener("input", (e) => (nave.forcaPropulsor = Number(e.target.value)));
  gravidadeSlider.addEventListener("input", (e) => (gravidade = Number(e.target.value)));
  massaSlider.addEventListener("input", (e) => (nave.massa = Number(e.target.value)));

  // --- Início do Jogo ---
  async function setup() {
    // Carrega todos os assets primeiro e guarda as texturas
    texturasCarregadas = await PIXI.Assets.load([caminhos.nave, caminhos.base]);
    
    // Cria o sprite da nave usando a textura pré-carregada
    nave.sprite = new PIXI.Sprite(texturasCarregadas[caminhos.nave]);
    nave.sprite.anchor.set(0.5);
    nave.sprite.scale.set(0.2);
    app.stage.addChild(nave.sprite);
    
    // Inicia o primeiro nível
    carregarNivel(nivelAtual);
  }

  setup();
});