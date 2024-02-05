import * as THREE from "three";

export default function loadEnvironment(scene) {
    scene.add(createFloor());
    // adding trees randomly
    for (let i = 0; i < 100; i++) {
        const tree = createTree();
        const min = -500;
        const max = 500;
        tree.position.set(getRandomInt(min, max), 0, getRandomInt(min, max));
        scene.add(tree);
    }

}

function createTree() {
    const treeGeometry = new THREE.CylinderGeometry(2, 5, 20, 32);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0xCE7E00 });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    return tree;
}

function createFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0x03ED27 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -90 * Math.PI / 180;
    floor.scale.set(50, 50, 50);
    floor.position.set(0, 0, 0);
    return floor
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
