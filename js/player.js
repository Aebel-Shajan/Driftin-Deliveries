import * as Three from "three";

let player = {
    velocity: new Three.Vector3(0, 0, 0),
    power: 5,
    drag: 0.05,
    mesh: null,
    theta: 0,
    forward: new Three.Vector3(1, 0, 0)
}

export default player;