import * as THREE from 'three';
import { MathUtils } from './utils.js';
import { c } from './controls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import player from './player.js'


// Set up the scene
const scene = new THREE.Scene();

const loader = new THREE.CubeTextureLoader();
loader.setPath( 'assets/textures/skybox/' );
const texturefloor = loader.load([
  'px.jpg', 'nx.jpg',
  'py.jpg', 'ny.jpg',
  'pz.jpg', 'nz.jpg'
]);
scene.background = texturefloor;

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


// Create a geometry, a material, and then a mesh that combines both
const geometry = new THREE.PlaneGeometry(100, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x03ED27 });
const floor = new THREE.Mesh(geometry, material);
floor.rotation.x = -90 * Math.PI / 180;
floor.scale.set(50, 50, 50);
floor.position.set(0, 0, 0);
scene.add(floor);

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

function createCube() {
  return new THREE.Mesh(new THREE.BoxGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff}))
}
player.mesh = createCube();
scene.add(player.mesh);
player.mesh.position.setY(1)

// Lights
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight )

// Set the camera position
c.init();
let forward = new THREE.Vector3(1,0, 0);
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const dt = 1/ 60;
  player.theta += 0.01*(c.a -c.d);
  player.forward.setFromSphericalCoords(1, Math.PI/2, player.theta);
  player.mesh.lookAt(player.mesh.position.clone().add(player.forward.clone()))
  player.velocity.add(player.forward.clone().multiplyScalar(player.power*(c.w - c.s)*dt));
  player.velocity.multiplyScalar(1 - player.drag);
  player.mesh.position.add(player.velocity);
  camera.position.copy(player.mesh.position.clone().add(player.forward.clone().multiplyScalar(-10)).add(new THREE.Vector3(0, 5, 0)));
  camera.lookAt(player.mesh.position);
  console.log(player.forward);
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