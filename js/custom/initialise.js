// only one namespace "ws" for our code
if ('ws' in window) {
    console.log('Namespace "ws" already exists');
}
else {
    window.ws = {};
}
// end only one namespace "ws" for our code
