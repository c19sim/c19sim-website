const $overlay = document.getElementById("overlay");
const $quarantine = document.getElementById("quarantine");
const $run = document.getElementById("run");

$run.addEventListener("click", () => {
    const scenario = new Scenario();
    scenario.configure(1);
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
            case 1:
                this.behaviour.socialDistanceRate = parseFloat($quarantine.value);
                break;
            default:
        }
    }
}