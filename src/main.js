// Configuração do PIXI.Application
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50, // Cor de fundo escura
    antialias: true,
});
document.body.appendChild(app.view);

// Constantes do Carrossel
const CARD_WIDTH = 400;  
const CARD_HEIGHT = 200; 
const CARD_SPACING = 50; 
const BASE_SCALE = 0.3;
const CENTER_X = app.screen.width / 2;

// Dados dos Laboratórios (Atualizado com os caminhos das imagens)
const labsData = [
    { name: 'Química', imagePath: 'assets/labs/quimica.png' },
    { name: 'Física', imagePath: 'assets/labs/fisica.png' },
    { name: 'Biologia', imagePath: 'assets/labs/biologia.png' },
    { name: 'Odonto', imagePath: 'assets/labs/odonto.png' },
    { name: 'Inteligência Artificial', imagePath: 'assets/labs/ia.png' },
    { name: 'Medicina', imagePath: 'assets/labs/medicina.png' }
];

// Container do Carrossel
const carouselContainer = new PIXI.Container();
app.stage.addChild(carouselContainer);

// Centraliza o container na tela verticalmente
carouselContainer.y = app.screen.height / 2;

// Função para criar um cartão de laboratório
function createLabCard(labInfo) {
    // Carrega o sprite do card de mundinho
    const card = PIXI.Sprite.from(labInfo.imagePath);

    // Definir o centro com anchor
    card.anchor.set(0.5);

    // Definir tamanho do cartão
    card.scale.set(0.1);

    return card;
}

// Preencher o carrossel com cartões
labsData.forEach((lab, index) => {
    const card = createLabCard(lab);
    // Posicionar cada cartão com base no índice
    card.x = index * (CARD_WIDTH + CARD_SPACING);    
    carouselContainer.addChild(card);
});

// Ajustar posição do carrossel para o primeiro cartão começar no centro
carouselContainer.x = CENTER_X;

// Lógica de Arrastar e Soltar
let dragging = false;
let startX = 0;
let previousX = 0;
let targetX = carouselContainer.x; // Posição de "snap" do carrossel

app.stage.interactive = true;
app.stage.on('pointerdown', onPointerDown);
app.stage.on('pointerup', onPointerUp);
app.stage.on('pointerupoutside', onPointerUp);
app.stage.on('pointermove', onPointerMove);

function onPointerDown(event) {
    dragging = true;
    startX = event.data.global.x;
    previousX = carouselContainer.x;
}

function onPointerMove(event) {
    if (dragging) {
        const currentX = event.data.global.x;
        const dx = currentX - startX;
        carouselContainer.x = previousX + dx;
    }
}

function onPointerUp() {
    if (!dragging) return;
    dragging = false;

    // Lógica de "Snap" - Centralizar no cartão mais próximo
    const cardWidthWithSpacing = CARD_WIDTH + CARD_SPACING;
    const offset = carouselContainer.x - CENTER_X;

    // Encontrar o índice do cartão mais próximo
    const closestIndex = Math.round(-offset / cardWidthWithSpacing);
    const clampedIndex = Math.max(0, Math.min(closestIndex, labsData.length - 1));

    // Calcular posição final do carrossel
    targetX = CENTER_X - (clampedIndex * cardWidthWithSpacing);
}

// Animação do Carrossel (Ticker)
app.ticker.add((delta) => {
    // Lerp para suavizar a movimentação
    const easing = 0.1;
    carouselContainer.x += (targetX - carouselContainer.x) * easing * delta;

    // Atualizar escala e opacidade com base na posição
    carouselContainer.children.forEach(card => {
        const cardGlobalX = card.getGlobalPosition().x;
        const distanceFromCenter = Math.abs(CENTER_X - cardGlobalX);

        // Escala: 1.2 no centro, 0.8 nas bordas, decresce com a distância
        const scaleFactor = Math.max(0.6, 1.2 - (distanceFromCenter / app.screen.width) * 1.5);
        card.scale.set(BASE_SCALE * scaleFactor);

        // Opacidade: diminui com a distância
        card.alpha = Math.max(0.4, 1 - (distanceFromCenter / app.screen.width));
    });
});