import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as UTILS from './utils.js';
import { GameObject } from "./gameObject.js";
const loaderGLTF = new GLTFLoader();
const tempVec = new THREE.Vector3();

export default function loadEnvironment(city, scene, world) {
    createFloorObject(scene, world);
    createCity(city, scene, world);
    setupBackground(scene);
    setupLighting(scene);
}

function getCityBlockPos(city, blockCoords) {
    const blockPlusRoad = (city.blockSize * city.buildingWidth) + city.roadWidth;
    const cityCornerPos = new THREE.Vector3(1, 0, 1)
        .multiplyScalar(blockPlusRoad * city.citySize * -0.5);
    const blockCentrePos = cityCornerPos
        .add(
            tempVec.set(0.5 + blockCoords.x, 0, 0.5 + blockCoords.z)
                .multiplyScalar(blockPlusRoad)
        );
    return blockCentrePos;
}

function getCityBuildingPos(city, blockCoords, buildingCoords) {
    const blockCentrePos = getCityBlockPos(city, blockCoords);
    const blockCornerPos = blockCentrePos
        .add(
            tempVec.set(1, 0, 1)
                .multiplyScalar(-0.5 * city.blockSize * city.buildingWidth)
        );
    const buildingCentrePos = blockCornerPos
        .add(
            tempVec.set(0.5 + buildingCoords.x, 0, 0.5 + buildingCoords.z)
                .multiplyScalar(city.buildingWidth)
        );
    return buildingCentrePos;
}

async function createCity(city, scene, world) {
    for (let blockX = 0; blockX < city.citySize; blockX++) {
        for (let blockZ = 0; blockZ < city.citySize; blockZ++) {
            const blockPavement = createPavementMesh(city, { x: blockX, z: blockZ });
            scene.add(blockPavement);
            for (let buildingX = 0; buildingX < city.blockSize; buildingX++) {
                const addAmount = buildingX % (city.blockSize - 1) ? (city.blockSize - 1) : 1 // dont loop through inner buildings
                for (let buildingZ = 0; buildingZ < city.blockSize; buildingZ += addAmount) {
                    const buildingPos = getCityBuildingPos(city, { x: blockX, z: blockZ }, { x: buildingX, z: buildingZ });
                    const buildingSize = tempVec.set(1, 0, 1).multiplyScalar(city.buildingWidth);
                    let building = await createBuildingObject(buildingSize);
                    building.setBottomPosition(buildingPos);
                    building.updateMesh();
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
    const plane = {
        mesh: new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000),
            new THREE.MeshStandardMaterial({ roughness: 0.9, color: 0xaaaaaa })
        ),
        body: new CANNON.Body(
            {
                shape: new CANNON.Plane(),
                type: CANNON.Body.STATIC,
                material: new CANNON.Material({
                    friction: 0.5
                }),
            }
        ),
    }
    plane.body.quaternion.setFromEuler(- Math.PI / 2, 0, 0);
    plane.mesh.position.copy(plane.body.position);
    plane.mesh.quaternion.copy(plane.body.quaternion);
    scene.add(plane.mesh);
    world.addBody(plane.body);
    return plane;
}

async function createBuildingObject(size) {
    let buildingModel = await loaderGLTF.loadAsync(UTILS.getRandomBuilding());
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


