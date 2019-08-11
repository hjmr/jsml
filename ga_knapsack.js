let POP_SIZE = 100;
let CHROM_LEN = 10;
let MAX_GENERATION = 100;

let CX_RATE = 0.6;
let MUT_RATE = 0.08;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

let weight_limit = 10;
let item_weight = [2, 1, 3, 2, 1, 5, 3, 6, 1, 2];
let item_values = [3, 2, 6, 1, 9, 8, 5, 6, 6, 2];

function evaluate(chrom) {
    let dec = decode(chrom);
    return dec[1]; // value
}

function decode(chrom) {
    let w = 0, v = 0;
    for( let i = 0 ; i < CHROM_LEN ; i++ ) {
        w += item_weight[i] * chrom[i];
        v += item_values[i] * chrom[i];
    }
    // penalty
    if( weight_limit < w ) {
        v = 1;
    }
    return [w, v];
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

function generateLogMsg(chrom) {
    let s = "";
    for( let i = 0 ; i < CHROM_LEN ; i++ ) {
        s += chrom[i];
    }
    s += "";
    let d = decode(chrom);
    return s + ",w=" + d[0] + ",v=" + d[1];
}

function showLog(pop, fit) {
    let elitest_idx = getMaxFitnessIndex(pop, fit);
    let elitest = pop[elitest_idx];
    console.log("[" + g + "] " + generateLogMsg(elitest));
}

let pop = generatePop(POP_SIZE, CHROM_LEN);
for(let g = 0 ; g < MAX_GENERATION ; g++ ) {
    let fit = evaluatePop(pop);
    showLog(pop, fit);
    pop = generation(pop, fit);
}
