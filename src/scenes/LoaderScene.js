/* =================================================================
 * LoaderScene.js
 * Carrega todos os assets do jogo e mostra uma barra de progresso.
 * ================================================================= */

class LoaderScene extends PIXI.Container {

    constructor(app, sceneManager) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;

        // 1. Criar texto de carregamento
        this.loadingText = new PIXI.Text("Carregando... 0%", {
            fontFamily: "Fredoka",
            fontSize: 32,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.position.set(app.screen.width / 2, app.screen.height / 2);
        this.addChild(this.loadingText);

        // 2. Iniciar o carregamento
        this.loadAllAssets();
    }

    async loadAllAssets() {
        
        // --- 3. A MASTER LIST DE ASSETS ---
        // (Combine todos os assets de todas as suas cenas aqui)

        const hubAssets = [
            'assets/backgrounds/laboratorio-biologia-1.png',
            'assets/backgrounds/laboratorio-biologia-2.png',
            'assets/backgrounds/laboratorio-biologia-3.png',
            'assets/characters/julia/julia-atlas.json',
            'assets/characters/pasteur/pasteur-idle.png',
            'assets/characters/julia/julia-portrait.png',
            'assets/characters/pasteur/pasteur-portrait.png',
            'assets/dialogues/biologia_intro.json',
            'assets/ui/balao-exclamacao.png',
            'assets/objects/microscopio.png'
        ];

        const landingMinigameAssets = [
            "assets/characters/nave/nave.png",
            "assets/characters/nave/base.png"
        ];
        
        // (Adicione assets de outras cenas aqui no futuro)

        const allAssetsToLoad = [
            ...hubAssets,
            ...landingMinigameAssets
        ];

        // --- 4. Carregar tudo com progresso ---
        await PIXI.Assets.load(allAssetsToLoad, (progress) => {
            // Atualiza o texto de progresso
            this.loadingText.text = `Carregando... ${Math.round(progress * 100)}%`;
        });

        // --- 5. Carregamento completo ---
        this.onLoadComplete();
    }

    onLoadComplete() {
        this.loadingText.text = "Pronto!";
        
        // 6. Diz ao SceneManager para carregar a primeira cena real
        const hubScene = new HubBiologiaScene(this.app, this.sceneManager);
        this.sceneManager.loadScene(hubScene);
    }

    /** Limpa esta cena (não há muito o que limpar) */
    destroyScene() {
        this.app.ticker.remove(this.update);
    }
        
}