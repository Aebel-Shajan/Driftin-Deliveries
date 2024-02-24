import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import { c } from './controls.js';
import { player } from './PlayerObject.js';
import loadEnvironment from './environment.js';
import { updateHUD, clearHUD } from './hud.js';
import * as foodDelivery from './foodDelivery.js';
import { Particles } from './particles.js';

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
	newForward.multiplyScalar(-10).add(tempVec.set(0, 1.5, 0));
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
foodDelivery.foodObject.addObjectTo(scene, world);
foodDelivery.victimObject.addObjectTo(scene, world);
foodDelivery.initDelivery(city, scene, world);
let smoke = new Particles(50, 0.1, 0xff000);
smoke.addToScene(scene);
const gameState = {
	mainMenu: 0,
	inGame: 1,
	unlimitedMode: 2
}
let currentGameState = gameState.mainMenu;
let menuCamPhi = 0;
export let timer = 0;
let highScore = localStorage.getItem("highScore") ? localStorage.getItem("highScore") : 0;

document.querySelector("#score").innerHTML = highScore;

// UI
function hideUI() {
	document.querySelector("#main-menu").style.display = "none";
}
function showUI() {
	document.querySelector("#main-menu").style.display = "flex";
}

document.querySelector("#play-button").addEventListener("click", () => {
	currentGameState = gameState.inGame;
	hideUI();
})

document.querySelector("#unlimited-mode-button").addEventListener("click", () => {
	currentGameState = gameState.unlimitedMode;
	hideUI();
})

// Animation loop
function animate() {
	// Always at start of loop
	stats.begin();
	let dt = Math.min(clock.getDelta(), 1 / 10);
	requestAnimationFrame(animate);
	world.step(dt);

	switch (currentGameState) {
		case gameState.mainMenu:
			panCamera(dt)
			timer = 0;
			break;
		case gameState.inGame:
			gameLoop();
			foodDelivery.handleDelivery(city, player);
			timer = timer + dt;
			if (timer > 60 * 2) {
				if (foodDelivery.score > highScore) {
					localStorage.setItem("highScore", foodDelivery.score);
					highScore = foodDelivery.score;
					document.querySelector("#score").innerHTML = highScore;
				}
				currentGameState = gameState.mainMenu;
				resetGameParameters();
			}
			break;
		case gameState.unlimitedMode:
			foodDelivery.hideFromPlayer(foodDelivery.foodObject);
			foodDelivery.hideFromPlayer(foodDelivery.victimObject);
			gameLoop()
			break;
	}

	// Always at end of loop
	effect.render(scene, camera);
	stats.end();
}



function gameLoop() {
	// HUD
	let minimapMarkers = [
		{
			position: { x: player.getPosition().x, y: player.getPosition().z },
			size: { x: player.getOriginalSize().x, y: player.getOriginalSize().x },
			color: "#ff0000"
		}
	];
	if (foodDelivery.foodObject.mesh.visible) {
		const foodPos = foodDelivery.foodObject.getPosition();
		minimapMarkers.push({
			position: { x: foodPos.x, y: foodPos.z }
		})
	}
	if (foodDelivery.victimObject.mesh.visible) {
		const foodPos = foodDelivery.victimObject.getPosition();
		minimapMarkers.push({
			position: { x: foodPos.x, y: foodPos.z }
		})
	}
	updateHUD(city, minimapMarkers);


	// cannonDebugger.update();

	// Player
	player.controlPlayer(c);
	player.updateMesh();
	player.updateDebug();


	// Smoke Fx
	const showSmoke = player.getVelocity().clone().normalize().dot(player.getForward()) < 0.95;
	const smokeVel = player.getRelativeVector(0, 0.1, -0.1);
	if (c.ShiftLeft && showSmoke) {
		const rightTyrePos = player.getPosition().clone().add(player.getRelativeVector(-0.5, -0.5, -1));
		const leftTyrePos = player.getPosition().clone().add(player.getRelativeVector(0.5, -0.5, -1));
		smoke.show(rightTyrePos, smokeVel, 1);
		smoke.show(leftTyrePos, smokeVel, 1)
	} else {
		smoke.hide(smokeVel, 1);
	}

	// camera 
	updateCamera(player);
}

function panCamera(dt) {
	menuCamPhi += 0.05 * dt;
	camera.position.set(200 * Math.cos(menuCamPhi), 100, 200 * Math.sin(menuCamPhi));
	camera.lookAt(new THREE.Vector3(0, 0, 0));
}


// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', (event) => {
	if (event.code == 'Escape') {
		resetGameParameters();
		currentGameState = gameState.mainMenu;
	}

});

function resetGameParameters() {
	showUI();
	clearHUD();
	player.setPosition({ x: 0, y: 10, z: 0 });
	player.setVelocity({ x: 0, y: 0, z: 0 });
	player.setQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0));
	foodDelivery.initDelivery(city, scene, world);

}

// Start the animation loop
animate();