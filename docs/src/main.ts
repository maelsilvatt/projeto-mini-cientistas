import * as PIXI from 'pixi.js';
import { AudioManager } from './core/AudioManager';
import { SceneManager } from './core/SceneManager';

// Importa o estilo principal (Tailwind v4)
import '/assets/styles/main.css';

document.addEventListener("DOMContentLoaded", () => {    
    const menuScreen = document.getElementById("menu-screen") as HTMLElement;
    const gameScreen = document.getElementById("game-screen") as HTMLElement;
    const canvas = document.getElementById("pixi-canvas") as HTMLCanvasElement;
    
    // Inicialização dos Gerenciadores
    const audioManager = new AudioManager();
    audioManager.init();

    // Configuração do App PixiJS (v8)
    const app = new PIXI.Application();
    
    // Inicialização assíncrona do App
    app.init({
        canvas: canvas,
        resizeTo: canvas.parentElement || window,
        backgroundColor: 0x1099bb,
        antialias: true,
    }).then(() => {
        const sceneManager = new SceneManager(app, audioManager);

        // Função global para iniciar o jogo
        (window as any).startGame = (startSceneName: string) => {
            menuScreen.classList.add("hidden");
            gameScreen.classList.remove("hidden");

            try {
                sceneManager.changeScene(startSceneName);
            } catch (e) {
                console.error("Erro ao iniciar a cena:", e);
            }
        };

        // Lógica para o botão de sair do jogo (voltar ao menu)
        const btnSairJogo = document.getElementById("game-exit-button");
        if (btnSairJogo) {
            btnSairJogo.onclick = () => {
                // No TS, passamos null com cast para garantir a limpeza
                sceneManager.changeScene("hub-labs"); // Ou sua lógica de voltar ao menu
                
                gameScreen.classList.add("hidden");
                menuScreen.classList.remove("hidden");
            };
        }

        // Controle da tecla ESC para sair do jogo ou fechar menus
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (!gameScreen.classList.contains('hidden')) {
                    const btn = document.getElementById('game-exit-button');
                    btn?.click();
                } else if (!menuScreen.classList.contains('hidden')) {
                    const btn = document.querySelector('#menu-screen .exit-button') as HTMLButtonElement;
                    btn?.click();
                }
            }
        });

        // Preload de Assets com PIXI v8 (usando Promises)
        const preloadAllAssets = async () => {            
            console.log("Iniciando carregamento de assets...");
            
            const allAssetsToLoad = [
                // Carrossel e Fundos
                '/assets/labs/quimica.png',
                '/assets/labs/fisica.png',
                '/assets/labs/biologia.png',
                '/assets/backgrounds/menu-laboratorio.png',
                // Adicione conforme necessário para outras cenas e assets (sprites, diálogos, etc.)
            ];

            try {
                await PIXI.Assets.load(allAssetsToLoad);
                console.log("Assets prontos!");

                // Esconde o Loader (Usando classes Tailwind v4)
                const loader = document.getElementById("loader-screen");
                loader?.classList.add("hidden");

                // Inicia no Hub de Laboratórios
                (window as any).startGame('hub-labs');

            } catch (e) {
                console.error("Erro no carregamento de assets:", e);
            }
        };

        preloadAllAssets();
    });
});