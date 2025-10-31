/* =================================================================
 * DialogueManager.js
 * * Um módulo autocontido para gerenciar diálogos no estilo "Visual Novel"
 * usando PixiJS.
 * ================================================================= */

class DialogueManager {
    constructor(app) {
        this.app = app;
        this.script = null;
        this.currentNodeKey = null;
        this.onComplete = null;
        this.isActive = false;

        // --- Criar o Contêiner Principal do Diálogo ---
        // Este contêiner guardará todos os elementos da UI de diálogo
        this.container = new PIXI.Container();
        this.container.visible = false;
        this.container.zIndex = 100; // Garante que o diálogo fique sobre o jogo
        this.app.stage.addChild(this.container);

        // --- 1. O Overlay de Escurecimento ---
        this.overlay = new PIXI.Graphics();
        this.overlay.beginFill(0x000000, 0.7); // Cor preta, 70% de opacidade
        this.overlay.drawRect(0, 0, app.screen.width, app.screen.height);
        this.overlay.endFill();
        this.overlay.eventMode = 'static'; // Bloqueia cliques no jogo atrás dele
        this.container.addChild(this.overlay);

        // --- 2. Sprites dos Personagens (Placeholders) ---
        this.spriteLeft = new PIXI.Sprite();
        this.spriteRight = new PIXI.Sprite();
        this.setupSprite(this.spriteLeft, 'left');
        this.setupSprite(this.spriteRight, 'right');
        this.container.addChild(this.spriteLeft);
        this.container.addChild(this.spriteRight);

        // --- 3. A Caixa de Diálogo (Placeholder) ---
        this.dialogueBox = new PIXI.Graphics();
        this.dialogueBox.beginFill(0xFFFFFF, 0.9);
        this.dialogueBox.lineStyle(4, 0x3D3D3D, 1);
        this.dialogueBox.drawRoundedRect(0, 0, app.screen.width * 0.8, 150, 15);
        this.dialogueBox.endFill();
        this.dialogueBox.x = app.screen.width * 0.1;
        this.dialogueBox.y = app.screen.height - 180;
        this.container.addChild(this.dialogueBox);

        // --- 4. O "Triângulo/Setinha" (Flipper) ---
        // Esta é a "setinha de arte" que você mencionou
        this.flipper = new PIXI.Graphics();
        this.flipper.beginFill(0x3D3D3D, 1);
        this.flipper.drawPolygon([0, 0, 20, 0, 10, 10]); // Um triângulo simples
        this.flipper.endFill();
        this.flipper.y = this.dialogueBox.y - 10; // Posiciona acima da caixa
        this.container.addChild(this.flipper);

        // --- 5. O Texto do Diálogo ---
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Fredoka',
            fontSize: 24,
            fill: '#3D3D3D',
            wordWrap: true,
            wordWrapWidth: this.dialogueBox.width - 60
        });
        this.dialogueText = new PIXI.Text('', textStyle);
        this.dialogueText.position.set(this.dialogueBox.x + 30, this.dialogueBox.y + 40);
        this.container.addChild(this.dialogueText);

        // --- 6. O Nome do Falante ---
        const speakerStyle = new PIXI.TextStyle({
            fontFamily: 'Fredoka',
            fontSize: 22,
            fill: '#FFFFFF',
            fontWeight: '700'
        });
        // O "balão" do nome (como o "Eduardo" na imagem)
        this.speakerNameBubble = new PIXI.Graphics();
        this.speakerNameText = new PIXI.Text('', speakerStyle);
        
        this.container.addChild(this.speakerNameBubble);
        this.container.addChild(this.speakerNameText);

        // --- 7. Contêiner para as Escolhas (SIM/NÃO) ---
        this.choiceContainer = new PIXI.Container();
        this.choiceContainer.position.set(app.screen.width - 200, app.screen.height / 2);
        this.container.addChild(this.choiceContainer);
    }

    /**
     * Configuração inicial dos sprites dos personagens.
     */
    setupSprite(sprite, position) {
        sprite.anchor.set(0.5, 1); // Ancora na base e no centro
        sprite.y = this.app.screen.height - 20; // Alinha na base da tela
        sprite.scale.set(0.8); // Escala de placeholder
        
        if (position === 'left') {
            sprite.x = this.app.screen.width * 0.25;
        } else {
            sprite.x = this.app.screen.width * 0.75;
        }
    }

    /**
     * Inicia uma sequência de diálogo.
     * @param {object} script - O objeto de script do diálogo.
     * @param {function} onComplete - Função a ser chamada quando o diálogo terminar.
     */
    async start(script, onComplete) {
        this.script = script;
        this.onComplete = onComplete;
        this.isActive = true;

        // 1. Carrega as texturas dos portraits
        try {
            const leftTex = await PIXI.Assets.load(script.actors.left.texture);
            const rightTex = await PIXI.Assets.load(script.actors.right.texture);

            // 2. Configura os sprites
            this.spriteLeft.texture = leftTex;
            this.spriteRight.texture = rightTex;
            
            // 3. Mostra o contêiner e inicia no nó "start"
            this.container.visible = true;
            this.showNode('start');

        } catch (err) {
            console.error("Erro ao carregar assets do diálogo:", err);
            this.end(); // Falha, então termina
        }
    }

    /**
     * Exibe um nó de diálogo específico.
     * @param {string} nodeKey - A chave do nó no script (ex: "start", "pergunta_1")
     */
    showNode(nodeKey) {
        // Se a chave for "end", termina o diálogo
        if (nodeKey === 'end' || !this.script.nodes[nodeKey]) {
            this.end();
            return;
        }

        this.currentNodeKey = nodeKey;
        const node = this.script.nodes[nodeKey];

        // --- Limpa interações antigas ---
        this.choiceContainer.removeChildren();
        this.dialogueBox.eventMode = 'none';
        this.dialogueBox.off('pointerdown');

        // --- 1. Atualiza o Texto ---
        this.dialogueText.text = node.text;

        // --- 2. Atualiza o Falante (Foco, Tonalidade, "Setinha") ---
        const isLeft = node.speaker === 'left';
        const speakerData = isLeft ? this.script.actors.left : this.script.actors.right;
        
        // Tonalidade (quem não fala fica mais escuro)
        this.spriteLeft.tint = isLeft ? 0xFFFFFF : 0x888888;
        this.spriteRight.tint = isLeft ? 0x888888 : 0xFFFFFF;

        // Posição do Balão de Nome
        this.speakerNameText.text = speakerData.name;
        const nameBubbleX = isLeft ? (this.dialogueBox.x + 40) : (this.dialogueBox.x + this.dialogueBox.width - 40 - 150);
        
        // Redesenha o balão do nome
        // (Isso seria substituído por um Sprite do Kaique)
        this.speakerNameBubble.clear();
        this.speakerNameBubble.beginFill(0xFF69B4); // Cor rosa (placeholder)
        this.speakerNameBubble.drawRoundedRect(0, 0, 150, 30, 15);
        this.speakerNameBubble.endFill();
        this.speakerNameBubble.position.set(nameBubbleX, this.dialogueBox.y - 15);
        this.speakerNameText.position.set(this.speakerNameBubble.x + (150 - this.speakerNameText.width) / 2, this.speakerNameBubble.y + 3);

        // Posição da "Setinha" (Flipper)
        this.flipper.x = isLeft ? (this.speakerNameBubble.x + 65) : (this.speakerNameBubble.x + 65);

        // --- 3. Prepara a Próxima Ação (Escolhas ou Continuação) ---
        if (node.choices) {
            // Se tiver escolhas, cria os botões
            this.createChoiceButtons(node.choices);
        } else {
            // Se não, espera um clique para ir para "next"
            this.dialogueBox.eventMode = 'static';
            this.dialogueBox.cursor = 'pointer';
            
            // Adiciona um ouvinte de clique ÚNICO
            this.dialogueBox.once('pointerdown', () => {
                this.showNode(node.next);
            });
        }
    }

    /**
     * Cria e exibe os botões de escolha (ex: SIM/NÃO).
     */
    createChoiceButtons(choices) {
        let yPos = 0;
        const buttonWidth = 180;
        const buttonHeight = 60;
        const buttonStyle = new PIXI.TextStyle({
            fontFamily: 'Fredoka', fontSize: 24, fill: '#FFFFFF', fontWeight: '700'
        });

        for (const choice of choices) {
            // Placeholder do botão (Gráfico)
            const button = new PIXI.Graphics();
            button.beginFill(0xFF69B4); // Cor rosa
            button.lineStyle(3, 0xD1478E, 1);
            button.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 30);
            button.endFill();
            button.y = yPos;

            // Texto do botão
            const text = new PIXI.Text(choice.text, buttonStyle);
            text.anchor.set(0.5);
            text.position.set(buttonWidth / 2, buttonHeight / 2);
            button.addChild(text);

            // Interatividade
            button.eventMode = 'static';
            button.cursor = 'pointer';

            button.on('pointerdown', () => {
                // Ao clicar, vai para o nó de destino da escolha
                this.showNode(choice.target);
            });

            // Efeitos de Hover (bônus)
            button.on('pointerover', () => button.alpha = 0.8);
            button.on('pointerout', () => button.alpha = 1.0);

            this.choiceContainer.addChild(button);
            yPos += buttonHeight + 15; // Próximo botão abaixo
        }
    }

    /**
     * Encerra o diálogo e retorna ao jogo.
     */
    end() {
        this.container.visible = false;
        this.isActive = false;
        this.script = null;
        this.currentNodeKey = null;

        if (this.onComplete) {
            this.onComplete(); // Chama a função de callback
        }
        this.onComplete = null;
    }
}