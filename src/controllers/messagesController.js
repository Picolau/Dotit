const PADDING_MESSAGE_LINES = 30;
const TIME_BETWEEN_MESSAGES = 1500;

class MessagesController {
    constructor() {
        this.messages = [];
    }

    load(message_code) {
        this.messages.length = 0;

        let message_lines = message_code.split(';');

        for (let line = 0;line < message_lines.length;line++) {
            let message_x = width / 2;
            let message_y = height*0.04 + line*PADDING_MESSAGE_LINES;
            let messageText = message_lines[line]; 
            let new_message_obj = new Message(messageText, message_x, message_y);
            this.messages.push(new_message_obj);
        }
    }

    update_and_draw() {
        for (let i = 0;i < this.messages.length;i++) {
            let message = this.messages[i];
            message.update_and_draw();
        }
    }

    animate_fade_out() {
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
    constructor(messageText, x, y) {
        this.messageText = messageText;
        this.alpha = 255;
        this.x = x;
        this.y = y;
    }

    update_and_draw() {
        fill(255, this.alpha);
        stroke(150, this.alpha);
        textAlign(CENTER, BASELINE);
        textSize(16);
        text(this.messageText, this.x, this.y);
    }
}