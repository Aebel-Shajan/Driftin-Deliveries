import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class GameObject {
    constructor(mesh, bodyParams) {
        let boundingBox = new THREE.Box3().setFromObject(mesh);
        let centrePos = boundingBox.getCenter(new THREE.Vector3());
        this.originalSize = boundingBox.getSize(new THREE.Vector3());
        this.mesh = new THREE.Object3D();
        this.mesh.add(mesh);
        this.body = new CANNON.Body({
            shape: new CANNON.Box(this.originalSize.clone().multiplyScalar(0.5)),
            ...bodyParams
        })
        this.scale = new THREE.Vector3(1, 1, 1);
        this.size = new THREE.Vector3().copy(this.originalSize);
        mesh.position.copy(centrePos).multiplyScalar(-1);
    }

    addObjectTo(scene, world) {
        scene.add(this.mesh);
        world.addBody(this.body);
    }

    getVelocity() {
        return this.body.velocity;
    }

    setVelocity(velocity) {
        if (this.body.type = CANNON.Body.STATIC) {
            throw new Error( 'Attempting to set velocity of static body' );
        }
        this.body.velocity.copy(velocity);
    }

    getPosition() {
        return this.body.position;
    }

    setPosition(position) {
        this.body.position.copy(position);
    }
    
    setBottomPosition(position) {
        position.y += 0.5 * this.get
    }

    getQuaternion() {
        return this.body.quaternion;
    }

    setQuaternion(quaternion) {
        this.body.quaternion.copy(quaternion);
    }

    getSize() {
        var bbox = new THREE.Box3().setFromObject(this.mesh);
        return bbox.getSize(this.size);
    }

    setSize(size) {
        this.setScale(new THREE.Vector3(
        size.x / this.originalSize.x,
        size.y / this.originalSize.y,
        size.z / this.originalSize.z));
    }

    getScale() {
        return this.scale;
    }

    setScale(scale) {
        this.scale.copy(scale);
        this.mesh.scale.copy(scale);
        this.body.removeShape(this.body.shapes[0]);
        this.body.addShape(new CANNON.Box(this.getSize().multiplyScalar(0.5)));
        this.body.updateBoundingRadius();
        this.body.updateAABB();
    }

    updateMesh() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
    
    rotateAroundAxis(axis, angle) {
        const newQuaternion = this.getQuaternion().mult(new CANNON.Quaternion().setFromAxisAngle(axis, angle));
        this.setQuaternion(newQuaternion);
    }

    isCollidingWith(gameObject) {
        this.body.updateAABB();
        gameObject.body.updateAABB();
        return this.body.aabb.overlaps(gameObject.body.aabb);
    }
}

export { GameObject };