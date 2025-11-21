/* =================================================================
 * AudioManager.js
 * Gerencia a música de fundo e efeitos sonoros.
 * Lida com o desbloqueio de áudio do navegador (Autoplay Policy).
 * ================================================================= */

class AudioManager {
    constructor() {
        this.bgMusic = new Audio('assets/sounds/menu.mpeg');
        this.bgMusic.loop = true; // Música em loop
        this.bgMusic.volume = 0.5; // 50% do volume
        
        this.hasStarted = false; // Controla se o áudio já foi desbloqueado
    }

    /**
     * Configura os ouvintes para desbloquear o áudio no primeiro clique/tecla.
     */
    init() {
        const unlockAudio = () => {
            if (this.hasStarted) return;

            // Tenta tocar a música
            this.bgMusic.play().then(() => {
                this.hasStarted = true;
                console.log("Áudio iniciado com sucesso!");
            }).catch(error => {
                console.warn("Autoplay bloqueado pelo navegador:", error);
            });

            // Remove os ouvintes para não tentar iniciar de novo
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };

        // Adiciona ouvintes globais
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
    }

    /**
     * Para a música
     */
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    /**
     * Alterna entre tocar e pausar
     */
    toggleMute() {
        if (this.bgMusic.paused) {
            this.bgMusic.play();
        } else {
            this.bgMusic.pause();
        }
    }
}