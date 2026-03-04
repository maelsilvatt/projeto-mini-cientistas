import * as PIXI from 'pixi.js';

export interface DialogueActor {
    name: string;
    texture: string;
}

export interface DialogueChoice {
    text: string;
    target: string;
}

export interface DialogueNode {
    text: string;
    speaker: 'left' | 'right';
    next?: string;
    choices?: DialogueChoice[];
}

export interface DialogueScript {
    actors: {
        left: DialogueActor;
        right: DialogueActor;
    };
    nodes: Record<string, DialogueNode>;
}

export class DialogueManager {
    private app: PIXI.Application;
    private script: DialogueScript | null = null;
    private currentNodeKey: string | null = null;
    private onComplete: (() => void) | null = null;
    
    public isActive: boolean = false;
    public container: PIXI.Container;

    // Elementos de UI
    private overlay: PIXI.Graphics;
    private spriteLeft: PIXI.Sprite;
    private spriteRight: PIXI.Sprite;
    private dialogueBox: PIXI.Graphics;
    private flipper: PIXI.Graphics;
    private dialogueText: PIXI.Text;
    private speakerNameBubble: PIXI.Graphics;
    private speakerNameText: PIXI.Text;
    private choiceContainer: PIXI.Container;

    constructor(app: PIXI.Application) {
        this.app = app;

        // Container Principal
        this.container = new PIXI.Container();
        this.container.visible = false;
        this.container.zIndex = 100;
        this.app.stage.addChild(this.container);

        // 1. Overlay
        this.overlay = new PIXI.Graphics();
        this.overlay.fill({ color: 0x000000, alpha: 0.7 });
        this.overlay.rect(0, 0, app.screen.width, app.screen.height);
        this.overlay.eventMode = 'static';
        this.container.addChild(this.overlay);

        // 2. Sprites dos Personagens
        this.spriteLeft = new PIXI.Sprite();
        this.spriteRight = new PIXI.Sprite();
        this.setupSprite(this.spriteLeft, 'left');
        this.setupSprite(this.spriteRight, 'right');
        this.container.addChild(this.spriteLeft, this.spriteRight);

        // 3. Caixa de Diálogo
        this.dialogueBox = new PIXI.Graphics();
        this.dialogueBox.fill({ color: 0xFFFFFF, alpha: 0.9 });
        this.dialogueBox.stroke({ width: 4, color: 0x3D3D3D });
        this.dialogueBox.roundRect(0, 0, app.screen.width * 0.8, 150, 15);
        this.dialogueBox.x = app.screen.width * 0.1;
        this.dialogueBox.y = app.screen.height - 180;
        this.container.addChild(this.dialogueBox);

        // 4. Flipper (Triângulo indicativo)
        this.flipper = new PIXI.Graphics();
        this.flipper.fill(0x3D3D3D);
        this.flipper.poly([0, 0, 20, 0, 10, 10]);
        this.flipper.y = this.dialogueBox.y - 10;
        this.container.addChild(this.flipper);

        // 5. Texto e Nome
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Fredoka',
            fontSize: 24,
            fill: '#3D3D3D',
            wordWrap: true,
            wordWrapWidth: this.dialogueBox.width - 60
        });

        this.dialogueText = new PIXI.Text({ text: '', style: textStyle });
        this.dialogueText.position.set(this.dialogueBox.x + 30, this.dialogueBox.y + 40);
        this.container.addChild(this.dialogueText);

        this.speakerNameBubble = new PIXI.Graphics();
        this.speakerNameText = new PIXI.Text({ text: '', style: { ...textStyle, fill: '#FFFFFF', fontWeight: '700', fontSize: 22 } });
        this.container.addChild(this.speakerNameBubble, this.speakerNameText);

        // 6. Escolhas
        this.choiceContainer = new PIXI.Container();
        this.choiceContainer.position.set(app.screen.width - 200, app.screen.height / 2);
        this.container.addChild(this.choiceContainer);
    }

    private setupSprite(sprite: PIXI.Sprite, position: 'left' | 'right'): void {
        sprite.anchor.set(0.5, 1);
        sprite.y = this.app.screen.height - 20;
        sprite.scale.set(0.8);
        sprite.x = position === 'left' ? this.app.screen.width * 0.25 : this.app.screen.width * 0.75;
    }

    public async start(script: DialogueScript, onComplete: () => void): Promise<void> {
        this.script = script;
        this.onComplete = onComplete;
        this.isActive = true;

        try {
            // Carregamento de Assets Dinâmicos (Vite Friendly)
            const [leftTex, rightTex] = await Promise.all([
                PIXI.Assets.load(script.actors.left.texture),
                PIXI.Assets.load(script.actors.right.texture)
            ]);

            this.spriteLeft.texture = leftTex;
            this.spriteRight.texture = rightTex;
            
            this.container.visible = true;
            this.showNode('start');
        } catch (err) {
            console.error("Erro ao carregar portraits do diálogo:", err);
            this.end();
        }
    }

    private showNode(nodeKey: string): void {
        if (nodeKey === 'end' || !this.script?.nodes[nodeKey]) {
            this.end();
            return;
        }

        const node = this.script.nodes[nodeKey];
        this.currentNodeKey = nodeKey;

        // Limpeza
        this.choiceContainer.removeChildren();
        this.dialogueBox.eventMode = 'none';
        this.dialogueBox.removeAllListeners();

        // Conteúdo
        this.dialogueText.text = node.text;
        const isLeft = node.speaker === 'left';
        const actor = isLeft ? this.script.actors.left : this.script.actors.right;

        // Feedback Visual (Foco)
        this.spriteLeft.tint = isLeft ? 0xFFFFFF : 0x888888;
        this.spriteRight.tint = isLeft ? 0x888888 : 0xFFFFFF;

        // UI do Nome
        this.updateSpeakerUI(actor.name, isLeft);

        // Próximo Passo
        if (node.choices) {
            this.createChoiceButtons(node.choices);
        } else if (node.next) {
            this.dialogueBox.eventMode = 'static';
            this.dialogueBox.cursor = 'pointer';
            this.dialogueBox.once('pointerdown', () => this.showNode(node.next!));
        }
    }

    private updateSpeakerUI(name: string, isLeft: boolean): void {
        this.speakerNameText.text = name;
        const nameX = isLeft ? (this.dialogueBox.x + 40) : (this.dialogueBox.x + this.dialogueBox.width - 190);
        
        this.speakerNameBubble.clear();
        this.speakerNameBubble.fill(0xFF69B4); // Cor rosa (placeholder)
        this.speakerNameBubble.roundRect(0, 0, 150, 30, 15);
        this.speakerNameBubble.position.set(nameX, this.dialogueBox.y - 15);
        
        this.speakerNameText.position.set(
            this.speakerNameBubble.x + (150 - this.speakerNameText.width) / 2, 
            this.speakerNameBubble.y + 3
        );

        this.flipper.x = this.speakerNameBubble.x + 65;
    }

    private createChoiceButtons(choices: any[]): void {
        choices.forEach((choice, i) => {
            const btn = new PIXI.Graphics();
            btn.fill(0xFF69B4);
            btn.stroke({ width: 3, color: 0xD1478E });
            btn.roundRect(0, 0, 180, 60, 30);
            btn.y = i * 75;

            const txt = new PIXI.Text({ text: choice.text, style: { fontFamily: 'Fredoka', fontSize: 20, fill: '#FFF', fontWeight: '700' } });
            txt.anchor.set(0.5);
            txt.position.set(90, 30);
            btn.addChild(txt);

            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            btn.on('pointerdown', () => this.showNode(choice.target));
            
            this.choiceContainer.addChild(btn);
        });
    }

    public end(): void {
        this.container.visible = false;
        this.isActive = false;
        this.onComplete?.();
        this.onComplete = null;
    }
}