import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import { c } from './controls.js';
import { player } from './PlayerObject.js';
import loadEnvironment from './environment.js';
import updateHUD from './hud.js';
import * as foodDelivery from './foodDelivery.js';

const tempVec = new THREE.Vector3();

// Setup
const scene = new THREE.Scene();
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.81, 0)
});
const cannonDebugger = new CannonDebugger(scene, world, {})
const stats = Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

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
	if (Math.abs(velocity.length()) > 5) {
		newForward = velocity.normalize();
	}
	newForward.multiplyScalar(-10).add(tempVec.set(0,1.5,0));
	cameraForward.lerp(newForward, 0.17);
	cameraForward.normalize().multiplyScalar(10);
	camera.position.copy(position.clone().add(cameraForward));
	camera.lookAt(position);
}

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true; // Enable shadows
document.getElementById('game-container').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.gammaOutput = true;
let effect = new OutlineEffect(renderer, {
	kernelSize: 100,
	edgeStrength: 10.0,
	blur: true,
	height: 480,
});


// Init 
const city = {
	citySize: 4,
	blockSize: 4,
	buildingWidth: 15,
	roadWidth: 25,
}
loadEnvironment(city, scene, world);
player.setPosition({ x: 0, y: 10, z: 0 });
player.addObjectTo(scene, world);
// scene.add(player.debug);
var clock = new THREE.Clock();
// foodDelivery.deliveryPosDebug(city, scene, world);
foodDelivery.initDelivery(city, scene, world);

// Animation loop
function animate() {
	stats.begin();
	let dt = Math.min(clock.getDelta(), 1 / 10);

	let minimapMarkers = [
		{
			position: {x: player.getPosition().x, y: player.getPosition().z},
			size: {x: player.getOriginalSize().x, y: player.getOriginalSize().x},
			color: "#ff0000"
		}
	];
	if (foodDelivery.foodObject.mesh.visible) {
		const foodPos = foodDelivery.foodObject.getPosition();
		minimapMarkers.push({
			position: {x: foodPos.x, y: foodPos.z}
		})
	}
	if (foodDelivery.victimObject.mesh.visible) {
		const foodPos = foodDelivery.victimObject.getPosition();
		minimapMarkers.push({
			position: {x: foodPos.x, y: foodPos.z}
		})
	}
	updateHUD(city, minimapMarkers);
	requestAnimationFrame(animate);
	world.step(dt);
	// cannonDebugger.update();

	player.controlPlayer(c);
	player.updateMesh();
	player.updateDebug();
	foodDelivery.handleDelivery(city, player);

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