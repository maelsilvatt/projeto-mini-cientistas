// menu_labs.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Dados dos laboratórios
    const labsData = [
        { name: 'Química', imagePath: 'assets/labs/quimica.png' },
        { name: 'Física', imagePath: 'assets/labs/fisica.png' },
        { name: 'Biologia', imagePath: 'assets/labs/biologia.png' },
        { name: 'Odontologia', imagePath: 'assets/labs/odonto.png' },
        { name: 'Medicina', imagePath: 'assets/labs/medicina.png' },
        { name: 'Inteligência Artificial', imagePath: 'assets/labs/ia.png' }
    ];

    const track = document.querySelector('.carousel-track');
    const carouselArea = document.querySelector('.carousel-area');
    const CLONE_COUNT = 2;

    let cards = [];
    let currentIndex = CLONE_COUNT;
    let cardWidth = 0;
    let spacing = 0;

    let isDragging = false;
    let startX = 0;
    let initialTranslateX = 0;
    let isAnimating = false;

    // Povoa o carrossel com clones e nomes
    function populateCarousel() {
        const itemsToPopulate = [
            ...labsData.slice(-CLONE_COUNT),
            ...labsData,
            ...labsData.slice(0, CLONE_COUNT)
        ];

        itemsToPopulate.forEach(lab => {
            const card = document.createElement('div');
            card.classList.add('lab-card');
            
            const img = document.createElement('img');
            img.src = lab.imagePath;
            img.alt = `Laboratório de ${lab.name}`;
            
            const nameplate = document.createElement('div');
            nameplate.classList.add('lab-name');
            nameplate.textContent = lab.name;

            card.appendChild(img);
            card.appendChild(nameplate);
            track.appendChild(card);
        });
        
        cards = document.querySelectorAll('.lab-card');
    }

    // Atualiza a posição e o estilo do carrossel
    function updateCarousel(useTransition = true) {
        if (cards.length === 0) return;

        isAnimating = useTransition;

        cardWidth = cards[0].offsetWidth;
        const styles = getComputedStyle(cards[0]);
        const marginLeft = parseInt(styles.marginLeft) || 0;
        const marginRight = parseInt(styles.marginRight) || 0;
        spacing = marginLeft + marginRight;
        const itemWidth = cardWidth + spacing;

        // Centraliza o card ativo
        const offset = -currentIndex * itemWidth;
        const trackCentering = (carouselArea.offsetWidth / 2) - (cardWidth / 2);        

        track.style.transition = useTransition ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        track.style.transform = `translateX(${offset + trackCentering}px)`;

        // Atualiza a classe 'active'
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Configurar todos os event listeners
    function setupEventListeners() {
        // Controles de Teclado
        window.addEventListener('keydown', (e) => {
            if (isAnimating) return;
            if (e.key === 'ArrowRight') {
                currentIndex++;
                updateCarousel();
            } else if (e.key === 'ArrowLeft') {
                currentIndex--;
                updateCarousel();
            }
        });

        // Controles de arrastar
        track.addEventListener('mousedown', (e) => {
            if (isAnimating) return;
            isDragging = true;
            startX = e.pageX;
            initialTranslateX = new DOMMatrix(getComputedStyle(track).transform).m41;
            track.style.transition = 'none'; 
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const currentX = e.pageX;
            const dx = currentX - startX;
            track.style.transform = `translateX(${initialTranslateX + dx}px)`;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging || isAnimating) return;
            isDragging = false;
            
            const currentTransform = new DOMMatrix(getComputedStyle(track).transform).m41;

            // Limita o índice para não ir muito longe com um arrasto rápido
            const movedBy = Math.sign(initialTranslateX - currentTransform);
            currentIndex = Math.max(0, Math.min(currentIndex + movedBy, cards.length -1));


            updateCarousel();
        });
        
        // Calcular o loop infinito após a transição
        track.addEventListener('transitionend', () => {
            isAnimating = false;

            if (currentIndex < CLONE_COUNT) {
                currentIndex += labsData.length;
                updateCarousel(false);
            } else if (currentIndex >= CLONE_COUNT + labsData.length) {
                currentIndex -= labsData.length;
                updateCarousel(false);
            }
        });
    }

    // Inicializa o carrossel
    populateCarousel();
    setTimeout(() => {
        updateCarousel(false);
        setupEventListeners();
    }, 100);

});