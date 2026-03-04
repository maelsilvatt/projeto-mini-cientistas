import * as PIXI from 'pixi.js';

// Interface para as animações da Julia
export interface PlayerAnimations {
    idle: PIXI.Texture[];
    walk: PIXI.Texture[];
}

// Interface para os limites de movimento
export interface PlayerBoundaries {
    minY: number;
    maxY: number;
}

export class Player {
    public sprite: PIXI.AnimatedSprite;
    
    private speed: number = 5;
    private keys: Record<string, boolean> = {};
    private isDragging: boolean = false;
    private canMove: boolean = true;
    
    private anims: PlayerAnimations;
    private worldContainer: PIXI.Container;
    private app: PIXI.Application;
    private boundaries: PlayerBoundaries;

    constructor(
        textures: PlayerAnimations, 
        worldContainer: PIXI.Container, 
        app: PIXI.Application, 
        boundaries: PlayerBoundaries
    ) {
        this.anims = textures;
        this.worldContainer = worldContainer;
        this.app = app;
        this.boundaries = boundaries;

        // 1. Inicializa o AnimatedSprite com Idle
        this.sprite = new PIXI.AnimatedSprite(this.anims.idle);
        this.sprite.animationSpeed = 0.05;
        this.sprite.play();
        
        this.sprite.anchor.set(0.5);
        this.sprite.height = 200; 
        this.sprite.scale.x = this.sprite.scale.y; // Mantém proporção
        
        // Posicionamento Inicial
        this.sprite.x = 300;
        this.sprite.y = (this.boundaries.minY + this.boundaries.maxY) / 2;
        
        this.worldContainer.addChild(this.sprite);

        // 2. Setup de Controles
        this.initKeyboardListeners();
        this.initDragListeners();
    }

    private initKeyboardListeners(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (this.canMove) this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    private initDragListeners(): void {
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'grab';
        
        // Drag Start
        this.sprite.on('pointerdown', (e) => {
            if (!this.canMove) return;
            this.isDragging = true;
            this.sprite.cursor = 'grabbing';
            this.handleAnimation(true);
        });

        // Global Drag End/Move via Stage
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on('pointerup', () => this.onDragEnd());
        this.app.stage.on('pointerupoutside', () => this.onDragEnd());
        
        this.app.stage.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
            if (this.isDragging && this.canMove) {
                const pos = this.worldContainer.toLocal(e.global);
                
                // Lógica de Flip (olhar para a direção do arrasto)
                if (pos.x < this.sprite.x) this.sprite.scale.x = -Math.abs(this.sprite.scale.y);
                else this.sprite.scale.x = Math.abs(this.sprite.scale.y);

                this.sprite.x = pos.x;
                this.sprite.y = pos.y;
            }
        });
    }

    private onDragEnd(): void {
        this.isDragging = false;
        this.sprite.cursor = 'grab';
        this.handleAnimation(false);
    }

    /** Loop de Movimento por Teclado */
    private handleKeyboardMovement(): boolean {
        let isMoving = false;
        const k = this.keys;

        if (k['arrowup'] || k['w']) { this.sprite.y -= this.speed; isMoving = true; }
        if (k['arrowdown'] || k['s']) { this.sprite.y += this.speed; isMoving = true; }
        
        if (k['arrowleft'] || k['a']) { 
            this.sprite.x -= this.speed; 
            this.sprite.scale.x = -Math.abs(this.sprite.scale.y); 
            isMoving = true;
        }
        if (k['arrowright'] || k['d']) { 
            this.sprite.x += this.speed; 
            this.sprite.scale.x = Math.abs(this.sprite.scale.y); 
            isMoving = true;
        }
        
        return isMoving;
    }

    /** Mantém Julia dentro do cenário */
    private enforceBounds(): void {
        const halfWidth = this.sprite.width / 2;
        
        // Horizontal (Mundo)
        this.sprite.x = Math.max(halfWidth, Math.min(this.worldContainer.width - halfWidth, this.sprite.x));

        // Vertical (Trilhas do Laboratório)
        this.sprite.y = Math.max(this.boundaries.minY, Math.min(this.boundaries.maxY, this.sprite.y));
    }

    /** Gerencia troca suave de animações */
    private handleAnimation(isMoving: boolean): void {
        const targetAnims = isMoving ? this.anims.walk : this.anims.idle;
        
        // Só troca se as texturas forem diferentes (evita flicker)
        if (this.sprite.textures !== targetAnims) {
            this.sprite.textures = targetAnims;
            this.sprite.animationSpeed = isMoving ? 0.12 : 0.05;
            this.sprite.play();
        }
    }

    /** Método chamado a cada frame pela cena */
    public update(): void {
        if (!this.canMove) return;

        let isMoving = false;
        if (!this.isDragging) {
            isMoving = this.handleKeyboardMovement();
        } else {
            isMoving = true; // No drag consideramos movimento para animação
        }
        
        this.enforceBounds();
        this.handleAnimation(isMoving);
    }

    public lockMovement(): void {
        this.canMove = false;
        this.keys = {};
        this.isDragging = false;
        this.handleAnimation(false);
    }

    public unlockMovement(): void {
        this.canMove = true;
    }
}