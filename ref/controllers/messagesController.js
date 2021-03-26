const DEFAULT_CONTINUE_MESSAGE = "Click/Tap anywhere near to continue"
const TIME_BETWEEN_MESSAGES_ANIMATION = 1500;

export default class {
    constructor() {
        this.messagesContainerElement = document.getElementById("messages-container");
    }

    #clear() {
        this.messagesContainerElement.innerHTML = "";
    }

    #display(display) {
        if (display)
            this.messagesContainerElement.style.display = "flex";
        else
            this.messagesContainerElement.style.display = "none";
    }

    #populate(messages) {
        for (let idx = 0;idx < messages.length;idx++) {
            let message = messages[idx];
            this.#addMessageElement(message);
        }
        this.#addMessageElement(DEFAULT_CONTINUE_MESSAGE, true);
    }

    #addMessageElement(message, isContinue=false) {
        if (!isContinue)
            this.messagesContainerElement.innerHTML += "<span class='message-item'>" + message + "</span>";
        else
            this.messagesContainerElement.innerHTML += "<span class='continue-item'>" + message + "</span>";
    }

    #animateAppear() {
        let messageElements = document.getElementsByClassName("message-item");
        let continueElement = document.getElementsByClassName("continue-item")[0];

        for (let idx = 0;idx < messageElements.length;idx++) {
            let messageElem = messageElements[idx];
            setTimeout(function() {
                messageElem.style.opacity = 1;
            }, idx*TIME_BETWEEN_MESSAGES_ANIMATION);
        }
        
        setTimeout(function () {
            continueElement.style.opacity = 1;
        }, (messageElements.length-1)*TIME_BETWEEN_MESSAGES_ANIMATION)
    }

    loadMessages(messagesCode, continueCallback) {
        let messages = messagesCode.split(';');

        this.#clear();
        this.#display(true);
        this.#populate(messages);
        this.#animateAppear();

        this.messagesContainerElement.onclick = () => {
            this.unloadMessages();
            continueCallback();
        };
    }

    unloadMessages() {
        this.#clear();
        this.#display(false);
    }
}