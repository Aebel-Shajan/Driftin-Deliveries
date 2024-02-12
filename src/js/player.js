import * as THREE from "three";
import * as CANNON from "cannon-es";

export let player = {
    mesh: new THREE.Mesh(),
    body: new CANNON.Body(),
    physicsMaterial: new CANNON.Material(),
    redirectAmount: 0.1,

    init: function () {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry,
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        this.body = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
            mass: 1,
            position: new CANNON.Vec3(0, 1, 2),
            material: new CANNON.Material({
                friction: 0
            })
        });
        this.mesh.position.copy(new THREE.Vector3(0, 1, 0));
        this.body.angularDamping = 0.9;
    },
    update: function () {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    },
    getRelativeVector: function (x, y, z) {
        const vec = new THREE.Vector3(x, y, z);
        vec.applyQuaternion(this.body.quaternion);
        return vec
    },
    getForward: function () {
        const forward = this.getRelativeVector(0, 0, 1);
        return forward;
    },
    getSideward: function () {
        const forward = this.getRelativeVector(1, 0, 0);
        return forward;
    },
    controlPlayer: function (c, dt) {
        this.update();
        const torque =
            this.getRelativeVector(0, 1, 0)
                .multiplyScalar(2 * (c.KeyA - c.KeyD));;
        this.body.angularVelocity.lerp(torque, 0.4, this.body.angularVelocity);


        // player motion
        // const newVel = new THREE.Vector3();
        // newVel.copy(this.body.velocity);
        // newVel.add(this.getForward().multiplyScalar((c.KeyW - c.KeyS)))
        // .multiplyScalar(1 - player.redirectAmount)
        // .add(
        //     this.getForward()
        //     .multiplyScalar(player.redirectAmount * player.body.velocity.length())
        // );
        // this.body.velocity.copy(newVel);
        this.body.applyForce(this.getForward().multiplyScalar(30* (c.KeyW - c.KeyS)));
        this.body.applyForce(this.body.velocity.scale(-0.5));// drag
        const parallelVel = this.body.velocity.dot(this.getForward());
        const perpendicularVel = this.body.velocity.dot(this.getSideward());
    }
}
