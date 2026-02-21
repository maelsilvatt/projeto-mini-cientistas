/* =================================================================
 * SceneManager.js
 * Gerencia a transição entre diferentes cenas 
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
     * Remove elementos de UI criados dinamicamente por cenas (ex: minigames).
     */
    clearDynamicUI() {
        const uiSelectors = [
            ".controls-panel",
            ".dialogo-falha"
        ];
        uiSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
    }

    /**
     * Carrega uma nova cena, destruindo a anterior e limpando o DOM.
     * @param {PIXI.Container} newScene - A nova cena (deve ser uma classe que estende PIXI.Container).
     */
    loadScene(newScene) {
        // 1️⃣ Remove UI residual
        this.clearDynamicUI();

        // 2️⃣ Destroi a cena atual
        if (this.currentScene) {
            if (typeof this.currentScene.destroyScene === 'function') {
                this.currentScene.destroyScene();
            }
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy({ children: true });
        }

        // 3️⃣ Adiciona a nova cena
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
    }
}
