import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function getRandomBuilding() {
    const randomLetter = 'ABCDEF'.charAt(Math.floor(Math.random() * 6));
    const buildingType = ["large_building", "skyscraper"][Math.floor(Math.random()* 2)];
    const randomBuilding = "assets/models/buildings/" + buildingType + randomLetter + ".glb";
    return randomBuilding;
}

export function createObjectFromMesh(mesh) {
    var mroot = mesh;
    var bbox = new THREE.Box3().setFromObject(mroot);
    var cent = bbox.getCenter(new THREE.Vector3());
    var size = bbox.getSize(new THREE.Vector3());

    //Rescale the object to normalized space
    var maxAxis = Math.max(size.x, size.y, size.z);
    mroot.scale.multiplyScalar(1.0 / maxAxis);
    bbox.setFromObject(mroot);
    bbox.getCenter(cent);
    bbox.getSize(size);

    const centredMesh = new THREE.Object3D();
    centredMesh.add(mroot);
    centredMesh.position.set(0,0,0);
    //Reposition to 0,halfY,0
     mroot.position.copy(cent).multiplyScalar(-1);
    // mroot.position.y-= (size.y * 0.5);

    const object = {
        mesh: centredMesh,
        body: new CANNON.Body({
            shape: new CANNON.Box(size.multiplyScalar(0.5)),
            type: CANNON.Body.STATIC,
            material: new CANNON.Material({
                friction: 0.5
            })
        }),
        update: function() {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        },
        getSize: function() {
            var bbox = new THREE.Box3().setFromObject(this.mesh);
            return bbox.getSize(new THREE.Vector3());
        },
        setSize: function(size) {
            this.mesh.scale.x = size.x / this.getSize().x;
            this.mesh.scale.y = size.y / this.getSize().y;
            this.mesh.scale.z = size.z / this.getSize().z;
            
            
            const shape = this.body.removeShape(this.body.shapes[0]);
            this.body.addShape(new CANNON.Box(size.multiplyScalar(0.5)),)
            this.body.updateBoundingRadius();
            this.body.updateAABB();
        }
    }

    return object;
}