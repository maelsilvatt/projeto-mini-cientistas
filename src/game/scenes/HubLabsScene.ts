import { Scene } from 'phaser';

export class HubLabsScene extends Scene {
    private labsCards = [
        { name: 'Química', image: 'labs/quimica' },
        { name: 'Física', image: 'labs/fisica' },
        { name: 'Biologia', image: 'labs/biologia' },
        { name: 'Odontologia', image: 'labs/odonto' },
        { name: 'Medicina', image: 'labs/medicina' },
        { name: 'Inteligência Artificial', image: 'labs/ia' }
    ];

    private container!: Phaser.GameObjects.Container;
    private cards: Phaser.GameObjects.Container[] = [];
    private currentIndex = 2;
    private isAnimating = false;
    private cardWidth = 430; // Aumentado para afastar como pedido

    constructor() {
        super('HubLabsScene');
    }

    create() {
        this.cards = [];
        this.currentIndex = 2;
        this.isAnimating = false;

        this.input.keyboard?.removeAllListeners();
        this.input.removeAllListeners();

        const { width, height } = this.scale;

        const bg = this.add.image(width / 2, height / 2, 'backgrounds/menu-laboratorio');
        bg.setDisplaySize(width, height);
        bg.postFX.addBlur(0, 2, 2, 1);

        this.container = this.add.container(width / 2, height / 2);

        this.setupCarousel();
        this.setupControls();
        this.updateCarousel(false);
    }

    private setupCarousel() {
        const items = [
            ...this.labsCards.slice(-2),
            ...this.labsCards,
            ...this.labsCards.slice(0, 2)
        ];

        items.forEach((lab, i) => {
            const xPos = (i * this.cardWidth);
            const card = this.add.container(xPos, 0);

            // 1. IMAGEM DO ÍCONE (Certifique-se de que o carregamento da imagem está correto)
            const img = this.add.image(0, 0, lab.image).setScale(0.7).setAlpha(0.8);
            
            // 2. TAG DE NOME DINÂMICA
            const nameText = this.add.text(0, 0, lab.name, {
                fontSize: '18px',
                color: '#3d3d3d',
                fontFamily: 'Fredoka'
            }).setOrigin(0.5);

            const textWidth = nameText.getBounds().width;
            const bgWidth = textWidth + 40;
            const bgHeight = 35;
            const radius = bgHeight / 2;
            const tagY = 210; // "Mais para baixo" como pedido

            const tagContainer = this.add.container(0, tagY);
            const nameBg = this.add.graphics();

            // Sombra
            nameBg.fillStyle(0x000000, 0.15);
            nameBg.fillRoundedRect((-bgWidth / 2) + 1, (-bgHeight / 2) + 2, bgWidth, bgHeight, radius);

            // Fundo Branco
            nameBg.fillStyle(0xffffff, 1);
            nameBg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, radius);

            tagContainer.add([nameBg, nameText]);
            tagContainer.setAlpha(0);

            // IMPORTANTE: A ordem aqui define o card.list
            // list[0] = img
            // list[1] = tagContainer
            card.add([img, tagContainer]);
            card.setData('name', lab.name);

            this.container.add(card);
            this.cards.push(card);
        });
    }

    private updateCarousel(animate = true) {
        if (this.isAnimating) return;

        const targetX = (this.scale.width / 2) - (this.currentIndex * this.cardWidth);

        if (animate) {
            this.isAnimating = true;
            this.tweens.add({
                targets: this.container,
                x: targetX,
                duration: 500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    this.isAnimating = false;
                    this.handleInfiniteLoop();
                }
            });
        } else {
            this.container.x = targetX;
        }

        this.cards.forEach((card, i) => {
            const isActive = i === this.currentIndex;
            
            // Referências corrigidas
            const img = card.list[0] as Phaser.GameObjects.Image;
            const tagGroup = card.list[1] as Phaser.GameObjects.Container;

            this.tweens.killTweensOf(img);
            this.tweens.killTweensOf(tagGroup);

            if (isActive) {
                // Animação do ícone ativo
                this.tweens.add({
                    targets: img,
                    scale: { from: 0.85, to: 0.75 },
                    alpha: 1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
                // Aparece a tag
                this.tweens.add({ targets: tagGroup, alpha: 1, duration: 400 });
            } else {
                // Estado inativo
                img.setScale(0.6).setAlpha(0.6);
                this.tweens.add({ targets: tagGroup, alpha: 0, duration: 200 });
            }
        });
    }

    private handleInfiniteLoop() {
        const len = this.labsCards.length;
        if (this.currentIndex < 2) {
            this.currentIndex += len;
            this.updateCarousel(false);
        } else if (this.currentIndex >= len + 2) {
            this.currentIndex -= len;
            this.updateCarousel(false);
        }
    }

    private setupControls() {
        this.input.keyboard?.on('keydown-RIGHT', () => this.move(1));
        this.input.keyboard?.on('keydown-LEFT', () => this.move(-1));
        this.input.keyboard?.on('keydown-ENTER', () => this.selectActiveLab());

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localX = pointer.x - this.container.x;
            const clickedIndex = Math.round(localX / this.cardWidth);
            if (clickedIndex === this.currentIndex) {
                this.selectActiveLab();
            }
        });

        this.events.once('shutdown', () => {
            this.input.keyboard?.removeAllListeners();
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const swipeThreshold = 50;
            if (pointer.upX - pointer.downX > swipeThreshold) this.move(-1);
            else if (pointer.downX - pointer.upX > swipeThreshold) this.move(1);
        });
    }

    private move(delta: number) {
        if (!this.isAnimating) {
            this.currentIndex += delta;
            this.updateCarousel();
        }
    }

    private selectActiveLab() {
        const labName = this.cards[this.currentIndex].getData('name');
        if (labName === 'Biologia' || labName === 'Física' || labName === 'Química') {
            this.scene.start('Game');
        } else {
            console.log(`${labName} em desenvolvimento!`);
        }
    }
}