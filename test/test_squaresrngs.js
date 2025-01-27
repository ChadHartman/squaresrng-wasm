const fs = require("fs");
const exec = require("child_process").execSync;

function getExpected(counter, key) {
    let result = exec(`./bin/squaresrng ${counter} ${key}`);
    return parseInt(result.toString("utf8"));
}

function getExpectedS(counter, key, range) {
    let result = exec(`./bin/squaresrngs ${counter} ${key} ${range}`);
    return parseInt(result.toString("utf8"));
}

async function getWasm() {
    let binary = new Uint8Array(fs.readFileSync("wasm/squaresrngs.wasm"));

    return await WebAssembly.instantiate(binary)
        .then(res => res.instance.exports);
}

function testRand(wasm, ctr, key) {
    wasm.setCtr(ctr);
    wasm.setKey(key);
    let expected = getExpected(ctr, key);
    // Convert to uint
    let actual = wasm.rand() >>> 0;
    if (expected !== actual) {
        let msg = `!!! Divergent counter=${ctr}; expected=${expected}; actual=${actual} !!!`
        console.log(msg);
        throw Error(msg);
    }
}

function testRandF(wasm, ctr, key) {
    wasm.setCtr(ctr);
    wasm.setKey(key);
    let expected = (getExpected(ctr, key) / 0xffffffff);
    let actual = wasm.randF(ctr, key);
    if (expected !== actual) {
        let msg = `!!! Divergent counter=${ctr}; expected=${expected}; actual=${actual} !!!`
        console.log(msg);
        throw Error(msg);
    }
}

function testRandBound(wasm, ctr, key) {
    wasm.setCtr(ctr);
    wasm.setKey(key);
    let min = 5;
    let max = parseInt(ctr) + 10;
    // 1 Added to be range inclusive
    let range = (max + 1) - min;
    let expected = min + (getExpected(ctr, key) % range);
    let actual = wasm.randBound(min, max);
    if (expected !== actual) {
        console.log(`!!! Divergent counter=${ctr}; expected=${expected}; actual=${actual} !!!`);
        return;
    }
}

function testRandBoundLemire(wasm, ctr, key) {
    wasm.setCtr(ctr);
    wasm.setKey(key);
    let min = 5;
    let max = parseInt(ctr) + 10;
    let range = max - min + 1;
    // 1 Added to be range inclusive
    let expected = min + getExpectedS(ctr, key, range);
    let actual = wasm.randBoundLemire(min, max) >>> 0;
    if (expected !== actual) {
        let msg = `!!! Divergent counter=${ctr}; expected=${expected}; actual=${actual} !!!`
        console.log(msg);
        throw Error(msg);
    }
}

(async () => {

    const iterations = 100;
    // Subset of ref/keys.h
    const keys = [
        BigInt("0xc58efd154ce32f6d"),
        BigInt("0xfcbd65e54bf53ed9"),
        BigInt("0xea3742c76bf95d47"),
        BigInt("0xfb9e125878fa6cb3"),
        BigInt("0x1ebd294ba7fe8b31"),
        BigInt("0xf29ba87dc5f1a98d"),
        BigInt("0x815a7e4ed4e3b7f9"),
        BigInt("0x63acbfe213f5d867"),
        BigInt("0x67e2d1b542f9e6d3"),
        BigInt("0x682ec13872ecf651")
    ];

    console.log(`Begin testing ${keys.length} keys...`);
    let wasm = await getWasm();
    if (wasm.version() !== 1) {
        throw Error(`Expected version 1; got ${wasm.version()}`);
    }

    for (let key of keys) {

        for (let ctr = BigInt(0); ctr < iterations; ++ctr) {
            testRand(wasm, ctr, key);
            testRandF(wasm, ctr, key);
            testRandBound(wasm, ctr, key);
            testRandBoundLemire(wasm, ctr, key);
        }

        console.log(`  Pass ${iterations} iterations with 0x${key.toString(16)}...`);
    }
    console.log(`...pass!`);
})();
