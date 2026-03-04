import * as PIXI from 'pixi.js';

export class Camera {
    private world: PIXI.Container;
    private screen: PIXI.Rectangle;
    private target: PIXI.Sprite | null = null;
    
    // Fator de suavização (Lerp)
    // 0.08 é um valor "amanteigado" para jogos de plataforma/exploração
    private lerpFactor: number = 0.08;

    /**
     * @param worldContainer - O contêiner que contém todo o cenário e objetos.
     * @param screen - A área de visualização do app (app.screen).
     */
    constructor(worldContainer: PIXI.Container, screen: PIXI.Rectangle) {
        this.world = worldContainer;
        this.screen = screen;
    }

    /**
     * Define qual Sprite a câmera deve "perseguir".
     */
    public follow(targetSprite: PIXI.Sprite): void {
        this.target = targetSprite;
    }

    /**
     * Atualiza a posição do mundo para simular o movimento da câmera.
     * Deve ser chamado dentro do ticker do PixiJS.
     */
    public update(): void {
        if (!this.target) return;

        // 1. Calcula a posição X ideal (Centralização)
        // targetX é onde o world.x deveria estar para o player ficar no meio
        const targetX = -this.target.x + this.screen.width / 2;

        // 2. Limites (Clamping)
        // Impede que a câmera mostre o "vazio" além das bordas do cenário
        const minCameraX = -(this.world.width - this.screen.width);
        const maxCameraX = 0;

        const clampedX = Math.max(minCameraX, Math.min(targetX, maxCameraX));

        // 3. Interpolação Linear (Lerp)
        // Fórmula: atual += (objetivo - atual) * fator
        // Isso cria aquele efeito de "atraso" suave da câmera
        this.world.x += (clampedX - this.world.x) * this.lerpFactor;
    }

    /**
     * Ajusta a velocidade de resposta da câmera.
     * @param factor Valor entre 0 e 1 (recomenda-se 0.05 a 0.2)
     */
    public setLerp(factor: number): void {
        this.lerpFactor = Math.max(0, Math.min(1, factor));
    }
}