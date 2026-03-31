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

        // Visual simples do laboratório para o tutorial
        this.background = this.add.image(width / 2, height / 2, 'backgrounds/menu-laboratorio');
        this.background.setDisplaySize(width, height);
        this.background.setAlpha(0.6);

        this.microscope = this.add.image(width, height / 2, 'objects/microscopio');
        this.microscope.setOrigin(1, 0.5);
        this.microscope.setScale(0.8);

        this.tweens.add({
            targets: this.microscope,
            y: (height / 2) - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.statusText = this.add.text(width / 2, height / 2, 'Clique para falar com o Prof. Newton', {
            fontFamily: 'Fredoka',
            fontSize: '32px',
            color: '#3d3d3d',
            align: 'center'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.statusText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Gatilho de dialogo
        this.input.once('pointerdown', () => {
            this.startDialogue();
        }); 
    }

    private startDialogue() {
        // Extrai o JSON do cache
        const script = this.cache.json.get('tutorial-script');

        // Pausa a cena atual
        this.scene.pause();

        // Lança a cena do diálogo de forma paralela como overlay
        this.scene.launch('DialogueScene', { 
            script: script, 
            parentScene: 'Game', // Armazena o nome da cena para retornar depois
            onComplete: () => {
                console.log("Diálogo concluído no laboratório!");
                
                this.statusText.setText('Tutorial completo! Clique novamente para sair.');
                
                // Configura o próximo clique para ir para o GameOver
                this.input.once('pointerdown', () => {
                    this.scene.start('GameOver');
                });
            }
        });
    }
}