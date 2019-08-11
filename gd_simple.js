let a = [-4.0, 3.5, 1.3];
let w = [0.1, 0.1, 0.1]; // initial values
let alpha = 0.001;

function target(x) {
    let y = a[0] * x * x + a[1] * x + a[2];
    return y;
}

function d_target(x) {
    return [x * x, x, 1]; // a[0],a[1],a[2]
}

function estimated(x) {
    let y = w[0] * x * x + w[1] * x + w[2];
    return y;
}

function err(x) {
    let y = estimated(x);
    let y_hat = target(x);
    let e = 1/2 * (y - y_hat) * (y - y_hat);
    return e;
}

function delta_w(x) {
    let y = estimated(x);
    let y_hat = target(x);
    let dydw = d_target(x);
    let d = (y - y_hat);
    return [d * dydw[0], d * dydw[1], d * dydw[2]];
}

for( let i = 0 ; i < 10000 ; i++ ) {
    let E = 0;
    let dw = [0, 0, 0];
    for( let x = -5 ; x < 5 ; x++) {
        let delta = delta_w(x);
        for(let i in dw) {
            dw[i] += delta[i];
        }
        E += err(x);
    }
    for(let i in dw) {
        w[i] -= alpha * dw[i];
    }
}

console.log("ground truth:" + a);
console.log("   estimated:" + w);

