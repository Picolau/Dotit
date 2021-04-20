
//const DotsController = require('./dotsController').default;
//const MessagesController = require('./messagesController').default;

export default class {
    constructor() {
        let hints = localStorage.getItem("hints");
        if (!hints)
            localStorage.setItem("hints", 0);
    }

    hasAny() {
        let hints = parseInt(localStorage.getItem("hints"));
        return hints > 0;
    }

    addOne() {
        let hints = parseInt(localStorage.getItem("hints"));
        hints++;
        localStorage.setItem("hints", hints)
    }

    useOne() {
        let hints = parseInt(localStorage.getItem("hints"));
        hints--;
        localStorage.setItem("hints", hints)
    }

    getTotal() {
        return parseInt(localStorage.getItem("hints"));
    }
}