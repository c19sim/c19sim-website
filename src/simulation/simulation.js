const $overlay = document.getElementById("overlay");
const $quarantine = document.getElementById("quarantine");
const $hygiene = document.getElementById("hygiene");
const $tests = document.getElementById("icu");
const $run = document.getElementById("run");

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
    }
    results.innerHTML = e.data;
});

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
    var scenarioId = getScenarioId();
    const scenario = new Scenario();
    scenario.configure(scenarioId);
    var filledICUs = 0;
    const pop = new Population(
        scenario.population.size, 
        scenario.behaviour.quarantineRate, 
        scenario.population.patientZeroes, 
        scenario.behaviour.hygieneLevel, 
        scenario.behaviour.testPercentage);
    const graph = new Graph(pop);
    graph.context.clearRect(0, 0, graph.width, graph.height);
    $overlay.classList.remove("active");

    function run() {
        pop.tick();
        graph.tick();
        if (graph.done) $overlay.classList.add("active"); else
            requestAnimationFrame(run);
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
            hygieneLevel: 0,
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
                this.behaviour.socialDistanceRate = parseFloat($quarantine.value);
                this.behaviour.quarantineRate = parseFloat($quarantine.value);
                this.behaviour.hygieneLevel = parseFloat($hygiene.value);
                this.behaviour.testPercentage = parseFloat($tests.value);
                break;
            default:
        }
    }
}