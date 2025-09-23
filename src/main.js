// Configuração do PIXI.Application
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50, // Cor de fundo escura
    antialias: true,
});
document.body.appendChild(app.view);

// Constantes para facilitar ajustes
const CARD_WIDTH = 300;
const CARD_HEIGHT = 400;
const CARD_SPACING = 100; // Espaçamento entre cartões
const CENTER_X = app.screen.width / 2;

// Dados dos Laboratórios
const labsData = [
    { name: 'Química', color: 0xe74c3c },
    { name: 'Física', color: 0x3498db },
    { name: 'Biologia', color: 0x2ecc71 },
    { name: 'Odonto', color: 0x9b59b6 },
    { name: 'Inteligência Artificial', color: 0xf1c40f },
    { name: 'Medicina', color: 0xf1c40f }
];

// Container do Carrossel
const carouselContainer = new PIXI.Container();
app.stage.addChild(carouselContainer);

// Centraliza o container na tela verticalmente
carouselContainer.y = app.screen.height / 2;

// Função para criar um cartão de laboratório
function createLabCard(labInfo) {
    const card = new PIXI.Container();

    // Criar fundo do cartão
    const background = new PIXI.Graphics();
    background.beginFill(labInfo.color);
    background.drawRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
    background.endFill();
    card.addChild(background);

    // Adicionar texto no centro do cartão
    const title = new PIXI.Text(labInfo.name, {
        fontSize: 36,
        fill: 0xffffff,
        align: 'center',
        stroke: 0x000000,
        strokeThickness: 4,
    });
    title.anchor.set(0.5);
    title.x = CARD_WIDTH / 2;
    title.y = CARD_HEIGHT / 2;
    card.addChild(title);

    // Definir pivô do cartão para facilitar o escalonamento
    card.pivot.set(CARD_WIDTH / 2, CARD_HEIGHT / 2);

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
        card.scale.set(scaleFactor);

        // Opacidade: diminui com a distância
        card.alpha = Math.max(0.4, 1 - (distanceFromCenter / app.screen.width));
    });
});
