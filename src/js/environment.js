import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as utils from "./utils.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameObject } from "./GameObject.js";

const loaderGLTF = new GLTFLoader();
const tempVec = new THREE.Vector3();

export default async function loadEnvironment(city, scene, world) {
    createFloorObject(scene, world);
    createCity(city, scene, world);
    setupBackground(scene);
    setupLighting(scene);
}

async function createCity(city, scene, world) {
    for (let blockX = 0; blockX < city.citySize; blockX++) {
        for (let blockZ = 0; blockZ < city.citySize; blockZ++) {
            const blockPavement = createPavementMesh(city, { x: blockX, z: blockZ });
            scene.add(blockPavement);
            for (let buildingX = 0; buildingX < city.blockSize; buildingX++) {
                const addAmount = buildingX % (city.blockSize - 1) ? (city.blockSize - 1) : 1 // dont loop through inner buildings
                for (let buildingZ = 0; buildingZ < city.blockSize; buildingZ += addAmount) {
                    const buildingPos = utils.getCityBuildingPos(city, { x: blockX, z: blockZ }, { x: buildingX, z: buildingZ });
                    const buildingSize = tempVec.set(1, 0, 1).multiplyScalar(city.buildingWidth);
                    let building = await createBuildingObject(buildingSize);
                    building.setBottomPosition(buildingPos);
                    building.addObjectTo(scene, world);
                    let rotateAmount = 0;
                    if (buildingX == 0) {
                        rotateAmount = -0.5 * Math.PI;
                    }
                    if (buildingX == city.blockSize - 1) {
                        rotateAmount = 0.5 * Math.PI;
                    }
                    if (buildingZ == city.blockSize - 1) {
                        rotateAmount = 0;
                    }
                    if (buildingZ == 0) {
                        rotateAmount = Math.PI;
                    }
                    building.rotateAroundAxis(tempVec.set(0, 1, 0), rotateAmount);
                    building.updateMesh();
                }
            }
        }
    }
}

function createPavementMesh(city, blockCoords) {
    const pavementSize = city.buildingWidth * city.blockSize + 8;
    const pavementMesh = new THREE.Mesh(
        new THREE.BoxGeometry(pavementSize, 0.3, pavementSize),
        new THREE.MeshBasicMaterial(
            { color: 0x999999 }
        )
    )
    pavementMesh.position.copy(getCityBlockPos(city, blockCoords));
    return pavementMesh;
}


function createTree() {
    const treeGeometry = new THREE.CylinderGeometry(2, 5, 20, 32);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0xCE7E00 });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.castShadow = true;
    return tree;
}

function createFloorObject(scene, world) {
    // Create a ground plane
    const floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshStandardMaterial({ roughness: 0.9, color: 0xaaaaaa })
    );
    const floorPhysics = {
        shape: new CANNON.Plane(),
        type: CANNON.Body.STATIC,
        material: new CANNON.Material({
            friction: 0
        }),
    }
    const floorObject = new GameObject(floorMesh, floorPhysics);
    floorObject.rotateAroundAxis(new THREE.Vector3(1, 0, 0), - Math.PI / 2);
    floorObject.updateMesh();
    floorObject.addObjectTo(scene, world);
    return floorObject;
}

async function createBuildingObject(size) {
    let buildingModel = await loaderGLTF.loadAsync(utils.getRandomBuilding());
    const buildingObject = new GameObject(
        buildingModel.scene,
        {
            type: CANNON.Body.STATIC,
            material: new CANNON.Material({
                friction: 0.5
            })
        }
    );
    size.y = buildingObject.getOriginalSize().y * size.x * 0.7;
    buildingObject.setSize(size);
    return buildingObject;
}

function setupLighting(scene) {
    // Create directional light
    const light1 = new THREE.DirectionalLight(0xffffff, 4);
    light1.position.set(100, 100, 100);
    const light2 = new THREE.DirectionalLight(0xffffff, 4);
    light2.position.set(-100, 100, -100);

    scene.add(light1);
    scene.add(light2);
    // Add ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0));
}

function setupBackground(scene) {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('assets/textures/skybox/');
    const texturefloor = loader.load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
    ]);
    scene.background = texturefloor;
}
