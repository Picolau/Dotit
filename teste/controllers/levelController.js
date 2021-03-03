const LEVEL_MAX_ROWS = 5;
const LEVEL_MAX_COLS = 8;

class LevelController {
    constructor() {
        this.level = 0;
        this.dots_controller = new DotsController(levels[this.level][0]);
        this.dots_controller.animate_fade_out();
    }

    #update_and_draw_level_message() {
        let posMessage = {
            x: windowWidth / 2,
            y: windowHeight * 0.04
        }
        fill(255);
        textAlign(CENTER, BASELINE);
        textSize(16);
        text(levels[this.level][1], posMessage.x, posMessage.y);
    }

    update_and_draw() {
        this.dots_controller.update_and_draw();
        this.#update_and_draw_level_message();
    }

    next_level() {
        this.level++;
        
        if (this.level == levels.length) {
            this.level = -1;
        }

        this.dots_controller.load(levels[this.level][0]);

        animations_controller.clear_animations();
        this.dots_controller.animate_fade_out();
    }

    prev_level() {
        this.level--;
        
        if (this.level == -2) {
            this.level = levels.length - 1;
        }

        this.dots_controller.load(levels[this.level][0]);

        animations_controller.clear_animations();
        this.dots_controller.animate_fade_out();
    }

    reload_level() {
        this.dots_controller.reload();
    }

    print_level_created() {
        this.dots_controller.handleFinish();
    }
}

const levels = [
    ["013000102","Hi!\n\n Welcome to Joidô!\n\nRules here are simple: you simply have to draw the given pattern :)"],
    ["02210000111", "Great work!\n\nI see you got it, how about this other pattern?"],
    ["0231101000102", "Pretty easy right?\n\nTry this one."],
    ["0331020211101000102", "Amazing work! Keep going..."],
    ["032111020100001"],
    ["0321110201000011121"],
    ["03321111000010212222120"],
    ["023100102010011"],
    ["0331011212221201000"],
    ["1221000011110"],
    ["13312112111011110"],
    ["14512130212222324333231202122"],
    ["133200122100221001220"],
    ["3550010011110010011223344"], //"I hope that looks like a kite :D"
];