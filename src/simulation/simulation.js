const $overlay = document.getElementById("overlay");
const $quarantine = document.getElementById("quarantine");
const $hygiene = document.getElementById("hygiene");
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
            console.log('Pause all simulations');
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
            patientZeroes: 3
        };
        this.behaviour = {
            quarantineRate: 0.5,
            socialDistanceRate: 0.75,
            socialDistanceDiscipline: 0.6,
            hygieneLevel: 0
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
                this.behaviour.socialDistanceRate = parseFloat($quarantine.value);
                this.behaviour.quarantineRate = parseFloat($quarantine.value);
                this.behaviour.hygieneLevel = parseFloat($hygiene.value);
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

        this.population = new Population(
            this.scenario.population.size, 
            this.scenario.behaviour.quarantineRate, 
            this.scenario.population.patientZeroes, 
            this.scenario.behaviour.hygieneLevel);

        this.graph = new Graph(this.population);

        this.simStatus = SIMSTATUS.initialised;
    }

    pause(){
        this.simStatus = SIMSTATUS.paused;
    }
}