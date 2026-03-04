import * as PIXI from 'pixi.js';
import { BaseScene } from '../../../core/BaseScene';

interface LevelData {
    basePos: { x: number; y: number };
    obstaculos: Array<{ x: number; y: number; w: number; h: number }>;
}

export class LandingMinigameScene extends BaseScene {
    public sceneId = "landing-minigame";

    // Constantes de Física
    private readonly SAFE_SPEED = 50;
    private gravidade = 1.6;
    private nivelAtual = 0;
    
    // Estado da Nave
    private navePos = { x: 0, y: 0 };
    private naveVel = { x: 0, y: 0 };
    private naveMassa = 5;
    private forcaPropulsor = 300;
    private pousou = false;

    // Referências Pixi
    private naveSprite!: PIXI.Sprite;
    private baseSprite!: PIXI.Sprite;
    private hitboxBase!: PIXI.Graphics;
    private obstaculos: PIXI.Graphics[] = [];
    private particulas: PIXI.Graphics[] = [];
    private keys: Record<string, boolean> = {};

    private niveis: LevelData[] = [
        { basePos: { x: 0.5, y: 0.9 }, obstaculos: [] },
        { basePos: { x: 0.75, y: 0.9 }, obstaculos: [{ x: 0.5, y: 0.5, w: 600, h: 20 }] },
        { basePos: { x: 0.25, y: 0.9 }, obstaculos: [{ x: 0.4, y: 0.6, w: 300, h: 20 }, { x: 0.2, y: 0.3, w: 300, h: 20 }] }
    ];

    protected getUIHTML(): string {
        return `
            <div class="absolute inset-0 pointer-events-none p-6">
                
                <div class="absolute z-[100] bg-white/90 shadow-lg rounded-[15px] 
                            /* Desktop (Padrão) */
                            top-5 left-5 p-[15px] w-72 
                            /* Responsividade (Equivalente ao @media max-width: 768px) */
                            max-md:top-[60px] max-md:left-[10px] max-md:p-2 max-md:w-60
                            pointer-events-auto animate-fade-in">
                    
                    <h3 class="text-font-dark font-bold mb-3 flex items-center gap-2">
                        🛸 Simulador de Pouso
                    </h3>

                    <div class="space-y-4">
                        <label class="block text-xs font-semibold text-font-dark/70">
                            Força Propulsor
                            <input type="range" id="forcaSlider" class="range-input w-full mt-1" min="100" max="1000" value="300">
                        </label>
                        
                        <label class="block text-xs font-semibold text-font-dark/70">
                            Gravidade
                            <input type="range" id="gravidadeSlider" class="range-input w-full mt-1" min="0" max="10" step="0.1" value="1.6">
                        </label>
                    </div>
                </div>

                </div>
        `;
    }
    protected setupEventListeners(): void {
        this.addGlobalListener(window, 'keydown', (e: KeyboardEvent) => this.keys[e.key.toLowerCase()] = true);
        this.addGlobalListener(window, 'keyup', (e: KeyboardEvent) => this.keys[e.key.toLowerCase()] = false);

        const fSlider = this.uiLayer?.querySelector("#forcaSlider") as HTMLInputElement;
        this.addGlobalListener(fSlider, "input", (e) => this.forcaPropulsor = Number((e.target as HTMLInputElement).value));

        const gSlider = this.uiLayer?.querySelector("#gravidadeSlider") as HTMLInputElement;
        this.addGlobalListener(gSlider, "input", (e) => this.gravidade = Number((e.target as HTMLInputElement).value));

        const btnReset = this.uiLayer?.querySelector("#btnReiniciar") as HTMLButtonElement;
        this.addGlobalListener(btnReset, "click", () => this.carregarNivel(this.nivelAtual));
    }

    protected async setup(): Promise<void> {
        // Fundo
        const background = new PIXI.Sprite(PIXI.Assets.get("/assets/backgrounds/fundo-planeta-2.png"));
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        this.addChild(background);

        // Nave
        this.naveSprite = new PIXI.Sprite(PIXI.Assets.get("/assets/characters/nave/nave.png"));
        this.naveSprite.anchor.set(0.5);
        this.naveSprite.height = this.app.screen.height * 0.12;
        this.naveSprite.scale.x = this.naveSprite.scale.y;
        this.addChild(this.naveSprite);

        this.carregarNivel(this.nivelAtual);
    }

    public update = (ticker: PIXI.Ticker): void => {
        const dt = ticker.deltaTime / 60;

        if (!this.pousou) {
            this.processarFisica(dt);
            this.checarColisoes();
        }
        this.atualizarParticulas(dt);
    };

    private processarFisica(dt: number): void {
        // Aplicação de Forças
        if (this.keys["arrowup"] || this.keys["w"]) this.aplicarForca(0, -this.forcaPropulsor, dt);
        if (this.keys["arrowleft"] || this.keys["a"]) this.aplicarForca(-this.forcaPropulsor, 0, dt);
        if (this.keys["arrowright"] || this.keys["d"]) this.aplicarForca(this.forcaPropulsor, 0, dt);

        // Gravidade Constante
        this.naveVel.y += this.gravidade * dt;

        // Integração de Posição
        this.navePos.x += this.naveVel.x;
        this.navePos.y += this.naveVel.y;
        this.naveSprite.position.set(this.navePos.x, this.navePos.y);
    }

    private aplicarForca(fx: number, fy: number, dt: number): void {
        this.naveVel.x += (fx / (this.naveMassa * 100));
        this.naveVel.y += (fy / (this.naveMassa * 100));
        
        // Efeito de partículas (motor)
        this.criarParticula(this.navePos.x, this.navePos.y + 20);
    }

    private checarColisoes(): void {
        const bounds = this.naveSprite.getBounds();
        const screen = this.app.screen;

        // Bordas
        if (this.navePos.x < 0 || this.navePos.x > screen.width || this.navePos.y < 0) {
            this.falhar("Saiu da órbita!");
        }

        // 1. Pegamos o Rectangle da nave uma única vez (performance!)
        const naveRect = this.naveSprite.getBounds().rectangle;

        // 2. Base de Pouso
        if (this.hitboxBase) {
            const baseRect = this.hitboxBase.getBounds().rectangle;
            // No Pixi v8, usamos o método estático para garantir compatibilidade
            if (naveRect.intersects(baseRect)) {
                this.validarPouso();
            }
        }

        // 3. Obstáculos
        for (const obs of this.obstaculos) {
            const obsRect = obs.getBounds().rectangle;
            if (naveRect.intersects(obsRect)) {
                this.falhar("Colisão Crítica!");
                break; // Para o loop assim que bater
            }
        }
        if (this.navePos.y > screen.height) this.falhar("Impacto no solo!");
    }

    private carregarNivel(n: number): void {
        this.pousou = false;
        this.navePos = { x: this.app.screen.width / 2, y: 100 };
        this.naveVel = { x: 0, y: 0 };
        this.uiLayer?.querySelector("#modal-falha")?.classList.add("hidden");

        // Limpeza de nível anterior
        this.obstaculos.forEach(o => o.destroy());
        this.obstaculos = [];
        this.baseSprite?.destroy();
        this.hitboxBase?.destroy();

        const data = this.niveis[n];

        // Criar Base
        this.baseSprite = new PIXI.Sprite(PIXI.Assets.get("/assets/characters/nave/base.png"));
        this.baseSprite.anchor.set(0.5, 1);
        this.baseSprite.x = this.app.screen.width * data.basePos.x;
        this.baseSprite.y = this.app.screen.height * data.basePos.y;
        this.baseSprite.height = 60;
        this.baseSprite.scale.x = this.baseSprite.scale.y;
        this.addChild(this.baseSprite);

        // Hitbox Invisível (v8 syntax)
        this.hitboxBase = new PIXI.Graphics()
            .rect(-this.baseSprite.width/2, -10, this.baseSprite.width, 20)
            .fill({ color: 0xffffff, alpha: 0 });
        this.hitboxBase.position.set(this.baseSprite.x, this.baseSprite.y - 10);
        this.addChild(this.hitboxBase);
    }

    private falhar(motivo: string): void {
        this.pousou = true;
        const modal = this.uiLayer?.querySelector("#modal-falha");
        const texto = this.uiLayer?.querySelector("#falha-texto");
        if (texto) texto.textContent = motivo;
        modal?.classList.remove("hidden");
        this.audioManager.playSFX('/assets/sounds/explosion.mp3');
    }

    private validarPouso(): void {
        this.pousou = true;
        if (Math.abs(this.naveVel.y) * 60 < this.SAFE_SPEED) {
            console.log("Pouso Sucesso!");
            // Lógica de próximo nível...
        } else {
            this.falhar(`Velocidade de impacto muito alta!`);
        }
    }

    private criarParticula(x: number, y: number): void {
        const p = new PIXI.Graphics()
            .circle(0, 0, 3)
            .fill(0x3498db);
        p.position.set(x, y);
        (p as any).vx = (Math.random() - 0.5) * 2;
        (p as any).vy = 2 + Math.random() * 2;
        (p as any).vida = 1.0;
        this.particulas.push(p);
        this.addChild(p);
    }

    private atualizarParticulas(dt: number): void {
        for (let i = this.particulas.length - 1; i >= 0; i--) {
            const p = this.particulas[i];
            const pData = p as any;
            pData.vida -= dt * 2;
            if (pData.vida <= 0) {
                p.destroy();
                this.particulas.splice(i, 1);
            } else {
                p.x += pData.vx;
                p.y += pData.vy;
                p.alpha = pData.vida;
            }
        }
    }
}