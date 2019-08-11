let POP_SIZE = 1000;
let CHROM_LEN = 20;
let MAX_GENERATION = 1000;

let CX_RATE = 0.6;
let MUT_RATE = 0.01;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function evaluate(a) {
    let x = decode(a,  0, 10);
    let y = decode(a, 10, 10);
    return eqn(x, y);
}

function eqn(x, y) {
    let R = 5.0;
    let f1 = (x * x) + (y * y) - (R * R);
    let f2 = Math.exp(-(f1 * f1));
    return f2;
}

function decode(chrom, st, len) {
    let min_v = -10.0, max_v = 10.0;
    let v = 0;
    let max = 0;
    for( let i = 0 ; i < len ; i++ ) {
        v = v * 2 + chrom[st + i];
        max = max * 2 + 1;
    }
    v /= max;
    return ((max_v - min_v) * v + min_v);
}

function doCrossover(a, b) { // two-point crossover
    let st = getRandomInt(a.length);
    let len = getRandomInt(a.length-st);
    for( let i = 0 ; i < len ; i++ ) {
        let tmp = a[st + i];
        a[st + i] = b[st + i];
        b[st + i] = tmp;
    }
}

function doMutation(a) {
    for( let i = 0 ; i < a.length ; i++ ) {
        if( Math.random() < MUT_RATE ) {
            a[i] = 1 - a[i];
        }
    }
}

function generateIndividual(chromLen) {
    let ind = new Array(chromLen);
    for( let i = 0 ; i < ind.length ; i++ ) {
        ind[i] = getRandomInt(2);
    }
    return ind;
}

function generatePop(popSize, chromLen) {
    let pop = new Array(popSize);
    for( let i = 0 ; i < pop.length ; i++ ) {
        pop[i] = generateIndividual(chromLen);
    }
    return pop;
}

function evaluatePop(pop) {
    let fit = new Array(pop.length);
    for( let i = 0 ; i < fit.length ; i++ ) {
        fit[i] = evaluate(pop[i]);
    }
    return fit;
}

function crossoverPop(pop) {
    let num = Math.floor(pop.length * CX_RATE);
    let cnt = 0;
    while( cnt < num ) {
        let i = getRandomInt(pop.length);
        let j = getRandomInt(pop.length - 1);
        if( i <= j ) j++;
        doCrossover(pop[i], pop[j]);
        cnt += 2;
    }
}

function mutatePop(pop) {
    for( let i = 0 ; i < pop.length ; i++ ) {
        doMutation(pop[i]);
    }
}

function calcSumFit(fit) {
    let sum = 0;
    for( let i = 0 ; i < fit.length ; i++ ) {
        sum += fit[i];
    }
    return sum;
}

function selectRoulette(fit, sumFit) {
    let sel_idx = 0;
    let r = Math.random() * sumFit;
    for( let i = 0 ; i < fit.length ; i++ ) {
        if( r < fit[i] ) {
            sel_idx = i
            break;
        }
        r -= fit[i];
    }
    return sel_idx;
}

function selectPop(pop, fit) {
    let newPop = new Array(pop.length);
    let sumFit = calcSumFit(fit);
    for( let i = 0 ; i < pop.length ; i++ ) {
        newPop[i] = pop[selectRoulette(fit, sumFit)];
    }
    return newPop;
}

function getMaxFitnessIndex(pop, fit) {
    let max_idx = 0;
    for( let i = 1 ; i < fit.length ; i++ ) {
        if( fit[max_idx] < fit[i] ) {
            max_idx = i;
        }
    }
    return max_idx;
}

function generation(pop, fit) {
    let max_idx = getMaxFitnessIndex(pop, fit);
    let elitest = Array.from(pop[max_idx]);
    newPop = selectPop(pop, fit);
    crossoverPop(newPop);
    mutatePop(newPop);
    newPop[0] = elitest;
    return newPop;
}

function showLog(pop, fit) {
    let elitest_idx = getMaxFitnessIndex(pop, fit);
    let elitest = pop[elitest_idx];
    let x = decode(elitest,  0, 10);
    let y = decode(elitest, 10, 10);
    console.log("x = " + x + ",y = " + y + " / fitness = " + fit[elitest_idx]);
}

let pop = generatePop(POP_SIZE, CHROM_LEN);
for(let g = 0 ; g < MAX_GENERATION ; g++ ) {
    let fit = evaluatePop(pop);
    showLog(pop, fit);
    pop = generation(pop, fit);
}
