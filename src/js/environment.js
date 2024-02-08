import * as THREE from "three";

export default function loadEnvironment(scene) {
    scene.add(createFloor());
    createCity(scene);
    setupBackground(scene);
    setupLighting(scene);
}

function createCity(scene) {
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
            blockStartPos.add(new THREE.Vector3(1, 0, 1).multiplyScalar(blockPlusRoad *city.citySize * -0.5))
            for (let buildingX = 0; buildingX < city.blockSize; buildingX++) {
                for (let buildingZ = 0; buildingZ < city.blockSize; buildingZ++) {
                    const buildingOffset = new THREE.Vector3(1, 0, 1).multiplyScalar(city.buildingLength);
                    const buildingPos = blockStartPos.clone().add(buildingOffset)
                    const buildingHeight = getRandomInt(5, 3 * city.buildingLength);
                    buildingPos.add(new THREE.Vector3(city.buildingLength * buildingX, 0, city.buildingLength * buildingZ));
                    buildingPos.add(new THREE.Vector3(0, 0.5 * buildingHeight, 0));
                    let building = createCube();
                    building.geometry.scale(city.buildingLength, buildingHeight, city.buildingLength)
                    const randomColor = city.buildingColors[Math.floor(Math.random() * city.buildingColors.length)];
                    building.material.color.setHex(randomColor)
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
    // Create a ground plane
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xF9F9E0 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to lay flat
    plane.receiveShadow = true; // Enable shadow reception
    plane.position.set(0, 0, 0);

    return plane;
}

function createCube() {
    const boxGeometry = new THREE.BoxGeometry();
    const boxMaterial = new THREE.MeshStandardMaterial();
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true; // Enable shadow casting
    return box;
}

function setupLighting(scene) {
    // Create directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    light.castShadow = true; // Enable shadows for light
    
    scene.add(light);
    // Add ambient light
    scene.add(new THREE.AmbientLight(0xffffff));
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


