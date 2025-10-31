/* =================================================================
 * HubBiologiaScene.js
 * A cena principal do Hub de Biologia.
 * (Esta versão assume que a 'LoaderScene.js' já carregou todos os assets)
 * ================================================================= */

class HubBiologiaScene extends PIXI.Container {
    /**
     * @param {PIXI.Application} app - A aplicação PIXI principal.
     * @param {SceneManager} sceneManager - O gerenciador de cenas (para transições).
     */
    constructor(app, sceneManager) {
        super(); // Chama o construtor do PIXI.Container
        
        this.app = app;
        this.sceneManager = sceneManager;

        // Propriedades da cena
        this.worldContainer = new PIXI.Container();
        this.player = null;
        this.camera = null;
        this.dialogueManager = null;
        this.indicator = null;

        // Adiciona o mundo (panorama) à cena
        this.addChild(this.worldContainer);

        // Inicia a configuração (não é mais async)
        this.setup();
    }

    /**
     * Configura a cena (assume que os assets já foram carregados).
     */
    setup() {
        
        // --- Definição de CAMINHOS de Assets (para referência) ---
        // (Estes caminhos devem ser os mesmos da 'LoaderScene')
        const backgroundAssetsPaths = [
            'assets/backgrounds/laboratorio-biologia-1.png',
            'assets/backgrounds/laboratorio-biologia-2.png',
            'assets/backgrounds/laboratorio-biologia-3.png'
        ];
        const playerAtlasPath = 'assets/characters/julia/julia-atlas.json';
        const pasteurPath = 'assets/characters/pasteur/pasteur-idle.png';
        const microscopePath = 'assets/objects/microscopio.png';
        const indicatorPath = 'assets/ui/balao-exclamacao.png';
        const dialoguePath = 'assets/dialogues/biologia_intro.json';

        // --- Monta o Panorama ---
        let currentX = 0;
        for (const path of backgroundAssetsPaths) {
            // USA .get() para pegar a textura do cache
            const bgSprite = new PIXI.Sprite(PIXI.Assets.get(path));
            bgSprite.height = this.app.screen.height;
            bgSprite.scale.x = bgSprite.scale.y;
            bgSprite.x = currentX;
            this.worldContainer.addChild(bgSprite);
            currentX += bgSprite.width;
        }

        // --- Instancia Componentes de UI ---
        this.dialogueManager = new DialogueManager(this.app);
        // USA .get()
        this.indicator = new InteractionIndicator(PIXI.Assets.get(indicatorPath));
        this.addChild(this.indicator.sprite); 

        // --- Instancia GameObjects ---
        
        // 1. Extrai as animações do atlas (que está no cache)
        const juliaAtlas = PIXI.Assets.get(playerAtlasPath);
        const playerTextures = {
            idle: juliaAtlas.animations['idle'],
            walk: juliaAtlas.animations['walk']
        };

        // 2. Define os limites
        const playerBoundaries = {
            minY: 300, 
            maxY: this.app.screen.height - 80,
        };

        // 3. Cria o Player
        this.player = new Player(
            playerTextures, 
            this.worldContainer, 
            this.app, 
            playerBoundaries
        );
        
        // --- Cria Pasteur e Microscópio (usando .get()) ---
        const pasteur = new NPC(PIXI.Assets.get(pasteurPath), { 
            x: 800, 
            y: this.app.screen.height - 20 
        });
        const microscope = new InteractiveObject(PIXI.Assets.get(microscopePath), { 
            x: 1500, 
            y: this.app.screen.height - 50, 
            scale: 0.4 
        });
        this.worldContainer.addChild(pasteur.sprite, microscope.sprite);
        
        // --- Instancia a Câmera ---
        this.camera = new Camera(this.worldContainer, this.app.screen);
        this.camera.follow(this.player.sprite);

        // --- Configura os Gatilhos da Cena ---
        // Pega o JSON do diálogo (que está no cache)
        const introScriptData = PIXI.Assets.get(dialoguePath);
        // Passa os dados para a função de gatilhos
        this.setupTriggers(pasteur, microscope, introScriptData);
        
        // --- Inicia o Loop de Update da Cena ---
        this.app.ticker.add(this.update);
    }

    /**
     * Configura a lógica de interação (gatilhos) desta cena.
     * (Recebe introScriptData como argumento)
     */
    setupTriggers(pasteur, microscope, scriptIntroducao) { // <-- Argumento aqui

        // GATILHO 1: Falar com Pasteur
        const startPasteurDialogue = () => {
            if (this.dialogueManager.isActive) return;
            
            this.player.lockMovement(); 
            
            // Usa o argumento 'scriptIntroducao'
            this.dialogueManager.start(scriptIntroducao, () => {
                // Callback (quando o diálogo terminar):
                this.player.unlockMovement(); 
                pasteur.disableInteraction(); 
                microscope.enableInteraction(startMicroscopeScene);
                this.indicator.onClick = startMicroscopeScene;
                this.indicator.setTarget(microscope.sprite, -120);
            });
        };

        // GATILHO 2: Usar o Microscópio
        const startMicroscopeScene = () => {
            if (this.dialogueManager.isActive) return;
            
            console.log("Transição para a Cena 2: Mundo Invisível!");
            this.indicator.hide();
            
            // ⚠️ AQUI ESTÁ A MÁGICA DA TRANSIÇÃO
            // No futuro, você faria isso:
            // const minigame = new BiologyMinigame(this.app, this.sceneManager);
            // this.sceneManager.loadScene(minigame);
        };

        // --- Atribuição Inicial dos Gatilhos ---
        pasteur.enableInteraction(startPasteurDialogue);
        this.indicator.onClick = startPasteurDialogue;
        this.indicator.setTarget(pasteur.sprite);
    }

    /**
     * O loop principal da cena, chamado a cada frame pelo ticker do app.
     * (Usamos uma arrow function para manter o 'this' correto).
     */
    update = (delta) => {
        // Se os componentes não estão prontos, não faz nada.
        if (!this.player || !this.camera || !this.indicator || !this.dialogueManager) {
            return;
        }

        // Pausa a lógica da cena se o diálogo estiver ativo
        if (this.dialogueManager.isActive) {
            return; 
        }

        // Atualiza todos os componentes da cena
        this.player.update();
        this.indicator.update();
        this.camera.update();
    }

    /**
     * Limpa a cena antes de ser destruída (importante para evitar memory leaks).
     */
    destroyScene() {
        // Remove o listener do ticker
        this.app.ticker.remove(this.update);

        // (O SceneManager vai destruir os filhos do PIXI.Container, 
        // mas é bom limpar ouvintes de eventos globais se você os tiver)
    }
}