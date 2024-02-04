import * as Three from "three";

let player = {
    position: new Three.Vector3(0, 0, 0),
    mesh: null,
    forward: new Three.Vector3(1, 0, 0)
}

export default player;