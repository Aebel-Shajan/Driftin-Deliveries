import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as UTILS from './utils.js';

const loader = new GLTFLoader();
const playerModel = await loader.loadAsync('assets/models/sedan.glb');
const playerMesh = playerModel.scene;
const correctedMesh = new THREE.Object3D();
correctedMesh.add(playerMesh);
playerMesh.rotateY(Math.PI);

export let player = UTILS.createObjectFromMesh(correctedMesh);
player = {
    ...player,
    redirectAmount: 0.1,
    forceDebug: new THREE.ArrowHelper(),
    init: function () {
        // replace default static body with dynamic
        this.body = new CANNON.Body({
            shape: new CANNON.Box(this.originalSize.clone().multiplyScalar(0.5)),
            mass: 1,
            position: new CANNON.Vec3(0, 1, 2),
            material: new CANNON.Material({
                friction: 0
            })
        });
        this.forceDebug = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 10, 10),
            3,
            0xffff00
        );
    },
    getVelocity: function () {
        return new THREE.Vector3().copy(this.body.velocity);
    },
    getPosition: function () {
        return new THREE.Vector3().copy(this.body.position);
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

        // angular velocity control
        const torque =
            this.getRelativeVector(0, 1, 0)
                .multiplyScalar(1.5 * (c.KeyA - c.KeyD));
        this.body.angularDamping = c.ShiftLeft ? 0.6 : 0.8;
        this.body.angularVelocity.lerp(torque, 0.1, this.body.angularVelocity);

        // linear velocity control
        const controlForce = this.getForward().multiplyScalar(15 * (c.KeyW - c.KeyS));
        const dragForce = this.body.velocity.scale(-0.1);
        const perpendicularVel = this.body.velocity.dot(this.getSideward());
        const redirectAmount = c.ShiftLeft ? 0.6 : 4;
        const centripetalForce = this.getSideward().multiplyScalar(-1 * redirectAmount * perpendicularVel);
        this.body.applyForce(controlForce);
        this.body.applyForce(dragForce);// drag
        this.body.applyForce(centripetalForce);

        // force debug
        this.forceDebug.position.copy(this.body.position.vadd(new CANNON.Vec3(0, 2, 0)));
        this.forceDebug.setDirection(this.body.velocity);
        this.forceDebug.setLength(3);
    }
}

