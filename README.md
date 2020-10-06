# SquaresRNG Pseudo-Random Number Generator port to Web Assembly

Due to the absence of seedable PRNGs in EcmaScript; these web assembly modules were written. These modules are a transliteration of Bernard Widynski's "SquaresRNG" algorithm (originally written in c), in addition to Daniel Lemire's "Debiased Integer Multiplication" algorithm (used to debias bounded integers).

## Keys and Counters

A `key` is a 64-bit unsigned integer used to "seed" the algorithm to produce sufficient randomness. A list of desirable keys was generated by Widynski; and is located at `ref/squaresrng/keys.h`.

A `counter` is also a 64-bit unsigned integer and is like an index that represents the "state" of the prng. Thus, there are two flavors of the algorithm written: _stateless_ and _stateful_.

## `wasm/squaresrng.wasm`

This is the _stateless_ version; both `counter` and `key` must be passed to it per API use.

### API

* `rand(ctr:BigInt, key:BigInt):number`
    * Returns an integer `0` : `4294967295` (`0xffffffff`)
    * The result will need to be `>>> 0` in order to guarantee positivity
* `randF(ctr:BigInt, key:BigInt):number`
    * Returns a float `0` : `1`
* `randBound(ctr:BigInt, key:BigInt, min:number, max:number): number`
    * Returns a biased number in the inclusively provided range
    * Bias is introduced by performing a modulus operation on the random result
    * For more information see [M.E. O'Neill's _Efficiently Generating a Number in a Range_](https://www.pcg-random.org/posts/bounded-rands.html)

## `wasm/squaresrngs.wasm`

This is the _stateful_ version; the module possesses `ctr` and `key` global params.

### API

* `ctr():BigInt`
    * Get the current counter value
* `key():BigInt`
    * Get the current key value
* `setCtr(v:BigInt)`
    * Update the counter value
* `setKey(v:BigInt)`
    * Update the key value
* `rand():number`
    * Returns an integer `0` : `4294967295`
    * The result will need to be `>>> 0` in order to guarantee positivity
    * The global `ctr` will be incremented
* `randF():number`
    * Returns a float `0` : `1`
    * The global `ctr` will be incremented
* `randBound(min:number, max:number): number`
    * Returns a biased number in the inclusively provided range
    * Bias is introduced by performing a modulus operation on the random result
    * For more information see [M.E. O'Neill's _Efficiently Generating a Number in a Range_](https://www.pcg-random.org/posts/bounded-rands.html)
    * The global `ctr` will be incremented
* `randBoundLemire(min:number, max:number): number`
    * Returns a debiased number in the inclusively provided range
    * As a part of Lemire's debiasing algorithm; `ctr` may be incremented several times

## Use

The Wasm module can be used in both a node and web context. For a node example; `test/test_squaresrng.js` and `test/test_squaresrngs.js` are available. An example of web usage can be seen [on the playground](https://chadhartman.github.io/squaresrng-wasm/playground):

```js
// Stateful variety
(async ()=>{

let instance = await fetch("wasm/squaresrngs.wasm")
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.instantiate(buffer))
    .then(wasm => wasm.instance.exports);

instance.setKey(BigInt(0xfc819a732d6c7841));

console.log(instance.rand()); // 150042733
console.log(instance.randF()); // 0.3348700386320404
console.log(instance.randBound(1, 52)); // 47
console.log(instance.randBoundLemire(1, 52)); //30
console.log(instance.ctr()); // 4
})();
```

## Testing

Testing assumes the following binaries are installed on the machine:

* npm
* g++
* wat2wasm

There are 2 binaries that will have to be built first with a `npm run build_bin`. These binaries are built using Widynski and Lemire's c implementations and used to validate the web assembly modules. After this an `npm run test_squaresrng` or `npm run test_squaresrngs` can be run. The tests compare the wasm's output to the c binaries.
