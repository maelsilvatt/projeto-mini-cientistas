import * as PIXI from 'pixi.js';
import { BaseScene } from '../core/BaseScene';

export class HubBiologiaScene extends BaseScene {
    public sceneId = "hub-biologia";

    // Propriedades da Cena
    private worldContainer!: PIXI.Container;
    private player!: any; // Substitua pelo tipo real da sua classe Player
    private pasteur!: any; // Substitua pelo tipo real da sua classe InteractiveEntity
    private microscope!: any;
    private camera!: any;
    private dialogue!: any;
    private indicator!: any;

    protected getUIHTML(): string {
        return `
            <div id="ui-${this.sceneId}" class="absolute top-5 left-5 pointer-events-auto animate-fade-in">
                <div class="controls-panel border-l-[6px] border-bio-accent bg-white/92 p-4 shadow-game rounded-r-xl">
                    <div id="controls-guide" class="flex flex-col gap-2 text-font-dark text-sm font-medium">
                        <div class="flex items-center gap-2">
                            <span class="border-r border-black/10 pr-3">Mover</span>
                            <div class="flex gap-1">
                                <kbd class="bg-bio-accent text-white px-2 py-1 rounded shadow-[0_3px_0_var(--color-bio-dark)] text-xs">W</kbd>
                                <kbd class="bg-bio-accent text-white px-2 py-1 rounded shadow-[0_3px_0_var(--color-color-bio-dark)] text-xs">A</kbd>
                                <kbd class="bg-bio-accent text-white px-2 py-1 rounded shadow-[0_3px_0_var(--color-color-bio-dark)] text-xs">S</kbd>
                                <kbd class="bg-bio-accent text-white px-2 py-1 rounded shadow-[0_3px_0_var(--color-color-bio-dark)] text-xs">D</kbd>
                            </div>
                        </div>
                        <div class="text-[10px] opacity-60 italic">* Use as setas ou arraste para navegar</div>
                    </div>
                </div>
            </div>
        `;
    }

    protected async setup(): Promise<void> {
        // 1. Setup do Mundo e Parallax
        this.worldContainer = new PIXI.Container();
        this.addChild(this.worldContainer);

        const bgPaths = [
            '/assets/backgrounds/laboratorio-biologia-1.png',
            '/assets/backgrounds/laboratorio-biologia-2.png',
            '/assets/backgrounds/laboratorio-biologia-3.png'
        ];
        
        let currentX = 0;
        bgPaths.forEach(path => {
            const texture = PIXI.Assets.get(path);
            if (texture) {
                const bgSprite = new PIXI.Sprite(texture);
                bgSprite.height = this.app.screen.height;
                bgSprite.scale.x = bgSprite.scale.y;
                bgSprite.x = currentX;
                this.worldContainer.addChild(bgSprite);
                currentX += bgSprite.width;
            }
        });

        // 2. Inicialização de Componentes (Assumindo que já existem como classes)
        // Dica: No futuro, transforme-os em Módulos TS também!
        this.dialogue = new (window as any).DialogueManager(this.app);
        this.camera = new (window as any).Camera(this.worldContainer, this.app.screen);
        
        const indicatorTex = PIXI.Assets.get('/assets/ui/balao-exclamacao.png');
        this.indicator = new (window as any).InteractionIndicator(indicatorTex);
        this.addChild(this.indicator.sprite);

        // 3. Entidades (Julia e Pasteur)
        const juliaAtlas = PIXI.Assets.get('/assets/characters/julia/julia-atlas.json');
        this.player = new (window as any).Player(
            { idle: juliaAtlas.animations['idle'], walk: juliaAtlas.animations['walk'] },
            this.worldContainer,
            this.app,
            { minY: 300, maxY: this.app.screen.height - 80 }
        );

        this.pasteur = new (window as any).InteractiveEntity(
            PIXI.Assets.get('/assets/characters/pasteur/pasteur-idle.png'), 
            { x: 800, y: this.app.screen.height - 20 }
        );

        this.microscope = new (window as any).InteractiveEntity(
            PIXI.Assets.get('/assets/objects/microscopio.png'), 
            { x: 1500, y: this.app.screen.height - 50, scale: 0.4 }
        );

        this.worldContainer.addChild(this.pasteur.sprite, this.microscope.sprite);
        
        // Aplica o efeito de glow via código no sprite (ou via CSS se for DOM)
        this.microscope.sprite.filters = [new PIXI.BlurFilter(2)]; // Exemplo de efeito Pixi

        this.camera.follow(this.player.sprite);
        this.setupTriggers();
    }

    private setupTriggers(): void {
        const scriptData = PIXI.Assets.get('/assets/dialogues/biologia-intro.json');

        const iniciarConversaPasteur = () => {
            if (this.dialogue.isActive) return;
            
            this.player.lockMovement();
            this.dialogue.iniciarConversa(scriptData, () => {
                this.player.unlockMovement(); 
                this.pasteur.disableInteraction(); 
                
                // Ativa Microscópio
                this.microscope.enableInteraction(() => this.irParaMundoInvisivel());
                this.indicator.setTarget(this.microscope.sprite, -120);
            });
        };

        this.pasteur.enableInteraction(iniciarConversaPasteur);
        this.indicator.setTarget(this.pasteur.sprite);
    }

    private irParaMundoInvisivel(): void {
        console.log("Transição: Indo para o Minigame...");
        this.sceneManager.changeScene('biologia-minigame');
    }

    public update = (ticker: PIXI.Ticker): void => {
        if (this.dialogue?.isActive) return;

        this.player?.update();
        this.camera?.update();
        this.indicator?.update();
    }

    public override destroyScene(): void {
        // 1. Limpeza específica desta cena
        if (this.dialogue?.container) {
            this.app.stage.removeChild(this.dialogue.container);
            this.dialogue.container.destroy({ children: true });
        }

        // 2. Para a música se necessário
        this.audioManager.stopMusic();

        // 3. IMPORTANTE: Chama o super para executar a limpeza da BaseScene (listeners/UI)
        super.destroyScene();
    }
}