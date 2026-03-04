import * as PIXI from 'pixi.js';

// Interface para garantir que as opções de criação sejam sempre válidas
export interface EntityOptions {
    x?: number;
    y?: number;
    scale?: number;
    anchor?: { x: number; y: number };
}

export class InteractiveEntity {
    // A propriedade é pública para que a cena possa adicioná-la ao container
    public sprite: PIXI.Sprite;

    /**
     * @param texture - A textura carregada via PIXI.Assets.get()
     * @param options - Configurações de posição, escala e âncora
     */
    constructor(texture: PIXI.Texture, options: EntityOptions = {}) {
        this.sprite = new PIXI.Sprite(texture);

        // Aplica os valores das opções ou usa padrões seguros
        const { x = 0, y = 0, scale = 0.5, anchor = { x: 0.5, y: 1 } } = options;

        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.scale.set(scale);
        this.sprite.anchor.set(anchor.x, anchor.y);

        // Inicia como um objeto decorativo (não interativo)
        this.sprite.eventMode = 'none';
        this.sprite.cursor = 'default';
    }

    /**
     * Habilita o clique no objeto e define o que acontece ao clicar.
     * @param onClickCallback - Função a ser executada no clique
     */
    public enableInteraction(onClickCallback: (event: PIXI.FederatedPointerEvent) => void): void {
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        
        // Limpa listeners antigos para evitar execuções duplicadas
        this.sprite.removeAllListeners('pointerdown');
        this.sprite.on('pointerdown', onClickCallback);
    }

    /**
     * Transforma o objeto em um elemento puramente visual novamente.
     */
    public disableInteraction(): void {
        this.sprite.eventMode = 'none';
        this.sprite.cursor = 'default';
        this.sprite.removeAllListeners('pointerdown');
    }
}