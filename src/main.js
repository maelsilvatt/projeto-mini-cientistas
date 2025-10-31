/* =================================================================
 * main.js
 * O PONTO DE ENTRADA PRINCIPAL do jogo "Mini Cientistas".
 * (Versão corrigida com a lógica do sessionStorage)
 * ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos do HTML ---
    const canvasWrapper = document.querySelector(".canvas-wrapper");
    const canvas = document.getElementById("pixi-canvas");

    // 1. CRIA A APLICAÇÃO PIXI
    const app = new PIXI.Application({
        view: canvas,
        resizeTo: canvasWrapper,
        backgroundColor: 0x1099bb, // Esta é a tela azul que você vê
        antialias: true,
    });

    // 2. CRIA O GERENCIADOR DE CENAS
    const sceneManager = new SceneManager(app);

    // 3. ⚠️ ESTE É O BLOCO QUE ESTÁ FALTANDO ⚠️
    // LÊ A CENA ESCOLHIDA NO MENU
    // Pega o valor do sessionStorage (ex: 'biologia' ou 'fisica')
    // Se for nulo (ex: abriu game.html direto), usa 'biologia' como padrão.
    const startSceneName = sessionStorage.getItem('startScene') || 'biologia';

    // Limpa o sessionStorage para que não afete o recarregamento (F5)
    sessionStorage.removeItem('startScene');

    // 4. CARREGA A CENA DE CARREGAMENTO
    try {
        // Agora 'startSceneName' existe e será passada corretamente
        const loaderScene = new LoaderScene(app, sceneManager, startSceneName);
        sceneManager.loadScene(loaderScene);

    } catch (e) {
        console.error("Erro ao carregar a cena inicial (LoaderScene).", e);
    }
});