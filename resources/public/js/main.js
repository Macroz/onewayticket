var currentTime = 0;
var todo = [];

function schedule(item) {
    todo.push(item);
}

function scheduleAt(time, fun) {
    log("Scheduled at " + time);
    schedule({"time": time, "fun": fun});
}

function scheduleNow(fun) {
    scheduleAt(currentTime, fun);
}

function scheduleAfter(time, fun) {
    scheduleAt(currentTime + time, fun);
}

function scheduleSequenceOfText(seq) {
    var t = currentTime;
    for (var i = 0; i < seq.length; i += 2) {
        t += seq[i];
        scheduleAt(t, displayLine(seq[i+1]));
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
        //log("todo at " + currentTime + " size " + todo.length);
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
    return function() {
        var loop = new Audio("sounds/"+sound);
        loop.preload = true;
        loop.play();
    };
}

function intro() {
    scheduleNow(playSound("string-1-loop.wav"));
    scheduleSequenceOfText([0, "Space man, it's huge!",
                            5, displayLine("But what about the Tiny World theme?"),
                            5, displayLine("You shall see!"),
                            2, displayLine("Uhh, you have a hard time breathing!")]);
}

function outro() {
    scheduleNow(playSound("funeral.wav"));
    scheduleSequenceOfText([0, "Congratulations!",
                            5, "You have won the game!",
                            5, "Send feedback to markku.rontu@iki.fi or tweet!"]);
}

function isLifeSupport() {
    var jqbutton = $("#lifesupportbutton");
    return jqbutton.attr("class") == "toggleon";
}

function toggleLifeSupport(event) {
    var jqbutton = $(event.target);
    var button = jqbutton[0];
    if (jqbutton.attr("class") == "toggleon") {
        setSVGAttribute(button, "class", "toggleoff");
    } else if (jqbutton.attr("class") == "toggleoff") {
        setSVGAttribute(button, "class", "toggleon");
    }
}

function setSVGAttribute(element, name, value) {
    element.setAttributeNS(null, name, value);
}

function makeToggleButton(id, toggleFun) {
    var jqbutton = $("#"+id);
    var button = jqbutton[0];
    setSVGAttribute(button, "class", "toggleoff");
    jqbutton.on("click", function(event) {
        playSound("button1.wav")();
        toggleFun(event);
    });
}

function checkLifeSupport() {
    if (isLifeSupport()) {
        outro();
    } else {
        scheduleNow(playSound("funeral.wav"));
        scheduleSequenceOfText([0, "You gasp at the lack of air!",
                                5, "You have died.",
                                5, "Reload to try again.",
                                5, "Send feedback to markku.rontu@iki.fi or tweet!"]);

    }
}

function initUI() {
    makeToggleButton("lifesupportbutton", toggleLifeSupport);
}

function init(fast) {
    window.setInterval(heartbeat(fast), 1000);
    initUI();
    scheduleNow(intro);
    scheduleAt(60, checkLifeSupport);
}
