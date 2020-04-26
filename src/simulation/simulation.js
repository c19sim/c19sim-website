const $overlay = document.getElementById("overlay");
const $quarantine = document.getElementById("quarantine");
const $hygiene = document.getElementById("hygiene");
const $icu = document.getElementById("icu");
const $tests = document.getElementById("tests");
const $run = document.getElementById("run");
const $canvas = document.getElementById("population");

var simulation = null;

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

// Listen to messages from parent window
bindEvent(window, 'message', function (e) {
    switch(e.data) {
        case MESSAGE_TYPE.pause_sim:
            // TODO: pause all simulations
            pauseSimulation();
    }
    results.innerHTML = e.data;
});

$canvas.addEventListener("click", () => { pauseSimulation(); });

function pauseSimulation(){
    if(simulation && simulation.simStatus === SIMSTATUS.running){
        simulation.pause();
        $overlay.classList.add("active");
    }    
}

// Get the scenario ID from the query string passed to the iframe.
// This lets us instantiate the simulation correctly.
function getScenarioId() {
    var params = location.href.split('?')[1].split('&');
    data = {};
    for (x in params)
    {
        data[params[x].split('=')[0]] = params[x].split('=')[1];
    }
    return data.key;
}

$run.addEventListener("click", () => {
    if(!simulation || simulation.simStatus === SIMSTATUS.finished){
        simulation = new Simulation();
    }
    
    $overlay.classList.remove("active");
    simulation.simStatus = SIMSTATUS.running;

    function run() {
        simulation.population.tick();
        simulation.graph.tick();
        if (simulation.graph.done){
            $overlay.classList.add("active");
            simulation.simStatus = SIMSTATUS.finished;
            configureSimControlsVisibility(true);
        } else if (simulation.simStatus === SIMSTATUS.paused) {
            return;
        } else if (simulation.simStatus === SIMSTATUS.running) {
            requestAnimationFrame(run);
        }
    }

    run();
});

class Scenario {
    constructor() {
        this.population = {
            size: 1000,
            patientZeroes: 10
        };
        this.behaviour = {
            quarantineRate: 0,
            socialDistanceRate: 0.75,
            socialDistanceDiscipline: 0.6,
            hygieneLevel: 0,
            icuPercentage: 100,
            testPercentage: 0
        };
        this.virus = {
            incubationTime: 4,
            symptomLagTime: 8,
            RecoveryTime: 16
        };
    }

    configure(id) {
        switch (id) {
            case 'scenario1':
                this.behaviour.hygieneLevel = parseFloat($hygiene.value);
                break;
            case 'scenario2':
                this.behaviour.icuPercentage = parseFloat($icu.value);
                break;
            case 'scenario3':
                this.behaviour.quarantineRate = parseFloat($quarantine.value);
                break;
            case 'scenario4':
                this.behaviour.testPercentage = parseFloat($tests.value);
                break;
            case 'scenarioDash':
                this.behaviour.hygieneLevel = parseFloat($hygiene.value);
                this.behaviour.icuPercentage = parseFloat($icu.value);
                this.behaviour.quarantineRate = parseFloat($quarantine.value);
                this.behaviour.testPercentage = parseFloat($tests.value);
                break;
            default:
        }
    }
}

class Simulation {
    constructor(){
        var scenarioId = getScenarioId();
        this.scenario = new Scenario();
        this.scenario.configure(scenarioId);
        this.tests = new Tests(TEST_TIME);
        Object.freeze(this.tests);

        this.tests.buildIDs(this.scenario.behaviour.testPercentage, this.scenario.population.size);

        this.population = new Population(
            this.scenario.population.size, 
            this.scenario.behaviour.quarantineRate, 
            this.scenario.population.patientZeroes, 
            this.scenario.behaviour.hygieneLevel, 
            this.scenario.behaviour.icuPercentage,
            this.tests);

        this.graph = new Graph(this.population, this.tests);

        this.simStatus = SIMSTATUS.initialised;
    }

    pause(){
        this.simStatus = SIMSTATUS.paused;
    }
}

// Configuration of the simulation user controls visibility by scenario

const allSimControls = ["quarantine", "hygiene", "icu", "tests"];

const scenarioSimControls = {
    "scenario1"   : ["hygiene"],
    "scenario2"   : ["icu"],
    "scenario3"   : ["quarantine"],
    "scenario4"   : ["tests"],
    "scenarioDash": allSimControls,
};

function configureSimControlsVisibility(show){
    var scenarioId = getScenarioId();
    const value = show ? "visible" : "hidden";
    scenarioSimControls[scenarioId].forEach( ctrl => {
        document.getElementById(ctrl).parentElement.style.visibility = value;
    })
}

function configureSimControlsDisplay(){
    var scenarioId = getScenarioId();
    allSimControls.forEach( ctrl => {
        if(!scenarioSimControls[scenarioId].includes(ctrl)){
            // hide the parentElement, which is the 'select',
            // to ensure everything including the arrow disappears
            document.getElementById(ctrl).parentElement.style.display = "none";
        }
    })
}

configureSimControlsDisplay();
