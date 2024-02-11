import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { c } from './controls.js';
import {player} from './player.js'
import loadEnvironment from './environment.js';


// Setup
const scene = new THREE.Scene();
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});
const cannonDebugger = new CannonDebugger(scene, world, {})


// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75, // field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true; // Enable shadows
document.getElementById('game-container').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// Init 
loadEnvironment(scene, world)
player.init();
scene.add(player.mesh);
world.addBody(player.body);
let cameraForward = player.forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0));
const dt = 1/ 60;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  world.step(dt);
  cannonDebugger.update();
  

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