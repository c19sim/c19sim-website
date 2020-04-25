const $overlay = document.getElementById("overlay");
const $quarantine = document.getElementById("quarantine");
const $run = document.getElementById("run");

$run.addEventListener("click", () => {
  const q = parseFloat($quarantine.value);
  const pop = new Population(1000, q, 3);
  const graph = new Graph(pop);
  graph.context.clearRect(0, 0, graph.width, graph.height);
  $overlay.classList.remove("active");

  function run() {
    pop.tick();
    graph.tick();
    if (graph.done) $overlay.classList.add("active");else
    requestAnimationFrame(run);
  }

  run();
});