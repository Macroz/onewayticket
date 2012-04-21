var currentTime = 0;
var todo = [];

function schedule(item) {
    todo.push(item);
}

function scheduleSequenceOfText(seq) {
    var t = currentTime;
    for (var i = 0; i < seq.length; i += 2) {
        t += seq[i]
        schedule({"time": t, "fun": displayLine(seq[i+1])});
    }
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

function outro() {
    scheduleSequenceOfText([0, "Congratulations!", 5, "You have won the game!", 5, "Send feedback to markku.rontu@iki.fi or tweet!"]);
}

function init() {
    var loop = new Audio('sounds/string-1-loop.wav');
    loop.preload = true;
    loop.play();
    window.setInterval(heartbeat, 1000);
    schedule({"time": 5, "fun": displayLine("But what about the Tiny World theme?")});
    schedule({"time": 10, "fun": displayLine("You shall see!")});
    schedule({"time": 60, "fun": outro});
}

init();