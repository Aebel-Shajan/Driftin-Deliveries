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
    forward: new Three.Vector3(1, 0, 0),

    controlPlayer: function (c, dt) {
        // player steering
        player.thetaSpeed += player.thetaPower * (c.a - c.d) * dt;
        player.thetaSpeed *= (1 - player.thetaDrag);
        player.theta += player.thetaSpeed * dt;

        // player motion
        player.velocity.add(player.forward.clone().multiplyScalar(player.power * (c.w - c.s)));
        player.velocity.multiplyScalar(1 - player.redirectAmount);
        player.velocity.add(player.forward.clone().multiplyScalar(player.redirectAmount * player.velocity.length()));
        player.velocity.multiplyScalar(1 - player.drag);
        player.mesh.position.add(player.velocity.clone().multiplyScalar(dt));

        // player looking
        player.forward.setFromSphericalCoords(1, Math.PI / 2, player.theta);
        player.forward.normalize();
        player.mesh.lookAt(player.mesh.position.clone().add(player.forward.clone()))

    }
}
