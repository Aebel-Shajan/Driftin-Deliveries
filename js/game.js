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


// Create a geometry, a material, and then a mesh that combines both
loadEnvironment(scene)

function createCube() {
  return new THREE.Mesh(new THREE.BoxGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff}))
}
player.mesh = createCube();
scene.add(player.mesh);
player.mesh.position.setY(1)


// Init 
c.init();
let cameraForward = player.forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0));

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const dt = 1/ 60;
  // player steering
  player.thetaSpeed += player.thetaPower*(c.a -c.d)*dt;
  player.thetaSpeed *= (1 - player.thetaDrag);
  player.theta += player.thetaSpeed * dt;

  // player looking
  player.forward.setFromSphericalCoords(1, Math.PI/2, player.theta);
  player.forward.normalize();
  player.mesh.lookAt(player.mesh.position.clone().add(player.forward.clone()))
  
  // player motion
  player.velocity.add(player.forward.clone().multiplyScalar(player.power*(c.w - c.s)));
  player.velocity.multiplyScalar(1 - player.redirectAmount);
  player.velocity.add(player.forward.clone().multiplyScalar(player.redirectAmount*player.velocity.length()));
  player.velocity.multiplyScalar(1 - player.drag);

  player.mesh.position.add(player.velocity.clone().multiplyScalar(dt));

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