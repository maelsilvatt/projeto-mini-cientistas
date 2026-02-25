/* =================================================================
 * LoaderScene.js 
 * Esta cena apenas decide qual cena real carregar. 
 * ================================================================= */

class LoaderScene extends PIXI.Container {

    /**
     * @param {PIXI.Application} app
     * @param {SceneManager} sceneManager
     * @param {string} startSceneName - O nome da cena a carregar (ex: 'biologia')
     */
    constructor(app, sceneManager, startSceneName) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;
        this.startSceneName = startSceneName;

        // Chama a lógica de roteamento imediatamente.
        this.routeToScene();
    }

    routeToScene() {
        // Como o 'preloader.js' já carregou tudo, 
        // a criação das cenas seguintes será instantânea.

        let sceneToLoad;

        switch (this.startSceneName) {
            case 'biologia':
                sceneToLoad = new HubBiologiaScene(this.app, this.sceneManager);
                break;

            case 'fisica':
                sceneToLoad = new LandingMinigameScene(this.app, this.sceneManager);
                break;

            case 'teste':
                // IMPORTANTE: Troque "NomeDaSuaClasse" pelo nome EXATO da classe 
                // que você criou dentro do arquivo Hubminigame-test.js
                sceneToLoad = new HubMiniGameTest(this.app, this.sceneManager);
                break;
            // -------------------------------------

            default:
                // Fallback, caso algo dê errado
                console.warn(`Cena "${this.startSceneName}" não reconhecida. Carregando Hub de Biologia.`);
                sceneToLoad = new HubBiologiaScene(this.app, this.sceneManager);
        }

        // Inicia a cena escolhida
        this.sceneManager.loadScene(sceneToLoad);
    }

    /** Limpa esta cena (não há nada para limpar) */
    destroyScene() {
        // Esta cena é tão rápida que não precisa de ticker
    }
}