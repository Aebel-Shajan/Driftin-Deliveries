import * as THREE from 'three';
import { c } from './controls.js';
import {player} from './player.js'
import loadEnvironment from './environment.js';


// Set up the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75, // field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.getElementById('game-container').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// Init 
loadEnvironment(scene)
c.init();
player.init(scene);
let cameraForward = player.forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0));

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const dt = 1/ 60;

  player.controlPlayer(c, dt);

  // camera 
  cameraForward.lerp(player.forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 2, 0)), 0.1);
  camera.position.copy(player.mesh.position.clone().add(cameraForward));
  camera.lookAt(player.mesh.position);
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