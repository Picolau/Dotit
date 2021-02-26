let backgroundController;
let dotsController;
//let gameFont;

function setup() {
    let levelNumber = 0;
    let levelSize = 3;
    let levelObj = 0;

    if (levelSize == 3)
        levelObj = levels3x3[levelNumber]

    backgroundController = new BackgroundController(200);
    dotsController = new DotsController(levelObj);
    dotsController.animateExpand();
}

function draw() {
    backgroundController.draw();
    dotsController.draw();
}

function preload() {
    //gameFont = loadFont('fonts/Dotnation.ttf');
}

function drawInfo() {
    let strNumber = this.number + "";
    while (strNumber.length < 3) strNumber = "0" + strNumber;

    fill(255);
    textAlign(CENTER, CENTER);
    //textFont(gameFont);
    textSize(45);
    text(strNumber, width/2, 50);
}
