// using d3 for convenience
var main = d3.select("main");


function ScrollElements(scrollyId) {
  this.scrolly = main.select("#" + scrollyId);
  this.figure = this.scrolly.select("figure");
  this.article = this.scrolly.select("article");
  this.step = this.article.selectAll(".step");
  this.stepText = this.scrolly.selectAll(".step-text");
}

var scrollElements = {
  'scenario1': new ScrollElements('scrolly'),
  'scenario2': new ScrollElements('scrolly2'),
}

// initialize the scrollama
var scrollers = {
  'scenario1': scrollama(),
  'scenario2': scrollama()
};

// generic window resize listener event
function handleResize() {
  // TODO: we may not need to resize every one here, in fact it's probably bad for performance - maybe we can figure out which one is active and resize that?
  Object.keys(scrollers).forEach(key => {
    // 1. update height of step elements
    var stepH = Math.floor(window.innerHeight * 0.75);
    scrollElements[key].step.style("height", stepH + "px");
    
    var figYScale = 1.4;
    var figureHeight = window.innerHeight / figYScale;
    var figureMarginTop = (window.innerHeight - figureHeight) / figYScale;
    
    scrollElements[key].figure
      .style("height", figureHeight + "px")
      .style("top", figureMarginTop + "px");

    // 3. tell scrollama to update new element dimensions
    scrollers[key].resize();
  });
}

/**
 * Handle behaviour as the user scrolls through a step.
 * This method adds top margin to the text so it is aligned with the chart.
 */
function handleStepProgress(response, scrollyId) {
    // Grab some elements, calculate some heights
    var stepH = Math.floor(window.innerHeight * 0.75);
    var currentStep = scrollElements[scrollyId].article.select('.is-active');
    var currentStepText = currentStep.select('.step-text');
    var currentStepTextHeight = currentStepText.node().getBoundingClientRect().height;

    // Get distance from top of figure to top of parent element
    var fp = scrollElements[scrollyId].figure._groups[0][0].offsetTop;

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
function handleStepEnter(response, scrollyId) {
  // Send messages to cancel every simulation other than the current one.
  Object.keys(scrollers).forEach(key => {
    if (key != scrollyId) {
      var iframe = document.getElementById(key);
      iframe.contentWindow.postMessage(key, '*');
    }
  });

  // Add color to current step only
  scrollElements[scrollyId].step.classed("is-active", function(d, i) {
    return i === response.index;
  });

  // Update graphic based on step
  scrollElements[scrollyId].figure.select("p").text(response.index + 1);
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

  scrollers['scenario1']
    .setup({
      step: "#scrolly article .step",
      offset: 0.33,
      debug: true,
      progress: true
    })
    .onStepEnter(response => handleStepEnter(response, 'scenario1'))
    .onStepProgress(response => handleStepProgress(response, 'scenario1'));

  scrollers['scenario2']
    .setup({
      step: "#scrolly2 article .step",
      offset: 0.33,
      debug: true,
      progress: true
    })
    .onStepEnter(response => handleStepEnter(response, 'scenario2'))
    .onStepProgress(response => handleStepProgress(response, 'scenario2'));

  // setup resize event
  window.addEventListener("resize", handleResize);
}

// kick things off
init();