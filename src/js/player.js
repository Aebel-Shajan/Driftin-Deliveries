import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as UTILS from './utils.js';
const vector = new THREE.Vector3();
const loader = new GLTFLoader();
const playerModel = await loader.loadAsync('assets/models/sedan.glb');
const playerMesh = playerModel.scene;
const correctedMesh = new THREE.Object3D();
correctedMesh.add(playerMesh);
playerMesh.rotateY(Math.PI);

const playerStatic = UTILS.createObjectFromMesh(correctedMesh);
export const player = {
    ...playerStatic,
    redirectAmount: 0.1,
    forceDebug: new THREE.ArrowHelper(),
    position: new THREE.Vector3(), // i wanna make these private 😭
    velocity: new THREE.Vector3(),
    forward: new THREE.Vector3(),
    sideward: new THREE.Vector3(),
    upward: new THREE.Vector3(),
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
        const output = this.velocity.copy(this.body.velocity);
        return output;
    },
    getPosition: function () {
        const output = this.position.copy(this.body.position);
        return output;
    },
    getRelativeVector: function (x, y, z) {
        const vec = new THREE.Vector3(x, y, z);
        vec.applyQuaternion(this.body.quaternion);
        return vec
    },
    getForward: function () {
        return this.forward.set(0, 0, 1).applyQuaternion(this.body.quaternion);
    },
    getSideward: function () {
        return this.sideward.set(1, 0, 0).applyQuaternion(this.body.quaternion);
    },
    getUpward: function () {
        return this.upward.set(0, 1, 0).applyQuaternion(this.body.quaternion);
    },
    controlPlayer: function (c, dt) {
        this.update();

        // angular velocity control
        const torque =
            this.getUpward()
                .multiplyScalar(1.5 * (c.KeyA - c.KeyD));
        this.body.angularDamping = c.ShiftLeft ? 0.6 : 0.8;
        this.body.angularVelocity.lerp(torque, 0.1, this.body.angularVelocity);

        // linear velocity control
        const controlForce = this.getForward().multiplyScalar(15 * (c.KeyW - c.KeyS));
        this.body.applyForce(controlForce);
        const dragForce = this.getVelocity().multiplyScalar(-0.1);
        this.body.applyForce(dragForce);// drag
        const perpendicularVel = this.getVelocity().dot(this.getSideward());
        const redirectAmount = c.ShiftLeft ? 0.6 : 4;
        const centripetalForce = this.getSideward().multiplyScalar(-1 * redirectAmount * perpendicularVel);
        this.body.applyForce(centripetalForce);

        // force debug
        this.forceDebug.position.copy(this.getPosition().add(vector.set(0, 2, 0)));
        this.forceDebug.setDirection(this.getVelocity());
        this.forceDebug.setLength(3);
    }
}

