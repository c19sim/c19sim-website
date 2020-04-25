const $overlay = document.getElementById("overlay");
const $quarantine = document.getElementById("quarantine");
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
    console.log('Caught the event!', e);
    // TODO: pause all simulations
    results.innerHTML = e.data;
});

function getScenarioId() {
    var params = location.href.split('?')[1].split('&');
    console.log('params', params);
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
    const pop = new Population(scenario.population.size, scenario.behaviour.quarantineRate, scenario.population.patientZeroes);
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
            socialDistanceDiscipline: 0.6
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
                break;
            default:
        }
    }
}