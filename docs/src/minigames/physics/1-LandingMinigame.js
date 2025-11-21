/* =================================================================
 * 1-LandingMinigame.js
 * A cena do minigame de pouso, como uma classe modular.
 * ================================================================= */

class LandingMinigameScene extends PIXI.Container {

    /**
     * @param {PIXI.Application} app - A aplicação PIXI principal.
     * @param {SceneManager} sceneManager - O gerenciador de cenas.
     */
    constructor(app, sceneManager) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;

        this.POUSO_SEGURO_VELOCIDADE = 50;
        this.caminhos = {
            nave: "assets/characters/nave/nave.png",
            base: "assets/characters/nave/base.png",
        };
        this.gravidade = 1.6;
        this.keys = {};
        this.nivelAtual = 0;
        this.base = null;
        this.obstaculos = [];
        this.particulas = [];
        this.texturasCarregadas = {};
        this.hitboxBase = null;
        this.hitboxHeight = 10;

        this.CONFIG_PARTICULAS = {
            tamanho: 4,       
            velocidade: 2,
            tempoDeVida: 0.5, 
            cor: 0x87ceeb
        };

        this.niveis = [
            { // Nível 0 (Tutorial)
              basePos: { x: 0.5, y: 0.9 },
              obstaculos: []
            },
            { // Nível 1
              basePos: { x: 0.75, y: 0.9 },
              obstaculos: [ { x: 0.5, y: 0.5, w: 600, h: 20 } ]
            },
            { // Nível 2
              basePos: { x: 0.25, y: 0.9 },
              obstaculos: [ { x: 0.4, y: 0.6, w: 300, h: 20 },
                            { x: 0.2, y: 0.3, w: 300, h: 20 } ]
            },
            { // Nível 3
              basePos: { x: 0.8, y: 0.9 },
              obstaculos: [
                { x: 0.9, y: 0.4, w: 20, h: 150 },
                { x: 0.6, y: 0.7, w: 20, h: 150 }
              ]
            }
        ];

        this.nave = {
            posicao: { x: 0, y: 0 },
            velocidade: { x: 0, y: 0 },
            massa: 150,
            forcaPropulsor: 300,
            sprite: null,
            pousou: false,
            scene: this,
            aplicarForca(fx, fy) {
                this.velocidade.x += fx / this.massa;
                this.velocidade.y += fy / this.massa;
            },
            update(dt) {
                if (this.pousou) return;
                this.velocidade.y += this.scene.gravidade * dt;
                this.posicao.x += this.velocidade.x * dt;
                this.posicao.y += this.velocidade.y * dt;

                const screen = this.scene.app.screen;
                if (this.posicao.x < 15 || this.posicao.x > screen.width - 15)
                    return this.scene.falhar("Cuidado com as bordas!");
                if (this.posicao.y < 15)
                    return this.scene.falhar("Muito alto!");

                for (const obs of this.scene.obstaculos) {
                    if (this.sprite.getBounds().intersects(obs.getBounds()))
                        return this.scene.falhar("Cuidado com os obstáculos!");
                }

                if (this.scene.hitboxBase && this.sprite.getBounds().intersects(this.scene.hitboxBase.getBounds())) {
                    const dentroHorizontal = Math.abs(this.posicao.x - this.scene.hitboxBase.x) < this.scene.hitboxBase.width / 2;
                    if (dentroHorizontal) {
                        this.pousou = true;
                        const forcaImpacto = this.velocidade.y;
                        this.velocidade = { x: 0, y: 0 };
                        this.posicao.y = this.scene.hitboxBase.y - this.sprite.height / 2 + this.scene.hitboxHeight / 2;

                        if (forcaImpacto < this.scene.POUSO_SEGURO_VELOCIDADE) {
                            this.scene.showMessage("Pouso Perfeito!", "#2ecc71");
                            setTimeout(() => this.scene.proximoNivel(), 1500);
                        } else {
                            this.scene.showMessage(`Pouso Brusco! (Força: ${forcaImpacto.toFixed(1)})`, "#e74c3c");
                            setTimeout(() => this.scene.falhar("Impacto forte demais!"), 1500);
                        }            
                        return; 
                    } else return this.scene.falhar("Pouse no meio da base!");
                }

                if (this.posicao.y > screen.height - this.sprite.height / 2)
                    return this.scene.falhar("Pouse na base!");

                this.sprite.position.copyFrom(this.posicao);
            },
        };

        // 🆕 Cria os elementos de UI
        this.createUI();
        this.setup();
    }

    /** Carrega assets, cria o sprite da nave e inicia os listeners */
    setup() {
        this.dialogoFalha.classList.add("hidden");

        const background = new PIXI.Sprite(PIXI.Assets.get(this.caminhos.fundo));
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        background.anchor.set(0);

        this.texturasCarregadas = {
            [this.caminhos.nave]: PIXI.Assets.get(this.caminhos.nave),
            [this.caminhos.base]: PIXI.Assets.get(this.caminhos.base)
        };

        this.nave.sprite = new PIXI.Sprite(this.texturasCarregadas[this.caminhos.nave]);
        this.nave.sprite.anchor.set(0.5);
        this.nave.sprite.scale.set(0.2);
        this.nave.sprite.zIndex = 10;
        this.addChild(this.nave.sprite);

        this.bindDOMElements();
        this.carregarNivel(this.nivelAtual);
        this.app.ticker.add(this.update, this);

        const controlsGuide = document.getElementById("controls-guide");
        if (controlsGuide) {
            controlsGuide.innerHTML = `
                <span><kbd>←</kbd> <kbd>→</kbd> / <kbd>↑</kbd> <kbd>↓</kbd>: Propulsores</span>
            `;
        }
    }

    /** ⚠️ CORRIGIDO: Apenas cria e anexa os elementos DOM */
    createUI() {
        // Pega o container principal do jogo no game.html
        const gameContainer = document.querySelector(".game-container");

        // 🔹 Painel de controle
        this.controlsPanel = document.createElement("div");
        this.controlsPanel.className = "controls-panel"; // Puxa o CSS do game.html
        this.controlsPanel.innerHTML = `
            <label><span>Força Propulsor:</span><input type="range" id="forcaSlider" min="100" max="1000" value="300"></label>
            <label><span>Gravidade:</span><input type="range" id="gravidadeSlider" min="0" max="20" step="0.1" value="1.6"></label>
            <label><span>Massa da Nave:</span><input type="range" id="massaSlider" min="1" max="10" value="5"></label>
        `;
        // Anexa dentro do container do jogo
        gameContainer.appendChild(this.controlsPanel);

        this.controlsPanel.className = "controls-panel hidden";  // Começa escondido        

        // ⚠️ OS LISTENERS FORAM REMOVIDOS DAQUI ⚠️

        // Apenas guarda as referências (isto está correto)
        this.forcaSlider = this.controlsPanel.querySelector("#forcaSlider");
        this.gravidadeSlider = this.controlsPanel.querySelector("#gravidadeSlider");
        this.massaSlider = this.controlsPanel.querySelector("#massaSlider");

        // 🔹 Diálogo de falha
        this.dialogoFalha = document.createElement("div");
        this.dialogoFalha.className = "dialogo-falha hidden"; // Puxa o CSS
        this.dialogoFalha.innerHTML = `
            <p></p>
            <button id="btnReiniciar" class="exit-button">Reiniciar</button>
        `;
        // Anexa dentro do container do jogo
        gameContainer.appendChild(this.dialogoFalha);
        this.btnReiniciar = this.dialogoFalha.querySelector("#btnReiniciar");
    }

    /** ⚠️ CORRIGIDO: Agora é o ÚNICO lugar que adiciona listeners */
    bindDOMElements() {
        // Salva as referências para poder remover depois
        this.onKeyDown = (e) => (this.keys[e.key.toLowerCase()] = true);
        this.onKeyUp = (e) => (this.keys[e.key.toLowerCase()] = false);
        this.onReiniciarClick = () => this.reiniciarNivel();
        
        this.onForcaChange = (e) => (this.nave.forcaPropulsor = Number(e.target.value));
        this.onGravidadeChange = (e) => (this.gravidade = Number(e.target.value));
        this.onMassaChange = (e) => (this.nave.massa = Number(e.target.value));

        // Adiciona os listeners
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        
        this.btnReiniciar.addEventListener("click", this.onReiniciarClick);
        this.forcaSlider.addEventListener("input", this.onForcaChange);
        this.gravidadeSlider.addEventListener("input", this.onGravidadeChange);
        this.massaSlider.addEventListener("input", this.onMassaChange);
    }

    /** O loop principal do minigame */
    update = (delta) => {
        const dt = delta / 60; // Delta time em segundos

        if (!this.nave.pousou) {
            const deslocamentoY = 18;
            if (this.keys["arrowup"] || this.keys["w"]) {
                this.nave.aplicarForca(0, -this.nave.forcaPropulsor);          
                this.criarParticula(this.nave.posicao.x, this.nave.posicao.y + deslocamentoY, 0, 1); 
            }
            if (this.keys["arrowdown"] || this.keys["s"]) {
                this.nave.aplicarForca(0, this.nave.forcaPropulsor);          
                this.criarParticula(this.nave.posicao.x, this.nave.posicao.y - deslocamentoY, 0, -1);
            }
            if (this.keys["arrowleft"] || this.keys["a"]) {
                this.nave.aplicarForca(-this.nave.forcaPropulsor, 0);          
                this.criarParticula(this.nave.posicao.x + deslocamentoY, this.nave.posicao.y, 1, 0);
            }
            if (this.keys["arrowright"] || this.keys["d"]) {
                this.nave.aplicarForca(this.nave.forcaPropulsor, 0);          
                this.criarParticula(this.nave.posicao.x - deslocamentoY, this.nave.posicao.y, -1, 0);
            }
        }
        this.nave.update(dt);

        // Loop de atualização das partículas 
        for (let i = this.particulas.length - 1; i >= 0; i--) {
            const p = this.particulas[i];
            p.vida -= dt;
            if (p.vida <= 0) {
                p.destroy(); 
                this.particulas.splice(i, 1);
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha = p.vida / this.CONFIG_PARTICULAS.tempoDeVida;
            }
        }
    }

    // --- Métodos do Jogo  ---

    reiniciarPosicaoNave() {
        this.nave.posicao = { x: this.app.screen.width / 2, y: 50 };
        this.nave.velocidade = { x: 0, y: 0 };
        this.nave.pousou = false;
        this.dialogoFalha.classList.add("hidden");
    }

    reiniciarNivel() {
        this.carregarNivel(this.nivelAtual);
    }

    falhar(motivo) {
        this.nave.pousou = true;
        this.mostrarDialogo(motivo);
    }

    proximoNivel() {
        this.nivelAtual++;
        if (this.nivelAtual >= this.niveis.length) {
            this.showMessage("Parabéns, você completou o treinamento!", "#3498db");
            this.nivelAtual = 0;
            this.carregarNivel(this.nivelAtual);
            this.controlsPanel.classList.remove("hidden"); // Mostra sliders
        } else {
            this.showMessage(`Nível ${this.nivelAtual + 1}!`, "#3498db");
            this.carregarNivel(this.nivelAtual);
        }
    }

    carregarNivel(n) {
        // Limpa objetos antigos da cena
        this.obstaculos.forEach((o) => o.destroy());
        this.obstaculos = [];
        if (this.base) this.base.destroy();
        if (this.hitboxBase) this.hitboxBase.destroy();

        const dadosNivel = this.niveis[n];
        
        // Cria a base (visual)
        this.base = new PIXI.Sprite(this.texturasCarregadas[this.caminhos.base]);
        this.base.anchor.set(0.5, 1);
        this.base.scale.set(0.2);
        this.base.x = this.app.screen.width * dadosNivel.basePos.x;
        this.base.y = this.app.screen.height * dadosNivel.basePos.y;
        this.base.zIndex = 5; 
        this.addChild(this.base); // Adiciona à cena

        // Cria o hitbox da base (lógico)
        const hitboxWidth = this.base.width * 0.8;
        this.hitboxBase = new PIXI.Graphics();
        // this.hitboxBase.beginFill(0x00ff00, 0.5); // Visualizar hitbox
        this.hitboxBase.drawRect(0, 0, hitboxWidth, this.hitboxHeight);
        this.hitboxBase.endFill();
        this.hitboxBase.pivot.set(hitboxWidth / 2, this.hitboxHeight / 2);
        this.hitboxBase.x = this.base.x;    
        this.hitboxBase.y = this.base.y; 
        this.addChild(this.hitboxBase); // Adiciona à cena

        // Cria os obstáculos
        dadosNivel.obstaculos.forEach(obsData => {
            const obstaculo = this.criarObstaculo(
                this.app.screen.width * obsData.x,
                this.app.screen.height * obsData.y,
                obsData.w,
                obsData.h
            );
            this.obstaculos.push(obstaculo);
            this.addChild(obstaculo); // Adiciona à cena
        });

        this.reiniciarPosicaoNave();
    }

    criarObstaculo(x, y, w, h) {
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

    criarParticula(x, y, dirX, dirY) {
        const p = new PIXI.Graphics();
        p.beginFill(this.CONFIG_PARTICULAS.cor);    
        p.drawCircle(0, 0, this.CONFIG_PARTICULAS.tamanho); 
        p.endFill();
        p.x = x;
        p.y = y;

        const angulo = Math.atan2(dirY, dirX);
        const spread = Math.PI / 4;
        const novoAngulo = angulo + (Math.random() - 0.5) * spread;
        const velocidadeFinal = this.CONFIG_PARTICULAS.velocidade * (1 + Math.random());

        p.vx = Math.cos(novoAngulo) * velocidadeFinal;
        p.vy = Math.sin(novoAngulo) * velocidadeFinal;
        p.vida = this.CONFIG_PARTICULAS.tempoDeVida;

        this.particulas.push(p);
        this.addChild(p); // Adiciona à cena
    }
  
    // --- Métodos de UI ---

    mostrarDialogo(texto) {
        this.dialogoFalha.querySelector("p").textContent = texto;
        this.dialogoFalha.classList.remove("hidden");
    }

    showMessage(text, color = "#FFFFFF") {
        const feedbackText = new PIXI.Text(text, {
            fontFamily: "Fredoka", fontSize: 32, fill: color,
            stroke: 0x000000, strokeThickness: 5, align: "center",
        });
        feedbackText.anchor.set(0.5);
        feedbackText.x = this.app.screen.width / 2;
        feedbackText.y = 80;
        this.addChild(feedbackText); // Adiciona à cena
        setTimeout(() => feedbackText.destroy(), 2000);
    }

    /**
     * Limpa a cena antes de ser destruída.
     * Este é o método mais importante para a modularidade.
     */
    destroyScene() {
        // 1. Previne destruição dupla (Correto!)  
        if (this._destroyedScene) return;
        this._destroyedScene = true;

        // 2. Para o loop de update da cena
        this.app.ticker.remove(this.update, this);

        // 3. Remove os event listeners (DEVE VIR ANTES de remover os elementos)
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
            
        // (Verifica se os elementos existem antes de remover os listeners)
        if (this.btnReiniciar) {
        this.btnReiniciar.removeEventListener("click", this.onReiniciarClick);
        }
        if (this.forcaSlider) {
        this.forcaSlider.removeEventListener("input", this.onForcaChange);
        }
        if (this.gravidadeSlider) {
        this.gravidadeSlider.removeEventListener("input", this.onGravidadeChange);
        }
        if (this.massaSlider) {
        this.massaSlider.removeEventListener("input", this.onMassaChange);
        }

        // 4. Remove os elementos DOM que esta cena criou
    
        if (this.controlsPanel) this.controlsPanel.remove();
        if (this.dialogoFalha) this.dialogoFalha.remove();    

  }
}