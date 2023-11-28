import * as THREE from 'three';
import { MathUtils } from './utils.js';
import { c } from './controls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


// Set up the scene
const scene = new THREE.Scene();

const loader = new THREE.CubeTextureLoader();
loader.setPath( 'assets/textures/skybox/' );

const textureCube = loader.load([
  'px.jpg', 'nx.jpg',
  'py.jpg', 'ny.jpg',
  'pz.jpg', 'nz.jpg'
]);

scene.background = textureCube;

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75, // field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);



// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Set up the controls
c.init();
let controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
  controls.lock();
});
controls.addEventListener('unlock', () => {
  console.log('PointerLockControls: unlocked');
});

// Create a geometry, a material, and then a mesh that combines both
const geometry = new THREE.PlaneGeometry(100, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x03ED27 });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.x = -90 * Math.PI / 180;
cube.scale.set(50, 50, 50);
cube.position.set(0, 0, 0);
scene.add(cube);

function addTree() {
  const treeGeometry = new THREE.CylinderGeometry(2, 5, 20, 32);
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0xCE7E00 });
  const tree = new THREE.Mesh(treeGeometry, treeMaterial);
  const min = -500;
  const max = 500;
  tree.position.set(MathUtils.getRandomInt(min, max), 0, MathUtils.getRandomInt(min, max));
  scene.add(tree);
}

for (let i = 0; i < 100; i++){
  addTree();
}
// Lights
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight )

// Set the camera position
camera.position.y = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.moveRight(c.d - c.a);
  controls.moveForward(c.w - c.s);
  camera.position.y += c.space - c.shift;


  // Render the scene from the perspective of the camera
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the animation loop
animate();