function linspace(start, stop, num) {
    var res = new Array(num);
    var step = (stop - start) / (num - 1);
    for (var i = 0; i < num; i++) {
        res[i] = start + i * step;
    }
    return res;
}

var num_runs = 5000;
// var num_runs = 10;
var min_interval = 0;
var max_interval = 1000;
var interval = max_interval;
var redraw_interval = 1000;


function uniform() {
    return 2 * Math.random() - 1;
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x)) - 0.5;
}

function identity(x) {
    return x;
}

function gamma(n) {
    // return 1 / n ** 0.8
    return 3 / n;
}

var X_init = Array(num_runs).fill(-8.0);
var curFunc = sigmoid;
var curNoise = rnorm;
var x = linspace(-10, 10, 100);
var y = x.map(function(x) { return curFunc(x); });
var X = X_init;
var play = true;
var step = 1;

var trace1 = {
    x: x,
    y: y,
    type: 'scatter',
    name: 'h'
};

function getBins(X, num) {
    var num = typeof num !== 'undefined' ?  num : 50;
    var mx = Math.max.apply(null, X);
    var mn = Math.min.apply(null, X);
    return {
        start: mn,
        end: mx,
        size: (mx - mn) / num
    };
}

var trace2 = {
    x: X_init,
    opacity: 0.5,
    type: 'histogram',
    histnorm: 'probability density',
    autobinx: false,
    xbins: getBins(X_init),
    name: 'Density of X'
};

var trace3 = {
    x: X_init,
    type: 'histogram',
    histnorm: 'probability density',
    autobinx: false,
    xbins: getBins(X_init),
    name: 'Density of sqrt(n) * X',
    marker: {
        color: 'green'
    }
};

var layout = {
    autoscale: true,
    showlegend: true,
    legend: {
        x: 0,
        y: -0.2,
        orientation: 'h'
    },
    margin: {
        l: 40,
        r: 40,
        b: 40,
        t: 40
    }
};

var data1 = [trace1, trace2];
var plotdiv1 = document.getElementById("plotdiv1");
var plotdiv2 = document.getElementById("plotdiv2");
var ittxt = $("#iteration");

Plotly.newPlot(plotdiv1, data1, layout);
Plotly.newPlot(plotdiv2, [trace3], layout);
var updateId, redrawId;

function drawIteration(i) {
    ittxt.text(i);
}

function update() {
    var g = gamma(step);
    for (var i = 0; i < num_runs; i++)
        X[i] -= g * (curFunc(X[i]) + curNoise());
    // X = X.map(function(x) { return x - gamma(step) * (curFunc(x) + curNoise()); });
    // drawIteration(step);
    step += 1;
    updateId = window.setTimeout(update, interval);
}

function redrawPlot() {
    drawIteration(step);
    trace2.x = X;
    trace2.xbins = getBins(X);
    var X_scaled = X.slice(), sr = Math.sqrt(step);
    for (var i = 0; i < num_runs; i++)
        X_scaled[i] *= sr;
    trace3.x = X_scaled;
    trace3.xbins = getBins(X_scaled);
    Plotly.redraw(plotdiv1);
    Plotly.redraw(plotdiv2);
}


updateId = window.setTimeout(update, 0);

redrawId = window.setInterval(redrawPlot, redraw_interval);

$("#playpause").change(function() {
    if ($("#play").is(":checked")) {
        if (! play) {
            updateId = window.setTimeout(update, 0);
            redrawId = window.setInterval(redrawPlot, redraw_interval);
            play = true;
        }
    } else {
        play = false;
        window.clearTimeout(updateId);
        window.clearInterval(redrawId);
    }
});

$("#speed-slider").slider().on("change", function(o) {
    $("#speed-label").text(Math.round(o.value.newValue));
    interval = (10 * max_interval - min_interval + o.value.newValue * (min_interval - max_interval)) / 9;
});

$("#reset").click(function() {
    step = 1;
    var sel = $("#hselect").val();
    if (sel === "sigmoid") curFunc = sigmoid;
    else curFunc = identity;
    trace1.y = x.map(function(x) { return curFunc(x); });
    sel = $("#idselect").val();
    if (sel === "dirac") X_init = Array(num_runs).fill(-8.0);
    else X_init = linspace(-10, 10, num_runs);
    sel = $("#noiseselect").val();
    if (sel === "gauss") curNoise = rnorm;
    else curNoise = uniform;
    X = X_init;
    drawIteration(0);
    redrawPlot();
});


$(window).resize(_.debounce(function() {
        Plotly.Plots.resize(plotdiv1);
        Plotly.Plots.resize(plotdiv2);
}, 150)
);
