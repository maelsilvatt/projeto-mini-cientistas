import { Scene, GameObjects } from 'phaser';

export class UIScene extends Scene {
    private uiGraphics!: GameObjects.Graphics;
    private headerTitle!: GameObjects.Text;
    private exitText!: GameObjects.Text;
    private logoImg!: GameObjects.Image; 

    private readonly COLORS = {
        backgroundBlue: 0x87ceeb,
        primaryPink: 0xff69b4,
        primaryPinkDark: 0xd1478e,
        fontDark: 0x3d3d3d,
        white: 0xffffff
    }; 

    constructor() {
        super({ key: 'UIScene' });
    }

    create(): void {
        this.uiGraphics = this.add.graphics();
                
        this.logoImg = this.add.image(0, 0, 'Logo');

        this.headerTitle = this.add.text(0, 0, 'Escolha o Laboratório!', {
            fontFamily: 'Fredoka',
            fontSize: '32px',
            color: '#3d3d3d'
        }).setOrigin(0.5);

        this.exitText = this.add.text(0, 0, 'SAIR', {
            fontFamily: 'Fredoka',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.drawUI();

        this.scale.on('resize', () => this.drawUI());
    }

    private drawUI(): void {
        const { width, height } = this.scale;
        this.uiGraphics.clear();

        const headerHeight = height * 0.10; 
        const footerHeight = height * 0.08;
        const sideMargin = width * 0.03;
        const barWidth = width - (sideMargin * 2);
        const cornerRadius = 20;

        // Sombras e barras de fundo
        this.uiGraphics.fillStyle(0x000000, 0.1);
        this.uiGraphics.fillRoundedRect(sideMargin, sideMargin + 4, barWidth, headerHeight, cornerRadius);
        this.uiGraphics.fillRoundedRect(sideMargin, height - footerHeight - sideMargin + 4, barWidth, footerHeight, cornerRadius);

        this.uiGraphics.fillStyle(this.COLORS.white, 1);
        this.uiGraphics.fillRoundedRect(sideMargin, sideMargin, barWidth, headerHeight, cornerRadius);
        this.uiGraphics.fillRoundedRect(sideMargin, height - footerHeight - sideMargin, barWidth, footerHeight, cornerRadius);

        // Definimos o tamanho do logo como 80% da altura do header
        const logoTargetHeight = headerHeight * 0.8;
        const logoScale = logoTargetHeight / this.logoImg.height;
        this.logoImg.setScale(logoScale);

        // X: Margem lateral + um pequeno padding interno (20px)
        // Y: Centralizado verticalmente no header
        const logoX = sideMargin + (this.logoImg.displayWidth / 2) + 20;
        const logoY = sideMargin + (headerHeight / 2);
        this.logoImg.setPosition(logoX, logoY);

        // Título da cena atual
        this.headerTitle.setPosition(width / 2, sideMargin + (headerHeight / 2));
        this.headerTitle.setFontSize(Math.min(headerHeight * 0.4, 32));

        // Botão de sair
        const btnW = Math.max(barWidth * 0.12, 80);
        const btnH = headerHeight * 0.6;
        const btnX = (sideMargin + barWidth) - (btnW / 2) - 20;
        const btnY = sideMargin + (headerHeight / 2);

        this.uiGraphics.fillStyle(this.COLORS.primaryPinkDark, 1);
        this.uiGraphics.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2 + 4, btnW, btnH, 20);

        this.uiGraphics.fillStyle(this.COLORS.primaryPink, 1);
        this.uiGraphics.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 20);

        this.exitText.setPosition(btnX, btnY);
        this.exitText.setFontSize(Math.min(btnH * 0.45, 18));
    }
}