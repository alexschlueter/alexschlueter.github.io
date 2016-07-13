function rand(n) {
    var ret = Array(n);
    for (i = 0; i < n; i++)
        ret[i] = Math.random();
    return ret;
}

function linspace(start, stop, num) {
    var res = new Array(num);
    var step = (stop - start) / (num - 1);
    for (var i = 0; i < num; i++) {
        res[i] = start + i * step;
    }
    return res;
}

// num_steps = 10000
var num_runs = 10000;
// var num_runs = 10;
// num_runs = 1000
var X_init = linspace(-10.0, 10.0, num_runs);
// X_init = np.full(num_runs, -8.0)
// min_interval = 50
var min_interval = 0;
var max_interval = 1000;
var interval = max_interval;


function Z() {
    return rand(num_runs).map(function(x) { return x - 0.5; });
}

function H(x, z) {
    // return -x + z
    return _.zipWith(x, z, function(x, z) {
        return 0.5 - 1 / (1 + Math.exp(-x)) + z;
    });
}

function gamma(n) {
    // return 1 / n ** 0.8
    return 3 / n;
}

var x = linspace(-10, 10, 100);
var y = H(x, Array(100).fill(0));
// X = np.full(num_runs, -5.0)
var X = X_init;
var play = true;
var step = 1;

var trace1 = {
    x: x,
    y: y,
    type: 'scatter',
    name: 'Sigmoid'
};

function getBins(X, num=50) {
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

var X_scaled = X.map(function(x) { return Math.sqrt(step) * x; });
var trace3 = {
    x: X_scaled,
    type: 'histogram',
    histnorm: 'probability density',
    autobinx: false,
    xbins: getBins(X_scaled),
    xaxis: 'x2',
    yaxis: 'y2',
    name: 'Density of sqrt(n) * X'
};

var layout = {
    xaxis: {domain: [0, 0.48]},
    yaxis2: {anchor: 'x2'},
    xaxis2: {domain: [0.52, 1]},
    legend: {
        x: 0,
        y: -0.2,
        orientation: 'h'
    }
};

var data = [trace1, trace2, trace3];
var plotdiv = document.getElementById('plotdiv');

Plotly.newPlot(plotdiv, data, layout);
var updateId, redrawId;

function drawIteration(i) {
    $("#iteration").text(i);
}

function update() {
    X = _.zipWith(X, H(X, Z()), function(x, h) { return x + gamma(step) * h; });
    drawIteration(step);
    step += 1;
    updateId = window.setTimeout(update, interval);
}

function redrawPlot() {
    // console.log(X);
    // var newData = {
    //     x: X
    // };
    // Plotly.restyle('plotdiv', newData, 1);
    // plotdiv.dMath.min(X),
    trace2.x = X;
    trace2.xbins = getBins(X);
    var X_scaled = X.map(function(x) { return Math.sqrt(step) * x; });
    trace3.x = X_scaled;
    trace3.xbins = getBins(X_scaled);
    Plotly.redraw(plotdiv);
}


updateId = window.setTimeout(update, 0);

redrawId = window.setInterval(redrawPlot, 1000);

$("#playpause").change(function() {
    if ($("#play").is(":checked")) {
        if (! play) {
            updateId = window.setTimeout(update, 0);
            redrawId = window.setInterval(redrawPlot, 1000);
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
    X = X_init;
    drawIteration(0);
    redrawPlot();
});


$(window).resize(function() {
    Plotly.Plots.resize(plotdiv);
});
