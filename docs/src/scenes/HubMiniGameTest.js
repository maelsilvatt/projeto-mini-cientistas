/* =================================================================
 * Hubminigame-test.js
 * Cena de Teste: Interação -> Diálogo -> Minigame em DOM
 * ================================================================= */

class HubMiniGameTest extends PIXI.Container {
    constructor(app, sceneManager) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;

        this.worldContainer = new PIXI.Container();
        this.dialogueManager = null;
        this.indicator = null;
        this.minigameSquare = null; // Referência para o elemento DOM -----

        this.addChild(this.worldContainer);
        this.setup();
    }

    setup() {
        // --- 1. Fundo Simples ---
        const bgTexture = PIXI.Assets.get('assets/backgrounds/laboratorio-biologia-1.png');
        if (bgTexture) {
            const bgSprite = new PIXI.Sprite(bgTexture);
            bgSprite.height = this.app.screen.height;
            bgSprite.scale.x = bgSprite.scale.y;
            this.worldContainer.addChild(bgSprite);
        }

        // --- 2. Instancia UI e Indicador ---
        this.dialogueManager = new DialogueManager(this.app);
        
        const indicatorTex = PIXI.Assets.get('assets/ui/balao-exclamacao.png');
        this.indicator = new InteractionIndicator(indicatorTex);
        this.addChild(this.indicator.sprite); 

        // --- 3. Cria o Objeto Interativo ---
        const objTex = PIXI.Assets.get('assets/objects/microscopio.png');
        const interactiveObj = new InteractiveObject(objTex, { 
            x: this.app.screen.width / 2, 
            y: this.app.screen.height / 2 + 100, 
            scale: 0.6 
        });
        interactiveObj.sprite.anchor.set(0.5);
        this.worldContainer.addChild(interactiveObj.sprite);

        // --- 4. Carrega o Diálogo JSON e Configura Gatilhos ---
        // Pega o arquivo DialogoTest.json que foi carregado no main.js
        const scriptDoMinigame = PIXI.Assets.get('assets/dialogues/DialogoTest.json');
        
        // Passa o objeto interativo E o script para a função de gatilhos
        this.setupTriggers(interactiveObj, scriptDoMinigame);

        // Inicia o Loop
        this.app.ticker.add(this.update);
    }

    setupTriggers(interactiveObj, scriptDoMinigame) { 
        
        const startDialogue = () => {
            if (this.dialogueManager.isActive) return;
            
            // Esconde o indicador enquanto conversa
            this.indicator.hide();
            
            // Inicia o DialogueManager passando o arquivo JSON dinâmico!
            this.dialogueManager.start(scriptDoMinigame, () => {
                // Callback: O que acontece quando o diálogo acaba (após o nó "end")
                interactiveObj.disableInteraction();
                this.startDomMinigame();
            });
        };

        // Ativa a interação no objeto e no balão
        interactiveObj.enableInteraction(startDialogue);
        this.indicator.onClick = startDialogue;
        this.indicator.setTarget(interactiveObj.sprite, -150); 
    }

    startDomMinigame() {
        console.log("Iniciando Minigame DOM!");

        // Array de cores para o quadrado trocar
        const colors = ['#FF69B4', '#87CEEB', '#9370DB', '#FFD700', '#32CD32'];
        let clickCount = 0;

        // Cria o elemento <div>
        this.minigameSquare = document.createElement('div');
        
        // Estiliza o elemento (Centralizado, em cima do canvas)
        Object.assign(this.minigameSquare.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            backgroundColor: colors[0],
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            zIndex: '1000',
            transition: 'background-color 0.2s, transform 0.1s'
        });

        // Adiciona a lógica de clique
        this.minigameSquare.addEventListener('click', () => {
            clickCount++;
            
            // Efeito visual de "apertar"
            this.minigameSquare.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                if (this.minigameSquare) {
                    this.minigameSquare.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            }, 100);

            // Troca a cor ou encerra o jogo
            if (clickCount < colors.length) {
                this.minigameSquare.style.backgroundColor = colors[clickCount];
            } else {
                this.endDomMinigame();
            }
        });

        // Adiciona o elemento dentro da div do jogo (em cima do canvas)
        const gameScreen = document.getElementById('game-screen');
        gameScreen.appendChild(this.minigameSquare);
    }

    endDomMinigame() {
        // Remove o elemento da tela
        if (this.minigameSquare && this.minigameSquare.parentNode) {
            this.minigameSquare.parentNode.removeChild(this.minigameSquare);
            this.minigameSquare = null;
        }

        console.log("Minigame finalizado!");
        
        // Volta para o menu de seleção (opcional)
        const btnSairJogo = document.getElementById('game-exit-button');
        if (btnSairJogo) btnSairJogo.click();
    }

    update = (delta) => {
        if (!this.indicator || !this.dialogueManager) return;
        if (this.dialogueManager.isActive) return;

        this.indicator.update();
    }

    destroyScene() {
        // Remove o evento do loop
        this.app.ticker.remove(this.update); 
        
        // GARANTIA: Se o jogador apertar "Sair" no meio do minigame, limpa o elemento DOM
        if (this.minigameSquare && this.minigameSquare.parentNode) {
            this.minigameSquare.parentNode.removeChild(this.minigameSquare);
            this.minigameSquare = null;
        }
    }
}