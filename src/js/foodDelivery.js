import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as UTILS from './utils.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
const loader = new GLTFLoader();
const tempVec = new THREE.Vector3();
const foodModel = await loader.loadAsync("assets/models/pizza.glb");
// const victimMesh = await loader.loadAsync("")
export const foodObject = UTILS.createObjectFromMesh(foodModel.scene);
foodObject.setScale(tempVec.set(1,2,1).multiplyScalar(3));
foodObject.rotateAroundAxis(tempVec.set(1, 0, 0), Math.PI * 0.5);
foodObject.body.collisionFilterGroup = 2;
foodObject.body.collisionFilterMask = 2;

