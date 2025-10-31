/* =================================================================
 * InteractiveObject.js
 * Uma classe base para objetos clicáveis no cenário (ex: microscópio).
 * ================================================================= */

class InteractiveObject {
    /**
     * @param {PIXI.Texture} texture - A textura do objeto.
     * @param {object} options - Opções de configuração.
     * @param {number} options.x - Posição X inicial.
     * @param {number} options.y - Posição Y inicial.
     * @param {number} [options.scale=0.5] - Escala inicial.
     * @param {PIXI.Point | PIXI.ObservablePoint} [options.anchor={x: 0.5, y: 1}] - Ponto de âncora (padrão: base, centro).
     */
    constructor(texture, options = {}) {
        this.sprite = new PIXI.Sprite(texture);

        // Define padrões e aplica opções
        this.sprite.anchor.set(options.anchor?.x || 0.5, options.anchor?.y || 1);
        this.sprite.scale.set(options.scale || 0.5);
        this.sprite.x = options.x || 0;
        this.sprite.y = options.y || 0;

        // Propriedades de interatividade
        this.sprite.eventMode = 'none'; // Começa desabilitado por padrão
        this.sprite.cursor = 'default';
    }

    /**
     * Habilita a interatividade do objeto.
     * @param {function} onClickCallback - A função a ser chamada quando o objeto for clicado.
     */
    enableInteraction(onClickCallback) {
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        
        // Remove ouvintes antigos para evitar duplicatas
        this.sprite.off('pointerdown'); 
        // Adiciona o novo ouvinte
        this.sprite.on('pointerdown', onClickCallback);
    }

    /**
     * Desabilita a interatividade do objeto.
     */
    disableInteraction() {
        this.sprite.eventMode = 'none';
        this.sprite.cursor = 'default';
        this.sprite.off('pointerdown'); // Remove todos os ouvintes de clique
    }

    // (Futuramente, podemos adicionar métodos .show() ou .hide() aqui)
}