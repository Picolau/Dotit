let dots_controller;
let bg_controller;

function setup() {
  createCanvas(windowWidth, windowHeight);

  dots_controller = new DotsController({rows: 5, cols: 8});
  bg_controller = new BackgroundController(100); 
}

function draw() {
  bg_controller.update_and_draw();
  dots_controller.update_and_draw();
}

function mousePressed() {
}