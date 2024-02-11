const c = {
    KeyW:false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false
};
// https://www.toptal.com/developers/keycode
function handleKeyDown(event) {
    c[event.code] = true;
}

function handleKeyUp(event) {
    c[event.code] = false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

export { c };
