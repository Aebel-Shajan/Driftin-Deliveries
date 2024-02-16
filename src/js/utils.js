import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function getRandomBuilding() {
    const randomLetter = 'ABCDEF'.charAt(Math.floor(Math.random() * 6));
    const buildingType = ["large_building", "skyscraper"][Math.floor(Math.random()* 2)];
    const randomBuilding = "assets/models/buildings/" + buildingType + randomLetter + ".glb";
    return randomBuilding;
}

export function createObjectFromMesh(mesh) {
    // should really be class, should really use typescript but i cba !!!!!!!
    var mroot = mesh;
    var bbox = new THREE.Box3().setFromObject(mroot);
    var cent = bbox.getCenter(new THREE.Vector3());
    var originalSize = bbox.getSize(new THREE.Vector3());

    const centredMesh = new THREE.Object3D();
    centredMesh.add(mroot);
    centredMesh.position.set(0,0,0);
    //Reposition to 0,halfY,0
    mroot.position.copy(cent).multiplyScalar(-1);

    const object = {
        mesh: centredMesh,
        body: new CANNON.Body({
            shape: new CANNON.Box(originalSize.clone().multiplyScalar(0.5)),
            type: CANNON.Body.STATIC,
            material: new CANNON.Material({
                friction: 0.5
            })
        }),
        originalSize: originalSize,
        update: function() {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        },
        getSize: function() {
            var bbox = new THREE.Box3().setFromObject(this.mesh);
            return bbox.getSize(new THREE.Vector3());
        },
        setSize: function(size) {
            this.mesh.scale.x = size.x / this.originalSize.x;
            this.mesh.scale.y = size.y / this.originalSize.y;
            this.mesh.scale.z = size.z / this.originalSize.z;
            
            const shape = this.body.removeShape(this.body.shapes[0]);
            this.body.addShape(new CANNON.Box(size.multiplyScalar(0.5)),)
            this.body.updateBoundingRadius();
            this.body.updateAABB();
            this.update();
        },
        setPosition: function(pos) {
            this.body.position.copy(pos);
            this.update();
        },
        setBottomPosition: function(pos) {
            pos.y += 0.5 * this.getSize().y;
            this.setPosition(pos);
        },
        getPosition: function() {
            return this.body.position;
        },
        rotateAroundAxis: function(axis, angle) {
            this.body.quaternion.setFromAxisAngle(axis, angle);
            this.update();
        },
        addObjectTo: function(scene,  world) {
            scene.add(this.mesh);
            world.addBody(this.body);
        }
    }
    return object;
}