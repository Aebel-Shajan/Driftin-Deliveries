import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const tempVec = new THREE.Vector3();

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function getRandomBuilding() {
    const randomLetter = 'ABCDEF'.charAt(Math.floor(Math.random() * 6));
    const buildingType = ["large_building", "skyscraper"][Math.floor(Math.random() * 2)];
    const randomBuilding = "assets/models/buildings/" + buildingType + randomLetter + ".glb";
    return randomBuilding;
}

export function getCityBlockPos(city, blockCoords) {
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

export function getCityBuildingPos(city, blockCoords, buildingCoords) {
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

export function getCityDeliveryPos(city, blockCoords, buildingCoords) {
    const blockPos = getCityBlockPos(city, blockCoords);
    const buildingPos = getCityBuildingPos(city, blockCoords, buildingCoords);
    const offset = buildingPos.clone().sub(blockPos);
    offset.x *= offset.x ? 1 / Math.abs(offset.x) : 0;
    offset.z *= offset.z ? 1 / Math.abs(offset.z) : 0;
    offset.multiplyScalar(0.5 * city.buildingWidth + 5);
    const deliveryPos = buildingPos.clone().add(offset).add(tempVec.set(0, 1, 0));
    return deliveryPos
}

function randomPerimeterCoord(squareSize) {
    const side = ["top", "bottom", "left", "right"][Math.floor(Math.random() * 4)];
    let x, z;
    switch (side) {
        case "top":
            x = Math.floor(Math.random() * squareSize);
            z = 0;
            break;
        case "bottom":
            x = Math.floor(Math.random() * squareSize);
            z = squareSize - 1;
            break;
        case "left":
            x = 0;
            z = Math.floor(Math.random() * squareSize);
            break;
        case "right":
            x = squareSize - 1;
            z = Math.floor(Math.random() * squareSize);
            break;
    }
    return { x, z };
}

export function getRandomDeliveryPos(city) {
    const randomBlockCoords = { x: getRandomInt(0, city.citySize) , z: getRandomInt(0, city.citySize) };
    const randomBuildingCoords = randomPerimeterCoord(city.blockSize);
    const deliveryPos = getCityDeliveryPos(city, randomBlockCoords, randomBuildingCoords);
    return deliveryPos;
}