// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");
var stepText = scrolly.selectAll(".step-text");

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepH + "px");
  
  var figYScale = 1.4;
  var figureHeight = window.innerHeight / figYScale;
  var figureMarginTop = (window.innerHeight - figureHeight) / figYScale;
  
  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

/**
 * Handle behaviour as the user scrolls through a step.
 * This method adds top margin to the text so it is aligned with the chart.
 */
function handleStepProgress(response) {
    // Grab some elements, calculate some heights
    var stepH = Math.floor(window.innerHeight * 0.75);
    var currentStep = article.select('.is-active');
    var currentStepText = currentStep.select('.step-text');
    var currentStepTextHeight = currentStepText.node().getBoundingClientRect().height;

    // Get distance from top of figure to top of parent element
    var fp = figure._groups[0][0].offsetTop;

    // Get distance from top of step to top of parent element
    var sp = currentStep._groups[0][0].offsetTop;

    // Calculate the amount of margin to add, as well as a maximum margin,
    // which is required so that the text doesn't flow off the end of the step.
    var topMargin = fp - sp;
    var maxMargin = stepH - currentStepTextHeight - 60;
    topMargin = Math.max(topMargin, 0);
    topMargin = topMargin > maxMargin ? maxMargin : topMargin;
    currentStepText.style("margin-top", topMargin + "px");
}

// scrollama event handlers
function handleStepEnter(response) {
  console.log(response);

  // add color to current step only
  step.classed("is-active", function(d, i) {
    return i === response.index;
  });

  // update graphic based on step
  figure.select("p").text(response.index + 1);
}

function setupStickyfill() {
  d3.selectAll(".sticky").each(function() {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.33,
      debug: true,
      progress: true
    })
    .onStepEnter(handleStepEnter)
    .onStepProgress(handleStepProgress);

  // setup resize event
  window.addEventListener("resize", handleResize);
}

// kick things off
init();