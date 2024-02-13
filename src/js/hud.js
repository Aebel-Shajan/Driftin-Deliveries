import { player } from "./player";
import { c } from "./controls";

function updateHUD() {
    document.querySelector("#speed").innerHTML = player.body.velocity.length().toFixed(0).toString();
}

export default updateHUD;