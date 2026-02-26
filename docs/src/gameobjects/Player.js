/* =================================================================
 * Player.js
 * Gerencia o sprite, estado e lógicas de movimento do jogador.
 * AGORA COM ANIMAÇÃO E LIMITES.
 * ================================================================= */

class Player {
    /**
     * @param {object} textures - Um objeto contendo os arrays de texturas (ex: { idle: [], walk: [] }).
     * @param {PIXI.Container} worldContainer - O contêiner do mundo.
     * @param {PIXI.Application} app - A aplicação PIXI.
     * @param {object} boundaries - Um objeto (ex: { minY: 100, maxY: 600 }).
     */
    constructor(textures, worldContainer, app, boundaries) {
        this.speed = 5;
        this.keys = {};
        this.isDragging = false;
        this.canMove = true; 

        this.worldContainer = worldContainer;
        this.app = app;
        
        // ⚠️ NOVO: Salva os limites
        this.boundaries = boundaries;
        
        // ⚠️ NOVO: Objeto de texturas
        this.anims = textures; // { idle: [tex1, ...], walk: [tex1, ...] }

        // 1. ⚠️ NOVO: Criar o AnimatedSprite
        this.sprite = new PIXI.AnimatedSprite(this.anims.idle);
        this.sprite.animationSpeed = 0.05; // Velocidade da animação de idle
        this.sprite.play();
        
        this.sprite.anchor.set(0.5);
        this.sprite.height = 200; // Ajuste a altura conforme necessário
        this.sprite.scale.x = this.sprite.scale.y; // Mantém a proporção
        this.sprite.x = 300; 
        
        // Posiciona o jogador no meio dos limites verticais
        this.sprite.y = (this.boundaries.minY + this.boundaries.maxY) / 2;
        
        this.worldContainer.addChild(this.sprite);

        // 2. Inicializar os Controles
        this._initKeyboardListeners();
        this._initDragListeners();
    }

    /** Configura os ouvintes de teclado (keydown, keyup) */
    _initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.canMove) this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /** Configura os ouvintes de arrastar (mouse/toque) */
    _initDragListeners() {
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'grab';
        this.sprite.on('pointerdown', this.onDragStart);
        
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointerup', this.onDragEnd);
        this.app.stage.on('pointerupoutside', this.onDragEnd);
        this.app.stage.on('pointermove', this.onDragMove);
    }

    // --- Handlers de Eventos ---
    onDragStart = (event) => { /* ... (sem mudanças) ... */ }
    onDragEnd = () => { /* ... (sem mudanças) ... */ }
    onDragMove = (event) => { /* ... (sem mudanças) ... */ }

    // --- Lógica de Loop (Update) ---

    /** Movimenta o jogador com base nas teclas pressionadas */
    _handleKeyboardMovement() {
        let isMoving = false;
        
        if (this.keys['arrowup'] || this.keys['w']) { 
            this.sprite.y -= this.speed; 
            isMoving = true;
        }
        if (this.keys['arrowdown'] || this.keys['s']) { 
            this.sprite.y += this.speed; 
            isMoving = true;
        }
        if (this.keys['arrowleft'] || this.keys['a']) { 
            this.sprite.x -= this.speed; 
            this.sprite.scale.x = -Math.abs(this.sprite.scale.y); // Vira para a esquerda
            isMoving = true;
        }
        if (this.keys['arrowright'] || this.keys['d']) { 
            this.sprite.x += this.speed; 
            this.sprite.scale.x = Math.abs(this.sprite.scale.y); // Vira para a direita
            isMoving = true;
        }
        
        return isMoving;
    }

    /** Garante que o jogador fique dentro dos limites do mundo */
    _enforceBounds() {
        const halfWidth = this.sprite.width / 2;
        
        // Limites horizontais (baseado no tamanho do worldContainer)
        this.sprite.x = Math.max(halfWidth, this.sprite.x);
        this.sprite.x = Math.min(this.worldContainer.width - halfWidth, this.sprite.x);

        // ⚠️ NOVO: Limites verticais
        this.sprite.y = Math.max(this.boundaries.minY, this.sprite.y);
        this.sprite.y = Math.min(this.boundaries.maxY, this.sprite.y);
    }
    
    /** ⚠️ NOVO: Gerencia a troca de animações */
    _handleAnimation(isMoving) {
        if (isMoving) {
            // Se está se movendo e a animação atual NÃO é a de andar
            if (this.sprite.textures !== this.anims.walk) {
                this.sprite.textures = this.anims.walk;
                this.sprite.animationSpeed = 0.1; // Ajuste a velocidade da caminhada
                this.sprite.play();
            }
        } else {
            // Se está parado e a animação atual NÃO é a de 'idle'
            if (this.sprite.textures !== this.anims.idle) {
                this.sprite.textures = this.anims.idle;
                this.sprite.animationSpeed = 0.05; // Ajuste a velocidade de 'idle'
                this.sprite.play();
            }
        }
    }

    /**
     * Método principal de loop, deve ser chamado pela cena a cada frame.
     */
    update() {
        if (!this.canMove) return;

        let isMoving = false;
        if (!this.isDragging) {
            isMoving = this._handleKeyboardMovement();
        }
        
        this._enforceBounds();
        this._handleAnimation(isMoving);
    }

    // --- Métodos Públicos de Controle ---
    lockMovement() {
        this.canMove = false;
        this.keys = {}; 
        this.isDragging = false; 
        this._handleAnimation(false); // Força a animação de 'idle'
    }

    unlockMovement() {
        this.canMove = true;
    }

    getX() {
        return this.sprite.x;
    }
}