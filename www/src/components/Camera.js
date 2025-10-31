/* =================================================================
 * Camera.js
 * Um componente de câmera 2D que segue um alvo dentro de um contêiner.
 * ================================================================= */

class Camera {
    /**
     * @param {PIXI.Container} worldContainer - O contêiner que a câmera irá "mover".
     * @param {PIXI.Rectangle} screen - A área da tela (app.screen).
     */
    constructor(worldContainer, screen) {
        this.world = worldContainer;
        this.screen = screen;
        this.target = null; // O sprite que a câmera deve seguir (ex: player.sprite)
        
        // Fator de suavização (0.01 = muito lento, 1.0 = instantâneo)
        this.lerpFactor = 0.08; 
    }

    /**
     * Define o alvo que a câmera deve seguir.
     * @param {PIXI.Sprite} targetSprite 
     */
    follow(targetSprite) {
        this.target = targetSprite;
    }

    /**
     * Atualiza a posição da câmera. Deve ser chamado a cada frame no loop do jogo.
     */
    update() {
        if (!this.target) return;

        // 1. Calcula a posição X ideal da câmera
        // O objetivo é manter o alvo (jogador) no centro da tela.
        // A posição do worldContainer será o negativo da posição do alvo,
        // com um deslocamento para centralizá-lo na tela.
        const targetX = -this.target.x + this.screen.width / 2;

        // 2. Limita o movimento da câmera (para não mostrar fora do mundo)
        const minCameraX = -(this.world.width - this.screen.width); // O ponto mais à direita
        const maxCameraX = 0; // O ponto mais à esquerda
        
        // Garante que a 'targetX' fique entre o mínimo e o máximo
        const clampedX = Math.max(minCameraX, Math.min(targetX, maxCameraX));

        // 3. Suaviza o movimento (Lerp)
        // Em vez de "pular" para a posição (world.x = clampedX),
        // nós nos movemos uma fração da distância a cada frame.
        this.world.x += (clampedX - this.world.x) * this.lerpFactor;
    }
}