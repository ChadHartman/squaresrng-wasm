"use strict";
(async (app) => {

    const IMPL_STATELESS = "stateless";

    // Choose a sheet of 1,000 keys
    //   There are 25 sheets (index 0:24) (25,000 total keys available)
    let keySubsetIndex = Math.round(Math.random() * 24);
    let keys = await fetch(`assets/json/keys.${keySubsetIndex}.json`)
        .then(response => response.json());

    let prngStateless = await fetch("assets/wasm/squaresrng.wasm")
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.instantiate(buffer))
        .then(wasm => wasm.instance.exports);

    let prngStateful = await fetch("assets/wasm/squaresrngs.wasm")
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.instantiate(buffer, {
            "state": {
                key: new WebAssembly.Global({ value: "i64", mutable: true }, BigInt(0)),
                ctr: new WebAssembly.Global({ value: "i64", mutable: true }, BigInt(0))
            }
        }))
        .then(wasm => wasm.instance.exports);

    app.vue = new Vue({
        el: '#vueapp',
        data: {
            implementation: IMPL_STATELESS,
            keys: keys,
            key: "",
            ctr_init: 0,
            min: 0,
            max: 10
        },
        methods: {
            rand() {
                let ctr = BigInt(this.ctr_init);
                let key = BigInt(this.key);
                prngStateful.setCtr(ctr);
                prngStateful.setKey(key);

                return this.implementation === IMPL_STATELESS ?
                    prngStateless.rand(ctr, key) >>> 0 :
                    prngStateful.rand() >>> 0;
            },
            randF() {
                let ctr = BigInt(this.ctr_init);
                let key = BigInt(this.key);
                prngStateful.setCtr(ctr);
                prngStateful.setKey(key);

                return this.implementation === IMPL_STATELESS ?
                    prngStateless.randF(ctr, key) :
                    prngStateful.randF();
            },
            randBound() {
                let ctr = BigInt(this.ctr_init);
                let key = BigInt(this.key);
                prngStateful.setCtr(ctr);
                prngStateful.setKey(key);

                if (this.max - this.min < 0) {
                    return "Invalid range; max must be >= min";
                }

                return this.implementation === IMPL_STATELESS ?
                    prngStateless.randBound(ctr, key, this.min, this.max) :
                    prngStateful.randBound(this.min, this.max);
            },
            randBoundLemire() {
                // No stateless implementation available
                prngStateful.setCtr(BigInt(this.ctr_init));
                prngStateful.setKey(BigInt(this.key));
                let result = prngStateful.randBound(this.min, this.max);
                return `Final Counter: ${prngStateful.ctr()}; result: ${result}`
            },
            getCtr() {
                return prngStateful.ctr();
            }
        }
    });

    // Randomly choose one of the 1000 keys
    app.vue.key = keys[Math.round(Math.random() * (keys.length - 1))];

})(window.app = {});