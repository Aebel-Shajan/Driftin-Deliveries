import * as THREE from "three";
import * as CANNON from "cannon-es";

export let player = {
    mesh: new THREE.Mesh(),
    body: new CANNON.Body(),
    physicsMaterial: new CANNON.Material(),
    redirectAmount: 0.1,
    velocity: new THREE.Vector3(0, 0, 0),
    power: 1,
    drag: 0.01,
    thetaSpeed: 0,
    thetaPower: 10,
    thetaDrag: 0.1,
    theta: 0,
    forward: new THREE.Vector3(1, 0, 0),

    init: function() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry, 
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        this.body = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
            mass: 1,
            position: new CANNON.Vec3(0, 1, 2),
            material: this.physicsMaterial
        });
        this.mesh.position.copy(new THREE.Vector3(0, 1, 0));
    },
    update: function() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    },
    controlPlayer: function (c, dt) {
        // player steering
        player.thetaSpeed += player.thetaPower * (c.KeyA - c.KeyD) * dt;
        player.thetaSpeed *= (1 - player.thetaDrag);
        player.theta += player.thetaSpeed * dt;

        // player motion
        player.velocity.add(player.forward.clone().multiplyScalar(player.power * (c.KeyW - c.KeyS)));
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
