import * as THREE from "three";
import * as CANNON from "cannon-es";
import  { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as UTILS from './utils.js';
const loaderGLTF = new GLTFLoader();

export default function loadEnvironment(scene, world) {
    createFloorObject(scene, world);
    createCity(scene, world);
    setupBackground(scene);
    setupLighting(scene);
    createBuildingObject("helllo");
}

async function createCity(scene, world) {
    const city = {
        citySize: 6,
        blockSize: 4,
        buildingLength: 20,
        roadWidth: 30,
        buildingColors: [0xFF90BC, 0xFFC0D9, 0x8ACDD7]
    }

    for (let blockX = 0; blockX < city.citySize; blockX++) {
        for (let blockZ = 0; blockZ < city.citySize; blockZ++) {
            const blockPlusRoad = (city.blockSize * city.buildingLength) + city.roadWidth;
            const blockStartPos = new THREE.Vector3(blockPlusRoad * blockX, 0, blockPlusRoad * blockZ);
            blockStartPos.add(new THREE.Vector3(1, 0, 1).multiplyScalar(blockPlusRoad * city.citySize * -0.5))
            for (let buildingX = 0; buildingX < city.blockSize; buildingX++) {
                for (let buildingZ = 0; buildingZ < city.blockSize; buildingZ++) {
                    const buildingOffset = new THREE.Vector3(1, 0, 1).multiplyScalar(city.buildingLength);
                    const buildingPos = blockStartPos.clone().add(buildingOffset)
                    const buildingHeight = getRandomInt(1* city.buildingLength, 3 * city.buildingLength);
                    buildingPos.add(new THREE.Vector3(city.buildingLength * buildingX, 0, city.buildingLength * buildingZ));
                    buildingPos.add(new THREE.Vector3(0, 0.5 * buildingHeight, 0));

                    let building = await createBuildingObject(new THREE.Vector3(city.buildingLength, buildingHeight, city.buildingLength));
                    const randomColor = city.buildingColors[Math.floor(Math.random() * city.buildingColors.length)];
                    // building.mesh.material.color.setHex(randomColor)
                    building.body.position.copy(buildingPos);
                    building.update();
                    scene.add(building.mesh);
                    world.addBody(building.body)
                }
            }
        }
    }
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
            new THREE.MeshStandardMaterial( {roughness: 0.9, color: 0xaaaaaa })
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

function createCubeObject(scale) {
    const cube = {
        mesh: new THREE.Mesh(
            new THREE.BoxGeometry(0.99*scale.x, scale.y, 0.99*scale.z),
            new THREE.MeshStandardMaterial()
        ),
        body: new CANNON.Body({
            shape: new CANNON.Box(scale.multiplyScalar(0.5)),
            type: CANNON.Body.STATIC,
            material: new CANNON.Material({
                friction: 0.5
            })
        }),
        update: function() {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
        
    }
    
    return cube;
}

async function createBuildingObject(size) {
    let buildingMesh = await loaderGLTF.loadAsync(UTILS.getRandomBuilding());
    const buildingObject = UTILS.createObjectFromMesh(buildingMesh.scene);
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


