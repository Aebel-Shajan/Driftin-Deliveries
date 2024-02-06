import * as THREE from "three";

export default function loadEnvironment(scene) {
    scene.add(createFloor());
    createCity(scene);
    setupBackground(scene);
    setupLighting(scene);
}

function createCity(scene) {
    const city = {
        citySize: 5,
        blockSize: 3,
        buildingLength: 20,
        roadWidth: 20
    }

    for (let blockX = 0; blockX < city.citySize; blockX++) {
        for (let blockZ = 0; blockZ < city.citySize; blockZ++) {
            const blockPlusRoad = (city.blockSize * city.buildingLength) + city.roadWidth;
            const blockStartPos = new THREE.Vector3(blockPlusRoad * blockX, 0, blockPlusRoad * blockZ);
            for (let buildingX = 0; buildingX < city.blockSize; buildingX++) {
                for (let buildingZ = 0; buildingZ < city.blockSize; buildingZ++) {
                    const buildingOffset = new THREE.Vector3(1, 0, 1).multiplyScalar(city.buildingLength);
                    const buildingPos = blockStartPos.clone().add(buildingOffset).add(new THREE.Vector3(city.buildingLength * buildingX, 0, city.buildingLength * buildingZ));
                    let building = createCube();
                    const buildingHeight = getRandomInt(5, 3 * city.buildingLength);
                    building.geometry.scale(city.buildingLength, buildingHeight, city.buildingLength)
                    scene.add(building);
                    building.position.copy(buildingPos);

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

function createFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0x03ED27 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -90 * Math.PI / 180;
    floor.scale.set(50, 50, 50);
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    return floor;
}

function createCube() {
    const cube = new THREE.Mesh(new THREE.BoxGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cube.castShadow = true;
    return cube;
}

function setupLighting(scene) {
    // Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 100, 10);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
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


