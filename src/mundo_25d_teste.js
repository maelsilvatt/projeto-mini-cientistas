import * as THREE from 'three';

// Variáveis Globais
let scene, camera, renderer;
let juliaSprite;

// Inicialização
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0d0ff); // Azul claro

  // Câmera Ortográfica estilo Paper Mario
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 8;

    camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    100
    );

    // Posição lateral com leve inclinação
    camera.position.set(0, 0, 5); 
    camera.lookAt(0, 0, 0);        


  // Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Chão 
  const groundGeometry = new THREE.PlaneGeometry(40, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2.3;
  ground.position.y = -0.5;
  scene.add(ground);

  // Parede de fundo 
  const wallGeometry = new THREE.PlaneGeometry(40, 10);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.z = -5;
  wall.position.y = 4.5;
  scene.add(wall);

  // Luz 
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Julia
  const textureLoader = new THREE.TextureLoader();
  const juliaTexture = textureLoader.load('assets/characters/julia/julia_walk_1.png');
  const spriteMaterial = new THREE.SpriteMaterial({ map: juliaTexture, transparent: true });
  juliaSprite = new THREE.Sprite(spriteMaterial);
  juliaSprite.position.set(0, 1, 0);
  juliaSprite.scale.set(2, 2, 1);
  scene.add(juliaSprite);

  animate();
}

// Loop de animação 
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();
