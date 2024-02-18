import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function getRandomBuilding() {
    const randomLetter = 'ABCDEF'.charAt(Math.floor(Math.random() * 6));
    const buildingType = ["large_building", "skyscraper"][Math.floor(Math.random()* 2)];
    const randomBuilding = "assets/models/buildings/" + buildingType + randomLetter + ".glb";
    return randomBuilding;
}
