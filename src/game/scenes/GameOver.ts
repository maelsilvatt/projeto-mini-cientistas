import { Scene } from 'phaser';

export class GameOver extends Scene {
    private background!: Phaser.GameObjects.Image;
    private gameOverText!: Phaser.GameObjects.Text;
    private restartText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    create() {
        const { width, height } = this.scale;

        // Fundo com desfoque e transparência para manter a suavidade
        this.background = this.add.image(width / 2, height / 2, 'backgrounds/menu-laboratorio');
        this.background.setDisplaySize(width, height);
        this.background.setAlpha(0.4);
        this.background.postFX.addBlur(0, 2, 2, 1);

        // Texto principal estilizado
        this.gameOverText = this.add.text(width / 2, height / 2 - 50, 'Fim da Aventura!', {
            fontFamily: 'Fredoka',
            fontSize: '64px',
            color: '#d1478e', // Rosa escuro da paleta UIScene
            align: 'center'
        }).setOrigin(0.5);

        // Instrução para retornar
        this.restartText = this.add.text(width / 2, height / 2 + 50, 'Clique para voltar ao Menu', {
            fontFamily: 'Fredoka',
            fontSize: '24px',
            color: '#3d3d3d',
            align: 'center'
        }).setOrigin(0.5);

        // Animação suave de escala no texto principal
        this.tweens.add({
            targets: this.gameOverText,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Back.easeOut'
        });

        // Retorno ao carrossel de laboratórios
        this.input.once('pointerdown', () => {
            this.scene.start('HubLabsScene');
        });
    }
}