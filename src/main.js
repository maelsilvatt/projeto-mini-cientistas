/* =================================================================
 * main.js
 * O PONTO DE ENTRADA PRINCIPAL do jogo "Mini Cientistas".
 * ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos do HTML ---
    const canvasWrapper = document.querySelector(".canvas-wrapper");
    const canvas = document.getElementById("pixi-canvas");

    // 1. CRIA A APLICAÇÃO PIXI (UMA ÚNICA VEZ)
    const app = new PIXI.Application({
        view: canvas,
        resizeTo: canvasWrapper,
        backgroundColor: 0x1099bb, // Cor de fundo padrão
        antialias: true,
    });

    // 2. CRIA O GERENCIADOR DE CENAS
    const sceneManager = new SceneManager(app);

    // 3. ⚠️ MUDANÇA: CARREGA A CENA DE CARREGAMENTO
    try {
        // Em vez de carregar o Hub, carregamos o Loader
        const loaderScene = new LoaderScene(app, sceneManager);
        sceneManager.loadScene(loaderScene);

    } catch (e) {
        console.error("Erro ao carregar a cena inicial (LoaderScene).", e);
    }
});