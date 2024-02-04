import * as THREE from 'three';
export const c = {
    // Controls
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,

    init: function() {
        document.addEventListener('keydown', c.keyDown);
        document.addEventListener('keyup', c.keyUp);
    },

    keyDown: function(event) {
        //(event.key);
        switch(event.key) {
            case 'w':
                c.w = true;
                break;
            case 'a':
                c.a = true;
                break;
            case 's':
                c.s = true;
                break;
            case 'd':
                c.d = true;
                break;
            case ' ':
                c.space = true;
                break;
            case 'Shift':
                c.shift = true;
                break;
        }
     },

    keyUp: function(event) {
        switch(event.key) {
            case 'w':
                c.w = false;
                break;
            case 'a':
                c.a = false;
                break;
            case 's':
                c.s = false;
                break;
            case 'd':
                c.d = false;
                break;
            case ' ':
                c.space = false;
                break;
            case 'Shift':
                c.shift = false;
                break;
        }
    },

    debug: function() {
        console.log(c.w, c.a, c.s, c.d, c.space, c.shift);
    },

    vector: function() {
        return new THREE.Vector3(c.d - c.a, c.space - c.shift, c.w - c.s);
    }
}

export default c;