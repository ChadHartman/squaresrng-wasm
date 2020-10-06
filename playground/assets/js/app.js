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

    app.vue = new Vue({
        el: '#vueapp',
        data: {
            implementation: IMPL_STATELESS,
            keys: keys,
            key: "",
            counter: 0,
            min: 0,
            max: 10,
            section_rand: true,
            section_randf: true,
            section_randbound: true,
            section_randboundlemire: true
        },
        watch: {
            key() {
                // Chart may not exist until sync complete
                setTimeout(this.renderCharts.bind(this), 1);
            },
            counter() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            implementation() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            min() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            max() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            section_rand() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            section_randf() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            section_randbound() {
                setTimeout(this.renderCharts.bind(this), 1);
            },
            section_randboundlemire() {
                setTimeout(this.renderCharts.bind(this), 1);
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
                app.chart(ctx, rng);
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
                app.chart(ctx, rng);
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
                app.chart(ctx, rng);
            },
            renderRandBoundLemireChart() {
                // May be called before registration, method only available with stateful version
                if (!this.$refs["chart-randboundlemire"] ||
                    this.implementation === IMPL_STATELESS) {
                    return;
                }
                let ctx = this.$refs["chart-randboundlemire"].getContext("2d");
                app.chart(ctx, () => prngStateful.randBoundLemire(this.min, this.max));
            }
        }
    });

    // Randomly choose one of the 1000 keys
    app.vue.key = keys[Math.round(Math.random() * (keys.length - 1))];

})(window.app = window.app || {});