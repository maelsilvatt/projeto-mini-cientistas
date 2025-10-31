/* =================================================================
 * Preloader.js
 * Carrega TODOS os assets do jogo e redireciona para o menu (index.html).
 * ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    
    const loadingText = document.getElementById("loading-text");

    // A MASTER LIST DE ASSETS (copiada da sua LoaderScene)
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
        "assets/characters/nave/base.png",
        "assets/backgrounds/fundo planeta 2.png"
    ];

    const allAssetsToLoad = [
        ...hubAssets,
        ...landingMinigameAssets
    ];

    // Função assíncrona para carregar
    async function preload() {
        try {
            // Carrega tudo com a função de progresso
            await PIXI.Assets.load(allAssetsToLoad, (progress) => {
                loadingText.textContent = `Carregando... ${Math.round(progress * 100)}%`;
            });

            // Carregamento completo
            loadingText.textContent = "Pronto!";
            
            // Redireciona para o menu principal
            window.location.href = 'menu.html';

        } catch (e) {
            loadingText.textContent = "Erro ao carregar. Por favor, atualize a página.";
            console.error("Erro no pré-carregamento:", e);
        }
    }

    // Inicia o carregamento
    preload();
});