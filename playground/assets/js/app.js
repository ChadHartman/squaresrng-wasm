"use strict";
(async (app) => {

    // There are 0-24 sheets (25,000 available)
    let keySubsetIndex = Math.round(Math.random() * 24);
    app.keys = await fetch(`assets/json/keys.${keySubsetIndex}.json`)
        .then(response => response.json());

    app.squaresrng = {
        key: { value: BigInt(0) },
        ctr: { value: BigInt(0) },
        methods: await fetch("assets/wasm/squaresrng.wasm")
            .then(response => response.arrayBuffer())
            .then(buffer => WebAssembly.instantiate(buffer))
            .then(wasm => wasm.instance.exports)
    };

    app.squaresrngs = {
        key: new WebAssembly.Global({ value: "i64", mutable: true }, BigInt(0)),
        ctr: new WebAssembly.Global({ value: "i64", mutable: true }, BigInt(0))
    };

    app.squaresrngs.methods = await fetch("assets/wasm/squaresrngs.wasm")
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.instantiate(buffer, {
            "state": {
                key: app.squaresrngs.key,
                ctr: app.squaresrngs.ctr
            }
        }))
        .then(wasm => wasm.instance.exports);

    app.vue = new Vue({
        el: '#vueapp',
        data: {
            implementation: "squaresrng",
            keys: app.keys,
            key: "",
            ctr: 0,
            min: 0,
            max: 0
        },
        methods: {
            rand() {
                let ctr = BigInt(this.ctr);
                let key = BigInt(this.key);

                if (this.implementation === "squaresrng") {
                    return app.squaresrng.methods.rand(ctr, key) >>> 0;
                }

                app.squaresrngs.ctr.value = ctr;
                app.squaresrngs.key.value = key;
                return app.squaresrngs.methods.rand() >>> 0;
            },
            randF() {
                let ctr = BigInt(this.ctr);
                let key = BigInt(this.key);

                if (this.implementation === "squaresrng") {
                    return app.squaresrng.methods.randF(ctr, key);
                }

                app.squaresrngs.ctr.value = ctr;
                app.squaresrngs.key.value = key;
                return app.squaresrngs.methods.randF();
            }
        }
    });

    app.vue.key = app.keys[Math.round(Math.random() * (app.keys.length - 1))];
    app.vue.ctr = 5;

})(window.app = {});