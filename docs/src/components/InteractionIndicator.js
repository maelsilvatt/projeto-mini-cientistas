/* =================================================================
 * InteractionIndicator.js
 * Componente de UI reutilizável para o balão de exclamação.
 * ================================================================= */

class InteractionIndicator {
    constructor(texture) {
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 1); // Ancorado na base, no centro
        this.sprite.scale.set(0.4); // Ajuste o tamanho conforme necessário
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        
        this.target = null;
        this.baseYOffset = -150; // Quão acima do alvo ele deve flutuar
        this.floatAmplitude = 6;  // O quanto ele "flutua" para cima e para baixo
        this.floatSpeed = 0.003; // A velocidade da flutuação
        this.startTime = Date.now();

        // Função de callback que será chamada ao clicar
        this.onClick = null;
        this.sprite.on('pointerdown', (e) => {
            e.stopPropagation(); // Impede que o clique "vaze" para o mundo
            if (this.onClick) {
                this.onClick();
            }
        });
    }

    /** Define o alvo que o balão deve seguir */
    setTarget(targetSprite, yOffset = -150) {
        this.target = targetSprite;
        this.baseYOffset = yOffset;
        this.sprite.visible = true;
        this.update(); // Atualiza a posição imediatamente
    }

    /** Atualiza a animação de flutuação e a posição */
    update() {
        if (!this.target || !this.target.visible) {
            this.sprite.visible = false;
            return;
        }
        if (!this.sprite.visible) this.sprite.visible = true;

        // Calcula a flutuação
        const floatOffset = Math.sin((Date.now() - this.startTime) * this.floatSpeed) * this.floatAmplitude;
        
        this.sprite.x = this.target.x;
        this.sprite.y = this.target.y + this.baseYOffset + floatOffset;
    }

    /** Esconde o balão */
    hide() {
        this.sprite.visible = false;
        this.target = null;
    }
}