# Mini Cientistas 

Este é o repositório oficial do **Mini Cientistas**, um jogo educativo 2D multiplataforma, desenvolvido como parte do subprojeto *Mini Cientistas – Encantando o Semiárido*, sob coordenação de **Alana Nogueira Godinho**.

## 🚀 Status Atual: [Em Desenvolvimento]

O projeto está atualmente focado na implementação e refatoração da arquitetura principal.

* **Arquitetura do Jogo:** A arquitetura modular principal está **concluída**. O fluxo do jogador é gerenciado por um `SceneManager` que carrega diferentes "cenas" (Hubs e Minigames).
* **Fluxo de Carregamento:** O fluxo de entrada do usuário está implementado:
    1.  `index.html` (Pré-carregador): Carrega todos os *assets* do jogo.
    2.  `menu.html` (Menu Principal): Exibe o carrossel de seleção de laboratórios.
    3.  `game.html` (Shell do Jogo): Hospeda o canvas do PixiJS e o `main.js` que inicia a cena correta.
* **Cenas Implementadas:**
    * `HubBiologiaScene`: Funcional, com panorama, animação de personagem e sistema de gatilhos de diálogo.
    * `LandingMinigameScene`: Funcional, com física da nave, sistema de níveis e gerenciamento de DOM (cria/destrói sua própria UI).
* **Próximos Passos:**
    1.  Desenvolver os minigames da Biologia (ex: classificar micróbios).
    2.  Implementar o Hub e os minigames dos mundos de Química e Física.
    3.  Corrigir erros de exibição no Github Pages e Android.

---

## 📁 Arquitetura do Projeto

Todo o código-fonte do jogo e *assets* estão localizados dentro da pasta `/docs/`. Esta pasta serve como a raiz para todos os *deploys*, tanto para a web (GitHub Pages) quanto para o nativo (Capacitor).

```

docs/
│
├── assets/         \# Todas as imagens, sons e JSONs
│
├── src/            \# Todo o código-fonte JavaScript
│   │
│   ├── components/   \# Módulos de UI reutilizáveis (Camera, DialogueManager, etc.)
│   ├── core/         \# O "cérebro" (SceneManager, Preloader)
│   ├── gameobjects/  \# Classes de "atores" (Player, NPC, InteractiveObject)
│   ├── minigames/    \# Cenas de "desafio" (LandingMinigameScene)
│   └── scenes/       \# Cenas de "hub" (HubBiologiaScene, HubLabsScene)
│
├── index.html       \# (Loader) O pré-carregador que carrega tudo
├── menu.html        \# (Menu) O carrossel de seleção de fases
└── game.html        \# (Jogo) O "shell" que roda o PixiJS e o main.js

````

---

## 💻 Como Rodar (Desenvolvimento)

### 1. Web (Live Server)

1.  Clone o repositório.
```

git clone https://github.com/maelsilvatt/projeto-mini-cientistas.git

```
2.  Abra a pasta do projeto no VS Code.
3.  Garanta que você tenha a extensão "Live Server".
4.  Clique com o botão direito no arquivo **`/docs/index.html`** e selecione "Open with Live Server".
    * *(Nota: Se o Live Server for iniciado a partir da raiz, acesse `http://127.0.0.1:5500/docs/` no navegador).*

### 2. Android (Capacitor)

1.  Certifique-se de que o Android Studio esteja instalado.
2.  Faça suas alterações de código dentro da pasta `/docs/`.
3.  Abra um terminal na raiz do projeto e rode:

    ```bash
    # Copia as mudanças de /docs para /android
    npx cap sync android
    
    # Abre o projeto no Android Studio
    npx cap open android
    ```
4.  Dentro do Android Studio, clique no botão "Play" (▶) para compilar e rodar no seu emulador ou dispositivo.

---

## 🚀 Deploy

* **GitHub Pages:** O site é implantado automaticamente a partir da pasta `/docs/` do *branch* `main`.
* **Android:** O *deploy* é feito gerando um APK/AAB assinado através do Android Studio.

---

## 👥 Equipe do Projeto

- **Responsáveis pelo Projeto:** Alana Nogueira, Anderson Nogueira  
- **Coordenação:** Iális Cavalcante  
- **Engenharia de Software:** Ismael Soares  
- **Direção de Arte:** Kaique Damasceno