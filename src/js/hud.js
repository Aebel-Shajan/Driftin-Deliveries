import { player } from "./PlayerObject.js";
import { c } from "./controls";
import * as foodDelivery from "./foodDelivery.js";

let screen = { x: window.innerWidth, y: window.innerHeight }
let canvas = document.querySelector("#overlay");
canvas.width = screen.x;
canvas.height = screen.y;
const ctx = canvas.getContext("2d");

function updateHUD(city, markers) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const speed = player.body.velocity.length().toFixed(0);
    const maxSpeed = 100;
    const speedAngle = (speed / maxSpeed) * Math.PI * 0.5;

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 0.2 * screen.y, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(
        screen.x - Math.cos(speedAngle) * 0.2 * screen.y,
        screen.y - Math.sin(speedAngle) * 0.2 * screen.y,
    );
    ctx.stroke();
    drawMinimap(city, markers)
}

function drawMinimap(city, markers) {
    const blockPlusRoad = (city.blockSize * city.buildingWidth) + city.roadWidth;
    const cityLength = blockPlusRoad * city.citySize;
    const mapLength = 0.25 * Math.min(screen.x, screen.y);
    const mapTopLeft = { x: 10, y: screen.y - mapLength - 10 };
    const mapScale = mapLength / cityLength;
    const mapCentre = { x: mapTopLeft.x + 0.5 * mapLength, y: mapTopLeft.y + 0.5 * mapLength };
    const scaledBlockLength = city.blockSize * city.buildingWidth * mapScale;
    const scaledBlockPlusRoad = mapScale * blockPlusRoad;

    centredRect(ctx, mapCentre, { x: mapLength, y: mapLength });
    ctx.fillStyle = '#B2BEB5';
    ctx.fill();

    let coords = { x: 0, y: 0 };
    for (coords.x = 0; coords.x < city.citySize; coords.x += 1) {
        for (coords.y = 0; coords.y < city.citySize; coords.y += 1) {
            const blockMapPos = {
                x: mapTopLeft.x + (scaledBlockPlusRoad) * (coords.x + 0.5),
                y: mapTopLeft.y + (scaledBlockPlusRoad) * (coords.y + 0.5)
            };
            centredRect(ctx, blockMapPos, { x: scaledBlockLength, y: scaledBlockLength })
            ctx.fillStyle = 'white';
            ctx.fill();
        }
    }

    for (let i = 0; i < markers.length; i++) {
        const marker = markers[i];
        marker.size = marker.size ? marker.size : {x: 1, y: 1};
        marker.color = marker.color ? marker.color : "#00ffff";
        marker.position.x = Math.min(Math.abs(marker.position.x), 0.5 * cityLength) * Math.sign(marker.position.x);
        marker.position.y = Math.min(Math.abs(marker.position.y), 0.5 * cityLength) * Math.sign(marker.position.y);

        const scaledMarkerPos = { x: mapCentre.x + marker.position.x * mapScale, y: mapCentre.y + marker.position.y * mapScale };
        const scaledMarkerSize = { x: 10* mapScale * marker.size.x, y: 10* mapScale * marker.size.y};

        centredRect(ctx, scaledMarkerPos, scaledMarkerSize);
        ctx.fillStyle = marker.color;
        ctx.fill();
    }
}

function centredRect(ctx, pos, size) {
    ctx.beginPath();
    ctx.rect(pos.x - 0.5 * size.x, pos.y - 0.5 * size.y, size.x, size.y);
    ctx.stroke();
}


window.addEventListener('resize', () => {
    screen = { x: window.innerWidth, y: window.innerHeight }
    canvas = document.querySelector("#overlay");
    canvas.width = screen.x;
    canvas.height = screen.y;
});

export default updateHUD;