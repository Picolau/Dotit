import { i18n } from '../translate/i18n'

const TIME_BETWEEN_MESSAGES_ANIMATION = 1500;

export default class {
    constructor() {
        this.messagesContainerElement = document.getElementById("messages-container");
    }

    clear() {
        this.messagesContainerElement.innerHTML = "";
        this.messagesContainerElement.style.display = "none";
        this.onRead(null);
    }

    set(idx, message, final) {
        let messageElement = !final ? 
            document.getElementsByClassName('message-item')[idx]
        :
            document.getElementsByClassName('continue-item')[0];
        messageElement.innerText = message;
    }

    prepare(messages, finalMessage) {
        this.count = 0;
        this.max = messages.length;
        this.messagesContainerElement.style.display = "flex";
        this.messagesContainerElement.innerHTML = "";
        for (let i = 0; i < messages.length; i++) {
            let messageElement = document.createElement('span');
            messageElement.className = 'message-item';
            messageElement.innerText = messages[i];
            this.messagesContainerElement.appendChild(messageElement);
        }

        let messageElement = document.createElement('span');
        messageElement.className = 'continue-item';
        messageElement.innerText = finalMessage;
        this.messagesContainerElement.appendChild(messageElement);
    }

    showNext() {
        return new Promise((resolve, reject) => {
            let messageElement = this.count < this.max ? 
                document.getElementsByClassName('message-item')[this.count]
            :
                document.getElementsByClassName('continue-item')[0];
            if (messageElement) {
                setTimeout(() => {
                    messageElement.style.opacity = 1;
                    messageElement.style.transform = 'translate(0%, 0%)';
                }, 50)
                this.count += 1;
                setTimeout(resolve, TIME_BETWEEN_MESSAGES_ANIMATION);
            }
        })
    }

    onRead(callback) {
        this.messagesContainerElement.onclick = () => {
            if (callback) {
                this.clear();
                callback();
            }
        };
    }
}