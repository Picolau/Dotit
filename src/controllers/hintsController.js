import { secureStorage } from '../index'

export default class {
    constructor() {
        let hints = secureStorage.getItem("hints");
        if (!hints)
            secureStorage.setItem("hints", 0);
    }

    hasAny() {
        let hints = parseInt(secureStorage.getItem("hints"));
        return hints > 0;
    }

    addOne() {
        let hints = parseInt(secureStorage.getItem("hints"));
        hints++;
        secureStorage.setItem("hints", hints)
    }

    useOne() {
        let hints = parseInt(secureStorage.getItem("hints"));
        hints--;
        secureStorage.setItem("hints", hints)
    }

    getTotal() {
        return parseInt(secureStorage.getItem("hints"));
    }
}