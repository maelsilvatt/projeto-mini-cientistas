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
    private cardWidth = 350;

    constructor() {
        super('HubLabsScene');
    }

    create() {        
        this.cards = [];           // Limpa o array para não acumular cards velhos
        this.currentIndex = 2;     // Volta para a posição inicial do carrossel
        this.isAnimating = false;  // Garante que o input não comece travado

        // Remove listeners antigos para evitar conflitos
        this.input.keyboard?.removeAllListeners(); 
        this.input.removeAllListeners();

        const { width, height } = this.scale;        

        // Ofusca o fundo do laboratório para destacar o carrossel
        const bg = this.add.image(width / 2, height / 2, 'backgrounds/menu-laboratorio');
        bg.setDisplaySize(width, height);
        
        bg.postFX.addBlur(0, 2, 2, 1); 

        // A track do carrossel é um container centralizado
        this.container = this.add.container(width / 2, height / 2);

        this.setupCarousel();
        this.setupControls();
        
        // Posicionamento inicial sem animação
        this.updateCarousel(false);
    }

    private setupCarousel() {
        // Criar clones para o loop infinito
        const items = [
            ...this.labsCards.slice(-2),
            ...this.labsCards,
            ...this.labsCards.slice(0, 2)
        ];

        items.forEach((lab, i) => {
            const xPos = (i * this.cardWidth);
            const card = this.add.container(xPos, 0);

            // Imagem do Lab
            const img = this.add.image(0, 0, lab.image).setScale(0.8).setAlpha(0.7);
            
            // Tag de Nome 
            const nameBg = this.add.rectangle(0, 160, 200, 50, 0xffffff).setAlpha(0);
            const nameText = this.add.text(0, 160, lab.name, {
                fontSize: '24px', color: '#000000', fontFamily: 'bold Arial'
            }).setOrigin(0.5).setAlpha(0);

            card.add([img, nameBg, nameText]);
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

        // Efeitos Visuais
        this.cards.forEach((card, i) => {
            const isActive = i === this.currentIndex;
            const img = card.list[0] as Phaser.GameObjects.Image;
            const textGroup = [card.list[1], card.list[2]];

            // Animação de Pulse
            this.tweens.killTweensOf(img);
            if (isActive) {
                this.tweens.add({
                    targets: img,
                    scale: { from: 1.05, to: 1.15 },
                    alpha: 1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
                // Mostra o nome
                this.tweens.add({ targets: textGroup, alpha: 1, y: '+=0', duration: 400 });
            } else {
                img.setScale(0.8).setAlpha(0.7);
                this.tweens.add({ targets: textGroup, alpha: 0, duration: 200 });
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
        // Teclado
        this.input.keyboard?.on('keydown-RIGHT', () => this.move(1));
        this.input.keyboard?.on('keydown-LEFT', () => this.move(-1));
        this.input.keyboard?.on('keydown-ENTER', () => this.selectActiveLab());

        // Clique para selecionar
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localX = pointer.x - this.container.x;
            const clickedIndex = Math.round(localX / this.cardWidth);
            if (clickedIndex === this.currentIndex) {
                this.selectActiveLab();
            }      
        });

        // Limpa listeners ao sair da cena para evitar conflitos
        this.events.once('shutdown', () => {
            this.input.keyboard?.removeAllListeners();
        });

        // Arrastar cards
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
        if (labName === 'Biologia' || labName === 'Física') {
            this.scene.start('Game'); 
        } else {
            console.log(`${labName} em desenvolvimento!`);
        }
    }
}