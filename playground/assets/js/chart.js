"use strict";

(app => {
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

    app.charts = {};

    app.chart = (ctx, rng) => {

        if (ctx.canvas.id in app.charts) {
            app.charts[ctx.canvas.id].destroy();
        }

        const total = 100;
        let data = new Array(total);
        let labels = new Array(total);
        for (let i = 0; i < total; ++i) {
            data[i] = rng();
            labels[i] = i;
        }

        app.charts[ctx.canvas.id] = new Chart(ctx, {
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
                tooltips: { enabled: false },
                hover: { mode: null },
                legend: { display: false },
                scales: {
                    yAxes: [{ ticks: { callback: yFormatter } }]
                }
            }
        });
    };

})(window.app = window.app || {});