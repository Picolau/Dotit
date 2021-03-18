
const DotsController = require('./dotsController').default;
const MessagesController = require('./messagesController').default;

const NUM_LEVELS_TUTORIAL = 15; 

import levels from '../levels'
import {animations_controller, menu_state, MENU_STATE} from '../index';

export default class {
    constructor() {
        this.dots_controller = new DotsController("000");
        this.messages_controller = new MessagesController();

        this.load_current_level(levels[this.level]);
        this.next_level_waiting = false;
        this.myTimeout;
    }

    #load_dots(code) {
        if (!this.dots_controller)
            this.dots_controller = new DotsController()

        this.dots_controller.load(code);
        this.dots_controller.animate_start();
        this.next_level_waiting = false;
    }

    #load_messages(message_code) {
        this.messages_controller.load(message_code);
        this.messages_controller.animate_start();
    }

    clear_level(on_end) {
        animations_controller.clear_animations();
        this.dots_controller.animate_shrink();
        this.#load_messages("");
        clearTimeout(this.myTimeout);
        this.myTimeout = setTimeout(on_end, 1000);
    }

    load_level(level) {
        if (!level)
            level = levels[this.level];
        
        let dots_code = level[0];
        let messages_code = level[1];
        if (level.length == 2) { // has message
            if (messages_code != this.messages_controller.messages_code) {
                this.#load_messages(messages_code);
                clearTimeout(this.myTimeout);
                this.myTimeout = setTimeout(this.#load_dots.bind(this, dots_code), 
                this.messages_controller.messages.length * MessagesController.timeBetweenMessages());
            } else { // no timeout needed if its same message
                this.#load_dots(dots_code);
            }
        } else { // if theres no messages_code we show the level number
            this.#load_messages((this.level+1)+"");
            clearTimeout(this.myTimeout);
            this.myTimeout = setTimeout(this.#load_dots.bind(this, dots_code), 250);
        }

        this.#updateLevelArrowsElements();
    }

    load_next_level() {
        if (this.level < levels.length - 1) {
            this.level++;
            this.load_level(levels[this.level]);
        }
    }

    load_prev_level() {
        if (this.level > 0) { 
            this.level--;
            this.load_level(levels[this.level]);
        }
    }

    load_current_level() {
        let levelItem = localStorage.getItem('level');
        this.level = levelItem ? parseInt(levelItem) : 0;
        this.load_level(levels[this.level]);
    }

    load_creation_level() {
        this.#load_dots();
        this.#load_messages("");
    }

    update_and_draw() {
        this.dots_controller?.update_and_draw();
        this.messages_controller.update_and_draw();

        if (this.dots_controller?.connections_ended_success && !this.next_level_waiting && menu_state === MENU_STATE.PLAYING) {
            localStorage.setItem('level', this.level+1);
            clearTimeout(this.myTimeout); // clear if there's any timeout
            this.myTimeout=setTimeout(this.load_next_level.bind(this), 2000);
            this.next_level_waiting = true;
        }
    }

    reload_dots() {
        this.dots_controller.reload();
    }

    handle_resize() {
        animations_controller.clear_animations(true);
        this.dots_controller.reposition_dots();
    }

    #updateLevelArrowsElements() {
        if (this.level > NUM_LEVELS_TUTORIAL) {
            document.getElementById("change-level-left-arrow").style.display = "block";
        } else {
            document.getElementById("change-level-left-arrow").style.display = "none";
        }

        let max_level = parseInt(localStorage.getItem('level'));

        if(this.level >= NUM_LEVELS_TUTORIAL && this.level < max_level) {
            document.getElementById("change-level-right-arrow").style.display = "block";
        } else {
            document.getElementById("change-level-right-arrow").style.display = "none";
        }
    }
}