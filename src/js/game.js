import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import CannonDebugger from 'cannon-es-debugger';
import { c } from './controls.js';
import {player} from './player.js'
import loadEnvironment from './environment.js';
import updateHUD from './hud.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js'
// Setup
const scene = new THREE.Scene();
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});
const cannonDebugger = new CannonDebugger(scene, world, {})
const stats = Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// Camera
const camera = new THREE.PerspectiveCamera(
  75, // field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);
let cameraForward = new THREE.Vector3(0, 1, 1); 
function getXZ(vector3) {
  return new THREE.Vector3(vector3.x, 0, vector3.z);
}
function updateCamera(player) {
  let newForward = getXZ(player.getForward()).normalize();
  const velocity = getXZ(player.getVelocity());
  const position = player.getPosition();
  if (Math.abs(velocity.length()) > 0.1) {
    newForward = velocity.normalize();
  }
  newForward.multiplyScalar(-10).add(new THREE.Vector3(0, 2, 0));
  cameraForward.lerp(newForward, 0.1);
  camera.position.copy(position.clone().add(cameraForward));
  camera.lookAt(position);
}

// Set up the renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true; // Enable shadows
document.getElementById('game-container').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.gammaOutput = true;
let effect = new OutlineEffect( renderer, {
  edgeStrength: 10.0
} );
effect.blur = true;


// Init 
loadEnvironment(scene, world)
await player.init();
scene.add(player.forceDebug);
player.setPosition({x: -10, y: 10, z: 0});
player.addObjectTo(scene, world);
const dt = 1/ 60;

// Animation loop
function animate() {
  stats.begin();
  updateHUD();
  requestAnimationFrame(animate);
  world.step(dt);
  // cannonDebugger.update();
  

  player.controlPlayer(c, dt);

  // camera 
  updateCamera(player);
  effect.render(scene, camera);
  stats.end();
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