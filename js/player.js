import * as Three from "three";

export let player = {
    redirectAmount: 0.1,
    velocity: new Three.Vector3(0, 0, 0),
    power: 2,
    drag: 0.01,
    mesh: null,
    thetaSpeed: 0,
    thetaPower: 10,
    thetaDrag: 0.1,
    theta: 0,
    forward: new Three.Vector3(1, 0, 0)
}
