import * as THREE from 'three';
import * as utils from './utils.js';

const tempVec = new THREE.Vector3();
// https://medium.com/@sarahisdevs/creating-a-3d-particle-system-in-three-js-a4107d459ce6
export class Particles {
    #geometry;
    #material;
    #particles;
    #ages;
    #lifetimes;
    #count

    constructor(count, size, color) {
        this.#geometry = new THREE.BufferGeometry();
        this.#material = new THREE.PointsMaterial({ size: size});
        this.#material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                size: {value: 10},
                scale: {value: 1},
                color: {value: new THREE.Color(0xeeeeee)}
            },
            vertexShader: THREE.ShaderLib.points.vertexShader,
            fragmentShader: `
            uniform vec3 color;
            void main() {
                vec2 xy = gl_PointCoord.xy - vec2(0.5);
                float ll = length(xy);
                gl_FragColor = vec4(color, step(ll, 0.5));
            }
            `
        });
        this.#particles = new THREE.Points(this.#geometry, this.#material);

        const positions = [];
        const colors = [];
        this.#count = count;
        this.#ages = [];
        this.#lifetimes = [];

        for (let i = 0; i < count; i++) {
            positions.push(0, 0, 0);
            this.#lifetimes.push( 0.5 - ( 0.3* Math.random() ) );
            this.#ages.push(Math.random() * this.#lifetimes[i]);
        }

        this.#geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    }

    addToScene(scene) {
        scene.add(this.#particles);
    }

    show(startPos, direction, speed) {
        const dv = direction.normalize().multiplyScalar(speed);
        const dt = 1/60;
        const positions = this.#geometry.getAttribute('position').array;
        for (let i = 0; i < positions.length; i += 3) {
            const j = Math.floor(i / 3);
            if (this.#ages[j] > this.#lifetimes[j]) {
                positions[i] = startPos.x;
                positions[i + 1] = startPos.y;
                positions[i + 2] = startPos.z;
                this.#ages[j] = 0;
            }

            const noiseBasis = utils.getPerpendicularBasis(dv);
            const random1 = (Math.random() - 0.5) * 10;
            const random2 = (Math.random() - 0.5) * 10;
            const noise = noiseBasis[0].multiplyScalar(random1).add(noiseBasis[1].multiplyScalar(random2));
            positions[i] += (dv.x + 0.1*noise.x) * dt;
            positions[i + 1] += (dv.y + 0.1*noise.y) * dt;
            positions[i + 2] += (dv.z + 0.1*noise.z) * dt;
            this.#ages[j] += dt;
        }
        this.#geometry.getAttribute('position').needsUpdate = true;
        this.#geometry.verticesNeedUpdate = true;
        this.#geometry.computeBoundingSphere();
    }

    hide(direction, speed) {
    this.show(tempVec.set(0, -100, 0).clone(), direction, speed);
    }


}

