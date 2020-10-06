"use strict";
(async (app) => {

    const IMPL_STATELESS = "stateless";

    // Choose a sheet of 1,000 keys
    //   There are 25 sheets (index 0:24) (25,000 total keys available)
    let keySubsetIndex = Math.round(Math.random() * 24);
    let keys = await fetch(`assets/json/keys.${keySubsetIndex}.json`)
        .then(response => response.json());

    let prngStateless = await fetch(`assets/wasm/squaresrng.wasm?cb=${Date.now()}`)
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.instantiate(buffer))
        .then(wasm => wasm.instance.exports);

    let prngStateful = await fetch(`assets/wasm/squaresrngs.wasm?cb=${Date.now()}`)
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.instantiate(buffer))
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
            max: 10,
            section: {
                rand: true,
                randf: true,
                randbound: true,
                randboundlemire: true
            }
        },
        watch: {
            key() {
                this.renderCharts();
            },
            counter() {
                this.renderCharts();
            },
            implementation() {
                this.renderCharts();
            }
        },
        methods: {
            renderCharts() {
                let ctr = BigInt(this.counter);
                let key = BigInt(this.key);
                prngStateful.setKey(key);
                prngStateful.setCtr(ctr);
                this.renderRandChart(ctr, key);
                this.renderRandFChart(ctr, key);
                this.renderRandBoundChart(ctr, key);
                this.renderRandBoundLemireChart();
            },
            renderRandChart(ctr, key) {
                // May be called before registration
                if (!this.$refs["chart-rand"]) {
                    return;
                }
                let ctx = this.$refs["chart-rand"].getContext("2d");
                let rng = this.implementation === IMPL_STATELESS ?
                    () => prngStateless.rand(ctr++, key) :
                    () => prngStateful.rand();
                chart(ctx, rng);
            },
            renderRandFChart(ctr, key) {
                // May be called before registration
                if (!this.$refs["chart-randf"]) {
                    return;
                }
                let ctx = this.$refs["chart-randf"].getContext("2d");
                let rng = this.implementation === IMPL_STATELESS ?
                    () => prngStateless.randF(ctr++, key) :
                    () => prngStateful.randF();
                chart(ctx, rng);
            },
            renderRandBoundChart(ctr, key) {
                // May be called before registration
                if (!this.$refs["chart-randbound"]) {
                    return;
                }
                let ctx = this.$refs["chart-randbound"].getContext("2d");
                let rng = this.implementation === IMPL_STATELESS ?
                    () => prngStateless.randBound(ctr++, key, this.min, this.max) :
                    () => prngStateful.randBound(this.min, this.max);
                chart(ctx, rng);
            },
            renderRandBoundLemireChart() {
                // May be called before registration, method only available with stateful version
                if (!this.$refs["chart-randboundlemire"] ||
                    this.implementation === IMPL_STATELESS) {
                    console.log(`State: ${this.implementation === IMPL_STATELESS}`);
                    return;
                }
                let ctx = this.$refs["chart-randboundlemire"].getContext("2d");
                chart(ctx, () => prngStateful.randBoundLemire(this.min, this.max));
            }
        }
    });

    // Randomly choose one of the 1000 keys
    app.vue.key = keys[Math.round(Math.random() * (keys.length - 1))];

})(window.app = {});