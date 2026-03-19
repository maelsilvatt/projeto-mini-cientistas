import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('background', 'background.png');
        this.load.image('backgrounds/menu-laboratorio', 'backgrounds/menu-laboratorio.png');

        // Labs
        this.load.image('labs/quimica', 'labs/quimica.png');
        this.load.image('labs/fisica', 'labs/fisica.png');
        this.load.image('labs/biologia', 'labs/biologia.png');
        this.load.image('labs/odonto', 'labs/odonto.png');
        this.load.image('labs/medicina', 'labs/medicina.png');
        this.load.image('labs/ia', 'labs/ia.png');
        
        // Objetos
        this.load.image('objects/microscopio', 'objects/microscopio.png');

        //  You can load any assets here, like this:
        //  this.load.image('sky', 'assets/sky.png');
        //  this.load.image('logo', 'assets/logo.png');
        //  this.load.image('red', 'assets/red.png');
        //  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
