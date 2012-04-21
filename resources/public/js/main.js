var currentTime = 0;
var todo = [];

function schedule(item) {
    todo.push(item);
}

function heartbeat() {
    todo.sort();
    if (todo && todo.length > 0 && todo[0].time < currentTime) {
        var next = todo.shift();
        next.fun();
    }
    ++currentTime;
}

function displayLine(line) {
    return function() {
        $("#intro").html(line);
    };
}

function init() {
    var loop = new Audio('sounds/string-1-loop.wav');
    loop.preload = true;
    loop.play();
    window.setInterval(heartbeat, 1000);
    schedule({"time": 5, "fun": displayLine("But what about the Tiny World theme?")});
    schedule({"time": 10, "fun": displayLine("You shall see!")});
}

init();