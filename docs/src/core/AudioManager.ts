export class AudioManager {
    // Propriedades privadas para evitar que outros scripts alterem o áudio diretamente
    private bgMusic: HTMLAudioElement;
    private hasStarted: boolean = false;

    constructor() {
        // No Vite, usamos o caminho absoluto começando com /
        this.bgMusic = new Audio('/assets/sounds/menu.mpeg');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;
    }

    /**
     * Configura os ouvintes para desbloquear o áudio no primeiro clique/tecla.
     * Necessário para satisfazer as políticas de Autoplay do Chrome/Firefox.
     */
    public init(): void {
        const unlockAudio = async () => {
            if (this.hasStarted) return;

            try {
                await this.bgMusic.play();
                this.hasStarted = true;
                console.log("🔊 Áudio desbloqueado e iniciado!");
                
                // Limpeza dos eventos após o desbloqueio bem-sucedido
                this.removeUnlockEvents(unlockAudio);
            } catch (error) {
                console.warn("⚠️ Autoplay bloqueado. Aguardando interação real do usuário.", error);
            }
        };

        // Adiciona ouvintes globais
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
    }

    private removeUnlockEvents(handler: () => void): void {
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
    }

    /**
     * Toca um efeito sonoro curto (SFX)
     * @param path Caminho do arquivo de som
     * @param volume Volume opcional (0 a 1)
     */
    public playSFX(path: string, volume: number = 0.7): void {
        const sfx = new Audio(path);
        sfx.volume = volume;
        sfx.play().catch(e => console.warn("Erro ao tocar SFX:", e));
    }

    /**
     * Para a música de fundo completamente
     */
    public stopMusic(): void {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    /**
     * Troca a música de fundo atual
     * @param path Novo caminho do arquivo
     */
    public changeMusic(path: string): void {
        this.stopMusic();
        this.bgMusic.src = path;
        this.bgMusic.play().catch(e => console.warn("Erro ao trocar música:", e));
    }

    /**
     * Alterna entre Mudo e Ativado
     */
    public toggleMute(): boolean {
        this.bgMusic.muted = !this.bgMusic.muted;
        return this.bgMusic.muted;
    }

    /**
     * Define o volume da música de fundo
     * @param volume Valor de 0.0 a 1.0
     */
    public setVolume(volume: number): void {
        this.bgMusic.volume = Math.max(0, Math.min(1, volume));
    }
}