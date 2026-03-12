import * as PIXI from 'pixi.js';

// Importação direta das classes das cenas
import { HubLabsScene } from '../scenes/HubLabsScene';
import { HubBiologiaScene } from '../scenes/HubBiologiaScene';
import { LandingMinigameScene } from '../scenes/minigames/physics/LandingMinigame';
import { IScene } from '../core/BaseScene'; 

export class SceneManager {
    private app: PIXI.Application;
    private audioManager: any;
    private currentScene: IScene | null = null;

    private scenes: Record<string, new (...args: any[]) => IScene> = {
        'hub-labs': HubLabsScene,
        'hub-biologia': HubBiologiaScene,
        'landing-minigame': LandingMinigameScene,
    };

    constructor(app: PIXI.Application, audioManager: any) {
        this.app = app;
        this.audioManager = audioManager;
    }
    
    public async changeScene(sceneId: string) {
        this.cleanupCurrentScene();

        // Ativa a interface correta (mostra o game-screen)
        this.toggleDOMInterface(sceneId); 

        const SceneClass = this.scenes[sceneId];
        const newScene = new SceneClass(this.app, this, this.audioManager);
        
        // Agora inicializa (o DOM já está visível para o querySelector funcionar)
        await newScene.initScene();

        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
    }

    private loadScene(newScene: IScene): void {
        if (this.currentScene) {
            this.cleanupCurrentScene();
        }

        this.toggleDOMInterface(newScene.sceneId);

        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
    }
    
    private cleanupCurrentScene(): void {
        const s = this.currentScene;
        if (!s) return;        

        // Executa a limpeza da BaseScene + qualquer override da cena filha
        if (s.destroyScene) {
            s.destroyScene();
        }

        // Remove o container do palco e libera memória de GPU
        this.app.stage.removeChild(s);
        s.destroy({ children: true });

        this.currentScene = null;
    }

    private toggleDOMInterface(sceneId: string): void {
        const menuDiv = document.getElementById("menu-screen");
        const gameDiv = document.getElementById("game-screen");

        if (!menuDiv || !gameDiv) return;

        if (sceneId === "hub-labs") {
            menuDiv.classList.remove("hidden");
            gameDiv.classList.add("hidden");
        } else {
            menuDiv.classList.add("hidden");
            gameDiv.classList.remove("hidden");

            const wrapper = gameDiv.querySelector('.canvas-wrapper');
            if (wrapper) {
                this.app.renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
            }
        }
    }
}