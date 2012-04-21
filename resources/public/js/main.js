var currentTime = 0;
var todo = [];

function schedule(item) {
    todo.push(item);
}

function scheduleAt(time, fun) {
    schedule({"time": time, "fun": fun});
}

function scheduleNow(fun) {
    scheduleAt(currentTime, fun);
}

function scheduleAfter(time, fun) {
    scheduleAt(currentTime + time, fun);
}

function scheduleSequenceOfText(seq) {
    for (var i = 0; i < seq.length; i += 2) {
        scheduleAfter(seq[i], displayLine(seq[i+1]));
    }
}

function log(text) {
    if (console && console.log) {
        console.log(text);
    }
}

function heartbeat(fast) {
    var speed = fast ? 10 : 1;
    return function() {
        todo.sort(function (o1, o2) { return o1.time - o2.time; });
        while (todo && todo.length > 0 && todo[0].time < currentTime) {
            var next = todo.shift();
            if (next.fun) {
                next.fun();
            } else {
                log("Problem executing " + next);
            }
        }
        currentTime += speed;
    }
}

function displayLine(line) {
    return function() {
        $("#intro").html(line);
    };
}

function playSound(sound) {
    var loop = new Audio("sounds/"+sound);
    loop.preload = true;
    loop.play();
}

function intro() {
    scheduleNow(playSound("string-1-loop.wav"));
    scheduleAfter(5, displayLine("But what about the Tiny World theme?"));
    scheduleAfter(10, displayLine("You shall see!"));
}

function outro() {
    scheduleNow(playSound("funeral.wav"));
    scheduleSequenceOfText([0, "Congratulations!", 5, "You have won the game!", 5, "Send feedback to markku.rontu@iki.fi or tweet!"]);
}


function init(fast) {
    window.setInterval(heartbeat(fast), 1000);
    scheduleNow(intro);
    scheduleAt(60, outro);
}
