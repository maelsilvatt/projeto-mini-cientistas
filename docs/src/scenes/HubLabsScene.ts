import { BaseScene } from '../core/BaseScene';

interface LabCard {
    name: string;
    imagePath: string;
}

export class HubLabsScene extends BaseScene {
    public sceneId = "hub-labs";

    // Dados das Trilhas
    private readonly labsCards: LabCard[] = [
        { name: 'Química', imagePath: '/assets/labs/quimica.png' },
        { name: 'Física', imagePath: '/assets/labs/fisica.png' },
        { name: 'Biologia', imagePath: '/assets/labs/biologia.png' },
        { name: 'Odontologia', imagePath: '/assets/labs/odonto.png' },
        { name: 'Medicina', imagePath: '/assets/labs/medicina.png' },
        { name: 'Inteligência Artificial', imagePath: '/assets/labs/ia.png' }
    ];

    // Estado do Carrossel
    private readonly CLONE_COUNT = 2;
    private currentIndex = 2; // Começa após os clones iniciais
    private isDragging = false;
    private isAnimating = false;
    private startX = 0;
    private initialTranslateX = 0;
    
    
    // Referências DOM (Tipadas)
    private track!: HTMLDivElement;
    private cards: NodeListOf<HTMLDivElement> | null = null;
    private carouselArea!: HTMLDivElement;
    private resizeObserver?: ResizeObserver;

    protected getUIHTML(): string {
        // O Tailwind resolve o fundo desfocado com o modificador 'before:'
        return `
            <div class="absolute inset-0 before:content-[''] before:absolute before:inset-0 
                        before:bg-[url('/assets/backgrounds/menu-laboratorio.png')] 
                        before:bg-cover before:bg-center before:blur-[2px] before:saturate-[0.8]">
                
                <div class="relative z-10 flex flex-col h-full">
                    <div class="carousel-area flex-grow flex items-center relative overflow-hidden w-full cursor-grab active:cursor-grabbing">
                        <div class="carousel-track flex items-center h-[70%] transition-transform duration-500 will-change-transform select-none">
                            </div>
                    </div>
                </div>
            </div>
        `;
    }

    protected setupEventListeners(): void {
        // 1. Agrupamos tudo que depende do 'this.track'
        if (this.track) {
            this.addGlobalListener(this.track, 'mousedown', this.onDragStart.bind(this));

            // O 'transitionend' é crucial para detectar quando a animação de troca de card termina, permitindo o loop infinito
            this.addGlobalListener(this.track, 'transitionend', () => {
                this.isAnimating = false;
                this.handleInfiniteLoop();
            });
        }

        // 2. Atalhos de teclado (Window sempre existe)
        this.addGlobalListener(window, 'keydown', (e: KeyboardEvent) => {
            if (this.isAnimating) return;
            if (e.key === 'ArrowRight') this.moveCarousel(1);
            else if (e.key === 'ArrowLeft') this.moveCarousel(-1);
            else if (e.key.toLowerCase() === 'e' || e.key === 'Enter') this.selectActiveLab();
        });

        // 3. Lógica de Drag (Window sempre existe)     
        this.addGlobalListener(window, 'mousemove', this.onDragMove.bind(this));
        this.addGlobalListener(window, 'mouseup', this.onDragEnd.bind(this));
    }

    protected async setup(): Promise<void> {
        this.carouselArea = this.uiLayer!.querySelector('.carousel-area') as HTMLDivElement;
        this.track = this.uiLayer!.querySelector('.carousel-track') as HTMLDivElement;

        this.populateCarousel();
        
        // Resize Observer para manter o carrossel centralizado em telas de Android
        this.resizeObserver = new ResizeObserver(() => this.updateCarousel(false));
        this.resizeObserver.observe(this.carouselArea);

        // Frame inicial
        requestAnimationFrame(() => this.updateCarousel(false));
    }

    protected setupUI(): void {
        super.setupUI(); // Chama o criador de container da BaseScene

        // CAPTURA IMEDIATA: Garante que os elementos existam para o setupEventListeners
        if (this.uiLayer) {
            this.carouselArea = this.uiLayer.querySelector('.carousel-area') as HTMLDivElement;
            this.track = this.uiLayer.querySelector('.carousel-track') as HTMLDivElement;
        }
    }

    private populateCarousel(): void {
        const items = [
            ...this.labsCards.slice(-this.CLONE_COUNT),
            ...this.labsCards,
            ...this.labsCards.slice(0, this.CLONE_COUNT)
        ];

        this.track.innerHTML = items.map(lab => `
            <div class="lab-card flex-[0_0_33.33%] h-full flex flex-col justify-center items-center relative 
                        transition-all duration-500 scale-[0.8] opacity-70 cursor-pointer">
                <img src="${lab.imagePath}" class="w-[80%] h-[80%] object-contain drop-shadow-2xl pointer-events-none">
                <div class="lab-name absolute -bottom-4 bg-white text-font-dark px-7 py-3 rounded-[20px] 
                            text-2xl font-bold shadow-md opacity-0 translate-y-2 transition-all whitespace-nowrap">
                    ${lab.name}
                </div>
            </div>
        `).join('');

        this.cards = this.track.querySelectorAll('.lab-card');
    }

    private updateCarousel(useTransition = true): void {
        if (!this.cards) return;

        const cardWidth = this.cards[0].offsetWidth;
        const offset = -this.currentIndex * cardWidth;
        const centering = (this.carouselArea.offsetWidth / 2) - (cardWidth / 2);

        this.track.style.transition = useTransition ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        this.track.style.transform = `translateX(${offset + centering}px)`;

        // Ativa classes de destaque no card central
        this.cards.forEach((card, i) => {
            const isActive = i === this.currentIndex;
            card.classList.toggle('opacity-100', isActive);
            card.classList.toggle('scale-[1.05]', isActive);
            card.classList.toggle('animate-pulse-active', isActive);
            card.classList.toggle('z-10', isActive);
            
            const nameTag = card.querySelector('.lab-name');
            nameTag?.classList.toggle('opacity-100', isActive);
            nameTag?.classList.toggle('translate-y-0', isActive);
        });
    }

    // --- Lógica de Navegação ---
    private selectActiveLab(): void {
        if (this.isAnimating) return;
        const indexReal = (this.currentIndex - this.CLONE_COUNT + this.labsCards.length) % this.labsCards.length;
        const lab = this.labsCards[indexReal];
        
        if (lab.name === 'Biologia' || lab.name === 'Física') {
            this.sceneManager.changeScene(lab.name.toLowerCase());
        } else {
            // Usa o modal global do index.html
            const modal = document.getElementById('custom-modal');
            if (modal) {
                (document.getElementById('modal-message')!).textContent = `${lab.name} está em desenvolvimento!`;
                modal.classList.remove('hidden');
            }
        }
    }

    public destroyScene(): void {
        this.resizeObserver?.disconnect();
        super.destroyScene();
    }

    // Handlers de Drag e Navegação
    private moveCarousel(dir: number) { 
        this.currentIndex += dir; this.updateCarousel(); 
    }

    private onDragStart(e: MouseEvent): void {
        if (this.isAnimating) return;

        this.isDragging = true;
        this.startX = e.pageX;

        // Captura a posição X atual da matriz de transformação
        // No TS, precisamos garantir que o valor extraído da matriz seja tratado como número
        const style = window.getComputedStyle(this.track);
        const matrix = new DOMMatrix(style.transform);
        this.initialTranslateX = matrix.m41; // m41 representa o 'translateX'

        // Desativa a transição para o rastro acompanhar o mouse em tempo real
        this.track.style.transition = 'none';
        
        // Evita seleção de texto indesejada durante o arrasto
        e.preventDefault();
    }

    private onDragMove(e: MouseEvent): void {
        if (!this.isDragging) return;

        const currentX = e.pageX;
        const dx = currentX - this.startX;

        // Move o trilho conforme o deslocamento (Delta X)
        this.track.style.transform = `translateX(${this.initialTranslateX + dx}px)`;
    }

    private onDragEnd(e: MouseEvent): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        const currentTransform = new DOMMatrix(window.getComputedStyle(this.track).transform).m41;
        const diff = this.initialTranslateX - currentTransform;
        const distance = Math.abs(diff);

        // Se for um movimento muito curto (menos de 5px), tratamos como um clique simples
        if (distance < 5) {
            this.updateCarousel(); // Reseta a posição original
            return;
        }

        // Se houve arrasto real, calculamos para qual card pular
        this.isAnimating = true;
        const cardWidth = (this.track.querySelector('.lab-card') as HTMLElement).offsetWidth;
        const threshold = cardWidth * 0.2; // Exige 20% de arrasto para trocar de card

        if (distance > threshold) {
            // Math.sign nos dá 1 (frente) ou -1 (trás)
            this.moveCarousel(Math.sign(diff));
        } else {
            this.updateCarousel();
        }
    }

    private handleInfiniteLoop(): void {
        // Lógica de "pulo silencioso" (sem transição) para criar a ilusão de loop infinito
        if (this.currentIndex < this.CLONE_COUNT) {
            // Se entrou nos clones do início, pula para o final real
            this.currentIndex += this.labsCards.length;
            this.updateCarousel(false);
        } else if (this.currentIndex >= this.CLONE_COUNT + this.labsCards.length) {
            // Se entrou nos clones do fim, pula para o início real
            this.currentIndex -= this.labsCards.length;
            this.updateCarousel(false);
        }
    }
}