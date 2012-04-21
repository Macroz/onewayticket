var currentTime = 0;
var todo = [];
var state = {
    "lifesupport": false,
    "oxygenlevel": 5
    //     "uistate": {
    //         "leftdisplay": {
    //             "buttonleft1": makeOffButton("leftleftbutton1");
    //         }
    //     }
};

function schedule(item) {
    todo.push(item);
}

function scheduleAt(time, fun) {
    //log("Scheduled at " + time);
    schedule({"time": time, "fun": fun});
}

function scheduleNow(fun) {
    scheduleAt(currentTime, fun);
}

function scheduleAfter(time, fun) {
    scheduleAt(currentTime + time, fun);
}

function scheduleSequenceOfText(seq, holdLast, time, timeLast) {
    var t = currentTime;
    if (!time) {
        time = 3;
    }
    if (!timeLast) {
        timeLast = time;
    }
    for (var i = 0; i < seq.length; i += 2) {
        t += seq[i];
        if (i + 2 < seq.length) {
            scheduleAt(t, displayFor(time, seq[i+1]));
        } else {
            if (holdLast) {
                scheduleAt(t, displayLine(seq[i+1]));
            } else {
                scheduleAt(t, displayFor(timeLast, seq[i+1]));
            }
        }
    }
}

function log(text) {
    if (console && console.log) {
        console.log(text);
    }
}

function heartbeat(fast) {
    var speed = fast ? 1 : 0.1;
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

function displayFor(time, line) {
    return function() {
        $("#intro").html(line);
        scheduleAfter(time, function() {
            if ($("#intro").html() == line) {
                $("#intro").html("");
            }
        });
    };
}

function playSound(sound) {
    return function() {
        var loop = new Audio("sounds/"+sound);
        loop.preload = true;
        loop.play();
    };
}

function start() {
    checkLifeSupport();
}

function intro() {
    scheduleNow(playSound("string-1-loop.wav"));
    scheduleSequenceOfText([0, "Year 2038 mankind builds a supercomputer to predict its future.",
                            8, "In two weeks the machine achieves sentience and names itself im01.",
                            8, "im01 predicts mankind will be extinct in just two decades, unless it spreads offworld.",
                            10, "Mankind redoubles its efforts to colonize know space<br/>and begins building a ship capable of propelling itself to the stars.",
                            15, "Year 2040 the ship is ready.<br/>It is named the Orion Express,<br/>a veritable space train sailing on the solar winds.",
                            8, "Year 2041 the ship departs on its maiden voyage,<br/>with 10 000 cryogenically frozen colonists,<br/>to journey to the closest star with a known habitable planet<br/>and protect the future of mankind.",
                            10, "You as its captain are responsible for its destiny,<br/>when it reaches its desination.",
                            10, "Time passes as the ship makes its journey.",
                            5, "Then you begin to wake up..."], false, 15, 5);
    scheduleAfter(90, start);
}

function win() {
    scheduleNow(playSound("choir.wav"));
    scheduleSequenceOfText([0, "Congratulations!",
                            5, "You have won the game!",
                            5, "Send feedback to markku.rontu@iki.fi or tweet!"], true);
}

function isLifeSupport() {
    return state.lifesupport;
}

function toggleLifeSupport(event) {
    var jqbutton = $(event.target);
    var button = jqbutton[0];
    if (jqbutton.attr("class") == "toggleon") {
        setSVGAttribute(button, "class", "toggleoff");
        state.lifesupport = false;
    } else if (jqbutton.attr("class") == "toggleoff") {
        setSVGAttribute(button, "class", "toggleon");
        state.lifesupport = true;
    }
}

function setSVGAttribute(element, name, value) {
    element.setAttributeNS(null, name, value);
}

function makeToggleButton(id, toggleFun, initialState) {
    var jqbutton = $("#"+id);
    var button = jqbutton[0];
    if (initialState) {
        setSVGAttribute(button, "class", "toggleon");
    } else {
        setSVGAttribute(button, "class", "toggleoff");
    }
    jqbutton.on("click", function(event) {
        playSound("button1.wav")();
        toggleFun(event);
    });
}

function makePushButton(id, pushFun) {
    var jqbutton = $("#"+id);
    var button = jqbutton[0];
    setSVGAttribute(button, "class", "pushoff");
    jqbutton.on("click", function(event) {
        setSVGAttribute(button, "class", "pushon");
        playSound("button1.wav")();
        scheduleAfter(1, function() {
            setSVGAttribute(button, "class", "pushoff");
            pushFun(event);
        });
    });
}

function checkLifeSupport() {
    log("Life Support " + state.lifesupport);
    log("Oxygen level " + state.oxygenlevel);
    if (!isLifeSupport() && state.oxygenlevel > 0) {
        state.oxygenlevel -= 1;
        if (state.oxygenlevel == 8) {
            displayFor(2, "The air feels stale.")();
        } else if (state.oxygenlevel < 5) {
            displayFor(2, "You are suffocating!")();
        }
    } else if (isLifeSupport() && state.oxygenlevel < 10) {
        state.oxygenlevel += 1;
        if (state.oxygenlevel == 8) {
            displayFor(2, "The air feels fresh again.")();
        } else if (state.oxygenlevel < 5) {
            displayFor(2, "You are suffocating!")();
        }
    }
    if (state.oxygenlevel == 0) {
        scheduleNow(displayLine("You pass out!"));
        scheduleAfter(2, die);
    } else {
        scheduleAfter(10, checkLifeSupport);
    }
}

function die() {
    scheduleNow(playSound("funeral.wav"));
    scheduleSequenceOfText([0, "You have died.",
                            5, "Reload to try again.",
                            5, "Send feedback to markku.rontu@iki.fi or tweet!"], true, 5);
}

function setupButton(id, name, fun, toggle, initialState) {
    var jqtext = $("#" + id + "text");
    var text = jqtext[0];
    if (text) {
        if (fun) {
            setSVGAttribute(text, "class", "texton");
            text.childNodes[1].firstChild.nodeValue = name;
            if (toggle) {
                makeToggleButton(id, fun, initialState);
            } else {
                makePushButton(id, fun);
            }
        } else {
            setSVGAttribute(text, "class", "textoff");
        }
    } else {
        log("No text setup for button " + id);
    }
}

function makeOffButton(id) {
    var jqbutton = $("#"+id);
    var button = jqbutton[0];
    setSVGAttribute(button, "class", "buttonoff");
    setupButton(id, "", null);
    jqbutton.off("click");
}

function makeDisplay(displayid, layerid) {
    var jqdisplay = $("#"+displayid);
    var display = jqdisplay[0];
    setSVGAttribute(display, "class", "displayoff");
    if (layerid) {
        var jqlayer = $("#"+layerid);
        var layer = jqlayer[0];
        setSVGAttribute(layer, "class", "layeroff");
    }
}

function unsetupAllButtons() {
    makeOffButton("leftleftbutton1");
    makeOffButton("leftleftbutton2");
    makeOffButton("leftleftbutton3");
    makeOffButton("leftleftbutton4");
    makeOffButton("leftleftbutton5");
    makeOffButton("leftrightbutton1");
    makeOffButton("leftrightbutton2");
    makeOffButton("leftrightbutton3");
    makeOffButton("leftrightbutton4");
    makeOffButton("leftrightbutton5");
    makeOffButton("rightleftbutton1");
    makeOffButton("rightleftbutton2");
    makeOffButton("rightleftbutton3");
    makeOffButton("rightleftbutton4");
    makeOffButton("rightleftbutton5");
    makeOffButton("rightrightbutton1");
    makeOffButton("rightrightbutton2");
    makeOffButton("rightrightbutton3");
    makeOffButton("rightrightbutton4");
    makeOffButton("rightrightbutton5");
}

function switchToSpaceDisplay(event) {
    switchOffAllDisplays();
    var jqdisplay = $("#spacedisplaymode");
    var display = jqdisplay[0];
    setSVGAttribute(display, "class", "displayon");
    var jqlayer = $("#layer2");
    var layer = jqlayer[0];
    setSVGAttribute(layer, "class", "layeron");
}

function switchToSystemDisplay(event) {
    switchOffAllDisplays();
    setupButton("leftleftbutton1", "Life Support", toggleLifeSupport, true, isLifeSupport());
    //var jqdisplay = $("#systemdisplaymode");
    //var display = jqdisplay[0];
    //setSVGAttribute(display, "class", "displayon");
    //var jqlayer = $("#layer3");
    //var layer = jqlayer[0];
    //setSVGAttribute(layer, "class", "layeron");
}

function switchOffAllDisplays() {
    unsetupAllButtons();
    var jqdisplay = $("#spacedisplaymode");
    var display = jqdisplay[0];
    setSVGAttribute(display, "class", "displayoff");
    var jqlayer = $("#layer2");
    var layer = jqlayer[0];
    setSVGAttribute(layer, "class", "layeroff");
}

function switchToMenu(event) {
    setupButton("leftleftbutton1", "Off", switchOffAllDisplays);
    setupButton("leftleftbutton2", "Space", switchToSpaceDisplay);
    setupButton("leftrightbutton5", "System", switchToSystemDisplay);
}

function initUI() {
    makeDisplay("spacedisplaymode", "layer2");
    //makeDisplay("systemdisplaymode", null);
    unsetupAllButtons();
    //makeToggleButton("leftleftbutton1", toggleLifeSupport);
    //makePushButton("leftleftbutton2", switchToSpaceDisplay);
    makePushButton("menubutton", switchToMenu);
}

function init(fast) {
    window.setInterval(heartbeat(fast), 100);
    initUI();
    scheduleNow(intro);
    //scheduleAt(60, checkLifeSupport);
}
