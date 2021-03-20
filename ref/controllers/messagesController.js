const PADDING_MESSAGE_LINES = 30;
const TIME_BETWEEN_MESSAGES = 1500;

import {P5, my_scale, animations_controller} from '../index';
const ObjAnimator = require('../classes/objAnimator').default;

export default class {
    constructor() {
        this.messages = [];
    }

    static timeBetweenMessages() {
        return TIME_BETWEEN_MESSAGES;
    }

    load(messages_code) {
        this.messages_code = messages_code;
        this.messages.length = 0;

        let message_lines = messages_code.split(';');

        for (let line = 0;line < message_lines.length;line++) {
            let messageText = message_lines[line]; 
            let new_message_obj = new Message(line, messageText);
            this.messages.push(new_message_obj);
        }
    }

    update_and_draw() {
        for (let i = 0;i < this.messages.length;i++) {
            let message = this.messages[i];
            message.update_and_draw();
        }
    }

    animate_start() {
        for (let i = 0;i < this.messages.length;i++) {
            let message = this.messages[i];
            message.alpha = 0;
            setTimeout(function() {
                animations_controller.new_animation(new ObjAnimator(message, 'alpha', 255, 0.05))
            }, i*TIME_BETWEEN_MESSAGES);
        }
    }
}

class Message {
    constructor(line, messageText) {
        this.messageText = messageText;
        this.alpha = 255;
        this.line = line;
    }

    update_and_draw() {
        let x = P5.windowWidth / 2;
        let y = P5.windowHeight*0.04 + this.line*PADDING_MESSAGE_LINES;
        let defaultTextSize = 18*my_scale;

        P5.fill(255, this.alpha);
        P5.stroke(150, this.alpha);
        P5.textAlign(P5.CENTER, P5.BASELINE);
        P5.textSize(defaultTextSize);
        P5.text(this.messageText, x, y);
    }
}