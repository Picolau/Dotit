const LEVEL_MAX_ROWS = 5;
const LEVEL_MAX_COLS = 8;

class LevelController {
    constructor() {
        let levelItem = localStorage.getItem('level');
        this.level = levelItem ? parseInt(levelItem) : 0;

        this.dots_controller;
        this.messages_controller = new MessagesController();

        this.load_level(levels[this.level]);
        this.next_level_waiting = false;
    }

    update_and_draw() {
        this.dots_controller?.update_and_draw();
        this.messages_controller.update_and_draw();

        if (this.dots_controller?.connections_ended_success && !this.next_level_waiting) {
            setTimeout(this.next_level.bind(this), 2000);
            this.next_level_waiting = true;
        }
    }

    load_level(level) {
        let dots_code = level[0];
        let messages_code = level[1];
        if (level.length == 2) { // has message
            if (messages_code != this.messages_controller.messages_code) {
                this.load_messages(messages_code);
                setTimeout(this.load_dots.bind(this, dots_code), 
                this.messages_controller.messages.length * TIME_BETWEEN_MESSAGES);
            } else { // no timeout needed if its same message
                this.load_dots(dots_code);
            }
        } else { // if theres no messages_code we show the level number
            this.load_messages((this.level+1)+"");
            setTimeout(this.load_dots.bind(this, dots_code), 250);
        }

        localStorage.setItem('level', this.level);
    }

    load_dots(code) {
        if (!this.dots_controller)
            this.dots_controller = new DotsController()

        this.dots_controller.load(code);
        this.dots_controller.animate_start();
        this.next_level_waiting = false;
    }

    load_messages(message_code) {
        this.messages_controller.load(message_code);
        this.messages_controller.animate_start();
    }

    next_level() {
        if (this.level < levels.length - 1) {
            this.level++;
            this.load_level(levels[this.level]);
        }
    }

    prev_level() {
        if (this.level > 0) { 
            this.level--;
            this.load_level(levels[this.level]);
        } else if (this.level <= 0) {
            this.level = -1;
            this.load_dots();
            this.load_messages("");
        }
    }

    reload_dots() {
        this.dots_controller.reload();
    }

    print_level_created() {
        this.dots_controller.handleFinish();
    }

    handle_resize() {
        animations_controller.clear_animations();
        this.dots_controller.reposition_dots();
    }
}