import { Scene } from 'phaser';

export class Game extends Scene {
    private background!: Phaser.GameObjects.Image;
    private microscope!: Phaser.GameObjects.Image;
    private statusText!: Phaser.GameObjects.Text;

    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.scale;

        // Configuração do fundo do laboratório
        this.background = this.add.image(width / 2, height / 2, 'backgrounds/menu-laboratorio');
        this.background.setDisplaySize(width, height);
        this.background.setAlpha(0.6);

        // Posicionamento do microscópio à direita e centralizado verticalmente
        this.microscope = this.add.image(width, height / 2, 'objects/microscopio');
        this.microscope.setOrigin(1, 0.5);
        this.microscope.setScale(0.8);

        // Animação de movimento suave no objeto
        this.tweens.add({
            targets: this.microscope,
            y: (height / 2) - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Texto de status centralizado
        this.statusText = this.add.text(width / 2, height / 2, 'Explorando o Laboratório... (em desenvolvimento)', {
            fontFamily: 'Fredoka',
            fontSize: '32px',
            color: '#3d3d3d',
            align: 'center'
        }).setOrigin(0.5);

        // Animação de opacidade no texto
        this.tweens.add({
            targets: this.statusText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Transição de cena ao clicar
        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }
}