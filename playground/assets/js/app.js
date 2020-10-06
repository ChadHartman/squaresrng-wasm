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

    function yFormatter(label) {
        if (label < 1000) {
            return label;
        }

        if (label < 1000000) {
            label / 1000 + "K"
        }

        return label < 1000000000 ?
            label / 1000000 + "M" :
            label / 1000000000 + "B";
    };

    function chart(ctx, rng) {

        const total = 100;
        let data = new Array(total);
        let labels = new Array(total);
        for (let i = 0; i < total; ++i) {
            data[i] = rng();
            labels[i] = i;
        }

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        fill: false,
                        borderColor: "#36e"
                    }
                ]
            },
            options: {
                legend: {
                    display: false
                },
                responsive: true,
                scales: {
                    yAxes: [
                        {
                            ticks: { callback: yFormatter }
                        }
                    ]
                }
            }
        });
    };

    app.vue = new Vue({
        el: '#vueapp',
        data: {
            implementation: IMPL_STATELESS,
            keys: keys,
            key: "",
            counter: 0,
            min: 0,
            max: 10
        },
        watch: {
            key: this.renderCharts,
            counter: this.renderCharts
        },
        methods: {
            renderCharts() {
                if (!this.$refs["chart-rand"]) {
                    return;
                }
                // May be called before registration
                let ctx = this.$refs["chart-rand"].getContext("2d");
                let rng = this.implementation === IMPL_STATELESS ?
                    () => prngStateless.rand(ctr++, key) :
                    () => prngStateful.rand();
                chart(ctx, rng);
            }
            // ,
            // rand() {
            //     let ctr = BigInt(this.counter);
            //     let key = BigInt(this.key);
            //     prngStateful.setCtr(ctr);
            //     prngStateful.setKey(key);

            //     let rng = this.implementation === IMPL_STATELESS ?
            //         () => prngStateless.rand(ctr++, key) >>> 0 :
            //         () => prngStateful.rand() >>> 0;
            //     let result = rng();

            //     if (this.$refs["chart-rand"]) {
            //         // May be called before registration
            //         let ctx = this.$refs["chart-rand"].getContext("2d");
            //         chart(ctx, rng);
            //     }

            //     return result;
            // },
            // randF() {
            //     let ctr = BigInt(this.counter);
            //     let key = BigInt(this.key);
            //     prngStateful.setCtr(ctr);
            //     prngStateful.setKey(key);

            //     let rng = this.implementation === IMPL_STATELESS ?
            //         () => prngStateless.randF(ctr++, key) :
            //         () => prngStateful.randF();
            //     let result = rng();

            //     if (this.$refs["chart-randf"]) {
            //         // May be called before registration
            //         let ctx = this.$refs["chart-randf"].getContext("2d");
            //         chart(ctx, rng);
            //     }

            //     return result;
            // },
            // randBound() {
            //     let ctr = BigInt(this.counter);
            //     let key = BigInt(this.key);
            //     prngStateful.setCtr(ctr);
            //     prngStateful.setKey(key);

            //     if (this.max - this.min < 0) {
            //         return "Invalid range; max must be >= min";
            //     }

            //     let rng = this.implementation === IMPL_STATELESS ?
            //         () => prngStateless.randBound(ctr++, key, this.min, this.max) :
            //         () => prngStateful.randBound(this.min, this.max);
            //     let result = rng();

            //     if (this.$refs["chart-randbound"]) {
            //         // May be called before registration
            //         let ctx = this.$refs["chart-randbound"].getContext("2d");
            //         chart(ctx, rng);
            //     }

            //     return result;
            // },
            // randBoundLemire() {
            //     // No stateless implementation available
            //     prngStateful.setCtr(BigInt(this.counter));
            //     prngStateful.setKey(BigInt(this.key));
            //     return prngStateful.randBound(this.min, this.max);
            // },
            // getCtr() {
            //     return prngStateful.ctr();
            // }
        }
    });

    // Randomly choose one of the 1000 keys
    app.vue.key = keys[Math.round(Math.random() * (keys.length - 1))];

})(window.app = {});