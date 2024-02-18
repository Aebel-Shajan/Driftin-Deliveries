import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from 'cannon-es';
import { GameObject } from './GameObject.js';

const loader = new GLTFLoader();
const tempVec = new THREE.Vector3();
const foodModel = await loader.loadAsync("assets/models/pizza.glb");
// const victimMesh = await loader.loadAsync("")
export const foodObject = new GameObject(
    foodModel.scene,
    {
        mass: 0.1,
        position: new CANNON.Vec3(0, 1, 0),
        material: new CANNON.Material({
            friction: 0
        })
    }
)
foodObject.setScale(tempVec.set(1, 2, 1).multiplyScalar(3));
foodObject.body.angularVelocity.set(0, 1, 0);
