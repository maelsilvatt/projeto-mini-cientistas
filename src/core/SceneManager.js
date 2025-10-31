/* =================================================================
 * SceneManager.js
 * Gerencia a transição entre diferentes cenas (ex: Hub -> Minigame).
 * ================================================================= */

class SceneManager {
    /**
     * @param {PIXI.Application} app - A aplicação PIXI principal.
     */
    constructor(app) {
        this.app = app;
        this.currentScene = null;
    }

    /**
     * Carrega uma nova cena, destruindo a cena anterior.
     * @param {PIXI.Container} newScene - A nova cena (deve ser uma classe que estende PIXI.Container).
     */
    loadScene(newScene) {
        // Se houver uma cena antiga, destrói ela
        if (this.currentScene) {
            // Se a cena tiver um método 'destroyScene' customizado, chama ele
            if (typeof this.currentScene.destroyScene === 'function') {
                this.currentScene.destroyScene();
            }
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy({ children: true });
        }

        // Adiciona a nova cena
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
    }
}