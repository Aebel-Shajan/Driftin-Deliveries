import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from 'cannon-es';
import { GameObject } from './GameObject.js';
import * as utils from './utils.js';

const loader = new GLTFLoader();
const tempVec = new THREE.Vector3();

// Food Object
const foodModel = await loader.loadAsync("assets/models/pizza.glb");
export const foodObject = new GameObject(
    foodModel.scene,
    {
        mass: 0.1,
        material: new CANNON.Material(
            {
                friction: 0
            }
        )
    }
)
foodObject.setScale(tempVec.set(1, 2, 1).multiplyScalar(3));
foodObject.body.angularVelocity.set(0, 1, 0);

// Customer Object
const headRadius = 0.3;
const head = new THREE.Mesh(new THREE.SphereGeometry(headRadius), new THREE.MeshBasicMaterial({ color: 0xFFC0CB }));
const body = new THREE.Mesh(new THREE.CylinderGeometry(headRadius, 1.5 * headRadius), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
const victimModel = new THREE.Object3D();
victimModel.add(head);
head.position.copy(tempVec.set(0, headRadius, 0));
victimModel.add(body);
body.position.copy(tempVec.set(0, -0.5, 0));
export const victimObject = new GameObject(
    victimModel,
    {
        mass: 0.01,
        material: new CANNON.Material(
            {
                friction: 0
            }
        )
    }
)

// Delivery logic
const state = {
    search: "searching food",
    deliver: "delivering food"
};
let currentState = state.search;

function placeRandomlyInCity(object, city) {
    object.setBottomPosition(utils.getRandomDeliveryPos(city));
    object.setVelocity(tempVec.set(0, 0, 0));
    object.mesh.visible = true;
}

function hideFromPlayer(object) {
    object.setBottomPosition(tempVec.set(0, 100, 0));
    object.setVelocity(tempVec.set(0, 0, 0));
    object.mesh.visible = false;
}

function floatObject(object) {
    object.body.angularVelocity.set(0, 1, 0);
    object.body.applyForce(new CANNON.Vec3(0, 9.81 * object.body.mass, 0));
    object.updateMesh();
}

export function initDelivery(city, scene, world) {
    placeRandomlyInCity(foodObject, city);
    hideFromPlayer(victimObject);
    foodObject.addObjectTo(scene, world);
    victimObject.addObjectTo(scene, world);
}

export function handleDelivery(city, player) {
    floatObject(foodObject)
    floatObject(victimObject);
    switch (currentState) {
        case state.search:
            if (foodObject.overlaps(player)) {
                hideFromPlayer(foodObject);
                placeRandomlyInCity(victimObject, city);
                currentState = state.deliver;
            }
            break;
        case state.deliver:
            if (victimObject.overlaps(player)) {
                hideFromPlayer(victimObject);
                placeRandomlyInCity(foodObject, city);
                currentState = state.search;
            }
            break;
        default:
            throw new Error("Invalid state");
    }
}

export function deliveryPosDebug(city, scene, world) {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial();
    for (let blockX = 0; blockX < city.citySize; blockX++) {
        for (let blockZ = 0; blockZ < city.citySize; blockZ++) {
            for (let buildingX = 0; buildingX < city.blockSize; buildingX++) {
                const addAmount = buildingX % (city.blockSize - 1) ? (city.blockSize - 1) : 1 // dont loop through inner buildings
                for (let buildingZ = 0; buildingZ < city.blockSize; buildingZ += addAmount) {
                    const blockCoords = { x: blockX, z: blockZ };
                    const buildingCoords = { x: buildingX, z: buildingZ };
                    const debugObject = new GameObject(
                        new THREE.Mesh(cubeGeometry, cubeMaterial),
                        {}
                    );
                    debugObject.setBottomPosition(utils.getRandomDeliveryPos(city, blockCoords, buildingCoords));
                    debugObject.updateMesh();
                    debugObject.addObjectTo(scene, world);
                }
            }
        }
    }
}