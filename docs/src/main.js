/* =================================================================
 * main.js
 * O PONTO DE ENTRADA PRINCIPAL (Arquitetura SPA)
 * Gerencia as telas (Loader -> Menu -> Jogo) e o PixiJS.
 * ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Referências das "Telas" (DIVs) no HTML ---
    const loaderScreen = document.getElementById("loader-screen");
    const menuScreen = document.getElementById("menu-screen");
    const gameScreen = document.getElementById("game-screen");
    const loadingText = document.getElementById("loading-text");

    // --- Referências do Jogo (PIXI) ---
    const canvas = document.getElementById("pixi-canvas");
    let app, sceneManager;

    // --- Inicializa o Gerenciador de Áudio (Desbloqueio) ---
    const audioManager = new AudioManager();
    audioManager.init();

    // =================================================================
    // 1. FUNÇÃO GLOBAL PARA INICIAR O JOGO
    // (Chamada pelo menu 'HubLabsScene.js' quando o jogador escolhe uma fase)
    // =================================================================
    window.startGame = (startSceneName) => {
        console.log(`Iniciando fase: ${startSceneName}`);

        // 1. Troca de Tela: Esconde Menu -> Mostra Jogo
        menuScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");

        // 2. Inicializa o PIXI (se ainda não existir)
        if (!app) {
            app = new PIXI.Application({
                view: canvas,
                resizeTo: canvas.parentElement, // Ajusta ao tamanho da div wrapper
                backgroundColor: 0x1099bb,
                antialias: true,
            });
            sceneManager = new SceneManager(app);
        }

        // 3. Carrega a Cena Escolhida
        // Usamos o LoaderScene como "roteador" instantâneo
        try {
            const router = new LoaderScene(app, sceneManager, startSceneName);
            // O LoaderScene já chama o sceneManager.loadScene internamente
        } catch (e) {
            console.error("Erro ao iniciar a cena:", e);
        }
    };

    // =================================================================
    // 2. FUNÇÃO DO BOTÃO "SAIR" (VOLTAR AO MENU)
    // =================================================================
    const btnSairJogo = document.getElementById("game-exit-button");
    if (btnSairJogo) {
        btnSairJogo.onclick = () => {
            // 1. Troca de Tela: Esconde Jogo -> Mostra Menu
            gameScreen.classList.add("hidden");
            menuScreen.classList.remove("hidden");            
        };
    }

    // =================================================================
    // 3. PROCESSO DE INICIALIZAÇÃO (PRELOADER)
    // =================================================================
    async function preloadAllAssets() {
        
        // Lista Mestra de Assets (Hub + Minigames + UI)
        const allAssetsToLoad = [
            // Carrosel
            'assets/labs/quimica.png',
            'assets/labs/fisica.png',
            'assets/labs/biologia.png',
            'assets/labs/odonto.png',
            'assets/labs/medicina.png',
            'assets/labs/ia.png',
            'assets/backgrounds/menu laboratorio.png',

            // Fundos
            'assets/backgrounds/laboratorio-biologia-1.png',
            'assets/backgrounds/laboratorio-biologia-2.png',
            'assets/backgrounds/laboratorio-biologia-3.png',
            'assets/backgrounds/fundo planeta 2.png',
            // Personagens
            'assets/characters/julia/julia-atlas.json',
            'assets/characters/pasteur/pasteur-idle.png',
            'assets/characters/julia/julia-portrait.png',
            'assets/characters/pasteur/pasteur-portrait.png',
            'assets/characters/nave/nave.png',
            'assets/characters/nave/base.png',
            // UI e Objetos
            'assets/dialogues/biologia_intro.json',
            'assets/ui/balao-exclamacao.png',
            'assets/objects/microscopio.png'
        ];

        try {
            // Carrega tudo
            await PIXI.Assets.load(allAssetsToLoad, (progress) => {
                if (loadingText) {
                    loadingText.textContent = `Carregando... ${Math.round(progress * 100)}%`;
                }
            });

            // Fim do carregamento
            if (loadingText) loadingText.textContent = "Pronto!";
            
            // Transição: Esconde Loader -> Mostra Menu
            setTimeout(() => {
                loaderScreen.classList.add("hidden");
                menuScreen.classList.remove("hidden");
            }, 500); // Pequeno delay para suavidade

        } catch (e) {
            console.error("Erro fatal no carregamento de assets:", e);
            if (loadingText) loadingText.textContent = "Erro ao carregar!";
        }
    }

    // Começa tudo!
    preloadAllAssets();
});