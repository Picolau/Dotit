const LEVEL_MAX_ROWS = 5;
const LEVEL_MAX_COLS = 8;

class LevelController {
    constructor() {
        this.level = -1;
        this.dots_controller;
        this.messages_controller = new MessagesController();

        this.next_level();
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
        if (messages_code != "") { // when encounter "", simply let the same message
            this.load_messages(messages_code);
            setTimeout(this.load_dots.bind(this, dots_code), 
            this.messages_controller.messages.length * TIME_BETWEEN_MESSAGES);
        } else {
            this.load_dots(dots_code);
        }
    }

    load_dots(code) {
        if (!this.dots_controller)
            this.dots_controller = new DotsController()

        this.dots_controller.load(code);
        this.dots_controller.animate_fade_out();
        this.next_level_waiting = false;
    }

    load_messages(message_code) {
        this.messages_controller.load(message_code);
        this.messages_controller.animate_fade_out();
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
        }
    }

    reload_dots() {
        this.dots_controller.reload();
    }

    print_level_created() {
        this.dots_controller.handleFinish();
    }
}

const levels = [
    ["013000102","Hi!;Welcome to Joidô!;Rules here are simple: you simply have to draw the given pattern.;Give it a try :)"],
    ["02210000111", "Great work! I see you got it.; How about this other pattern?"],
    ["0231101000102", "Pretty easy right?;Try this one."],
    ["0331020211101000102", "Amazing work!;Keep going..."],
    ["032111020100001", ""],
    ["0321110201000011121", ""],
    ["03321111000010212222120", ""],
    ["023100102010011", ""],
    ["0331011212221201000", ""],
    ["1221000011110", "Wow, congratulations! I'm very impressed!; OK, so here's a catch: you can reconnect dots by clicking on them in case you have some extra clicks available!; The number of extra clicks can be seen down there ↓;Go ahead and give it a shot :D"],
    ["13312112111011110", "OK! I can feel you got the spirit of it!; Can you do this one?!"],
    ["14512130212222324333231202122", "That's amazing!;I mean... You are amazing!; So let's see if we can do some drawing!; What do you think about my boat?"],
    ["133200122100221001220", "Yes, i'm so happy!; Let's draw a star to celebrate!"],
    ["3550010011110010011223344", "And now, i hope that this looks like a kite!; Can you do it with the 3 extra clicks?"], //"I hope that looks like a kite :D"
];