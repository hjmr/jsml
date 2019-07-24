const L = 3;
const LAYERS = [2, 3, 3, 1];

const ALPHA = 0.05; // 学習係数
const TAU = 1.0;    // 活性化関数のパラメータ
const LOOP = 10000;  // 学習回数

let w, dw, u, h, th, dth, d;

function initArrays() {
    w = new Array(L+1);
    dw = new Array(L+1);
    for( let l = 1 ; l <= L ; l++ ) {
        w[l]  = new Array(LAYERS[l-1]);
        dw[l] = new Array(LAYERS[l-1]);
        for( let i = 0 ; i < w[l].length ; i++ ) {
            w[l][i]  = new Array(LAYERS[l])
            dw[l][i] = new Array(LAYERS[l])
        }
    }

    h   = new Array(L+1);
    u   = new Array(L+1);
    th  = new Array(L+1);
    dth = new Array(L+1);
    d   = new Array(L+1);
    h[0] = new Array(LAYERS[0]);
    for( let l = 1 ; l <= L ; l++ ) {
        h[l]   = new Array(LAYERS[l]);
        u[l]   = new Array(LAYERS[l]);
        th[l]  = new Array(LAYERS[l]);
        dth[l] = new Array(LAYERS[l]);
        d[l]   = new Array(LAYERS[l]);
    }
}

function initParameters() {
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < w[l].length ; i++ ) {
            for( let j = 0 ; j < w[l][i].length ; j++ ) {
                w[l][i][j]  = Math.random() * 2 - 1;
                dw[l][i][j] = 0.0;
            }
        }
    }
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < u[l].length ; i++ ) {
            u[l][i]   = 0.0;
            h[l][i]   = 0.0;
            th[l][i]  = Math.random() * 2 - 1;
            dth[l][i] = 0.0;
            d[l][i]   = 0.0;
        }
    }
}

function calcForward(x) {
    for( let i = 0 ; i < h[0].length ; i++ ) {
        h[0][i] = x[i];
    }
    for( let l = 1 ; l <= L ; l++ ) {
        for( let j = 0 ; j < u[l].length ; j++ ) {
            u[l][j] = 0;
            for( let i = 0 ; i < h[l-1].length ; i++ ) {
                u[l][j] += w[l][i][j] * h[l-1][i];
            }
            u[l][j] -= th[l][j];
            h[l][j] = (l < L) ? f_hidden(u[l][j]) : f_output(u[l][j]);
        }
    }
    let y = new Array(LAYERS[L]);
    for( let i = 0 ; i < y.length ; i++ ) {
        y[i] = h[L][i];
    }
    return y;
}

function calcDelta(y, t) {
    for( let l = L ; l >= 1 ; l-- ) {
        for( let i = 0 ; i < d[l].length ; i++ ) {
            if( l == L ) {
                d[l][i] = (y[i] - t[i]) * df_output(u[l][i]);
            } else {
                d[l][i] = 0;
                for( let j = 0 ; j < d[l+1].length ; j++ ) {
                    d[l][i] += d[l+1][j] * w[l+1][i][j];
                }
                d[l][i] *= df_hidden(u[l][i]);
            }
        }
    }
}

function clearWeightUpdate() {
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < dw[l].length ; i++ ) {
            for( let j = 0 ; j < dw[l][i].length ; j++ ) {
                dw[l][i][j] = 0.0;
            }
        }
    }
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < dth[l].length ; i++ ) {
            dth[l][i] = 0.0;
        }
    }
}

function calcWeightUpdate() {
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < dw[l].length ; i++ ) {
            for( let j = 0 ; j < dw[l][i].length ; j++ ) {
                dw[l][i][j] += d[l][j] * h[l-1][i];
            }
        }
    }
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < dth[l].length ; i++ ) {
            dth[l][i] += d[l][i] * -1;
        }
    }
}

function updateWeight() {
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < dw[l].length ; i++ ) {
            for( let j = 0 ; j < dw[l][i].length ; j++ ) {
                w[l][i][j] += -ALPHA * dw[l][i][j];
            }
        }
    }
    for( let l = 1 ; l <= L ; l++ ) {
        for( let i = 0 ; i < dth[l].length ; i++ ) {
            th[l][i] += -ALPHA * dth[l][i]
        }
    }
}

function f_hidden(x) {
    return 1.0 / (1.0 + Math.exp(-TAU * x));
}

function df_hidden(x) {
    return TAU * f_hidden(x) * (1.0 - f_hidden(x));
}

function f_output(x) {
    return x;
}

function df_output(x) {
    return 1;
}

function target(x) {
    let y = new Array(1);
    y[0] = 0.0;
    if( x[0] > 0.9 && x[1] < 0.1 ) {
        y[0] = 1.0;
    } else if( x[0] < 0.1 && x[1] > 0.9 ) {
        y[0] = 1.0;
    }
    return y;
}

function train(inp) {
    initArrays();
    initParameters();

    for( let loop = 0 ; loop < LOOP ; loop++ ) {
        clearWeightUpdate();
        let E = 0;
        for( x of inp ) {
            let y = calcForward(x);
            let y_hat = target(x);
            let e = 0;
            for( let i = 0 ; i < LAYERS[L] ; i++ ) {
                e += 1/2 * (y[i] - y_hat[i]) * (y[i] - y_hat[i]);
            }
            calcDelta(y, y_hat);
            calcWeightUpdate();
            E += e;
        }
        updateWeight();
        if( loop % 100 == 0 ) {
            console.log("[" + loop + "]" + " E = " + E);
        }
    }
}

function validate(inp) {
    for( x of inp ) {
        let y = calcForward(x);
        let y_hat = target(x);
        console.log("y = " + y[0].toFixed(3) + "\ty_hat = " + y_hat);
    }
}

const INPUT = [[0,0], [1,0], [0,1], [1,1]];
train(INPUT);
console.log("------------------------------------");
validate(INPUT);

