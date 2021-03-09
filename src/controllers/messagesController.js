const PADDING_MESSAGE_LINES = 30;
const TIME_BETWEEN_MESSAGES = 1500;

class MessagesController {
    constructor() {
        this.messages = [];
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
        let x = windowWidth / 2;
        let y = windowHeight*0.04 + this.line*PADDING_MESSAGE_LINES;
        let defaultTextSize = 18*my_scale;

        fill(255, this.alpha);
        stroke(150, this.alpha);
        textAlign(CENTER, BASELINE);
        textSize(defaultTextSize);
        text(this.messageText, x, y);
    }
}