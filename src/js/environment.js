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
}

async function createCity(scene, world) {
    const city = {
        citySize: 4,
        blockSize: 4,
        buildingWidth: 15,
        roadWidth: 25,
    }

    for (let blockX = 0; blockX < city.citySize; blockX++) {
        for (let blockZ = 0; blockZ < city.citySize; blockZ++) {
            const blockPlusRoad = (city.blockSize * city.buildingWidth) + city.roadWidth;
            const blockStartPos = new THREE.Vector3(blockPlusRoad * blockX, 0, blockPlusRoad * blockZ);
            blockStartPos
            .add(
                new THREE.Vector3(1, 0, 1)
                .multiplyScalar(blockPlusRoad * city.citySize * -0.5)
                )
            
            await createBlock(city.buildingWidth, city.blockSize, blockStartPos, scene, world);
        }
    }
}

async function createBlock(buildingWidth, blockSize, blockStartPos, scene, world) {
    const pavementSize = buildingWidth*blockSize + 8;
    const pavementMesh = new THREE.Mesh(
        new THREE.BoxGeometry(pavementSize, 0.3, pavementSize),
        new THREE.MeshBasicMaterial(
            {color: 0x999999}
            )
    )
    pavementMesh.position.copy(
        blockStartPos
        .clone()
        .add(new THREE.Vector3(1,0,1).multiplyScalar(0.5*buildingWidth*blockSize))
        );
    scene.add(pavementMesh);

    for (let buildingX = 0; buildingX < blockSize; buildingX++) {
        for (let buildingZ = 0; buildingZ < blockSize; buildingZ++) {
            const buildingPos = blockStartPos
            .clone()
            .add(new THREE.Vector3(1, 0, 1).multiplyScalar(0.5*buildingWidth)) // buildings placed from centre
            .add(new THREE.Vector3(buildingWidth * buildingX, 0, buildingWidth * buildingZ))
            ;
            let building = await createBuildingObject(new THREE.Vector3(1, 0, 1)
            .multiplyScalar(buildingWidth));
            buildingPos.y += 0.5*building.getSize().y;// lift object up based on height
            building.setPosition(buildingPos);
            building.addObjectTo(scene, world);
            let rotateAmount = 0;
            if (buildingX == 0){
                rotateAmount = -0.5 * Math.PI;
            }
            if (buildingX == blockSize - 1) {
                rotateAmount = 0.5 * Math.PI;
            }
            if (buildingZ == blockSize - 1) {
                rotateAmount = 0;
            }
            if (buildingZ == 0) {
                rotateAmount = Math.PI;
            }
            building.rotateAroundAxis(new CANNON.Vec3(0, 1, 0), rotateAmount);
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

async function createBuildingObject(size) {
    let buildingMesh = await loaderGLTF.loadAsync(UTILS.getRandomBuilding());
    const buildingObject = UTILS.createObjectFromMesh(buildingMesh.scene);
    const originalSize = buildingObject.originalSize;
    size.y =  buildingObject.originalSize.y * size.x * 0.7;
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


