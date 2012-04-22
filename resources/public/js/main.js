var currentTime = 0;
var todo = [];
var state = {};

function initGameState(fast) {
    var debug = false;
    state = {
        "lifesupport": debug,
        "oxygenlevel": 9,
        "modules": [{"type": "engine",     "state": "normal"},
                    {"type": "generator",  "state": "normal", "on": debug},
                    {"type": "passenger",  "state": "damaged"},
                    {"type": "passenger",  "state": "normal"},
                    {"type": "passenger",  "state": "damaged"},
                    {"type": "factory",    "state": "normal"},

                    {"type": "generator",  "state": "normal", "on": false},
                    {"type": "passenger",  "state": "normal"},
                    {"type": "passenger",  "state": "damaged"},
                    {"type": "passenger",  "state": "normal"},
                    {"type": "sensor",     "state": "normal", "on": false},
                    {"type": "factory",    "state": "damaged"},

                    {"type": "generator",  "state": "normal", "on": false},
                    {"type": "passenger",  "state": "normal"},
                    {"type": "passenger",  "state": "damaged"},
                    {"type": "passenger",  "state": "normal"},
                    {"type": "passenger",  "state": "normal"},
                    {"type": "dockingbay", "state": "normal"}],
        "areas": [],
        "uraniumAvailable": 0,
        "fuelRodsAvailable": 0,
        "materialsAvailable": 0,
        "landingCraftAvailable": 1,
        "repairBotsAvailable": 2,
        "turnedOnLifeSupport": false,
        "discoveredPlanetIsLifeless": false
    };
    for (var i = 0; i < 15; ++i) {
        state.areas[i] = {
            "materials": Math.round(Math.random() * 11 + Math.random() * 5),
            "uranium": Math.round(Math.random() + Math.random() * 2),
            "state": "unexplored",
            "landingCraft": 0
        };
    }
}

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

function hideAll() {
    $("#layer1").attr("style", "display: none;");
    $("#layer2").attr("style", "display: none;");
    $("#layer3").attr("style", "display: none;");
    $("#layer4").attr("style", "display: none;");
}

function start() {
    $("#layer1").attr("style", "display: block;");
    scheduleAfter(5, checkLifeSupport);
}

function intro() {
    hideAll();
    scheduleNow(playSound("string-1-loop.wav"));
    scheduleSequenceOfText([0, "Year 2038 mankind builds a supercomputer to predict its future.",
                            8, "In two weeks the machine achieves sentience and names itself im01.",
                            8, "im01 predicts mankind will be extinct in just two decades, unless it spreads offworld.",
                            10, "Mankind redoubles its efforts to colonize known space<br/>and begins building a ship capable of propelling itself to the stars.",
                            15, "Year 2040 the ship is ready.<br/>It is named the Orion Express,<br/>a veritable space train sailing on the solar winds.",
                            8, "Year 2041 the ship departs on its maiden voyage,<br/>with 10 000 cryogenically frozen colonists.",
                            8, "To journey to the closest star with a known habitable planet<br/>and ensure the future of mankind.",
                            10, "You as its captain are responsible for its destiny.<br/>",
                            8, "A thousand years pass in the blink of an eye, as the ship makes its journey.",
                            8, "Then you begin to wake up... the future is up to you."], false, 15, 5);
    scheduleAfter(89, start);
}

function win() {
    hideAll();
    scheduleNow(playSound("choir.wav"));
    scheduleSequenceOfText([0, "You set course for a new destination, hoping there is a habitable planet there.",
                            10, "You will see, after another long frozen journey,<br/>if you are able to escape this tiny cabin of yours.",
                            10, "Congratulations!",
                            5, "You have finished the game!",
                            5, "Send feedback to markku.rontu@iki.fi or tweet @zorcam!"], true, 15);
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
        if (state.modules[0].powered) {
            setSVGAttribute(button, "class", "toggleon");
            state.lifesupport = true;
            if (!state.turnedOnLifeSupport) {
                state.turnedOnLifeSupport = true;
            }
        } else {
            scheduleNow(displayLine("Damn, it won't start!"));
        }
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
    //log("Life Support " + state.lifesupport);
    //log("Oxygen level " + state.oxygenlevel);
    if (!isLifeSupport() && state.oxygenlevel > 0) {
        state.oxygenlevel -= 1;
        if (state.oxygenlevel == 8) {
            displayFor(3, "The air feels stale.")();
        } else if (state.oxygenlevel < 5) {
            displayFor(3, "You are suffocating!")();
        }
    } else if (isLifeSupport() && state.oxygenlevel < 10) {
        state.oxygenlevel += 1;
        if (state.oxygenlevel == 8) {
            displayFor(3, "The air feels fresh again.")();
        } else if (state.oxygenlevel < 5) {
            displayFor(3, "You are suffocating!")();
        }
    }
    if (state.oxygenlevel == 0) {
        scheduleNow(displayLine("You pass out!"));
        scheduleAfter(3, die);
    } else {
        scheduleAfter(10, checkLifeSupport);
    }
}

function die() {
    hideAll();
    scheduleNow(playSound("funeral.wav"));
    scheduleSequenceOfText([0, "You have died.",
                            5, "Reload to try again.",
                            5, "Send feedback to markku.rontu@iki.fi or tweet @zorcam!"], true, 5);
}

function setupButton(id, name, fun, toggle, initialState) {
    var jqtext = $("#" + id + "text");
    var text = jqtext[0];
    if (typeof(initialState) == "undefined") {
        initialState = true;
    }
    if (text) {
        if (fun) {
            setSVGAttribute(text, "class", "texton");
            text.childNodes[1].firstChild.nodeValue = name;
            if (toggle) {
                makeToggleButton(id, fun, initialState);
            } else if (initialState) {
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
    if (displayid) {
        var jqdisplay = $("#"+displayid);
        var display = jqdisplay[0];
        setSVGAttribute(display, "class", "displayoff");
    }
    if (layerid) {
        var jqlayer = $("#"+layerid);
        var layer = jqlayer[0];
        setSVGAttribute(layer, "class", "layeroff");
    }
}

function unsetupLeftButtons() {
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
}

function unsetupRightButtons() {
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

function unsetupAllButtons() {
    unsetupLeftButtons();
    unsetupRightButtons();
}

function switchToSpaceDisplay(event) {
    switchOffAllDisplays();
    var jqdisplay = $("#spacedisplaymode");
    var display = jqdisplay[0];
    setSVGAttribute(display, "class", "displayon");
    var jqlayer = $("#layer2");
    var layer = jqlayer[0];
    $("#layer2").attr("style", "");
    setSVGAttribute(layer, "class", "layeron");
    if (state.modules[10].on && state.modules[10].powered) {
        setupButton("leftleftbutton1", "Scan", scanPlanet);
    }
    var allModulesRepaired = true;
    var allGeneratorsOn = true;
    for (var m = 0; m < state.modules.length; ++m) {
        var module = state.modules[m];
        if (module.state == "damaged") {
            allModulesRepaired = false;
        }
        if (module.type == "generator" && !module.on) {
	    allGeneratorsOn = false;
        }
    }
    if (state.modules[0].powered && state.fuelRodsAvailable > 1 && allModulesRepaired && allGeneratorsOn) {
        setupButton("leftleftbutton5", "Continue Journey", win);
    }
}

function updateAreaClass(areaState, area) {
    setSVGAttribute(area, "class", "area area" + areaState.state
                    + (areaState.selected ? " areaselected" : ""));
}

function updateModuleClass(moduleState, module) {
    setSVGAttribute(module, "class", "module module" + moduleState.state
                    + (!moduleState.powered ? " moduleunpowered" : "")
                    + (moduleState.selected ? " moduleselected" : ""));
}

function unselectAllAreas() {
    for (var a = 0; a < state.areas.length; ++a) {
        var areaState = state.areas[a];
        var jqarea = $("#area"+(a+1));
        var area = jqarea[0];
        areaState.selected = false;
        updateAreaClass(areaState, area);
    }
}

function unselectAllModules() {
    for (var m = 0; m < state.modules.length; ++m) {
        var moduleState = state.modules[m];
        var jqmodule = $("#module"+(m+1));
        var module = jqmodule[0];
        moduleState.selected = false;
        updateModuleClass(moduleState, module);
    }
}

function setupAreaState(a) {
    var areaState = state.areas[a];
    var jqarea = $("#area"+(a+1));
    var area = jqarea[0];

    jqarea.on("click", function() {
        unselectAllAreas();
        unsetupRightButtons();
        areaState.selected = true;
        updateAreaClass(areaState, area);
        showAreaState(areaState);
    });
    if (areaState.selected) {
        showAreaState(areaState);
    }
    updateAreaClass(areaState, area);
}

function setupModuleState(m, powered) {
    var moduleState = state.modules[m];
    var jqmodule = $("#module"+(m+1));
    var module = jqmodule[0];
    var jqtext = $("#module"+(m+1)+"text");
    var text = jqtext[0];
    var desc = moduleState.type;
    text.childNodes[1].firstChild.nodeValue = desc;
    setSVGAttribute(text, "class", "textoff");
    jqmodule.on("mouseenter", function() {
        setSVGAttribute(text, "class", "texton");
    });
    jqmodule.on("mouseleave", function() {
        setSVGAttribute(text, "class", "textoff");
    });
    jqmodule.on("click", function() {
        unselectAllModules();
        unsetupRightButtons();
        moduleState.selected = true;
        updateModuleClass(moduleState, module);
        showModuleState(moduleState);
    });
    moduleState.powered = powered;
    if (moduleState.selected) {
        showModuleState(moduleState);
    }
    updateModuleClass(moduleState, module);
}

function showAreaState(areaState) {
    var texts = ["State: " + areaState.state];
    if (areaState.state == "explored") {
        texts.push("Materials: " + areaState.materials);
        texts.push("Uranium: " + areaState.uranium);
    }
    setRightDisplayText(texts);
    if (state.landingCraftAvailable > 0 && state.modules[15].powered) {
        setupButton("rightleftbutton5", "Land (" + state.landingCraftAvailable + ")", landToArea(areaState));
    }
    if (areaState.landingCraft > 0 && state.modules[15].powered) {
        setupButton("rightrightbutton5", "Return (" + areaState.landingCraft + ")", returnLandingCraft(areaState));
    }
}

function landToArea(areaState) {
    return function() {
        if (state.landingCraftAvailable > 0 && state.modules[15].powered) {
            state.landingCraftAvailable -= 1;
            areaState.state = "explored";
            areaState.landingCraft += 1;
            updateAreaStates();
        }
    };
}

function returnLandingCraft(areaState) {
    return function() {
        if (areaState.landingCraft > 0 && state.modules[15].powered) {
            state.landingCraftAvailable += 1;
            var dm = Math.min(areaState.materials, 5);
            var du = Math.min(areaState.uranium, 1);
            state.materialsAvailable += dm;
            state.uraniumAvailable += du;
            areaState.materials -= dm;
            areaState.uranium -= du;
            areaState.landingCraft -= 1;
            updateAreaStates();
        }
    };
}

function showModuleState(moduleState) {
    var texts = ["Type: " + moduleState.type,
                 "State: " + moduleState.state,
                 "Powered: " + (moduleState.powered ? "yes" : "no")];
    if (moduleState.type == "dockingbay") {
        texts.push("Landing craft: " + state.landingCraftAvailable);
        texts.push("Repair bots: " + state.repairBotsAvailable);
    }
    if (moduleState.type == "factory") {
        texts.push("Materials: " + state.materialsAvailable);
        texts.push("Uranium: " + state.uraniumAvailable);
    }
    if (moduleState.type == "engine") {
        texts.push("Fuel rods: " + state.fuelRodsAvailable);
    }
    setRightDisplayText(texts);
    if (moduleState.state == "damaged" && state.repairBotsAvailable > 0) {
        setupButton("rightrightbutton5", "Repair", repairModule(moduleState));
    } else if (moduleState.type == "generator") {
        setupButton("rightleftbutton5", "Power", toggleGenerator(moduleState), true, moduleState.on);
    } else if (moduleState.type == "sensor") {
        setupButton("rightleftbutton5", "Sensors", toggleSensors(moduleState), true, moduleState.on);
    } else if (moduleState.type == "factory") {
        setupButton("rightleftbutton3", "Landing Craft (" + state.landingCraftAvailable + ")", buildLandingCraft, false, state.materialsAvailable > 4 && moduleState.powered);
        setupButton("rightleftbutton4", "Repair Bot (" + state.repairBotsAvailable + ")", buildRepairBot, false, state.materialsAvailable > 0 && moduleState.powered);
        setupButton("rightleftbutton5", "Fuel Rod (" + state.fuelRodsAvailable + ")", buildFuelRod, false, state.uraniumAvailable > 2 && moduleState.powered);
    }
}

function buildFuelRod() {
    if (state.uraniumAvailable > 2) {
        state.uraniumAvailable -= 3;
        state.fuelRodsAvailable += 1;
        updateModuleStates();
    }
}

function buildLandingCraft() {
    if (state.materialsAvailable > 4) {
        state.materialsAvailable -= 5;
        state.landingCraftAvailable += 1;
        updateModuleStates();
    }
}

function buildRepairBot() {
    if (state.materialsAvailable > 0) {
        state.materialsAvailable -= 1;
        state.repairBotsAvailable += 1;
        updateModuleStates();
    }
}

function toggleSensors(moduleState) {
    return function() {
        var jqbutton = $(event.target);
        var button = jqbutton[0];

        if (jqbutton.attr("class") == "toggleon") {
            setSVGAttribute(button, "class", "toggleoff");
            moduleState.on = false;
        } else if (jqbutton.attr("class") == "toggleoff") {
            if (state.modules[10].powered) {
                setSVGAttribute(button, "class", "toggleon");
                moduleState.on = true;
            }
        }
        updateModuleStates();
    };
}

function toggleGenerator(moduleState) {
    return function() {
        var jqbutton = $(event.target);
        var button = jqbutton[0];
        moduleState.on = !moduleState.on;
        if (jqbutton.attr("class") == "toggleon") {
            setSVGAttribute(button, "class", "toggleoff");
        } else if (jqbutton.attr("class") == "toggleoff") {
            setSVGAttribute(button, "class", "toggleon");
        }
        updateModuleStates();
    };
}

function repairModule(moduleState) {
    return function() {
        if (state.repairBotsAvailable > 0) {
            state.repairBotsAvailable -= 1;
            moduleState.state = "normal";
            updateModuleStates();
        }
    };
}

function switchToSystemDisplay() {
    switchOffAllDisplays();
    setupButton("leftleftbutton1", "Life Support", toggleLifeSupport, true, isLifeSupport());
    //var jqdisplay = $("#systemdisplaymode");
    //var display = jqdisplay[0];
    //setSVGAttribute(display, "class", "displayon");
    var jqlayer = $("#layer3");
    var layer = jqlayer[0];
    $("#layer3").attr("style", "");
    setSVGAttribute(layer, "class", "layeron");
    updateModuleStates();
}

function switchToPlanetDisplay() {
    switchOffAllDisplays();
    var jqlayer = $("#layer4");
    var layer = jqlayer[0];
    $("#layer4").attr("style", "");
    setSVGAttribute(layer, "class", "layeron");
    updateAreaStates();
}

function updateAreaStates() {
    unsetupRightButtons();
    for (var a = 0; a < state.areas.length; ++a) {
        setupAreaState(a);
    }
}

function updateModuleStates() {
    unsetupRightButtons();
    var powered = [];
    for (var m = 0; m < state.modules.length; ++m) {
        var moduleState = state.modules[m];
        var jqmodule = $("#module"+(m+1));
        var module = jqmodule[0];
        powered.push(moduleState.type == "generator" && moduleState.state == "normal" && moduleState.on);
    }

    // propagate power
    for (var i = 0; i < 18; ++i) {
        var newpowered = powered.slice(0);
        for (var m = 0; m < powered.length; ++m) {
            if (powered[m]) {
                if (m > 0 && state.modules[m-1].state != "damaged") {
                    newpowered[m-1] = true;
                }
                if (m < powered.length - 1 && state.modules[m+1].state != "damaged") {
                    newpowered[m+1] = true;
                }
                newpowered[m] = true;
            }
        }
        powered = newpowered;
    }

    for (var m = 0; m < powered.length; ++m) {
        setupModuleState(m, powered[m]);
    }
}

function scanPlanet() {
    //var jqdisplay = $("#rightdisplayarea");
    //var display = jqdisplay[0];
    //jqdisplay.append("<text>Text</text>");
    setRightDisplayText(["Atmosphere:",
                         " - carbon dioxide  90 %",
                         " - nitrogen       9.5 %",
                         " - oxygen         0.5 %",
                         " - pressure      23 KPa",
                         "",
                         "Gravity:  0.72 G",
                         "",
                         "Temperature:",
                         " - surface -80 °C"]);
    if (!state.discoveredPlanetIsLifeless) {
        state.discoveredPlanetIsLifeless = true;
        scheduleSequenceOfText([3, "No it can't be!",
                                5, "LD#23 is hostile to life!",
                                5, "What am I going to do now?"]);
    }
}

function setRightDisplayText(texts) {
    if (!texts) {
        texts = [];
    }
    for (var i = 0; i < 16; ++i) {
        var jqtext = $("#rightdisplaytext" + (i+1));
        var text = jqtext[0];
        if (i < texts.length) {
            setSVGAttribute(text, "class", "texton");
            var t = texts[i].replace(/ /g, " ");
            text.childNodes[1].firstChild.nodeValue = t;
        } else {
            setSVGAttribute(text, "class", "textoff");
        }
    }
}

function switchOffRightDisplay() {
    setRightDisplayText();
}

function switchOffAllDisplays() {
    unsetupAllButtons();
    var jqdisplay = $("#spacedisplaymode");
    var display = jqdisplay[0];
    setSVGAttribute(display, "class", "displayoff");
    var jqlayer = $("#layer2");
    var layer = jqlayer[0];
    setSVGAttribute(layer, "class", "layeroff");
    var jqlayer = $("#layer3");
    var layer = jqlayer[0];
    setSVGAttribute(layer, "class", "layeroff");
    var jqlayer = $("#layer4");
    var layer = jqlayer[0];
    setSVGAttribute(layer, "class", "layeroff");
    switchOffRightDisplay();
}

function switchToMenu(event) {
    setupButton("leftleftbutton1", "Space", switchToSpaceDisplay);
    setupButton("leftleftbutton2", "Planet", switchToPlanetDisplay);
    setupButton("leftrightbutton5", "System", switchToSystemDisplay);
}

function initUI() {
    makeDisplay("spacedisplaymode", "layer2");
    makeDisplay(null, "layer3");
    makeDisplay(null, "layer4");
    switchOffAllDisplays();
    makePushButton("menubutton", switchToMenu);
}

function init(fast) {
    initGameState(fast);
    hideAll();
    window.setInterval(heartbeat(false), 100);
    initUI();
    if (fast) {
        start();
    } else {
        intro();
    }
}
