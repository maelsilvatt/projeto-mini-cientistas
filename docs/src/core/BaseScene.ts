import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager';
import { AudioManager } from './AudioManager';

export interface IScene extends PIXI.Container {
    sceneId: string;
    uiLayer?: HTMLElement;
    _registeredListeners: Array<{ target: EventTarget; type: string; handler: any }>;
    initScene(): Promise<void>;
    update?: (ticker: PIXI.Ticker) => void;
    destroyScene: () => void;
}

export abstract class BaseScene extends PIXI.Container implements IScene {    
    public abstract sceneId: string;
    public uiLayer?: HTMLDivElement;
    public _registeredListeners: Array<{ target: EventTarget; type: string; handler: any }> = [];

    protected app: PIXI.Application;
    protected sceneManager: SceneManager;
    protected audioManager: AudioManager;

    constructor(app: PIXI.Application, sceneManager: SceneManager, audioManager: AudioManager) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;
        this.audioManager = audioManager;        
    }

    public async initScene() {
        this.setupUI();             // Cria o HTML        
        this.setupEventListeners(); // Configura inputs (CUIDADO: Elementos precisam existir aqui)
        await this.setup();         // Inicializa assets
        this.app.ticker.add(this.update, this);
    }

    /** * Implementação padrão de UI.
     * Cada cena pode sobrescrever getUIHTML para fornecer seu próprio conteúdo com Tailwind *     
     */
    protected setupUI(): void {
        const gameScreen = document.querySelector(".canvas-wrapper"); 
        if (!gameScreen) {
            console.error("[BaseScene] Erro: .canvas-wrapper não encontrado no DOM.");
            return;
        }

        this.uiLayer = document.createElement("div");
        // Classes Tailwind v4 para garantir que a UI fique sobre o Canvas
        this.uiLayer.className = "absolute inset-0 z-20 pointer-events-none flex flex-col";
        
        // O conteúdo será definido pelas cenas filhas através de um getter ou método
        this.uiLayer.innerHTML = this.getUIHTML();
        
        gameScreen.appendChild(this.uiLayer);
    }

    /** Cada cena deve fornecer seu próprio HTML com classes Tailwind */
    protected abstract getUIHTML(): string;

    /** Configuração de interações (Teclado/Mouse) */
    protected setupEventListeners(): void {
        // Implementação padrão ou vazia para ser sobrescrita
    }

    /** Método para registrar listeners de forma segura para limpeza posterior */
    protected addGlobalListener(target: EventTarget, type: string, handler: (e: any) => void): void {
        target.addEventListener(type, handler);
        this._registeredListeners.push({ target, type, handler });
    }

    /** Inicialização de assets - Cada cena decide o que carregar */
    protected abstract setup(): Promise<void>;

    /** Loop de renderização - Implementação padrão vazia */
    public update = (ticker: PIXI.Ticker): void => {
        // Lógica de frame
    };

    /** Hook de destruição chamado pelo SceneManager */
    public destroyScene(): void {
        // Para o loop de atualização automaticamente
        this.app.ticker.remove(this.update, this);

        // Remove a camada de UI do DOM
        this.uiLayer?.remove();

        // Limpa todos os listeners de teclado/mouse registrados
        this._registeredListeners.forEach(l => {
            l.target.removeEventListener(l.type, l.handler);
        });

        console.log(`[BaseScene] Limpeza genérica de ${this.sceneId} concluída.`);
    }
}