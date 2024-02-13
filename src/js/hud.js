import { player } from "./player";
import { c } from "./controls";

function updateHUD() {
    const speed = player.body.velocity.length().toFixed(0);
    const maxSpeed = 100;
    const speedAngle = (speed/maxSpeed)*Math.PI*0.5;

    const screen = {x: window.innerWidth, y: window.innerHeight}
    const canvas = document.querySelector("#overlay");
    canvas.width = screen.x;
    canvas.height = screen.y;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 0.2*screen.y, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(
        screen.x - Math.cos(speedAngle)*0.2*screen.y,
        screen.y - Math.sin(speedAngle)*0.2*screen.y,
         );
    ctx.stroke();
}


export default updateHUD;