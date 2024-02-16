import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as UTILS from './utils.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
const loader = new GLTFLoader();
const foodModel = await loader.loadAsync("assets/models/pizza.glb");
// const victimMesh = await loader.loadAsync("")
export const foodObject = UTILS.createObjectFromMesh(foodModel.scene);

