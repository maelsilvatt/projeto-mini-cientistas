import * as PIXI from 'pixi.js';

export class InteractionIndicator {
    public sprite: PIXI.Sprite;
    
    private target: PIXI.Container | null = null;
    private baseYOffset: number = -150;
    private floatAmplitude: number = 6;
    private floatSpeed: number = 0.003;
    private startTime: number = Date.now();
    
    public onClick: (() => void) | null = null;

    constructor(texture: PIXI.Texture) {
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(0.4);
        
        // Interatividade no próprio balão
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        this.sprite.visible = false;

        this.sprite.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            e.stopPropagation(); // Evita que o clique atravesse para o cenário
            this.onClick?.();
        });
    }

    /**
     * Define para quem o balão deve apontar
     * @param target O Container/Sprite alvo
     * @param yOffset Distância vertical acima do alvo
     */
    public setTarget(target: PIXI.Container, yOffset: number = -150): void {
        this.target = target;
        this.baseYOffset = yOffset;
        this.sprite.visible = true;
    }

    /**
     * Atualiza a posição e a animação de flutuação.
     * Deve ser chamado no ticker da cena.
     */
    public update(): void {
        if (!this.target || !this.target.visible) {
            this.sprite.visible = false;
            return;
        }

        this.sprite.visible = true;

        // Cálculo da flutuação senoidal (Matemática de suavização)
        const elapsed = Date.now() - this.startTime;
        const floatOffset = Math.sin(elapsed * this.floatSpeed) * this.floatAmplitude;

        // Sincroniza posição com o alvo
        this.sprite.x = this.target.x;
        this.sprite.y = this.target.y + this.baseYOffset + floatOffset;
    }

    public hide(): void {
        this.sprite.visible = false;
        this.target = null;
    }
}