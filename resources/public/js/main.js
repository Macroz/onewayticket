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

function heartbeat(fast) {
    var speed = fast ? 10 : 1;
    return function() {
        todo.sort();
        while (todo && todo.length > 0 && todo[0].time < currentTime) {
            var next = todo.shift();
            next.fun();
        }
        currentTime += speed;
    }
}

function displayLine(line) {
    return function() {
        $("#intro").html(line);
    };
}

function outro() {
    scheduleSequenceOfText([0, "Congratulations!", 5, "You have won the game!", 5, "Send feedback to markku.rontu@iki.fi or tweet!"]);
}

function init(fast) {
    var loop = new Audio('sounds/string-1-loop.wav');
    loop.preload = true;
    loop.play();
    window.setInterval(heartbeat(fast), 1000);
    schedule({"time": 5, "fun": displayLine("But what about the Tiny World theme?")});
    schedule({"time": 10, "fun": displayLine("You shall see!")});
    schedule({"time": 60, "fun": outro});
}
